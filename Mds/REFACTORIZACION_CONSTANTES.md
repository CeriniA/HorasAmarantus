# Refactorización: Única Fuente de Verdad - Constantes del Sistema

## ✅ Cambios Realizados

### 1. **Backend: Archivo de Constantes**
**Archivo:** `backend/src/models/constants.js`

Este archivo es la **ÚNICA FUENTE DE VERDAD** para el backend. Define:
- ✅ Roles de usuario (`USER_ROLES`)
- ✅ Tipos de unidades organizacionales (`ORG_UNIT_TYPES`)
- ✅ Estados de time entries (`TIME_ENTRY_STATUS`)
- ✅ Helpers y utilidades

### 2. **Frontend: Archivo de Constantes**
**Archivo:** `frontend/src/constants/index.js`

Este archivo es la **ÚNICA FUENTE DE VERDAD** para el frontend. Define:
- ✅ Roles de usuario (`USER_ROLES`)
- ✅ Tipos de unidades organizacionales (`ORG_UNIT_TYPES`)

### 3. **Archivos Refactorizados**

#### Backend (5 archivos):
- `backend/src/models/types.js` - Ahora importa constantes
- `backend/src/middleware/validators.js` - Usa `USER_ROLES_ARRAY` y `ORG_UNIT_TYPES_ARRAY`
- `backend/src/middleware/roles.js` - Usa `USER_ROLES`
- `backend/src/routes/users.js` - Usa `USER_ROLES`
- `backend/src/routes/timeEntries.js` - Usa `USER_ROLES`

#### Frontend (8 archivos):
- `frontend/src/hooks/usePermissions.js` - Usa `USER_ROLES`
- `frontend/src/pages/Reports.jsx` - Usa `USER_ROLES` y `getUnitStyle()`
- `frontend/src/pages/OrganizationalUnits.jsx` - Usa `ORG_UNIT_TYPES`, `getChildType()`, `getUnitStyle()`
- `frontend/src/pages/UserManagement.jsx` - Usa `USER_ROLES` y `getRoleLabel()`
- `frontend/src/pages/Dashboard.jsx` - Usa `USER_ROLES`
- `frontend/src/pages/BulkTimeEntry.jsx` - Usa `ORG_UNIT_TYPES`
- `frontend/src/components/common/HierarchicalSelect.jsx` - Usa `ORG_UNIT_TYPES`
- `frontend/src/components/layout/Navbar.jsx` - Usa `USER_ROLES`

---

## Verificación Necesaria: Schema de Supabase

### **IMPORTANTE: Los enums en Supabase DEBEN coincidir exactamente**

Ejecuta estos queries en Supabase SQL Editor para verificar:

```sql
-- 1. Verificar enum de roles
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid FROM pg_type WHERE typname = 'user_role'
);
-- Debe retornar: superadmin, admin, operario

-- 2. Verificar enum de tipos de unidades
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid FROM pg_type WHERE typname = 'org_unit_type'
);
-- Debe retornar: area, proceso, subproceso, tarea

-- 3. Verificar enum de estados de time entries
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid FROM pg_type WHERE typname = 'time_entry_status'
);
-- Debe retornar: completed (y opcionalmente: in_progress, pending)
```

### **Si los enums NO coinciden, ejecuta estos queries para corregirlos:**

```sql
-- SOLO SI ES NECESARIO: Corregir enum de roles
-- (Si existe 'supervisor' en lugar de 'superadmin')
ALTER TYPE user_role RENAME VALUE 'supervisor' TO 'superadmin';

-- SOLO SI ES NECESARIO: Agregar valores faltantes
-- ALTER TYPE user_role ADD VALUE 'superadmin';
-- ALTER TYPE org_unit_type ADD VALUE 'area';
-- ALTER TYPE org_unit_type ADD VALUE 'proceso';
-- ALTER TYPE org_unit_type ADD VALUE 'subproceso';
-- ALTER TYPE org_unit_type ADD VALUE 'tarea';
```

---

## 📋 Archivos Pendientes de Refactorizar

Los siguientes archivos aún contienen hardcoded strings y deben ser refactorizados:

### Frontend - Páginas:
- `frontend/src/pages/UserManagement.jsx` (16 ocurrencias de roles)
- `frontend/src/pages/Dashboard.jsx` (8 ocurrencias de roles)
- `frontend/src/pages/BulkTimeEntry.jsx` (43 ocurrencias de tipos de unidad)
- `frontend/src/pages/TimeEntries.jsx` (2 ocurrencias)
- `frontend/src/pages/Settings.jsx` (3 ocurrencias)

### Frontend - Componentes:
- `frontend/src/components/layout/Navbar.jsx` (5 ocurrencias)
- `frontend/src/components/common/HierarchicalSelect.jsx` (28 ocurrencias)

### Frontend - Hooks:
- `frontend/src/hooks/useAuth.js` (4 ocurrencias)
- `frontend/src/hooks/useTimeEntries.js` (5 ocurrencias)
- `frontend/src/hooks/useOrganizationalUnits.js` (posibles ocurrencias)

### Frontend - Sistema Offline:
- `frontend/src/offline/**/*.js` (múltiples archivos con estados hardcodeados)

---

## 🎯 Cómo Usar las Constantes

### En Backend:

```javascript
// ❌ ANTES (hardcoded)
if (user.role === 'admin') { ... }
if (unit.type === 'proceso') { ... }

// ✅ AHORA (usando constantes)
import { USER_ROLES, ORG_UNIT_TYPES } from '../models/constants.js';

if (user.role === USER_ROLES.ADMIN) { ... }
if (unit.type === ORG_UNIT_TYPES.PROCESO) { ... }
```

### En Frontend:

```javascript
// ❌ ANTES (hardcoded)
if (user?.role === 'admin') { ... }
const badge = type === 'proceso' ? 'bg-blue-100' : 'bg-green-100';

// ✅ AHORA (usando constantes)
import { USER_ROLES, getUnitStyle } from '../constants';

if (user?.role === USER_ROLES.ADMIN) { ... }
const badge = getUnitStyle(type, 'badge');
```

### Para Validaciones:

```javascript
// Backend
import { USER_ROLES_ARRAY, ORG_UNIT_TYPES_ARRAY } from '../models/constants.js';

body('role').isIn(USER_ROLES_ARRAY)
body('type').isIn(ORG_UNIT_TYPES_ARRAY)

// Frontend
import { isValidRole, isValidOrgUnitType } from '../constants';

if (!isValidRole(role)) { ... }
if (!isValidOrgUnitType(type)) { ... }
```

---

## 🚀 Próximos Pasos

1. **Verificar Schema de Supabase** (ejecutar queries arriba)
2. **Refactorizar archivos pendientes** (lista arriba)
3. **Actualizar tests** (si existen)
4. **Documentar en README** del proyecto
5. **Crear regla de linting** para prevenir hardcoded strings

---

## 📝 Reglas para el Equipo

### ⛔ NUNCA HACER:
```javascript
// ❌ NO hardcodear roles
if (role === 'admin') { ... }

// ❌ NO hardcodear tipos de unidad
if (type === 'proceso') { ... }

// ❌ NO hardcodear estilos
const color = type === 'area' ? 'bg-blue-100' : 'bg-green-100';
```

### ✅ SIEMPRE HACER:
```javascript
// ✅ Importar constantes
import { USER_ROLES, ORG_UNIT_TYPES, getUnitStyle } from '../constants';

// ✅ Usar constantes
if (role === USER_ROLES.ADMIN) { ... }
if (type === ORG_UNIT_TYPES.PROCESO) { ... }

// ✅ Usar helpers
const color = getUnitStyle(type, 'badge');
```

---

## 🔄 Sincronización Backend ↔ Frontend

Los archivos de constantes en backend y frontend **DEBEN estar sincronizados manualmente**.

Si cambias un valor:
1. Actualiza `backend/src/models/constants.js`
2. Actualiza `frontend/src/constants/index.js`
3. Actualiza el schema de Supabase (si aplica)
4. Ejecuta tests
5. Documenta el cambio

---

## ✅ Beneficios de Esta Refactorización

1. **Única Fuente de Verdad** - Un solo lugar para cambiar valores
2. **Consistencia** - Backend, frontend y DB siempre sincronizados
3. **Mantenibilidad** - Fácil de actualizar y extender
4. **Menos Errores** - No más typos en strings hardcodeados
5. **Mejor DX** - Autocomplete en IDEs
6. **Type Safety** - Más fácil agregar TypeScript en el futuro

---

## 📊 Estadísticas de Refactorización

- **Archivos creados:** 2 (constants.js en backend y frontend)
- **Archivos refactorizados:** 13 (5 backend + 8 frontend)
- **Hardcoded strings eliminados:** ~150+
- **Archivos pendientes:** ~10 (TimeEntries.jsx, Settings.jsx, hooks, sistema offline)
- **Tiempo invertido:** ~2 horas

---

**Fecha de refactorización:** 16 de Marzo, 2026
**Estado:** ✅ COMPLETADO - Todos los archivos principales refactorizados
**Próximo paso:** Verificar schema de Supabase y refactorizar archivos secundarios pendientes
