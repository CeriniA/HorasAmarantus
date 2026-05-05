/**
 * Mapa de Calor de Actividad
 * Visualización estilo GitHub de días trabajados
 */

import { useMemo } from 'react';
import { format, subDays, isSameDay, endOfWeek, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import Card from '../common/Card';
import { safeDate, calculateHours } from '../../utils/dateHelpers';

export const ActivityHeatmap = ({ timeEntries }) => {
  // Generar datos de las últimas 4 semanas completas (lunes a domingo)
  const heatmapData = useMemo(() => {
    const data = [];
    
    // Fecha actual con mediodía
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    
    // Encontrar el domingo de esta semana
    const thisSunday = endOfWeek(today, { weekStartsOn: 1 });
    thisSunday.setHours(12, 0, 0, 0);
    
    // Ir 4 semanas atrás desde el domingo (28 días)
    const startDate = subDays(thisSunday, 27); // 27 días atrás = 4 semanas (incluyendo el domingo)
    
    // Generar 28 días desde startDate hasta thisSunday
    for (let i = 0; i < 28; i++) {
      const date = addDays(startDate, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dayEntries = timeEntries.filter(entry => {
        const entryDate = safeDate(entry.start_time);
        return entryDate && isSameDay(entryDate, date);
      });
      
      const hours = dayEntries.reduce((sum, entry) => {
        return sum + calculateHours(entry.start_time, entry.end_time);
      }, 0);
      
      data.push({
        date,
        dateStr,
        dayName: format(date, 'EEE', { locale: es }),
        fullDate: format(date, "d 'de' MMM", { locale: es }),
        hours: parseFloat(hours.toFixed(2)),
        entries: dayEntries.length,
        intensity: getIntensity(hours)
      });
    }
    
    return data;
  }, [timeEntries]);

  // Agrupar por semanas (4 semanas de 7 días cada una)
  const weeklyData = useMemo(() => {
    if (heatmapData.length === 0) return [];
    
    const weeks = [];
    
    // Dividir los 28 días en 4 semanas de 7 días
    for (let weekIndex = 0; weekIndex < 4; weekIndex++) {
      const weekStart = weekIndex * 7;
      const weekEnd = weekStart + 7;
      const week = heatmapData.slice(weekStart, weekEnd);
      
      if (week.length > 0) {
        weeks.push(week);
      }
    }
    
    return weeks;
  }, [heatmapData]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const daysWorked = heatmapData.filter(d => d.hours > 0).length;
    const totalHours = heatmapData.reduce((sum, d) => sum + d.hours, 0);
    const avgHours = daysWorked > 0 ? totalHours / daysWorked : 0;
    const maxDay = heatmapData.reduce((max, d) => d.hours > max.hours ? d : max, heatmapData[0] || { hours: 0 });
    
    return {
      daysWorked,
      totalHours,
      avgHours,
      maxDay,
      workRate: ((daysWorked / heatmapData.length) * 100).toFixed(0)
    };
  }, [heatmapData]);

  return (
    <Card 
      title="Actividad Últimas 4 Semanas"
      subtitle={`${stats.daysWorked} días trabajados (${stats.workRate}%)`}
    >
      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Total</p>
          <p className="text-lg font-bold text-gray-900">
            {stats.totalHours.toFixed(0)}h
          </p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600 mb-1">Promedio</p>
          <p className="text-lg font-bold text-blue-700">
            {stats.avgHours.toFixed(1)}h
          </p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-xs text-green-600 mb-1">Mejor día</p>
          <p className="text-lg font-bold text-green-700">
            {stats.maxDay.hours.toFixed(1)}h
          </p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Encabezado de días */}
          <div className="flex mb-2">
            <div className="w-8"></div>
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
              <div key={i} className="w-8 text-center text-xs text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Semanas */}
          {weeklyData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex mb-1">
              <div className="w-8 text-xs text-gray-400 flex items-center">
                {weekIndex === 0 && 'S1'}
                {weekIndex === 1 && 'S2'}
                {weekIndex === 2 && 'S3'}
                {weekIndex === 3 && 'S4'}
              </div>
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="w-8 h-8 mr-1 group relative"
                >
                  <div
                    className={`
                      w-full h-full rounded
                      transition-all duration-200
                      ${getColorClass(day.intensity)}
                      ${!day.isEmpty ? 'hover:ring-2 hover:ring-primary-500 cursor-pointer' : ''}
                    `}
                  />
                  
                  {/* Tooltip */}
                  {!day.isEmpty && day.hours > 0 && (
                    <div className="
                      absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                      hidden group-hover:block
                      bg-gray-900 text-white text-xs rounded py-1 px-2
                      whitespace-nowrap z-10
                    ">
                      <div className="font-semibold">{day.fullDate}</div>
                      <div>{day.hours.toFixed(1)}h - {day.entries} registros</div>
                      <div className="
                        absolute top-full left-1/2 transform -translate-x-1/2
                        border-4 border-transparent border-t-gray-900
                      " />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Leyenda */}
      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-gray-500">
        <span>Menos</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200" />
          <div className="w-4 h-4 rounded bg-green-100" />
          <div className="w-4 h-4 rounded bg-green-300" />
          <div className="w-4 h-4 rounded bg-green-500" />
          <div className="w-4 h-4 rounded bg-green-700" />
        </div>
        <span>Más</span>
      </div>
    </Card>
  );
};

// Helpers
const getIntensity = (hours) => {
  if (hours === 0) return 'none';
  if (hours < 4) return 'low';
  if (hours < 6) return 'medium';
  if (hours < 8) return 'high';
  return 'very-high';
};

const getColorClass = (intensity) => {
  const classes = {
    'none': 'bg-gray-100 border border-gray-200',
    'low': 'bg-green-100',
    'medium': 'bg-green-300',
    'high': 'bg-green-500',
    'very-high': 'bg-green-700'
  };
  return classes[intensity] || classes.none;
};

export default ActivityHeatmap;
