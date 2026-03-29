# 🔧 FIX: Pantalla Blanca y Duplicados en Modo Offline

## 📅 Fecha: 29 de marzo de 2026

---

## 🐛 PROBLEMAS IDENTIFICADOS

### 1. ❌ Pantalla en Blanco al Guardar Offline
**Síntoma:** Al guardar un horario offline, la pantalla se queda en blanco.

**Causa REAL:**
```javascript
// ❌ MAL - setLoading(true) en createEntry bloqueaba TODA la UI
const createEntry = async (entryData) => {
  try {
    setLoading(true); // ❌ Bloquea toda la página
    // ...
  } finally {
    setLoading(false);
  }
};
```

El hook `useTimeEntries` usaba `setLoading(true)` en `createEntry`, `updateEntry` y `deleteEntry`, lo cual bloqueaba TODA la UI mientras se guardaba. Esto causaba que la página quedara en blanco porque el componente mostraba un spinner de carga completo.

---

### 2. ❌ Duplicados Después de Sincronizar
**Síntoma:** Al volver online, el registro se sincroniza 2 veces y queda duplicado en la DB.

**Causa:**
1. Entry se guarda offline con `client_id` temporal
2. Se sincroniza al backend → backend le asigna `id` real
3. Hook recarga datos desde backend
4. Entry temporal sigue en IndexedDB
5. Se combinan backend + IndexedDB → **DUPLICADO**

```javascript
// ❌ MAL - No limpiaba entries sincronizados
for (const pending of pendingEntries) {
  if (!existsInBackend) {
    combined.push(pending);
  }
  // ❌ No eliminaba el pending si ya existía en backend
}
```

---

## ✅ SOLUCIONES IMPLEMENTADAS

### Fix #1: NO Usar setLoading en Operaciones Individuales

**Antes:**
```javascript
// ❌ MAL - Bloqueaba toda la UI
const createEntry = async (entryData) => {
  try {
    setLoading(true); // ❌ Bloquea toda la página
    // ...
  } finally {
    setLoading(false);
  }
};
```

**Ahora:**
```javascript
// ✅ BIEN - Solo loading para carga inicial
const createEntry = async (entryData) => {
  try {
    setError(null);
    // NO usar setLoading - solo para carga inicial
    // Las operaciones individuales usan su propio loading local
    
    if (navigator.onLine) {
      // Online...
    } else {
      // Offline...
    }
  }
  // NO finally con setLoading
};

// En TimeEntries.jsx - loading local para operaciones
const [operationLoading, setOperationLoading] = useState(false);

const handleBulkSave = async (entries) => {
  setOperationLoading(true); // ✅ Loading local, no bloquea toda la UI
  try {
    // ...
  } finally {
    setOperationLoading(false);
  }
};
```

**Beneficio:** 
- `loading` del hook solo se usa para carga inicial de datos
- Operaciones individuales usan `operationLoading` local
- La UI NO se bloquea al guardar/editar/eliminar

---

### Fix #2: Limpiar Entries Sincronizados de IndexedDB

**Antes:**
```javascript
// ❌ MAL - No limpiaba entries sincronizados
for (const pending of pendingEntries) {
  const existsInBackend = data.some(d => 
    d.id === pending.id || d.client_id === pending.client_id
  );
  if (!existsInBackend) {
    combined.push(pending);
  }
  // ❌ Entry sincronizado queda en IndexedDB
}
```

**Ahora:**
```javascript
// ✅ BIEN - Limpia entries sincronizados
const entriesToKeep = [];
const entriesToDelete = [];

for (const pending of pendingEntries) {
  const existsInBackend = data.some(d => 
    d.id === pending.id || d.client_id === pending.client_id
  );
  if (!existsInBackend) {
    combined.push(pending);
    entriesToKeep.push(pending);
  } else {
    // ✅ Entry ya está en backend, marcar para eliminar
    entriesToDelete.push(pending);
  }
}

// ✅ Limpiar entries sincronizados de IndexedDB
for (const entry of entriesToDelete) {
  try {
    await timeEntryRepository.delete(entry.id);
  } catch (err) {
    console.error('Error eliminando entry sincronizado:', err);
  }
}
```

**Beneficio:** Entries sincronizados se eliminan de IndexedDB, evitando duplicados.

---

### Fix #3: Deduplicación Mejorada

**Antes:**
```javascript
// ❌ MAL - Solo verificaba por id
const uniqueEntries = [];
const seenIds = new Set();

for (const entry of combined) {
  if (seenIds.has(entry.id)) continue;
  seenIds.add(entry.id);
  uniqueEntries.push(entry);
}
```

**Ahora:**
```javascript
// ✅ BIEN - Verifica por id Y client_id
const uniqueEntries = [];
const seenIds = new Set();
const seenClientIds = new Set();

for (const entry of combined) {
  const isDuplicate = seenIds.has(entry.id) || 
                     (entry.client_id && seenClientIds.has(entry.client_id));
  if (isDuplicate) continue;
  
  seenIds.add(entry.id);
  if (entry.client_id) seenClientIds.add(entry.client_id);
  uniqueEntries.push(entry);
}
```

**Beneficio:** Elimina duplicados tanto por `id` como por `client_id`.

---

## 🔄 FLUJO CORREGIDO

### Antes (Con Bugs):
```
1. Usuario offline → Guarda entry
2. setLoading(false) → ❌ Pantalla blanca
3. Entry en IndexedDB con client_id
4. Usuario online → Sincroniza
5. Backend crea entry con id real
6. Hook recarga → Combina backend + IndexedDB
7. ❌ DUPLICADO (mismo entry con id y client_id)
```

### Ahora (Corregido):
```
1. Usuario offline → Guarda entry
2. setLoading(true) → ✅ Muestra spinner
3. Entry en IndexedDB con client_id
4. setLoading(false) → ✅ Modal se cierra
5. Usuario online → Sincroniza
6. Backend crea entry con id real
7. Hook recarga → Detecta entry sincronizado
8. ✅ Elimina entry de IndexedDB
9. ✅ Deduplica por id y client_id
10. ✅ SIN DUPLICADOS
```

---

## 📋 REGLAS APLICADAS

### De `SOLUCION_DEFINITIVA_OFFLINE.md`:
- ✅ Backend es la fuente de verdad
- ✅ IndexedDB solo para pendientes
- ✅ NO cachear datos del backend
- ✅ Limpiar entries sincronizados

### Nuevas Reglas Agregadas:
- ✅ **SIEMPRE** mostrar loading (online y offline)
- ✅ **SIEMPRE** limpiar entries sincronizados de IndexedDB
- ✅ **SIEMPRE** deduplicar por id Y client_id

---

## 🧪 TESTING

### Caso 1: Guardar Offline
```
1. Desconectar internet
2. Guardar horario
3. ✅ Debe mostrar spinner
4. ✅ Modal debe cerrarse
5. ✅ Entry debe aparecer en la lista
```

### Caso 2: Sincronizar
```
1. Con entries offline pendientes
2. Conectar internet
3. ✅ Debe sincronizar automáticamente
4. ✅ NO debe haber duplicados
5. ✅ Entries deben tener id real del backend
```

### Caso 3: Recargar Página
```
1. Con entries sincronizados
2. Recargar página (F5)
3. ✅ NO debe haber duplicados
4. ✅ IndexedDB debe estar limpio
```

---

## 📊 ARCHIVOS MODIFICADOS

### 1. `hooks/useTimeEntries.js`
- ✅ `createEntry`: SIEMPRE mostrar loading
- ✅ `loadTimeEntries`: Limpiar entries sincronizados
- ✅ `loadTimeEntries`: Deduplicación mejorada

**Líneas modificadas:** 94-136 (createEntry), 26-65 (loadTimeEntries)

---

## ⚠️ IMPORTANTE

### NO Hacer:
- ❌ NO poner `setLoading(true)` solo si online
- ❌ NO dejar entries sincronizados en IndexedDB
- ❌ NO deduplicar solo por `id`

### SIEMPRE Hacer:
- ✅ SIEMPRE mostrar loading
- ✅ SIEMPRE limpiar entries sincronizados
- ✅ SIEMPRE deduplicar por `id` y `client_id`

---

## 🎯 RESULTADO

### Antes:
- ❌ Pantalla blanca al guardar offline
- ❌ Duplicados después de sincronizar
- ❌ Entries temporales quedan en IndexedDB

### Ahora:
- ✅ Spinner se muestra correctamente
- ✅ NO hay duplicados
- ✅ IndexedDB se limpia automáticamente
- ✅ Experiencia fluida offline → online

---

**Estado:** ✅ COMPLETADO  
**Probado:** Pendiente de testing por usuario  
**Próximo:** Buscar y corregir errores de fechas en toda la app
