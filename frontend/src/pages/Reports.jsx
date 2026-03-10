import { useState, useEffect } from 'react';
import { Download, Filter } from 'lucide-react';
import { timeEntriesService, usersService, orgUnitsService } from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import Input from '../components/common/Input';
import HierarchicalSelect from '../components/common/HierarchicalSelect';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
        // No hacer nada, el usuario ingresará las fechas
        break;
      default:
        break;
    }
  };

  const loadFilters = async () => {
    try {
      // Cargar usuarios (solo si es admin/superadmin)
      if (user?.role === 'admin' || user?.role === 'superadmin') {
        const { users: usersData } = await usersService.getAll();
        setUsers(usersData || []);
      }

      // Cargar unidades organizacionales
      const { organizationalUnits: unitsData } = await orgUnitsService.getAll();
      setUnits(unitsData || []);
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  // Función para obtener una unidad y todas sus sub-unidades
  const getUnitAndChildren = (unitId) => {
    const result = [unitId];
    const selectedUnitData = units.find(u => u.id === unitId);
    
    if (!selectedUnitData) return result;
    
    // Buscar todas las unidades que tengan esta como padre (directa o indirectamente)
    const findChildren = (parentId) => {
      units.forEach(unit => {
        if (unit.parent_id === parentId && !result.includes(unit.id)) {
          result.push(unit.id);
          findChildren(unit.id); // Recursivo para sub-sub-unidades
        }
      });
    };
    
    findChildren(unitId);
    return result;
  };

  const loadReportData = async () => {
    try {
      setLoading(true);

      // Obtener todos los registros del backend
      const { timeEntries: entries } = await timeEntriesService.getAll();

      // Filtrar por fechas y criterios
      let filteredEntries = entries.filter(entry => {
        const entryDate = new Date(entry.start_time);
        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T23:59:59`);
        
        return entryDate >= start && entryDate <= end && entry.status === 'completed';
      });

      // Si es operario, solo mostrar sus propios registros
      if (user?.role === 'operario') {
        filteredEntries = filteredEntries.filter(e => e.user_id === user.id);
      } else if (selectedUser !== 'all') {
        // Admin/Superadmin pueden filtrar por usuario
        filteredEntries = filteredEntries.filter(e => e.user_id === selectedUser);
      }

      if (selectedUnit !== 'all') {
        // Obtener la unidad seleccionada y todas sus sub-unidades
        const unitIds = getUnitAndChildren(selectedUnit);
        filteredEntries = filteredEntries.filter(e => unitIds.includes(e.organizational_unit_id));
      }

      // Procesar datos
      const totalHours = filteredEntries.reduce((sum, e) => sum + (e.total_hours || 0), 0);
      const totalEntries = filteredEntries.length;

      // Agrupar por usuario
      const byUserMap = {};
      filteredEntries.forEach(entry => {
        const userId = entry.user_id;
        if (!byUserMap[userId]) {
          byUserMap[userId] = {
            name: entry.users?.name || 'Desconocido',
            hours: 0,
            entries: 0
          };
        }
        byUserMap[userId].hours += entry.total_hours || 0;
        byUserMap[userId].entries += 1;
      });

      const byUser = Object.values(byUserMap)
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 10);

      // Agrupar por unidad organizacional con jerarquía
      const byUnitMap = {};
      filteredEntries.forEach(entry => {
        const unitId = entry.organizational_unit_id;
        if (!byUnitMap[unitId]) {
          const unitData = units.find(u => u.id === unitId);
          byUnitMap[unitId] = {
            id: unitId,
            name: entry.organizational_units?.name || 'Sin unidad',
            type: entry.organizational_units?.type || '',
            level: unitData?.level || 0,
            parent_id: unitData?.parent_id || null,
            hours: 0,
            entries: 0
          };
        }
        byUnitMap[unitId].hours += entry.total_hours || 0;
        byUnitMap[unitId].entries += 1;
      });

      // Ordenar por jerarquía (nivel) y luego por horas
      const byUnit = Object.values(byUnitMap)
        .sort((a, b) => {
          // Primero por nivel (padres antes que hijos)
          if (a.level !== b.level) return a.level - b.level;
          // Luego por horas (mayor a menor)
          return b.hours - a.hours;
        });

      // Agrupar por día
      const byDayMap = {};
      filteredEntries.forEach(entry => {
        const day = format(new Date(entry.start_time), 'yyyy-MM-dd');
        if (!byDayMap[day]) {
          byDayMap[day] = {
            date: day,
            hours: 0,
            entries: 0
          };
        }
        byDayMap[day].hours += entry.total_hours || 0;
        byDayMap[day].entries += 1;
      });

      const byDay = Object.values(byDayMap)
        .sort((a, b) => a.date.localeCompare(b.date));

      setReportData({
        totalHours,
        totalEntries,
        byUser,
        byUnit,
        byDay
      });

    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    // Crear CSV con los datos del reporte
    const headers = ['Fecha', 'Usuario', 'Unidad', 'Descripción', 'Inicio', 'Fin', 'Horas'];
    const rows = reportData.byDay.flatMap(day => 
      // Aquí deberías tener acceso a las entradas individuales
      // Por simplicidad, exportamos el resumen
      [[day.date, '', '', '', '', '', day.hours.toFixed(2)]]
    );

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-horas-${startDate}-${endDate}.csv`;
    a.click();
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="mt-1 text-sm text-gray-500">
            {user?.role === 'operario' ? 'Tus horas trabajadas' : 'Análisis de horas trabajadas'}
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
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

          {/* Filtro de usuario solo para admin/superadmin */}
          {(user?.role === 'admin' || user?.role === 'superadmin') && (
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

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Total de Horas</p>
            <p className="text-4xl font-bold text-primary-600 mt-2">
              {reportData.totalHours.toFixed(1)}h
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {reportData.totalEntries} registros
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Promedio por Día</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">
              {reportData.byDay.length > 0 
                ? (reportData.totalHours / reportData.byDay.length).toFixed(1)
                : '0.0'
              }h
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {reportData.byDay.length} días trabajados
            </p>
          </div>
        </Card>
      </div>

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

      {/* Tabla detallada por unidad con jerarquía */}
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
                const indentPx = indentLevel * 24; // 24px por nivel
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.type === 'empresa' ? 'bg-purple-100 text-purple-800' :
                        item.type === 'sector' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
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
    </div>
  );
};

export default Reports;
