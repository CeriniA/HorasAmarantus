-- =====================================================
-- CREAR SUPERADMIN
-- Email: superamarantus
-- Password: ContraseñaDificil123!
-- =====================================================

-- Insertar superadmin
-- NOTA: El password_hash es el hash de "ContraseñaDificil123!" usando bcrypt
-- Hash generado con: bcrypt.hash('ContraseñaDificil123!', 10)

INSERT INTO users (
  email, 
  password_hash, 
  name, 
  role, 
  is_active
) VALUES (
  'superamarantus',
  '$2a$10$YourHashWillGoHere',  -- Este hash se generará en el siguiente paso
  'Super Administrador',
  'superadmin',
  true
)
ON CONFLICT (email) DO UPDATE 
SET 
  role = 'superadmin',
  is_active = true;

-- Verificar
SELECT 
  email, 
  name, 
  role, 
  is_active,
  created_at
FROM users 
WHERE email = 'superamarantus';
