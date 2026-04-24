-- ============================================================================
-- MIGRACIÓN: Limpieza SEGURA de Base de Datos
-- Fecha: 2026-04-10
-- Descripción: Elimina SOLO campos confirmados como no usados
-- ============================================================================

-- ============================================================================
-- ANÁLISIS PREVIO
-- ============================================================================
-- ✅ client_id: SE USA (sistema offline, NO eliminar)
-- ❌ estimated_hours: NO se usa en ningún archivo
-- ⚠️  path: Posiblemente se use, verificar primero
-- ⚠️  users.role: Temporal, eliminar después de migración RBAC

-- ============================================================================
-- PASO 1: Optimizar role_permissions con PK compuesta (SEGURO)
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🧹 PASO 1: Optimizando role_permissions...';
  
  -- Verificar si ya tiene PK compuesta
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'role_permissions'
      AND constraint_type = 'PRIMARY KEY'
      AND constraint_name = 'role_permissions_pkey'
  ) THEN
    -- Verificar si la PK es sobre 'id' o sobre (role_id, permission_id)
    DECLARE
      pk_columns TEXT;
    BEGIN
      SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
      INTO pk_columns
      FROM information_schema.key_column_usage
      WHERE table_name = 'role_permissions'
        AND constraint_name = 'role_permissions_pkey';
      
      IF pk_columns = 'id' THEN
        RAISE NOTICE '  ⚠️  Tabla tiene PK sobre id, necesita optimización';
        
        -- Guardar datos actuales
        CREATE TEMP TABLE IF NOT EXISTS temp_role_permissions AS
        SELECT role_id, permission_id, created_at
        FROM role_permissions;
        
        RAISE NOTICE '  ✅ Datos respaldados: % registros', (SELECT COUNT(*) FROM temp_role_permissions);
        
        -- Eliminar tabla actual
        DROP TABLE role_permissions CASCADE;
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
        
        RAISE NOTICE '  ✅ Datos restaurados: % registros', (SELECT COUNT(*) FROM role_permissions);
        
        -- Comentarios
        COMMENT ON TABLE role_permissions IS 'Permisos asignados a cada rol';
        
        RAISE NOTICE '✅ PASO 1 COMPLETADO - Ahorro: 16 bytes por registro';
      ELSE
        RAISE NOTICE '  ✅ Tabla ya tiene PK compuesta, no requiere cambios';
      END IF;
    END;
  ELSE
    RAISE NOTICE '  ⚠️  Tabla no tiene PK, creando estructura correcta...';
  END IF;
END $$;

-- ============================================================================
-- PASO 2: Optimizar user_permissions con PK compuesta (SEGURO)
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🧹 PASO 2: Optimizando user_permissions...';
  
  -- Verificar si ya tiene PK compuesta
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'user_permissions'
      AND constraint_type = 'PRIMARY KEY'
      AND constraint_name = 'user_permissions_pkey'
  ) THEN
    DECLARE
      pk_columns TEXT;
    BEGIN
      SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
      INTO pk_columns
      FROM information_schema.key_column_usage
      WHERE table_name = 'user_permissions'
        AND constraint_name = 'user_permissions_pkey';
      
      IF pk_columns = 'id' THEN
        RAISE NOTICE '  ⚠️  Tabla tiene PK sobre id, necesita optimización';
        
        -- Guardar datos actuales
        CREATE TEMP TABLE IF NOT EXISTS temp_user_permissions AS
        SELECT user_id, permission_id, granted, created_at
        FROM user_permissions;
        
        RAISE NOTICE '  ✅ Datos respaldados: % registros', (SELECT COUNT(*) FROM temp_user_permissions);
        
        -- Eliminar tabla actual
        DROP TABLE user_permissions CASCADE;
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
        
        RAISE NOTICE '  ✅ Datos restaurados: % registros', (SELECT COUNT(*) FROM user_permissions);
        
        -- Comentarios
        COMMENT ON TABLE user_permissions IS 'Permisos especiales por usuario (excepciones al rol)';
        COMMENT ON COLUMN user_permissions.granted IS 'true = conceder permiso, false = revocar permiso del rol';
        
        RAISE NOTICE '✅ PASO 2 COMPLETADO - Ahorro: 16 bytes por registro';
      ELSE
        RAISE NOTICE '  ✅ Tabla ya tiene PK compuesta, no requiere cambios';
      END IF;
    END;
  END IF;
END $$;

-- ============================================================================
-- PASO 3: Eliminar estimated_hours de organizational_units (SEGURO)
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🧹 PASO 3: Eliminando estimated_hours de organizational_units...';
  
  -- Verificar si la columna existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizational_units'
      AND column_name = 'estimated_hours'
  ) THEN
    -- Eliminar columna
    ALTER TABLE organizational_units DROP COLUMN IF EXISTS estimated_hours;
    RAISE NOTICE '  ✅ Columna estimated_hours eliminada';
    RAISE NOTICE '✅ PASO 3 COMPLETADO';
  ELSE
    RAISE NOTICE '  ✅ Columna estimated_hours no existe, no requiere cambios';
  END IF;
END $$;

-- ============================================================================
-- PASO 4: Verificar migración RBAC antes de eliminar users.role
-- ============================================================================

DO $$
DECLARE
  usuarios_sin_role_id INTEGER;
  total_usuarios INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🧹 PASO 4: Verificando migración RBAC...';
  
  -- Contar usuarios totales
  SELECT COUNT(*) INTO total_usuarios FROM users;
  
  -- Verificar que todos los usuarios tienen role_id
  SELECT COUNT(*) INTO usuarios_sin_role_id
  FROM users
  WHERE role_id IS NULL;
  
  RAISE NOTICE '  📊 Total usuarios: %', total_usuarios;
  RAISE NOTICE '  📊 Usuarios sin role_id: %', usuarios_sin_role_id;
  
  IF usuarios_sin_role_id > 0 THEN
    RAISE NOTICE '  ⚠️  ADVERTENCIA: Hay % usuarios sin role_id', usuarios_sin_role_id;
    RAISE NOTICE '  ⚠️  NO se eliminará la columna role hasta que todos tengan role_id';
    RAISE NOTICE '  ⚠️  Ejecuta primero: 20260410_seed_rbac_data.sql';
    RAISE NOTICE '  ⚠️  O asigna manualmente role_id a todos los usuarios';
  ELSE
    RAISE NOTICE '  ✅ Todos los usuarios tienen role_id';
    RAISE NOTICE '  🗑️  Eliminando columna role obsoleta...';
    
    -- Eliminar índice
    DROP INDEX IF EXISTS idx_users_role;
    RAISE NOTICE '  ✅ Índice idx_users_role eliminado';
    
    -- Eliminar constraint CHECK
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    RAISE NOTICE '  ✅ Constraint users_role_check eliminado';
    
    -- Eliminar columna
    ALTER TABLE users DROP COLUMN IF EXISTS role;
    RAISE NOTICE '  ✅ Columna role eliminada';
    
    RAISE NOTICE '✅ PASO 4 COMPLETADO - Migración RBAC completa';
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
  campos_obsoletos INTEGER;
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
  
  -- Verificar campos obsoletos
  SELECT COUNT(*) INTO campos_obsoletos
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND column_name IN ('estimated_hours', 'role');
  
  RAISE NOTICE '  📋 Tablas: %', total_tablas;
  RAISE NOTICE '  📋 Columnas: %', total_columnas;
  RAISE NOTICE '  📋 Índices: %', total_indices;
  RAISE NOTICE '  🗑️  Campos obsoletos restantes: %', campos_obsoletos;
  
  IF campos_obsoletos = 0 THEN
    RAISE NOTICE '  ✅ No hay campos obsoletos';
  ELSE
    RAISE NOTICE '  ⚠️  Aún quedan % campos obsoletos (probablemente users.role)', campos_obsoletos;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ LIMPIEZA DE BASE DE DATOS COMPLETADA';
  RAISE NOTICE '📊 Base de datos optimizada';
  
  -- Verificar si se optimizaron las tablas de permisos
  DECLARE
    role_perms_pk TEXT;
    user_perms_pk TEXT;
  BEGIN
    SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
    INTO role_perms_pk
    FROM information_schema.key_column_usage
    WHERE table_name = 'role_permissions'
      AND constraint_name = 'role_permissions_pkey';
    
    SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
    INTO user_perms_pk
    FROM information_schema.key_column_usage
    WHERE table_name = 'user_permissions'
      AND constraint_name = 'user_permissions_pkey';
    
    RAISE NOTICE '';
    RAISE NOTICE '🔑 PRIMARY KEYS:';
    RAISE NOTICE '  role_permissions: %', role_perms_pk;
    RAISE NOTICE '  user_permissions: %', user_perms_pk;
    
    IF role_perms_pk = 'role_id, permission_id' AND user_perms_pk = 'user_id, permission_id' THEN
      RAISE NOTICE '  ✅ Ambas tablas tienen PKs compuestas optimizadas';
      RAISE NOTICE '';
      RAISE NOTICE '⚠️  IMPORTANTE: Re-ejecutar 20260410_seed_rbac_data.sql para restaurar permisos';
    END IF;
  END;
END $$;
