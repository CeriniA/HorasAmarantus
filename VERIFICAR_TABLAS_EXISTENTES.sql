-- ============================================================================
-- VERIFICAR QUÉ TABLAS RBAC YA EXISTEN
-- Ejecutar en Supabase SQL Editor
-- ============================================================================

-- 1. Ver si existen las tablas RBAC
SELECT 
  table_name,
  CASE 
    WHEN table_name = 'roles' THEN '✅ Tabla de roles'
    WHEN table_name = 'permissions' THEN '✅ Tabla de permisos'
    WHEN table_name = 'role_permissions' THEN '✅ Relación roles-permisos'
    WHEN table_name = 'user_permissions' THEN '✅ Excepciones por usuario'
    ELSE 'Otra tabla'
  END as descripcion
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('roles', 'permissions', 'role_permissions', 'user_permissions')
ORDER BY table_name;

-- 2. Ver si la tabla users tiene columna role_id
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('role', 'role_id')
ORDER BY column_name;

-- 3. Contar cuántos roles existen (si la tabla existe)
SELECT 
  COUNT(*) as total_roles,
  STRING_AGG(slug, ', ' ORDER BY slug) as roles_existentes
FROM roles;

-- 4. Contar cuántos permisos existen (si la tabla existe)
SELECT 
  COUNT(*) as total_permisos
FROM permissions;

-- 5. Ver si existen permisos asignados a roles
SELECT 
  r.slug as rol,
  COUNT(rp.permission_id) as permisos_asignados
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.slug
ORDER BY r.slug;

-- 6. Ver si existe la función user_has_permission
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'user_has_permission'
  AND routine_schema = 'public';

-- ============================================================================
-- INTERPRETACIÓN DE RESULTADOS
-- ============================================================================

/*
ESCENARIO 1: NO EXISTEN LAS TABLAS
- Query 1 retorna 0 filas
- Query 2 solo muestra columna 'role' (VARCHAR)
→ ACCIÓN: Ejecutar 20260410_create_rbac_system.sql

ESCENARIO 2: EXISTEN LAS TABLAS PERO VACÍAS
- Query 1 retorna 4 filas (roles, permissions, role_permissions, user_permissions)
- Query 3 retorna 0 roles
- Query 4 retorna 0 permisos
→ ACCIÓN: Ejecutar 20260410_seed_rbac_data.sql

ESCENARIO 3: EXISTEN TABLAS Y DATOS
- Query 1 retorna 4 filas
- Query 3 retorna 5 roles (superadmin, admin, supervisor, team_lead, operario)
- Query 4 retorna >30 permisos
- Query 5 muestra permisos asignados a cada rol
→ ACCIÓN: Solo ejecutar 20260410_sincronizar_role_y_role_id.sql

ESCENARIO 4: TODO YA ESTÁ CONFIGURADO
- Todo lo anterior + Query 2 muestra ambas columnas (role y role_id)
- Query 6 retorna la función user_has_permission
→ ACCIÓN: Solo asignar role_id a usuarios que no lo tengan
*/
