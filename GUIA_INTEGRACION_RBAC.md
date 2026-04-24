# 🔧 **GUÍA DE INTEGRACIÓN RBAC - PASO A PASO**

**Fecha:** 10 de Abril de 2026  
**Estado:** Lista para ejecutar

---

## ✅ **LO QUE YA ESTÁ HECHO**

### Backend (100%)
- ✅ Migraciones SQL creadas (`20260410_create_rbac_system.sql` y `20260410_seed_rbac_data.sql`)
- ✅ Servicios (`permissions.service.js`)
- ✅ Middleware (`permissions.js`)
- ✅ Controladores (`roles.controller.js`, `permissions.controller.js`)
- ✅ Rutas (`roles.js`, `permissions.js`)
- ✅ Rutas actualizadas (`users.js`, `timeEntries.js`)
- ✅ Constantes actualizadas (`constants.js`)

### Frontend (100%)
- ✅ Constantes actualizadas (`constants/index.js`)
- ✅ Servicios API (`api.js` - rolesService, permissionsService)
- ✅ Hook RBAC (`usePermissions.js` - reemplazado con versión RBAC)
- ✅ Auth actualizado (`useAuth.js` - carga permisos automáticamente)

---

## 📋 **PASOS PARA INTEGRAR**

### **PASO 1: Ejecutar Migraciones en Supabase** ⚡

#### 1.1 Abrir Supabase SQL Editor
1. Ve a https://supabase.com
2. Selecciona tu proyecto
3. Click en **"SQL Editor"** en el menú lateral izquierdo

#### 1.2 Ejecutar Primera Migración (Crear Tablas)
1. Abre el archivo: `backend/migrations/20260410_create_rbac_system.sql`
2. Selecciona **TODO** el contenido (Ctrl+A)
3. Copia (Ctrl+C)
4. Pega en el SQL Editor de Supabase
5. Click en el botón **"Run"** (o F5)
6. Espera a que termine (verás mensajes de éxito)

**Resultado esperado:**
```
✅ Tablas RBAC creadas exitosamente
Tablas: roles, permissions, role_permissions, user_permissions
Funciones: user_has_permission
Vistas: user_permissions_view
```

#### 1.3 Ejecutar Segunda Migración (Insertar Datos)
1. Abre el archivo: `backend/migrations/20260410_seed_rbac_data.sql`
2. Selecciona **TODO** el contenido (Ctrl+A)
3. Copia (Ctrl+C)
4. Pega en el SQL Editor de Supabase
5. Click en el botón **"Run"** (o F5)
6. Espera a que termine (verás estadísticas)

**Resultado esperado:**
```
✅ Datos RBAC insertados exitosamente
Roles creados: 5
Permisos creados: 70+
Asignaciones: Completadas
Usuarios migrados: Todos
```

#### 1.4 Verificar Migración
Copia y ejecuta este SQL en Supabase para verificar:

```sql
-- Verificar roles
SELECT * FROM roles ORDER BY name;

-- Verificar cantidad de permisos
SELECT COUNT(*) as total_permisos FROM permissions;

-- Verificar permisos de admin
SELECT p.resource, p.action, p.scope, p.description
FROM roles r
JOIN role_permissions rp ON rp.role_id = r.id
JOIN permissions p ON p.id = rp.permission_id
WHERE r.slug = 'admin'
ORDER BY p.resource, p.action, p.scope;

-- Verificar usuarios migrados
SELECT username, role, role_id FROM users;
```

**Resultado esperado:**
- 5 roles (superadmin, admin, supervisor, team_lead, operario)
- 70+ permisos
- Todos los usuarios con `role_id` asignado

---

### **PASO 2: Reiniciar Backend** 🔄

```bash
# Detener el servidor si está corriendo (Ctrl+C)

# Reiniciar
cd backend
npm run dev
```

**Verificar que inicie sin errores:**
```
✅ Server running on port 3001
✅ Database connected
```

---

### **PASO 3: Probar Login y Permisos** 🧪

#### 3.1 Hacer Login
```bash
# En Postman, Thunder Client o similar
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "username": "tu_usuario",
  "password": "tu_password"
}
```

**Respuesta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "...",
    "email": "...",
    "role": "admin",
    "role_id": "..."
  }
}
```

#### 3.2 Verificar Permisos Cargados
```bash
GET http://localhost:3001/api/permissions/me
Authorization: Bearer {tu_token}
```

**Respuesta esperada:**
```json
{
  "permissions": [
    "users.view.all",
    "users.create.all",
    "users.update.all",
    "time_entries.view.all",
    "time_entries.create.all",
    ...
  ],
  "role": {
    "id": "...",
    "name": "Administrador",
    "slug": "admin"
  }
}
```

#### 3.3 Probar Endpoint Protegido
```bash
# Como admin - debería funcionar
GET http://localhost:3001/api/users
Authorization: Bearer {token_admin}
# ✅ 200 OK - Lista de usuarios

# Como operario - debería fallar
GET http://localhost:3001/api/users
Authorization: Bearer {token_operario}
# ❌ 403 Forbidden
```

---

### **PASO 4: Probar Frontend** 🎨

#### 4.1 Reiniciar Frontend
```bash
# Detener si está corriendo (Ctrl+C)

cd frontend
npm run dev
```

#### 4.2 Hacer Login en la Aplicación
1. Abre http://localhost:5173
2. Ingresa credenciales
3. Verifica que cargue el dashboard

#### 4.3 Verificar Permisos en Consola
Abre la consola del navegador (F12) y ejecuta:

```javascript
// Ver usuario actual
console.log('User:', window.localStorage.getItem('auth_token'));

// Decodificar token (solo para debug)
const token = window.localStorage.getItem('auth_token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token payload:', payload);
```

#### 4.4 Verificar UI según Rol

**Como Admin:**
- ✅ Debería ver botón "Crear Usuario"
- ✅ Debería ver todos los usuarios
- ✅ Debería ver todos los registros de tiempo
- ✅ Debería ver botones de editar/eliminar

**Como Operario:**
- ❌ NO debería ver botón "Crear Usuario"
- ❌ NO debería ver otros usuarios
- ✅ Debería ver solo sus propios registros
- ✅ Debería poder crear sus propios registros

---

### **PASO 5: Actualizar Componentes Existentes (OPCIONAL)** 🔧

Los componentes actuales seguirán funcionando porque el nuevo `usePermissions` es compatible. Pero puedes mejorarlos usando los nuevos shortcuts:

#### Ejemplo: UserManagement.jsx

**Antes:**
```javascript
const { can, isAdmin } = usePermissions();

if (can('create', 'users')) {
  // Mostrar botón
}
```

**Después (mejorado):**
```javascript
const { canCreateUsers, canViewAllUsers } = usePermissions();

if (canCreateUsers()) {
  // Mostrar botón
}
```

---

## 🔍 **TROUBLESHOOTING**

### Error: "user.permissions is undefined"

**Causa:** El usuario no tiene permisos cargados.

**Solución:**
1. Verificar que ejecutaste las migraciones
2. Hacer logout y volver a hacer login
3. Verificar que `useAuth.js` carga permisos (ya está actualizado)

### Error: "403 Forbidden" en todas las rutas

**Causa:** Las migraciones no se ejecutaron correctamente.

**Solución:**
1. Verificar en Supabase que existen las tablas `roles`, `permissions`, etc.
2. Ejecutar query de verificación (Paso 1.4)
3. Re-ejecutar migraciones si es necesario

### Error: "Cannot find module '../middleware/permissions.js'"

**Causa:** El archivo no existe o la ruta es incorrecta.

**Solución:**
1. Verificar que existe `backend/src/middleware/permissions.js`
2. Verificar que el backend se reinició después de crear el archivo

### Frontend no muestra botones según permisos

**Causa:** El hook usePermissions no está usando la versión RBAC.

**Solución:**
1. Verificar que `frontend/src/hooks/usePermissions.js` tiene la versión RBAC
2. Verificar que importa `RESOURCES`, `ACTIONS`, `SCOPES`
3. Hacer hard refresh (Ctrl+Shift+R)

---

## 📊 **VERIFICACIÓN FINAL**

### Checklist Backend
```bash
□ Migraciones ejecutadas en Supabase
□ Backend reiniciado sin errores
□ Login devuelve token
□ GET /api/permissions/me devuelve permisos
□ Endpoints protegidos funcionan según rol
□ Admin puede acceder a /api/users
□ Operario recibe 403 en /api/users
```

### Checklist Frontend
```bash
□ Frontend reiniciado
□ Login funciona correctamente
□ Usuario tiene permisos en user.permissions[]
□ Botones se muestran/ocultan según permisos
□ Admin ve todos los usuarios
□ Operario solo ve sus propios datos
```

---

## 🎯 **PRÓXIMOS PASOS**

Una vez que todo funcione:

1. **Eliminar archivos obsoletos:**
   ```bash
   rm frontend/src/hooks/usePermissions.v2.js
   rm backend/src/middleware/roles.js (si ya no se usa)
   ```

2. **Actualizar otros componentes** para usar shortcuts de permisos

3. **Crear UI de gestión de roles** (opcional, para admins)

4. **Continuar con sistema de objetivos** o siguiente funcionalidad

---

## 📞 **SOPORTE**

Si algo no funciona:
1. Revisar logs del backend (consola donde corre `npm run dev`)
2. Revisar consola del navegador (F12)
3. Verificar que las migraciones se ejecutaron correctamente
4. Consultar `MANUAL_PROYECTO_COMPLETO.md` sección 5 (Sistema RBAC)

---

**Última actualización:** 10 de Abril de 2026  
**Estado:** ✅ Listo para ejecutar
