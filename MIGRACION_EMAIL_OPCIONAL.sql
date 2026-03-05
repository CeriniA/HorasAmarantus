-- =====================================================
-- MIGRACIÓN: Email Opcional + Username Obligatorio
-- =====================================================
-- IMPORTANTE: Ejecutar en Supabase SQL Editor
-- =====================================================

-- Paso 1: Agregar columna username (si no existe)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username TEXT;

-- Paso 2: Generar usernames para usuarios existentes que no tienen
-- (Basado en el email antes del @, o un username genérico)
UPDATE users 
SET username = COALESCE(
  username,
  SPLIT_PART(email, '@', 1),
  'user_' || SUBSTRING(id::text, 1, 8)
)
WHERE username IS NULL OR username = '';

-- Paso 3: Hacer username obligatorio y único
ALTER TABLE users 
ALTER COLUMN username SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique 
ON users(username);

-- Paso 4: Hacer email opcional (nullable)
ALTER TABLE users 
ALTER COLUMN email DROP NOT NULL;

-- Paso 5: Modificar constraint de email único para permitir NULL
-- (Primero eliminar el constraint existente si existe)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_email_key'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_email_key;
  END IF;
END $$;

-- Crear nuevo constraint que permite NULL pero requiere unicidad cuando no es NULL
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique 
ON users(email) 
WHERE email IS NOT NULL;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Ejecutar estas queries para verificar:

-- 1. Ver estructura de la tabla
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'users';

-- 2. Ver constraints
-- SELECT conname, contype 
-- FROM pg_constraint 
-- WHERE conrelid = 'users'::regclass;

-- 3. Ver usuarios
-- SELECT id, username, email, name, role 
-- FROM users 
-- LIMIT 10;

-- =====================================================
-- ROLLBACK (si algo sale mal)
-- =====================================================
-- SOLO EJECUTAR SI NECESITAS REVERTIR LOS CAMBIOS

-- ALTER TABLE users ALTER COLUMN email SET NOT NULL;
-- ALTER TABLE users ALTER COLUMN username DROP NOT NULL;
-- DROP INDEX IF EXISTS users_username_unique;
-- DROP INDEX IF EXISTS users_email_unique;
-- CREATE UNIQUE INDEX users_email_key ON users(email);
