-- =====================================================
-- VERIFICACIÓN RÁPIDA DE JERARQUÍAS
-- Ejecutar en Supabase Dashboard → SQL Editor
-- =====================================================

-- 1. Ver TODAS las unidades con su información completa
SELECT 
  id,
  name,
  type,
  parent_id,
  path,
  is_active,
  created_at
FROM organizational_units
WHERE is_active = true
ORDER BY 
  CASE type
    WHEN 'area' THEN 1
    WHEN 'process' THEN 2
    WHEN 'subprocess' THEN 3
    WHEN 'task' THEN 4
  END,
  name;

-- 2. Contar por tipo
SELECT 
  type,
  COUNT(*) as total,
  COUNT(parent_id) as con_parent,
  COUNT(*) - COUNT(parent_id) as sin_parent
FROM organizational_units
WHERE is_active = true
GROUP BY type;

-- 3. Ver ÁREAS (deben tener parent_id = NULL)
SELECT 
  id,
  name,
  type,
  parent_id,
  CASE 
    WHEN parent_id IS NULL THEN '✅ OK'
    ELSE '❌ ERROR: tiene parent_id'
  END as estado
FROM organizational_units
WHERE type = 'area' AND is_active = true;

-- 4. Ver PROCESOS con sus áreas padre
SELECT 
  p.id as proceso_id,
  p.name as proceso,
  p.parent_id,
  a.name as area_padre,
  a.type as tipo_padre,
  CASE 
    WHEN p.parent_id IS NULL THEN '❌ ERROR: sin parent_id'
    WHEN a.id IS NULL THEN '❌ ERROR: parent_id no existe'
    WHEN a.type != 'area' THEN '❌ ERROR: parent no es área'
    ELSE '✅ OK'
  END as estado
FROM organizational_units p
LEFT JOIN organizational_units a ON p.parent_id = a.id
WHERE p.type = 'process' AND p.is_active = true
ORDER BY a.name, p.name;

-- 5. Ver SUBPROCESOS con sus procesos padre
SELECT 
  s.id as subproceso_id,
  s.name as subproceso,
  s.parent_id,
  p.name as proceso_padre,
  p.type as tipo_padre,
  CASE 
    WHEN s.parent_id IS NULL THEN '❌ ERROR: sin parent_id'
    WHEN p.id IS NULL THEN '❌ ERROR: parent_id no existe'
    WHEN p.type != 'process' THEN '❌ ERROR: parent no es proceso'
    ELSE '✅ OK'
  END as estado
FROM organizational_units s
LEFT JOIN organizational_units p ON s.parent_id = p.id
WHERE s.type = 'subprocess' AND s.is_active = true
ORDER BY p.name, s.name;

-- 6. JERARQUÍA COMPLETA EN ÁRBOL
-- Buscar área "Producción" específicamente
SELECT 
  'ÁREA: ' || a.name as jerarquia,
  a.id,
  a.type
FROM organizational_units a
WHERE a.type = 'area' 
  AND a.is_active = true
  AND LOWER(a.name) LIKE '%producc%'

UNION ALL

SELECT 
  '  └─ PROCESO: ' || p.name as jerarquia,
  p.id,
  p.type
FROM organizational_units p
INNER JOIN organizational_units a ON p.parent_id = a.id
WHERE p.type = 'process' 
  AND p.is_active = true
  AND a.type = 'area'
  AND LOWER(a.name) LIKE '%producc%'

UNION ALL

SELECT 
  '      └─ SUBPROCESO: ' || s.name as jerarquia,
  s.id,
  s.type
FROM organizational_units s
INNER JOIN organizational_units p ON s.parent_id = p.id
INNER JOIN organizational_units a ON p.parent_id = a.id
WHERE s.type = 'subprocess' 
  AND s.is_active = true
  AND p.type = 'process'
  AND a.type = 'area'
  AND LOWER(a.name) LIKE '%producc%';

-- 7. VERIFICAR: ¿Hay procesos que apuntan a "Producción"?
-- Primero obtener el ID de Producción
SELECT 
  'ID de Producción:' as info,
  id,
  name,
  type
FROM organizational_units
WHERE type = 'area' 
  AND LOWER(name) LIKE '%producc%'
  AND is_active = true;

-- Luego ver qué procesos apuntan a ese ID
-- IMPORTANTE: Reemplaza 'ID_DE_PRODUCCION' con el ID real que obtuviste arriba
SELECT 
  'Procesos de Producción:' as info,
  id,
  name,
  type,
  parent_id
FROM organizational_units
WHERE type = 'process' 
  AND parent_id = (
    SELECT id FROM organizational_units 
    WHERE type = 'area' 
      AND LOWER(name) LIKE '%producc%' 
      AND is_active = true 
    LIMIT 1
  )
  AND is_active = true;

-- 8. DIAGNÓSTICO: Problemas comunes
SELECT 
  'DIAGNÓSTICO' as categoria,
  CASE 
    WHEN COUNT(*) FILTER (WHERE type = 'area' AND parent_id IS NOT NULL) > 0 
    THEN '❌ Hay áreas con parent_id (deben ser NULL)'
    ELSE '✅ Áreas OK'
  END as areas,
  CASE 
    WHEN COUNT(*) FILTER (WHERE type = 'process' AND parent_id IS NULL) > 0 
    THEN '❌ Hay procesos sin parent_id'
    ELSE '✅ Procesos OK'
  END as procesos,
  CASE 
    WHEN COUNT(*) FILTER (WHERE type = 'subprocess' AND parent_id IS NULL) > 0 
    THEN '❌ Hay subprocesos sin parent_id'
    ELSE '✅ Subprocesos OK'
  END as subprocesos
FROM organizational_units
WHERE is_active = true;
