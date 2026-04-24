# 🔄 **MIGRACIÓN: De `user.role` a `user.role_id`**

**Fecha:** 10 de Abril de 2026  
**Estado:** 📋 **PLAN DE MIGRACIÓN**

---

## ⚠️ **PROBLEMA DETECTADO**

Actualmente tienes **DOS campos** en la tabla `users`:

1. **`role`** (VARCHAR) - Campo VIEJO del sistema antiguo
2. **`role_id`** (UUID) - Campo NUEVO del sistema RBAC

**Esto es REDUNDANTE** y el código actual usa `user.role` en muchos lugares.

---

## 📊 **ANÁLISIS DE USO**

### **Backend usa `user.role` en:**
- ✅ `services/users.service.js` (7 usos)
- ✅ `services/timeEntries.service.js` (5 usos)
- ✅ `services/auth.service.js` (3 usos)
- ✅ `services/permissions.service.js` (2 usos)
- ✅ `middleware/roles.js` (2 usos)

### **Frontend usa `user.role` en:**
- ✅ `utils/roleHelpers.js` (6 funciones)
- ✅ `hooks/usePermissions.js` (2 usos)
- ✅ `pages/UserManagement.jsx` (3 usos)
- ✅ `components/users/BulkUserImport.jsx` (4 usos)
- ✅ `components/ProtectedRoute.jsx` (1 uso)

**Total:** ~30+ referencias a `user.role`

---

## 🎯 **ESTRATEGIA DE MIGRACIÓN**

### **Opción A: Migración Gradual (RECOMENDADA)**
1. Agregar campo virtual `role` que lee desde `role_id`
2. El código sigue funcionando sin cambios
3. Eventualmente refactorizar código para usar `role_id`

### **Opción B: Migración Inmediata**
1. Refactorizar TODO el código para usar `role_id`
2. Eliminar columna `role`
3. Más trabajo pero más limpio

---

## ✅ **OPCIÓN A: MIGRACIÓN CON CAMPO VIRTUAL (RECOMENDADA)**

### **Ventajas:**
- ✅ No requiere cambiar código
- ✅ Migración transparente
- ✅ Sin riesgo de romper funcionalidad
- ✅ Se puede hacer en 5 minutos

### **Cómo funciona:**

#### **1. Crear vista con campo virtual `role`**
```sql
-- Crear vista que incluye role como slug del rol
CREATE OR REPLACE VIEW users_with_role AS
SELECT 
  u.*,
  r.slug as role  -- Campo virtual que mapea role_id → slug
FROM users u
LEFT JOIN roles r ON u.role_id = r.id;

-- Comentario
COMMENT ON VIEW users_with_role IS 
'Vista de usuarios con campo virtual role para compatibilidad con código legacy';
```

#### **2. Actualizar backend para usar vista**
```javascript
// En services/users.service.js
const { data, error } = await supabase
  .from('users_with_role')  // ← Usar vista en lugar de tabla
  .select('*')
  .eq('is_active', true);
```

#### **3. El código sigue funcionando igual**
```javascript
// Esto sigue funcionando sin cambios
if (user.role === 'superadmin') {
  // ...
}
```

---

## 🔧 **OPCIÓN B: REFACTORIZACIÓN COMPLETA**

### **Ventajas:**
- ✅ Código más limpio
- ✅ Elimina redundancia completamente
- ✅ Usa sistema RBAC correctamente

### **Desventajas:**
- ❌ Requiere cambiar ~30+ archivos
- ❌ Alto riesgo de bugs
- ❌ Mucho trabajo

### **Archivos a modificar:**

#### **Backend:**
```javascript
// ANTES
if (user.role === 'superadmin') { ... }

// DESPUÉS
const userRole = await getRoleById(user.role_id);
if (userRole.slug === 'superadmin') { ... }

// O mejor aún, usar permisos:
if (await hasPermission(user.id, 'users.manage.all')) { ... }
```

#### **Frontend:**
```javascript
// ANTES
if (user.role === 'superadmin') { ... }

// DESPUÉS
if (user.role?.slug === 'superadmin') { ... }

// O mejor:
const { isSuperadmin } = usePermissions();
if (isSuperadmin) { ... }
```

---

## 🚀 **RECOMENDACIÓN: OPCIÓN A (VISTA)**

### **Por qué:**
1. ✅ **Cero cambios de código** - Todo sigue funcionando
2. ✅ **Migración rápida** - 5 minutos
3. ✅ **Sin riesgos** - No rompe nada
4. ✅ **Elimina redundancia** - Podemos borrar columna `role`

### **Cómo ejecutar:**

#### **Paso 1: Crear vista**
```sql
-- Archivo: backend/migrations/20260410_crear_vista_users_with_role.sql

-- Crear vista con campo virtual 'role'
CREATE OR REPLACE VIEW users_with_role AS
SELECT 
  u.id,
  u.username,
  u.email,
  u.name,
  u.organizational_unit_id,
  u.is_active,
  u.weekly_goal,
  u.created_at,
  u.updated_at,
  u.role_id,
  r.slug as role  -- Campo virtual desde roles.slug
FROM users u
LEFT JOIN roles r ON u.role_id = r.id;

-- Comentario
COMMENT ON VIEW users_with_role IS 
'Vista de usuarios con campo virtual role para compatibilidad con código legacy. El campo role mapea role_id → roles.slug';

-- Verificar
SELECT id, username, role_id, role FROM users_with_role LIMIT 5;
```

#### **Paso 2: Actualizar queries del backend**
```javascript
// En TODOS los archivos que hacen queries a 'users':

// ANTES
.from('users')

// DESPUÉS
.from('users_with_role')

// Archivos a actualizar:
// - services/users.service.js
// - services/auth.service.js
// - services/timeEntries.service.js
// - services/permissions.service.js
// - controllers/users.controller.js
```

#### **Paso 3: Eliminar columna `role` de tabla `users`**
```sql
-- Ahora SÍ podemos eliminar la columna redundante
ALTER TABLE users DROP COLUMN IF EXISTS role;

-- Verificar que la vista sigue funcionando
SELECT id, username, role FROM users_with_role LIMIT 5;
```

---

## 📋 **PLAN DE EJECUCIÓN (OPCIÓN A)**

### **Tiempo estimado:** 30 minutos

1. **[5 min]** Crear vista `users_with_role`
2. **[15 min]** Actualizar backend para usar vista
3. **[5 min]** Probar que todo funciona
4. **[2 min]** Eliminar columna `role`
5. **[3 min]** Verificar que todo sigue funcionando

---

## 📝 **ARCHIVOS A MODIFICAR (OPCIÓN A)**

### **Backend:**
```
✅ services/users.service.js
✅ services/auth.service.js
✅ services/timeEntries.service.js
✅ services/permissions.service.js
✅ controllers/users.controller.js

Cambio en todos:
- .from('users') → .from('users_with_role')
```

### **Frontend:**
```
❌ NO requiere cambios
El frontend recibe el objeto user con campo 'role' desde el backend
```

---

## ⚠️ **CONSIDERACIONES**

### **1. RLS (Row Level Security)**
Si tienes políticas RLS en tabla `users`, debes:
- Mantener políticas en tabla `users`
- La vista heredará las políticas

### **2. Inserts/Updates**
Las vistas NO permiten INSERT/UPDATE directamente.
Debes seguir usando tabla `users` para modificaciones:

```javascript
// Para SELECT (lectura)
.from('users_with_role')

// Para INSERT/UPDATE/DELETE (escritura)
.from('users')
```

### **3. Migraciones futuras**
Cuando crees nuevos usuarios, solo necesitas:
```javascript
const { data, error } = await supabase
  .from('users')
  .insert({
    username: 'nuevo',
    role_id: 'uuid-del-rol'  // Solo role_id, NO role
  });
```

---

## 🎯 **DECISIÓN**

**¿Qué opción prefieres?**

### **Opción A: Vista (RÁPIDO)**
- ✅ 30 minutos de trabajo
- ✅ Sin riesgo
- ✅ Todo sigue funcionando
- ⏳ Código legacy sigue usando `user.role`

### **Opción B: Refactorización (LIMPIO)**
- ❌ 4-6 horas de trabajo
- ⚠️  Alto riesgo de bugs
- ✅ Código más limpio
- ✅ Usa RBAC correctamente

---

## 💡 **MI RECOMENDACIÓN**

**Ir con Opción A (Vista) por ahora:**

1. Crear vista `users_with_role`
2. Actualizar backend para usar vista
3. Eliminar columna `role`
4. **Más adelante** (cuando tengas tiempo):
   - Refactorizar código para usar permisos RBAC
   - Eliminar vista y usar tabla directamente

---

**¿Quieres que implemente la Opción A (vista) o prefieres la Opción B (refactorización completa)?**
