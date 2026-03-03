import { useState, useEffect } from 'react';
import { Download, Filter, Calendar } from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuthContext } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import Input from '../components/common/Input';
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
      // Cargar usuarios
      const { data: usersData } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('is_active', true)
        .order('name');

      setUsers(usersData || []);

      // Cargar unidades organizacionales
      const { data: unitsData } = await supabase
        .from('organizational_units')
        .select('id, name, type')
        .eq('is_active', true)
        .order('name');

      setUnits(unitsData || []);
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  const loadReportData = async () => {
    try {
      setLoading(true);

      // Construir query
      let query = supabase
        .from('time_entries')
        .select(`
          *,
          users (id, name, email),
          organizational_units (id, name, type)
        `)
        .eq('status', 'completed')
        .gte('start_time', `${startDate}T00:00:00`)
        .lte('start_time', `${endDate}T23:59:59`);

      if (selectedUser !== 'all') {
        query = query.eq('user_id', selectedUser);
      }

      if (selectedUnit !== 'all') {
        query = query.eq('organizational_unit_id', selectedUnit);
      }

      const { data: entries, error } = await query;

      if (error) throw error;

      // Procesar datos
      const totalHours = entries.reduce((sum, e) => sum + (e.total_hours || 0), 0);
      const totalEntries = entries.length;

      // Agrupar por usuario
      const byUserMap = {};
      entries.forEach(entry => {
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

      // Agrupar por unidad organizacional
      const byUnitMap = {};
      entries.forEach(entry => {
        const unitId = entry.organizational_unit_id;
        if (!byUnitMap[unitId]) {
          byUnitMap[unitId] = {
            name: entry.organizational_units?.name || 'Sin unidad',
            type: entry.organizational_units?.type || '',
            hours: 0,
            entries: 0
          };
        }
        byUnitMap[unitId].hours += entry.total_hours || 0;
        byUnitMap[unitId].entries += 1;
      });

      const byUnit = Object.values(byUnitMap)
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 10);

      // Agrupar por día
      const byDayMap = {};
      entries.forEach(entry => {
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
            Análisis de horas trabajadas
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

          <Select
            label="Usuario"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            options={[
              { value: 'all', label: 'Todos' },
              ...users.map(u => ({ value: u.id, label: u.name }))
            ]}
          />

          <Select
            label="Unidad Organizacional"
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            options={[
              { value: 'all', label: 'Todas' },
              ...units.map(u => ({ value: u.id, label: `${u.name} (${u.type})` }))
            ]}
          />
        </div>
      </Card>

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

      {/* Tabla detallada por unidad */}
      <Card title="Detalle por Unidad Organizacional">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Unidad
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.byUnit.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {item.type}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
