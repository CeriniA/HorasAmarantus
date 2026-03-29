-- Corregir usuarios que no tienen is_active en true
UPDATE users 
SET is_active = true 
WHERE role != 'superadmin' AND (is_active IS NULL OR is_active = false);

-- Verificar que se aplicó
SELECT username, name, role, is_active FROM users WHERE role != 'superadmin';
