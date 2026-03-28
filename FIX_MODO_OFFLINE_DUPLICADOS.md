# 🔧 FIX: Problemas en Modo Offline

## 🐛 PROBLEMAS REPORTADOS

### 1. Pantalla en blanco al cargar horas offline
**Síntoma:** Al cargar horas en modo offline, la pantalla se queda en blanco/bloqueada.

### 2. Registros duplicados después de sincronizar
**Síntoma:** Cuando sincroniza, aparecen las horas dos veces en el historial.

---

## 🔍 CAUSAS RAÍZ

### Problema 1: Pantalla en Blanco

**Código problemático:**
```javascript
// useTimeEntries.js - ANTES
const createEntry = async (entryData) => {
  setLoading(true); // ❌ Bloquea UI incluso en offline
  
  if (navigator.onLine) {
    // ...
  } else {
    // Offline: guardar localmente
    await timeEntryRepository.save(prepared);
    
    // Sincronizar con setTimeout
    setTimeout(() => {
      syncManager.sync(); // ❌ Espera 1 segundo bloqueando
    }, 1000);
  }
  
  setLoading(false);
};
```

**Causa:**
- `setLoading(true)` bloquea la UI
- En offline, las operaciones son rápidas (IndexedDB) pero el loading permanece
- El `setTimeout` de 1 segundo hace que la UI esté bloqueada innecesariamente

---

### Problema 2: Duplicados

**Flujo problemático:**
```
1. Usuario carga horas offline
   → Se crea entry con ID temporal (ej: "temp-123")
   → Se agrega al estado: [{ id: "temp-123", ... }]

2. Sincronización automática
   → Backend crea entry con ID del servidor (ej: "uuid-456")
   → Se guarda en IndexedDB con nuevo ID
   → Entry temporal NO se elimina del estado

3. Usuario recarga o evento sync_complete
   → loadTimeEntries() trae TODOS los registros
   → Backend retorna: [{ id: "uuid-456", client_id: "temp-123", ... }]
   → Estado tiene: [{ id: "temp-123", ... }]
   → Resultado: ❌ DOS ENTRIES (uno temporal, uno del servidor)
```

**Causas:**
1. Hook NO escuchaba eventos de sincronización
2. No había lógica para eliminar duplicados basados en `client_id`
3. Entry temporal permanecía en el estado después de sincronizar

---

## ✅ SOLUCIONES IMPLEMENTADAS

### Fix 1: No Bloquear UI en Offline

```javascript
// useTimeEntries.js - DESPUÉS
const createEntry = async (entryData) => {
  // Solo mostrar loading si estamos online (más lento)
  if (navigator.onLine) {
    setLoading(true);
  }
  
  if (navigator.onLine) {
    // Online: crear en backend
    // ...
  } else {
    // Offline: guardar localmente (SIN loading)
    const prepared = timeEntryRepository.prepareForLocal(entryData, userId);
    await timeEntryRepository.save(prepared);
    await syncQueue.add('time_entries', prepared.id, 'create', prepared);
    
    // Agregar a la UI inmediatamente
    setTimeEntries(prev => [prepared, ...prev]);
    
    // Sincronizar en background (sin esperar, sin setTimeout)
    syncManager.sync().catch(err => {
      console.error('Error en sincronización automática:', err);
    });
    
    return { success: true, data: prepared };
  }
  
  // Solo quitar loading si lo pusimos
  if (navigator.onLine) {
    setLoading(false);
  }
};
```

**Mejoras:**
- ✅ No bloquea UI en offline (operaciones rápidas)
- ✅ Sincroniza en background sin esperar
- ✅ Usuario puede seguir trabajando inmediatamente

---

### Fix 2: Escuchar Eventos de Sincronización

```javascript
// useTimeEntries.js - NUEVO
useEffect(() => {
  const handleSyncComplete = (event) => {
    if (event.type === 'sync_complete' && event.data.synced > 0) {
      // Recargar datos después de sincronizar
      loadTimeEntries();
    }
  };

  syncManager.addListener(handleSyncComplete);

  return () => {
    syncManager.removeListener(handleSyncComplete);
  };
}, [userId]);
```

**Mejoras:**
- ✅ Hook escucha cuando termina la sincronización
- ✅ Recarga automáticamente los datos actualizados
- ✅ Limpia el listener al desmontar

---

### Fix 3: Eliminar Duplicados por client_id

```javascript
// useTimeEntries.js - loadTimeEntries()
const { timeEntries: data } = await timeEntriesService.getAll();

// Eliminar duplicados basados en client_id
const uniqueEntries = [];
const seenClientIds = new Set();
const seenServerIds = new Set();

for (const entry of data) {
  // Si tiene client_id, verificar que no esté duplicado
  if (entry.client_id) {
    if (seenClientIds.has(entry.client_id)) {
      continue; // Saltar duplicado
    }
    seenClientIds.add(entry.client_id);
  }
  
  // Verificar ID del servidor
  if (seenServerIds.has(entry.id)) {
    continue; // Saltar duplicado
  }
  seenServerIds.add(entry.id);
  
  uniqueEntries.push(entry);
}

setTimeEntries(uniqueEntries);
```

**Lógica:**
1. Mantener un Set de `client_id` vistos
2. Mantener un Set de IDs del servidor vistos
3. Si un entry tiene `client_id` ya visto → Saltar (es duplicado)
4. Si un entry tiene ID del servidor ya visto → Saltar (es duplicado)
5. Solo agregar entries únicos

**Ejemplo:**
```javascript
// Backend retorna:
[
  { id: "uuid-456", client_id: "temp-123", ... }, // Del servidor
  { id: "temp-123", client_id: "temp-123", ... }  // Temporal (si quedó)
]

// Después del filtro:
[
  { id: "uuid-456", client_id: "temp-123", ... } // ✅ Solo uno
]
```

---

## 🎯 FLUJO COMPLETO CORREGIDO

### Escenario: Usuario carga horas offline

```
1. Usuario carga horas (offline)
   ├─ createEntry() detecta offline
   ├─ Crea entry con ID temporal: "temp-123"
   ├─ Guarda en IndexedDB
   ├─ Agrega a cola de sincronización
   ├─ Actualiza UI inmediatamente (sin loading)
   └─ Dispara syncManager.sync() en background

2. syncManager.sync() se ejecuta
   ├─ Detecta conexión
   ├─ Procesa cola de sincronización
   ├─ Envía entry al backend
   ├─ Backend retorna: { id: "uuid-456", client_id: "temp-123" }
   ├─ Mapea ID temporal → ID servidor
   ├─ Elimina entry temporal de IndexedDB
   ├─ Guarda entry con ID del servidor
   └─ Emite evento: sync_complete

3. Hook escucha sync_complete
   ├─ Llama a loadTimeEntries()
   ├─ Carga desde backend
   ├─ Filtra duplicados por client_id
   ├─ Actualiza estado con entries únicos
   └─ UI muestra datos correctos ✅
```

---

## 📊 COMPARACIÓN

### ANTES ❌

```
Usuario carga horas offline:
1. UI se bloquea (loading)
2. Espera 1 segundo (setTimeout)
3. Sincroniza
4. NO recarga datos
5. Aparecen duplicados

Resultado:
- Pantalla en blanco 1-2 segundos
- Registros duplicados
- Mala UX
```

### DESPUÉS ✅

```
Usuario carga horas offline:
1. UI responde inmediatamente
2. Sincroniza en background
3. Escucha evento sync_complete
4. Recarga datos automáticamente
5. Filtra duplicados

Resultado:
- UI fluida y rápida
- Sin duplicados
- Excelente UX
```

---

## 🧪 TESTING

### Test 1: Cargar horas offline
```
1. Desconectar internet
2. Cargar horas
3. Verificar:
   ✅ UI no se bloquea
   ✅ Horas aparecen inmediatamente
   ✅ No hay pantalla en blanco
```

### Test 2: Sincronización automática
```
1. Cargar horas offline
2. Reconectar internet
3. Esperar sincronización
4. Verificar:
   ✅ Datos se recargan automáticamente
   ✅ No hay duplicados
   ✅ IDs temporales reemplazados por IDs del servidor
```

### Test 3: Múltiples cargas offline
```
1. Desconectar internet
2. Cargar 5 registros
3. Reconectar internet
4. Esperar sincronización
5. Verificar:
   ✅ Los 5 registros se sincronizan
   ✅ No hay duplicados (5 entries, no 10)
   ✅ Todos tienen ID del servidor
```

---

## 🔧 ARCHIVOS MODIFICADOS

### `frontend/src/hooks/useTimeEntries.js`

**Cambios:**
1. Agregar listener de eventos de sincronización
2. No bloquear UI en modo offline
3. Sincronizar en background sin setTimeout
4. Filtrar duplicados por client_id al cargar

---

## 💡 MEJORAS ADICIONALES POSIBLES

### 1. Indicador de Sincronización
```javascript
const [syncing, setSyncing] = useState(false);

useEffect(() => {
  const handleSync = (event) => {
    if (event.type === 'sync_start') {
      setSyncing(true);
    } else if (event.type === 'sync_complete') {
      setSyncing(false);
      loadTimeEntries();
    }
  };
  
  syncManager.addListener(handleSync);
  return () => syncManager.removeListener(handleSync);
}, []);
```

### 2. Toast de Confirmación
```javascript
if (event.type === 'sync_complete' && event.data.synced > 0) {
  showToast(`✅ ${event.data.synced} registros sincronizados`);
  loadTimeEntries();
}
```

### 3. Manejo de Errores de Sincronización
```javascript
if (event.type === 'sync_error') {
  showToast(`⚠️ Error al sincronizar: ${event.error}`, 'error');
}
```

---

## 📝 RESUMEN

### Problemas Resueltos
- ✅ Pantalla en blanco al cargar offline
- ✅ Registros duplicados después de sincronizar
- ✅ UI bloqueada innecesariamente
- ✅ Sincronización no reflejada en UI

### Mejoras Implementadas
- ✅ UI fluida en modo offline
- ✅ Sincronización en background
- ✅ Recarga automática después de sincronizar
- ✅ Filtrado de duplicados por client_id
- ✅ Mejor experiencia de usuario

---

**Fecha:** 28 de marzo de 2026  
**Prioridad:** ALTA  
**Estado:** ✅ Resuelto
