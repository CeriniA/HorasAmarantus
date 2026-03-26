/**
 * Mapa de Calor de Actividad
 * Visualización estilo GitHub de días trabajados
 */

import { useMemo } from 'react';
import { format, subDays, isSameDay, startOfWeek, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import Card from '../common/Card';

export const ActivityHeatmap = ({ timeEntries }) => {
  // Generar datos de los últimos 30 días
  const heatmapData = useMemo(() => {
    const days = 30;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayEntries = timeEntries.filter(entry => 
        isSameDay(new Date(entry.start_time), date)
      );
      
      const hours = dayEntries.reduce((sum, entry) => {
        const start = new Date(entry.start_time);
        const end = new Date(entry.end_time);
        const duration = (end - start) / (1000 * 60 * 60);
        return sum + duration;
      }, 0);
      
      data.push({
        date,
        dateStr: format(date, 'yyyy-MM-dd'),
        dayName: format(date, 'EEE', { locale: es }),
        fullDate: format(date, "d 'de' MMM", { locale: es }),
        hours: parseFloat(hours.toFixed(2)),
        entries: dayEntries.length,
        intensity: getIntensity(hours)
      });
    }
    
    return data;
  }, [timeEntries]);

  // Agrupar por semanas
  const weeklyData = useMemo(() => {
    const weeks = [];
    let currentWeek = [];
    
    // Encontrar el primer lunes
    let firstDate = heatmapData[0]?.date;
    if (!firstDate) return [];
    
    const firstMonday = startOfWeek(firstDate, { weekStartsOn: 1 });
    
    // Agregar días vacíos al inicio si es necesario
    let currentDate = firstMonday;
    while (currentDate < heatmapData[0].date) {
      currentWeek.push({
        date: currentDate,
        dateStr: format(currentDate, 'yyyy-MM-dd'),
        hours: 0,
        entries: 0,
        intensity: 'none',
        isEmpty: true
      });
      currentDate = addDays(currentDate, 1);
    }
    
    // Agregar datos reales
    heatmapData.forEach((day, index) => {
      currentWeek.push(day);
      
      // Si es domingo o último día, cerrar semana
      if (currentWeek.length === 7 || index === heatmapData.length - 1) {
        // Completar semana si es necesario
        while (currentWeek.length < 7) {
          const lastDate = currentWeek[currentWeek.length - 1].date;
          const nextDate = addDays(lastDate, 1);
          currentWeek.push({
            date: nextDate,
            dateStr: format(nextDate, 'yyyy-MM-dd'),
            hours: 0,
            entries: 0,
            intensity: 'none',
            isEmpty: true
          });
        }
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });
    
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
      title="Actividad Últimos 30 Días"
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
