# 🔍 Debug de Consola - Análisis

## 📊 Log Recibido

```javascript
{
  totalUnits: 4,
  selectedArea: "11805248-b60e-4120-8ff6-25aaaec8504b",
  selectedProcess: "",
  selectedSubprocess: "",
  areas: 1,
  processes: 0,  // ❌ PROBLEMA: Debería haber procesos
  subprocesses: 0,
  tasks: 0,
  allUnits: (4) [{…}, {…}, {…}, {…}]
}
```

## 🔍 Necesito Ver `allUnits`

Para diagnosticar el problema, necesito que **expandas** el array `allUnits` en la consola:

### Cómo hacerlo:

1. En la consola del navegador (F12)
2. Busca el log `🔍 HierarchicalSelect Debug:`
3. Click en la **flecha** al lado de `allUnits: (4) [{…}, {…}, {…}, {…}]`
4. Expande cada objeto `{…}`
5. Copia el contenido completo

### Debería verse así:

```javascript
allUnits: [
  {
    id: "11805248-b60e-4120-8ff6-25aaaec8504b",
    name: "Producción",
    type: "area",
    parent_id: null
  },
  {
    id: "abc-123-...",
    name: "Cosecha",
    type: "process",
    parent_id: "???"  // ← Este es el problema
  },
  // ... más unidades
]
```

---

## 🎯 Diagnóstico Preliminar

Basado en `processes: 0`, hay 3 posibles causas:

### Causa 1: No hay procesos en las 4 unidades
- Las 4 unidades son todas áreas, subprocesos o tareas
- No hay ningún proceso creado

### Causa 2: Los procesos tienen `parent_id` diferente
- Hay procesos, pero su `parent_id` NO es `11805248-b60e-4120-8ff6-25aaaec8504b`
- Ejemplo: `parent_id: "otro-id-diferente"`

### Causa 3: Los procesos tienen `parent_id: null`
- Hay procesos, pero no tienen parent_id asignado

---

## 🔧 Mientras Tanto - Verificar en Supabase

Ejecuta esta consulta en **Supabase SQL Editor**:

```sql
-- Ver las 4 unidades que tienes
SELECT 
  id,
  name,
  type,
  parent_id,
  CASE 
    WHEN id = '11805248-b60e-4120-8ff6-25aaaec8504b' THEN '← ÁREA SELECCIONADA'
    WHEN parent_id = '11805248-b60e-4120-8ff6-25aaaec8504b' THEN '← DEBERÍA APARECER'
    ELSE ''
  END as nota
FROM organizational_units
WHERE is_active = true
ORDER BY type, name;
```

### Resultado Esperado (CORRECTO):

```
id                                   | name       | type    | parent_id                            | nota
-------------------------------------|------------|---------|--------------------------------------|-------------------
11805248-b60e-4120-8ff6-25aaaec8504b | Producción | area    | NULL                                 | ← ÁREA SELECCIONADA
abc-123-...                          | Cosecha    | process | 11805248-b60e-4120-8ff6-25aaaec8504b | ← DEBERÍA APARECER
def-456-...                          | Empaque    | process | 11805248-b60e-4120-8ff6-25aaaec8504b | ← DEBERÍA APARECER
```

### Resultado Probable (INCORRECTO):

```
id                                   | name       | type    | parent_id | nota
-------------------------------------|------------|---------|-----------|-------------------
11805248-b60e-4120-8ff6-25aaaec8504b | Producción | area    | NULL      | ← ÁREA SELECCIONADA
abc-123-...                          | Cosecha    | process | NULL      | ← ❌ Sin parent_id
def-456-...                          | Empaque    | process | xyz-999   | ← ❌ parent_id incorrecto
```

---

## 🔧 Solución Rápida

Si los procesos tienen `parent_id` incorrecto o NULL, corrígelo:

```sql
-- Corregir parent_id de todos los procesos para que apunten a Producción
UPDATE organizational_units 
SET parent_id = '11805248-b60e-4120-8ff6-25aaaec8504b'
WHERE type = 'process';

-- Verificar
SELECT id, name, type, parent_id 
FROM organizational_units 
WHERE type = 'process';
```

---

## 📋 Siguiente Paso

**Por favor comparte**:

1. **Expande `allUnits`** en la consola y copia el contenido completo
2. **O ejecuta la consulta SQL** en Supabase y comparte el resultado

Con eso sabré exactamente cuál es el problema y cómo solucionarlo.
