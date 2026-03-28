-- ============================================
-- SCRIPT: Verificar y Actualizar created_at
-- ============================================

-- 1. VERIFICAR usuarios sin created_at
SELECT 
    id,
    username,
    name,
    role,
    created_at,
    CASE 
        WHEN created_at IS NULL THEN '❌ SIN FECHA'
        ELSE '✅ CON FECHA'
    END as estado
FROM users
ORDER BY created_at NULLS FIRST;

-- 2. CONTAR usuarios sin created_at
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(created_at) as con_fecha,
    COUNT(*) - COUNT(created_at) as sin_fecha
FROM users;

-- 3. ACTUALIZAR usuarios sin created_at
-- OPCIÓN A: Usar fecha actual para todos
UPDATE users 
SET created_at = NOW() 
WHERE created_at IS NULL;

-- OPCIÓN B: Usar fechas escalonadas (más realista)
-- Esto asigna fechas progresivas hacia atrás desde hoy
WITH numbered_users AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (ORDER BY id) as rn,
        COUNT(*) OVER () as total
    FROM users
    WHERE created_at IS NULL
)
UPDATE users u
SET created_at = NOW() - (nu.rn * INTERVAL '7 days')
FROM numbered_users nu
WHERE u.id = nu.id;

-- 4. VERIFICAR después de actualizar
SELECT 
    id,
    username,
    name,
    role,
    created_at,
    TO_CHAR(created_at, 'DD/MM/YYYY') as fecha_creacion
FROM users
ORDER BY created_at DESC;

-- 5. ASEGURAR que nuevos usuarios tengan created_at
-- Verificar que la columna tenga valor por defecto
ALTER TABLE users 
ALTER COLUMN created_at SET DEFAULT NOW();

-- 6. VERIFICAR configuración de la columna
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users' 
AND column_name = 'created_at';
