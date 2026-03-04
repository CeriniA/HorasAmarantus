# 🔧 Solución: Error DexieError2

## ❌ Errores

### Error 1: Update failed
```
Error updating pending changes: DexieError2
```

### Error 2: IDBKeyRange invalid
```
Failed to execute 'bound' on 'IDBKeyRange': The parameter is not a valid key
```

Estos errores ocurren cuando:
1. Intentas actualizar un registro que no existe
2. Un campo indexado tiene valores `undefined` o `null`
3. La estructura de datos es inconsistente

---

## ✅ Soluciones

### 0. **Solución Automática** ⚡

**Las migraciones se ejecutan automáticamente al recargar la página.**

Solo recarga el navegador (F5) y los datos se repararán solos.

---

### 1. **Solución Manual** (Si la automática no funciona)

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Ver estado de la base de datos
await window.dbDebug.debug();

// Reparar inconsistencias
await window.dbDebug.repair();

// Si persiste, limpiar cola de sincronización
await window.dbDebug.clearQueue();
```

---

### 2. **Solución Completa** (Si la rápida no funciona)

```javascript
// Limpiar toda la base de datos
await window.dbDebug.clear();

// Luego recarga la página
location.reload();

// Vuelve a iniciar sesión
```

---

## 🔍 Diagnóstico

### Ver qué está causando el error:

```javascript
// 1. Ver cola de sincronización
const queue = await db.sync_queue.toArray();
console.log('Cola:', queue);

// 2. Ver registros pendientes
const pending = await db.time_entries
  .where('pending_sync')
  .equals(true)
  .toArray();
console.log('Pendientes:', pending);

// 3. Buscar inconsistencias
queue.forEach(item => {
  console.log(`Item ${item.id}:`, item);
});
```

---

## 🛠️ Prevención

### Mejoras Implementadas:

1. **✅ Migraciones automáticas**
   - Se ejecutan al iniciar la app
   - Reparan `pending_sync` undefined/null
   - Verifican consistencia con sync_queue
   - Sin intervención manual necesaria

2. **✅ Query mejorado**
   - `getSyncStatus()` filtra en memoria
   - Evita errores con índices corruptos
   - No usa `.where().equals()` en campos problemáticos

3. **✅ Manejo de errores mejorado**
   - `updateSyncQueueItem` verifica si el item existe
   - Errores de actualización no detienen la sincronización
   - Logs detallados en desarrollo

4. **✅ Utilidades de debug**
   - `window.dbDebug.debug()` - Ver estado
   - `window.dbDebug.repair()` - Reparar inconsistencias
   - `window.dbDebug.clear()` - Limpiar todo
   - `window.dbDebug.export()` - Backup

5. **✅ Validaciones**
   - Verifica que el item existe antes de actualizar
   - Retorna `false` si no se pudo actualizar
   - Propaga errores correctamente

---

## 📊 Comandos Útiles

### En la Consola del Navegador (F12):

```javascript
// Ver estado completo
window.dbDebug.debug();

// Reparar inconsistencias
window.dbDebug.repair();

// Limpiar cola de sincronización
window.dbDebug.clearQueue();

// Limpiar toda la DB (⚠️ requiere confirmación)
window.dbDebug.clear();

// Exportar backup
window.dbDebug.export();
```

---

## 🔄 Flujo de Reparación

```
1. Detectar error
   ↓
2. Abrir consola (F12)
   ↓
3. Ejecutar: window.dbDebug.debug()
   ↓
4. Ver qué hay en sync_queue
   ↓
5. Ejecutar: window.dbDebug.repair()
   ↓
6. Si persiste: window.dbDebug.clearQueue()
   ↓
7. Si aún persiste: window.dbDebug.clear()
   ↓
8. Recargar página
   ↓
9. Volver a iniciar sesión
```

---

## 🎯 Causa Raíz

El error `DexieError2` generalmente ocurre cuando:

1. **Item no existe**: Se intenta actualizar un item que ya fue eliminado
2. **Estructura incorrecta**: El objeto tiene campos que no coinciden con el schema
3. **Clave duplicada**: Se intenta insertar un item con un ID que ya existe
4. **Transacción fallida**: Una operación anterior falló y dejó la DB en estado inconsistente

---

## 📝 Logs Mejorados

Ahora en desarrollo verás logs detallados:

```javascript
// Si el item no existe
⚠️ Sync queue item 123 not found for update

// Si hay error al actualizar
❌ Error updating sync queue item: {
  id: 123,
  updates: { retry_count: 1 },
  error: "DexieError2",
  stack: "..."
}

// Si falla actualizar retry count
❌ Error updating retry count: DexieError2
```

---

## ✅ Verificación

Después de aplicar la solución:

```javascript
// 1. Ver que la cola esté vacía
const queue = await db.sync_queue.toArray();
console.log('Cola:', queue.length); // Debería ser 0

// 2. Ver que no haya pendientes huérfanos
const pending = await db.time_entries
  .where('pending_sync')
  .equals(true)
  .toArray();
console.log('Pendientes:', pending.length); // Debería ser 0

// 3. Intentar sincronizar
await syncService.sync();
// Debería completar sin errores
```

---

## 🚀 Próximos Pasos

Si el error persiste después de todas las soluciones:

1. **Exporta un backup**:
   ```javascript
   await window.dbDebug.export();
   ```

2. **Limpia completamente**:
   ```javascript
   await window.dbDebug.clear();
   location.reload();
   ```

3. **Reporta el issue** con:
   - Backup exportado
   - Logs de la consola
   - Pasos para reproducir

---

## 📚 Documentación Relacionada

- `MODO_OFFLINE_EXPLICACION.md` - Cómo funciona el modo offline
- `TROUBLESHOOTING_OFFLINE.md` - Otros problemas offline
- `COHERENCIA_OFFLINE_ONLINE.md` - Verificación de consistencia

---

**El error ahora está manejado y no debería detener la sincronización** ✅
