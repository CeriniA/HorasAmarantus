-- ============================================================================
-- SEEDER: Datos iniciales para sistema RBAC
-- Fecha: 2026-04-10
-- Descripción: Crea roles y permisos predefinidos del sistema
-- ============================================================================

-- ============================================================================
-- 1. INSERTAR ROLES DEL SISTEMA
-- ============================================================================

INSERT INTO roles (name, slug, description, is_system, is_active) VALUES
  ('Superadministrador', 'superadmin', 'Acceso total al sistema sin restricciones', true, true),
  ('Administrador', 'admin', 'Gestión completa de usuarios, registros y configuración', true, true),
  ('Supervisor', 'supervisor', 'Supervisión de equipos y aprobación de registros', true, true),
  ('Líder de Equipo', 'team_lead', 'Coordinación de equipo y seguimiento de objetivos', true, true),
  ('Operario', 'operario', 'Registro de tiempo y consulta de información propia', true, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 2. INSERTAR PERMISOS - USUARIOS
-- ============================================================================

INSERT INTO permissions (resource, action, scope, description) VALUES
  -- Ver usuarios
  ('users', 'view', 'all', 'Ver todos los usuarios del sistema'),
  ('users', 'view', 'team', 'Ver usuarios de su área/equipo'),
  ('users', 'view', 'own', 'Ver su propio perfil'),
  
  -- Crear usuarios
  ('users', 'create', 'all', 'Crear nuevos usuarios'),
  
  -- Actualizar usuarios
  ('users', 'update', 'all', 'Editar cualquier usuario'),
  ('users', 'update', 'team', 'Editar usuarios de su equipo'),
  ('users', 'update', 'own', 'Editar su propio perfil'),
  
  -- Eliminar usuarios
  ('users', 'delete', 'all', 'Eliminar usuarios'),
  
  -- Activar/desactivar usuarios
  ('users', 'activate', 'all', 'Activar o desactivar usuarios')
ON CONFLICT (resource, action, scope) DO NOTHING;

-- ============================================================================
-- 3. INSERTAR PERMISOS - REGISTROS DE TIEMPO
-- ============================================================================

INSERT INTO permissions (resource, action, scope, description) VALUES
  -- Ver registros
  ('time_entries', 'view', 'all', 'Ver todos los registros de tiempo'),
  ('time_entries', 'view', 'team', 'Ver registros de su área/equipo'),
  ('time_entries', 'view', 'own', 'Ver sus propios registros'),
  
  -- Crear registros
  ('time_entries', 'create', 'all', 'Crear registros para cualquier usuario'),
  ('time_entries', 'create', 'team', 'Crear registros para su equipo'),
  ('time_entries', 'create', 'own', 'Crear sus propios registros'),
  
  -- Actualizar registros
  ('time_entries', 'update', 'all', 'Editar cualquier registro'),
  ('time_entries', 'update', 'team', 'Editar registros de su equipo'),
  ('time_entries', 'update', 'own', 'Editar sus propios registros'),
  
  -- Eliminar registros
  ('time_entries', 'delete', 'all', 'Eliminar cualquier registro'),
  ('time_entries', 'delete', 'team', 'Eliminar registros de su equipo'),
  ('time_entries', 'delete', 'own', 'Eliminar sus propios registros'),
  
  -- Importación masiva
  ('time_entries', 'import', 'all', 'Importar registros masivamente')
ON CONFLICT (resource, action, scope) DO NOTHING;

-- ============================================================================
-- 4. INSERTAR PERMISOS - UNIDADES ORGANIZACIONALES
-- ============================================================================

INSERT INTO permissions (resource, action, scope, description) VALUES
  ('org_units', 'view', 'all', 'Ver todas las unidades organizacionales'),
  ('org_units', 'create', 'all', 'Crear unidades organizacionales'),
  ('org_units', 'update', 'all', 'Editar unidades organizacionales'),
  ('org_units', 'delete', 'all', 'Eliminar unidades organizacionales'),
  ('org_units', 'import', 'all', 'Importar unidades masivamente')
ON CONFLICT (resource, action, scope) DO NOTHING;

-- ============================================================================
-- 5. INSERTAR PERMISOS - OBJETIVOS
-- ============================================================================

INSERT INTO permissions (resource, action, scope, description) VALUES
  -- Ver objetivos
  ('objectives', 'view', 'all', 'Ver todos los objetivos'),
  ('objectives', 'view', 'team', 'Ver objetivos de su área/equipo'),
  ('objectives', 'view', 'own', 'Ver sus propios objetivos'),
  
  -- Crear objetivos
  ('objectives', 'create', 'company', 'Crear objetivos empresariales/de área'),
  ('objectives', 'create', 'assigned', 'Asignar objetivos a usuarios'),
  ('objectives', 'create', 'personal', 'Crear objetivos personales'),
  
  -- Actualizar objetivos
  ('objectives', 'update', 'all', 'Editar cualquier objetivo'),
  ('objectives', 'update', 'team', 'Editar objetivos de su equipo'),
  ('objectives', 'update', 'own', 'Editar sus propios objetivos'),
  
  -- Eliminar objetivos
  ('objectives', 'delete', 'all', 'Eliminar cualquier objetivo'),
  ('objectives', 'delete', 'own', 'Eliminar sus propios objetivos'),
  
  -- Marcar cumplimiento
  ('objectives', 'complete', 'all', 'Marcar cumplimiento de cualquier objetivo'),
  ('objectives', 'complete', 'own', 'Marcar cumplimiento de sus objetivos')
ON CONFLICT (resource, action, scope) DO NOTHING;

-- ============================================================================
-- 6. INSERTAR PERMISOS - REPORTES
-- ============================================================================

INSERT INTO permissions (resource, action, scope, description) VALUES
  ('reports', 'view', 'all', 'Ver todos los reportes del sistema'),
  ('reports', 'view', 'team', 'Ver reportes de su área/equipo'),
  ('reports', 'view', 'own', 'Ver sus propios reportes'),
  ('reports', 'export', 'all', 'Exportar reportes'),
  ('reports', 'export', 'team', 'Exportar reportes de su equipo'),
  ('reports', 'export', 'own', 'Exportar sus propios reportes')
ON CONFLICT (resource, action, scope) DO NOTHING;

-- ============================================================================
-- 7. INSERTAR PERMISOS - CONFIGURACIÓN Y ROLES
-- ============================================================================

INSERT INTO permissions (resource, action, scope, description) VALUES
  ('settings', 'view', 'all', 'Ver configuración del sistema'),
  ('settings', 'update', 'all', 'Modificar configuración del sistema'),
  ('roles', 'view', 'all', 'Ver roles y permisos'),
  ('roles', 'manage', 'all', 'Gestionar roles y permisos'),
  ('permissions', 'assign', 'all', 'Asignar permisos a usuarios')
ON CONFLICT (resource, action, scope) DO NOTHING;

-- ============================================================================
-- 8. ASIGNAR PERMISOS A ROL: SUPERADMIN
-- ============================================================================

-- Superadmin tiene TODOS los permisos
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE slug = 'superadmin'),
  p.id
FROM permissions p
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================================
-- 9. ASIGNAR PERMISOS A ROL: ADMIN
-- ============================================================================

INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE slug = 'admin'),
  p.id
FROM permissions p
WHERE 
  -- Usuarios: todos los permisos
  (p.resource = 'users') OR
  
  -- Time entries: todos los permisos
  (p.resource = 'time_entries') OR
  
  -- Org units: todos los permisos
  (p.resource = 'org_units') OR
  
  -- Objetivos: ver todos, crear company/assigned, actualizar todos, eliminar todos
  (p.resource = 'objectives' AND p.action IN ('view', 'update', 'delete', 'complete') AND p.scope = 'all') OR
  (p.resource = 'objectives' AND p.action = 'create' AND p.scope IN ('company', 'assigned')) OR
  
  -- Reportes: ver y exportar todos
  (p.resource = 'reports' AND p.scope = 'all') OR
  
  -- Settings: ver
  (p.resource = 'settings' AND p.action = 'view')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================================
-- 10. ASIGNAR PERMISOS A ROL: SUPERVISOR
-- ============================================================================

INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE slug = 'supervisor'),
  p.id
FROM permissions p
WHERE 
  -- Usuarios: ver team y own
  (p.resource = 'users' AND p.action = 'view' AND p.scope IN ('team', 'own')) OR
  (p.resource = 'users' AND p.action = 'update' AND p.scope = 'own') OR
  
  -- Time entries: ver team/own, crear team/own, actualizar team/own, eliminar team
  (p.resource = 'time_entries' AND p.action = 'view' AND p.scope IN ('team', 'own')) OR
  (p.resource = 'time_entries' AND p.action = 'create' AND p.scope IN ('team', 'own')) OR
  (p.resource = 'time_entries' AND p.action = 'update' AND p.scope IN ('team', 'own')) OR
  (p.resource = 'time_entries' AND p.action = 'delete' AND p.scope = 'team') OR
  
  -- Org units: solo ver
  (p.resource = 'org_units' AND p.action = 'view') OR
  
  -- Objetivos: ver team/own, crear assigned, actualizar team/own, completar team/own
  (p.resource = 'objectives' AND p.action = 'view' AND p.scope IN ('team', 'own')) OR
  (p.resource = 'objectives' AND p.action = 'create' AND p.scope = 'assigned') OR
  (p.resource = 'objectives' AND p.action = 'update' AND p.scope IN ('team', 'own')) OR
  (p.resource = 'objectives' AND p.action = 'complete' AND p.scope IN ('team', 'own')) OR
  
  -- Reportes: ver y exportar team
  (p.resource = 'reports' AND p.scope IN ('team', 'own'))
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================================
-- 11. ASIGNAR PERMISOS A ROL: TEAM_LEAD
-- ============================================================================

INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE slug = 'team_lead'),
  p.id
FROM permissions p
WHERE 
  -- Usuarios: ver team y own
  (p.resource = 'users' AND p.action = 'view' AND p.scope IN ('team', 'own')) OR
  (p.resource = 'users' AND p.action = 'update' AND p.scope = 'own') OR
  
  -- Time entries: ver team/own, crear own, actualizar own, eliminar own
  (p.resource = 'time_entries' AND p.action = 'view' AND p.scope IN ('team', 'own')) OR
  (p.resource = 'time_entries' AND p.action = 'create' AND p.scope = 'own') OR
  (p.resource = 'time_entries' AND p.action = 'update' AND p.scope = 'own') OR
  (p.resource = 'time_entries' AND p.action = 'delete' AND p.scope = 'own') OR
  
  -- Org units: solo ver
  (p.resource = 'org_units' AND p.action = 'view') OR
  
  -- Objetivos: ver team/own, crear personal, actualizar own, completar own
  (p.resource = 'objectives' AND p.action = 'view' AND p.scope IN ('team', 'own')) OR
  (p.resource = 'objectives' AND p.action = 'create' AND p.scope = 'personal') OR
  (p.resource = 'objectives' AND p.action = 'update' AND p.scope = 'own') OR
  (p.resource = 'objectives' AND p.action = 'complete' AND p.scope = 'own') OR
  
  -- Reportes: ver team y own
  (p.resource = 'reports' AND p.action = 'view' AND p.scope IN ('team', 'own'))
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================================
-- 12. ASIGNAR PERMISOS A ROL: OPERARIO
-- ============================================================================

INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE slug = 'operario'),
  p.id
FROM permissions p
WHERE 
  -- Usuarios: solo ver y actualizar own
  (p.resource = 'users' AND p.action IN ('view', 'update') AND p.scope = 'own') OR
  
  -- Time entries: solo own
  (p.resource = 'time_entries' AND p.scope = 'own') OR
  
  -- Org units: solo ver
  (p.resource = 'org_units' AND p.action = 'view') OR
  
  -- Objetivos: ver own, crear personal, actualizar own, completar own
  (p.resource = 'objectives' AND p.action = 'view' AND p.scope = 'own') OR
  (p.resource = 'objectives' AND p.action = 'create' AND p.scope = 'personal') OR
  (p.resource = 'objectives' AND p.action = 'update' AND p.scope = 'own') OR
  (p.resource = 'objectives' AND p.action = 'complete' AND p.scope = 'own') OR
  
  -- Reportes: solo ver own
  (p.resource = 'reports' AND p.action = 'view' AND p.scope = 'own')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================================
-- 13. MIGRAR USUARIOS EXISTENTES AL NUEVO SISTEMA
-- ============================================================================

-- Migrar usuarios con rol 'superadmin'
UPDATE users 
SET role_id = (SELECT id FROM roles WHERE slug = 'superadmin')
WHERE role = 'superadmin' AND role_id IS NULL;

-- Migrar usuarios con rol 'admin'
UPDATE users 
SET role_id = (SELECT id FROM roles WHERE slug = 'admin')
WHERE role = 'admin' AND role_id IS NULL;

-- Migrar usuarios con rol 'operario'
UPDATE users 
SET role_id = (SELECT id FROM roles WHERE slug = 'operario')
WHERE role = 'operario' AND role_id IS NULL;

-- ============================================================================
-- 14. VERIFICACIÓN Y ESTADÍSTICAS
-- ============================================================================

DO $$
DECLARE
  v_roles_count INT;
  v_permissions_count INT;
  v_role_permissions_count INT;
  v_users_migrated INT;
BEGIN
  -- Contar registros
  SELECT COUNT(*) INTO v_roles_count FROM roles;
  SELECT COUNT(*) INTO v_permissions_count FROM permissions;
  SELECT COUNT(*) INTO v_role_permissions_count FROM role_permissions;
  SELECT COUNT(*) INTO v_users_migrated FROM users WHERE role_id IS NOT NULL;
  
  -- Mostrar resultados
  RAISE NOTICE '✅ Seeder RBAC completado exitosamente';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '📊 ESTADÍSTICAS:';
  RAISE NOTICE '   • Roles creados: %', v_roles_count;
  RAISE NOTICE '   • Permisos creados: %', v_permissions_count;
  RAISE NOTICE '   • Asignaciones rol-permiso: %', v_role_permissions_count;
  RAISE NOTICE '   • Usuarios migrados: %', v_users_migrated;
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '🎭 ROLES DISPONIBLES:';
  RAISE NOTICE '   • superadmin - Superadministrador';
  RAISE NOTICE '   • admin - Administrador';
  RAISE NOTICE '   • supervisor - Supervisor';
  RAISE NOTICE '   • team_lead - Líder de Equipo';
  RAISE NOTICE '   • operario - Operario';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- ============================================================================
-- FIN DEL SEEDER
-- ============================================================================
