/**
 * Reporte de Eficiencia por Área
 * Muestra métricas de rendimiento por área organizacional
 */

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Card from '../common/Card';
import { TrendingUp, Users, Clock, Award } from 'lucide-react';
import { calculateHours, extractDate } from '../../utils/dateHelpers';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export const AreaEfficiencyReport = ({ timeEntries, units }) => {
  const areaStats = useMemo(() => {
    if (!timeEntries.length || !units.length) return [];

    // Agrupar por unidades raíz (sin parent_id) - pueden ser áreas, procesos, etc.
    const areas = units.filter(u => !u.parent_id);
    
    const stats = areas.map(area => {
      // Obtener todas las unidades de esta área (incluyendo procesos, subprocesos)
      const areaUnits = units.filter(u => {
        if (u.id === area.id) return true;
        // Buscar si es hijo de esta área
        let current = u;
        while (current.parent_id) {
          if (current.parent_id === area.id) return true;
          current = units.find(unit => unit.id === current.parent_id) || {};
        }
        return false;
      });
      
      const areaUnitIds = areaUnits.map(u => u.id);
      
      // Filtrar entradas de esta área
      const areaEntries = timeEntries.filter(e => 
        areaUnitIds.includes(e.organizational_unit_id)
      );
      
      // Calcular horas totales
      const totalHours = areaEntries.reduce((sum, entry) => {
        return sum + calculateHours(entry.start_time, entry.end_time);
      }, 0);
      
      // Usuarios únicos
      const uniqueUsers = new Set(areaEntries.map(e => e.user_id));
      const employeeCount = uniqueUsers.size;
      
      // Promedio por empleado
      const avgPerEmployee = employeeCount > 0 ? totalHours / employeeCount : 0;
      
      // Días trabajados
      const uniqueDays = new Set(
        areaEntries.map(e => extractDate(e.start_time))
      );
      const daysWorked = uniqueDays.size;
      
      return {
        id: area.id,
        name: area.name,
        totalHours: parseFloat(totalHours.toFixed(1)),
        employeeCount,
        avgPerEmployee: parseFloat(avgPerEmployee.toFixed(1)),
        entries: areaEntries.length,
        daysWorked,
        avgPerDay: daysWorked > 0 ? parseFloat((totalHours / daysWorked).toFixed(1)) : 0
      };
    }).filter(stat => stat.totalHours > 0); // Solo áreas con actividad
    
    // Ordenar por total de horas descendente
    return stats.sort((a, b) => b.totalHours - a.totalHours);
  }, [timeEntries, units]);

  const totalHours = useMemo(() => 
    areaStats.reduce((sum, area) => sum + area.totalHours, 0),
    [areaStats]
  );

  const chartData = useMemo(() => 
    areaStats.map(area => ({
      name: area.name.length > 15 ? area.name.substring(0, 15) + '...' : area.name,
      horas: area.totalHours,
      empleados: area.employeeCount,
      promedio: area.avgPerEmployee
    })),
    [areaStats]
  );

  const pieData = useMemo(() => 
    areaStats.map(area => ({
      name: area.name,
      value: area.totalHours
    })),
    [areaStats]
  );

  if (!areaStats.length) {
    return (
      <Card title="Eficiencia por Área">
        <div className="text-center py-8 text-gray-500">
          No hay datos suficientes para generar el reporte
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Horas</p>
              <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(0)}h</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Áreas Activas</p>
              <p className="text-2xl font-bold text-gray-900">{areaStats.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 p-3 rounded-lg">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Área Top</p>
              <p className="text-lg font-bold text-gray-900">
                {areaStats[0]?.name.substring(0, 12)}
              </p>
              <p className="text-xs text-gray-500">{areaStats[0]?.totalHours}h</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Promedio/Área</p>
              <p className="text-2xl font-bold text-gray-900">
                {(totalHours / areaStats.length).toFixed(0)}h
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras */}
        <Card title="Horas por Área">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="horas" fill="#10b981" name="Horas Totales" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Gráfico de Pastel */}
        <Card title="Distribución Porcentual">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tabla Detallada */}
      <Card title="Detalle por Área">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Área</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Horas</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Empleados</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Prom/Empleado</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Registros</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">% del Total</th>
              </tr>
            </thead>
            <tbody>
              {areaStats.map((area, index) => (
                <tr key={area.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{area.name}</td>
                  <td className="text-right py-3 px-4 text-gray-700 font-semibold">
                    {area.totalHours}h
                  </td>
                  <td className="text-right py-3 px-4 text-gray-700">
                    {area.employeeCount}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-700">
                    {area.avgPerEmployee}h
                  </td>
                  <td className="text-right py-3 px-4 text-gray-700">
                    {area.entries}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-700">
                    {((area.totalHours / totalHours) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 font-bold">
                <td colSpan="2" className="py-3 px-4 text-gray-900">TOTAL</td>
                <td className="text-right py-3 px-4 text-gray-900">{totalHours.toFixed(1)}h</td>
                <td className="text-right py-3 px-4 text-gray-900">
                  {areaStats.reduce((sum, a) => sum + a.employeeCount, 0)}
                </td>
                <td className="text-right py-3 px-4 text-gray-900">-</td>
                <td className="text-right py-3 px-4 text-gray-900">
                  {areaStats.reduce((sum, a) => sum + a.entries, 0)}
                </td>
                <td className="text-right py-3 px-4 text-gray-900">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AreaEfficiencyReport;
