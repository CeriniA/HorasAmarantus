# ✅ Selección Jerárquica de Áreas/Procesos Implementada

## 🎯 Mejora Implementada

Se ha creado un sistema de **desplegables en cascada** para seleccionar la jerarquía organizacional:

```
Área → Proceso → Subproceso → Tarea
```

Cada nivel solo se muestra si el anterior está seleccionado.

---

## 📁 Archivos Creados/Modificados

### 1. **Nuevo Componente**: `HierarchicalSelect.jsx` ✅

**Ubicación**: `frontend/src/components/common/HierarchicalSelect.jsx`

**Funcionalidad**:
- Desplegables en cascada
- Filtrado automático por jerarquía
- Validación de selección
- Indicador visual de selección actual
- Mensajes de ayuda cuando no hay opciones

### 2. **Actualizado**: `TimeEntries.jsx` ✅

**Cambios**:
- Importa `HierarchicalSelect`
- Reemplaza `Select` simple por `HierarchicalSelect`
- Aplica en modal de crear y editar

---

## 🎨 Cómo Funciona

### Flujo de Selección:

```
1. Usuario ve solo "Área"
   ↓
2. Selecciona un Área (ej: "Producción")
   ↓
3. Aparece "Proceso" con solo los procesos de esa área
   ↓
4. Selecciona un Proceso (ej: "Cosecha")
   ↓
5. Aparece "Subproceso" con solo los subprocesos de ese proceso
   ↓
6. Selecciona un Subproceso (ej: "Recolección")
   ↓
7. Aparece "Tarea" con solo las tareas de ese subproceso
   ↓
8. Selecciona una Tarea (ej: "Cortar tomates")
```

### Ejemplo Visual:

```
┌─────────────────────────────────┐
│ Área: [Producción ▼]            │
└─────────────────────────────────┘
           ↓ (selecciona)
┌─────────────────────────────────┐
│ Área: [Producción ▼]            │
│ Proceso: [Cosecha ▼]            │
└─────────────────────────────────┘
           ↓ (selecciona)
┌─────────────────────────────────┐
│ Área: [Producción ▼]            │
│ Proceso: [Cosecha ▼]            │
│ Subproceso: [Recolección ▼]    │
└─────────────────────────────────┘
           ↓ (selecciona)
┌─────────────────────────────────┐
│ Área: [Producción ▼]            │
│ Proceso: [Cosecha ▼]            │
│ Subproceso: [Recolección ▼]    │
│ Tarea: [Cortar tomates ▼]      │
│                                 │
│ ✓ Seleccionado: Cortar tomates │
│   (tarea)                       │
└─────────────────────────────────┘
```

---

## 🔧 Características del Componente

### Props:

```javascript
<HierarchicalSelect
  units={units}           // Array de unidades organizacionales
  value={selectedId}      // ID de la unidad seleccionada
  onChange={handleChange} // Callback cuando cambia la selección
  required={true}         // Si es campo requerido
  disabled={false}        // Si está deshabilitado
/>
```

### Comportamiento:

1. **Filtrado Automático**:
   - Solo muestra opciones relevantes según la jerarquía
   - Usa `parent_id` para filtrar

2. **Reseteo en Cascada**:
   - Si cambias el área, se resetean proceso, subproceso y tarea
   - Si cambias el proceso, se resetean subproceso y tarea
   - Si cambias el subproceso, se resetea tarea

3. **Mensajes de Ayuda**:
   - "No hay procesos en esta área"
   - "No hay subprocesos en este proceso"
   - "No hay tareas en este subproceso"

4. **Indicador de Selección**:
   ```
   ✓ Seleccionado: Cortar tomates (tarea)
   ```

---

## 📊 Estructura de Datos

### Unidad Organizacional:

```javascript
{
  id: "uuid",
  name: "Nombre",
  type: "area" | "process" | "subprocess" | "task",
  parent_id: "uuid" | null,
  path: "area > process > subprocess",
  is_active: true
}
```

### Jerarquía Ejemplo:

```
Producción (area)
├── Cosecha (process, parent_id: Producción)
│   ├── Recolección (subprocess, parent_id: Cosecha)
│   │   ├── Cortar tomates (task, parent_id: Recolección)
│   │   └── Empacar tomates (task, parent_id: Recolección)
│   └── Clasificación (subprocess, parent_id: Cosecha)
│       └── Separar por tamaño (task, parent_id: Clasificación)
└── Empaque (process, parent_id: Producción)
    └── Etiquetado (subprocess, parent_id: Empaque)
        └── Poner etiquetas (task, parent_id: Etiquetado)
```

---

## 🎯 Ventajas vs Select Simple

### Antes (Select Simple):

```
Unidad Organizacional: [Dropdown con TODO mezclado ▼]
├─ Producción (área)
├─ Cosecha (proceso)
├─ Recolección (subproceso)
├─ Cortar tomates (tarea)
├─ Empaque (proceso)
├─ Etiquetado (subproceso)
└─ ... (confuso, difícil de encontrar)
```

**Problemas**:
- ❌ Difícil de navegar
- ❌ No se ve la jerarquía
- ❌ Fácil equivocarse
- ❌ Lista muy larga

### Ahora (Jerárquico):

```
Área: [Producción ▼]
Proceso: [Cosecha ▼]
Subproceso: [Recolección ▼]
Tarea: [Cortar tomates ▼]
```

**Ventajas**:
- ✅ Clara jerarquía visual
- ✅ Listas cortas y relevantes
- ✅ Imposible equivocarse de nivel
- ✅ Guía al usuario paso a paso

---

## 🧪 Cómo Probar

### 1. Ir a Registrar Horas:

```
http://localhost:5173/time-entries
```

### 2. Click en "+ Nuevo Registro"

### 3. Observar el Nuevo Selector:

- Solo verás "Área" al inicio
- Selecciona un área
- Aparecerá "Proceso" con opciones filtradas
- Continúa seleccionando

### 4. Probar Edición:

- Edita un registro existente
- El componente cargará la jerarquía completa
- Podrás cambiar cualquier nivel

---

## 🔄 Casos de Uso

### Caso 1: Crear Registro en Tarea Específica

```
1. Seleccionar Área: "Producción"
2. Seleccionar Proceso: "Cosecha"
3. Seleccionar Subproceso: "Recolección"
4. Seleccionar Tarea: "Cortar tomates"
5. Guardar → Se guarda el ID de "Cortar tomates"
```

### Caso 2: Crear Registro Solo en Proceso

```
1. Seleccionar Área: "Producción"
2. Seleccionar Proceso: "Cosecha"
3. NO seleccionar subproceso
4. Guardar → Se guarda el ID de "Cosecha"
```

### Caso 3: Editar y Cambiar de Área

```
1. Abrir edición de registro existente
2. Cambiar Área de "Producción" a "Administración"
3. Los procesos se resetean automáticamente
4. Seleccionar nuevo proceso de "Administración"
5. Guardar
```

---

## 📝 Validaciones

### El componente valida:

1. ✅ Campo requerido (si `required={true}`)
2. ✅ Debe seleccionar al menos un área
3. ✅ No puede seleccionar proceso sin área
4. ✅ No puede seleccionar subproceso sin proceso
5. ✅ No puede seleccionar tarea sin subproceso

### Mensajes de Error:

```javascript
// En TimeEntries.jsx
if (!formData.organizational_unit_id) {
  setAlert({ 
    type: 'error', 
    message: 'Selecciona una unidad organizacional' 
  });
}
```

---

## 🎨 Estilos y UX

### Características UX:

1. **Progresivo**: Solo muestra lo necesario
2. **Claro**: Labels descriptivos
3. **Informativo**: Mensajes cuando no hay opciones
4. **Visual**: Indicador de selección actual
5. **Consistente**: Mismo estilo que otros selects

### Indicador de Selección:

```
┌─────────────────────────────────────────┐
│ ✓ Seleccionado: Cortar tomates (tarea) │
└─────────────────────────────────────────┘
```

---

## 🔧 Personalización

### Agregar más niveles:

Si necesitas más niveles (ej: "subtarea"), solo agrega en el componente:

```javascript
// En HierarchicalSelect.jsx
const subtasks = units.filter(u => 
  u.type === 'subtask' && 
  u.parent_id === selectedTask
);

// Agregar Select para subtareas
{selectedTask && (
  <Select
    label="Subtarea"
    value={selectedSubtask}
    onChange={(e) => handleSubtaskChange(e.target.value)}
    options={subtaskOptions}
  />
)}
```

### Cambiar orden:

Si quieres mostrar todos los niveles siempre (sin cascada), cambia las condiciones:

```javascript
// Mostrar siempre (sin condición)
<Select label="Proceso" ... />
<Select label="Subproceso" ... />
<Select label="Tarea" ... />
```

---

## 📊 Resumen

### Implementado:
- ✅ Componente `HierarchicalSelect`
- ✅ Desplegables en cascada
- ✅ Filtrado por jerarquía
- ✅ Integrado en TimeEntries
- ✅ Funciona en crear y editar
- ✅ Validaciones
- ✅ Mensajes de ayuda
- ✅ Indicador visual

### Beneficios:
- 🎯 Mejor UX
- 🔍 Más fácil de navegar
- ✅ Menos errores
- 📊 Jerarquía clara
- ⚡ Listas más cortas

---

**¡La selección jerárquica está lista para usar!** 🎉

Ahora registrar horas es mucho más intuitivo y organizado.
