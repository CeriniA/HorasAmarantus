# 🔐 Migración a Sistema de 3 Roles

## ✅ Cambios Implementados

### 📊 Sistema de Roles

**ANTES** (4 roles):
- superadmin ❌ (no existía)
- admin
- supervisor
- operario

**AHORA** (3 roles):
- **superadmin** ✅ (nuevo)
- **admin** ✅ (antes "supervisor")
- **operario** ✅

---

## 🎯 Matriz de Permisos

| Acción | Superadmin | Admin | Operario |
|--------|-----------|-------|----------|
| **Usuarios** |
| Crear SUPERADMIN | ✅ | ❌ | ❌ |
| Crear ADMIN | ✅ | ❌ | ❌ |
| Crear OPERARIO | ✅ | ✅ | ❌ |
| Editar cualquier usuario | ✅ | ❌ | ❌ |
| Editar OPERARIOS | ✅ | ✅ | ❌ |
| **Áreas/Procesos** |
| Crear/Editar/Eliminar | ✅ | ✅ | ❌ |
| **Registros de Tiempo** |
| Ver todos | ✅ | ✅ | ❌ |
| Ver propios | ✅ | ✅ | ✅ |
| Crear para otros | ✅ | ✅ | ❌ |
| **Reportes** |
| Ver todos | ✅ | ✅ | ❌ |
| Ver propios | ✅ | ✅ | ✅ |

---

## 🗄️ Cambios en Base de Datos

### Archivo de Migración

**Ubicación**: `supabase/migrations/003_update_roles_to_3.sql`

```sql
-- 1. Actualizar constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('superadmin', 'admin', 'operario'));

-- 2. Migrar supervisores → admin
UPDATE users SET role = 'admin' WHERE role = 'supervisor';

-- 3. Crear primer superadmin
UPDATE users SET role = 'superadmin' 
WHERE email = 'tu-email@ejemplo.com' LIMIT 1;
```

**⚠️ IMPORTANTE**: Cambiar `'tu-email@ejemplo.com'` por tu email real antes de ejecutar.

---

## 🔧 Cambios en Backend

### 1. Middleware de Roles (`middleware/roles.js`)

**Nuevas funciones**:
```javascript
// Verificar roles
export const requireSuperadmin = requireRole('superadmin');
export const requireAdmin = requireRole('superadmin', 'admin');
export const requireAnyAuth = requireRole('superadmin', 'admin', 'operario');

// Verificar permisos de gestión de usuarios
export const canManageUser = (req, res, next) => {
  const { role: userRole } = req.user;
  const { role: targetRole } = req.body;

  // Superadmin puede gestionar a todos
  if (userRole === 'superadmin') return next();

  // Admin NO puede crear/editar otros admins o superadmins
  if (userRole === 'admin') {
    if (targetRole === 'superadmin' || targetRole === 'admin') {
      return res.status(403).json({ 
        error: 'No puedes gestionar usuarios con rol admin o superadmin' 
      });
    }
    return next();
  }

  return res.status(403).json({ error: 'No tienes permisos' });
};
```

### 2. Validadores (`middleware/validators.js`)

**Actualizado**:
```javascript
body('role')
  .isIn(['superadmin', 'admin', 'operario'])  // ← Antes: 'supervisor'
  .withMessage('Rol inválido')
```

### 3. Rutas Actualizadas

#### `routes/users.js`
- ✅ GET `/` - Operarios ven solo su perfil, Admin/Superadmin ven todos
- ✅ POST `/` - Requiere `requireAdmin` + `canManageUser`
- ✅ PUT `/:id` - Solo Superadmin puede cambiar roles
- ✅ DELETE `/:id` - Requiere `requireAdmin`

#### `routes/organizationalUnits.js`
- ✅ POST `/` - Requiere `requireAdmin` (antes `requireAdminOrSupervisor`)
- ✅ PUT `/:id` - Requiere `requireAdmin`
- ✅ DELETE `/:id` - Requiere `requireAdmin`

#### `routes/timeEntries.js`
- ✅ GET `/` - Operarios ven solo sus registros, Admin/Superadmin ven todos
- ✅ Eliminada lógica de "supervisor ve su área"

---

## 🎨 Cambios en Frontend

### 1. Rutas Protegidas (`App.jsx`)

**Actualizado**:
```jsx
// Antes:
<ProtectedRoute allowedRoles={['admin', 'supervisor']}>

// Ahora:
<ProtectedRoute allowedRoles={['superadmin', 'admin']}>
```

**Rutas afectadas**:
- `/organizational-units` - Solo superadmin y admin
- `/reports` - Solo superadmin y admin

---

## 📋 Pasos para Aplicar la Migración

### 1. Ejecutar Migración en Supabase

```bash
# Opción A: Desde Supabase Dashboard
# - Ir a SQL Editor
# - Copiar contenido de supabase/migrations/003_update_roles_to_3.sql
# - CAMBIAR el email en la línea del superadmin
# - Ejecutar

# Opción B: Desde CLI (si tienes Supabase CLI)
supabase db push
```

### 2. Verificar Migración

```sql
-- Ver distribución de roles
SELECT 
  role, 
  COUNT(*) as cantidad,
  array_agg(email) as usuarios
FROM users
GROUP BY role
ORDER BY role;
```

**Resultado esperado**:
```
role        | cantidad | usuarios
------------|----------|------------------
superadmin  | 1        | {tu-email@...}
admin       | X        | {...}
operario    | Y        | {...}
```

### 3. Reiniciar Backend

```bash
cd backend
npm run dev
```

### 4. Reiniciar Frontend

```bash
cd frontend
npm run dev
```

### 5. Probar Permisos

1. **Login como Superadmin**:
   - ✅ Ver todos los usuarios
   - ✅ Crear admin
   - ✅ Crear operario
   - ✅ Ver/editar áreas y procesos
   - ✅ Ver todos los reportes

2. **Login como Admin**:
   - ✅ Ver todos los usuarios
   - ✅ Crear operarios
   - ❌ NO puede crear admins
   - ✅ Ver/editar áreas y procesos
   - ✅ Ver todos los reportes

3. **Login como Operario**:
   - ✅ Ver solo su perfil
   - ✅ Registrar sus horas
   - ❌ NO puede ver áreas/procesos
   - ❌ NO puede ver reportes globales

---

## ⚠️ Notas Importantes

### Migración de Datos

- ✅ Todos los usuarios con rol `'supervisor'` se convierten automáticamente en `'admin'`
- ✅ El primer superadmin se crea actualizando un usuario existente
- ✅ Si no existe ningún usuario, debes crear uno manualmente (ver comentario en migración)

### Compatibilidad

- ❌ **NO** es compatible hacia atrás con el sistema de 4 roles
- ✅ Todos los endpoints existentes siguen funcionando
- ✅ Los permisos son más restrictivos (más seguro)

### Próximos Pasos

1. ⏳ Crear página de gestión de usuarios (`/admin/users`)
2. ⏳ Mejorar sistema de reportes
3. ⏳ Agregar auditoría de cambios

---

## 🐛 Troubleshooting

### Error: "Rol inválido"
**Causa**: El frontend está enviando `'supervisor'`  
**Solución**: Limpiar localStorage y volver a hacer login

### Error: "No tienes permisos"
**Causa**: Tu usuario no tiene el rol correcto  
**Solución**: Verificar rol en base de datos:
```sql
SELECT email, role FROM users WHERE email = 'tu-email@ejemplo.com';
```

### No puedo crear admins
**Causa**: Solo superadmin puede crear admins  
**Solución**: Asegúrate de estar logueado como superadmin

---

## ✅ Checklist de Migración

- [ ] Ejecutar migración SQL en Supabase
- [ ] Cambiar email del superadmin en la migración
- [ ] Verificar que la migración se ejecutó correctamente
- [ ] Reiniciar backend
- [ ] Reiniciar frontend
- [ ] Limpiar localStorage del navegador
- [ ] Hacer login como superadmin
- [ ] Probar crear admin
- [ ] Probar crear operario
- [ ] Probar permisos de áreas/procesos
- [ ] Probar permisos de reportes

---

**Documentación completa**: `Mds/SISTEMA_PERMISOS_Y_REPORTES.md` 📚
