-- ============================================================================
-- MIGRACIÓN: Sistema RBAC (Role-Based Access Control)
-- Fecha: 2026-04-10
-- Descripción: Implementa sistema de permisos granular con roles personalizables
-- ============================================================================

-- ============================================================================
-- 1. TABLA: roles
-- Almacena los roles/perfiles del sistema
-- ============================================================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false, -- Roles del sistema no se pueden eliminar
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para roles
CREATE INDEX idx_roles_slug ON roles(slug);
CREATE INDEX idx_roles_is_active ON roles(is_active);

-- Comentarios
COMMENT ON TABLE roles IS 'Roles/Perfiles del sistema';
COMMENT ON COLUMN roles.slug IS 'Identificador único del rol (ej: admin, supervisor)';
COMMENT ON COLUMN roles.is_system IS 'Si es true, el rol no puede ser eliminado';

-- ============================================================================
-- 2. TABLA: permissions
-- Catálogo de permisos disponibles en el sistema
-- ============================================================================
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource VARCHAR(100) NOT NULL, -- Recurso: users, time_entries, reports, etc.
  action VARCHAR(100) NOT NULL, -- Acción: view, create, update, delete, export
  scope VARCHAR(100) DEFAULT 'all', -- Alcance: all, own, team, area
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_permission UNIQUE(resource, action, scope)
);

-- Índices para permissions
CREATE INDEX idx_permissions_resource ON permissions(resource);
CREATE INDEX idx_permissions_action ON permissions(action);
CREATE INDEX idx_permissions_scope ON permissions(scope);

-- Comentarios
COMMENT ON TABLE permissions IS 'Catálogo de permisos disponibles';
COMMENT ON COLUMN permissions.resource IS 'Recurso sobre el que aplica el permiso';
COMMENT ON COLUMN permissions.action IS 'Acción permitida sobre el recurso';
COMMENT ON COLUMN permissions.scope IS 'Alcance del permiso: all, own, team, area';

-- ============================================================================
-- 3. TABLA: role_permissions
-- Relación muchos a muchos entre roles y permisos
-- ============================================================================
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_role_permission UNIQUE(role_id, permission_id)
);

-- Índices para role_permissions
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

-- Comentarios
COMMENT ON TABLE role_permissions IS 'Permisos asignados a cada rol';

-- ============================================================================
-- 4. TABLA: user_permissions
-- Permisos especiales por usuario (excepciones)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted BOOLEAN DEFAULT true, -- true = conceder, false = revocar
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_permission UNIQUE(user_id, permission_id)
);

-- Índices para user_permissions
CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_permission_id ON user_permissions(permission_id);
CREATE INDEX idx_user_permissions_granted ON user_permissions(granted);

-- Comentarios
COMMENT ON TABLE user_permissions IS 'Permisos especiales por usuario (excepciones al rol)';
COMMENT ON COLUMN user_permissions.granted IS 'true = conceder permiso, false = revocar permiso del rol';

-- ============================================================================
-- 5. MODIFICAR TABLA users
-- Agregar columna role_id y mantener role temporalmente para migración
-- ============================================================================

-- Agregar nueva columna role_id
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id);

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);

-- Comentario
COMMENT ON COLUMN users.role_id IS 'Referencia al rol del usuario (nuevo sistema RBAC)';

-- NOTA: NO eliminamos la columna 'role' todavía, la usaremos para migrar datos

-- ============================================================================
-- 6. TRIGGERS para updated_at
-- ============================================================================

-- Trigger para roles
CREATE OR REPLACE FUNCTION update_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_roles_updated_at();

-- ============================================================================
-- 7. POLÍTICAS RLS (Row Level Security) - Opcional
-- ============================================================================

-- Habilitar RLS en las nuevas tablas
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Política: Solo superadmins pueden modificar roles
CREATE POLICY "Superadmins can manage roles"
  ON roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'superadmin'
    )
  );

-- Política: Todos pueden ver roles activos
CREATE POLICY "Everyone can view active roles"
  ON roles
  FOR SELECT
  USING (is_active = true);

-- Política: Solo superadmins pueden ver/modificar permisos
CREATE POLICY "Superadmins can manage permissions"
  ON permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'superadmin'
    )
  );

-- Política: Solo superadmins pueden gestionar role_permissions
CREATE POLICY "Superadmins can manage role_permissions"
  ON role_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'superadmin'
    )
  );

-- Política: Solo superadmins pueden gestionar user_permissions
CREATE POLICY "Superadmins can manage user_permissions"
  ON user_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'superadmin'
    )
  );

-- ============================================================================
-- 8. FUNCIÓN HELPER: Verificar si un usuario tiene un permiso
-- ============================================================================

CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id UUID,
  p_resource VARCHAR,
  p_action VARCHAR,
  p_scope VARCHAR DEFAULT 'all'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN;
  v_role_id UUID;
BEGIN
  -- Obtener role_id del usuario
  SELECT role_id INTO v_role_id FROM users WHERE id = p_user_id;
  
  IF v_role_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar si el usuario tiene el permiso a través de su rol
  SELECT EXISTS(
    SELECT 1
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    WHERE rp.role_id = v_role_id
      AND p.resource = p_resource
      AND p.action = p_action
      AND p.scope = p_scope
  ) INTO v_has_permission;
  
  -- Si tiene el permiso por rol, verificar si hay una revocación explícita
  IF v_has_permission THEN
    SELECT NOT EXISTS(
      SELECT 1
      FROM user_permissions up
      JOIN permissions p ON p.id = up.permission_id
      WHERE up.user_id = p_user_id
        AND p.resource = p_resource
        AND p.action = p_action
        AND p.scope = p_scope
        AND up.granted = false
    ) INTO v_has_permission;
  ELSE
    -- Si no tiene el permiso por rol, verificar si hay una concesión explícita
    SELECT EXISTS(
      SELECT 1
      FROM user_permissions up
      JOIN permissions p ON p.id = up.permission_id
      WHERE up.user_id = p_user_id
        AND p.resource = p_resource
        AND p.action = p_action
        AND p.scope = p_scope
        AND up.granted = true
    ) INTO v_has_permission;
  END IF;
  
  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION user_has_permission IS 'Verifica si un usuario tiene un permiso específico considerando rol y excepciones';

-- ============================================================================
-- 9. VISTA: user_permissions_view
-- Vista para obtener todos los permisos efectivos de un usuario
-- ============================================================================

CREATE OR REPLACE VIEW user_permissions_view AS
SELECT DISTINCT
  u.id AS user_id,
  u.username,
  r.slug AS role_slug,
  p.resource,
  p.action,
  p.scope,
  CONCAT(p.resource, '.', p.action, '.', p.scope) AS permission_key,
  CASE
    WHEN up.granted IS NOT NULL THEN up.granted
    WHEN rp.id IS NOT NULL THEN true
    ELSE false
  END AS has_permission
FROM users u
LEFT JOIN roles r ON r.id = u.role_id
LEFT JOIN role_permissions rp ON rp.role_id = r.id
LEFT JOIN permissions p ON p.id = rp.permission_id
LEFT JOIN user_permissions up ON up.user_id = u.id AND up.permission_id = p.id
WHERE u.is_active = true AND (r.is_active = true OR r.is_active IS NULL);

-- Comentario
COMMENT ON VIEW user_permissions_view IS 'Vista de permisos efectivos por usuario';

-- ============================================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================================

-- Verificación
DO $$
BEGIN
  RAISE NOTICE '✅ Migración RBAC completada exitosamente';
  RAISE NOTICE '📋 Tablas creadas: roles, permissions, role_permissions, user_permissions';
  RAISE NOTICE '🔧 Función creada: user_has_permission()';
  RAISE NOTICE '👁️  Vista creada: user_permissions_view';
  RAISE NOTICE '⚠️  IMPORTANTE: Ejecutar seeder para crear roles y permisos iniciales';
END $$;
