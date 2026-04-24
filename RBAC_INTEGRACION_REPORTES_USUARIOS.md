# 🔄 **INTEGRACIÓN RBAC EN REPORTES Y USUARIOS**

**Fecha:** 10 de Abril de 2026

---

## 📊 **1. REPORTES - CÓMO FUNCIONA**

### **Permisos Definidos**

```
reports.view.all   → Ver reportes de todos los usuarios
reports.view.team  → Ver reportes de su equipo/área
reports.view.own   → Ver solo sus propios reportes
reports.export.all → Exportar reportes de todos
reports.export.team → Exportar reportes de su equipo
```

### **Asignación por Rol**

| Rol | Permisos de Reportes |
|-----|---------------------|
| **Superadmin** | `reports.view.all`, `reports.export.all` |
| **Admin** | `reports.view.all`, `reports.export.all` |
| **Supervisor** | `reports.view.team`, `reports.export.team` |
| **Team Lead** | `reports.view.team` |
| **Operario** | `reports.view.own` |

### **Backend - Rutas Actualizadas**

#### Antes (verificación manual de roles):
```javascript
// ❌ ANTIGUO
router.get('/summary', async (req, res) => {
  const { role, id: currentUserId } = req.user;
  
  if (role === USER_ROLES.OPERARIO) {
    query = query.eq('user_id', currentUserId);
  } else {
    // Admin puede ver todos
  }
});
```

#### Después (RBAC granular):
```javascript
// ✅ NUEVO
router.get('/summary', 
  checkAnyPermission([
    { resource: 'reports', action: 'view', scope: 'all' },
    { resource: 'reports', action: 'view', scope: 'team' },
    { resource: 'reports', action: 'view', scope: 'own' }
  ]),
  async (req, res) => {
    const { id: currentUserId } = req.user;
    
    // Verificar permisos específicos
    const canViewAll = await permissionsService.userCan(currentUserId, 'reports', 'view', 'all');
    const canViewTeam = await permissionsService.userCan(currentUserId, 'reports', 'view', 'team');
    
    if (!canViewAll && !canViewTeam) {
      // Solo sus propios reportes
      query = query.eq('user_id', currentUserId);
    } else if (canViewTeam && !canViewAll) {
      // Reportes de su equipo
      query = query.eq('organizational_unit_id', currentUser.organizational_unit_id);
    } else {
      // Todos los reportes (puede filtrar por user_id)
      if (user_id) {
        query = query.eq('user_id', user_id);
      }
    }
  }
);
```

### **Ventajas del Nuevo Sistema**

✅ **Granularidad:** Supervisor puede ver reportes de su equipo sin ver todos  
✅ **Flexibilidad:** Se pueden crear roles personalizados (ej: "Auditor" con `reports.view.all` pero sin otros permisos)  
✅ **Excepciones:** Se puede dar permiso especial a un operario para ver reportes de su equipo  
✅ **Mantenibilidad:** Cambiar permisos no requiere modificar código

### **Frontend - Uso en Componentes**

```javascript
import { usePermissions } from '../hooks/usePermissions';

const Reports = () => {
  const { canViewReports, canExportReports, userCan } = usePermissions();
  
  // Verificar si puede ver reportes
  if (!canViewReports()) {
    return <div>No tienes permiso para ver reportes</div>;
  }
  
  return (
    <div>
      <h1>Reportes</h1>
      
      {/* Mostrar filtro de usuarios solo si puede ver todos */}
      {userCan('reports', 'view', 'all') && (
        <UserFilter />
      )}
      
      {/* Mostrar botón de exportar según permisos */}
      {canExportReports() && (
        <Button onClick={handleExport}>Exportar</Button>
      )}
    </div>
  );
};
```

---

## 👥 **2. USUARIOS - CÓMO FUNCIONA**

### **Permisos Definidos**

```
users.view.all     → Ver todos los usuarios
users.view.team    → Ver usuarios de su equipo
users.view.own     → Ver solo su propio perfil
users.create.all   → Crear nuevos usuarios
users.update.all   → Editar cualquier usuario
users.update.team  → Editar usuarios de su equipo
users.update.own   → Editar su propio perfil
users.delete.all   → Eliminar usuarios
users.activate.all → Activar/desactivar usuarios
```

### **Asignación por Rol**

| Rol | Permisos de Usuarios |
|-----|---------------------|
| **Superadmin** | Todos los permisos |
| **Admin** | `view.all`, `create.all`, `update.all`, `delete.all`, `activate.all` |
| **Supervisor** | `view.team`, `update.team` |
| **Team Lead** | `view.team` |
| **Operario** | `view.own`, `update.own` |

### **Backend - Rutas Actualizadas**

#### GET /api/users (Ver usuarios)
```javascript
// ✅ NUEVO
router.get('/', usersController.getAll);

// En el controller/service se filtra según permisos:
// - users.view.all → Todos los usuarios
// - users.view.team → Solo usuarios de su equipo
// - users.view.own → Solo su propio perfil
```

#### POST /api/users (Crear usuario)
```javascript
// ✅ NUEVO
router.post('/', 
  checkPermission('users', 'create', 'all'),
  validateCreateUser, 
  usersController.create
);

// Solo usuarios con permiso users.create.all pueden crear
```

#### PUT /api/users/:id (Actualizar usuario)
```javascript
// ✅ NUEVO
router.put('/:id', 
  checkResourceAccess('users', 'update', async (req) => {
    return await usersService.getById(req.params.id);
  }),
  validateUpdateUser, 
  usersController.update
);

// Verifica:
// 1. Si tiene users.update.all → Puede editar a cualquiera
// 2. Si tiene users.update.team → Solo usuarios de su equipo
// 3. Si tiene users.update.own → Solo si es su propio perfil
```

#### DELETE /api/users/:id (Eliminar usuario)
```javascript
// ✅ NUEVO
router.delete('/:id', 
  checkPermission('users', 'delete', 'all'),
  usersController.deleteUser
);

// Solo usuarios con permiso users.delete.all pueden eliminar
```

### **Frontend - Uso en Componentes**

#### UserManagement.jsx
```javascript
import { usePermissions } from '../hooks/usePermissions';

const UserManagement = () => {
  const { 
    canViewAllUsers, 
    canCreateUsers, 
    can 
  } = usePermissions();
  
  // Cargar usuarios (el backend filtra según permisos)
  const { users } = useUsers();
  
  return (
    <div>
      <h1>Gestión de Usuarios</h1>
      
      {/* Botón crear solo si tiene permiso */}
      {canCreateUsers() && (
        <Button onClick={handleCreate}>Crear Usuario</Button>
      )}
      
      {/* Lista de usuarios */}
      {users.map(user => (
        <UserRow 
          key={user.id}
          user={user}
          // Mostrar botones según permisos
          canEdit={can('edit', 'users', user)}
          canDelete={can('delete', 'users', user)}
        />
      ))}
    </div>
  );
};
```

#### UserRow Component
```javascript
const UserRow = ({ user, canEdit, canDelete }) => {
  return (
    <tr>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>
        {canEdit && (
          <Button onClick={() => handleEdit(user)}>Editar</Button>
        )}
        {canDelete && (
          <Button onClick={() => handleDelete(user)}>Eliminar</Button>
        )}
      </td>
    </tr>
  );
};
```

---

## 🔄 **3. FLUJO COMPLETO DE VERIFICACIÓN**

### **Ejemplo: Supervisor intenta ver usuarios**

#### 1. Frontend hace request
```javascript
// UserManagement.jsx
const { users } = useUsers(); // Llama a GET /api/users
```

#### 2. Backend recibe request
```javascript
// routes/users.js
router.get('/', usersController.getAll);
// No hay middleware de permisos aquí porque el filtrado se hace en el service
```

#### 3. Service verifica permisos
```javascript
// services/users.service.js
const getAll = async (user) => {
  let query = supabase.from('users').select('*');
  
  // Verificar permisos
  const canViewAll = await permissionsService.userCan(user.id, 'users', 'view', 'all');
  const canViewTeam = await permissionsService.userCan(user.id, 'users', 'view', 'team');
  
  if (!canViewAll && !canViewTeam) {
    // Solo su propio perfil
    query = query.eq('id', user.id);
  } else if (canViewTeam && !canViewAll) {
    // Solo usuarios de su equipo
    query = query.eq('organizational_unit_id', user.organizational_unit_id);
  }
  // Si canViewAll, no filtra nada
  
  return await query;
};
```

#### 4. Frontend recibe datos filtrados
```javascript
// Hook useUsers
const users = await usersService.getAll();
// Supervisor recibe solo usuarios de su equipo
```

#### 5. Frontend muestra UI según permisos
```javascript
// UserManagement.jsx
{canCreateUsers() && <Button>Crear</Button>}
// Supervisor NO ve este botón (no tiene users.create.all)

{can('edit', 'users', user) && <Button>Editar</Button>}
// Supervisor SÍ ve este botón para usuarios de su equipo
```

---

## 📋 **4. RESUMEN DE CAMBIOS**

### **Backend**

| Archivo | Cambio | Descripción |
|---------|--------|-------------|
| `routes/users.js` | ✅ Actualizado | Usa `checkPermission` y `checkResourceAccess` |
| `routes/timeEntries.js` | ✅ Actualizado | Usa `checkAnyPermission` |
| `routes/reports.js` | ✅ Actualizado | Usa `checkAnyPermission` y verifica permisos en lógica |
| `services/users.service.js` | ⏳ Pendiente | Debe usar `permissionsService.userCan` para filtrar |
| `services/timeEntries.service.js` | ⏳ Pendiente | Debe usar `permissionsService.userCan` para filtrar |

### **Frontend**

| Archivo | Cambio | Descripción |
|---------|--------|-------------|
| `hooks/usePermissions.js` | ✅ Actualizado | Versión RBAC completa |
| `hooks/useAuth.js` | ✅ Actualizado | Carga permisos automáticamente |
| `pages/UserManagement.jsx` | ⏳ Pendiente | Debe usar nuevos shortcuts |
| `pages/Reports.jsx` | ⏳ Pendiente | Debe usar `canViewReports()` |
| `pages/TimeEntries.jsx` | ⏳ Pendiente | Debe usar `canViewAllTimeEntries()` |

---

## 🎯 **5. PRÓXIMOS PASOS**

### **Actualizar Services del Backend**

Necesitas actualizar los services para que usen `permissionsService.userCan` en lugar de verificar roles directamente:

```javascript
// ❌ ANTES
if (user.role === USER_ROLES.ADMIN) {
  // ...
}

// ✅ DESPUÉS
const canViewAll = await permissionsService.userCan(user.id, 'users', 'view', 'all');
if (canViewAll) {
  // ...
}
```

### **Actualizar Componentes del Frontend**

Reemplazar verificaciones manuales por shortcuts:

```javascript
// ❌ ANTES
if (isAdmin() || isSuperadmin()) {
  // ...
}

// ✅ DESPUÉS
if (canViewAllUsers()) {
  // ...
}
```

---

**Última actualización:** 10 de Abril de 2026  
**Estado:** Rutas actualizadas, services pendientes
