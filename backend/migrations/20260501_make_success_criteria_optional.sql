-- ============================================================================
-- Migración: Hacer success_criteria opcional
-- Fecha: 2026-05-01
-- Descripción: Permite crear objetivos sin criterios de éxito definidos
-- ============================================================================

-- Hacer success_criteria opcional
ALTER TABLE objectives 
ALTER COLUMN success_criteria DROP NOT NULL;

-- Actualizar comentario
COMMENT ON COLUMN objectives.success_criteria IS 'Criterios de cumplimiento (opcional, markdown)';

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Ver que success_criteria ahora permite NULL
SELECT 
  column_name,
  is_nullable,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'objectives' 
  AND column_name = 'success_criteria';

-- Resultado esperado: is_nullable = 'YES'

-- ============================================================================
-- RESUMEN
-- ============================================================================
-- ✅ success_criteria ahora es opcional (NULL permitido)
-- ✅ Objetivos pueden crearse sin criterios formales
-- ✅ Compatible con objetivos asignados simples
-- ✅ No afecta objetivos existentes
-- 
-- INSTRUCCIONES:
-- 1. Copiar este SQL completo
-- 2. Pegar en la consola SQL de Supabase
-- 3. Ejecutar
-- 4. Verificar que is_nullable = 'YES' en el resultado
-- ============================================================================
