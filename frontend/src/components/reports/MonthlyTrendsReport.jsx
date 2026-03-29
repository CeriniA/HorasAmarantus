/**
 * Reporte de Tendencias Mensuales
 * Muestra evolución de horas en los últimos 12 meses con proyecciones
 */

import { useMemo } from 'react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import Card from '../common/Card';
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { safeDate, calculateHours, extractDate } from '../../utils/dateHelpers';

export const MonthlyTrendsReport = ({ timeEntries }) => {
  const trendsData = useMemo(() => {
    if (!timeEntries.length) return null;

    const now = new Date(); // OK: fecha actual
    const monthsData = [];

    // Generar últimos 12 meses
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const monthKey = format(monthDate, 'yyyy-MM');

      // Filtrar entradas del mes
      const monthEntries = timeEntries.filter(e => {
        const entryDate = safeDate(e.start_time);
        return entryDate >= monthStart && entryDate <= monthEnd;
      });

      // Calcular horas
      const totalHours = monthEntries.reduce((sum, entry) => {
        return sum + calculateHours(entry.start_time, entry.end_time);
      }, 0);

      // Días trabajados
      const uniqueDays = new Set(
        monthEntries.map(e => extractDate(e.start_time))
      );

      // Usuarios únicos
      const uniqueUsers = new Set(monthEntries.map(e => e.user_id));

      monthsData.push({
        month: monthKey,
        monthName: format(monthDate, 'MMM yyyy', { locale: es }),
        totalHours: parseFloat(totalHours.toFixed(1)),
        entries: monthEntries.length,
        daysWorked: uniqueDays.size,
        users: uniqueUsers.size,
        avgPerDay: uniqueDays.size > 0 ? parseFloat((totalHours / uniqueDays.size).toFixed(1)) : 0
      });
    }

    // Calcular tendencias
    const lastMonth = monthsData[monthsData.length - 1];
    const previousMonth = monthsData[monthsData.length - 2];
    const lastMonthLastYear = monthsData[0];

    const monthOverMonthChange = previousMonth && previousMonth.totalHours > 0
      ? ((lastMonth.totalHours - previousMonth.totalHours) / previousMonth.totalHours) * 100
      : 0;

    const yearOverYearChange = lastMonthLastYear && lastMonthLastYear.totalHours > 0
      ? ((lastMonth.totalHours - lastMonthLastYear.totalHours) / lastMonthLastYear.totalHours) * 100
      : 0;

    // Calcular promedio de últimos 3 meses para proyección
    const last3Months = monthsData.slice(-3);
    const avgLast3Months = last3Months.reduce((sum, m) => sum + m.totalHours, 0) / 3;

    // Proyección simple (promedio de últimos 3 meses)
    const projection = parseFloat(avgLast3Months.toFixed(1));

    // Detectar tendencia general (regresión lineal simple)
    const trend = monthsData.length > 1
      ? monthsData[monthsData.length - 1].totalHours > monthsData[0].totalHours
        ? 'up'
        : 'down'
      : 'stable';

    return {
      monthsData,
      lastMonth,
      monthOverMonthChange: parseFloat(monthOverMonthChange.toFixed(1)),
      yearOverYearChange: parseFloat(yearOverYearChange.toFixed(1)),
      projection,
      trend,
      totalYearHours: monthsData.reduce((sum, m) => sum + m.totalHours, 0),
      avgMonthlyHours: monthsData.reduce((sum, m) => sum + m.totalHours, 0) / monthsData.length
    };
  }, [timeEntries]);

  if (!trendsData) {
    return (
      <Card title="Tendencias Mensuales">
        <div className="text-center py-8 text-gray-500">
          No hay datos suficientes para generar tendencias
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Mes Actual</p>
              <p className="text-2xl font-bold text-gray-900">
                {trendsData.lastMonth.totalHours}h
              </p>
              <p className="text-xs text-gray-500">
                {trendsData.lastMonth.entries} registros
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className={`flex-shrink-0 p-3 rounded-lg ${
              trendsData.monthOverMonthChange >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {trendsData.monthOverMonthChange >= 0 ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">vs Mes Anterior</p>
              <p className={`text-2xl font-bold ${
                trendsData.monthOverMonthChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {trendsData.monthOverMonthChange >= 0 ? '+' : ''}
                {trendsData.monthOverMonthChange}%
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className={`flex-shrink-0 p-3 rounded-lg ${
              trendsData.yearOverYearChange >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {trendsData.yearOverYearChange >= 0 ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">vs Año Anterior</p>
              <p className={`text-2xl font-bold ${
                trendsData.yearOverYearChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {trendsData.yearOverYearChange >= 0 ? '+' : ''}
                {trendsData.yearOverYearChange}%
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Proyección</p>
              <p className="text-2xl font-bold text-gray-900">
                {trendsData.projection}h
              </p>
              <p className="text-xs text-gray-500">Próximo mes</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráfico de Línea - Evolución */}
      <Card title="Evolución de Horas (Últimos 12 Meses)">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={trendsData.monthsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="monthName" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="totalHours" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Horas Totales"
              dot={{ fill: '#10b981', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="avgPerDay" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Promedio por Día"
              dot={{ fill: '#3b82f6', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Gráfico de Barras - Comparación */}
      <Card title="Comparación Mensual">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={trendsData.monthsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="monthName" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalHours" fill="#10b981" name="Horas Totales" />
            <Bar dataKey="entries" fill="#3b82f6" name="Registros" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Tabla Detallada */}
      <Card title="Detalle Mensual">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Mes</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Horas</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Registros</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Días</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Usuarios</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Prom/Día</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Cambio</th>
              </tr>
            </thead>
            <tbody>
              {trendsData.monthsData.map((month, index) => {
                const prevMonth = index > 0 ? trendsData.monthsData[index - 1] : null;
                const change = prevMonth && prevMonth.totalHours > 0
                  ? ((month.totalHours - prevMonth.totalHours) / prevMonth.totalHours) * 100
                  : 0;

                return (
                  <tr key={month.month} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {month.monthName}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-700 font-semibold">
                      {month.totalHours}h
                    </td>
                    <td className="text-right py-3 px-4 text-gray-700">
                      {month.entries}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-700">
                      {month.daysWorked}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-700">
                      {month.users}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-700">
                      {month.avgPerDay}h
                    </td>
                    <td className={`text-right py-3 px-4 font-semibold ${
                      change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {index > 0 ? (
                        <>
                          {change > 0 ? '+' : ''}{change.toFixed(1)}%
                        </>
                      ) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 font-bold">
                <td className="py-3 px-4 text-gray-900">PROMEDIO</td>
                <td className="text-right py-3 px-4 text-gray-900">
                  {trendsData.avgMonthlyHours.toFixed(1)}h
                </td>
                <td className="text-right py-3 px-4 text-gray-900">
                  {(trendsData.monthsData.reduce((sum, m) => sum + m.entries, 0) / 12).toFixed(0)}
                </td>
                <td className="text-right py-3 px-4 text-gray-900">
                  {(trendsData.monthsData.reduce((sum, m) => sum + m.daysWorked, 0) / 12).toFixed(0)}
                </td>
                <td className="text-right py-3 px-4 text-gray-900">-</td>
                <td className="text-right py-3 px-4 text-gray-900">-</td>
                <td className="text-right py-3 px-4 text-gray-900">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Insights */}
      <Card title="Análisis">
        <div className="space-y-3">
          <div className="flex items-start">
            <div className={`flex-shrink-0 mt-1 ${
              trendsData.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trendsData.trend === 'up' ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                Tendencia General: {trendsData.trend === 'up' ? 'Creciente' : 'Decreciente'}
              </p>
              <p className="text-sm text-gray-600">
                Las horas totales han {trendsData.trend === 'up' ? 'aumentado' : 'disminuido'} en los últimos 12 meses
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1 text-blue-600">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                Total Anual: {trendsData.totalYearHours.toFixed(0)} horas
              </p>
              <p className="text-sm text-gray-600">
                Promedio mensual: {trendsData.avgMonthlyHours.toFixed(0)} horas
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1 text-purple-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                Proyección Próximo Mes: {trendsData.projection}h
              </p>
              <p className="text-sm text-gray-600">
                Basado en el promedio de los últimos 3 meses
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MonthlyTrendsReport;
