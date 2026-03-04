# 🔧 Instrucciones Finales para Completar la Migración

## ⚠️ ACCIÓN REQUERIDA

Hay un archivo duplicado que necesitas arreglar manualmente:

### 1️⃣ Eliminar Hook Viejo

**Elimina este archivo:**
```
frontend/src/hooks/useTimeEntries.js
```

### 2️⃣ Renombrar Hook Nuevo

**Renombra este archivo:**
```
DE:  frontend/src/hooks/useTimeEntriesNew.js
A:   frontend/src/hooks/useTimeEntries.js
```

### Comandos para hacerlo:

#### En Windows (PowerShell o CMD):
```bash
cd frontend/src/hooks
del useTimeEntries.js
ren useTimeEntriesNew.js useTimeEntries.js
```

#### O manualmente en el explorador:
1. Abre `frontend/src/hooks/`
2. Elimina `useTimeEntries.js`
3. Renombra `useTimeEntriesNew.js` a `useTimeEntries.js`

---

## ✅ RESUMEN DE CAMBIOS COMPLETADOS

### Archivos Actualizados para Usar Backend API

1. ✅ **frontend/src/services/syncService.js**
   - Eliminado import de `supabase`
   - Usa `timeEntriesService` y `orgUnitsService`
   - Health check usa `/api/health`

2. ✅ **frontend/src/pages/TimeEntries.jsx**
   - Eliminado import de `supabase`
   - Usa hook `useTimeEntries` con método `createEntry`

3. ✅ **frontend/src/pages/Reports.jsx**
   - Eliminado import de `supabase`
   - Usa `timeEntriesService`, `usersService`, `orgUnitsService`

4. ✅ **frontend/src/hooks/useTimeEntriesNew.js** (pendiente renombrar)
   - Hook completamente nuevo
   - Usa backend API
   - Incluye helpers `getTotalHours` y `getEntriesByDateRange`
   - Maneja cache offline

5. ✅ **frontend/src/hooks/useOrganizationalUnits.js**
   - Actualizado para usar `orgUnitsService`

6. ✅ **frontend/src/hooks/useAuth.js**
   - Actualizado para usar backend API

7. ✅ **backend/src/app.js**
   - Health check en `/api/health` y `/health`

---

## 🚀 DESPUÉS DE RENOMBRAR EL ARCHIVO

### 1. Inicia el Backend

```bash
cd backend
npm run dev
```

Deberías ver:
```
🚀 Servidor backend corriendo en http://localhost:3001
📝 Ambiente: development
```

### 2. Inicia el Frontend

```bash
cd frontend
npm run dev
```

Debería iniciar sin errores en `http://localhost:5173`

---

## 🎯 PRÓXIMOS PASOS

1. **Ejecutar Schema en Supabase**
   - Ve a Supabase SQL Editor
   - Ejecuta `supabase/schema-simple.sql`

2. **Generar Hash de Password**
   ```bash
   cd backend
   npm run hash ContraseñaSegura123!
   ```

3. **Crear Usuario Admin**
   ```sql
   INSERT INTO users (id, email, password_hash, name, role)
   VALUES (
     '1fa2dea5-5852-4eed-94f8-757aef724d9f',
     'admin@horticola.com',
     'EL_HASH_QUE_GENERASTE',
     'Juan Pérez',
     'admin'
   );
   ```

4. **Probar Login**
   - Abre http://localhost:5173
   - Login con `admin@horticola.com` / `ContraseñaSegura123!`

---

## 📝 ARCHIVOS QUE YA NO SE USAN

Estos archivos pueden eliminarse (opcional):

- ❌ `frontend/src/config/supabase.js` (ya eliminado)
- ❌ `frontend/src/hooks/useTimeEntries.js` (viejo, eliminar)
- ⚠️ `frontend/src/hooks/useTimeEntriesNew.js` (renombrar a useTimeEntries.js)

---

## ✨ SISTEMA COMPLETAMENTE MIGRADO

Una vez que hagas el cambio del archivo, el sistema estará:

- ✅ 100% usando backend API
- ✅ Sin referencias a Supabase en frontend
- ✅ JWT para autenticación
- ✅ Permisos por rol en backend
- ✅ Cache offline funcional
- ✅ Validaciones centralizadas
- ✅ Manejo de errores robusto

¡Listo para usar! 🎉
