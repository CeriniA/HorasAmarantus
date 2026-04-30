-- ============================================================================
-- VERIFICAR PERMISOS DEL SUPERADMINISTRADOR
-- ============================================================================
-- Descripción: Consulta para ver todos los permisos asignados al Superadmin
-- Uso: Copiar y pegar en Supabase SQL Editor
-- ============================================================================

-- OPCIÓN 1: Vista detallada con descripción
-- ============================================================================
SELECT 
  p.resource AS "Recurso",
  p.action AS "Acción",
  p.description AS "Descripción",
  rp.created_at AS "Asignado el"
FROM role_permissions rp
JOIN permissions p ON p.id = rp.permission_id
JOIN roles r ON r.id = rp.role_id
WHERE r.slug = 'superadmin'
ORDER BY p.resource, p.action;

-- ============================================================================
-- OPCIÓN 2: Resumen agrupado por recurso
-- ============================================================================
SELECT 
  p.resource AS "Recurso",
  COUNT(*) AS "Cantidad de Permisos",
  STRING_AGG(p.action, ', ' ORDER BY p.action) AS "Acciones"
FROM role_permissions rp
JOIN permissions p ON p.id = rp.permission_id
JOIN roles r ON r.id = rp.role_id
WHERE r.slug = 'superadmin'
GROUP BY p.resource
ORDER BY p.resource;

-- ============================================================================
-- OPCIÓN 3: Contador simple
-- ============================================================================
SELECT 
  r.name AS "Rol",
  r.slug AS "Slug",
  COUNT(rp.permission_id) AS "Total Permisos",
  (SELECT COUNT(*) FROM permissions) AS "Permisos en Sistema",
  CASE 
    WHEN COUNT(rp.permission_id) = (SELECT COUNT(*) FROM permissions) 
    THEN '✅ COMPLETO'
    ELSE '⚠️ INCOMPLETO'
  END AS "Estado"
FROM roles r
LEFT JOIN role_permissions rp ON rp.role_id = r.id
WHERE r.slug = 'superadmin'
GROUP BY r.id, r.name, r.slug;

-- ============================================================================
-- OPCIÓN 4: Comparación con permisos totales
-- ============================================================================
WITH superadmin_perms AS (
  SELECT COUNT(*) as asignados
  FROM role_permissions rp
  JOIN roles r ON r.id = rp.role_id
  WHERE r.slug = 'superadmin'
),
total_perms AS (
  SELECT COUNT(*) as totales
  FROM permissions
)
SELECT 
  sp.asignados AS "Permisos Asignados",
  tp.totales AS "Permisos Totales",
  tp.totales - sp.asignados AS "Faltantes",
  ROUND((sp.asignados::NUMERIC / tp.totales::NUMERIC) * 100, 2) AS "Porcentaje %"
FROM superadmin_perms sp, total_perms tp;

-- ============================================================================
-- OPCIÓN 5: Permisos faltantes (si hay alguno)
-- ============================================================================
SELECT 
  p.resource AS "Recurso Faltante",
  p.action AS "Acción Faltante",
  p.description AS "Descripción"
FROM permissions p
WHERE p.id NOT IN (
  SELECT rp.permission_id
  FROM role_permissions rp
  JOIN roles r ON r.id = rp.role_id
  WHERE r.slug = 'superadmin'
)
ORDER BY p.resource, p.action;
