-- ============================================================================
-- LIMPIEZA: Eliminar permisos innecesarios
-- Fecha: 2026-04-10
-- Descripción: Elimina permisos de recursos que no existen o no se usan
-- ============================================================================

-- ============================================================================
-- PASO 1: Ver qué permisos se van a eliminar
-- ============================================================================
SELECT 
  resource,
  action,
  scope,
  description,
  '❌ A ELIMINAR' as estado
FROM permissions
WHERE resource IN ('settings', 'configuration')
ORDER BY resource, action, scope;

-- ============================================================================
-- PASO 2: Eliminar asignaciones de estos permisos a roles
-- ============================================================================
DELETE FROM role_permissions
WHERE permission_id IN (
  SELECT id FROM permissions
  WHERE resource IN ('settings', 'configuration')
);

-- ============================================================================
-- PASO 3: Eliminar asignaciones de estos permisos a usuarios
-- ============================================================================
DELETE FROM user_permissions
WHERE permission_id IN (
  SELECT id FROM permissions
  WHERE resource IN ('settings', 'configuration')
);

-- ============================================================================
-- PASO 4: Eliminar los permisos
-- ============================================================================
DELETE FROM permissions
WHERE resource IN ('settings', 'configuration');

-- ============================================================================
-- VERIFICACIÓN: Ver permisos restantes
-- ============================================================================
SELECT 
  resource,
  COUNT(*) as total_permisos
FROM permissions
GROUP BY resource
ORDER BY resource;

-- ============================================================================
-- RESUMEN
-- ============================================================================
-- ✅ LIMPIEZA COMPLETADA
-- 
-- Permisos eliminados:
--   - settings.view.all
--   - settings.update.all
-- 
-- Permisos restantes por recurso:
--   - users
--   - time_entries
--   - reports
--   - objectives
--   - organizational_units
--   - roles
--   - permissions
