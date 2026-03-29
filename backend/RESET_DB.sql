-- RESET COMPLETO - SOLO DEJA SUPERADMIN
-- ⚠️ CUIDADO: Esto borra TODO excepto el superadmin

-- 1. Borrar todos los time_entries excepto los del superadmin
DELETE FROM time_entries 
WHERE user_id IN (SELECT id FROM users WHERE role != 'superadmin');

-- 2. Borrar todos los usuarios excepto superadmin
DELETE FROM users WHERE role != 'superadmin';

-- 3. Borrar todas las unidades organizacionales excepto la del superadmin
DELETE FROM organizational_units 
WHERE id NOT IN (SELECT organizational_unit_id FROM users WHERE role = 'superadmin');

-- Verificar que quedó solo el superadmin
SELECT 'USUARIOS:' as tabla, COUNT(*) as total FROM users
UNION ALL
SELECT 'UNIDADES:', COUNT(*) FROM organizational_units
UNION ALL
SELECT 'REGISTROS:', COUNT(*) FROM time_entries;
