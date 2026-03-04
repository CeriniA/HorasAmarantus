-- =====================================================
-- SCHEMA SIMPLIFICADO - SIN RLS
-- Backend maneja todos los permisos
-- =====================================================

-- Habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Eliminar tablas existentes
DROP TABLE IF EXISTS time_entries CASCADE;
DROP TABLE IF EXISTS organizational_units CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- TABLA: users
-- =====================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'operario' CHECK (role IN ('admin', 'supervisor', 'operario')),
  organizational_unit_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- TABLA: organizational_units
-- =====================================================

CREATE TABLE organizational_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('area', 'proceso', 'subproceso', 'tarea')),
  parent_id UUID REFERENCES organizational_units(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 0,
  path TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_org_units_parent_id ON organizational_units(parent_id);
CREATE INDEX idx_org_units_type ON organizational_units(type);

-- =====================================================
-- TABLA: time_entries
-- =====================================================

CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organizational_unit_id UUID NOT NULL REFERENCES organizational_units(id) ON DELETE RESTRICT,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  total_hours DECIMAL(10, 2),
  status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT check_end_time_after_start CHECK (end_time > start_time),
  CONSTRAINT check_total_hours CHECK (total_hours > 0 AND total_hours <= 24)
);

CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_org_unit_id ON time_entries(organizational_unit_id);
CREATE INDEX idx_time_entries_start_time ON time_entries(start_time);

-- =====================================================
-- FOREIGN KEYS
-- =====================================================

ALTER TABLE users 
ADD CONSTRAINT fk_users_organizational_unit 
FOREIGN KEY (organizational_unit_id) 
REFERENCES organizational_units(id) 
ON DELETE SET NULL;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_units_updated_at BEFORE UPDATE ON organizational_units
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para calcular total_hours
CREATE OR REPLACE FUNCTION calculate_total_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.total_hours = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 3600;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_hours_trigger 
BEFORE INSERT OR UPDATE ON time_entries
FOR EACH ROW EXECUTE FUNCTION calculate_total_hours();

-- Trigger para calcular jerarquía
CREATE OR REPLACE FUNCTION calculate_org_unit_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
  parent_level INTEGER;
  parent_path TEXT;
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.level = 0;
    NEW.path = NEW.id::TEXT;
  ELSE
    SELECT level, path INTO parent_level, parent_path
    FROM organizational_units
    WHERE id = NEW.parent_id;
    
    NEW.level = parent_level + 1;
    NEW.path = parent_path || '/' || NEW.id::TEXT;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER org_unit_hierarchy_trigger 
BEFORE INSERT OR UPDATE ON organizational_units
FOR EACH ROW EXECUTE FUNCTION calculate_org_unit_hierarchy();

-- =====================================================
-- VISTAS
-- =====================================================

CREATE OR REPLACE VIEW user_hours_summary AS
SELECT 
  u.id as user_id,
  u.name as user_name,
  u.email,
  u.role,
  COUNT(te.id) as total_entries,
  COALESCE(SUM(te.total_hours), 0) as total_hours,
  COALESCE(AVG(te.total_hours), 0) as avg_hours_per_entry,
  MAX(te.start_time) as last_entry_date
FROM users u
LEFT JOIN time_entries te ON u.id = te.user_id
GROUP BY u.id, u.name, u.email, u.role;

-- =====================================================
-- NO RLS - Backend maneja permisos
-- =====================================================

-- Deshabilitar RLS (por defecto está deshabilitado, pero por si acaso)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizational_units DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- FIN DEL SCHEMA
-- =====================================================
