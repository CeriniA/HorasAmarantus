# 📱 MODO OFFLINE - Explicación Completa

## 🎯 Resumen Ejecutivo

El modo offline permite que la aplicación funcione **sin conexión a internet**, guardando los datos localmente y sincronizándolos automáticamente cuando vuelve la conexión.

---

## 1. 🗄️ Almacenamiento Local

### IndexedDB - Base de Datos del Navegador

```javascript
// Se crea automáticamente en tu navegador
SistemaHorasDB
├── users                    // Tu perfil
├── organizational_units     // Unidades organizacionales
├── time_entries            // Registros de horas
└── sync_queue              // Cola de sincronización
```

**Ubicación física**:
- Chrome: `C:\Users\[Usuario]\AppData\Local\Google\Chrome\User Data\Default\IndexedDB`
- Firefox: `C:\Users\[Usuario]\AppData\Roaming\Mozilla\Firefox\Profiles\[perfil]\storage\default`

**Capacidad**: ~50% del espacio en disco disponible (varios GB)

---

## 2. 🔄 Flujos de Trabajo

### 📡 ONLINE (Con Internet)

```
┌─────────────┐
│   Usuario   │
│ crea hora   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Frontend valida datos                   │
│ - Descripción < 500 caracteres          │
│ - Horas entre 0 y 24                    │
│ - Fechas válidas                        │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ POST /api/time-entries                  │
│ {                                       │
│   description: "Riego",                 │
│   start_time: "2026-03-04T08:00:00Z",  │
│   end_time: "2026-03-04T12:00:00Z"     │
│ }                                       │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Backend valida y guarda en Supabase     │
│ - Genera ID: uuid                       │
│ - Calcula total_hours: 4.0              │
│ - Agrega timestamps                     │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Response 201 Created                    │
│ {                                       │
│   id: "550e8400-...",                   │
│   description: "Riego",                 │
│   total_hours: 4.0,                     │
│   ...                                   │
│ }                                       │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Frontend guarda en IndexedDB (cache)    │
│ {                                       │
│   ...data,                              │
│   pending_sync: false,  ✅              │
│   synced_at: "2026-03-04T11:14:00Z"    │
│ }                                       │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ UI actualizada - Registro visible ✅    │
└─────────────────────────────────────────┘
```

---

### 📴 OFFLINE (Sin Internet)

```
┌─────────────┐
│   Usuario   │
│ crea hora   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Frontend detecta: navigator.onLine      │
│ → false ❌                              │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Frontend valida datos (igual que online)│
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Genera datos completos localmente       │
│ {                                       │
│   id: generateUUID(),      // Temporal  │
│   client_id: generateUUID(),            │
│   user_id: "tu-id",                     │
│   description: "Riego",                 │
│   start_time: "2026-03-04T08:00:00Z",  │
│   end_time: "2026-03-04T12:00:00Z",    │
│   total_hours: 4.0,                     │
│   status: "completed",                  │
│   pending_sync: true,  ⚠️               │
│   synced_at: null,                      │
│   created_at: "2026-03-04T11:14:00Z",  │
│   updated_at: "2026-03-04T11:14:00Z"   │
│ }                                       │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Guarda en IndexedDB                     │
│ await db.time_entries.put(localEntry)   │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Agrega a cola de sincronización         │
│ await db.sync_queue.add({               │
│   id: 1,                                │
│   entity_type: 'time_entries',          │
│   entity_id: localEntry.id,             │
│   action: 'create',                     │
│   data: localEntry,                     │
│   timestamp: "2026-03-04T11:14:00Z",   │
│   retry_count: 0,                       │
│   error: null                           │
│ })                                      │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ UI actualizada - Registro visible       │
│ con badge "Pendiente de sincronizar" ⚠️ │
└─────────────────────────────────────────┘
```

---

## 3. 🔄 Sincronización Automática

### Cuándo se Sincroniza

La sincronización ocurre **automáticamente** en estos momentos:

```javascript
// 1. Al volver online
window.addEventListener('online', () => {
  console.log('✅ Conexión restaurada');
  syncService.sync(); // Sincroniza inmediatamente
});

// 2. Cada 30 segundos (si hay conexión)
syncService.startAutoSync(30000);

// 3. Al iniciar la app (si hay conexión)
useEffect(() => {
  syncService.sync();
}, []);

// 4. Manualmente (botón "Sincronizar")
<button onClick={() => syncService.sync()}>
  Sincronizar ahora
</button>
```

---

### Proceso de Sincronización

```
┌─────────────────────────────────────────┐
│ 1. Detectar conexión                    │
│    navigator.onLine → true ✅           │
│    + ping a /api/health                 │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ 2. Obtener cola de sincronización       │
│    const queue = await getSyncQueue()   │
│    → [3 items pendientes]               │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ 3. Procesar cada item                   │
│                                         │
│ Item 1: CREATE time_entry               │
│ ├─ POST /api/time-entries               │
│ ├─ Response: { id: "server-uuid" }     │
│ ├─ Actualizar IndexedDB con server ID  │
│ └─ Eliminar de sync_queue ✅            │
│                                         │
│ Item 2: UPDATE time_entry               │
│ ├─ PUT /api/time-entries/:id            │
│ ├─ Response: { ...updated }             │
│ ├─ Actualizar IndexedDB                 │
│ └─ Eliminar de sync_queue ✅            │
│                                         │
│ Item 3: DELETE time_entry               │
│ ├─ DELETE /api/time-entries/:id         │
│ ├─ Response: 204 No Content             │
│ ├─ Eliminar de IndexedDB                │
│ └─ Eliminar de sync_queue ✅            │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ 4. Actualizar metadata                  │
│    last_sync: "2026-03-04T11:20:00Z"   │
│    synced: 3, failed: 0                 │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ 5. Notificar a UI                       │
│    "✅ 3 registros sincronizados"       │
└─────────────────────────────────────────┘
```

---

## 4. 🛡️ Manejo de Errores

### Reintentos Automáticos

```javascript
// Si falla la sincronización de un item
try {
  await api.post('/time-entries', data);
} catch (error) {
  // Incrementar contador de reintentos
  const retryCount = item.retry_count + 1;
  
  if (retryCount > 5) {
    // Después de 5 intentos, marcar como error permanente
    await updateSyncQueueItem(item.id, {
      retry_count: retryCount,
      error: error.message,
      permanent_error: true  // ⚠️ Requiere intervención manual
    });
  } else {
    // Intentar de nuevo en la próxima sincronización
    await updateSyncQueueItem(item.id, {
      retry_count: retryCount,
      error: error.message
    });
  }
}
```

### Estrategia de Reintentos

| Intento | Espera | Acción |
|---------|--------|--------|
| 1 | 30s | Retry automático |
| 2 | 30s | Retry automático |
| 3 | 30s | Retry automático |
| 4 | 30s | Retry automático |
| 5 | 30s | Retry automático |
| 6+ | ∞ | Error permanente, mostrar al usuario |

---

## 5. 🔑 Identificadores (UUIDs)

### Generación Consistente

```javascript
// utils/uuid.js
export const generateUUID = () => {
  // Intenta usar crypto.randomUUID() (moderno)
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  
  // Fallback para navegadores antiguos
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Resultado: "550e8400-e29b-41d4-a716-446655440000"
// Formato: UUID v4 (compatible con Supabase)
```

### Flujo de IDs

```
OFFLINE:
┌─────────────────────────────────────────┐
│ Frontend genera UUID temporal           │
│ id: "550e8400-e29b-41d4-a716-446655440000" │
└──────┬──────────────────────────────────┘
       │
       ▼ (al sincronizar)
       │
ONLINE:
┌─────────────────────────────────────────┐
│ Backend genera UUID definitivo          │
│ id: "660e8400-e29b-41d4-a716-446655440001" │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Frontend reemplaza ID temporal          │
│ por ID del servidor                     │
└─────────────────────────────────────────┘
```

---

## 6. ⏰ Timestamps

### Formato Consistente

```javascript
// Siempre ISO 8601 UTC
const timestamp = new Date().toISOString();
// "2026-03-04T11:14:00.000Z"

// Componentes:
// 2026-03-04  → Fecha (YYYY-MM-DD)
// T           → Separador
// 11:14:00    → Hora (HH:MM:SS)
// .000        → Milisegundos
// Z           → UTC (Zulu time)
```

### Uso en Sincronización

```javascript
// Offline: Frontend genera timestamp
{
  created_at: "2026-03-04T11:14:00.000Z",
  updated_at: "2026-03-04T11:14:00.000Z"
}

// Online: Backend puede sobrescribir
{
  created_at: "2026-03-04T11:14:00.123Z",  // Más preciso
  updated_at: "2026-03-04T11:14:00.123Z"
}

// Ambos son compatibles ✅
```

---

## 7. 📊 Estados de Sincronización

### Flags de Estado

```javascript
// Registro sincronizado
{
  id: "uuid",
  description: "Riego",
  pending_sync: false,  ✅
  synced_at: "2026-03-04T11:20:00Z"
}

// Registro pendiente
{
  id: "uuid",
  description: "Cosecha",
  pending_sync: true,   ⚠️
  synced_at: null
}

// Registro con error
{
  id: "uuid",
  description: "Siembra",
  pending_sync: true,   ⚠️
  synced_at: null,
  sync_error: "Network error",
  retry_count: 3
}
```

---

## 8. 🎨 UI - Indicadores Visuales

### Badges de Estado

```jsx
// Componente TimeEntryCard
<div className="time-entry-card">
  <h3>{entry.description}</h3>
  
  {entry.pending_sync && (
    <span className="badge badge-warning">
      ⚠️ Pendiente de sincronizar
    </span>
  )}
  
  {entry.sync_error && (
    <span className="badge badge-error">
      ❌ Error: {entry.sync_error}
    </span>
  )}
  
  {!entry.pending_sync && entry.synced_at && (
    <span className="badge badge-success">
      ✅ Sincronizado
    </span>
  )}
</div>
```

### Indicador de Conexión

```jsx
// Hook personalizado
const { isOnline, pendingCount } = useOfflineStatus();

// En el header
<div className="connection-status">
  {isOnline ? (
    <span className="online">
      ✅ Conectado
      {pendingCount > 0 && ` (${pendingCount} pendientes)`}
    </span>
  ) : (
    <span className="offline">
      ❌ Sin conexión - Modo offline
    </span>
  )}
</div>
```

---

## 9. 🧪 Ejemplo Completo

### Escenario: Usuario sin internet crea 3 registros

```javascript
// PASO 1: Usuario está offline
navigator.onLine // false

// PASO 2: Crea registro 1
await createTimeEntry({
  description: "Riego zona A",
  start_time: "2026-03-04T08:00:00Z",
  end_time: "2026-03-04T10:00:00Z"
});

// IndexedDB:
time_entries: [
  { id: "uuid-1", description: "Riego zona A", pending_sync: true }
]
sync_queue: [
  { id: 1, action: "create", data: {...} }
]

// PASO 3: Crea registro 2
await createTimeEntry({
  description: "Fertilización",
  start_time: "2026-03-04T10:00:00Z",
  end_time: "2026-03-04T12:00:00Z"
});

// IndexedDB:
time_entries: [
  { id: "uuid-1", description: "Riego zona A", pending_sync: true },
  { id: "uuid-2", description: "Fertilización", pending_sync: true }
]
sync_queue: [
  { id: 1, action: "create", data: {...} },
  { id: 2, action: "create", data: {...} }
]

// PASO 4: Crea registro 3
await createTimeEntry({
  description: "Cosecha",
  start_time: "2026-03-04T14:00:00Z",
  end_time: "2026-03-04T18:00:00Z"
});

// IndexedDB:
time_entries: [
  { id: "uuid-1", description: "Riego zona A", pending_sync: true },
  { id: "uuid-2", description: "Fertilización", pending_sync: true },
  { id: "uuid-3", description: "Cosecha", pending_sync: true }
]
sync_queue: [
  { id: 1, action: "create", data: {...} },
  { id: 2, action: "create", data: {...} },
  { id: 3, action: "create", data: {...} }
]

// PASO 5: Usuario vuelve online
navigator.onLine // true
// Evento 'online' dispara sincronización automática

// PASO 6: Sincronización
console.log("Sincronizando 3 items...");

// Item 1
POST /api/time-entries → { id: "server-uuid-1", ... }
// Actualiza IndexedDB con server ID
// Elimina de sync_queue

// Item 2
POST /api/time-entries → { id: "server-uuid-2", ... }
// Actualiza IndexedDB con server ID
// Elimina de sync_queue

// Item 3
POST /api/time-entries → { id: "server-uuid-3", ... }
// Actualiza IndexedDB con server ID
// Elimina de sync_queue

// PASO 7: Resultado final
time_entries: [
  { id: "server-uuid-1", description: "Riego zona A", pending_sync: false, synced_at: "..." },
  { id: "server-uuid-2", description: "Fertilización", pending_sync: false, synced_at: "..." },
  { id: "server-uuid-3", description: "Cosecha", pending_sync: false, synced_at: "..." }
]
sync_queue: []  // ✅ Vacía

console.log("✅ Sincronización completada: 3 registros");
```

---

## 10. 🔍 Debugging

### Ver Estado de Sincronización

```javascript
// En la consola del navegador (F12)

// 1. Ver cola de sincronización
const queue = await db.sync_queue.toArray();
console.log("Cola:", queue);

// 2. Ver registros pendientes
const pending = await db.time_entries
  .where('pending_sync')
  .equals(true)
  .toArray();
console.log("Pendientes:", pending);

// 3. Ver estado completo
const status = await syncService.getSyncStatus();
console.log("Estado:", status);
/*
{
  lastSync: "2026-03-04T11:20:00Z",
  pendingCount: 0,
  queueCount: 0,
  isSyncing: false,
  isOnline: true
}
*/

// 4. Forzar sincronización
await syncService.sync();
```

---

## 11. ⚠️ Limitaciones

### Lo que NO funciona offline:

1. **Login inicial** - Requiere validar credenciales en servidor
2. **Registro de usuarios** - Requiere crear cuenta en servidor
3. **Ver datos de otros usuarios** - Solo datos cacheados
4. **Cambiar password** - Requiere servidor

### Conflictos de Datos

**Escenario**:
```
1. Usuario A edita registro offline
2. Usuario B edita mismo registro online
3. Usuario A vuelve online y sincroniza
```

**Resolución actual**: **Last-Write-Wins**
- El último en sincronizar sobrescribe
- Simple pero puede perder cambios

**Mejora futura**: Detección y resolución de conflictos
```javascript
if (serverData.updated_at > localData.updated_at) {
  showConflictDialog({
    local: localData,
    server: serverData,
    onResolve: (resolved) => {
      // Usuario decide qué versión mantener
    }
  });
}
```

---

## 12. 📊 Resumen Visual

```
┌─────────────────────────────────────────────────────────┐
│                    MODO OFFLINE                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ONLINE                      OFFLINE                    │
│  ┌──────────┐               ┌──────────┐               │
│  │ Usuario  │               │ Usuario  │               │
│  └────┬─────┘               └────┬─────┘               │
│       │                          │                      │
│       ▼                          ▼                      │
│  ┌──────────┐               ┌──────────┐               │
│  │ Frontend │               │ Frontend │               │
│  └────┬─────┘               └────┬─────┘               │
│       │                          │                      │
│       ▼                          ▼                      │
│  ┌──────────┐               ┌──────────┐               │
│  │ Backend  │               │IndexedDB │               │
│  └────┬─────┘               └────┬─────┘               │
│       │                          │                      │
│       ▼                          ▼                      │
│  ┌──────────┐               ┌──────────┐               │
│  │ Supabase │               │Sync Queue│               │
│  └──────────┘               └────┬─────┘               │
│       ▲                          │                      │
│       │                          │                      │
│       │      SINCRONIZACIÓN      │                      │
│       └──────────────────────────┘                      │
│              (al volver online)                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Conclusión

El modo offline es **robusto y confiable**:

✅ **Funciona sin internet** - Todos los datos se guardan localmente
✅ **Sincronización automática** - Al volver online
✅ **Sin pérdida de datos** - Cola persistente con reintentos
✅ **UX transparente** - Usuario no nota la diferencia
✅ **Coherencia garantizada** - Misma estructura online/offline

**Ideal para trabajadores de campo que pueden perder conexión** 🌾📱
