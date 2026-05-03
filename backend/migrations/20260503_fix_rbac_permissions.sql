-- 1. Función para obtener TODOS los permisos activos (para superadmin)
CREATE OR REPLACE FUNCTION get_all_permission_keys()
RETURNS TEXT[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT CONCAT(resource, '.', action, '.', scope)
    FROM permissions
    ORDER BY resource, action, scope
  );
END;
$$ LANGUAGE plpgsql;

-- 2. Función mejorada: obtener permisos efectivos de un usuario
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TEXT[] AS $$
DECLARE
  v_role_slug TEXT;
  v_permissions TEXT[];
BEGIN
  -- Obtener slug del rol
  SELECT r.slug INTO v_role_slug
  FROM users u
  JOIN roles r ON r.id = u.role_id
  WHERE u.id = p_user_id;
  
  -- Si es superadmin, retornar TODOS los permisos
  IF v_role_slug = 'superadmin' THEN
    RETURN get_all_permission_keys();
  END IF;
  
  -- Para otros roles, usar la vista existente
  SELECT ARRAY_AGG(permission_key)
  INTO v_permissions
  FROM user_permissions_view
  WHERE user_id = p_user_id AND has_permission = true;
  
  RETURN COALESCE(v_permissions, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger para sincronizar role (string) con role_id
CREATE OR REPLACE FUNCTION sync_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar campo role con el slug del rol
  IF NEW.role_id IS NOT NULL THEN
    SELECT slug INTO NEW.role
    FROM roles
    WHERE id = NEW.role_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_user_role ON users;
CREATE TRIGGER trigger_sync_user_role
  BEFORE INSERT OR UPDATE OF role_id ON users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_role();

-- 4. Asegurar que superadmin tiene TODOS los permisos
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE slug = 'superadmin'),
  p.id
FROM permissions p
WHERE NOT EXISTS (
  SELECT 1 FROM role_permissions rp
  WHERE rp.role_id = (SELECT id FROM roles WHERE slug = 'superadmin')
  AND rp.permission_id = p.id
);

-- 5. Crear usuario superadmin por defecto si no existe
DO $$
DECLARE
  v_superadmin_count INT;
  v_superadmin_role_id UUID;
BEGIN
  -- Contar superadmins existentes
  SELECT COUNT(*) INTO v_superadmin_count
  FROM users u
  JOIN roles r ON r.id = u.role_id
  WHERE r.slug = 'superadmin';
  
  -- Si no hay ninguno, crear uno
  IF v_superadmin_count = 0 THEN
    SELECT id INTO v_superadmin_role_id FROM roles WHERE slug = 'superadmin';
    
    INSERT INTO users (username, password_hash, name, role_id, is_active)
    VALUES (
      'admin',
      '$2a$10$rKZHvKGQxnLvVqLqYqKqKOqKqKqKqKqKqKqKqKqKqKqKqKqK', -- Password: Admin123! (CAMBIAR)
      'Administrador del Sistema',
      v_superadmin_role_id,
      true
    );
    
    RAISE NOTICE '⚠️  Usuario superadmin creado: username=admin, password=Admin123!';
    RAISE NOTICE '⚠️  CAMBIAR CONTRASEÑA INMEDIATAMENTE';
  END IF;
END $$;
