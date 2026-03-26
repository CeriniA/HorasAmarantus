/**
 * Análisis de Productividad
 * Muestra métricas de desempeño y patrones de trabajo
 */

import { useMemo } from 'react';
import { format, differenceInDays, isWeekend, getHours } from 'date-fns';
import { es } from 'date-fns/locale';
import Card from '../common/Card';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Clock, Calendar, Zap } from 'lucide-react';

export const ProductivityAnalysis = ({ timeEntries }) => {
  // Calcular métricas de productividad
  const metrics = useMemo(() => {
    if (timeEntries.length === 0) {
      return {
        consistency: 0,
        peakDays: [],
        avgHoursPerDay: 0,
        patterns: {},
        radarData: []
      };
    }

    // Filtrar últimos 30 días
    const last30Days = timeEntries.filter(e => {
      const entryDate = new Date(e.start_time);
      const daysAgo = differenceInDays(new Date(), entryDate);
      return daysAgo <= 30;
    });

    // Agrupar por día
    const dailyHours = {};
    last30Days.forEach(entry => {
      const dateKey = new Date(entry.start_time).toDateString();
      if (!dailyHours[dateKey]) {
        dailyHours[dateKey] = 0;
      }
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      const hours = (end - start) / (1000 * 60 * 60);
      dailyHours[dateKey] += hours;
    });

    const hours = Object.values(dailyHours);
    const avg = hours.reduce((sum, h) => sum + h, 0) / hours.length;
    
    // Calcular consistencia (basado en desviación estándar)
    const variance = Math.sqrt(
      hours.reduce((sum, h) => sum + Math.pow(h - avg, 2), 0) / hours.length
    );
    const consistency = Math.max(0, Math.min(100, 100 - (variance * 10)));

    // Encontrar días pico (por día de la semana)
    const byDayOfWeek = {};
    last30Days.forEach(entry => {
      const dayName = format(new Date(entry.start_time), 'EEEE', { locale: es });
      if (!byDayOfWeek[dayName]) {
        byDayOfWeek[dayName] = { hours: 0, count: 0 };
      }
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      const hours = (end - start) / (1000 * 60 * 60);
      byDayOfWeek[dayName].hours += hours;
      byDayOfWeek[dayName].count += 1;
    });

    const avgByDay = Object.entries(byDayOfWeek).map(([day, data]) => ({
      day,
      avgHours: data.hours / data.count
    }));

    const peakDays = avgByDay
      .sort((a, b) => b.avgHours - a.avgHours)
      .slice(0, 3)
      .map(d => d.day);

    // Detectar patrones
    const hourDistribution = last30Days.map(e => getHours(new Date(e.start_time)));
    const avgStartHour = hourDistribution.reduce((sum, h) => sum + h, 0) / hourDistribution.length;
    
    const patterns = {
      morningPerson: avgStartHour < 9,
      avgStartTime: `${Math.floor(avgStartHour)}:${String(Math.round((avgStartHour % 1) * 60)).padStart(2, '0')}`,
      weekendWorker: last30Days.some(e => isWeekend(new Date(e.start_time))),
      avgHoursPerDay: avg
    };

    // Calcular puntualidad (% de días que empezó antes de las 9am)
    const punctualDays = hourDistribution.filter(h => h <= 9).length;
    const punctuality = (punctualDays / hourDistribution.length) * 100;

    // Calcular productividad (basado en horas promedio vs objetivo de 8h)
    const productivity = Math.min(100, (avg / 8) * 100);

    // Calcular diversidad (cuántas unidades diferentes trabajó)
    const uniqueUnits = new Set(last30Days.map(e => e.organizational_unit_id)).size;
    const diversity = Math.min(100, (uniqueUnits / 5) * 100); // Asumiendo 5 unidades como máximo

    // Calcular eficiencia (registros por día trabajado)
    const daysWorked = Object.keys(dailyHours).length;
    const avgEntriesPerDay = last30Days.length / daysWorked;
    const efficiency = Math.min(100, (avgEntriesPerDay / 3) * 100); // Asumiendo 3 registros/día como óptimo

    // Datos para radar chart
    const radarData = [
      { metric: 'Consistencia', value: Math.round(consistency), fullMark: 100 },
      { metric: 'Puntualidad', value: Math.round(punctuality), fullMark: 100 },
      { metric: 'Productividad', value: Math.round(productivity), fullMark: 100 },
      { metric: 'Diversidad', value: Math.round(diversity), fullMark: 100 },
      { metric: 'Eficiencia', value: Math.round(efficiency), fullMark: 100 }
    ];

    return {
      consistency,
      punctuality,
      productivity,
      diversity,
      efficiency,
      peakDays,
      avgHoursPerDay: avg,
      patterns,
      radarData,
      uniqueUnits,
      daysWorked
    };
  }, [timeEntries]);

  return (
    <Card title="Análisis de Productividad" subtitle="Últimos 30 días">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4 text-center">
            Perfil de Desempeño
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={metrics.radarData}>
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

        {/* Insights y Métricas */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4">
            Insights Personalizados
          </h4>

          {/* Patrón de Trabajo */}
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h5 className="font-semibold text-blue-900 mb-1">
                  🌅 Patrón de Trabajo
                </h5>
                <p className="text-sm text-blue-800">
                  Eres más productivo los <strong>{metrics.peakDays.join(', ')}</strong>
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Promedio: {metrics.avgHoursPerDay.toFixed(1)}h/día
                </p>
              </div>
            </div>
          </div>

          {/* Horario Típico */}
          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
              <div>
                <h5 className="font-semibold text-green-900 mb-1">
                  ⏰ Horario Típico
                </h5>
                <p className="text-sm text-green-800">
                  {metrics.patterns.morningPerson ? (
                    <>Eres una persona <strong>madrugadora</strong></>
                  ) : (
                    <>Prefieres empezar más <strong>tarde</strong></>
                  )}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Hora promedio de inicio: {metrics.patterns.avgStartTime}
                </p>
              </div>
            </div>
          </div>

          {/* Consistencia */}
          <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
            <div className="flex items-start">
              <TrendingUp className="h-5 w-5 text-purple-600 mr-3 mt-0.5" />
              <div>
                <h5 className="font-semibold text-purple-900 mb-1">
                  📊 Consistencia
                </h5>
                <p className="text-sm text-purple-800">
                  Score: <strong>{metrics.consistency.toFixed(0)}/100</strong> - 
                  {metrics.consistency > 80 ? ' ¡Excelente!' : 
                   metrics.consistency > 60 ? ' Bueno' : ' Puede mejorar'}
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  Mantienes un ritmo {metrics.consistency > 70 ? 'muy' : ''} constante
                </p>
              </div>
            </div>
          </div>

          {/* Diversidad */}
          <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
            <div className="flex items-start">
              <Zap className="h-5 w-5 text-orange-600 mr-3 mt-0.5" />
              <div>
                <h5 className="font-semibold text-orange-900 mb-1">
                  🎯 Versatilidad
                </h5>
                <p className="text-sm text-orange-800">
                  Trabajaste en <strong>{metrics.uniqueUnits} áreas diferentes</strong>
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  {metrics.daysWorked} días trabajados en el período
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
                    Has trabajado algunos fines de semana
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

      {/* Métricas Numéricas */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Consistencia</p>
          <p className="text-2xl font-bold text-gray-900">
            {metrics.consistency.toFixed(0)}
          </p>
          <p className="text-xs text-gray-500">/100</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Puntualidad</p>
          <p className="text-2xl font-bold text-gray-900">
            {metrics.punctuality.toFixed(0)}%
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Productividad</p>
          <p className="text-2xl font-bold text-gray-900">
            {metrics.productivity.toFixed(0)}%
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Diversidad</p>
          <p className="text-2xl font-bold text-gray-900">
            {metrics.diversity.toFixed(0)}%
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Eficiencia</p>
          <p className="text-2xl font-bold text-gray-900">
            {metrics.efficiency.toFixed(0)}%
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ProductivityAnalysis;
