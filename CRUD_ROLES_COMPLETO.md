# 🔧 **CRUD COMPLETO DE ROLES - SUPERADMIN**

**Fecha:** 10 de Abril de 2026  
**Estado:** ✅ Backend completo | ⏳ Frontend UI pendiente

---

## ✅ **LO QUE YA ESTÁ HECHO**

### **Backend (100%)**

#### 1. Service - `backend/src/services/roles.service.js`
```javascript
✅ getAll() - Listar todos los roles
✅ getById(roleId) - Obtener rol por ID
✅ getRolePermissions(roleId) - Obtener permisos del rol
✅ create(roleData) - Crear nuevo rol
✅ update(roleId, roleData) - Actualizar rol
✅ deleteRole(roleId) - Eliminar rol
✅ assignPermission(roleId, permissionId) - Asignar permiso
✅ removePermission(roleId, permissionId) - Remover permiso
✅ setPermissions(roleId, permissionIds) - Actualizar todos los permisos
```

**Validaciones incluidas:**
- ✅ No permite editar/eliminar roles del sistema (`is_system = true`)
- ✅ No permite eliminar roles con usuarios asignados
- ✅ Verifica que el slug sea único
- ✅ Logs de auditoría

#### 2. Controller - `backend/src/controllers/roles.controller.js`
```javascript
✅ 9 endpoints implementados
✅ Manejo de errores con asyncHandler
✅ Respuestas HTTP correctas (201 para create, etc.)
```

#### 3. Routes - `backend/src/routes/roles.js`
```javascript
✅ GET    /api/roles
✅ GET    /api/roles/:id
✅ GET    /api/roles/:id/permissions
✅ POST   /api/roles (solo superadmin)
✅ PUT    /api/roles/:id (solo superadmin)
✅ DELETE /api/roles/:id (solo superadmin)
✅ POST   /api/roles/:id/permissions (solo superadmin)
✅ DELETE /api/roles/:id/permissions/:permissionId (solo superadmin)
✅ PUT    /api/roles/:id/permissions (solo superadmin)
```

**Seguridad:**
- ✅ Todas las rutas requieren autenticación
- ✅ Rutas de modificación requieren permiso `roles.manage.all` (solo superadmin)

### **Frontend (50%)**

#### 4. Servicios API - `frontend/src/services/api.js`
```javascript
✅ rolesService.getAll()
✅ rolesService.getById(id)
✅ rolesService.getPermissions(id)
✅ rolesService.create(data)
✅ rolesService.update(id, data)
✅ rolesService.delete(id)
✅ rolesService.assignPermission(id, permissionId)
✅ rolesService.removePermission(id, permissionId)
✅ rolesService.setPermissions(id, permissionIds)
```

#### 5. Hook - `frontend/src/hooks/useRoles.js`
```javascript
✅ useRoles() hook completo
✅ Gestión de estado (roles, permissions, loading, error)
✅ Métodos CRUD (create, update, delete)
✅ Gestión de permisos (getRolePermissions, setRolePermissions)
```

---

## ⏳ **LO QUE FALTA (UI Frontend)**

### **Componentes a crear:**

1. **`RoleManagement.jsx`** - Página principal
   - Lista de roles
   - Botón crear rol
   - Botones editar/eliminar por rol
   - Solo visible para superadmin

2. **`RoleFormModal.jsx`** - Modal crear/editar
   - Formulario con name, slug, description
   - Toggle is_active
   - Validaciones

3. **`PermissionMatrix.jsx`** - Matriz de permisos
   - Tabla visual de permisos
   - Checkboxes por permiso
   - Agrupado por recurso
   - Guardar cambios

---

## 📋 **ENDPOINTS DISPONIBLES**

### **Listar Roles**
```http
GET /api/roles
Authorization: Bearer {token}

Response:
{
  "roles": [
    {
      "id": "uuid",
      "name": "Administrador",
      "slug": "admin",
      "description": "...",
      "is_system": true,
      "is_active": true,
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```

### **Crear Rol**
```http
POST /api/roles
Authorization: Bearer {token_superadmin}
Content-Type: application/json

{
  "name": "Auditor",
  "slug": "auditor",
  "description": "Rol para auditores",
  "is_active": true
}

Response: 201 Created
{
  "role": { ... }
}
```

### **Actualizar Rol**
```http
PUT /api/roles/{roleId}
Authorization: Bearer {token_superadmin}
Content-Type: application/json

{
  "name": "Auditor Senior",
  "slug": "auditor_senior",
  "description": "...",
  "is_active": true
}

Response: 200 OK
{
  "role": { ... }
}
```

### **Eliminar Rol**
```http
DELETE /api/roles/{roleId}
Authorization: Bearer {token_superadmin}

Response: 200 OK
{
  "message": "Rol eliminado correctamente"
}

Error si tiene usuarios:
{
  "error": "No se puede eliminar el rol porque hay usuarios asignados"
}
```

### **Ver Permisos de Rol**
```http
GET /api/roles/{roleId}/permissions
Authorization: Bearer {token}

Response:
{
  "permissions": [
    {
      "id": "uuid",
      "resource": "users",
      "action": "view",
      "scope": "all",
      "description": "Ver todos los usuarios"
    }
  ]
}
```

### **Actualizar Permisos de Rol**
```http
PUT /api/roles/{roleId}/permissions
Authorization: Bearer {token_superadmin}
Content-Type: application/json

{
  "permissionIds": [
    "permission-uuid-1",
    "permission-uuid-2",
    "permission-uuid-3"
  ]
}

Response: 200 OK
{
  "message": "Permisos actualizados correctamente"
}
```

---

## 🧪 **CÓMO PROBAR**

### **1. Crear un rol nuevo**
```bash
# En Postman/Thunder Client
POST http://localhost:3001/api/roles
Authorization: Bearer {tu_token_superadmin}
Content-Type: application/json

{
  "name": "Auditor",
  "slug": "auditor",
  "description": "Puede ver reportes pero no modificar",
  "is_active": true
}
```

### **2. Asignar permisos al rol**
```bash
# Primero obtener IDs de permisos
GET http://localhost:3001/api/permissions

# Luego asignar permisos
PUT http://localhost:3001/api/roles/{roleId}/permissions
{
  "permissionIds": [
    "id-permiso-reports-view-all",
    "id-permiso-reports-export-all"
  ]
}
```

### **3. Verificar permisos**
```bash
GET http://localhost:3001/api/roles/{roleId}/permissions
```

### **4. Asignar rol a usuario**
```bash
# Actualizar usuario con nuevo role_id
PUT http://localhost:3001/api/users/{userId}
{
  "role_id": "{roleId}"
}
```

---

## 🎯 **PRÓXIMOS PASOS**

### **Opción 1: Crear UI completa (recomendado)**
1. Crear página `RoleManagement.jsx`
2. Crear modal `RoleFormModal.jsx`
3. Crear componente `PermissionMatrix.jsx`
4. Agregar ruta en `App.jsx`

### **Opción 2: Usar solo API (más rápido)**
1. Gestionar roles desde Postman/Thunder Client
2. Modificar permisos directamente en DB cuando sea necesario
3. Continuar con otras funcionalidades

---

## 📝 **EJEMPLO DE USO COMPLETO**

### **Escenario: Crear rol "Auditor"**

```javascript
// 1. Crear el rol
const newRole = await rolesService.create({
  name: 'Auditor',
  slug: 'auditor',
  description: 'Puede ver y exportar reportes',
  is_active: true
});

// 2. Obtener permisos disponibles
const { permissions } = await permissionsService.getAll();

// 3. Filtrar permisos de reportes
const reportPermissions = permissions.filter(p => 
  p.resource === 'reports' && 
  (p.action === 'view' || p.action === 'export')
);

// 4. Asignar permisos al rol
await rolesService.setPermissions(
  newRole.role.id,
  reportPermissions.map(p => p.id)
);

// 5. Asignar rol a un usuario
await usersService.update(userId, {
  role_id: newRole.role.id
});
```

---

## ⚠️ **RESTRICCIONES IMPORTANTES**

### **No se puede:**
- ❌ Editar roles del sistema (`is_system = true`)
- ❌ Eliminar roles del sistema
- ❌ Eliminar roles con usuarios asignados
- ❌ Crear roles con slug duplicado

### **Solo superadmin puede:**
- ✅ Crear roles
- ✅ Editar roles
- ✅ Eliminar roles
- ✅ Modificar permisos de roles

---

## 📊 **ESTRUCTURA DE DATOS**

### **Rol (roles table)**
```typescript
{
  id: UUID,
  name: string,              // "Administrador"
  slug: string,              // "admin" (único)
  description: string | null,
  is_system: boolean,        // true = no se puede eliminar
  is_active: boolean,        // true = activo
  created_at: timestamp,
  updated_at: timestamp
}
```

### **Permiso (permissions table)**
```typescript
{
  id: UUID,
  resource: string,          // "users", "reports", etc.
  action: string,            // "view", "create", etc.
  scope: string,             // "all", "team", "own"
  description: string | null,
  created_at: timestamp
}
```

### **Relación Rol-Permiso (role_permissions table)**
```typescript
{
  id: UUID,
  role_id: UUID,             // FK a roles
  permission_id: UUID,       // FK a permissions
  created_at: timestamp
}
```

---

## 🔍 **CONSULTA PARA VER ESTRUCTURA DE TU DB**

He creado el archivo: `backend/migrations/QUERY_ANALIZAR_ESTRUCTURA_DB.sql`

**Cópialo y ejecútalo en Supabase SQL Editor** para ver:
- ✅ Todas las tablas
- ✅ Columnas de cada tabla con tipos
- ✅ Primary Keys y Foreign Keys
- ✅ Índices
- ✅ Constraints
- ✅ Tamaño de tablas

Luego pégame el resultado y te digo qué campos sobran.

---

**Estado:** ✅ Backend 100% funcional | ⏳ Frontend UI pendiente  
**Última actualización:** 10 de Abril de 2026
