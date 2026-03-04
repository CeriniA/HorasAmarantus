# 🔍 Debug: Problema con Jerarquías

## 🐛 Problema Reportado

Al seleccionar un área, no aparecen los procesos y subprocesos correspondientes.

---

## 🔧 Herramientas de Debug Creadas

### 1. **Script de Verificación** ✅

**Ubicación**: `backend/scripts/debugHierarchy.js`

**Ejecutar**:
```bash
cd backend
npm run debug-hierarchy
```

**Qué hace**:
- ✅ Verifica todas las unidades organizacionales
- ✅ Muestra resumen por tipo
- ✅ Verifica que las áreas NO tengan parent_id
- ✅ Verifica que los procesos tengan parent_id = área
- ✅ Verifica que los subprocesos tengan parent_id = proceso
- ✅ Verifica que las tareas tengan parent_id = subproceso
- ✅ Muestra jerarquía completa en árbol
- ✅ Lista problemas encontrados

**Salida esperada**:
```
🔍 Verificando jerarquías en organizational_units...

📊 Total de unidades: 15

📈 Resumen por tipo:
─────────────────────────────────────
area         : 3 total (0 con parent, 3 sin parent)
process      : 5 total (5 con parent, 0 sin parent)
subprocess   : 4 total (4 con parent, 0 sin parent)
task         : 3 total (3 con parent, 0 sin parent)
─────────────────────────────────────

🏢 ÁREAS (deben tener parent_id = null):
─────────────────────────────────────
✅ Producción (id: abc123...)
✅ Administración (id: def456...)
✅ Logística (id: ghi789...)

⚙️  PROCESOS (deben tener parent_id = área):
─────────────────────────────────────
✅ Cosecha → Producción
✅ Empaque → Producción
✅ Contabilidad → Administración
...

🌳 JERARQUÍA COMPLETA:
─────────────────────────────────────
📁 Producción
  ├─ ⚙️  Cosecha
  │  ├─ 📋 Recolección
  │  │  ├─ ✓ Cortar tomates
  │  │  └─ ✓ Empacar tomates
  │  └─ 📋 Clasificación
  │     └─ ✓ Separar por tamaño
  └─ ⚙️  Empaque
     └─ 📋 Etiquetado
        └─ ✓ Poner etiquetas
```

---

### 2. **Debug en Frontend** ✅

**Ubicación**: `frontend/src/components/common/HierarchicalSelect.jsx`

**Qué hace**:
- Muestra en consola del navegador (F12):
  - Total de unidades cargadas
  - Área seleccionada
  - Cantidad de procesos filtrados
  - Cantidad de subprocesos filtrados
  - Todos los datos de unidades

**Ver en consola**:
```javascript
🔍 HierarchicalSelect Debug: {
  totalUnits: 15,
  selectedArea: "abc-123-...",
  selectedProcess: "",
  areas: 3,
  processes: 2,  // ← Si es 0, hay problema
  subprocesses: 0,
  tasks: 0,
  allUnits: [...]
}
```

---

### 3. **Consultas SQL** ✅

**Ubicación**: `DEBUG_JERARQUIAS.sql`

**Ejecutar en Supabase Dashboard → SQL Editor**

**Consultas incluidas**:
1. Ver todas las unidades con jerarquía
2. Ver áreas (sin parent)
3. Ver procesos y sus áreas padre
4. Ver subprocesos y sus procesos padre
5. Contar por tipo
6. Verificar parent_id inválidos
7. Ver jerarquía completa recursiva

---

## 🔍 Diagnóstico Paso a Paso

### Paso 1: Ejecutar Script de Debug

```bash
cd backend
npm run debug-hierarchy
```

**Buscar**:
- ❌ Áreas con parent_id (deben ser null)
- ❌ Procesos sin parent_id
- ❌ Procesos con parent_id que no es área
- ❌ Subprocesos sin parent_id
- ❌ Subprocesos con parent_id que no es proceso

---

### Paso 2: Verificar en Frontend

1. Abrir la aplicación
2. Ir a Registrar Horas
3. Abrir consola del navegador (F12)
4. Click en "+ Nuevo Registro"
5. Ver logs en consola

**Verificar**:
```javascript
// Si seleccionas un área y processes = 0
🔍 HierarchicalSelect Debug: {
  selectedArea: "abc-123",  // ← Área seleccionada
  processes: 0,             // ← PROBLEMA: debería haber procesos
  allUnits: [
    { id: "abc-123", name: "Producción", type: "area", parent_id: null },
    { id: "def-456", name: "Cosecha", type: "process", parent_id: "xyz-999" }
    //                                                            ↑
    //                                                    PROBLEMA: parent_id diferente
  ]
}
```

---

## 🐛 Problemas Comunes

### Problema 1: Procesos sin parent_id

**Síntoma**: No aparecen procesos al seleccionar área

**Causa**: Los procesos tienen `parent_id = null`

**Solución**:
```sql
-- Ver procesos sin parent
SELECT id, name, type, parent_id 
FROM organizational_units 
WHERE type = 'process' AND parent_id IS NULL;

-- Corregir (ejemplo)
UPDATE organizational_units 
SET parent_id = 'id-del-area'
WHERE id = 'id-del-proceso';
```

---

### Problema 2: parent_id apunta a ID incorrecto

**Síntoma**: No aparecen procesos al seleccionar área específica

**Causa**: El `parent_id` del proceso apunta a otra área

**Verificar**:
```sql
-- Ver a qué área apunta cada proceso
SELECT 
  p.name as proceso,
  p.parent_id,
  a.name as area_padre
FROM organizational_units p
LEFT JOIN organizational_units a ON p.parent_id = a.id
WHERE p.type = 'process';
```

**Solución**:
```sql
-- Corregir parent_id
UPDATE organizational_units 
SET parent_id = 'id-correcto-del-area'
WHERE id = 'id-del-proceso';
```

---

### Problema 3: Tipos incorrectos

**Síntoma**: Aparecen en el nivel equivocado

**Causa**: El campo `type` está mal

**Verificar**:
```sql
SELECT id, name, type, parent_id 
FROM organizational_units 
ORDER BY type, name;
```

**Solución**:
```sql
-- Corregir tipo
UPDATE organizational_units 
SET type = 'process'  -- o 'area', 'subprocess', 'task'
WHERE id = 'id-de-la-unidad';
```

---

### Problema 4: parent_id de área no es null

**Síntoma**: Áreas no aparecen en el primer select

**Causa**: Las áreas tienen `parent_id` cuando deberían ser null

**Verificar**:
```sql
SELECT id, name, type, parent_id 
FROM organizational_units 
WHERE type = 'area' AND parent_id IS NOT NULL;
```

**Solución**:
```sql
-- Limpiar parent_id de áreas
UPDATE organizational_units 
SET parent_id = NULL
WHERE type = 'area';
```

---

## 🔧 Soluciones Rápidas

### Opción A: Recrear Jerarquía de Ejemplo

```sql
-- 1. Limpiar todo
DELETE FROM organizational_units;

-- 2. Crear área
INSERT INTO organizational_units (id, name, type, parent_id, path) VALUES
('area-prod', 'Producción', 'area', NULL, 'Producción');

-- 3. Crear proceso
INSERT INTO organizational_units (id, name, type, parent_id, path) VALUES
('proc-cosecha', 'Cosecha', 'process', 'area-prod', 'Producción > Cosecha');

-- 4. Crear subproceso
INSERT INTO organizational_units (id, name, type, parent_id, path) VALUES
('sub-recol', 'Recolección', 'subprocess', 'proc-cosecha', 'Producción > Cosecha > Recolección');

-- 5. Crear tarea
INSERT INTO organizational_units (id, name, type, parent_id, path) VALUES
('task-cortar', 'Cortar tomates', 'task', 'sub-recol', 'Producción > Cosecha > Recolección > Cortar tomates');
```

---

### Opción B: Corregir parent_id Masivamente

```sql
-- Si todos los procesos deben apuntar a la misma área
UPDATE organizational_units 
SET parent_id = (SELECT id FROM organizational_units WHERE type = 'area' LIMIT 1)
WHERE type = 'process' AND parent_id IS NULL;
```

---

## 📋 Checklist de Verificación

Ejecuta esto en orden:

- [ ] 1. Ejecutar `npm run debug-hierarchy` en backend
- [ ] 2. Verificar que hay áreas con `parent_id = null`
- [ ] 3. Verificar que hay procesos con `parent_id = id_de_area`
- [ ] 4. Verificar que hay subprocesos con `parent_id = id_de_proceso`
- [ ] 5. Abrir frontend y ver consola (F12)
- [ ] 6. Seleccionar un área
- [ ] 7. Verificar que `processes > 0` en consola
- [ ] 8. Si `processes = 0`, revisar `allUnits` en consola
- [ ] 9. Comparar `selectedArea` con `parent_id` de procesos
- [ ] 10. Corregir en base de datos si no coinciden

---

## 🎯 Resultado Esperado

Después de corregir, deberías ver:

```
🔍 HierarchicalSelect Debug: {
  totalUnits: 15,
  selectedArea: "abc-123",
  processes: 2,        // ✅ Mayor a 0
  allUnits: [
    { id: "abc-123", name: "Producción", type: "area", parent_id: null },
    { id: "def-456", name: "Cosecha", type: "process", parent_id: "abc-123" },
    //                                                            ↑
    //                                                    ✅ Coincide con selectedArea
  ]
}
```

---

## 📞 Siguiente Paso

**Ejecuta el script de debug**:

```bash
cd backend
npm run debug-hierarchy
```

Y comparte la salida para identificar el problema exacto.
