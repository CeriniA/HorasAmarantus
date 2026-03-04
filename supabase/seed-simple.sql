-- =====================================================
-- SEED PARA SCHEMA SIMPLIFICADO
-- =====================================================
-- Ejecutar DESPUÉS de schema-simple.sql y create-admin.sql
-- =====================================================

-- =====================================================
-- 1. UNIDADES ORGANIZACIONALES
-- =====================================================

-- Áreas principales
INSERT INTO organizational_units (id, name, type, parent_id, is_active) VALUES
('a1111111-1111-1111-1111-111111111111', 'Producción', 'area', NULL, true),
('a2222222-2222-2222-2222-222222222222', 'Empaque', 'area', NULL, true),
('a3333333-3333-3333-3333-333333333333', 'Mantenimiento', 'area', NULL, true);

-- Procesos de Producción
INSERT INTO organizational_units (id, name, type, parent_id, is_active) VALUES
('b1111111-1111-1111-1111-111111111111', 'Siembra', 'proceso', 'a1111111-1111-1111-1111-111111111111', true),
('b2222222-2222-2222-2222-222222222222', 'Riego', 'proceso', 'a1111111-1111-1111-1111-111111111111', true),
('b3333333-3333-3333-3333-333333333333', 'Cosecha', 'proceso', 'a1111111-1111-1111-1111-111111111111', true),
('b4444444-4444-4444-4444-444444444444', 'Control de Plagas', 'proceso', 'a1111111-1111-1111-1111-111111111111', true);

-- Subprocesos de Siembra
INSERT INTO organizational_units (id, name, type, parent_id, is_active) VALUES
('c1111111-1111-1111-1111-111111111111', 'Preparación de Suelo', 'subproceso', 'b1111111-1111-1111-1111-111111111111', true),
('c2222222-2222-2222-2222-222222222222', 'Siembra Directa', 'subproceso', 'b1111111-1111-1111-1111-111111111111', true),
('c3333333-3333-3333-3333-333333333333', 'Transplante', 'subproceso', 'b1111111-1111-1111-1111-111111111111', true);

-- Tareas de Preparación de Suelo
INSERT INTO organizational_units (id, name, type, parent_id, is_active) VALUES
('d1111111-1111-1111-1111-111111111111', 'Arado', 'tarea', 'c1111111-1111-1111-1111-111111111111', true),
('d2222222-2222-2222-2222-222222222222', 'Rastrillado', 'tarea', 'c1111111-1111-1111-1111-111111111111', true),
('d3333333-3333-3333-3333-333333333333', 'Fertilización', 'tarea', 'c1111111-1111-1111-1111-111111111111', true);

-- Procesos de Empaque
INSERT INTO organizational_units (id, name, type, parent_id, is_active) VALUES
('b5555555-5555-5555-5555-555555555555', 'Selección', 'proceso', 'a2222222-2222-2222-2222-222222222222', true),
('b6666666-6666-6666-6666-666666666666', 'Lavado', 'proceso', 'a2222222-2222-2222-2222-222222222222', true),
('b7777777-7777-7777-7777-777777777777', 'Empaquetado', 'proceso', 'a2222222-2222-2222-2222-222222222222', true);

-- Procesos de Mantenimiento
INSERT INTO organizational_units (id, name, type, parent_id, is_active) VALUES
('b8888888-8888-8888-8888-888888888888', 'Mantenimiento de Campo', 'proceso', 'a3333333-3333-3333-3333-333333333333', true),
('b9999999-9999-9999-9999-999999999999', 'Mantenimiento de Equipos', 'proceso', 'a3333333-3333-3333-3333-333333333333', true);

-- =====================================================
-- 2. USUARIOS ADICIONALES
-- =====================================================
-- Password para todos: ContraseñaSegura123!
-- Hash: $2a$10$mavSXcaaGyG4LvfgTXjcZexQWl6Ix4BEpnLndhIi66qpkkXWan4jW

-- Supervisores
INSERT INTO users (id, email, password_hash, name, role, organizational_unit_id, is_active) VALUES
('22222222-2222-2222-2222-222222222222', 'supervisor.produccion@horticola.com', '$2a$10$mavSXcaaGyG4LvfgTXjcZexQWl6Ix4BEpnLndhIi66qpkkXWan4jW', 'María González', 'supervisor', 'a1111111-1111-1111-1111-111111111111', true),
('33333333-3333-3333-3333-333333333333', 'supervisor.empaque@horticola.com', '$2a$10$mavSXcaaGyG4LvfgTXjcZexQWl6Ix4BEpnLndhIi66qpkkXWan4jW', 'Carlos Rodríguez', 'supervisor', 'a2222222-2222-2222-2222-222222222222', true);

-- Operarios
INSERT INTO users (id, email, password_hash, name, role, organizational_unit_id, is_active) VALUES
('44444444-4444-4444-4444-444444444444', 'operario1@horticola.com', '$2a$10$mavSXcaaGyG4LvfgTXjcZexQWl6Ix4BEpnLndhIi66qpkkXWan4jW', 'Pedro Martínez', 'operario', 'a1111111-1111-1111-1111-111111111111', true),
('55555555-5555-5555-5555-555555555555', 'operario2@horticola.com', '$2a$10$mavSXcaaGyG4LvfgTXjcZexQWl6Ix4BEpnLndhIi66qpkkXWan4jW', 'Ana López', 'operario', 'a1111111-1111-1111-1111-111111111111', true),
('66666666-6666-6666-6666-666666666666', 'operario3@horticola.com', '$2a$10$mavSXcaaGyG4LvfgTXjcZexQWl6Ix4BEpnLndhIi66qpkkXWan4jW', 'Luis Fernández', 'operario', 'a2222222-2222-2222-2222-222222222222', true),
('77777777-7777-7777-7777-777777777777', 'operario4@horticola.com', '$2a$10$mavSXcaaGyG4LvfgTXjcZexQWl6Ix4BEpnLndhIi66qpkkXWan4jW', 'Laura Sánchez', 'operario', 'a2222222-2222-2222-2222-222222222222', true),
('88888888-8888-8888-8888-888888888888', 'operario5@horticola.com', '$2a$10$mavSXcaaGyG4LvfgTXjcZexQWl6Ix4BEpnLndhIi66qpkkXWan4jW', 'Miguel Torres', 'operario', 'a3333333-3333-3333-3333-333333333333', true);

-- =====================================================
-- 3. REGISTROS DE HORAS DE EJEMPLO
-- =====================================================

-- Pedro - Lunes 3 Mar 2026
INSERT INTO time_entries (user_id, organizational_unit_id, description, start_time, end_time, total_hours, status) VALUES
('44444444-4444-4444-4444-444444444444', 'd1111111-1111-1111-1111-111111111111', 'Arado del sector norte', 
 '2026-03-03 08:00:00', '2026-03-03 12:00:00', 4.0, 'completed'),
('44444444-4444-4444-4444-444444444444', 'd2222222-2222-2222-2222-222222222222', 'Rastrillado del sector norte', 
 '2026-03-03 13:00:00', '2026-03-03 17:00:00', 4.0, 'completed');

-- Ana - Lunes 3 Mar 2026
INSERT INTO time_entries (user_id, organizational_unit_id, description, start_time, end_time, total_hours, status) VALUES
('55555555-5555-5555-5555-555555555555', 'c2222222-2222-2222-2222-222222222222', 'Siembra de lechugas', 
 '2026-03-03 08:00:00', '2026-03-03 12:00:00', 4.0, 'completed'),
('55555555-5555-5555-5555-555555555555', 'c2222222-2222-2222-2222-222222222222', 'Siembra de tomates', 
 '2026-03-03 13:00:00', '2026-03-03 16:00:00', 3.0, 'completed');

-- Luis - Lunes 3 Mar 2026
INSERT INTO time_entries (user_id, organizational_unit_id, description, start_time, end_time, total_hours, status) VALUES
('66666666-6666-6666-6666-666666666666', 'b5555555-5555-5555-5555-555555555555', 'Selección de tomates', 
 '2026-03-03 08:00:00', '2026-03-03 12:00:00', 4.0, 'completed'),
('66666666-6666-6666-6666-666666666666', 'b6666666-6666-6666-6666-666666666666', 'Lavado de productos', 
 '2026-03-03 13:00:00', '2026-03-03 17:00:00', 4.0, 'completed');

-- Laura - Lunes 3 Mar 2026
INSERT INTO time_entries (user_id, organizational_unit_id, description, start_time, end_time, total_hours, status) VALUES
('77777777-7777-7777-7777-777777777777', 'b7777777-7777-7777-7777-777777777777', 'Empaquetado de lechugas', 
 '2026-03-03 08:00:00', '2026-03-03 12:00:00', 4.0, 'completed'),
('77777777-7777-7777-7777-777777777777', 'b7777777-7777-7777-7777-777777777777', 'Empaquetado de tomates', 
 '2026-03-03 13:00:00', '2026-03-03 17:00:00', 4.0, 'completed');

-- Miguel - Lunes 3 Mar 2026
INSERT INTO time_entries (user_id, organizational_unit_id, description, start_time, end_time, total_hours, status) VALUES
('88888888-8888-8888-8888-888888888888', 'b8888888-8888-8888-8888-888888888888', 'Reparación de sistema de riego', 
 '2026-03-03 08:00:00', '2026-03-03 14:00:00', 6.0, 'completed');

-- =====================================================
-- 4. VERIFICACIÓN
-- =====================================================

-- Contar registros
SELECT 'Organizational Units' as tabla, COUNT(*) as total FROM organizational_units
UNION ALL
SELECT 'Users' as tabla, COUNT(*) as total FROM users
UNION ALL
SELECT 'Time Entries' as tabla, COUNT(*) as total FROM time_entries;

-- Ver unidades organizacionales
SELECT id, name, type, parent_id FROM organizational_units ORDER BY type, name;

-- Ver usuarios
SELECT id, email, name, role FROM users ORDER BY role, name;

-- Ver registros de horas
SELECT 
  u.name as usuario,
  ou.name as unidad,
  te.description,
  te.total_hours as horas,
  te.start_time
FROM time_entries te
JOIN users u ON te.user_id = u.id
JOIN organizational_units ou ON te.organizational_unit_id = ou.id
ORDER BY te.start_time DESC;

-- =====================================================
-- CREDENCIALES DE ACCESO
-- =====================================================
-- 
-- Todos los usuarios tienen la misma password: ContraseñaSegura123!
--
-- Admin:
--   Email: admin@horticola.com
--   Role: admin
--
-- Supervisores:
--   Email: supervisor.produccion@horticola.com
--   Role: supervisor (área: Producción)
--
--   Email: supervisor.empaque@horticola.com
--   Role: supervisor (área: Empaque)
--
-- Operarios:
--   Email: operario1@horticola.com (Pedro - Producción)
--   Email: operario2@horticola.com (Ana - Producción)
--   Email: operario3@horticola.com (Luis - Empaque)
--   Email: operario4@horticola.com (Laura - Empaque)
--   Email: operario5@horticola.com (Miguel - Mantenimiento)
--
-- =====================================================
