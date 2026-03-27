-- =====================================================
-- MIGRACIÓN: Cambiar timestamps a WITHOUT TIME ZONE
-- Fecha: 2026-03-26
-- Razón: Los timestamps deben guardarse tal cual el usuario los ingresa
--        sin conversiones de zona horaria
-- =====================================================

-- 1. Cambiar tipo de columnas start_time y end_time
ALTER TABLE time_entries 
  ALTER COLUMN start_time TYPE TIMESTAMP WITHOUT TIME ZONE,
  ALTER COLUMN end_time TYPE TIMESTAMP WITHOUT TIME ZONE;

-- 2. Cambiar created_at y updated_at también (opcional pero recomendado)
ALTER TABLE time_entries 
  ALTER COLUMN created_at TYPE TIMESTAMP WITHOUT TIME ZONE,
  ALTER COLUMN updated_at TYPE TIMESTAMP WITHOUT TIME ZONE;

-- 3. Actualizar el trigger para que use NOW() sin zona horaria
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Nota: Los datos existentes se mantienen, solo cambia cómo se interpretan
-- Los timestamps que antes eran "2026-03-26T08:00:00+00:00"
-- ahora se leerán como "2026-03-26T08:00:00" (sin zona horaria)
