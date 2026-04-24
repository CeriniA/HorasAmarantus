# 🔍 **ANÁLISIS COMPLETO: MIGRACIÓN A RBAC**

**Fecha:** 10 de Abril de 2026  
**Estado:** 📋 **ANÁLISIS PROFUNDO COMPLETO**

---

## 🎯 **RESUMEN EJECUTIVO**

El sistema tiene **DOS sistemas de permisos funcionando en paralelo**:

1. **Sistema VIEJO** - Basado en roles hardcodeados (`user.role`, `hasPermission`, `USER_ROLES`)
2. **Sistema NUEVO** - RBAC con base de datos (`role_id`, `permissions`, `user_permissions`)

**PROBLEMA:** El código usa el sistema VIEJO en ~90% de los archivos.

---

## 📊 **ESTADO ACTUAL DE LA BASE DE DATOS**

### **✅ Tablas RBAC creadas:**
- `roles` - Roles del sistema
- `permissions` - Permisos granulares
- `role_permissions` - Permisos por rol
- `user_permissions` - Excepciones por usuario

### **⚠️ Tabla `users` tiene REDUNDANCIA:**
```sql
users:
  - role VARCHAR       ← VIEJO (hardcoded: 'superadmin', 'admin', 'operario')
  - role_id UUID       ← NUEVO (FK a tabla roles)
```

**Ambos campos existen, pero el código usa `role` (el viejo).**

---

## 🔴 **ARCHIVOS QUE USAN SISTEMA VIEJO**

### **Backend - Servicios (8 archivos):**

#### **1. `services/auth.service.js`** ❌
```javascript
// Línea 43: Genera token con user.role
const token = generateToken({
  role: user.role  // ← USA CAMPO VIEJO
});

// Línea 56: Retorna user.role
return {
  user: {
    role: user.role  // ← USA CAMPO VIEJO
  }
};
```

**Impacto:** Login devuelve rol viejo, todo el sistema lo usa.

---

#### **2. `services/users.service.js`** ❌
```javascript
// Línea 29: SELECT incluye 'role' (viejo)
.select('id, username, email, name, role, ...')  // ← USA CAMPO VIEJO

// Línea 37: Verifica permisos con hasPermission(user.role)
if (!hasPermission(user.role, 'VIEW_ALL_USERS')) {  // ← USA SISTEMA VIEJO
  query = query.eq('id', user.id);
}

// Línea 67: Verifica permisos con hasPermission
if (!hasPermission(requestingUser.role, 'VIEW_ALL_USERS')) {  // ← USA SISTEMA VIEJO
  throw new Error('No tienes permisos');
}

// Línea 90: INSERT con 'role' (viejo)
.insert({ role, ... })  // ← USA CAMPO VIEJO

// Línea 135-144: Verifica y actualiza 'role' (viejo)
if (updateData.role) {
  if (requestingUser.role !== USER_ROLES.SUPERADMIN) {  // ← USA SISTEMA VIEJO
    delete updateData.role;
  }
}
```

**Impacto:** CRUD de usuarios usa sistema viejo completamente.

---

#### **3. `services/timeEntries.service.js`** ❌
```javascript
// Línea 30: Verifica permisos con hasPermission(user.role)
if (!hasPermission(user.role, 'VIEW_ALL_ENTRIES')) {  // ← USA SISTEMA VIEJO
  query = query.eq('user_id', user.id);
}

// Línea 50: Verifica permisos con hasPermission
if (!hasPermission(requestingUser.role, 'CREATE_ENTRY_FOR_OTHERS')) {  // ← USA SISTEMA VIEJO
  throw new Error('No puedes crear registros para otros usuarios');
}

// Línea 58: SELECT 'role' para validar
.select('role')  // ← USA CAMPO VIEJO

// Línea 67-68: Compara roles hardcodeados
if (requestingUser.role === USER_ROLES.ADMIN &&   // ← USA SISTEMA VIEJO
    (targetUser.role === USER_ROLES.ADMIN || targetUser.role === USER_ROLES.SUPERADMIN)) {
  throw new Error('No puedes crear registros para usuarios admin o superadmin');
}
```

**Impacto:** Time entries usa sistema viejo para filtrar y validar.

---

#### **4. `services/objectives.service.js`** ⚠️
```javascript
// NO verifica permisos en el servicio
// Delega verificación a las rutas (usa requireAdmin)
```

**Impacto:** Usa middleware viejo en rutas.

---

#### **5. `services/organizationalUnits.service.js`** ⚠️
```javascript
// NO verifica permisos en el servicio
// Delega verificación a las rutas
```

**Impacto:** Usa middleware viejo en rutas.

---

#### **6. `services/permissions.service.js`** ✅
```javascript
// Este servicio SÍ usa RBAC nuevo
// Consulta role_id, permissions, user_permissions
```

**Impacto:** Servicio RBAC correcto, pero NO se usa en otros servicios.

---

#### **7. `services/roles.service.js`** ✅
```javascript
// Este servicio SÍ usa RBAC nuevo
// Gestiona roles y permisos
```

**Impacto:** Servicio RBAC correcto, pero NO se usa en otros servicios.

---

### **Backend - Middleware (2 archivos):**

#### **8. `middleware/roles.js`** ❌
```javascript
// Línea 14: Verifica req.user.role (viejo)
if (!allowedRoles.includes(req.user.role)) {  // ← USA CAMPO VIEJO
  return res.status(403).json({ 
    yourRole: req.user.role  // ← USA CAMPO VIEJO
  });
}

// Línea 30-40: Compara roles hardcodeados
if (userRole === USER_ROLES.SUPERADMIN) { ... }  // ← USA SISTEMA VIEJO
if (userRole === USER_ROLES.ADMIN) { ... }  // ← USA SISTEMA VIEJO
```

**Impacto:** Middleware de roles usa sistema viejo completamente.

---

#### **9. `middleware/permissions.js`** ✅
```javascript
// Este middleware SÍ usa RBAC nuevo
// checkPermission, checkAnyPermission, checkResourceAccess
```

**Impacto:** Middleware RBAC correcto, pero NO se usa en la mayoría de rutas.

---

### **Backend - Rutas (6 archivos):**

#### **10. `routes/users.js`** ❌
```javascript
// Usa requireAdmin (middleware viejo)
router.use(requireAdmin);
```

#### **11. `routes/timeEntries.js`** ⚠️
```javascript
// PARCIALMENTE migrado a RBAC
// Usa checkAnyPermission en algunas rutas
// Pero el servicio sigue usando sistema viejo
```

#### **12. `routes/reports.js`** ⚠️
```javascript
// PARCIALMENTE migrado a RBAC
// Usa checkAnyPermission en algunas rutas
// Pero la lógica interna sigue usando sistema viejo
```

#### **13. `routes/objectives.routes.js`** ❌
```javascript
// Línea 9: Usa requireAdmin (middleware viejo)
import { requireAdmin } from '../middleware/roles.js';

// Línea 15: Aplica middleware viejo
router.use(requireAdmin);
```

**Impacto:** Objectives usa middleware viejo completamente.

---

#### **14. `routes/organizationalUnits.js`** ❌
```javascript
// Usa requireAdmin (middleware viejo)
```

#### **15. `routes/auth.js`** ⚠️
```javascript
// No verifica permisos (login/register son públicos)
// Pero auth.service.js retorna user.role (viejo)
```

---

### **Backend - Modelos (2 archivos):**

#### **16. `models/types.js`** ❌
```javascript
// Línea 86-103: Define PERMISSIONS con roles hardcodeados
export const PERMISSIONS = {
  VIEW_ALL_USERS: [USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN],  // ← SISTEMA VIEJO
  CREATE_USER: [USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN],
  // ...
};

// Línea 106-109: hasPermission usa roles hardcodeados
export const hasPermission = (userRole, permission) => {
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles && allowedRoles.includes(userRole);  // ← SISTEMA VIEJO
};
```

**Impacto:** Función hasPermission es el core del sistema viejo.

---

#### **17. `models/constants.js`** ⚠️
```javascript
// Línea 16-22: Define USER_ROLES (necesarios para migración)
export const USER_ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  TEAM_LEAD: 'team_lead',
  OPERARIO: 'operario'
};
```

**Impacto:** Constantes necesarias, pero deben usarse solo para mapeo.

---

## 🔴 **FRONTEND - ARCHIVOS QUE USAN SISTEMA VIEJO**

### **Hooks (2 archivos):**

#### **18. `hooks/usePermissions.js`** ❌
```javascript
// Línea 45: Verifica user.role === 'superadmin'
if (user.role === USER_ROLES.SUPERADMIN) return true;  // ← USA CAMPO VIEJO

// Línea 93: hasRole verifica user.role
return roles.includes(user.role);  // ← USA CAMPO VIEJO
```

#### **19. `hooks/usePermissions.v2.js`** ❌
```javascript
// Mismo problema que usePermissions.js
```

---

### **Utils (1 archivo):**

#### **20. `utils/roleHelpers.js`** ❌
```javascript
// Línea 17: isSuperadmin verifica user.role
return user.role === USER_ROLES.SUPERADMIN;  // ← USA CAMPO VIEJO

// Línea 27: isAdmin verifica user.role
return user.role === USER_ROLES.ADMIN;  // ← USA CAMPO VIEJO

// Línea 37: isAdminOrSuperadmin verifica user.role
return user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUPERADMIN;  // ← USA CAMPO VIEJO

// Línea 47: isOperario verifica user.role
return user.role === USER_ROLES.OPERARIO;  // ← USA CAMPO VIEJO

// Línea 58: hasRole verifica user.role
return roles.includes(user.role);  // ← USA CAMPO VIEJO
```

**Impacto:** Todas las funciones helper usan sistema viejo.

---

### **Componentes (3 archivos):**

#### **21. `components/ProtectedRoute.jsx`** ❌
```javascript
// Línea 19: Verifica allowedRoles.includes(user.role)
if (!allowedRoles.includes(user.role)) {  // ← USA CAMPO VIEJO
  return <Navigate to="/login" />;
}
```

#### **22. `components/users/BulkUserImport.jsx`** ❌
```javascript
// Línea 27: Lee user.role
const role = user.role || 'operario';  // ← USA CAMPO VIEJO

// Línea 275-279: Muestra user.role
user.role === 'superadmin' ? 'bg-purple-100' :  // ← USA CAMPO VIEJO
user.role === 'admin' ? 'bg-blue-100' :
'bg-green-100'
```

#### **23. `pages/UserManagement.jsx`** ❌
```javascript
// Línea 61: Lee user.role
role: user.role,  // ← USA CAMPO VIEJO

// Línea 246-247: Muestra user.role
getRoleBadgeColor(user.role)
getRoleLabel(user.role)
```

---

## 📋 **RESUMEN DE ARCHIVOS AFECTADOS**

### **Backend:**
| Archivo | Estado | Uso RBAC | Prioridad |
|---------|--------|----------|-----------|
| `services/auth.service.js` | ❌ Viejo | 0% | 🔴 CRÍTICO |
| `services/users.service.js` | ❌ Viejo | 0% | 🔴 CRÍTICO |
| `services/timeEntries.service.js` | ❌ Viejo | 0% | 🔴 CRÍTICO |
| `services/objectives.service.js` | ⚠️ Delegado | 0% | 🟡 MEDIO |
| `services/organizationalUnits.service.js` | ⚠️ Delegado | 0% | 🟡 MEDIO |
| `middleware/roles.js` | ❌ Viejo | 0% | 🔴 CRÍTICO |
| `models/types.js` | ❌ Viejo | 0% | 🔴 CRÍTICO |
| `routes/users.js` | ❌ Viejo | 0% | 🟡 MEDIO |
| `routes/timeEntries.js` | ⚠️ Parcial | 30% | 🟡 MEDIO |
| `routes/reports.js` | ⚠️ Parcial | 30% | 🟡 MEDIO |
| `routes/objectives.routes.js` | ❌ Viejo | 0% | 🟡 MEDIO |
| `routes/organizationalUnits.js` | ❌ Viejo | 0% | 🟡 MEDIO |

### **Frontend:**
| Archivo | Estado | Uso RBAC | Prioridad |
|---------|--------|----------|-----------|
| `hooks/usePermissions.js` | ❌ Viejo | 0% | 🔴 CRÍTICO |
| `utils/roleHelpers.js` | ❌ Viejo | 0% | 🔴 CRÍTICO |
| `components/ProtectedRoute.jsx` | ❌ Viejo | 0% | 🟡 MEDIO |
| `components/users/BulkUserImport.jsx` | ❌ Viejo | 0% | 🟢 BAJO |
| `pages/UserManagement.jsx` | ❌ Viejo | 0% | 🟢 BAJO |

**Total archivos afectados:** 23  
**Archivos críticos:** 7  
**Archivos medios:** 10  
**Archivos bajos:** 6

---

## 🎯 **PLAN DE MIGRACIÓN COMPLETO**

### **FASE 1: Base de Datos (1 hora)**

#### **1.1. Crear vista `users_with_role`**
```sql
CREATE OR REPLACE VIEW users_with_role AS
SELECT 
  u.*,
  r.slug as role  -- Campo virtual que mapea role_id → slug
FROM users u
LEFT JOIN roles r ON u.role_id = r.id;
```

**Beneficio:** El código sigue funcionando sin cambios.

---

#### **1.2. Actualizar queries backend para usar vista**
```javascript
// En TODOS los servicios que consultan 'users':
.from('users_with_role')  // En lugar de 'users'
```

**Archivos a modificar:**
- `services/auth.service.js`
- `services/users.service.js`
- `services/timeEntries.service.js`

---

#### **1.3. Eliminar columna `role` de tabla `users`**
```sql
ALTER TABLE users DROP COLUMN IF EXISTS role;
```

**Beneficio:** Elimina redundancia, la vista sigue funcionando.

---

### **FASE 2: Backend Core (3 horas)**

#### **2.1. Crear servicio helper RBAC**
```javascript
// services/rbac.helper.js
export const getUserWithPermissions = async (userId) => {
  // Obtener usuario con role_id
  // Obtener permisos del rol
  // Retornar objeto compatible con código existente
  return {
    ...user,
    role: user.roles.slug,  // Para compatibilidad
    permissions: [...permisos]
  };
};
```

---

#### **2.2. Actualizar `auth.service.js`**
```javascript
// Cambiar login para usar getUserWithPermissions
const user = await getUserWithPermissions(userId);

// Token incluye role (slug) y permissions
const token = generateToken({
  id: user.id,
  username: user.username,
  role: user.role,  // Slug del rol
  permissions: user.permissions
});
```

---

#### **2.3. Actualizar `middleware/roles.js`**
```javascript
// Opción A: Mantener middleware pero usar role_id
export const requireRole = (...allowedRoleSlugs) => {
  return async (req, res, next) => {
    const userRole = await getRoleSlug(req.user.role_id);
    if (!allowedRoleSlugs.includes(userRole)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    next();
  };
};

// Opción B: Deprecar y usar checkPermission
// (RECOMENDADO)
```

---

#### **2.4. Migrar servicios a RBAC**
```javascript
// services/users.service.js
// ANTES:
if (!hasPermission(user.role, 'VIEW_ALL_USERS')) {
  query = query.eq('id', user.id);
}

// DESPUÉS:
const canViewAll = await permissionsService.userCan(
  user.id, 
  'users', 
  'view', 
  'all'
);
if (!canViewAll) {
  query = query.eq('id', user.id);
}
```

---

### **FASE 3: Rutas (2 horas)**

#### **3.1. Migrar rutas de objectives**
```javascript
// routes/objectives.routes.js
// ANTES:
import { requireAdmin } from '../middleware/roles.js';
router.use(requireAdmin);

// DESPUÉS:
import { checkPermission } from '../middleware/permissions.js';
router.get('/', 
  authenticate,
  checkPermission('objectives', 'view', 'all'),
  objectivesController.getAllObjectives
);
```

---

#### **3.2. Migrar rutas de organizationalUnits**
```javascript
// Similar a objectives
```

---

#### **3.3. Migrar rutas de users**
```javascript
// Similar a objectives
```

---

### **FASE 4: Frontend (2 horas)**

#### **4.1. Actualizar `usePermissions.js`**
```javascript
// hooks/usePermissions.js
// ANTES:
if (user.role === USER_ROLES.SUPERADMIN) return true;

// DESPUÉS:
// El backend ya envía permissions en el token
const { permissions } = user;
const hasPermission = (resource, action, scope = 'all') => {
  const key = `${resource}.${action}.${scope}`;
  return permissions.includes(key);
};
```

---

#### **4.2. Actualizar `roleHelpers.js`**
```javascript
// utils/roleHelpers.js
// ANTES:
export const isSuperadmin = (user) => {
  return user.role === USER_ROLES.SUPERADMIN;
};

// DESPUÉS:
export const isSuperadmin = (user) => {
  return user.role?.slug === 'superadmin' || user.role === 'superadmin';
};
```

---

#### **4.3. Actualizar componentes**
```javascript
// components/ProtectedRoute.jsx
// ANTES:
if (!allowedRoles.includes(user.role)) { ... }

// DESPUÉS:
const userRoleSlug = user.role?.slug || user.role;
if (!allowedRoles.includes(userRoleSlug)) { ... }
```

---

### **FASE 5: Objectives RBAC (1 hora)**

#### **5.1. Crear permisos para objectives**
```sql
-- Ya están en 20260410_seed_rbac_data.sql
-- objectives.view.all
-- objectives.create.all
-- objectives.update.all
-- objectives.delete.all
```

#### **5.2. Actualizar rutas**
```javascript
// Ya cubierto en Fase 3.1
```

---

## ⏱️ **TIEMPO ESTIMADO TOTAL**

| Fase | Tiempo | Complejidad |
|------|--------|-------------|
| Fase 1: Base de Datos | 1 hora | 🟢 Baja |
| Fase 2: Backend Core | 3 horas | 🔴 Alta |
| Fase 3: Rutas | 2 horas | 🟡 Media |
| Fase 4: Frontend | 2 horas | 🟡 Media |
| Fase 5: Objectives | 1 hora | 🟢 Baja |
| **TOTAL** | **9 horas** | |

---

## 🚨 **RIESGOS Y MITIGACIONES**

### **Riesgo 1: Romper funcionalidad existente**
**Mitigación:** Usar vista `users_with_role` para compatibilidad.

### **Riesgo 2: Permisos mal configurados**
**Mitigación:** Probar exhaustivamente con cada rol.

### **Riesgo 3: Performance degradado**
**Mitigación:** Cachear permisos en JWT, usar índices en DB.

---

## ✅ **CHECKLIST DE MIGRACIÓN**

### **Base de Datos:**
- [ ] Crear vista `users_with_role`
- [ ] Actualizar queries backend
- [ ] Eliminar columna `role`
- [ ] Verificar que vista funciona

### **Backend:**
- [ ] Crear `rbac.helper.js`
- [ ] Actualizar `auth.service.js`
- [ ] Actualizar `users.service.js`
- [ ] Actualizar `timeEntries.service.js`
- [ ] Actualizar `objectives.service.js`
- [ ] Actualizar `organizationalUnits.service.js`
- [ ] Migrar rutas de objectives
- [ ] Migrar rutas de organizationalUnits
- [ ] Migrar rutas de users

### **Frontend:**
- [ ] Actualizar `usePermissions.js`
- [ ] Actualizar `roleHelpers.js`
- [ ] Actualizar `ProtectedRoute.jsx`
- [ ] Actualizar `UserManagement.jsx`
- [ ] Actualizar `BulkUserImport.jsx`

### **Testing:**
- [ ] Probar login con cada rol
- [ ] Probar CRUD de usuarios
- [ ] Probar CRUD de time entries
- [ ] Probar CRUD de objectives
- [ ] Probar CRUD de organizational units
- [ ] Probar permisos granulares
- [ ] Probar excepciones de usuario

---

## 🎯 **PRÓXIMOS PASOS**

**¿Qué quieres hacer?**

### **Opción A: Migración Rápida (Vista)**
- Crear vista `users_with_role`
- Actualizar queries
- Eliminar columna `role`
- **Tiempo:** 1 hora
- **Riesgo:** Bajo

### **Opción B: Migración Completa**
- Seguir plan de 9 horas
- Migrar TODO a RBAC
- **Tiempo:** 9 horas
- **Riesgo:** Medio

### **Opción C: Migración Gradual**
- Fase 1 ahora (vista)
- Fases 2-5 más adelante
- **Tiempo:** 1 hora ahora, 8 horas después
- **Riesgo:** Bajo

---

**¿Cuál opción prefieres?**
