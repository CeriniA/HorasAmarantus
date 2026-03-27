# 📊 CÓDIGO DE REPORTES PENDIENTES

## ✅ COMPLETADOS (2/5)

1. ✅ **AreaEfficiencyReport.jsx** - Eficiencia por Área
2. ✅ **OvertimeReport.jsx** - Horas Extras

---

## ⏳ PENDIENTES (3/5)

### 3. MonthlyTrendsReport.jsx - Tendencias Mensuales

**Características:**
- Gráfico de línea con últimos 12 meses
- Tendencia (↑↓) y proyección
- Comparación vs mismo mes año anterior
- Detección de patrones estacionales

**Tamaño estimado:** ~250 líneas

---

### 4. GoalComplianceReport.jsx - Cumplimiento de Objetivos

**Características:**
- Tabla de usuarios con objetivo vs real
- Semáforo (verde/amarillo/rojo)
- Ranking de cumplimiento
- Gráfico de barras de progreso
- **NOTA:** Requiere campo `weekly_goal` en DB (usará 40 como default)

**Tamaño estimado:** ~280 líneas

---

### 5. TimeDistributionReport.jsx - Distribución Horaria

**Características:**
- Heatmap de horas del día (8am-6pm)
- Días de semana más activos
- Patrones de inicio/fin de jornada
- Picos de actividad

**Tamaño estimado:** ~300 líneas

---

## 🎯 INTEGRACIÓN FINAL

### Reports.jsx con Tabs

Agregar sistema de tabs para navegar entre reportes:

```jsx
const [activeTab, setActiveTab] = useState('general');

const tabs = [
  { id: 'general', name: 'General', icon: BarChart },
  { id: 'efficiency', name: 'Eficiencia por Área', icon: TrendingUp },
  { id: 'overtime', name: 'Horas Extras', icon: AlertTriangle },
  { id: 'trends', name: 'Tendencias', icon: LineChart },
  { id: 'goals', name: 'Objetivos', icon: Target },
  { id: 'distribution', name: 'Distribución', icon: Clock }
];

// Renderizar componente según tab activo
{activeTab === 'efficiency' && <AreaEfficiencyReport ... />}
{activeTab === 'overtime' && <OvertimeReport ... />}
// etc...
```

---

## 📝 ESTADO ACTUAL

**Archivos creados:**
- ✅ `frontend/src/components/reports/AreaEfficiencyReport.jsx`
- ✅ `frontend/src/components/reports/OvertimeReport.jsx`

**Pendiente de crear:**
- ⏳ `frontend/src/components/reports/MonthlyTrendsReport.jsx`
- ⏳ `frontend/src/components/reports/GoalComplianceReport.jsx`
- ⏳ `frontend/src/components/reports/TimeDistributionReport.jsx`

**Pendiente de modificar:**
- ⏳ `frontend/src/pages/Reports.jsx` (agregar tabs e integrar todos)

---

## ⚠️ CONSIDERACIONES

### Sobre Objetivos
- El reporte de cumplimiento usará `user?.weekly_goal || 40`
- Funciona ahora con default de 40h
- Cuando agregues el campo a DB, se actualizará automáticamente

### Sobre Performance
- Todos los cálculos usan `useMemo` para optimización
- No hay llamadas adicionales a API
- Todo se calcula en frontend con datos ya cargados

### Sobre Compatibilidad
- No rompe nada existente
- Los reportes son componentes independientes
- Se pueden activar/desactivar individualmente

---

## 🚀 PRÓXIMOS PASOS

¿Quieres que:

**A)** Cree los 3 reportes restantes ahora?
**B)** Cree solo algunos específicos?
**C)** Primero integre los 2 que ya están con tabs y luego agregamos más?

**Recomendación:** Opción C - Integrar los 2 actuales primero para que los pruebes, y luego agregamos los demás.
