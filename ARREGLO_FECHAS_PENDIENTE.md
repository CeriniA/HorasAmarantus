# 🔧 ARREGLO DE FECHAS - PENDIENTE

## ✅ YA ARREGLADO

- ✅ `frontend/src/pages/TimeEntries.jsx` - Completamente arreglado
- ✅ `frontend/src/utils/dateHelpers.js` - Helper creado

## ⚠️ PENDIENTE DE ARREGLAR

Los siguientes archivos tienen el mismo problema y necesitan usar `dateHelpers.js`:

### 1. Reports.jsx
**Línea 106:**
```javascript
// ANTES:
const entryDate = new Date(entry.start_time);

// CAMBIAR A:
import { safeDate } from '../utils/dateHelpers';
const entryDate = safeDate(entry.start_time);
```

### 2. utils/reportCalculations.js
**Línea 100:**
```javascript
// ANTES:
const day = format(new Date(entry.start_time), 'yyyy-MM-dd');

// CAMBIAR A:
import { extractDate } from './dateHelpers';
const day = extractDate(entry.start_time);
```

### 3. utils/periodComparison.js
**Múltiples líneas (13, 84, 197, 221, etc.):**
```javascript
// ANTES:
const start = new Date(entry.start_time);
const end = new Date(entry.end_time);
const hours = (end - start) / (1000 * 60 * 60);

// CAMBIAR A:
import { calculateHours } from './dateHelpers';
const hours = calculateHours(entry.start_time, entry.end_time);
```

### 4. utils/alertRules.js
**Múltiples líneas:**
```javascript
// ANTES:
isSameDay(new Date(e.start_time), today)

// CAMBIAR A:
import { safeDate } from './dateHelpers';
isSameDay(safeDate(e.start_time), today)
```

### 5. utils/exportToPDF.js, exportToExcel.js, reportExport.js
**Todos tienen:**
```javascript
// ANTES:
const start = new Date(e.start_time);
const end = new Date(e.end_time);
const hours = (end - start) / (1000 * 60 * 60);

// CAMBIAR A:
import { calculateHours } from './dateHelpers';
const hours = calculateHours(e.start_time, e.end_time);
```

---

## 📝 PATRÓN DE REEMPLAZO

### Regla 1: Para calcular horas
```javascript
// ❌ MAL:
const hours = (new Date(end_time) - new Date(start_time)) / (1000 * 60 * 60);

// ✅ BIEN:
import { calculateHours } from '../utils/dateHelpers';
const hours = calculateHours(start_time, end_time);
```

### Regla 2: Para extraer fecha
```javascript
// ❌ MAL:
const date = format(new Date(entry.start_time), 'yyyy-MM-dd');

// ✅ BIEN:
import { extractDate } from '../utils/dateHelpers';
const date = extractDate(entry.start_time);
```

### Regla 3: Para formatear fechas
```javascript
// ❌ MAL:
format(new Date(entry.start_time), 'dd/MM/yyyy')

// ✅ BIEN:
import { safeDate } from '../utils/dateHelpers';
format(safeDate(entry.start_time), 'dd/MM/yyyy')
```

### Regla 4: Para comparar fechas
```javascript
// ❌ MAL:
const entryDate = new Date(entry.start_time);
if (entryDate >= startDate && entryDate <= endDate)

// ✅ BIEN:
import { safeDate } from '../utils/dateHelpers';
const entryDate = safeDate(entry.start_time);
if (entryDate >= startDate && entryDate <= endDate)
```

---

## 🎯 PRIORIDAD

**Alta prioridad:**
1. Reports.jsx (lo ves todos los días)
2. utils/reportCalculations.js (afecta todos los reportes)

**Media prioridad:**
3. utils/periodComparison.js
4. utils/alertRules.js

**Baja prioridad:**
5. utils/exportToPDF.js
6. utils/exportToExcel.js
7. utils/reportExport.js

---

## ✅ VERIFICACIÓN

Después de arreglar cada archivo, verificá que:
1. Los reportes muestren las fechas correctas
2. Las exportaciones tengan fechas correctas
3. Las alertas se disparen en los días correctos

---

**Estado:** TimeEntries.jsx ✅ COMPLETADO
**Pendiente:** ~15 archivos más
