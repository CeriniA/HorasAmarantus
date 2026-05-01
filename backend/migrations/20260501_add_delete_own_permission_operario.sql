-- ============================================================================
-- Migración: Agregar permiso delete.own para objetivos a operarios
-- Fecha: 2026-05-01
-- Descripción: Permite que los operarios eliminen sus propios objetivos personales
-- ============================================================================

-- Agregar permiso de eliminar propios objetivos a operarios
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE slug = 'operario'),
  p.id
FROM permissions p
WHERE 
  p.resource = 'objectives' AND 
  p.action = 'delete' AND 
  p.scope = 'own'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Verificar que se agregó correctamente
SELECT 
  r.name as rol,
  p.resource,
  p.action,
  p.scope,
  p.description
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
WHERE 
  r.slug = 'operario' AND
  p.resource = 'objectives' AND
  p.action = 'delete';

-- ============================================================================
-- RESUMEN
-- ============================================================================
-- ✅ Operarios ahora pueden eliminar sus propios objetivos personales
-- ✅ Permiso: objectives.delete.own
-- ============================================================================
