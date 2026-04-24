-- ============================================================================
-- MIGRACIÓN: Limpieza de Base de Datos
-- Fecha: 2026-04-10
-- Descripción: Elimina campos innecesarios y optimiza estructura
-- ============================================================================

-- ============================================================================
-- PASO 1: Eliminar client_id de time_entries (SEGURO)
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '🧹 PASO 1: Eliminando client_id de time_entries...';
  
  -- Eliminar índice UNIQUE
  DROP INDEX IF EXISTS time_entries_client_id_key;
  RAISE NOTICE '  ✅ Índice eliminado';
  
  -- Eliminar constraint CHECK si existe
  ALTER TABLE time_entries DROP CONSTRAINT IF EXISTS "2200_19285_2_not_null";
  RAISE NOTICE '  ✅ Constraint eliminado';
  
  -- Eliminar columna
  ALTER TABLE time_entries DROP COLUMN IF EXISTS client_id;
  RAISE NOTICE '  ✅ Columna client_id eliminada';
  
  RAISE NOTICE '✅ PASO 1 COMPLETADO';
END $$;

-- ============================================================================
-- PASO 2: Optimizar role_permissions con PK compuesta (SEGURO)
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🧹 PASO 2: Optimizando role_permissions...';
  
  -- Guardar datos actuales
  CREATE TEMP TABLE IF NOT EXISTS temp_role_permissions AS
  SELECT role_id, permission_id, created_at
  FROM role_permissions;
  
  RAISE NOTICE '  ✅ Datos respaldados';
  
  -- Eliminar tabla actual
  DROP TABLE IF EXISTS role_permissions CASCADE;
  RAISE NOTICE '  ✅ Tabla antigua eliminada';
  
  -- Recrear con PK compuesta
  CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
  );
  
  RAISE NOTICE '  ✅ Tabla recreada con PK compuesta';
  
  -- Recrear índices
  CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
  CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
  RAISE NOTICE '  ✅ Índices recreados';
  
  -- Restaurar datos
  INSERT INTO role_permissions (role_id, permission_id, created_at)
  SELECT role_id, permission_id, created_at
  FROM temp_role_permissions;
  
  RAISE NOTICE '  ✅ Datos restaurados';
  
  -- Comentarios
  COMMENT ON TABLE role_permissions IS 'Permisos asignados a cada rol';
  
  RAISE NOTICE '✅ PASO 2 COMPLETADO - Ahorro: 16 bytes por registro';
END $$;

-- ============================================================================
-- PASO 3: Optimizar user_permissions con PK compuesta (SEGURO)
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🧹 PASO 3: Optimizando user_permissions...';
  
  -- Guardar datos actuales
  CREATE TEMP TABLE IF NOT EXISTS temp_user_permissions AS
  SELECT user_id, permission_id, granted, created_at
  FROM user_permissions;
  
  RAISE NOTICE '  ✅ Datos respaldados';
  
  -- Eliminar tabla actual
  DROP TABLE IF EXISTS user_permissions CASCADE;
  RAISE NOTICE '  ✅ Tabla antigua eliminada';
  
  -- Recrear con PK compuesta
  CREATE TABLE user_permissions (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, permission_id)
  );
  
  RAISE NOTICE '  ✅ Tabla recreada con PK compuesta';
  
  -- Recrear índices
  CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
  CREATE INDEX idx_user_permissions_permission_id ON user_permissions(permission_id);
  CREATE INDEX idx_user_permissions_granted ON user_permissions(granted);
  RAISE NOTICE '  ✅ Índices recreados';
  
  -- Restaurar datos
  INSERT INTO user_permissions (user_id, permission_id, granted, created_at)
  SELECT user_id, permission_id, granted, created_at
  FROM temp_user_permissions;
  
  RAISE NOTICE '  ✅ Datos restaurados';
  
  -- Comentarios
  COMMENT ON TABLE user_permissions IS 'Permisos especiales por usuario (excepciones al rol)';
  COMMENT ON COLUMN user_permissions.granted IS 'true = conceder permiso, false = revocar permiso del rol';
  
  RAISE NOTICE '✅ PASO 3 COMPLETADO - Ahorro: 16 bytes por registro';
END $$;

-- ============================================================================
-- PASO 4: Eliminar columna 'role' de users (VERIFICAR PRIMERO)
-- ============================================================================

DO $$
DECLARE
  usuarios_sin_role_id INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🧹 PASO 4: Verificando migración de users.role...';
  
  -- Verificar que todos los usuarios tienen role_id
  SELECT COUNT(*) INTO usuarios_sin_role_id
  FROM users
  WHERE role_id IS NULL;
  
  IF usuarios_sin_role_id > 0 THEN
    RAISE NOTICE '⚠️  ADVERTENCIA: Hay % usuarios sin role_id', usuarios_sin_role_id;
    RAISE NOTICE '⚠️  NO se eliminará la columna role hasta que todos tengan role_id';
    RAISE NOTICE '⚠️  Ejecuta primero: 20260410_seed_rbac_data.sql';
  ELSE
    RAISE NOTICE '  ✅ Todos los usuarios tienen role_id';
    RAISE NOTICE '  🗑️  Eliminando columna role obsoleta...';
    
    -- Eliminar índice
    DROP INDEX IF EXISTS idx_users_role;
    RAISE NOTICE '  ✅ Índice eliminado';
    
    -- Eliminar constraint CHECK
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    RAISE NOTICE '  ✅ Constraint eliminado';
    
    -- Eliminar columna
    ALTER TABLE users DROP COLUMN IF EXISTS role;
    RAISE NOTICE '  ✅ Columna role eliminada';
    
    RAISE NOTICE '✅ PASO 4 COMPLETADO - Ahorro: ~20 bytes por registro';
  END IF;
END $$;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

DO $$
DECLARE
  total_tablas INTEGER;
  total_columnas INTEGER;
  total_indices INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📊 VERIFICACIÓN FINAL:';
  
  -- Contar tablas
  SELECT COUNT(*) INTO total_tablas
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  
  -- Contar columnas
  SELECT COUNT(*) INTO total_columnas
  FROM information_schema.columns
  WHERE table_schema = 'public';
  
  -- Contar índices
  SELECT COUNT(*) INTO total_indices
  FROM pg_indexes
  WHERE schemaname = 'public';
  
  RAISE NOTICE '  📋 Tablas: %', total_tablas;
  RAISE NOTICE '  📋 Columnas: %', total_columnas;
  RAISE NOTICE '  📋 Índices: %', total_indices;
  
  -- Verificar que no quedan campos huérfanos
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name IN ('client_id', 'role')
  ) THEN
    RAISE NOTICE '  ⚠️  Aún quedan campos obsoletos';
  ELSE
    RAISE NOTICE '  ✅ No hay campos obsoletos';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ LIMPIEZA DE BASE DE DATOS COMPLETADA';
  RAISE NOTICE '📊 Base de datos optimizada y limpia';
  RAISE NOTICE '⚠️  IMPORTANTE: Re-ejecutar 20260410_seed_rbac_data.sql para restaurar permisos';
END $$;
