# 📅 REGLAS: Manejo de Fechas y Timestamps

> **⚠️ CRÍTICO:** Estas reglas DEBEN aplicarse en TODA la aplicación para evitar bugs de zona horaria.

---

## 🎯 Regla de Oro

**NUNCA usar `new Date()` directamente con timestamps de la DB.**

**SIEMPRE usar helpers de `utils/dateHelpers.js`.**

---

## 📚 Helpers Disponibles

### 1. `calculateHours(startTime, endTime)`
Calcula horas entre dos timestamps.

```javascript
// ❌ MAL
const hours = (new Date(end) - new Date(start)) / (1000 * 60 * 60);

// ✅ BIEN
import { calculateHours } from '../utils/dateHelpers';
const hours = calculateHours(start, end);
```

### 2. `extractDate(timestamp)`
Extrae solo la fecha (YYYY-MM-DD) de un timestamp.

```javascript
// ❌ MAL
const date = format(new Date(entry.start_time), 'yyyy-MM-dd');

// ✅ BIEN
import { extractDate } from '../utils/dateHelpers';
const date = extractDate(entry.start_time);
```

### 3. `safeDate(timestamp)`
Crea un Date object seguro para formatear **FECHAS** (día/mes/año) sin cambios de día.

**⚠️ IMPORTANTE:** Solo usar para FECHAS, NO para extraer HORAS.

```javascript
// ✅ BIEN - Para mostrar fechas
import { safeDate } from '../utils/dateHelpers';
format(safeDate(entry.start_time), 'dd/MM/yyyy')
isSameDay(safeDate(entry.start_time), today)

// ❌ MAL - Para extraer horas (siempre devuelve 12)
getHours(safeDate(entry.start_time)) // ❌ Siempre 12!
```

### 4. `parseLocalTime(timestamp)`
**NUEVO:** Parsea timestamp preservando la hora exacta del día.

**Usar cuando necesitas la HORA (7am, 8am, etc.), no la fecha.**

```javascript
// ✅ BIEN - Para extraer hora del día
import { parseLocalTime } from '../utils/dateHelpers';
const hour = getHours(parseLocalTime(entry.start_time)); // 8, 14, etc.
format(parseLocalTime(entry.start_time), 'HH:mm') // "08:00", "14:00"

// ❌ MAL - Usar safeDate para horas
const hour = getHours(safeDate(entry.start_time)); // ❌ Siempre 12!
```

### 5. `createDBTimestamp(date, time)`
Crea timestamp para guardar en DB (sin zona horaria).

```javascript
// ✅ BIEN
import { createDBTimestamp } from '../utils/dateHelpers';
const timestamp = createDBTimestamp('2026-03-26', '08:00');
// Resultado: "2026-03-26 08:00:00"
```

---

## 🗄️ Base de Datos

### Configuración Correcta

```sql
-- ✅ BIEN - TIMESTAMP WITHOUT TIME ZONE
CREATE TABLE time_entries (
  start_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  end_time TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

-- ❌ MAL - WITH TIME ZONE causa conversiones
CREATE TABLE time_entries (
  start_time TIMESTAMP WITH TIME ZONE  -- NO USAR
);
```

### Migración

Si ya existe con `WITH TIME ZONE`:

```sql
ALTER TABLE time_entries 
  ALTER COLUMN start_time TYPE TIMESTAMP WITHOUT TIME ZONE,
  ALTER COLUMN end_time TYPE TIMESTAMP WITHOUT TIME ZONE;
```

---

## ✅ Checklist de Code Review

Antes de aprobar un PR, verificar:

- [ ] ¿Se usa `calculateHours()` en vez de cálculo manual?
- [ ] ¿Se usa `extractDate()` para obtener fechas?
- [ ] ¿Se usa `safeDate()` para formatear **fechas** (día/mes/año)?
- [ ] ¿Se usa `parseLocalTime()` para extraer **horas** (7am, 8am, etc.)?
- [ ] ¿Los timestamps se guardan sin zona horaria?
- [ ] ¿Las columnas de DB son `WITHOUT TIME ZONE`?
- [ ] ¿No hay `getHours(safeDate(...))` en el código? (bug común)

---

## 📂 Archivos que DEBEN usar helpers

### ✅ Arreglados (Abril 2026):
- ✅ `pages/TimeEntries.jsx`
- ✅ `utils/dateHelpers.js` (agregado `parseLocalTime()`)
- ✅ `components/reports/TimeDistributionReport.jsx`
- ✅ `components/reports/ProductivityAnalysis.jsx`
- ✅ `components/reports/AreaEfficiencyReport.jsx`
- ✅ `pages/Dashboard.jsx` (30 Abril 2026)
- ✅ `utils/reportExport.js` (30 Abril 2026)
- ✅ `utils/exportToExcel.js` (30 Abril 2026)
- ✅ `utils/exportToPDF.js` (30 Abril 2026)
- ✅ `hooks/useTimeEntries.js` (30 Abril 2026)
- ✅ `components/timeEntry/BulkTimeEntry.jsx` (30 Abril 2026)
- ✅ `components/reports/DetailedEntriesReport.jsx` (30 Abril 2026)
- ✅ `components/reports/GroupedDayView.jsx` (30 Abril 2026) - Bug crítico: corrimiento de día

### ⚠️ Archivos que usan `safeDate()` correctamente (no tocar):
- ✅ `utils/periodComparison.js` (comparaciones de fechas)
- ✅ `utils/alertRules.js` (comparaciones de días)
- ✅ `pages/Reports.jsx` (filtros por fecha)
- ✅ `components/reports/*` (la mayoría usa correctamente)

---

## 🚨 Problemas Comunes

### Problema 1: Fechas aparecen un día antes

**Síntoma:** Las fechas aparecen un día antes en el frontend.

**Causa:** JavaScript interpreta timestamps sin zona como UTC. En zonas UTC negativas (ej: Argentina UTC-3), esto causa que las fechas se muestren un día antes.

**Ejemplo:**
```javascript
// Timestamp en DB: "2026-03-26T08:00:00" (sin zona)
const date = new Date("2026-03-26T08:00:00");
// JavaScript lo interpreta como UTC
// En Argentina (UTC-3): 2026-03-26T05:00:00-03:00
// Al formatear: puede mostrar 2026-03-25 ❌
```

**Solución:** Usar `safeDate()` que agrega `T12:00:00` para evitar cambios de día.

### Problema 2: Todas las horas aparecen como 12:00

**Síntoma:** En reportes de distribución horaria, todos los registros muestran que empiezan/terminan a las 12:00.

**Causa:** Usar `safeDate()` para extraer horas. `safeDate()` normaliza TODO a las 12:00 para evitar cambios de día.

**Ejemplo:**
```javascript
// ❌ MAL
const hour = getHours(safeDate("2026-03-30T08:00:00"));
// Resultado: 12 (siempre 12, sin importar la hora real)

// ✅ BIEN
const hour = getHours(parseLocalTime("2026-03-30T08:00:00"));
// Resultado: 8 (hora real)
```

**Solución:** Usar `parseLocalTime()` cuando necesites la hora exacta del día.

---

## 📖 Documentación Completa

Ver `TEMPLATE/BUENAS_PRACTICAS_DEFINITIVAS.md` sección **"Manejo de Fechas y Timestamps"** para:
- Explicación detallada del problema
- Todos los patrones de uso
- Ejemplos completos
- Reglas de oro

---

## 🛡️ Validación Automática

### Script de Validación

Se ha creado un script que valida automáticamente el uso correcto de fechas:

```bash
node scripts/validate-date-usage.js
```

Este script:
- ✅ Detecta uso de `new Date()` con timestamps de DB
- ✅ Detecta uso de `getHours(safeDate())` (bug común)
- ✅ Detecta uso de `.toDateString()`
- ✅ Genera reporte detallado con líneas específicas
- ✅ Se ejecuta automáticamente en pre-commit (Husky)

### Pre-commit Hook

El hook de pre-commit (`.husky/pre-commit`) ejecuta automáticamente la validación antes de cada commit. Si se detectan violaciones, el commit es bloqueado.

**Esto garantiza que NUNCA se vuelvan a introducir bugs de fechas.**

---

**Última actualización:** 30 de abril de 2026  
**Estado:** Corregidas TODAS las violaciones + validación automática implementada  
**Cambios:** 
- Corregidos 7 archivos con violaciones de reglas
- Implementado script de validación automático
- Agregado pre-commit hook para prevenir futuras violaciones
