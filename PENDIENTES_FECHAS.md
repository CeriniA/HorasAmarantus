# ⚠️ PENDIENTES: Validación de Fechas

**Fecha:** 30 de Abril de 2026  
**Script:** `node scripts/validate-date-usage.js`

---

## 📊 Resumen

**18 warnings** encontrados en **8 archivos**

Todos son warnings (no errores críticos), pero deben revisarse para determinar si necesitan `safeDate()`.

---

## 📋 Archivos con Warnings

### 1. `components/dashboard/GoalHistory.jsx` (2 warnings)
```javascript
// Línea 21 y 45:
const userCreatedDate = new Date(user.created_at);
```
**Análisis:** `created_at` es timestamp de DB → Probablemente necesita `safeDate()`

---

### 2. `components/dashboard/WeeklyComparison.jsx` (2 warnings)
```javascript
// Línea 49:
weekEntries.map(e => safeDate(e.start_time).toDateString())

// Línea 21:
const userCreatedDate = new Date(user.created_at);
```
**Análisis:** 
- `.toDateString()` → Usar `isSameDay()` de date-fns
- `created_at` → Probablemente necesita `safeDate()`

---

### 3. `components/objectives/AssignedObjectiveWidget.jsx` (1 warning)
```javascript
// Línea 82:
{new Date(objective.start_date).toLocaleDateString('es-AR')} - 
{new Date(objective.end_date).toLocaleDateString('es-AR')}
```
**Análisis:** `start_date` y `end_date` son fechas → **Necesita `safeDate()`**

---

### 4. `components/objectives/ObjectiveCompletionModal.jsx` (2 warnings)
```javascript
// Líneas 40-41:
{objective?.start_date && format(new Date(objective.start_date), 'dd/MM/yyyy')}
{objective?.end_date && format(new Date(objective.end_date), 'dd/MM/yyyy')}
```
**Análisis:** Fechas de objetivos → **Necesita `safeDate()`**

---

### 5. `components/objectives/ObjectiveProgress.jsx` (1 warning)
```javascript
// Línea 17:
const endDate = new Date(objective.end_date);
```
**Análisis:** Fecha de objetivo → **Necesita `safeDate()`**

---

### 6. `components/timeEntry/TemplateSelector.jsx` (1 warning)
```javascript
// Línea 108:
return new Date(b.createdAt) - new Date(a.createdAt);
```
**Análisis:** Comparación de timestamps → Probablemente OK (solo para ordenar)

---

### 7. `utils/objectiveFilters.js` (7 warnings)
```javascript
// Líneas 54, 99, 100, 109, 110, 140, 144:
const endDate = new Date(objective.end_date);
const startDate = new Date(objective.start_date);
const filterDate = new Date(filters.dateFrom);
comparison = new Date(a.start_date) - new Date(b.start_date);
```
**Análisis:** Múltiples usos de fechas de objetivos → **Necesita `safeDate()`**

---

### 8. `utils/objectiveValidation.js` (2 warnings)
```javascript
// Líneas 38-39:
const startDate = new Date(data.start_date);
const endDate = new Date(data.end_date);
```
**Análisis:** Validación de fechas → **Necesita `safeDate()`**

---

## 🎯 Prioridades

### 🔴 **ALTA PRIORIDAD** (Afectan UI visible)
- ✅ `GroupedDayView.jsx` - **YA CORREGIDO**
- ⚠️ `AssignedObjectiveWidget.jsx` - Muestra fechas incorrectas
- ⚠️ `ObjectiveCompletionModal.jsx` - Muestra fechas incorrectas
- ⚠️ `ObjectiveProgress.jsx` - Cálculos de progreso incorrectos

### 🟡 **MEDIA PRIORIDAD** (Lógica de negocio)
- ⚠️ `objectiveFilters.js` - Filtros pueden fallar
- ⚠️ `objectiveValidation.js` - Validaciones pueden fallar

### 🟢 **BAJA PRIORIDAD** (Menor impacto)
- ⚠️ `GoalHistory.jsx` - Solo para mostrar
- ⚠️ `WeeklyComparison.jsx` - Solo para mostrar
- ⚠️ `TemplateSelector.jsx` - Solo para ordenar

---

## ✅ Checklist de Corrección

- [x] Crear script de validación
- [x] Agregar pre-commit hook
- [x] Corregir `GroupedDayView.jsx`
- [ ] Corregir componentes de objetivos (4 archivos)
- [ ] Corregir utils de objetivos (2 archivos)
- [ ] Corregir componentes de dashboard (2 archivos)
- [ ] Ejecutar script y verificar 0 warnings

---

## 🔧 Patrón de Corrección

### Antes (INCORRECTO):
```javascript
const date = new Date(objective.start_date);
const formatted = format(date, 'dd/MM/yyyy');
```

### Después (CORRECTO):
```javascript
const date = safeDate(objective.start_date);
const formatted = format(date, 'dd/MM/yyyy');
```

---

## 📝 Notas

- El script ahora detecta **cualquier** `new Date()` con propiedades de objetos
- Los warnings no bloquean commits, solo informan
- Los errores críticos (start_time, end_time) SÍ bloquean commits
- Revisar cada caso para determinar si necesita `safeDate()` o es legítimo

---

**Próximo paso:** Corregir los archivos de objetivos (mayor impacto en UI)
