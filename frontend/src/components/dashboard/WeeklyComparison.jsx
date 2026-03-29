/**
 * Comparación Semanal
 * Compara el rendimiento de la semana actual con semanas anteriores
 */

import { useMemo } from 'react';
import { format, startOfWeek, endOfWeek, subWeeks, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import Card from '../common/Card';
import { safeDate, calculateHours } from '../../utils/dateHelpers';
import { TrendingUp, TrendingDown, BarChart3, Calendar } from 'lucide-react';

export const WeeklyComparison = ({ timeEntries, user }) => {
  const comparisonData = useMemo(() => {
    const today = new Date(); // OK: fecha actual
    const weeks = [];

    // Calcular cuántas semanas mostrar (máximo 4, o menos si el usuario es nuevo)
    let maxWeeks = 4;
    if (user?.created_at) {
      const userCreatedDate = new Date(user.created_at); // OK: created_at es timestamp
      // Validar que la fecha sea válida
      if (!isNaN(userCreatedDate.getTime())) {
        const weeksSinceCreation = Math.floor(differenceInDays(today, userCreatedDate) / 7);
        // Mostrar como máximo las semanas que el usuario ha existido + 1 (semana actual)
        maxWeeks = Math.min(4, Math.max(1, weeksSinceCreation + 1));
      }
    }

    // Obtener datos de las últimas N semanas
    for (let i = 0; i < maxWeeks; i++) {
      const weekDate = subWeeks(today, i);
      const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 });

      // Filtrar entries de esta semana
      const weekEntries = timeEntries.filter(entry => {
        const entryDate = safeDate(entry.start_time);
        return entryDate >= weekStart && entryDate <= weekEnd;
      });

      // Calcular horas totales
      const totalHours = weekEntries.reduce((sum, entry) => {
        return sum + calculateHours(entry.start_time, entry.end_time);
      }, 0);

      // Calcular días trabajados
      const daysWorked = new Set(
        weekEntries.map(e => safeDate(e.start_time).toDateString())
      ).size;

      weeks.push({
        weekNumber: i,
        label: i === 0 ? 'Esta semana' : `Hace ${i} ${i === 1 ? 'semana' : 'semanas'}`,
        dateRange: `${format(weekStart, 'd MMM', { locale: es })} - ${format(weekEnd, 'd MMM', { locale: es })}`,
        totalHours: totalHours,
        daysWorked: daysWorked,
        avgPerDay: daysWorked > 0 ? totalHours / daysWorked : 0,
        entries: weekEntries.length,
        isCurrent: i === 0
      });
    }

    // Calcular promedio de 4 semanas
    const avgTotal = weeks.reduce((sum, w) => sum + w.totalHours, 0) / weeks.length;
    const avgDays = weeks.reduce((sum, w) => sum + w.daysWorked, 0) / weeks.length;

    // Calcular tendencia (comparar semana actual con promedio)
    const currentWeek = weeks[0];
    const trend = currentWeek.totalHours > avgTotal ? 'up' : 'down';
    const trendPercent = avgTotal > 0 
      ? Math.abs(((currentWeek.totalHours - avgTotal) / avgTotal) * 100)
      : 0;

    return {
      weeks,
      avgTotal,
      avgDays,
      trend,
      trendPercent
    };
  }, [timeEntries, user?.created_at]);

  const getBarWidth = (hours) => {
    const maxHours = Math.max(...comparisonData.weeks.map(w => w.totalHours), 40);
    return (hours / maxHours) * 100;
  };

  return (
    <Card 
      title="Comparación Semanal"
      icon={BarChart3}
      subtitle={
        <div className="flex items-center gap-2 text-sm">
          {comparisonData.trend === 'up' ? (
            <>
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-600 font-medium">
                +{comparisonData.trendPercent.toFixed(0)}%
              </span>
            </>
          ) : (
            <>
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-red-600 font-medium">
                -{comparisonData.trendPercent.toFixed(0)}%
              </span>
            </>
          )}
          <span className="text-gray-500">vs promedio</span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Gráfico de Barras */}
        <div className="space-y-3">
          {comparisonData.weeks.map((week) => (
            <div key={week.weekNumber} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  {week.isCurrent && (
                    <Calendar className="h-4 w-4 text-primary-500" />
                  )}
                  <span className={`font-medium ${week.isCurrent ? 'text-primary-700' : 'text-gray-700'}`}>
                    {week.label}
                  </span>
                </div>
                <span className="text-gray-500 text-xs">{week.dateRange}</span>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Barra de progreso */}
                <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      week.isCurrent 
                        ? 'bg-gradient-to-r from-primary-400 to-primary-600' 
                        : 'bg-gradient-to-r from-gray-300 to-gray-400'
                    }`}
                    style={{ width: `${getBarWidth(week.totalHours)}%` }}
                  >
                    <div className="absolute inset-0 flex items-center px-3">
                      <span className={`text-xs font-semibold ${
                        week.totalHours > 20 ? 'text-white' : 'text-gray-700'
                      }`}>
                        {week.totalHours.toFixed(1)}h
                      </span>
                    </div>
                  </div>
                </div>

                {/* Promedio diario */}
                <div className="text-right min-w-[60px]">
                  <p className="text-xs text-gray-500">
                    {week.avgPerDay.toFixed(1)}h/día
                  </p>
                </div>
              </div>

              {/* Detalles */}
              <div className="flex gap-4 text-xs text-gray-500 ml-6">
                <span>{week.daysWorked} días</span>
                <span>•</span>
                <span>{week.entries} registros</span>
              </div>
            </div>
          ))}
        </div>

        {/* Línea de promedio */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-blue-900">Promedio 4 semanas</p>
              <p className="text-xs text-blue-600 mt-1">
                {comparisonData.avgDays.toFixed(1)} días trabajados
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-700">
                {comparisonData.avgTotal.toFixed(1)}h
              </p>
              <p className="text-xs text-blue-600">
                {(comparisonData.avgTotal / comparisonData.avgDays).toFixed(1)}h/día
              </p>
            </div>
          </div>
        </div>

        {/* Insights */}
        {comparisonData.weeks[0].totalHours > comparisonData.avgTotal * 1.2 && (
          <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
            <p className="text-sm text-green-800">
              💪 <strong>¡Excelente!</strong> Esta semana superaste tu promedio en {comparisonData.trendPercent.toFixed(0)}%
            </p>
          </div>
        )}

        {comparisonData.weeks[0].totalHours < comparisonData.avgTotal * 0.8 && (
          <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <p className="text-sm text-yellow-800">
              📊 Esta semana estás {comparisonData.trendPercent.toFixed(0)}% por debajo de tu promedio
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default WeeklyComparison;
