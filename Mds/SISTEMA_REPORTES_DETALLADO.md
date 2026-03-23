# 📊 Sistema de Reportes - Documentación Completa

## 🎯 ¿Qué Puedes Hacer en Reportes?

Tu sistema de reportes es **muy completo** y permite analizar las horas trabajadas desde múltiples perspectivas.

---

## 📋 Funcionalidades Principales

### 1. **Filtros Avanzados** 🔍

#### A. Filtro por Rango de Fechas
```
✅ Esta Semana (lunes a domingo)
✅ Este Mes (día 1 al último día)
✅ Personalizado (selecciona inicio y fin)
```

**Cómo funciona:**
- Automático: Selecciona "Esta Semana" o "Este Mes" y se calculan las fechas
- Manual: Selecciona "Personalizado" y elige las fechas exactas

#### B. Filtro por Usuario (Solo Admin/Superadmin)
```
✅ Todos los usuarios
✅ Usuario específico
```

**Permisos:**
- **Operario:** Solo ve sus propios datos (sin opción de filtro)
- **Admin/Superadmin:** Puede ver todos o filtrar por usuario específico

#### C. Filtro por Unidad Organizacional (Jerárquico)
```
✅ Todas las unidades
✅ Unidad específica + todos sus procesos internos
```

**Característica especial:**
- Si seleccionas un **Área**, incluye automáticamente todos sus **Procesos**, **Subprocesos** y **Tareas**
- Filtro jerárquico recursivo

**Ejemplo:**
```
Seleccionas: "Producción" (área)
Incluye automáticamente:
  ├── Ensamblaje (proceso)
  │   └── Control Calidad (subproceso)
  │       └── Inspección (tarea)
  └── Empaquetado (proceso)
```

---

### 2. **Métricas Principales** 📈

#### Total de Horas
```
┌─────────────────────┐
│  Total de Horas     │
│                     │
│      245.5h         │
│                     │
│   120 registros     │
└─────────────────────┘
```

**Muestra:**
- Suma total de horas del período filtrado
- Cantidad de registros incluidos

#### Promedio por Día
```
┌─────────────────────┐
│  Promedio por Día   │
│                     │
│       8.2h          │
│                     │
│  30 días trabajados │
└─────────────────────┘
```

**Muestra:**
- Promedio de horas por día trabajado
- Cantidad de días con registros

---

### 3. **Gráfico de Horas por Día** 📊

**Tipo:** Gráfico de barras (BarChart)

**Muestra:**
- Eje X: Fechas (formato dd/MM)
- Eje Y: Horas trabajadas
- Tooltip: Fecha completa + horas con 2 decimales

**Ejemplo visual:**
```
Horas
  12 │     ██
  10 │     ██  ██
   8 │  ██ ██  ██     ██
   6 │  ██ ██  ██  ██ ██
   4 │  ██ ██  ██  ██ ██
   2 │  ██ ██  ██  ██ ██
   0 └──────────────────────
      01  02  03  04  05  (Marzo)
```

**Utilidad:**
- Ver tendencias diarias
- Identificar días con más/menos trabajo
- Detectar patrones semanales

---

### 4. **Top Usuarios** 👥

**Tipo:** Lista rankeada

**Muestra:**
- Top 10 usuarios por horas trabajadas
- Ranking del 1 al 10
- Nombre del usuario
- Total de horas
- Cantidad de registros

**Ejemplo:**
```
┌──────────────────────────────────┐
│  Top Usuarios                    │
├──────────────────────────────────┤
│ 1️⃣  Juan Pérez                   │
│     125 registros      245.5h    │
├──────────────────────────────────┤
│ 2️⃣  María García                 │
│     98 registros       189.2h    │
├──────────────────────────────────┤
│ 3️⃣  Carlos López                 │
│     87 registros       156.8h    │
└──────────────────────────────────┘
```

**Utilidad:**
- Identificar empleados más productivos
- Comparar rendimiento entre usuarios
- Detectar anomalías (muy pocas o muchas horas)

---

### 5. **Distribución por Unidad** 🥧

**Tipo:** Gráfico de torta (PieChart)

**Muestra:**
- Porcentaje de horas por unidad organizacional
- Colores diferentes para cada unidad
- Labels con nombre y horas

**Ejemplo visual:**
```
        Producción
          45.2h
         ╱────────╲
    Empaque      Ensamblaje
     12.3h         23.1h
```

**Utilidad:**
- Ver distribución de esfuerzo entre áreas
- Identificar unidades con más carga de trabajo
- Balancear recursos

---

### 6. **Tabla Detallada Jerárquica** 📋

**Tipo:** Tabla con indentación por niveles

**Columnas:**
1. **Unidad/Proceso** (con indentación visual)
2. **Tipo** (badge de color)
3. **Registros** (cantidad)
4. **Total Horas**
5. **Promedio** (horas/registro)
6. **% del Total**

**Ejemplo:**
```
┌──────────────────────┬─────────┬──────────┬────────┬──────────┬─────────┐
│ Unidad / Proceso     │ Tipo    │ Registros│ Total  │ Promedio │ % Total │
├──────────────────────┼─────────┼──────────┼────────┼──────────┼─────────┤
│ Producción           │ area    │    120   │ 245.5h │   2.05h  │  52.3%  │
│ └─ Ensamblaje        │ proceso │     45   │ 123.2h │   2.74h  │  26.2%  │
│    └─ Control Cal... │ subproc │     28   │  67.8h │   2.42h  │  14.4%  │
│       └─ Inspección  │ tarea   │     15   │  34.5h │   2.30h  │   7.3%  │
│ └─ Empaquetado       │ proceso │     32   │  54.5h │   1.70h  │  11.6%  │
├──────────────────────┼─────────┼──────────┼────────┼──────────┼─────────┤
│ TOTAL                │         │    120   │ 245.5h │   2.05h  │  100%   │
└──────────────────────┴─────────┴──────────┴────────┴──────────┴─────────┘
```

**Características especiales:**
- **Indentación visual:** Muestra la jerarquía con `└─`
- **Ordenamiento:** Primero por nivel (padres antes que hijos), luego por horas
- **Badges de color:** Cada tipo tiene su color distintivo
- **Fila de totales:** Resume todo al final

**Utilidad:**
- Ver estructura organizacional completa
- Analizar distribución jerárquica de trabajo
- Identificar cuellos de botella en procesos específicos

---

### 7. **Exportar a CSV** 📥

**Formato:** Archivo CSV detallado con TODOS los registros individuales

**Columnas del CSV:**
1. Fecha (yyyy-MM-dd)
2. Usuario
3. Unidad
4. Tipo Unidad
5. Descripción
6. Hora Inicio (HH:mm:ss)
7. Hora Fin (HH:mm:ss)
8. Total Horas

**Nombre del archivo:**
```
reporte-horas-detallado-2026-03-01-2026-03-31.csv
```

**Ejemplo del contenido:**
```csv
"Fecha","Usuario","Unidad","Tipo Unidad","Descripción","Hora Inicio","Hora Fin","Total Horas"
"2026-03-18","Juan Pérez","Ensamblaje","proceso","Armado de piezas","08:00:00","12:00:00","4.00"
"2026-03-18","María García","Control Calidad","subproceso","Inspección visual","13:00:00","15:30:00","2.50"
```

**Utilidad:**
- Exportar para análisis en Excel
- Compartir con gerencia
- Auditorías
- Respaldo de datos

---

## 🔐 Permisos por Rol

### Operario
```
✅ Ver solo sus propios datos
✅ Filtrar por fecha
✅ Filtrar por unidad organizacional
✅ Ver gráficos de sus horas
✅ Exportar CSV de sus registros
❌ No puede filtrar por usuario
❌ No ve datos de otros usuarios
```

### Admin / Superadmin
```
✅ Ver datos de TODOS los usuarios
✅ Filtrar por usuario específico
✅ Filtrar por fecha
✅ Filtrar por unidad organizacional
✅ Ver gráficos globales
✅ Ver top usuarios
✅ Exportar CSV completo
```

---

## 🎨 Características Técnicas

### 1. **Filtro Jerárquico Recursivo**

```javascript
// Función que obtiene una unidad y TODAS sus sub-unidades
const getUnitAndChildren = (unitId) => {
  const result = [unitId];
  
  const findChildren = (parentId) => {
    units.forEach(unit => {
      if (unit.parent_id === parentId && !result.includes(unit.id)) {
        result.push(unit.id);
        findChildren(unit.id); // ← Recursivo
      }
    });
  };
  
  findChildren(unitId);
  return result;
};
```

**Ejemplo:**
```
Input: "Producción" (id: 1)
Output: [1, 2, 3, 4, 5]
  1 = Producción (área)
  2 = Ensamblaje (proceso hijo de 1)
  3 = Control Calidad (subproceso hijo de 2)
  4 = Inspección (tarea hijo de 3)
  5 = Empaquetado (proceso hijo de 1)
```

### 2. **Agrupación de Datos**

#### Por Usuario:
```javascript
const byUserMap = {};
filteredEntries.forEach(entry => {
  const userId = entry.user_id;
  if (!byUserMap[userId]) {
    byUserMap[userId] = {
      name: entry.users?.name,
      hours: 0,
      entries: 0
    };
  }
  byUserMap[userId].hours += entry.total_hours;
  byUserMap[userId].entries += 1;
});
```

#### Por Unidad (con jerarquía):
```javascript
const byUnitMap = {};
filteredEntries.forEach(entry => {
  const unitId = entry.organizational_unit_id;
  const unitData = units.find(u => u.id === unitId);
  
  byUnitMap[unitId] = {
    name: entry.organizational_units?.name,
    type: entry.organizational_units?.type,
    level: unitData?.level || 0,  // ← Para ordenar jerárquicamente
    hours: (byUnitMap[unitId]?.hours || 0) + entry.total_hours,
    entries: (byUnitMap[unitId]?.entries || 0) + 1
  };
});

// Ordenar por nivel (padres primero) y luego por horas
byUnit.sort((a, b) => {
  if (a.level !== b.level) return a.level - b.level;
  return b.hours - a.hours;
});
```

#### Por Día:
```javascript
const byDayMap = {};
filteredEntries.forEach(entry => {
  const day = format(new Date(entry.start_time), 'yyyy-MM-dd');
  
  if (!byDayMap[day]) {
    byDayMap[day] = { date: day, hours: 0, entries: 0 };
  }
  
  byDayMap[day].hours += entry.total_hours;
  byDayMap[day].entries += 1;
});
```

### 3. **Generación de CSV**

```javascript
const exportToCSV = () => {
  // Headers
  const headers = ['Fecha', 'Usuario', 'Unidad', ...];
  
  // Rows (cada registro individual)
  const rows = filteredEntries.map(entry => [
    format(new Date(entry.start_time), 'yyyy-MM-dd'),
    entry.users?.name || 'Desconocido',
    entry.organizational_units?.name || 'Sin unidad',
    entry.organizational_units?.type || '',
    (entry.description || '').replace(/,/g, ';'), // ← Evita romper CSV
    format(new Date(entry.start_time), 'HH:mm:ss'),
    entry.end_time ? format(new Date(entry.end_time), 'HH:mm:ss') : '',
    entry.total_hours?.toFixed(2) || '0.00'
  ]);
  
  // Crear CSV
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  // Descargar
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte-horas-detallado-${startDate}-${endDate}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};
```

---

## 📊 Ejemplos de Uso

### Caso 1: Ver Productividad Mensual
```
1. Seleccionar "Este Mes"
2. Dejar "Todos" en usuario
3. Dejar "Todas las unidades"
4. Ver:
   - Total de horas del mes
   - Gráfico de tendencia diaria
   - Top 10 usuarios más productivos
```

### Caso 2: Analizar un Área Específica
```
1. Seleccionar rango de fechas
2. Filtrar por "Producción" (área)
3. Ver:
   - Horas totales en Producción + todos sus procesos
   - Distribución entre Ensamblaje, Empaquetado, etc.
   - Tabla jerárquica con todos los niveles
```

### Caso 3: Auditar un Usuario
```
1. Seleccionar "Personalizado" (último trimestre)
2. Filtrar por usuario específico
3. Ver:
   - Total de horas del usuario
   - Distribución de su trabajo entre unidades
   - Tendencia diaria
4. Exportar CSV para análisis detallado
```

### Caso 4: Comparar Semanas
```
Semana 1:
1. Seleccionar "Esta Semana"
2. Anotar total de horas

Semana 2 (siguiente):
1. Seleccionar "Esta Semana" (nueva semana)
2. Comparar con semana anterior
```

---

## 🎯 Mejoras Potenciales (Futuras)

### 1. Comparación de Períodos
```
✨ Comparar mes actual vs mes anterior
✨ Ver % de crecimiento/decrecimiento
```

### 2. Filtros Adicionales
```
✨ Filtrar por rango de horas (ej: >8h por día)
✨ Filtrar por día de la semana
✨ Filtrar por descripción (búsqueda de texto)
```

### 3. Gráficos Adicionales
```
✨ Gráfico de líneas (tendencia temporal)
✨ Heatmap (horas por día de la semana)
✨ Gráfico de dispersión (horas vs registros)
```

### 4. Exportación Avanzada
```
✨ Exportar a PDF con gráficos
✨ Exportar a Excel con formato
✨ Enviar reporte por email
```

### 5. Alertas y Notificaciones
```
✨ Alertar si un usuario tiene <40h/semana
✨ Alertar si una unidad tiene sobrecarga
✨ Resumen semanal automático
```

---

## 📋 Resumen

### Lo que TIENES ahora:
- ✅ Filtros por fecha (semana, mes, personalizado)
- ✅ Filtro por usuario (admin/superadmin)
- ✅ Filtro jerárquico por unidad organizacional
- ✅ Métricas principales (total, promedio)
- ✅ Gráfico de barras por día
- ✅ Top 10 usuarios
- ✅ Gráfico de torta por unidad
- ✅ Tabla detallada jerárquica
- ✅ Exportación a CSV completo
- ✅ Permisos por rol
- ✅ Indicador visual de filtro activo

### Lo que NO tienes (pero podrías agregar):
- ❌ Comparación entre períodos
- ❌ Gráficos de tendencia temporal
- ❌ Exportación a PDF
- ❌ Alertas automáticas
- ❌ Filtros avanzados (texto, rangos)

---

**Tu sistema de reportes es muy completo y profesional.** Cubre todos los casos de uso básicos y algunos avanzados. 🎉
