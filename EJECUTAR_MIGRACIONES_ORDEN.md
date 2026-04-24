# 🚀 **EJECUTAR MIGRACIONES - ORDEN CORRECTO**

**Fecha:** 10 de Abril de 2026  
**IMPORTANTE:** Ejecutar en este orden exacto

---

## 📋 **ORDEN DE EJECUCIÓN**

### **PASO 1: Crear tablas RBAC** ✅
**Archivo:** `backend/migrations/20260410_create_rbac_system.sql`

**Qué hace:**
- ✅ Crea tabla `roles`
- ✅ Crea tabla `permissions`
- ✅ Crea tabla `role_permissions`
- ✅ Crea tabla `user_permissions`
- ✅ Agrega columna `role_id` a tabla `users`
- ✅ Crea función PostgreSQL `user_has_permission()`

**Cómo ejecutar:**
```bash
# 1. Abrir archivo
backend/migrations/20260410_create_rbac_system.sql

# 2. Copiar TODO el contenido

# 3. Ir a Supabase SQL Editor
https://supabase.com/dashboard/project/YOUR_PROJECT/sql

# 4. Pegar y ejecutar
```

---

### **PASO 2: Insertar roles y permisos** ✅
**Archivo:** `backend/migrations/20260410_seed_rbac_data.sql`

**Qué hace:**
- ✅ Inserta 5 roles: superadmin, admin, supervisor, team_lead, operario
- ✅ Inserta permisos para:
  - `users` (view, create, update, delete, activate)
  - `time_entries` (view, create, update, delete, import)
  - `org_units` (view, create, update, delete, import)
  - `objectives` (view, create, update, delete)
  - `reports` (view, export)
  - `roles` (view, create, update, delete)
  - `permissions` (view, assign)
- ✅ Asigna permisos a cada rol

**Cómo ejecutar:**
```bash
# 1. Abrir archivo
backend/migrations/20260410_seed_rbac_data.sql

# 2. Copiar TODO el contenido

# 3. Ir a Supabase SQL Editor

# 4. Pegar y ejecutar
```

---

### **PASO 3: Asignar role_id a usuarios existentes** ⚠️
**Archivo:** Crear manualmente o ejecutar query

**Qué hace:**
- ✅ Asigna `role_id` a usuarios que solo tienen `role` (VARCHAR)

**Query a ejecutar:**
```sql
-- Asignar role_id basado en role VARCHAR
UPDATE users u
SET role_id = r.id
FROM roles r
WHERE u.role = r.slug
  AND u.role_id IS NULL;

-- Verificar que todos tienen role_id
SELECT 
  COUNT(*) as usuarios_sin_role_id
FROM users
WHERE role_id IS NULL;
-- Debe retornar 0
```

---

### **PASO 4: Sincronizar role y role_id** ✅
**Archivo:** `backend/migrations/20260410_sincronizar_role_y_role_id.sql`

**Qué hace:**
- ✅ Crea triggers para mantener sincronizadas ambas columnas
- ✅ Permite convivencia de sistema viejo (producción) y nuevo (local)

**Cómo ejecutar:**
```bash
# 1. Abrir archivo
backend/migrations/20260410_sincronizar_role_y_role_id.sql

# 2. Copiar TODO el contenido

# 3. Ir a Supabase SQL Editor

# 4. Pegar y ejecutar
```

---

### **PASO 5: (FUTURO) Eliminar columna role** ❌
**Archivo:** `backend/migrations/20260410_eliminar_role_columna.sql`

**⚠️ NO EJECUTAR AHORA**

Este script se ejecuta **solo cuando migres producción** al sistema nuevo.

---

## ✅ **VERIFICACIÓN POST-MIGRACIÓN**

### **1. Verificar que existen las tablas:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('roles', 'permissions', 'role_permissions', 'user_permissions');
-- Debe retornar 4 filas
```

### **2. Verificar que existen los roles:**
```sql
SELECT slug, name FROM roles ORDER BY slug;
-- Debe retornar:
-- admin, Administrador
-- operario, Operario
-- superadmin, Superadministrador
-- supervisor, Supervisor
-- team_lead, Líder de Equipo
```

### **3. Verificar que existen permisos:**
```sql
SELECT COUNT(*) as total_permisos FROM permissions;
-- Debe retornar > 30 permisos
```

### **4. Verificar que roles tienen permisos asignados:**
```sql
SELECT 
  r.slug as rol,
  COUNT(rp.permission_id) as permisos_asignados
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.slug
ORDER BY r.slug;
-- Todos los roles deben tener permisos
```

### **5. Verificar que usuarios tienen role_id:**
```sql
SELECT 
  COUNT(*) as total_usuarios,
  COUNT(role_id) as usuarios_con_role_id,
  COUNT(*) - COUNT(role_id) as usuarios_sin_role_id
FROM users;
-- usuarios_sin_role_id debe ser 0
```

### **6. Verificar sincronización role ↔ role_id:**
```sql
SELECT 
  u.username,
  u.role as role_varchar,
  r.slug as role_slug,
  CASE 
    WHEN u.role = r.slug THEN '✅ OK'
    ELSE '❌ DESINCRONIZADO'
  END as estado
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LIMIT 10;
-- Todos deben estar ✅ OK
```

### **7. Verificar que existe la función PostgreSQL:**
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'user_has_permission';
-- Debe retornar 1 fila
```

---

## 🧪 **PROBAR PERMISOS**

### **Probar función user_has_permission:**
```sql
-- Obtener ID de un usuario superadmin
SELECT id, username, role FROM users WHERE role = 'superadmin' LIMIT 1;

-- Probar permiso (reemplazar USER_ID con el ID obtenido)
SELECT user_has_permission(
  'USER_ID'::uuid,
  'users',
  'view',
  'all'
) as tiene_permiso;
-- Debe retornar true para superadmin
```

---

## 📊 **RESUMEN**

### **Ejecutar EN ORDEN:**
1. ✅ `20260410_create_rbac_system.sql` - Crear tablas
2. ✅ `20260410_seed_rbac_data.sql` - Insertar roles y permisos
3. ✅ Query manual - Asignar role_id a usuarios
4. ✅ `20260410_sincronizar_role_y_role_id.sql` - Sincronización
5. ❌ `20260410_eliminar_role_columna.sql` - **NO ejecutar ahora**

### **Verificar:**
- [ ] Tablas creadas
- [ ] Roles insertados (5 roles)
- [ ] Permisos insertados (>30 permisos)
- [ ] Permisos asignados a roles
- [ ] Usuarios tienen role_id
- [ ] role y role_id sincronizados
- [ ] Función user_has_permission existe

---

## 🚨 **SI ALGO FALLA**

### **Error: "relation already exists"**
**Causa:** Ya ejecutaste el script antes

**Solución:** Ignorar (es normal, usa `IF NOT EXISTS`)

---

### **Error: "duplicate key value violates unique constraint"**
**Causa:** Ya existen los datos

**Solución:** Ignorar (usa `ON CONFLICT DO NOTHING`)

---

### **Error: "column role_id does not exist"**
**Causa:** No ejecutaste el PASO 1

**Solución:** Ejecutar `20260410_create_rbac_system.sql` primero

---

### **Error: "function user_has_permission does not exist"**
**Causa:** No ejecutaste el PASO 1 completo

**Solución:** 
1. Verificar que el script se ejecutó completo
2. Revisar logs de Supabase para errores
3. Re-ejecutar el script completo

---

**Estado:** ✅ **LISTO PARA EJECUTAR**
