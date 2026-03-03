-- =====================================================
-- DATOS DE EJEMPLO (SEED)
-- =====================================================
-- Ejecutar DESPUÉS del schema.sql
-- =====================================================

-- =====================================================
-- LIMPIAR DATOS EXISTENTES (CUIDADO EN PRODUCCIÓN)
-- =====================================================

TRUNCATE TABLE time_entries CASCADE;
TRUNCATE TABLE refresh_tokens CASCADE;
TRUNCATE TABLE organizational_units CASCADE;
TRUNCATE TABLE users CASCADE;

-- =====================================================
-- INSERTAR UNIDADES ORGANIZACIONALES
-- =====================================================

-- Áreas principales
INSERT INTO organizational_units (id, name, type, parent_id) VALUES
('a1111111-1111-1111-1111-111111111111', 'Producción', 'area', NULL),
('a2222222-2222-2222-2222-222222222222', 'Empaque', 'area', NULL),
('a3333333-3333-3333-3333-333333333333', 'Mantenimiento', 'area', NULL);

-- Procesos de Producción
INSERT INTO organizational_units (id, name, type, parent_id) VALUES
('b1111111-1111-1111-1111-111111111111', 'Siembra', 'proceso', 'a1111111-1111-1111-1111-111111111111'),
('b2222222-2222-2222-2222-222222222222', 'Riego', 'proceso', 'a1111111-1111-1111-1111-111111111111'),
('b3333333-3333-3333-3333-333333333333', 'Cosecha', 'proceso', 'a1111111-1111-1111-1111-111111111111'),
('b4444444-4444-4444-4444-444444444444', 'Control de Plagas', 'proceso', 'a1111111-1111-1111-1111-111111111111');

-- Subprocesos de Siembra
INSERT INTO organizational_units (id, name, type, parent_id) VALUES
('c1111111-1111-1111-1111-111111111111', 'Preparación de Suelo', 'subproceso', 'b1111111-1111-1111-1111-111111111111'),
('c2222222-2222-2222-2222-222222222222', 'Siembra Directa', 'subproceso', 'b1111111-1111-1111-1111-111111111111'),
('c3333333-3333-3333-3333-333333333333', 'Transplante', 'subproceso', 'b1111111-1111-1111-1111-111111111111');

-- Tareas de Preparación de Suelo
INSERT INTO organizational_units (id, name, type, parent_id) VALUES
('d1111111-1111-1111-1111-111111111111', 'Arado', 'tarea', 'c1111111-1111-1111-1111-111111111111'),
('d2222222-2222-2222-2222-222222222222', 'Rastrillado', 'tarea', 'c1111111-1111-1111-1111-111111111111'),
('d3333333-3333-3333-3333-333333333333', 'Fertilización', 'tarea', 'c1111111-1111-1111-1111-111111111111');

-- Procesos de Empaque
INSERT INTO organizational_units (id, name, type, parent_id) VALUES
('b5555555-5555-5555-5555-555555555555', 'Selección', 'proceso', 'a2222222-2222-2222-2222-222222222222'),
('b6666666-6666-6666-6666-666666666666', 'Lavado', 'proceso', 'a2222222-2222-2222-2222-222222222222'),
('b7777777-7777-7777-7777-777777777777', 'Empaquetado', 'proceso', 'a2222222-2222-2222-2222-222222222222');

-- Procesos de Mantenimiento
INSERT INTO organizational_units (id, name, type, parent_id) VALUES
('b8888888-8888-8888-8888-888888888888', 'Mantenimiento de Campo', 'proceso', 'a3333333-3333-3333-3333-333333333333'),
('b9999999-9999-9999-9999-999999999999', 'Mantenimiento de Equipos', 'proceso', 'a3333333-3333-3333-3333-333333333333');

-- Subprocesos de Mantenimiento de Campo
INSERT INTO organizational_units (id, name, type, parent_id) VALUES
('c4444444-4444-4444-4444-444444444444', 'Reparación de Riego', 'subproceso', 'b8888888-8888-8888-8888-888888888888'),
('c5555555-5555-5555-5555-555555555555', 'Limpieza de Canales', 'subproceso', 'b8888888-8888-8888-8888-888888888888');

-- =====================================================
-- INSERTAR USUARIOS
-- =====================================================
-- NOTA: En Supabase, los usuarios se crean mediante auth.users
-- Aquí solo creamos los perfiles en nuestra tabla users
-- Las contraseñas se manejan en Supabase Auth

-- Usuario Admin
INSERT INTO users (id, email, name, role, organizational_unit_id) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@horticola.com', 'Juan Pérez', 'admin', NULL);

-- Supervisores
INSERT INTO users (id, email, name, role, organizational_unit_id) VALUES
('22222222-2222-2222-2222-222222222222', 'supervisor.produccion@horticola.com', 'María González', 'supervisor', 'a1111111-1111-1111-1111-111111111111'),
('33333333-3333-3333-3333-333333333333', 'supervisor.empaque@horticola.com', 'Carlos Rodríguez', 'supervisor', 'a2222222-2222-2222-2222-222222222222');

-- Operarios
INSERT INTO users (id, email, name, role, organizational_unit_id) VALUES
('44444444-4444-4444-4444-444444444444', 'operario1@horticola.com', 'Pedro Martínez', 'operario', 'a1111111-1111-1111-1111-111111111111'),
('55555555-5555-5555-5555-555555555555', 'operario2@horticola.com', 'Ana López', 'operario', 'a1111111-1111-1111-1111-111111111111'),
('66666666-6666-6666-6666-666666666666', 'operario3@horticola.com', 'Luis Fernández', 'operario', 'a2222222-2222-2222-2222-222222222222'),
('77777777-7777-7777-7777-777777777777', 'operario4@horticola.com', 'Laura Sánchez', 'operario', 'a2222222-2222-2222-2222-222222222222'),
('88888888-8888-8888-8888-888888888888', 'operario5@horticola.com', 'Miguel Torres', 'operario', 'a3333333-3333-3333-3333-333333333333');

-- =====================================================
-- INSERTAR REGISTROS DE HORAS (EJEMPLOS)
-- =====================================================

-- Registros completados de la semana pasada
INSERT INTO time_entries (client_id, user_id, organizational_unit_id, description, start_time, end_time, status) VALUES
-- Pedro - Lunes
(gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'd1111111-1111-1111-1111-111111111111', 'Arado del sector norte', 
 NOW() - INTERVAL '7 days' + INTERVAL '8 hours', NOW() - INTERVAL '7 days' + INTERVAL '12 hours', 'completed'),
(gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'd2222222-2222-2222-2222-222222222222', 'Rastrillado del sector norte', 
 NOW() - INTERVAL '7 days' + INTERVAL '13 hours', NOW() - INTERVAL '7 days' + INTERVAL '17 hours', 'completed'),

-- Ana - Lunes
(gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'c2222222-2222-2222-2222-222222222222', 'Siembra de lechugas', 
 NOW() - INTERVAL '7 days' + INTERVAL '8 hours', NOW() - INTERVAL '7 days' + INTERVAL '12 hours', 'completed'),
(gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'c2222222-2222-2222-2222-222222222222', 'Siembra de tomates', 
 NOW() - INTERVAL '7 days' + INTERVAL '13 hours', NOW() - INTERVAL '7 days' + INTERVAL '16 hours', 'completed'),

-- Luis - Martes
(gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 'b5555555-5555-5555-5555-555555555555', 'Selección de tomates', 
 NOW() - INTERVAL '6 days' + INTERVAL '8 hours', NOW() - INTERVAL '6 days' + INTERVAL '12 hours', 'completed'),
(gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 'b6666666-6666-6666-6666-666666666666', 'Lavado de productos', 
 NOW() - INTERVAL '6 days' + INTERVAL '13 hours', NOW() - INTERVAL '6 days' + INTERVAL '17 hours', 'completed'),

-- Laura - Miércoles
(gen_random_uuid(), '77777777-7777-7777-7777-777777777777', 'b7777777-7777-7777-7777-777777777777', 'Empaquetado de lechugas', 
 NOW() - INTERVAL '5 days' + INTERVAL '8 hours', NOW() - INTERVAL '5 days' + INTERVAL '12 hours', 'completed'),
(gen_random_uuid(), '77777777-7777-7777-7777-777777777777', 'b7777777-7777-7777-7777-777777777777', 'Empaquetado de tomates', 
 NOW() - INTERVAL '5 days' + INTERVAL '13 hours', NOW() - INTERVAL '5 days' + INTERVAL '17 hours', 'completed'),

-- Miguel - Jueves
(gen_random_uuid(), '88888888-8888-8888-8888-888888888888', 'c4444444-4444-4444-4444-444444444444', 'Reparación de sistema de riego', 
 NOW() - INTERVAL '4 days' + INTERVAL '8 hours', NOW() - INTERVAL '4 days' + INTERVAL '14 hours', 'completed'),

-- Pedro - Viernes
(gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'd3333333-3333-3333-3333-333333333333', 'Fertilización del sector sur', 
 NOW() - INTERVAL '3 days' + INTERVAL '8 hours', NOW() - INTERVAL '3 days' + INTERVAL '12 hours', 'completed'),
(gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'b2222222-2222-2222-2222-222222222222', 'Riego general', 
 NOW() - INTERVAL '3 days' + INTERVAL '14 hours', NOW() - INTERVAL '3 days' + INTERVAL '16 hours', 'completed'),

-- Registros de esta semana
-- Ana - Hoy (completado)
(gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'b3333333-3333-3333-3333-333333333333', 'Cosecha de lechugas', 
 NOW() - INTERVAL '4 hours', NOW() - INTERVAL '30 minutes', 'completed'),

-- Luis - Hoy (en progreso)
(gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 'b5555555-5555-5555-5555-555555555555', 'Selección de productos del día', 
 NOW() - INTERVAL '2 hours', NULL, 'in_progress');

-- =====================================================
-- VERIFICACIÓN DE DATOS
-- =====================================================

-- Contar registros insertados
SELECT 'Organizational Units' as tabla, COUNT(*) as total FROM organizational_units
UNION ALL
SELECT 'Users' as tabla, COUNT(*) as total FROM users
UNION ALL
SELECT 'Time Entries' as tabla, COUNT(*) as total FROM time_entries;

-- Ver jerarquía de unidades organizacionales
SELECT 
  REPEAT('  ', level) || name as estructura,
  type,
  level
FROM organizational_units
ORDER BY path;

-- Ver resumen de horas por usuario
SELECT * FROM user_hours_summary ORDER BY total_hours DESC;

-- Ver resumen de horas por unidad organizacional
SELECT * FROM organizational_unit_hours_summary ORDER BY total_hours DESC;

-- =====================================================
-- FIN DEL SEED
-- =====================================================
