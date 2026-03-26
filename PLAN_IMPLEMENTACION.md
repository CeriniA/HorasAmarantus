# 📋 PLAN DE IMPLEMENTACIÓN - MEJORAS SISTEMA DE HORAS

> **Roadmap de Desarrollo**  
> Inicio: 26 de marzo de 2026  
> Metodología: Sprints de 2 semanas

---

## 🎯 SPRINT 1 - Dashboard Mejorado (Semanas 1-2)

### Objetivos
- ✅ Gráfico de tendencia semanal
- ✅ Comparativa con períodos anteriores
- ✅ Alertas inteligentes
- ✅ Mejoras visuales

### Tareas Detalladas

#### 1.1 Gráfico de Tendencia Semanal
**Archivos a crear/modificar:**
- `frontend/src/components/dashboard/WeeklyTrendChart.jsx` (nuevo)
- `frontend/src/pages/Dashboard.jsx` (modificar)
- `frontend/src/hooks/useTimeEntries.js` (agregar método)

**Funcionalidad:**
```javascript
// Hook personalizado
const getWeeklyTrend = (days = 7) => {
  const trend = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dayEntries = timeEntries.filter(e => 
      isSameDay(new Date(e.start_time), date)
    );
    trend.push({
      date: format(date, 'yyyy-MM-dd'),
      dayName: format(date, 'EEE', { locale: es }),
      hours: getTotalHours(dayEntries),
      entries: dayEntries.length
    });
  }
  return trend;
};
```

**Componente:**
```jsx
<Card title="Tendencia Últimos 7 Días">
  <ResponsiveContainer width="100%" height={200}>
    <LineChart data={weeklyTrend}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="dayName" />
      <YAxis />
      <Tooltip />
      <Line 
        type="monotone" 
        dataKey="hours" 
        stroke="#10b981" 
        strokeWidth={2}
        dot={{ fill: '#10b981', r: 4 }}
      />
    </LineChart>
  </ResponsiveContainer>
</Card>
```

**Estimación:** 4 horas

---

#### 1.2 Comparativa con Períodos Anteriores
**Archivos a crear/modificar:**
- `frontend/src/utils/periodComparison.js` (nuevo)
- `frontend/src/components/dashboard/MetricCard.jsx` (nuevo)
- `frontend/src/pages/Dashboard.jsx` (modificar)

**Utilidad de comparación:**
```javascript
// periodComparison.js
export const comparePeriods = (currentEntries, previousEntries) => {
  const currentHours = getTotalHours(currentEntries);
  const previousHours = getTotalHours(previousEntries);
  
  const change = currentHours - previousHours;
  const percentChange = previousHours > 0 
    ? ((change / previousHours) * 100).toFixed(1)
    : 0;
  
  return {
    current: currentHours,
    previous: previousHours,
    change,
    percentChange,
    trend: change >= 0 ? 'up' : 'down',
    isPositive: change >= 0
  };
};

export const getPreviousPeriod = (startDate, endDate) => {
  const duration = differenceInDays(endDate, startDate);
  return {
    start: subDays(startDate, duration + 1),
    end: subDays(endDate, duration + 1)
  };
};
```

**Componente MetricCard mejorado:**
```jsx
export const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color,
  comparison 
}) => {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`flex-shrink-0 bg-${color}-100 p-3 rounded-lg`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            
            {/* Comparación */}
            {comparison && (
              <div className="flex items-center mt-1">
                {comparison.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  comparison.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {comparison.percentChange}%
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  vs período anterior
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
```

**Estimación:** 6 horas

---

#### 1.3 Alertas Inteligentes
**Archivos a crear/modificar:**
- `frontend/src/components/dashboard/SmartAlerts.jsx` (nuevo)
- `frontend/src/utils/alertRules.js` (nuevo)

**Sistema de reglas:**
```javascript
// alertRules.js
export const evaluateAlerts = (timeEntries, user) => {
  const alerts = [];
  const today = new Date();
  
  // Regla 1: Sin registros hoy
  const todayEntries = timeEntries.filter(e => 
    isSameDay(new Date(e.start_time), today)
  );
  if (todayEntries.length === 0 && getHours(today) >= 18) {
    alerts.push({
      type: 'warning',
      title: 'Sin registros hoy',
      message: 'No has registrado horas hoy. ¿Olvidaste cargarlas?',
      action: { label: 'Registrar ahora', route: '/time-entries' },
      priority: 'high'
    });
  }
  
  // Regla 2: Días consecutivos sin registrar
  const daysWithoutEntries = getDaysWithoutEntries(timeEntries);
  if (daysWithoutEntries >= 3) {
    alerts.push({
      type: 'danger',
      title: `${daysWithoutEntries} días sin registros`,
      message: 'Llevas varios días sin registrar horas',
      action: { label: 'Ver historial', route: '/time-entries' },
      priority: 'high'
    });
  }
  
  // Regla 3: Récord personal
  const weekHours = getWeekHours(timeEntries);
  const avgWeekHours = getAvgWeekHours(timeEntries);
  if (weekHours > avgWeekHours * 1.2) {
    alerts.push({
      type: 'success',
      title: '¡Excelente semana!',
      message: `${weekHours.toFixed(1)}h - Tu mejor semana del mes`,
      priority: 'low'
    });
  }
  
  // Regla 4: Objetivo semanal
  const weeklyGoal = 40;
  const progress = (weekHours / weeklyGoal) * 100;
  if (progress >= 100) {
    alerts.push({
      type: 'success',
      title: '🎯 ¡Meta alcanzada!',
      message: `Completaste tu objetivo semanal de ${weeklyGoal}h`,
      priority: 'medium'
    });
  } else if (progress >= 80 && progress < 100) {
    alerts.push({
      type: 'info',
      title: 'Cerca del objetivo',
      message: `${progress.toFixed(0)}% completado - Faltan ${(weeklyGoal - weekHours).toFixed(1)}h`,
      priority: 'medium'
    });
  }
  
  return alerts.sort((a, b) => {
    const priority = { high: 3, medium: 2, low: 1 };
    return priority[b.priority] - priority[a.priority];
  });
};
```

**Componente:**
```jsx
export const SmartAlerts = ({ alerts }) => {
  if (alerts.length === 0) return null;
  
  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`
            p-4 rounded-lg border-l-4
            ${alert.type === 'success' ? 'bg-green-50 border-green-500' : ''}
            ${alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' : ''}
            ${alert.type === 'danger' ? 'bg-red-50 border-red-500' : ''}
            ${alert.type === 'info' ? 'bg-blue-50 border-blue-500' : ''}
          `}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{alert.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
            </div>
            {alert.action && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.href = alert.action.route}
              >
                {alert.action.label}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
```

**Estimación:** 8 horas

---

## 🎯 SPRINT 2 - Reportes Avanzados (Semanas 3-4)

### Objetivos
- ✅ Análisis comparativo de períodos
- ✅ Análisis de productividad
- ✅ Exportación mejorada (Excel/PDF)
- ✅ Gráficos adicionales

### Tareas Detalladas

#### 2.1 Análisis Comparativo de Períodos
**Archivos a crear/modificar:**
- `frontend/src/components/reports/ComparativeAnalysis.jsx` (nuevo)
- `frontend/src/pages/Reports.jsx` (modificar)

**Componente:**
```jsx
export const ComparativeAnalysis = () => {
  const [periods, setPeriods] = useState([
    { id: 1, name: 'Marzo 2026', start: '2026-03-01', end: '2026-03-31' },
    { id: 2, name: 'Febrero 2026', start: '2026-02-01', end: '2026-02-28' },
  ]);
  
  const [comparisonData, setComparisonData] = useState([]);
  
  // Cargar datos para cada período
  useEffect(() => {
    loadComparisonData();
  }, [periods]);
  
  return (
    <Card title="Análisis Comparativo">
      {/* Selector de períodos */}
      <div className="mb-6 flex gap-4">
        {periods.map(period => (
          <div key={period.id} className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Período {period.id}
            </label>
            <input
              type="month"
              value={period.start.substring(0, 7)}
              onChange={(e) => updatePeriod(period.id, e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        ))}
      </div>
      
      {/* Gráfico comparativo */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={comparisonData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Legend />
          {periods.map((period, index) => (
            <Bar
              key={period.id}
              dataKey={`period${period.id}`}
              name={period.name}
              fill={COLORS[index]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      
      {/* Tabla de diferencias */}
      <div className="mt-6">
        <h4 className="font-semibold mb-3">Diferencias</h4>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Métrica</th>
              {periods.map(p => (
                <th key={p.id} className="text-right py-2">{p.name}</th>
              ))}
              <th className="text-right py-2">Cambio</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">Total Horas</td>
              <td className="text-right">180.5h</td>
              <td className="text-right">165.0h</td>
              <td className="text-right text-green-600">+9.4%</td>
            </tr>
            {/* Más filas */}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
```

**Estimación:** 10 horas

---

#### 2.2 Análisis de Productividad
**Archivos a crear/modificar:**
- `frontend/src/components/reports/ProductivityAnalysis.jsx` (nuevo)
- `frontend/src/utils/productivityMetrics.js` (nuevo)

**Métricas de productividad:**
```javascript
// productivityMetrics.js
export const calculateProductivityMetrics = (timeEntries) => {
  const metrics = {
    consistency: calculateConsistency(timeEntries),
    peakDays: findPeakDays(timeEntries),
    avgHoursPerDay: calculateAvgHoursPerDay(timeEntries),
    patterns: detectPatterns(timeEntries)
  };
  
  return metrics;
};

const calculateConsistency = (entries) => {
  // Calcular desviación estándar de horas diarias
  const dailyHours = groupByDay(entries).map(day => day.totalHours);
  const avg = mean(dailyHours);
  const variance = dailyHours.reduce((sum, h) => sum + Math.pow(h - avg, 2), 0) / dailyHours.length;
  const stdDev = Math.sqrt(variance);
  
  // Score: 100 - (stdDev * 10), máximo 100
  return Math.max(0, Math.min(100, 100 - (stdDev * 10)));
};

const findPeakDays = (entries) => {
  const byDayOfWeek = groupBy(entries, e => 
    format(new Date(e.start_time), 'EEEE', { locale: es })
  );
  
  const avgByDay = Object.entries(byDayOfWeek).map(([day, entries]) => ({
    day,
    avgHours: getTotalHours(entries) / entries.length
  }));
  
  return avgByDay
    .sort((a, b) => b.avgHours - a.avgHours)
    .slice(0, 3)
    .map(d => d.day);
};

const detectPatterns = (entries) => {
  // Detectar si es "morning person" o "night owl"
  const hourDistribution = entries.map(e => 
    getHours(new Date(e.start_time))
  );
  
  const avgStartHour = mean(hourDistribution);
  
  return {
    morningPerson: avgStartHour < 9,
    avgStartTime: `${Math.floor(avgStartHour)}:${String(Math.round((avgStartHour % 1) * 60)).padStart(2, '0')}`,
    weekendWorker: entries.some(e => isWeekend(new Date(e.start_time)))
  };
};
```

**Componente con Radar Chart:**
```jsx
export const ProductivityAnalysis = ({ metrics }) => {
  const radarData = [
    { metric: 'Consistencia', value: metrics.consistency },
    { metric: 'Puntualidad', value: 85 },
    { metric: 'Productividad', value: 90 },
    { metric: 'Diversidad', value: 75 },
    { metric: 'Eficiencia', value: 88 }
  ];
  
  return (
    <Card title="Análisis de Productividad">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Tu Desempeño"
                dataKey="value"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Insights */}
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">
              🌅 Patrón de Trabajo
            </h4>
            <p className="text-sm text-blue-800">
              Eres más productivo los {metrics.peakDays.join(', ')}
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">
              ⏰ Horario Típico
            </h4>
            <p className="text-sm text-green-800">
              Comienzas en promedio a las {metrics.patterns.avgStartTime}
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">
              📊 Consistencia
            </h4>
            <p className="text-sm text-purple-800">
              Score: {metrics.consistency}/100 - 
              {metrics.consistency > 80 ? ' Excelente' : ' Puede mejorar'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
```

**Estimación:** 12 horas

---

#### 2.3 Exportación Mejorada (Excel/PDF)
**Archivos a crear/modificar:**
- `frontend/src/utils/exportToExcel.js` (nuevo)
- `frontend/src/utils/exportToPDF.js` (nuevo)
- `backend/src/routes/reports.js` (nuevo)

**Instalación de dependencias:**
```bash
# Frontend
npm install xlsx jspdf jspdf-autotable

# Backend
npm install exceljs pdfkit
```

**Exportación Excel (Frontend):**
```javascript
// exportToExcel.js
import * as XLSX from 'xlsx';

export const exportToExcel = (data, filename = 'reporte') => {
  // Crear workbook
  const wb = XLSX.utils.book_new();
  
  // Hoja 1: Resumen
  const summaryData = [
    ['REPORTE DE HORAS TRABAJADAS'],
    [''],
    ['Período:', `${data.startDate} - ${data.endDate}`],
    ['Total Horas:', data.totalHours],
    ['Total Registros:', data.totalEntries],
    [''],
    ['MÉTRICAS'],
    ['Promedio por día:', data.avgPerDay],
    ['Días trabajados:', data.daysWorked],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws1, 'Resumen');
  
  // Hoja 2: Detalle por empleado
  const employeeData = data.byUser.map(u => ({
    'Empleado': u.name,
    'Total Horas': u.hours,
    'Registros': u.entries,
    'Promedio/Día': (u.hours / data.daysWorked).toFixed(2)
  }));
  const ws2 = XLSX.utils.json_to_sheet(employeeData);
  XLSX.utils.book_append_sheet(wb, ws2, 'Por Empleado');
  
  // Hoja 3: Detalle por unidad
  const unitData = data.byUnit.map(u => ({
    'Unidad': u.name,
    'Total Horas': u.hours,
    'Registros': u.entries,
    '% del Total': ((u.hours / data.totalHours) * 100).toFixed(1) + '%'
  }));
  const ws3 = XLSX.utils.json_to_sheet(unitData);
  XLSX.utils.book_append_sheet(wb, ws3, 'Por Unidad');
  
  // Hoja 4: Detalle completo
  const detailData = data.entries.map(e => ({
    'Fecha': format(new Date(e.start_time), 'dd/MM/yyyy'),
    'Empleado': e.user_name,
    'Unidad': e.unit_name,
    'Inicio': format(new Date(e.start_time), 'HH:mm'),
    'Fin': format(new Date(e.end_time), 'HH:mm'),
    'Horas': e.total_hours,
    'Descripción': e.description || ''
  }));
  const ws4 = XLSX.utils.json_to_sheet(detailData);
  XLSX.utils.book_append_sheet(wb, ws4, 'Detalle Completo');
  
  // Descargar
  XLSX.writeFile(wb, `${filename}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
};
```

**Exportación PDF:**
```javascript
// exportToPDF.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPDF = (data, filename = 'reporte') => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.text('Reporte de Horas Trabajadas', 14, 20);
  
  doc.setFontSize(11);
  doc.text(`Período: ${data.startDate} - ${data.endDate}`, 14, 30);
  doc.text(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 36);
  
  // Resumen
  doc.setFontSize(14);
  doc.text('Resumen', 14, 46);
  
  doc.autoTable({
    startY: 50,
    head: [['Métrica', 'Valor']],
    body: [
      ['Total Horas', `${data.totalHours.toFixed(1)}h`],
      ['Total Registros', data.totalEntries],
      ['Promedio por Día', `${data.avgPerDay.toFixed(1)}h`],
      ['Días Trabajados', data.daysWorked]
    ],
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] }
  });
  
  // Top Empleados
  doc.addPage();
  doc.setFontSize(14);
  doc.text('Top Empleados', 14, 20);
  
  doc.autoTable({
    startY: 25,
    head: [['Empleado', 'Horas', 'Registros']],
    body: data.byUser.map(u => [
      u.name,
      `${u.hours.toFixed(1)}h`,
      u.entries
    ]),
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] }
  });
  
  // Guardar
  doc.save(`${filename}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};
```

**Estimación:** 10 horas

---

## 🎯 SPRINT 3 - Funcionalidades Nuevas (Semanas 5-6)

### Objetivos
- ✅ Plantillas de registro
- ✅ Sistema de objetivos/metas
- ✅ Notificaciones básicas
- ✅ Mejoras UX

### Tareas Detalladas

#### 3.1 Plantillas de Registro
**Backend - Nueva tabla:**
```sql
CREATE TABLE time_entry_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  tasks JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ejemplo de tasks JSONB:
-- [
--   {"unit_id": "uuid", "hours": 4, "minutes": 0},
--   {"unit_id": "uuid", "hours": 3, "minutes": 30}
-- ]
```

**Backend - Endpoints:**
```javascript
// backend/src/routes/templates.js
router.get('/templates', auth, async (req, res) => {
  const templates = await db.query(
    'SELECT * FROM time_entry_templates WHERE user_id = $1',
    [req.user.id]
  );
  res.json({ templates: templates.rows });
});

router.post('/templates', auth, async (req, res) => {
  const { name, tasks } = req.body;
  const result = await db.query(
    'INSERT INTO time_entry_templates (user_id, name, tasks) VALUES ($1, $2, $3) RETURNING *',
    [req.user.id, name, JSON.stringify(tasks)]
  );
  res.status(201).json({ template: result.rows[0] });
});
```

**Frontend - Componente:**
```jsx
// TemplateSelector.jsx
export const TemplateSelector = ({ onSelect }) => {
  const [templates, setTemplates] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  const loadTemplates = async () => {
    const { templates } = await api.get('/templates');
    setTemplates(templates);
  };
  
  const saveAsTemplate = async (name, tasks) => {
    await api.post('/templates', { name, tasks });
    await loadTemplates();
  };
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">
        Plantillas Guardadas
      </label>
      <div className="flex gap-2">
        <select
          className="flex-1 px-3 py-2 border rounded-lg"
          onChange={(e) => {
            const template = templates.find(t => t.id === e.target.value);
            if (template) onSelect(template.tasks);
          }}
        >
          <option value="">Seleccionar plantilla...</option>
          {templates.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <Button onClick={() => setShowSaveDialog(true)}>
          Guardar como plantilla
        </Button>
      </div>
    </div>
  );
};
```

**Estimación:** 8 horas

---

#### 3.2 Sistema de Objetivos/Metas
**Backend - Nueva tabla:**
```sql
CREATE TABLE user_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
  target_hours DECIMAL(5,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Frontend - Componente:**
```jsx
// GoalTracker.jsx
export const GoalTracker = ({ userId }) => {
  const [goal, setGoal] = useState(null);
  const [progress, setProgress] = useState(0);
  
  const calculateProgress = () => {
    // Calcular progreso basado en horas actuales vs objetivo
    const currentHours = getCurrentPeriodHours();
    const percentage = (currentHours / goal.target_hours) * 100;
    setProgress(percentage);
  };
  
  return (
    <Card title="Tu Objetivo Semanal">
      <div className="text-center">
        {/* Circular Progress */}
        <div className="relative inline-flex items-center justify-center w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#10b981"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute">
            <span className="text-2xl font-bold">{progress.toFixed(0)}%</span>
          </div>
        </div>
        
        <p className="mt-4 text-sm text-gray-600">
          {currentHours.toFixed(1)}h de {goal.target_hours}h
        </p>
        
        {progress >= 100 ? (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-green-800 font-medium">
              🎉 ¡Objetivo cumplido!
            </p>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm">
              Faltan {(goal.target_hours - currentHours).toFixed(1)}h
            </p>
            <p className="text-blue-600 text-xs mt-1">
              Promedio necesario: {getRequiredDailyAvg().toFixed(1)}h/día
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
```

**Estimación:** 12 horas

---

## 📊 RESUMEN DE SPRINTS

| Sprint | Duración | Funcionalidades | Horas Estimadas |
|--------|----------|-----------------|-----------------|
| Sprint 1 | 2 semanas | Dashboard mejorado | 18h |
| Sprint 2 | 2 semanas | Reportes avanzados | 32h |
| Sprint 3 | 2 semanas | Funcionalidades nuevas | 20h |
| **Total** | **6 semanas** | **9 mejoras principales** | **70h** |

---

## 🎯 MÉTRICAS DE ÉXITO

### Sprint 1
- [ ] Usuarios pueden ver tendencia de últimos 7 días
- [ ] Métricas muestran comparación con período anterior
- [ ] Al menos 3 alertas inteligentes funcionando
- [ ] Feedback positivo de 80%+ usuarios

### Sprint 2
- [ ] Comparación de 2+ períodos simultáneos
- [ ] Análisis de productividad con insights
- [ ] Exportación Excel con 4 hojas
- [ ] Exportación PDF con gráficos

### Sprint 3
- [ ] Usuarios pueden crear y usar plantillas
- [ ] Sistema de objetivos activo
- [ ] 90%+ usuarios encuentran útiles las plantillas

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

1. **Revisar y aprobar** este plan
2. **Configurar entorno** de desarrollo
3. **Crear branch** `feature/dashboard-improvements`
4. **Comenzar Sprint 1** - Tarea 1.1

---

**Documento vivo - Actualizar después de cada sprint**
