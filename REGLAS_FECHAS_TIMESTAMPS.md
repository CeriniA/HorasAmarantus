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
Crea un Date object seguro para formatear sin cambios de día.

```javascript
// ❌ MAL
format(new Date(entry.start_time), 'dd/MM/yyyy')

// ✅ BIEN
import { safeDate } from '../utils/dateHelpers';
format(safeDate(entry.start_time), 'dd/MM/yyyy')
```

### 4. `createDBTimestamp(date, time)`
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
- [ ] ¿Se usa `safeDate()` para formatear fechas?
- [ ] ¿Los timestamps se guardan sin zona horaria?
- [ ] ¿Las columnas de DB son `WITHOUT TIME ZONE`?
- [ ] ¿No hay `new Date(timestamp)` directo en el código?

---

## 📂 Archivos que DEBEN usar helpers

### Alta prioridad (ya arreglados):
- ✅ `pages/TimeEntries.jsx`
- ✅ `utils/dateHelpers.js` (creado)

### Pendientes de arreglar:
- ⚠️ `pages/Reports.jsx`
- ⚠️ `utils/reportCalculations.js`
- ⚠️ `utils/periodComparison.js`
- ⚠️ `utils/alertRules.js`
- ⚠️ `utils/exportToPDF.js`
- ⚠️ `utils/exportToExcel.js`
- ⚠️ `utils/reportExport.js`
- ⚠️ `components/dashboard/*`
- ⚠️ `hooks/useTimeEntries.js`

Ver `ARREGLO_FECHAS_PENDIENTE.md` para detalles.

---

## 🚨 Problema Común

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

---

## 📖 Documentación Completa

Ver `TEMPLATE/BUENAS_PRACTICAS_DEFINITIVAS.md` sección **"Manejo de Fechas y Timestamps"** para:
- Explicación detallada del problema
- Todos los patrones de uso
- Ejemplos completos
- Reglas de oro

---

**Última actualización:** 26 de marzo de 2026  
**Estado:** Regla agregada a buenas prácticas base del proyecto
