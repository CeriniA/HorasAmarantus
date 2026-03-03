-- =====================================================
-- SISTEMA DE HORAS HORTÍCOLA - SCHEMA COMPLETO
-- =====================================================
-- Ejecutar este script en Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Pegar y Run
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('admin', 'supervisor', 'operario');
CREATE TYPE organizational_unit_type AS ENUM ('area', 'proceso', 'subproceso', 'tarea');
CREATE TYPE time_entry_status AS ENUM ('in_progress', 'completed');

-- =====================================================
-- TABLA: users
-- =====================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'operario',
  organizational_unit_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_organizational_unit_id ON users(organizational_unit_id);

-- =====================================================
-- TABLA: organizational_units
-- =====================================================

CREATE TABLE organizational_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type organizational_unit_type NOT NULL,
  parent_id UUID REFERENCES organizational_units(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 0,
  path TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para organizational_units
CREATE INDEX idx_org_units_parent_id ON organizational_units(parent_id);
CREATE INDEX idx_org_units_type ON organizational_units(type);
CREATE INDEX idx_org_units_path ON organizational_units USING gin(to_tsvector('spanish', path));
CREATE INDEX idx_org_units_level ON organizational_units(level);

-- =====================================================
-- TABLA: time_entries
-- =====================================================

CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organizational_unit_id UUID NOT NULL REFERENCES organizational_units(id) ON DELETE RESTRICT,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  total_hours DECIMAL(10, 2),
  status time_entry_status NOT NULL DEFAULT 'in_progress',
  synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT check_end_time_after_start CHECK (end_time IS NULL OR end_time > start_time),
  CONSTRAINT check_status_completed CHECK (
    (status = 'in_progress' AND end_time IS NULL) OR 
    (status = 'completed' AND end_time IS NOT NULL)
  ),
  CONSTRAINT unique_client_id UNIQUE (client_id)
);

-- Índices para time_entries
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_org_unit_id ON time_entries(organizational_unit_id);
CREATE INDEX idx_time_entries_start_time ON time_entries(start_time);
CREATE INDEX idx_time_entries_status ON time_entries(status);
CREATE INDEX idx_time_entries_user_start ON time_entries(user_id, start_time DESC);

-- Índice para evitar solapamiento de horarios
CREATE INDEX idx_time_entries_overlap ON time_entries(user_id, start_time, end_time) 
WHERE status = 'completed';

-- =====================================================
-- TABLA: refresh_tokens (para auth personalizado)
-- =====================================================

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para refresh_tokens
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- =====================================================
-- FOREIGN KEYS ADICIONALES
-- =====================================================

ALTER TABLE users 
ADD CONSTRAINT fk_users_organizational_unit 
FOREIGN KEY (organizational_unit_id) 
REFERENCES organizational_units(id) 
ON DELETE SET NULL;

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_units_updated_at BEFORE UPDATE ON organizational_units
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para calcular total_hours automáticamente
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

-- Función para calcular level y path en organizational_units
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

-- Función para prevenir solapamiento de horarios
CREATE OR REPLACE FUNCTION check_time_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM time_entries
    WHERE user_id = NEW.user_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND status = 'in_progress'
    AND NEW.status = 'in_progress'
  ) THEN
    RAISE EXCEPTION 'El usuario ya tiene un registro de horas en progreso';
  END IF;
  
  IF NEW.status = 'completed' AND NEW.end_time IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM time_entries
      WHERE user_id = NEW.user_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
      AND status = 'completed'
      AND (
        (NEW.start_time, NEW.end_time) OVERLAPS (start_time, end_time)
      )
    ) THEN
      RAISE EXCEPTION 'Los horarios se solapan con otro registro existente';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_overlap_trigger 
BEFORE INSERT OR UPDATE ON time_entries
FOR EACH ROW EXECUTE FUNCTION check_time_overlap();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizational_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS: users
-- =====================================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Los admins pueden ver todos los usuarios
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Los supervisores pueden ver usuarios de su área
CREATE POLICY "Supervisors can view users in their area"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users supervisor
    WHERE supervisor.id = auth.uid()
    AND supervisor.role = 'supervisor'
    AND supervisor.organizational_unit_id = users.organizational_unit_id
  )
);

-- Solo admins pueden crear usuarios
CREATE POLICY "Only admins can create users"
ON users FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Los usuarios pueden actualizar su propio perfil (excepto role)
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = (SELECT role FROM users WHERE id = auth.uid()));

-- Los admins pueden actualizar cualquier usuario
CREATE POLICY "Admins can update any user"
ON users FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Solo admins pueden eliminar usuarios
CREATE POLICY "Only admins can delete users"
ON users FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- =====================================================
-- POLÍTICAS RLS: organizational_units
-- =====================================================

-- Todos los usuarios autenticados pueden ver las unidades organizacionales
CREATE POLICY "Authenticated users can view organizational units"
ON organizational_units FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Solo admins y supervisores pueden crear unidades
CREATE POLICY "Admins and supervisors can create organizational units"
ON organizational_units FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'supervisor')
  )
);

-- Solo admins y supervisores pueden actualizar unidades
CREATE POLICY "Admins and supervisors can update organizational units"
ON organizational_units FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'supervisor')
  )
);

-- Solo admins pueden eliminar unidades
CREATE POLICY "Only admins can delete organizational units"
ON organizational_units FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- =====================================================
-- POLÍTICAS RLS: time_entries
-- =====================================================

-- Los usuarios pueden ver sus propios registros
CREATE POLICY "Users can view own time entries"
ON time_entries FOR SELECT
USING (auth.uid() = user_id);

-- Los supervisores pueden ver registros de su área
CREATE POLICY "Supervisors can view area time entries"
ON time_entries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users supervisor
    JOIN users worker ON worker.organizational_unit_id = supervisor.organizational_unit_id
    WHERE supervisor.id = auth.uid()
    AND supervisor.role = 'supervisor'
    AND worker.id = time_entries.user_id
  )
);

-- Los admins pueden ver todos los registros
CREATE POLICY "Admins can view all time entries"
ON time_entries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Los usuarios pueden crear sus propios registros
CREATE POLICY "Users can create own time entries"
ON time_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propios registros
CREATE POLICY "Users can update own time entries"
ON time_entries FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Los admins pueden actualizar cualquier registro
CREATE POLICY "Admins can update any time entry"
ON time_entries FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Los usuarios pueden eliminar sus propios registros
CREATE POLICY "Users can delete own time entries"
ON time_entries FOR DELETE
USING (auth.uid() = user_id);

-- Los admins pueden eliminar cualquier registro
CREATE POLICY "Admins can delete any time entry"
ON time_entries FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- =====================================================
-- POLÍTICAS RLS: refresh_tokens
-- =====================================================

-- Los usuarios solo pueden ver sus propios tokens
CREATE POLICY "Users can view own refresh tokens"
ON refresh_tokens FOR SELECT
USING (auth.uid() = user_id);

-- Los usuarios pueden crear sus propios tokens
CREATE POLICY "Users can create own refresh tokens"
ON refresh_tokens FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus propios tokens
CREATE POLICY "Users can delete own refresh tokens"
ON refresh_tokens FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista para obtener jerarquía completa de organizational_units
CREATE OR REPLACE VIEW organizational_units_hierarchy AS
WITH RECURSIVE hierarchy AS (
  SELECT 
    id,
    name,
    type,
    parent_id,
    level,
    path,
    ARRAY[name] as name_path,
    is_active
  FROM organizational_units
  WHERE parent_id IS NULL
  
  UNION ALL
  
  SELECT 
    ou.id,
    ou.name,
    ou.type,
    ou.parent_id,
    ou.level,
    ou.path,
    h.name_path || ou.name,
    ou.is_active
  FROM organizational_units ou
  INNER JOIN hierarchy h ON ou.parent_id = h.id
)
SELECT * FROM hierarchy;

-- Vista para reportes de horas por usuario
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
LEFT JOIN time_entries te ON u.id = te.user_id AND te.status = 'completed'
GROUP BY u.id, u.name, u.email, u.role;

-- Vista para reportes de horas por unidad organizacional
CREATE OR REPLACE VIEW organizational_unit_hours_summary AS
SELECT 
  ou.id as unit_id,
  ou.name as unit_name,
  ou.type,
  ou.level,
  COUNT(te.id) as total_entries,
  COALESCE(SUM(te.total_hours), 0) as total_hours,
  COUNT(DISTINCT te.user_id) as unique_users
FROM organizational_units ou
LEFT JOIN time_entries te ON ou.id = te.organizational_unit_id AND te.status = 'completed'
GROUP BY ou.id, ou.name, ou.type, ou.level;

-- =====================================================
-- FUNCIONES ÚTILES PARA LA API
-- =====================================================

-- Función para obtener hijos de una unidad organizacional
CREATE OR REPLACE FUNCTION get_organizational_unit_children(unit_id UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  type organizational_unit_type,
  level INTEGER,
  has_children BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ou.id,
    ou.name,
    ou.type,
    ou.level,
    EXISTS(SELECT 1 FROM organizational_units WHERE parent_id = ou.id) as has_children
  FROM organizational_units ou
  WHERE ou.parent_id = unit_id
  AND ou.is_active = true
  ORDER BY ou.name;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener el árbol completo desde una unidad
CREATE OR REPLACE FUNCTION get_organizational_unit_tree(root_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  type organizational_unit_type,
  parent_id UUID,
  level INTEGER,
  path TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE tree AS (
    SELECT 
      ou.id,
      ou.name,
      ou.type,
      ou.parent_id,
      ou.level,
      ou.path
    FROM organizational_units ou
    WHERE (root_id IS NULL AND ou.parent_id IS NULL) OR ou.id = root_id
    
    UNION ALL
    
    SELECT 
      ou.id,
      ou.name,
      ou.type,
      ou.parent_id,
      ou.level,
      ou.path
    FROM organizational_units ou
    INNER JOIN tree t ON ou.parent_id = t.id
    WHERE ou.is_active = true
  )
  SELECT * FROM tree ORDER BY path;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMENTARIOS EN TABLAS
-- =====================================================

COMMENT ON TABLE users IS 'Usuarios del sistema con roles y permisos';
COMMENT ON TABLE organizational_units IS 'Estructura jerárquica organizacional (áreas, procesos, subprocesos, tareas)';
COMMENT ON TABLE time_entries IS 'Registros de horas trabajadas por usuario y unidad organizacional';
COMMENT ON TABLE refresh_tokens IS 'Tokens de refresco para autenticación';

-- =====================================================
-- FIN DEL SCHEMA
-- =====================================================
