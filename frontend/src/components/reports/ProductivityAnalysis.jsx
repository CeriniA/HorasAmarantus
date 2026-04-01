/**
 * Análisis de Productividad
 * Muestra datos objetivos de trabajo y patrones
 */

import { useMemo } from 'react';
import { format, differenceInDays, isWeekend, getHours } from 'date-fns';
import { es } from 'date-fns/locale';
import Card from '../common/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Calendar, Target } from 'lucide-react';
import { safeDate, calculateHours, extractDate, parseLocalTime } from '../../utils/dateHelpers';

export const ProductivityAnalysis = ({ timeEntries }) => {
  // Calcular datos objetivos de trabajo
  const metrics = useMemo(() => {
    if (timeEntries.length === 0) {
      return {
        totalHours: 0,
        avgHoursPerDay: 0,
        daysWorked: 0,
        peakDays: [],
        patterns: {},
        dayOfWeekData: []
      };
    }

    // Filtrar últimos 30 días
    const last30Days = timeEntries.filter(e => {
      const entryDate = safeDate(e.start_time);
      const daysAgo = differenceInDays(new Date(), entryDate);
      return daysAgo <= 30;
    });

    // Agrupar por día
    const dailyHours = {};
    last30Days.forEach(entry => {
      const dateKey = extractDate(entry.start_time);
      if (!dailyHours[dateKey]) {
        dailyHours[dateKey] = 0;
      }
      const hours = calculateHours(entry.start_time, entry.end_time);
      dailyHours[dateKey] += hours;
    });

    const hours = Object.values(dailyHours);
    const totalHours = hours.reduce((sum, h) => sum + h, 0);
    const avgHoursPerDay = hours.length > 0 ? totalHours / hours.length : 0;
    const daysWorked = Object.keys(dailyHours).length;

    // Patrón por día de la semana
    const byDayOfWeek = {};
    last30Days.forEach(entry => {
      const dayName = format(safeDate(entry.start_time), 'EEEE', { locale: es });
      if (!byDayOfWeek[dayName]) {
        byDayOfWeek[dayName] = { hours: 0, count: 0 };
      }
      const hours = calculateHours(entry.start_time, entry.end_time);
      byDayOfWeek[dayName].hours += hours;
      byDayOfWeek[dayName].count += 1;
    });

    // Ordenar días de la semana
    const dayOrder = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    const dayOfWeekData = dayOrder
      .map(day => {
        const data = byDayOfWeek[day];
        return {
          day: day.charAt(0).toUpperCase() + day.slice(1, 3),
          hours: data ? data.hours / data.count : 0
        };
      })
      .filter(d => d.hours > 0);

    const avgByDay = Object.entries(byDayOfWeek).map(([day, data]) => ({
      day,
      avgHours: data.hours / data.count
    }));

    const peakDays = avgByDay
      .sort((a, b) => b.avgHours - a.avgHours)
      .slice(0, 2)
      .map(d => d.day);

    // Detectar patrones de horario
    const hourDistribution = last30Days.map(e => getHours(parseLocalTime(e.start_time)));
    const avgStartHour = hourDistribution.length > 0 
      ? hourDistribution.reduce((sum, h) => sum + h, 0) / hourDistribution.length 
      : 0;
    
    const patterns = {
      avgStartTime: `${Math.floor(avgStartHour)}:${String(Math.round((avgStartHour % 1) * 60)).padStart(2, '0')}`,
      weekendWorker: last30Days.some(e => isWeekend(safeDate(e.start_time)))
    };

    return {
      totalHours,
      avgHoursPerDay,
      daysWorked,
      peakDays,
      patterns,
      dayOfWeekData
    };
  }, [timeEntries]);

  return (
    <Card title="Análisis de Trabajo" subtitle="Últimos 30 días - Datos objetivos">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Patrón Semanal */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4 text-center">
            Patrón Semanal
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.dayOfWeekData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis label={{ value: 'Horas', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="hours" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 text-center mt-2">
            Promedio de horas trabajadas por día de la semana
          </p>
        </div>

        {/* Datos Objetivos */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4">
            Resumen del Período
          </h4>

          {/* Total de Horas */}
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-start">
              <Target className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h5 className="font-semibold text-blue-900 mb-1">
                  📊 Horas Trabajadas
                </h5>
                <p className="text-sm text-blue-800">
                  Total: <strong>{metrics.totalHours.toFixed(1)} horas</strong>
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Promedio: {metrics.avgHoursPerDay.toFixed(1)}h/día en {metrics.daysWorked} días
                </p>
              </div>
            </div>
          </div>

          {/* Patrón de Trabajo */}
          {metrics.peakDays.length > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-green-900 mb-1">
                    📅 Días con Más Actividad
                  </h5>
                  <p className="text-sm text-green-800">
                    {metrics.peakDays.join(' y ')}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Días donde registraste más horas en promedio
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Horario Típico */}
          <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-purple-600 mr-3 mt-0.5" />
              <div>
                <h5 className="font-semibold text-purple-900 mb-1">
                  ⏰ Horario de Inicio
                </h5>
                <p className="text-sm text-purple-800">
                  Hora promedio: <strong>{metrics.patterns.avgStartTime}</strong>
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  Basado en tus registros del período
                </p>
              </div>
            </div>
          </div>

          {/* Fin de semana */}
          {metrics.patterns.weekendWorker && (
            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-yellow-900 mb-1">
                    📅 Trabajo en Fin de Semana
                  </h5>
                  <p className="text-sm text-yellow-800">
                    Registraste horas en fines de semana
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Recuerda tomar descansos adecuados
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Métricas Numéricas Simples */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Total Horas</p>
          <p className="text-3xl font-bold text-gray-900">
            {metrics.totalHours.toFixed(0)}h
          </p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Promedio/Día</p>
          <p className="text-3xl font-bold text-gray-900">
            {metrics.avgHoursPerDay.toFixed(1)}h
          </p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Días Trabajados</p>
          <p className="text-3xl font-bold text-gray-900">
            {metrics.daysWorked}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ProductivityAnalysis;
