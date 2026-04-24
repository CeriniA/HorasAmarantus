-- ============================================================================
-- MIGRACIÓN: Eliminar columna users.role (sistema viejo)
-- Fecha: 2026-04-10
-- Descripción: Elimina la columna role VARCHAR y deja solo role_id UUID
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '🗑️  Eliminando columna users.role...';
  
  -- Verificar que todos los usuarios tienen role_id
  DECLARE
    usuarios_sin_role_id INTEGER;
  BEGIN
    SELECT COUNT(*) INTO usuarios_sin_role_id
    FROM users
    WHERE role_id IS NULL;
    
    IF usuarios_sin_role_id > 0 THEN
      RAISE EXCEPTION 'ERROR: Hay % usuarios sin role_id. Ejecuta primero 20260410_seed_rbac_data.sql', usuarios_sin_role_id;
    END IF;
    
    RAISE NOTICE '  ✅ Todos los usuarios tienen role_id';
  END;
  
  -- Eliminar índice
  DROP INDEX IF EXISTS idx_users_role;
  RAISE NOTICE '  ✅ Índice idx_users_role eliminado';
  
  -- Eliminar constraint CHECK
  ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
  RAISE NOTICE '  ✅ Constraint users_role_check eliminado';
  
  -- Eliminar columna
  ALTER TABLE users DROP COLUMN IF EXISTS role;
  RAISE NOTICE '  ✅ Columna role eliminada';
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ MIGRACIÓN COMPLETADA';
  RAISE NOTICE '📊 Ahora users solo tiene role_id (UUID FK a roles)';
END $$;
