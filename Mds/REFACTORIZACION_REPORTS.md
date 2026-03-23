# 🔧 Refactorización de Reports.jsx - Guía Completa

## ✅ Archivos Ya Creados

1. ✅ `frontend/src/utils/reportCalculations.js` - Funciones de cálculo
2. ✅ `frontend/src/utils/reportExport.js` - Exportación CSV
3. ✅ `frontend/src/components/reports/ReportMetrics.jsx` - Métricas

---

## 📝 Archivos Pendientes por Crear

### 1. `frontend/src/components/reports/ReportFilters.jsx`

```jsx
/**
 * Componente de filtros del reporte
 */

import Select from '../common/Select';
import Input from '../common/Input';
import Button from '../common/Button';
import HierarchicalSelect from '../common/HierarchicalSelect';
import { Filter } from 'lucide-react';
import { USER_ROLES } from '../../constants';

export const ReportFilters = ({ 
  user,
  dateRange,
  setDateRange,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedUser,
  setSelectedUser,
  selectedUnit,
  setSelectedUnit,
  users,
  units,
  loading,
  onApply
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Select
        label="Rango de Fechas"
        value={dateRange}
        onChange={(e) => setDateRange(e.target.value)}
        options={[
          { value: 'week', label: 'Esta Semana' },
          { value: 'month', label: 'Este Mes' },
          { value: 'custom', label: 'Personalizado' }
        ]}
      />

      {dateRange === 'custom' && (
        <>
          <Input
            label="Fecha Inicio"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Fecha Fin"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </>
      )}

      {(user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPERADMIN) && (
        <Select
          label="Usuario"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          options={[
            { value: 'all', label: 'Todos' },
            ...users.map(u => ({ value: u.id, label: u.name }))
          ]}
        />
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Unidad Organizacional
        </label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="all-units"
              checked={selectedUnit === 'all'}
              onChange={(e) => setSelectedUnit(e.target.checked ? 'all' : '')}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="all-units" className="text-sm text-gray-700">
              Todas las unidades
            </label>
          </div>
          
          {selectedUnit !== 'all' && (
            <HierarchicalSelect
              units={units}
              value={selectedUnit === 'all' ? '' : selectedUnit}
              onChange={(unitId) => setSelectedUnit(unitId || 'all')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;
```

---

### 2. `frontend/src/components/reports/ReportCharts.jsx`

```jsx
/**
 * Componente de gráficos del reporte
 */

import Card from '../common/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const ReportCharts = ({ reportData }) => {
  return (
    <>
      {/* Gráfico de horas por día */}
      <Card title="Horas por Día">
        {reportData.byDay.length === 0 ? (
          <p className="text-center text-gray-500 py-12">
            No hay datos para el rango seleccionado
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.byDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), 'dd/MM')}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => format(new Date(date), "dd 'de' MMMM", { locale: es })}
                formatter={(value) => [`${value.toFixed(2)} horas`, 'Horas']}
              />
              <Legend />
              <Bar dataKey="hours" fill="#10b981" name="Horas" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top usuarios */}
        <Card title="Top Usuarios" subtitle="Por horas trabajadas">
          {reportData.byUser.length === 0 ? (
            <p className="text-center text-gray-500 py-12">
              No hay datos
            </p>
          ) : (
            <div className="space-y-4">
              {reportData.byUser.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-600">
                      {index + 1}
                    </span>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.entries} registros</p>
                  </div>
                  <div className="ml-4">
                    <span className="text-lg font-semibold text-gray-900">
                      {item.hours.toFixed(1)}h
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Distribución por unidad */}
        <Card title="Distribución por Unidad">
          {reportData.byUnit.length === 0 ? (
            <p className="text-center text-gray-500 py-12">
              No hay datos
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.byUnit}
                  dataKey="hours"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.hours.toFixed(1)}h`}
                >
                  {reportData.byUnit.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(2)} horas`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </>
  );
};

export default ReportCharts;
```

---

### 3. `frontend/src/components/reports/ReportTable.jsx`

```jsx
/**
 * Componente de tabla jerárquica del reporte
 */

import Card from '../common/Card';
import { getUnitStyle } from '../../constants';

export const ReportTable = ({ reportData, units, selectedUnit }) => {
  return (
    <Card title={
      selectedUnit !== 'all' 
        ? `Detalle Jerárquico - ${units.find(u => u.id === selectedUnit)?.name || 'Unidad'} (incluye procesos internos)`
        : "Detalle por Unidad Organizacional"
    }>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Unidad / Proceso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tipo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Registros
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Total Horas
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Promedio
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                % del Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportData.byUnit.map((item, index) => {
              const indentLevel = item.level || 0;
              const indentPx = indentLevel * 24;
              const percentage = reportData.totalHours > 0 
                ? (item.hours / reportData.totalHours * 100).toFixed(1)
                : 0;
              
              return (
                <tr key={index} className={`hover:bg-gray-50 ${indentLevel > 0 ? 'bg-gray-25' : ''}`}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <div style={{ paddingLeft: `${indentPx}px` }} className="flex items-center">
                      {indentLevel > 0 && (
                        <span className="text-gray-400 mr-2">
                          {'└─ '.repeat(1)}
                        </span>
                      )}
                      <span className={indentLevel === 0 ? 'font-bold' : ''}>
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUnitStyle(item.type, 'badge')}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {item.entries}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                    {item.hours.toFixed(2)}h
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-right">
                    {(item.hours / item.entries).toFixed(2)}h
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-right">
                    <span className={`font-medium ${indentLevel === 0 ? 'text-primary-600' : ''}`}>
                      {percentage}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50 font-semibold">
            <tr>
              <td colSpan="2" className="px-6 py-4 text-sm text-gray-900">
                TOTAL
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 text-right">
                {reportData.totalEntries}
              </td>
              <td className="px-6 py-4 text-sm text-primary-600 text-right">
                {reportData.totalHours.toFixed(2)}h
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 text-right">
                {reportData.totalEntries > 0 
                  ? (reportData.totalHours / reportData.totalEntries).toFixed(2)
                  : '0.00'
                }h
              </td>
              <td className="px-6 py-4 text-sm text-primary-600 text-right">
                100%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
};

export default ReportTable;
```

---

## 🔄 Reports.jsx Refactorizado

Ahora modifica `frontend/src/pages/Reports.jsx` para usar los componentes:

```jsx
import { useState, useEffect } from 'react';
import { Download, Filter } from 'lucide-react';
import { timeEntriesService, usersService, orgUnitsService } from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { USER_ROLES } from '../constants';

// Importar componentes modularizados
import { ReportFilters } from '../components/reports/ReportFilters';
import { ReportMetrics } from '../components/reports/ReportMetrics';
import { ReportCharts } from '../components/reports/ReportCharts';
import { ReportTable } from '../components/reports/ReportTable';

// Importar utilidades
import { getUnitAndChildren, calculateReportMetrics } from '../utils/reportCalculations';
import { exportToCSV } from '../utils/reportExport';

export const Reports = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState('all');
  
  const [users, setUsers] = useState([]);
  const [units, setUnits] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [reportData, setReportData] = useState({
    totalHours: 0,
    totalEntries: 0,
    byUser: [],
    byUnit: [],
    byDay: []
  });

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    updateDateRange();
  }, [dateRange]);

  useEffect(() => {
    loadReportData();
  }, [startDate, endDate, selectedUser, selectedUnit]);

  const updateDateRange = () => {
    const today = new Date();
    
    switch (dateRange) {
      case 'week':
        setStartDate(format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
        setEndDate(format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
        break;
      case 'month':
        setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(today), 'yyyy-MM-dd'));
        break;
      case 'custom':
        break;
      default:
        break;
    }
  };

  const loadFilters = async () => {
    try {
      if (user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPERADMIN) {
        const { users: usersData } = await usersService.getAll();
        setUsers(usersData || []);
      }

      const { organizationalUnits: unitsData } = await orgUnitsService.getAll();
      setUnits(unitsData || []);
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  const loadReportData = async () => {
    try {
      setLoading(true);

      const { timeEntries: entries } = await timeEntriesService.getAll();

      // Filtrar por fechas
      let filtered = entries.filter(entry => {
        const entryDate = new Date(entry.start_time);
        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T23:59:59`);
        
        return entryDate >= start && entryDate <= end && entry.status === 'completed';
      });

      // Filtrar por usuario
      if (user?.role === USER_ROLES.OPERARIO) {
        filtered = filtered.filter(e => e.user_id === user.id);
      } else if (selectedUser !== 'all') {
        filtered = filtered.filter(e => e.user_id === selectedUser);
      }

      // Filtrar por unidad (jerárquico)
      if (selectedUnit !== 'all') {
        const unitIds = getUnitAndChildren(selectedUnit, units);
        filtered = filtered.filter(e => unitIds.includes(e.organizational_unit_id));
      }

      setFilteredEntries(filtered);
      
      // Calcular métricas usando utilidad
      const metrics = calculateReportMetrics(filtered, units);
      setReportData(metrics);

    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    exportToCSV(filteredEntries, startDate, endDate);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="mt-1 text-sm text-gray-500">
            {user?.role === USER_ROLES.OPERARIO ? 'Tus horas trabajadas' : 'Análisis de horas trabajadas'}
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="outline">
          <Download className="h-5 w-5 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <Card title="Filtros" action={
        <Button size="sm" onClick={loadReportData} loading={loading}>
          <Filter className="h-4 w-4 mr-2" />
          Aplicar
        </Button>
      }>
        <ReportFilters
          user={user}
          dateRange={dateRange}
          setDateRange={setDateRange}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          selectedUnit={selectedUnit}
          setSelectedUnit={setSelectedUnit}
          users={users}
          units={units}
          loading={loading}
          onApply={loadReportData}
        />
      </Card>

      {/* Indicador de filtro activo */}
      {selectedUnit !== 'all' && (
        <Card>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Filter className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Filtro Activo: Vista Jerárquica
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Mostrando <strong>{units.find(u => u.id === selectedUnit)?.name}</strong> y todos sus procesos internos (sub-unidades).
                  </p>
                  <p className="mt-1 text-xs">
                    {reportData.byUnit.length} unidad(es) incluida(s) en el reporte
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Métricas */}
      <ReportMetrics reportData={reportData} />

      {/* Gráficos */}
      <ReportCharts reportData={reportData} />

      {/* Tabla */}
      <ReportTable 
        reportData={reportData} 
        units={units}
        selectedUnit={selectedUnit}
      />
    </div>
  );
};

export default Reports;
```

---

## 📊 Resultado de la Refactorización

### Antes:
```
Reports.jsx: 603 líneas
```

### Después:
```
Reports.jsx: ~200 líneas
├── reportCalculations.js: ~150 líneas
├── reportExport.js: ~50 líneas
├── ReportFilters.jsx: ~90 líneas
├── ReportMetrics.jsx: ~40 líneas
├── ReportCharts.jsx: ~120 líneas
└── ReportTable.jsx: ~100 líneas

Total: ~750 líneas (distribuidas en 7 archivos)
```

---

## ✅ Beneficios Inmediatos

1. **Mantenibilidad**: Cada archivo tiene una responsabilidad clara
2. **Reutilización**: Los componentes pueden usarse en otras páginas
3. **Testing**: Funciones puras fáciles de testear
4. **Colaboración**: Varios desarrolladores pueden trabajar sin conflictos
5. **Legibilidad**: Código más fácil de entender

---

## 🚀 Próximos Pasos

1. Crear los archivos pendientes (ReportFilters, ReportCharts, ReportTable)
2. Modificar Reports.jsx para usar los componentes
3. Probar que todo funcione igual que antes
4. Una vez funcionando, agregar nuevas funcionalidades

---

**¡La refactorización está lista para implementarse!** 🎉
