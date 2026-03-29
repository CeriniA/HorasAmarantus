# ✅ FIX OFFLINE - RESUMEN EJECUTIVO

## 📅 Fecha: 29 de marzo de 2026

---

## 🎯 PROBLEMA REPORTADO

**Usuario reporta:**
> "El modo OFFLINE sigue fallando cuando entro a cargar horas me queda la pantalla en blanco"

---

## 🔍 CAUSA RAÍZ IDENTIFICADA

### Problema Principal: `setLoading(true)` Bloqueaba Toda la UI

**Archivo:** `hooks/useTimeEntries.js`

```javascript
// ❌ CÓDIGO PROBLEMÁTICO
const createEntry = async (entryData) => {
  try {
    setLoading(true); // ← ESTO BLOQUEABA TODA LA PÁGINA
    // ...
  } finally {
    setLoading(false);
  }
};
```

**¿Por qué bloqueaba?**

1. `loading` del hook se usa en `TimeEntries.jsx` para mostrar spinner de carga inicial
2. Cuando `loading=true`, el componente renderiza SOLO el spinner, no el contenido
3. Al guardar un entry, `setLoading(true)` hacía que la página mostrara solo el spinner
4. **Resultado:** Pantalla blanca mientras guarda

---

## ✅ SOLUCIÓN IMPLEMENTADA

### 1. Separar Loading de Carga Inicial vs Operaciones

**Hook (`useTimeEntries.js`):**
```javascript
// ✅ CORRECTO - Solo loading para carga inicial
const createEntry = async (entryData) => {
  try {
    setError(null);
    // NO usar setLoading aquí
    
    if (navigator.onLine) {
      const { timeEntry } = await timeEntriesService.create(entryData);
      setTimeEntries(prev => [timeEntry, ...prev]);
      return { success: true, data: timeEntry };
    } else {
      // Guardar offline...
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
  // NO finally con setLoading
};
```

**Página (`TimeEntries.jsx`):**
```javascript
// ✅ Loading del hook solo para carga inicial
const { loading, createEntry } = useTimeEntries(user?.id);

// ✅ Loading local para operaciones individuales
const [operationLoading, setOperationLoading] = useState(false);

const handleBulkSave = async (entries) => {
  setOperationLoading(true); // No bloquea toda la UI
  try {
    for (const entry of entries) {
      await createEntry(entry);
    }
  } finally {
    setOperationLoading(false);
  }
};

// ✅ Mostrar spinner solo en carga inicial
if (loading && timeEntries.length === 0) {
  return <LoadingSpinner />;
}

// ✅ Modal usa operationLoading, no loading
<BulkTimeEntry loading={operationLoading} />
```

---

### 2. Limpiar Entries Sincronizados (Fix de Duplicados)

**Problema:** Entries sincronizados quedaban en IndexedDB

**Solución:**
```javascript
// En loadTimeEntries()
for (const pending of pendingEntries) {
  const existsInBackend = data.some(d => 
    d.id === pending.id || d.client_id === pending.client_id
  );
  if (!existsInBackend) {
    combined.push(pending);
  } else {
    // ✅ Eliminar entry sincronizado de IndexedDB
    await timeEntryRepository.delete(pending.id);
  }
}
```

---

### 3. Deduplicación Mejorada

```javascript
// ✅ Deduplicar por id Y client_id
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

---

## 📊 ARCHIVOS MODIFICADOS

### 1. `hooks/useTimeEntries.js`
**Cambios:**
- ❌ Eliminado `setLoading(true)` de `createEntry`
- ❌ Eliminado `setLoading(true)` de `updateEntry`
- ❌ Eliminado `setLoading(true)` de `deleteEntry`
- ✅ `setLoading` solo se usa en `loadTimeEntries` (carga inicial)
- ✅ Agregada limpieza de entries sincronizados
- ✅ Agregada deduplicación por `id` y `client_id`

**Líneas modificadas:** 115-154, 157-203, 205-233, 26-65

---

### 2. `pages/TimeEntries.jsx`
**Cambios:**
- ✅ Agregado `loading` del hook (línea 23)
- ✅ Agregado `operationLoading` local (línea 36)
- ❌ Eliminado `saving` (ya no se usa)
- ✅ `handleBulkSave` usa `operationLoading` (línea 66)
- ✅ `handleSaveEdit` usa `operationLoading` (línea 124)
- ✅ Agregado spinner de carga inicial (líneas 165-174)
- ✅ Modal usa `operationLoading` en lugar de `saving` (línea 422, 444)
- ✅ Corregido `confirm` → `window.confirm` (línea 152)

**Líneas modificadas:** 23, 36, 65-99, 121-147, 152, 164-174, 422, 444

---

## 🔄 FLUJO CORREGIDO

### Antes (Con Bug):
```
1. Usuario abre /time-entries
2. Hook carga datos → loading=true → Spinner
3. Datos cargados → loading=false → Muestra contenido
4. Usuario guarda entry → createEntry() → setLoading(true)
5. ❌ PANTALLA BLANCA (loading=true muestra solo spinner)
6. Entry guardado → setLoading(false)
7. Vuelve contenido
```

### Ahora (Corregido):
```
1. Usuario abre /time-entries
2. Hook carga datos → loading=true → Spinner
3. Datos cargados → loading=false → Muestra contenido
4. Usuario guarda entry → setOperationLoading(true)
5. ✅ CONTENIDO VISIBLE con spinner en modal
6. Entry guardado → setOperationLoading(false)
7. Modal se cierra, contenido sigue visible
```

---

## 🧪 TESTING REQUERIDO

### Caso 1: Guardar Offline
```
1. Desconectar internet
2. Ir a /time-entries
3. Click en "Cargar Horas"
4. Llenar formulario
5. Guardar
✅ Debe mostrar spinner EN EL MODAL, no pantalla blanca
✅ Modal debe cerrarse
✅ Entry debe aparecer en la lista
```

### Caso 2: Sincronizar
```
1. Con entries offline pendientes
2. Conectar internet
3. Esperar sincronización automática
✅ NO debe haber duplicados
✅ Entries deben tener id real del backend
✅ IndexedDB debe estar limpio
```

### Caso 3: Recargar Página
```
1. Con entries sincronizados
2. F5 para recargar
✅ Debe mostrar spinner inicial
✅ Debe cargar datos correctamente
✅ NO debe haber duplicados
```

---

## ⚠️ REGLAS CRÍTICAS

### NUNCA Hacer:
❌ Usar `setLoading(true)` en operaciones individuales (create/update/delete)  
❌ Bloquear toda la UI con loading global  
❌ Dejar entries sincronizados en IndexedDB  

### SIEMPRE Hacer:
✅ Usar `loading` solo para carga inicial de datos  
✅ Usar loading local (`operationLoading`) para operaciones individuales  
✅ Limpiar entries sincronizados de IndexedDB  
✅ Deduplicar por `id` Y `client_id`  

---

## 📈 RESULTADO ESPERADO

### Antes:
- ❌ Pantalla blanca al guardar
- ❌ Duplicados después de sincronizar
- ❌ Mala experiencia de usuario

### Ahora:
- ✅ UI siempre visible
- ✅ Spinner solo en modal
- ✅ Sin duplicados
- ✅ Experiencia fluida

---

**Estado:** ✅ IMPLEMENTADO - Pendiente de testing por usuario  
**Prioridad:** CRÍTICA  
**Próximo:** Usuario debe probar en modo offline
