# 🐛 Solución: Duplicación de Datos al Sincronizar

## ❌ Problema

Cuando creas un registro OFFLINE y luego sincronizas, se duplica en IndexedDB.

---

## 🔍 Causa Raíz

### Flujo INCORRECTO (antes):

```
1. OFFLINE: Usuario crea time entry
   → Se genera id local: "abc-123"
   → Se guarda en IndexedDB
   → Se agrega a sync_queue

2. ONLINE: Sincroniza
   → API crea entry en servidor
   → Servidor genera NUEVO id: "xyz-789"
   → Strategy hace: markAsSynced("abc-123", serverData)
   → Actualiza registro "abc-123" con datos del servidor
   
3. Resultado:
   IndexedDB tiene:
   ├─ "abc-123" (con datos del servidor) ✅
   └─ "xyz-789" (si se recarga desde servidor) ❌ DUPLICADO
```

### El Problema:

```javascript
// ❌ ANTES - INCORRECTO
async create(data) {
  const { timeEntry } = await this.api.post('/time-entries', data);
  
  // Esto ACTUALIZA el registro local
  // pero el servidor devolvió un ID DIFERENTE
  await this.repository.markAsSynced(data.id, timeEntry);
  //                                 ↑         ↑
  //                           "abc-123"  "xyz-789"
  
  // Resultado: registro "abc-123" tiene datos de "xyz-789"
  // Si luego recargas desde servidor, tendrás AMBOS
}
```

---

## ✅ Solución Implementada

### Flujo CORRECTO (ahora):

```
1. OFFLINE: Usuario crea time entry
   → Se genera id local: "abc-123"
   → Se guarda en IndexedDB
   → Se agrega a sync_queue

2. ONLINE: Sincroniza
   → API crea entry en servidor
   → Servidor genera NUEVO id: "xyz-789"
   → Strategy hace:
      1. DELETE registro local "abc-123"
      2. SAVE nuevo registro con id "xyz-789"
   
3. Resultado:
   IndexedDB tiene:
   └─ "xyz-789" (único registro) ✅
```

### Código Corregido:

```javascript
// ✅ AHORA - CORRECTO
async create(data) {
  const { timeEntry } = await this.api.post('/time-entries', data);
  
  // 1. Eliminar registro local con id temporal
  await this.repository.delete(data.id);  // Elimina "abc-123"
  
  // 2. Guardar con el id del servidor
  await this.repository.save({
    ...timeEntry,                          // Tiene id "xyz-789"
    pending_sync: false,
    synced_at: new Date().toISOString()
  });
  
  return timeEntry;
}
```

---

## 🔍 Cómo Verificar

### 1. Buscar duplicados existentes:

```javascript
// En consola del navegador (F12)
await window.findDuplicates();
```

**Esto te muestra:**
- Grupos de registros duplicados
- IDs de cada duplicado
- Estado de sincronización

### 2. Limpiar duplicados manualmente:

```javascript
// Ver todos los registros
await window.dbDebug.debug();

// Limpiar base de datos completa (¡CUIDADO!)
await window.dbDebug.clear();
```

---

## 📊 Comparación Visual

### ❌ ANTES (Duplicación)

```
IndexedDB:
┌─────────────────────────────────────────┐
│ id: "abc-123"                           │
│ description: "Trabajo en campo"         │
│ pending_sync: false                     │
│ synced_at: "2024-03-04T10:00:00Z"      │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ id: "xyz-789"  ← DUPLICADO              │
│ description: "Trabajo en campo"         │
│ pending_sync: false                     │
│ synced_at: "2024-03-04T10:00:00Z"      │
└─────────────────────────────────────────┘
```

### ✅ AHORA (Sin Duplicación)

```
IndexedDB:
┌─────────────────────────────────────────┐
│ id: "xyz-789"  ← ÚNICO                  │
│ description: "Trabajo en campo"         │
│ pending_sync: false                     │
│ synced_at: "2024-03-04T10:00:00Z"      │
└─────────────────────────────────────────┘
```

---

## 🎯 Archivos Modificados

### 1. `TimeEntrySyncStrategy.js` ✅
```javascript
async create(data) {
  const { timeEntry } = await this.api.post('/time-entries', data);
  
  await this.repository.delete(data.id);  // ← NUEVO
  await this.repository.save({
    ...timeEntry,
    pending_sync: false,
    synced_at: new Date().toISOString()
  });
  
  return timeEntry;
}
```

### 2. `OrgUnitSyncStrategy.js` ✅
```javascript
async create(data) {
  const { organizationalUnit } = await this.api.post('/organizational-units', data);
  
  await this.repository.delete(data.id);  // ← NUEVO
  await this.repository.save({
    ...organizationalUnit,
    pending_sync: false,
    synced_at: new Date().toISOString()
  });
  
  return organizationalUnit;
}
```

### 3. `debugDuplicates.js` ✅ (NUEVO)
Utilidad para encontrar duplicados:
```javascript
await window.findDuplicates();
```

---

## 🧪 Cómo Probar

### 1. Limpiar datos existentes:
```javascript
await window.dbDebug.clear();
```

### 2. Crear registro OFFLINE:
- Desconecta internet
- Crea un time entry
- Verifica que se guardó local

### 3. Sincronizar ONLINE:
- Conecta internet
- Espera sincronización automática (30 seg) o fuerza:
  ```javascript
  const { manualSync } = useOffline();
  await manualSync();
  ```

### 4. Verificar NO hay duplicados:
```javascript
await window.findDuplicates();
// Debería mostrar: "✅ No se encontraron duplicados"
```

---

## 🔄 Flujo Completo Corregido

```
┌─────────────────────────────────────────────────────┐
│ 1. USUARIO CREA OFFLINE                             │
│    ├─ Hook: createEntry()                           │
│    ├─ Repository: save({ id: "local-123", ... })    │
│    └─ SyncQueue: add('time_entries', 'create', ...) │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ 2. VUELVE ONLINE                                    │
│    ├─ SyncManager detecta conexión                  │
│    └─ SyncManager.sync() se ejecuta                 │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ 3. SINCRONIZACIÓN                                   │
│    ├─ Strategy.create(data)                         │
│    │   ├─ API.post('/time-entries', data)           │
│    │   │   → Servidor responde: { id: "server-789" }│
│    │   ├─ Repository.delete("local-123") ← NUEVO    │
│    │   └─ Repository.save({ id: "server-789" })     │
│    └─ SyncQueue.remove(item.id)                     │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ 4. RESULTADO                                        │
│    IndexedDB:                                       │
│    └─ { id: "server-789", pending_sync: false }    │
│                                                     │
│    ✅ SIN DUPLICADOS                                │
└─────────────────────────────────────────────────────┘
```

---

## 📝 Resumen

### Problema:
- ❌ Se duplicaban registros al sincronizar
- ❌ ID local != ID servidor
- ❌ `markAsSynced()` actualizaba en lugar de reemplazar

### Solución:
- ✅ DELETE registro local
- ✅ SAVE con ID del servidor
- ✅ Sin duplicados

### Verificar:
```javascript
await window.findDuplicates();
```

---

**Recarga el navegador (F5) y prueba crear algo offline** 🎉
