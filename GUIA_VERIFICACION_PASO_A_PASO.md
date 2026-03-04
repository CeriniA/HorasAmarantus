# 🔍 Guía de Verificación Paso a Paso - Jerarquías

## ⚠️ PROBLEMA: No aparecen procesos al seleccionar área

---

## 📋 PASO 1: Verificar Datos en Supabase

### 1.1 Abrir Supabase Dashboard

1. Ir a https://supabase.com
2. Seleccionar tu proyecto
3. Click en **SQL Editor** (menú izquierdo)

### 1.2 Ejecutar Consulta de Verificación

**Copiar y pegar** el contenido del archivo `VERIFICAR_JERARQUIAS.sql` en el SQL Editor

**O ejecutar esta consulta simple**:

```sql
-- Ver todas las unidades
SELECT 
  id,
  name,
  type,
  parent_id
FROM organizational_units
WHERE is_active = true
ORDER BY type, name;
```

### 1.3 Verificar Resultados

**Buscar**:
- ¿Hay un área llamada "Producción"? → Anotar su `id`
- ¿Hay procesos con `parent_id` = ese `id`?

**Ejemplo de resultado CORRECTO**:

```
id                  | name        | type    | parent_id
--------------------|-------------|---------|------------------
abc-123-area        | Producción  | area    | NULL
def-456-process     | Cosecha     | process | abc-123-area
ghi-789-process     | Empaque     | process | abc-123-area
```

**Ejemplo de resultado INCORRECTO**:

```
id                  | name        | type    | parent_id
--------------------|-------------|---------|------------------
abc-123-area        | Producción  | area    | NULL
def-456-process     | Cosecha     | process | NULL           ← ❌ Sin parent_id
ghi-789-process     | Empaque     | process | xyz-999-other  ← ❌ parent_id incorrecto
```

---

## 📋 PASO 2: Verificar en Frontend (Consola)

### 2.1 Abrir la Aplicación

```
http://localhost:5173/time-entries
```

### 2.2 Abrir Consola del Navegador

- Presionar **F12**
- Click en pestaña **Console**

### 2.3 Abrir Modal de Crear

- Click en **"+ Nuevo Registro"**

### 2.4 Ver Logs en Consola

Buscar el log que dice: `🔍 HierarchicalSelect Debug:`

**Ejemplo de log CORRECTO**:

```javascript
🔍 HierarchicalSelect Debug: {
  totalUnits: 10,
  selectedArea: "",
  areas: 3,
  processes: 0,  // ← Normal, aún no seleccionaste área
  allUnits: [
    { id: "abc-123", name: "Producción", type: "area", parent_id: null },
    { id: "def-456", name: "Cosecha", type: "process", parent_id: "abc-123" },
    { id: "ghi-789", name: "Empaque", type: "process", parent_id: "abc-123" }
  ]
}
```

### 2.5 Seleccionar un Área

- En el dropdown "Área", seleccionar **"Producción"**
- Ver nuevo log en consola

**Ejemplo de log CORRECTO después de seleccionar**:

```javascript
🔍 HierarchicalSelect Debug: {
  totalUnits: 10,
  selectedArea: "abc-123",  // ← ID del área seleccionada
  areas: 3,
  processes: 2,  // ← ✅ Ahora hay 2 procesos filtrados
  allUnits: [...]
}
```

**Ejemplo de log INCORRECTO**:

```javascript
🔍 HierarchicalSelect Debug: {
  totalUnits: 10,
  selectedArea: "abc-123",  // ← Área seleccionada
  areas: 3,
  processes: 0,  // ← ❌ No hay procesos (PROBLEMA)
  allUnits: [
    { id: "abc-123", name: "Producción", type: "area", parent_id: null },
    { id: "def-456", name: "Cosecha", type: "process", parent_id: "xyz-999" }
    //                                                            ↑
    //                                    ❌ parent_id NO coincide con selectedArea
  ]
}
```

---

## 🔧 PASO 3: Diagnosticar el Problema

### Caso A: `processes: 0` y en `allUnits` no hay procesos

**Problema**: No hay procesos creados en la base de datos

**Solución**: Crear procesos (ver PASO 4)

---

### Caso B: `processes: 0` pero en `allUnits` SÍ hay procesos

**Problema**: Los `parent_id` de los procesos NO coinciden con el `id` del área

**Ejemplo**:
```javascript
selectedArea: "abc-123"  // ← Área seleccionada

allUnits: [
  { id: "def-456", name: "Cosecha", type: "process", parent_id: "xyz-999" }
  //                                                            ↑
  //                                              ❌ NO coincide con "abc-123"
]
```

**Solución**: Corregir `parent_id` en base de datos (ver PASO 5)

---

### Caso C: `processes: 0` y `allUnits` está vacío

**Problema**: No se están cargando las unidades desde el backend

**Solución**: Verificar que el endpoint `/api/organizational-units` funciona (ver PASO 6)

---

## 📋 PASO 4: Crear Procesos (si no existen)

### En Supabase SQL Editor:

```sql
-- 1. Obtener ID del área "Producción"
SELECT id, name FROM organizational_units WHERE type = 'area' AND name = 'Producción';

-- 2. Crear procesos (reemplaza 'ID_DEL_AREA' con el ID real)
INSERT INTO organizational_units (name, type, parent_id, path, is_active) VALUES
('Cosecha', 'process', 'ID_DEL_AREA', 'Producción > Cosecha', true),
('Empaque', 'process', 'ID_DEL_AREA', 'Producción > Empaque', true),
('Control de Calidad', 'process', 'ID_DEL_AREA', 'Producción > Control de Calidad', true);

-- 3. Verificar
SELECT id, name, type, parent_id 
FROM organizational_units 
WHERE type = 'process' AND parent_id = 'ID_DEL_AREA';
```

---

## 📋 PASO 5: Corregir parent_id (si están incorrectos)

### 5.1 Identificar el ID correcto del área

```sql
SELECT id, name FROM organizational_units WHERE type = 'area' AND name = 'Producción';
-- Resultado: abc-123-area-id
```

### 5.2 Ver procesos con parent_id incorrecto

```sql
SELECT id, name, parent_id 
FROM organizational_units 
WHERE type = 'process';
```

### 5.3 Corregir parent_id

```sql
-- Opción A: Corregir un proceso específico
UPDATE organizational_units 
SET parent_id = 'abc-123-area-id'  -- ← ID correcto del área
WHERE id = 'def-456-process-id';   -- ← ID del proceso a corregir

-- Opción B: Corregir todos los procesos que están sin parent
UPDATE organizational_units 
SET parent_id = 'abc-123-area-id'  -- ← ID correcto del área
WHERE type = 'process' AND parent_id IS NULL;

-- Opción C: Corregir todos los procesos de "Producción"
UPDATE organizational_units 
SET parent_id = (SELECT id FROM organizational_units WHERE type = 'area' AND name = 'Producción')
WHERE type = 'process' 
  AND name IN ('Cosecha', 'Empaque', 'Control de Calidad');
```

### 5.4 Verificar corrección

```sql
SELECT 
  p.name as proceso,
  p.parent_id,
  a.name as area_padre
FROM organizational_units p
LEFT JOIN organizational_units a ON p.parent_id = a.id
WHERE p.type = 'process';
```

**Resultado esperado**:
```
proceso             | parent_id       | area_padre
--------------------|-----------------|-------------
Cosecha             | abc-123-area    | Producción
Empaque             | abc-123-area    | Producción
Control de Calidad  | abc-123-area    | Producción
```

---

## 📋 PASO 6: Verificar Endpoint del Backend

### 6.1 Abrir en navegador:

```
http://localhost:3001/api/organizational-units
```

### 6.2 Verificar respuesta

**Debe retornar JSON con todas las unidades**:

```json
{
  "organizationalUnits": [
    {
      "id": "abc-123",
      "name": "Producción",
      "type": "area",
      "parent_id": null,
      "is_active": true
    },
    {
      "id": "def-456",
      "name": "Cosecha",
      "type": "process",
      "parent_id": "abc-123",
      "is_active": true
    }
  ]
}
```

### 6.3 Si hay error 401 (No autenticado)

**Normal**: El endpoint requiere autenticación

**Verificar en la app**:
1. Hacer login
2. Abrir consola (F12)
3. Ir a pestaña **Network**
4. Filtrar por "organizational-units"
5. Ver la respuesta

---

## 📋 PASO 7: Solución Rápida - Recrear Jerarquía de Ejemplo

Si todo falla, recrear una jerarquía de ejemplo limpia:

```sql
-- 1. Limpiar (CUIDADO: Esto borra todo)
DELETE FROM organizational_units;

-- 2. Crear área
INSERT INTO organizational_units (id, name, type, parent_id, path, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Producción', 'area', NULL, 'Producción', true);

-- 3. Crear procesos
INSERT INTO organizational_units (id, name, type, parent_id, path, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Cosecha', 'process', '550e8400-e29b-41d4-a716-446655440000', 'Producción > Cosecha', true),
('550e8400-e29b-41d4-a716-446655440002', 'Empaque', 'process', '550e8400-e29b-41d4-a716-446655440000', 'Producción > Empaque', true);

-- 4. Crear subprocesos
INSERT INTO organizational_units (id, name, type, parent_id, path, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'Recolección', 'subprocess', '550e8400-e29b-41d4-a716-446655440001', 'Producción > Cosecha > Recolección', true),
('550e8400-e29b-41d4-a716-446655440004', 'Clasificación', 'subprocess', '550e8400-e29b-41d4-a716-446655440001', 'Producción > Cosecha > Clasificación', true);

-- 5. Crear tareas
INSERT INTO organizational_units (id, name, type, parent_id, path, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440005', 'Cortar tomates', 'task', '550e8400-e29b-41d4-a716-446655440003', 'Producción > Cosecha > Recolección > Cortar tomates', true),
('550e8400-e29b-41d4-a716-446655440006', 'Empacar tomates', 'task', '550e8400-e29b-41d4-a716-446655440003', 'Producción > Cosecha > Recolección > Empacar tomates', true);

-- 6. Verificar
SELECT 
  CASE type
    WHEN 'area' THEN '📁 '
    WHEN 'process' THEN '  ⚙️  '
    WHEN 'subprocess' THEN '    📋 '
    WHEN 'task' THEN '      ✓ '
  END || name as jerarquia,
  id,
  parent_id
FROM organizational_units
ORDER BY path;
```

**Resultado esperado**:
```
jerarquia                                    | id      | parent_id
---------------------------------------------|---------|----------
📁 Producción                                | ...0000 | NULL
  ⚙️  Cosecha                                | ...0001 | ...0000
    📋 Recolección                           | ...0003 | ...0001
      ✓ Cortar tomates                       | ...0005 | ...0003
      ✓ Empacar tomates                      | ...0006 | ...0003
    📋 Clasificación                         | ...0004 | ...0001
  ⚙️  Empaque                                | ...0002 | ...0000
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

Marca cada paso cuando lo completes:

- [ ] 1. Ejecuté consulta SQL en Supabase
- [ ] 2. Verifiqué que existe área "Producción"
- [ ] 3. Verifiqué que existen procesos
- [ ] 4. Verifiqué que `parent_id` de procesos = `id` de área
- [ ] 5. Abrí consola del navegador (F12)
- [ ] 6. Vi logs de `HierarchicalSelect Debug`
- [ ] 7. Seleccioné un área
- [ ] 8. Vi que `processes > 0` en el log
- [ ] 9. Aparecieron los procesos en el dropdown
- [ ] 10. Funciona correctamente

---

## 🆘 Si Nada Funciona

**Comparte**:
1. Resultado de la consulta SQL (PASO 1)
2. Log de consola completo (PASO 2)
3. Captura de pantalla del problema

---

## 📞 Siguiente Paso

**EJECUTA AHORA**:

1. Abrir Supabase Dashboard
2. SQL Editor
3. Ejecutar consulta del archivo `VERIFICAR_JERARQUIAS.sql`
4. Compartir resultados

**Esto nos dirá exactamente cuál es el problema** 🔍
