-- =====================================================
-- CREAR USUARIO ADMINISTRADOR
-- =====================================================
-- Ejecuta esto DESPUÉS de ejecutar schema-simple.sql

INSERT INTO users (id, email, password_hash, name, role, is_active)
VALUES (
  '1fa2dea5-5852-4eed-94f8-757aef724d9f',
  'admin@horticola.com',
  '$2a$10$mavSXcaaGyG4LvfgTXjcZexQWl6Ix4BEpnLndhIi66qpkkXWan4jW',
  'Administrador',
  'admin',
  true
);

-- Verificar que se creó correctamente
SELECT id, email, name, role, is_active, created_at 
FROM users 
WHERE email = 'admin@horticola.com';
