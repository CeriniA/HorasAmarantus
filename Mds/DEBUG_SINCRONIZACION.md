# 🔍 Debug de Sincronización - Paso a Paso

## ❌ Error Original
```
Error: No strategy registered for entity type: organizational_units
```

## ✅ Solución Implementada

### 1. **Crear Estrategia de Sync para OrgUnits**
```javascript
// offline/sync/strategies/OrgUnitSyncStrategy.js
export class OrgUnitSyncStrategy extends SyncStrategy {
  async create(data) { /* ... */ }
  async update(data) { /* ... */ }
  async delete(data) { /* ... */ }
}
```

### 2. **Registrar Estrategia**
```javascript
// offline/index.js
syncManager.registerStrategy(
  'organizational_units',
  new OrgUnitSyncStrategy(api, orgUnitRepository)
);
```

---

## 🔍 Cómo Debuggear

### En la Consola del Navegador (F12):

```javascript
// Ver estado completo de sincronización
await window.debugSync();
```

**Esto te muestra:**
1. 📋 Items en la cola de sincronización
2. ⏰ Time entries (total y pendientes)
3. 🏢 Organizational units (total y pendientes)
4. 🔗 Correlación entre cola y datos

---

## 📊 Flujo de Sincronización

### Cuando guardas OFFLINE:

```
1. Usuario crea/edita → Hook (useTimeEntries/useOrganizationalUnits)
                          ↓
2. Repository.save()   → Guarda en IndexedDB
                          ↓
3. SyncQueue.add()     → Agrega a cola de sincronización
                          ↓
4. Datos locales       → { id, data, pending_sync: true }
```

### Cuando vuelve ONLINE:

```
1. SyncManager.sync() → Lee cola de sincronización
                         ↓
2. Para cada item     → Busca estrategia registrada
                         ↓
3. Strategy.sync()    → Ejecuta create/update/delete en API
                         ↓
4. API responde       → Actualiza datos locales
                         ↓
5. SyncQueue.remove() → Elimina de cola
                         ↓
6. Repository.save()  → Marca como { pending_sync: false }
```

---

## 🎯 Verificar Correlación de Datos

### ¿Qué se guarda localmente?

**Time Entry Offline:**
```javascript
{
  id: "uuid-generado",           // ✅ UUID local
  client_id: "uuid-generado",    // ✅ UUID para tracking
  user_id: "user-uuid",
  organizational_unit_id: "org-uuid",
  description: "...",
  start_time: "2024-...",
  end_time: "2024-...",
  pending_sync: true,            // ✅ Marca para sincronizar
  synced_at: null,
  created_at: "2024-...",
  updated_at: "2024-..."
}
```

**En Sync Queue:**
```javascript
{
  id: 1,                         // Auto-increment
  entity_type: "time_entries",   // ✅ Tipo de entidad
  entity_id: "uuid-generado",    // ✅ ID de la entidad
  action: "create",              // create/update/delete
  data: { /* objeto completo */ },
  timestamp: "2024-...",
  retry_count: 0,
  error: null
}
```

### ¿Qué se guarda en la DB (Supabase)?

**Cuando sincroniza:**
```javascript
{
  id: "uuid-del-servidor",       // ⚠️ NUEVO UUID del servidor
  user_id: "user-uuid",
  organizational_unit_id: "org-uuid",
  description: "...",
  start_time: "2024-...",
  end_time: "2024-...",
  total_hours: 8.5,              // ✅ Calculado por trigger
  status: "completed",
  created_at: "2024-...",        // ✅ Timestamp del servidor
  updated_at: "2024-..."
}
```

---

## 🔗 Correlación: Local ↔️ Servidor

### ✅ CORRECTO - Así funciona:

1. **Offline**: Guardas con `id` y `client_id` locales
2. **Sync**: API crea con nuevo `id` del servidor
3. **Actualización**: Se actualiza local con `id` del servidor
4. **Marca**: `pending_sync: false`, `synced_at: timestamp`

### ❌ PROBLEMA - Si hay conflicto:

**Escenario 1: Mismo registro editado offline y online**
- Local: `{ id: "local-uuid", description: "A" }`
- Servidor: `{ id: "server-uuid", description: "B" }`
- **Resultado**: Se crea duplicado (no hay merge automático)

**Escenario 2: Registro eliminado en servidor**
- Local: Intenta actualizar
- Servidor: 404 Not Found
- **Resultado**: Error en sync, queda en cola con `retry_count++`

---

## 🛠️ Comandos de Debug

### 1. Ver estado de sincronización
```javascript
await window.debugSync();
```

### 2. Ver base de datos completa
```javascript
await window.dbDebug.debug();
```

### 3. Reparar inconsistencias
```javascript
await window.dbDebug.repair();
```

### 4. Limpiar cola de sincronización
```javascript
await window.dbDebug.clearQueue();
```

### 5. Forzar sincronización manual
```javascript
// En el componente que use useOffline
const { manualSync } = useOffline();
await manualSync();
```

---

## 🔍 Checklist de Debug

Cuando algo no sincroniza, verifica:

- [ ] **¿Hay conexión a internet?**
  ```javascript
  navigator.onLine // true/false
  ```

- [ ] **¿Está registrada la estrategia?**
  ```javascript
  // Debe estar en offline/index.js
  syncManager.registerStrategy('entity_type', strategy);
  ```

- [ ] **¿Los datos están en la cola?**
  ```javascript
  await window.debugSync(); // Ver sync queue
  ```

- [ ] **¿El `entity_type` coincide?**
  ```javascript
  // En syncQueue.add():
  syncQueue.add('time_entries', ...)  // ✅ Correcto
  syncQueue.add('timeEntries', ...)   // ❌ Error
  ```

- [ ] **¿El endpoint de la API existe?**
  ```javascript
  // Verificar en backend/src/routes/
  POST /time-entries          // ✅ Existe
  POST /organizational-units  // ✅ Existe
  ```

- [ ] **¿Hay errores de permisos?**
  ```javascript
  // Ver en sync queue:
  item.error // "Unauthorized", "Forbidden", etc.
  ```

- [ ] **¿Los datos son válidos?**
  ```javascript
  // Verificar que tengan todos los campos requeridos
  item.data // { name, type, ... }
  ```

---

## 📝 Ejemplo Completo de Flujo

### Usuario crea Org Unit OFFLINE:

```javascript
// 1. useOrganizationalUnits.js
const createUnit = async (data) => {
  if (!navigator.onLine) {
    // Preparar datos locales
    const localUnit = {
      id: generateUUID(),           // "abc-123"
      name: "Nueva Tarea",
      type: "tarea",
      parent_id: "parent-uuid",
      pending_sync: true
    };
    
    // Guardar en IndexedDB
    await orgUnitRepository.save(localUnit);
    
    // Agregar a cola
    await syncQueue.add(
      'organizational_units',      // ✅ entity_type
      localUnit.id,                 // ✅ entity_id
      'create',                     // ✅ action
      localUnit                     // ✅ data
    );
  }
};
```

### Vuelve ONLINE - Sincroniza:

```javascript
// 2. SyncManager.sync()
const items = await syncQueue.getAll();
// [{ id: 1, entity_type: 'organizational_units', action: 'create', ... }]

for (const item of items) {
  // 3. Buscar estrategia
  const strategy = strategies.get('organizational_units');
  // ✅ OrgUnitSyncStrategy encontrada
  
  // 4. Ejecutar sync
  await strategy.sync(item);
  // → strategy.create(item.data)
  // → api.post('/organizational-units', data)
  // → Servidor responde: { id: "server-uuid", ... }
  
  // 5. Actualizar local
  await orgUnitRepository.save({
    ...serverResponse,
    pending_sync: false,
    synced_at: new Date()
  });
  
  // 6. Remover de cola
  await syncQueue.remove(item.id);
}
```

---

## ✅ Resumen

**Problema**: Faltaba estrategia de sync para `organizational_units`

**Solución**: 
1. ✅ Crear `OrgUnitSyncStrategy.js`
2. ✅ Registrar en `offline/index.js`
3. ✅ Agregar utilidad de debug `window.debugSync()`

**Verificar**:
```javascript
// En consola del navegador
await window.debugSync();
```

**Recarga el navegador (F5) y prueba crear una Org Unit offline** 🎉
