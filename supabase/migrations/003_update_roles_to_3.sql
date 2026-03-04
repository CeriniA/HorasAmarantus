-- =====================================================
-- MIGRACIÓN: Actualizar sistema de roles a 3 niveles
-- superadmin, admin, operario
-- =====================================================

-- 1. Actualizar constraint de roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('superadmin', 'admin', 'operario'));

-- 2. Migrar supervisores existentes a admin
UPDATE users 
SET role = 'admin' 
WHERE role = 'supervisor';

-- 3. Crear primer superadmin (CAMBIAR EMAIL)
-- IMPORTANTE: Cambia 'admin@ejemplo.com' por tu email real
UPDATE users 
SET role = 'superadmin' 
WHERE email = 'admin@ejemplo.com'
LIMIT 1;

-- Si no existe ningún usuario, crear uno:
-- INSERT INTO users (email, password_hash, name, role, is_active)
-- VALUES (
--   'admin@ejemplo.com',
--   '$2a$10$ejemplo_hash',  -- Cambiar por hash real
--   'Super Administrador',
--   'superadmin',
--   true
-- );

-- 4. Verificar cambios
SELECT 
  role, 
  COUNT(*) as cantidad,
  array_agg(email) as usuarios
FROM users
GROUP BY role
ORDER BY 
  CASE role
    WHEN 'superadmin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'operario' THEN 3
  END;
