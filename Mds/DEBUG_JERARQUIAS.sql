-- =====================================================
-- DEBUG: Verificar jerarquías en organizational_units
-- =====================================================

-- 1. Ver todas las unidades con su jerarquía
SELECT 
  id,
  name,
  type,
  parent_id,
  path,
  is_active
FROM organizational_units
ORDER BY 
  CASE type
    WHEN 'area' THEN 1
    WHEN 'process' THEN 2
    WHEN 'subprocess' THEN 3
    WHEN 'task' THEN 4
  END,
  name;

-- 2. Ver áreas (sin parent)
SELECT 
  id,
  name,
  type,
  parent_id,
  'ÁREA SIN PARENT' as nota
FROM organizational_units
WHERE type = 'area'
ORDER BY name;

-- 3. Ver procesos y sus áreas padre
SELECT 
  p.id,
  p.name as proceso,
  p.type,
  p.parent_id,
  a.name as area_padre,
  a.type as tipo_padre
FROM organizational_units p
LEFT JOIN organizational_units a ON p.parent_id = a.id
WHERE p.type = 'process'
ORDER BY a.name, p.name;

-- 4. Ver subprocesos y sus procesos padre
SELECT 
  s.id,
  s.name as subproceso,
  s.type,
  s.parent_id,
  p.name as proceso_padre,
  p.type as tipo_padre,
  a.name as area_abuelo
FROM organizational_units s
LEFT JOIN organizational_units p ON s.parent_id = p.id
LEFT JOIN organizational_units a ON p.parent_id = a.id
WHERE s.type = 'subprocess'
ORDER BY a.name, p.name, s.name;

-- 5. Contar por tipo
SELECT 
  type,
  COUNT(*) as cantidad,
  COUNT(parent_id) as con_parent,
  COUNT(*) - COUNT(parent_id) as sin_parent
FROM organizational_units
WHERE is_active = true
GROUP BY type
ORDER BY 
  CASE type
    WHEN 'area' THEN 1
    WHEN 'process' THEN 2
    WHEN 'subprocess' THEN 3
    WHEN 'task' THEN 4
  END;

-- 6. Verificar parent_id inválidos (que no existen)
SELECT 
  u.id,
  u.name,
  u.type,
  u.parent_id,
  'PARENT_ID NO EXISTE' as problema
FROM organizational_units u
WHERE u.parent_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM organizational_units p 
    WHERE p.id = u.parent_id
  );

-- 7. Ver jerarquía completa de ejemplo
WITH RECURSIVE hierarchy AS (
  -- Áreas (nivel 1)
  SELECT 
    id,
    name,
    type,
    parent_id,
    1 as nivel,
    name as ruta
  FROM organizational_units
  WHERE type = 'area' AND is_active = true
  
  UNION ALL
  
  -- Hijos (niveles 2+)
  SELECT 
    u.id,
    u.name,
    u.type,
    u.parent_id,
    h.nivel + 1,
    h.ruta || ' > ' || u.name
  FROM organizational_units u
  INNER JOIN hierarchy h ON u.parent_id = h.id
  WHERE u.is_active = true
)
SELECT 
  REPEAT('  ', nivel - 1) || name as jerarquia,
  type,
  id,
  parent_id,
  ruta
FROM hierarchy
ORDER BY ruta;
