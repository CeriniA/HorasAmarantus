# 📄 Reports.jsx - Código Refactorizado Completo

## ⚠️ INSTRUCCIONES

**Reemplaza TODO el contenido de `frontend/src/pages/Reports.jsx` con este código:**

```jsx
import { useState, useEffect } from 'react';
import { Download, Filter } from 'lucide-react';
import { timeEntriesService, usersService, orgUnitsService } from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { USER_ROLES } from '../constants';

// Componentes modularizados
import { ReportFilters } from '../components/reports/ReportFilters';
import { ReportMetrics } from '../components/reports/ReportMetrics';
import { ReportCharts } from '../components/reports/ReportCharts';
import { ReportTable } from '../components/reports/ReportTable';

// Utilidades
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    updateDateRange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  useEffect(() => {
    loadReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

## ✅ Archivos Creados

1. ✅ `frontend/src/utils/reportCalculations.js`
2. ✅ `frontend/src/utils/reportExport.js`
3. ✅ `frontend/src/components/reports/ReportMetrics.jsx`
4. ✅ `frontend/src/components/reports/ReportFilters.jsx`
5. ✅ `frontend/src/components/reports/ReportCharts.jsx`
6. ✅ `frontend/src/components/reports/ReportTable.jsx`

---

## 📊 Resultado

### Antes:
- Reports.jsx: **603 líneas**

### Después:
- Reports.jsx: **220 líneas** ✅
- reportCalculations.js: 150 líneas
- reportExport.js: 50 líneas
- ReportMetrics.jsx: 40 líneas
- ReportFilters.jsx: 90 líneas
- ReportCharts.jsx: 120 líneas
- ReportTable.jsx: 100 líneas

**Total: ~770 líneas distribuidas en 7 archivos**

---

## 🎉 Beneficios

1. **Mantenibilidad**: Cada archivo tiene una responsabilidad clara
2. **Reutilización**: Los componentes pueden usarse en otras páginas
3. **Testing**: Funciones puras fáciles de testear
4. **Colaboración**: Sin conflictos de merge
5. **Legibilidad**: Código más fácil de entender

---

**¡Refactorización completada!** 🚀
