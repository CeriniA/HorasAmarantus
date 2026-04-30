-- ============================================================================
-- RESTAURAR TODOS LOS PERMISOS AL SUPERADMINISTRADOR
-- ============================================================================
-- Descripción: Asigna TODOS los permisos existentes al rol Superadmin
-- Fecha: 2026-04-28
-- Razón: Permisos modificados accidentalmente antes de implementar protección
-- ============================================================================

DO $$
DECLARE
  v_superadmin_id UUID;
  v_permisos_totales INT;
  v_permisos_asignados INT;
  v_permisos_nuevos INT;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '🛡️  RESTAURAR PERMISOS DE SUPERADMINISTRADOR';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';

  -- Obtener ID del Superadmin
  SELECT id INTO v_superadmin_id
  FROM roles
  WHERE slug = 'superadmin';

  IF v_superadmin_id IS NULL THEN
    RAISE EXCEPTION '❌ ERROR: Rol Superadmin no encontrado';
  END IF;

  RAISE NOTICE '✅ Rol Superadmin encontrado: %', v_superadmin_id;

  -- Contar permisos totales
  SELECT COUNT(*) INTO v_permisos_totales
  FROM permissions;

  RAISE NOTICE '📊 Total de permisos en sistema: %', v_permisos_totales;

  -- Contar permisos actuales del Superadmin
  SELECT COUNT(*) INTO v_permisos_asignados
  FROM role_permissions
  WHERE role_id = v_superadmin_id;

  RAISE NOTICE '📊 Permisos actuales de Superadmin: %', v_permisos_asignados;

  -- Eliminar permisos actuales del Superadmin (para evitar duplicados)
  DELETE FROM role_permissions
  WHERE role_id = v_superadmin_id;

  RAISE NOTICE '🗑️  Permisos anteriores eliminados';

  -- Asignar TODOS los permisos al Superadmin
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT 
    v_superadmin_id,
    p.id
  FROM permissions p
  ON CONFLICT (role_id, permission_id) DO NOTHING;

  -- Contar permisos nuevos
  SELECT COUNT(*) INTO v_permisos_nuevos
  FROM role_permissions
  WHERE role_id = v_superadmin_id;

  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ RESTAURACIÓN COMPLETADA';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '📊 RESUMEN:';
  RAISE NOTICE '   • Permisos totales en sistema: %', v_permisos_totales;
  RAISE NOTICE '   • Permisos anteriores: %', v_permisos_asignados;
  RAISE NOTICE '   • Permisos asignados ahora: %', v_permisos_nuevos;
  RAISE NOTICE '';
  
  IF v_permisos_nuevos = v_permisos_totales THEN
    RAISE NOTICE '✅ ÉXITO: Superadmin tiene TODOS los permisos (%/%)', v_permisos_nuevos, v_permisos_totales;
  ELSE
    RAISE WARNING '⚠️  ADVERTENCIA: Superadmin tiene %/% permisos', v_permisos_nuevos, v_permisos_totales;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '🔒 NOTA: A partir de ahora, los permisos del Superadmin';
  RAISE NOTICE '   están protegidos y NO se pueden modificar desde la UI.';
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

END $$;

-- ============================================================================
-- VERIFICACIÓN: Listar permisos del Superadmin
-- ============================================================================

DO $$
DECLARE
  v_superadmin_id UUID;
  rec RECORD;
  v_count INT := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📋 PERMISOS DEL SUPERADMINISTRADOR:';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

  SELECT id INTO v_superadmin_id
  FROM roles
  WHERE slug = 'superadmin';

  FOR rec IN
    SELECT 
      p.resource,
      p.action,
      p.description
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    WHERE rp.role_id = v_superadmin_id
    ORDER BY p.resource, p.action
  LOOP
    v_count := v_count + 1;
    RAISE NOTICE '%3s. % → % (%)', 
      v_count,
      RPAD(rec.resource, 20),
      RPAD(rec.action, 10),
      rec.description;
  END LOOP;

  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'Total: % permisos', v_count;
  RAISE NOTICE '';

END $$;
