/**
 * Reporte de Distribución Horaria
 * Muestra patrones de trabajo por hora del día y día de la semana
 */

import { useMemo } from 'react';
import { getHours, getDay } from 'date-fns';
import Card from '../common/Card';
import { Clock, Calendar, TrendingUp, Sun } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DAYS_OF_WEEK = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const HOURS_OF_DAY = Array.from({ length: 24 }, (_, i) => i);

export const TimeDistributionReport = ({ timeEntries }) => {
  const distributionData = useMemo(() => {
    if (!timeEntries.length) return null;

    // Distribución por hora del día
    const hourlyDistribution = {};
    HOURS_OF_DAY.forEach(hour => {
      hourlyDistribution[hour] = {
        hour,
        entries: 0,
        totalHours: 0
      };
    });

    // Distribución por día de la semana
    const weeklyDistribution = {};
    DAYS_OF_WEEK.forEach((day, index) => {
      weeklyDistribution[index] = {
        day,
        dayIndex: index,
        entries: 0,
        totalHours: 0
      };
    });

    // Matriz de calor (día x hora)
    const heatmapData = {};
    DAYS_OF_WEEK.forEach((day, dayIndex) => {
      heatmapData[dayIndex] = {};
      HOURS_OF_DAY.forEach(hour => {
        heatmapData[dayIndex][hour] = 0;
      });
    });

    // Procesar entradas
    timeEntries.forEach(entry => {
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      const hours = (end - start) / (1000 * 60 * 60);
      
      const startHour = getHours(start);
      const dayOfWeek = getDay(start);

      // Distribución por hora
      hourlyDistribution[startHour].entries++;
      hourlyDistribution[startHour].totalHours += hours;

      // Distribución por día
      weeklyDistribution[dayOfWeek].entries++;
      weeklyDistribution[dayOfWeek].totalHours += hours;

      // Heatmap
      heatmapData[dayOfWeek][startHour] += hours;
    });

    // Convertir a arrays
    const hourlyData = Object.values(hourlyDistribution)
      .filter(h => h.entries > 0)
      .map(h => ({
        ...h,
        hourLabel: `${h.hour}:00`,
        totalHours: parseFloat(h.totalHours.toFixed(1))
      }));

    const weeklyData = Object.values(weeklyDistribution)
      .filter(d => d.entries > 0)
      .map(d => ({
        ...d,
        totalHours: parseFloat(d.totalHours.toFixed(1))
      }));

    // Encontrar picos
    const peakHour = hourlyData.reduce((max, h) => 
      h.totalHours > max.totalHours ? h : max
    , hourlyData[0] || { hour: 0, totalHours: 0 });

    const peakDay = weeklyData.reduce((max, d) => 
      d.totalHours > max.totalHours ? d : max
    , weeklyData[0] || { day: 'N/A', totalHours: 0 });

    // Calcular horarios típicos
    const startTimes = timeEntries.map(e => getHours(new Date(e.start_time)));
    const avgStartTime = startTimes.reduce((sum, h) => sum + h, 0) / startTimes.length;
    
    const endTimes = timeEntries.map(e => getHours(new Date(e.end_time)));
    const avgEndTime = endTimes.reduce((sum, h) => sum + h, 0) / endTimes.length;

    return {
      hourlyData,
      weeklyData,
      heatmapData,
      peakHour,
      peakDay,
      avgStartTime: Math.round(avgStartTime),
      avgEndTime: Math.round(avgEndTime),
      totalEntries: timeEntries.length
    };
  }, [timeEntries]);

  if (!distributionData) {
    return (
      <Card title="Distribución Horaria">
        <div className="text-center py-8 text-gray-500">
          No hay datos para analizar
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
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Hora Pico</p>
              <p className="text-2xl font-bold text-gray-900">
                {distributionData.peakHour.hour}:00
              </p>
              <p className="text-xs text-gray-500">
                {distributionData.peakHour.totalHours}h registradas
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Día Pico</p>
              <p className="text-xl font-bold text-gray-900">
                {distributionData.peakDay.day}
              </p>
              <p className="text-xs text-gray-500">
                {distributionData.peakDay.totalHours}h registradas
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-orange-100 p-3 rounded-lg">
              <Sun className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Inicio Típico</p>
              <p className="text-2xl font-bold text-gray-900">
                {distributionData.avgStartTime}:00
              </p>
              <p className="text-xs text-gray-500">Promedio</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Fin Típico</p>
              <p className="text-2xl font-bold text-gray-900">
                {distributionData.avgEndTime}:00
              </p>
              <p className="text-xs text-gray-500">Promedio</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráfico por Hora del Día */}
      <Card title="Distribución por Hora del Día">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={distributionData.hourlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hourLabel" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalHours" fill="#3b82f6" name="Horas Registradas" />
            <Bar dataKey="entries" fill="#10b981" name="Cantidad de Registros" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Gráfico por Día de la Semana */}
      <Card title="Distribución por Día de la Semana">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={distributionData.weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalHours" fill="#10b981" name="Horas Registradas" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Heatmap Visual (Tabla) */}
      <Card title="Mapa de Calor - Actividad por Día y Hora">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 py-2 px-3 bg-gray-100 text-left text-sm font-semibold">
                  Día / Hora
                </th>
                {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(hour => (
                  <th key={hour} className="border border-gray-300 py-2 px-2 bg-gray-100 text-center text-xs font-semibold">
                    {hour}h
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6].map(dayIndex => {
                const dayData = distributionData.heatmapData[dayIndex];
                if (!dayData) return null;

                return (
                  <tr key={dayIndex}>
                    <td className="border border-gray-300 py-2 px-3 font-medium text-sm bg-gray-50">
                      {DAYS_OF_WEEK[dayIndex]}
                    </td>
                    {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(hour => {
                      const value = dayData[hour] || 0;
                      const maxValue = Math.max(
                        ...Object.values(distributionData.heatmapData).flatMap(d => 
                          Object.values(d)
                        )
                      );
                      const intensity = maxValue > 0 ? (value / maxValue) * 100 : 0;
                      
                      let bgColor = 'bg-white';
                      if (intensity > 75) bgColor = 'bg-green-600 text-white';
                      else if (intensity > 50) bgColor = 'bg-green-400';
                      else if (intensity > 25) bgColor = 'bg-green-200';
                      else if (intensity > 0) bgColor = 'bg-green-100';

                      return (
                        <td 
                          key={hour} 
                          className={`border border-gray-300 py-2 px-2 text-center text-xs ${bgColor}`}
                          title={`${DAYS_OF_WEEK[dayIndex]} ${hour}:00 - ${value.toFixed(1)}h`}
                        >
                          {value > 0 ? value.toFixed(0) : ''}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-gray-300"></div>
            <span>Baja</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 border border-gray-300"></div>
            <span>Media</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 border border-gray-300"></div>
            <span>Alta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 border border-gray-300"></div>
            <span>Muy Alta</span>
          </div>
        </div>
      </Card>

      {/* Insights */}
      <Card title="Patrones Detectados">
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1 text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                Horario de Trabajo Típico
              </p>
              <p className="text-sm text-gray-600">
                La mayoría de los registros comienzan a las {distributionData.avgStartTime}:00 
                y terminan a las {distributionData.avgEndTime}:00
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1 text-green-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                Día Más Activo
              </p>
              <p className="text-sm text-gray-600">
                {distributionData.peakDay.day} es el día con más actividad 
                ({distributionData.peakDay.totalHours}h registradas)
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1 text-orange-600">
              <Sun className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                Hora Pico de Actividad
              </p>
              <p className="text-sm text-gray-600">
                Las {distributionData.peakHour.hour}:00 es la hora con más registros iniciados
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TimeDistributionReport;
