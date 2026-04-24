-- ============================================================================
-- Migración: Sistema de Objetivos
-- Fecha: 2026-04-09
-- Descripción: Tabla para gestionar objetivos por área/proceso con criterios
--              de cumplimiento y análisis de eficiencia/eficacia
-- ============================================================================

-- Crear tabla de objetivos
CREATE TABLE IF NOT EXISTS objectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Información básica
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Período del objetivo
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Horas objetivo (planeadas)
  target_hours DECIMAL(10, 2) NOT NULL,
  
  -- Unidad organizacional asignada
  organizational_unit_id UUID NOT NULL REFERENCES organizational_units(id) ON DELETE CASCADE,
  
  -- Criterios de cumplimiento (texto libre, markdown)
  success_criteria TEXT NOT NULL,
  
  -- Estado del objetivo
  status VARCHAR(50) NOT NULL DEFAULT 'planned',
  -- Valores posibles: 'planned', 'in_progress', 'completed', 'cancelled'
  
  -- Evaluación de cumplimiento (se llena al finalizar)
  is_completed BOOLEAN DEFAULT NULL,
  completion_notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES users(id),
  
  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),
  
  -- Constraints
  CONSTRAINT valid_date_range CHECK (end_date >= start_date),
  CONSTRAINT valid_target_hours CHECK (target_hours > 0),
  CONSTRAINT valid_status CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled'))
);

-- Índices para mejorar performance
CREATE INDEX idx_objectives_org_unit ON objectives(organizational_unit_id);
CREATE INDEX idx_objectives_status ON objectives(status);
CREATE INDEX idx_objectives_dates ON objectives(start_date, end_date);
CREATE INDEX idx_objectives_created_by ON objectives(created_by);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_objectives_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_objectives_updated_at
  BEFORE UPDATE ON objectives
  FOR EACH ROW
  EXECUTE FUNCTION update_objectives_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE objectives IS 'Objetivos por área/proceso con análisis de eficiencia y eficacia';
COMMENT ON COLUMN objectives.name IS 'Nombre descriptivo del objetivo';
COMMENT ON COLUMN objectives.target_hours IS 'Horas planeadas para cumplir el objetivo';
COMMENT ON COLUMN objectives.success_criteria IS 'Criterios claros y medibles de cumplimiento (markdown)';
COMMENT ON COLUMN objectives.status IS 'Estado: planned, in_progress, completed, cancelled';
COMMENT ON COLUMN objectives.is_completed IS 'NULL = no evaluado, TRUE = cumplido, FALSE = no cumplido';
COMMENT ON COLUMN objectives.completion_notes IS 'Notas sobre el cumplimiento o incumplimiento';

-- Datos de ejemplo (opcional, comentado por defecto)
/*
INSERT INTO objectives (
  name, 
  description,
  start_date, 
  end_date, 
  target_hours,
  organizational_unit_id,
  success_criteria,
  status,
  created_by
) VALUES (
  'Cierre Contable Q1 2026',
  'Completar el cierre contable del primer trimestre 2026',
  '2026-01-01',
  '2026-03-31',
  1000.00,
  (SELECT id FROM organizational_units WHERE name = 'Contabilidad' LIMIT 1),
  E'- Balance general presentado a gerencia\n- Estado de resultados completo\n- Conciliaciones bancarias al 100%\n- Cero errores críticos en auditoría',
  'completed',
  (SELECT id FROM users WHERE role = 'superadmin' LIMIT 1)
);
*/
