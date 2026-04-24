-- ============================================================================
-- CONSULTA: Analizar estructura completa de la base de datos
-- Propósito: Ver todas las tablas, columnas, tipos y constraints
-- ============================================================================

-- 1. LISTAR TODAS LAS TABLAS
SELECT 
  '=== TABLAS EXISTENTES ===' as info,
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. ESTRUCTURA DETALLADA DE CADA TABLA
SELECT 
  '=== ESTRUCTURA DE TABLAS ===' as info,
  t.table_name,
  c.column_name,
  c.data_type,
  c.character_maximum_length,
  c.is_nullable,
  c.column_default,
  CASE 
    WHEN pk.column_name IS NOT NULL THEN 'PK'
    WHEN fk.column_name IS NOT NULL THEN 'FK → ' || fk.foreign_table_name
    ELSE ''
  END as key_info
FROM information_schema.tables t
JOIN information_schema.columns c 
  ON t.table_name = c.table_name 
  AND t.table_schema = c.table_schema
LEFT JOIN (
  SELECT 
    kcu.table_name,
    kcu.column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
  WHERE tc.constraint_type = 'PRIMARY KEY'
) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
LEFT JOIN (
  SELECT 
    kcu.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage ccu 
    ON tc.constraint_name = ccu.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;

-- 3. ÍNDICES DE CADA TABLA
SELECT 
  '=== ÍNDICES ===' as info,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 4. CONSTRAINTS (UNIQUE, CHECK, etc.)
SELECT 
  '=== CONSTRAINTS ===' as info,
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- 5. FOREIGN KEYS DETALLADAS
SELECT 
  '=== FOREIGN KEYS ===' as info,
  tc.table_name AS tabla_origen,
  kcu.column_name AS columna_origen,
  ccu.table_name AS tabla_destino,
  ccu.column_name AS columna_destino,
  rc.update_rule AS on_update,
  rc.delete_rule AS on_delete
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON tc.constraint_name = ccu.constraint_name
JOIN information_schema.referential_constraints rc 
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 6. TAMAÑO DE CADA TABLA
SELECT 
  '=== TAMAÑO DE TABLAS ===' as info,
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 7. RESUMEN EJECUTIVO
SELECT 
  '=== RESUMEN ===' as info,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tablas,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public') as total_columnas,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indices,
  (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = 'public' AND constraint_type = 'FOREIGN KEY') as total_foreign_keys;
