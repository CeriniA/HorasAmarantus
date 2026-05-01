# 🔐 Sistema de Permisos y Control Visual

## 📊 Cómo Funciona el Sistema RBAC

### **1. Permisos se Asignan por ROL**

Los permisos están definidos en la base de datos y se asignan a roles mediante la migración `backend/migrations/20260410_seed_rbac_data.sql`.

**Estructura:**
```
Roles → Permisos → Recursos + Acciones + Alcance
```

**Ejemplo:**
```sql
-- OPERARIO tiene estos permisos:
INSERT INTO role_permissions (role_id, permission_id)
WHERE 
  (p.resource = 'objectives' AND p.action = 'view' AND p.scope = 'own') OR
  (p.resource = 'objectives' AND p.action = 'create' AND p.scope = 'personal') OR
  (p.resource = 'objectives' AND p.action = 'update' AND p.scope = 'own') OR
  (p.resource = 'objectives' AND p.action = 'delete' AND p.scope = 'own')
```

---

## 🎨 Control Visual según Permisos

### **Opción 1: Hook `usePermissions` (RECOMENDADO)** ⭐

**Ubicación:** `frontend/src/hooks/usePermissions.v2.js`

**Uso:**
```javascript
import { usePermissions } from '../hooks/usePermissions.v2';

const MyComponent = () => {
  const { 
    canViewAllObjectives,
    canCreatePersonalObjectives,
    canUpdateOwnObjectives,
    canDeleteOwnObjectives 
  } = usePermissions();

  return (
    <div>
      {/* Mostrar botón solo si tiene permiso */}
      {canCreatePersonalObjectives() && (
        <Button onClick={handleCreate}>Crear Objetivo Personal</Button>
      )}

      {/* Mostrar tab solo si tiene permiso */}
      {canViewAllObjectives() && (
        <Tab>Objetivos</Tab>
      )}
    </div>
  );
};
```

---

### **Opción 2: Verificación Manual con `userCan`**

```javascript
import { usePermissions } from '../hooks/usePermissions.v2';
import { RESOURCES, ACTIONS, SCOPES } from '../constants';

const MyComponent = () => {
  const { userCan } = usePermissions();

  return (
    <div>
      {/* Verificar permiso específico */}
      {userCan(RESOURCES.OBJECTIVES, ACTIONS.CREATE, 'personal') && (
        <Button>Crear Objetivo Personal</Button>
      )}

      {/* Verificar múltiples permisos */}
      {(userCan(RESOURCES.OBJECTIVES, ACTIONS.VIEW, SCOPES.ALL) ||
        userCan(RESOURCES.OBJECTIVES, ACTIONS.VIEW, SCOPES.TEAM)) && (
        <Tab>Objetivos del Equipo</Tab>
      )}
    </div>
  );
};
```

---

### **Opción 3: Helper de Roles (LEGACY - NO RECOMENDADO)**

```javascript
import { isAdminOrSuperadmin } from '../utils/roleHelpers';

// ❌ NO USAR - No es granular
{isAdminOrSuperadmin(user) && <Button>Admin Only</Button>}

// ✅ USAR - Basado en permisos
{canManageUsers() && <Button>Gestionar Usuarios</Button>}
```

---

## 📋 Funciones Disponibles en `usePermissions`

### **Permisos de Objetivos:**
- `canViewAllObjectives()` - Ver todos los objetivos
- `canViewTeamObjectives()` - Ver objetivos del equipo
- `canViewOwnObjectives()` - Ver objetivos propios
- `canManageCompanyObjectives()` - Crear objetivos de empresa
- `canAssignObjectives()` - Asignar objetivos a usuarios
- `canCreatePersonalObjectives()` - Crear objetivos personales
- `canUpdateOwnObjectives()` - Actualizar objetivos propios
- `canDeleteOwnObjectives()` - Eliminar objetivos propios

### **Permisos de Usuarios:**
- `canViewAllUsers()` - Ver todos los usuarios
- `canCreateUsers()` - Crear usuarios

### **Permisos de Registros de Tiempo:**
- `canViewAllTimeEntries()` - Ver todos los registros
- `canViewTeamTimeEntries()` - Ver registros del equipo

### **Permisos de Reportes:**
- `canViewReports()` - Ver reportes
- `canExportReports()` - Exportar reportes

### **Permisos de Unidades Organizacionales:**
- `canManageOrgUnits()` - Gestionar unidades

### **Permisos de Roles:**
- `canManageRoles()` - Gestionar roles y permisos

### **Verificadores de Rol:**
- `isSuperadmin()` - Es superadmin
- `isAdmin()` - Es admin
- `isSupervisor()` - Es supervisor
- `isTeamLead()` - Es team lead
- `isOperario()` - Es operario

---

## 🔧 Cómo Agregar Nuevos Permisos

### **1. Definir Permiso en la Base de Datos**

```sql
-- backend/migrations/YYYYMMDD_add_new_permission.sql
INSERT INTO permissions (resource, action, scope, description) VALUES
  ('mi_recurso', 'mi_accion', 'all', 'Descripción del permiso');
```

### **2. Asignar Permiso a Roles**

```sql
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE slug = 'operario'),
  p.id
FROM permissions p
WHERE 
  p.resource = 'mi_recurso' AND 
  p.action = 'mi_accion' AND 
  p.scope = 'own';
```

### **3. Agregar Función Helper en `usePermissions`**

```javascript
// frontend/src/hooks/usePermissions.v2.js

const canDoSomething = () => {
  return userCan('mi_recurso', 'mi_accion', 'own');
};

// Exportar en el return
return {
  // ...
  canDoSomething,
};
```

### **4. Usar en Componentes**

```javascript
const { canDoSomething } = usePermissions();

{canDoSomething() && <Button>Hacer Algo</Button>}
```

---

## ✅ Buenas Prácticas

### **DO ✅**
- Usar `usePermissions` para control visual
- Verificar permisos en el backend (doble validación)
- Crear funciones helper descriptivas (`canCreatePersonalObjectives`)
- Ocultar elementos que el usuario no puede usar

### **DON'T ❌**
- NO usar `isAdminOrSuperadmin` para permisos granulares
- NO hardcodear roles en componentes
- NO confiar solo en validación frontend
- NO mostrar botones/tabs que generarán errores 403

---

## 🎯 Ejemplos Completos

### **Ejemplo 1: Navbar con Permisos**

```javascript
import { usePermissions } from '../hooks/usePermissions.v2';

const Navbar = () => {
  const { 
    canViewAllObjectives,
    canViewOwnObjectives,
    isAdmin 
  } = usePermissions();

  return (
    <nav>
      {/* Todos ven Dashboard */}
      <Link to="/">Dashboard</Link>

      {/* Solo operarios ven Mis Objetivos */}
      {canViewOwnObjectives() && !isAdmin() && (
        <Link to="/my-objectives">Mis Objetivos</Link>
      )}

      {/* Solo admins ven Objetivos (gestión completa) */}
      {canViewAllObjectives() && (
        <Link to="/objectives">Objetivos</Link>
      )}
    </nav>
  );
};
```

### **Ejemplo 2: Botones Condicionales**

```javascript
const ObjectiveCard = ({ objective }) => {
  const { canUpdateOwnObjectives, canDeleteOwnObjectives } = usePermissions();

  return (
    <Card>
      <h3>{objective.name}</h3>

      <div className="actions">
        {canUpdateOwnObjectives() && (
          <Button onClick={() => handleEdit(objective)}>
            Editar
          </Button>
        )}

        {canDeleteOwnObjectives() && (
          <Button onClick={() => handleDelete(objective)}>
            Eliminar
          </Button>
        )}
      </div>
    </Card>
  );
};
```

### **Ejemplo 3: Tabs Condicionales**

```javascript
const Reports = () => {
  const { canViewAllObjectives } = usePermissions();

  return (
    <Tabs>
      <Tab>Resumen</Tab>
      
      {/* Solo mostrar si tiene permiso */}
      {canViewAllObjectives() && (
        <Tab>Objetivos</Tab>
      )}
      
      <Tab>Detalle</Tab>
    </Tabs>
  );
};
```

---

## 🔄 Flujo Completo de Permisos

```
1. Usuario inicia sesión
   ↓
2. Backend carga permisos del rol del usuario
   ↓
3. Permisos se guardan en user.permissions (array de strings)
   ↓
4. Frontend usa usePermissions para verificar permisos
   ↓
5. Componentes muestran/ocultan elementos según permisos
   ↓
6. Usuario intenta acción
   ↓
7. Backend valida permisos (middleware checkPermission)
   ↓
8. Si tiene permiso → Acción permitida
   Si NO tiene permiso → Error 403
```

---

## 📝 Resumen

- ✅ Los permisos se asignan por **ROL** en la base de datos
- ✅ El frontend usa el hook **`usePermissions`** para control visual
- ✅ El backend valida permisos con **middleware** (doble seguridad)
- ✅ Nunca confiar solo en validación frontend
- ✅ Usar funciones helper descriptivas
- ✅ Ocultar elementos que generarían errores 403

---

**Última actualización:** 2026-05-01
