-- ============================================================================
-- MIGRACIÓN: Mejorar Sistema de Objetivos
-- Fecha: 2026-04-10
-- Descripción: Agrega soporte para objetivos asignados a usuarios y distribución semanal
-- ============================================================================

-- ============================================================================
-- PASO 1: Agregar nuevas columnas a tabla objectives
-- ============================================================================

-- Tipo de objetivo
ALTER TABLE objectives
ADD COLUMN objective_type VARCHAR(20) DEFAULT 'company'
CHECK (objective_type IN ('company', 'assigned', 'personal'));

-- Usuario asignado (solo para objetivos 'assigned' y 'personal')
ALTER TABLE objectives
ADD COLUMN assigned_to_user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Hacer organizational_unit_id opcional (puede ser NULL para objetivos personales)
ALTER TABLE objectives
ALTER COLUMN organizational_unit_id DROP NOT NULL;

-- Comentarios
COMMENT ON COLUMN objectives.objective_type IS 'Tipo: company (área), assigned (asignado a usuario), personal (auto-asignado)';
COMMENT ON COLUMN objectives.assigned_to_user_id IS 'Usuario asignado (solo para assigned y personal)';

-- ============================================================================
-- PASO 2: Crear tabla para distribución semanal
-- ============================================================================

CREATE TABLE IF NOT EXISTS objective_weekly_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relación con objetivo
  objective_id UUID NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
  
  -- Día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  
  -- Horas asignadas para este día
  hours_allocated DECIMAL(5, 2) NOT NULL CHECK (hours_allocated > 0),
  
  -- Horario específico (opcional)
  start_time TIME,
  end_time TIME,
  
  -- Si este día está activo
  is_active BOOLEAN DEFAULT true,
  
  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un objetivo no puede tener dos configuraciones para el mismo día
  CONSTRAINT unique_objective_day UNIQUE(objective_id, day_of_week),
  
  -- Validar que end_time > start_time si ambos están definidos
  CONSTRAINT valid_time_range CHECK (
    (start_time IS NULL AND end_time IS NULL) OR
    (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
  )
);

-- Índices
CREATE INDEX idx_weekly_schedule_objective ON objective_weekly_schedule(objective_id);
CREATE INDEX idx_weekly_schedule_day ON objective_weekly_schedule(day_of_week);
CREATE INDEX idx_weekly_schedule_active ON objective_weekly_schedule(is_active);

-- Comentarios
COMMENT ON TABLE objective_weekly_schedule IS 'Distribución semanal de horas para objetivos asignados';
COMMENT ON COLUMN objective_weekly_schedule.day_of_week IS '0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado';
COMMENT ON COLUMN objective_weekly_schedule.hours_allocated IS 'Horas asignadas para este día específico';
COMMENT ON COLUMN objective_weekly_schedule.start_time IS 'Hora de inicio (opcional)';
COMMENT ON COLUMN objective_weekly_schedule.end_time IS 'Hora de fin (opcional)';

-- ============================================================================
-- PASO 3: Actualizar objetivos existentes
-- ============================================================================

-- Marcar todos los objetivos existentes como 'company'
UPDATE objectives
SET objective_type = 'company'
WHERE objective_type IS NULL;

-- ============================================================================
-- PASO 4: Crear índices adicionales
-- ============================================================================

CREATE INDEX idx_objectives_type ON objectives(objective_type);
CREATE INDEX idx_objectives_assigned_user ON objectives(assigned_to_user_id);

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Ver estructura de objectives
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'objectives'
ORDER BY ordinal_position;

-- Ver estructura de objective_weekly_schedule
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'objective_weekly_schedule'
ORDER BY ordinal_position;

-- ============================================================================
-- RESUMEN
-- ============================================================================
-- ✅ MIGRACIÓN COMPLETADA
-- 
-- Cambios realizados:
--   1. Agregada columna objective_type (company/assigned/personal)
--   2. Agregada columna assigned_to_user_id
--   3. organizational_unit_id ahora es opcional
--   4. Creada tabla objective_weekly_schedule
--   5. Objetivos existentes marcados como 'company'
-- 
-- Próximos pasos:
--   1. Actualizar backend para manejar los 3 tipos de objetivos
--   2. Crear componentes frontend para asignación
--   3. Implementar selector de distribución semanal
