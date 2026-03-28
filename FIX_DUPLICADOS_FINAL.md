# 🔧 FIX FINAL: Duplicados al Sincronizar

## 🐛 PROBLEMA

Después de guardar horas en modo offline y sincronizar, los registros aparecen **DUPLICADOS**.

---

## 🔍 CAUSA RAÍZ

### Flujo Problemático

```
1. Usuario guarda offline
   → Entry con ID temporal (temp-123) en IndexedDB
   → Entry en cola de sincronización

2. Sincronización automática
   → Envía a backend
   → Backend retorna entry con ID servidor (uuid-456)
   → TimeEntrySyncStrategy:
     a) Elimina entry temporal (temp-123) ✅
     b) Guarda entry con ID servidor (uuid-456) en IndexedDB ❌ PROBLEMA

3. Hook escucha sync_complete
   → Llama loadTimeEntries()
   → Carga TODOS los entries desde backend
   → Backend retorna entry (uuid-456)
   → Guarda TODOS en IndexedDB
   → Ahora hay DOS entries con uuid-456:
     - Uno del paso 2b
     - Uno del paso 3

4. Resultado: DUPLICADO
```

---

## ✅ SOLUCIÓN

### Cambio 1: NO guardar en IndexedDB después de sincronizar

**Archivo:** `TimeEntrySyncStrategy.js`

```javascript
// ANTES ❌
async create(data) {
  const tempId = data.id;
  const { timeEntry } = await this.api.post('/time-entries', {...});
  const serverId = timeEntry.id;
  
  if (tempId !== serverId) {
    await this.repository.delete(tempId); // Elimina temporal
  }
  
  // Guarda con ID del servidor
  await this.repository.save({
    ...timeEntry,
    pending_sync: false
  }); // ❌ Causa duplicado cuando hook recarga
  
  return timeEntry;
}

// DESPUÉS ✅
async create(data) {
  const tempId = data.id;
  const { timeEntry } = await this.api.post('/time-entries', {...});
  const serverId = timeEntry.id;
  
  if (tempId !== serverId) {
    await this.repository.delete(tempId); // Elimina temporal
  }
  
  // NO guardar en IndexedDB
  // El hook recargará desde backend
  
  return timeEntry;
}
```

---

### Cambio 2: Limpiar entries sincronizados antes de recargar

**Archivo:** `TimeEntryRepository.js`

```javascript
// NUEVO MÉTODO
async clearSynced() {
  const all = await this.findAll();
  const syncedIds = all
    .filter(entry => entry.pending_sync === false)
    .map(entry => entry.id);
  
  for (const id of syncedIds) {
    await this.delete(id);
  }
  
  console.log(`🗑️ Limpiados ${syncedIds.length} entries sincronizados`);
}
```

---

### Cambio 3: Usar clearSynced antes de guardar desde backend

**Archivo:** `useTimeEntries.js`

```javascript
// ANTES ❌
const loadTimeEntries = async () => {
  if (navigator.onLine) {
    const { timeEntries: data } = await timeEntriesService.getAll();
    setTimeEntries(uniqueEntries);
    
    // Guardar en cache local
    for (const entry of data) {
      await timeEntryRepository.save({...entry}); // ❌ Puede duplicar
    }
  }
};

// DESPUÉS ✅
const loadTimeEntries = async () => {
  if (navigator.onLine) {
    const { timeEntries: data } = await timeEntriesService.getAll();
    setTimeEntries(uniqueEntries);
    
    // Limpiar entries sincronizados primero
    await timeEntryRepository.clearSynced(); // ✅ Evita duplicados
    
    // Guardar en cache local
    for (const entry of data) {
      await timeEntryRepository.save({...entry});
    }
  }
};
```

---

## 🎯 FLUJO CORREGIDO

```
1. Usuario guarda offline
   → Entry con ID temporal (temp-123) en IndexedDB
   → pending_sync: true
   → Entry en cola de sincronización

2. Sincronización automática
   → Envía a backend
   → Backend retorna entry con ID servidor (uuid-456)
   → TimeEntrySyncStrategy:
     a) Elimina entry temporal (temp-123) ✅
     b) NO guarda en IndexedDB ✅
   → Retorna entry

3. Hook escucha sync_complete
   → Llama loadTimeEntries()
   → Limpia entries sincronizados de IndexedDB ✅
   → Carga TODOS los entries desde backend
   → Backend retorna entry (uuid-456)
   → Guarda en IndexedDB
   → Solo hay UNO con uuid-456 ✅

4. Resultado: SIN DUPLICADOS ✅
```

---

## 📊 COMPARACIÓN

### ANTES ❌

**IndexedDB después de sincronizar:**
```
[
  { id: "uuid-456", pending_sync: false }, // Del sync strategy
  { id: "uuid-456", pending_sync: false }  // Del hook reload
]
→ DUPLICADO
```

**UI:**
```
Registro 1: Empaque - 4h
Registro 2: Empaque - 4h  ← Duplicado
```

---

### DESPUÉS ✅

**IndexedDB después de sincronizar:**
```
[
  { id: "uuid-456", pending_sync: false }  // Solo del hook reload
]
→ ÚNICO
```

**UI:**
```
Registro 1: Empaque - 4h  ← Solo uno
```

---

## 🧪 TESTING

### Test 1: Guardar offline y sincronizar

```
1. Desconectar internet
2. Cargar horas (ej: Empaque 4h)
3. Verificar en UI: Aparece 1 registro ✅
4. Reconectar internet
5. Esperar sincronización (5-10 segundos)
6. Verificar en UI: Sigue siendo 1 registro ✅
7. Recargar página
8. Verificar en UI: Sigue siendo 1 registro ✅
```

**Resultado esperado:**
- ✅ Solo 1 registro en todo momento
- ✅ Sin duplicados

---

### Test 2: Múltiples registros offline

```
1. Desconectar internet
2. Cargar 5 registros diferentes
3. Verificar en UI: 5 registros ✅
4. Reconectar internet
5. Esperar sincronización
6. Verificar en UI: 5 registros (no 10) ✅
7. Recargar página
8. Verificar en UI: 5 registros ✅
```

**Resultado esperado:**
- ✅ Exactamente 5 registros
- ✅ Sin duplicados

---

### Test 3: Verificar IndexedDB

**Abrir DevTools → Application → IndexedDB → time_entries**

**Antes de sincronizar:**
```
[
  { id: "temp-123", pending_sync: true }
]
```

**Después de sincronizar:**
```
[
  { id: "uuid-456", pending_sync: false }
]
```

**NO debe haber:**
- ❌ Múltiples entries con mismo ID
- ❌ Entry temporal después de sincronizar

---

## 🔍 DEBUGGING

### Ver logs en consola

```javascript
// Durante sincronización verás:
🔗 ID temporal temp-123 mapeado a uuid-456
🗑️ Limpiados 1 entries sincronizados de IndexedDB
✅ Sincronización completada: { synced: 1 }
```

### Verificar en DevTools

**Application → IndexedDB → time_entries:**
- Verificar que no hay duplicados
- Verificar que IDs temporales se eliminan
- Verificar que pending_sync es false después de sincronizar

---

## 📝 RESUMEN

### Problema
- ❌ Registros duplicados después de sincronizar
- ❌ Entry guardado dos veces en IndexedDB

### Causa
1. Sync strategy guardaba entry en IndexedDB
2. Hook recargaba y guardaba el mismo entry
3. Resultado: 2 entries con mismo ID

### Solución
1. ✅ Sync strategy NO guarda en IndexedDB
2. ✅ Hook limpia entries sincronizados antes de recargar
3. ✅ Solo una fuente de verdad: backend

### Resultado
- ✅ Sin duplicados
- ✅ Sincronización limpia
- ✅ IndexedDB consistente

---

## ✅ CHECKLIST

- [x] TimeEntrySyncStrategy no guarda en IndexedDB
- [x] TimeEntryRepository.clearSynced() implementado
- [x] Hook usa clearSynced() antes de recargar
- [x] Filtrado de duplicados por client_id
- [x] Testing manual completado

---

**Fecha:** 28 de marzo de 2026  
**Prioridad:** CRÍTICA  
**Estado:** ✅ RESUELTO
