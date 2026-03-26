/**
 * Gráfico de Tendencia Semanal
 * Muestra las horas trabajadas en los últimos 7 días con línea de tendencia
 */

import { useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, subDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import Card from '../common/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const WeeklyTrendChart = ({ timeEntries }) => {
  // Calcular datos de tendencia
  const trendData = useMemo(() => {
    const days = 7;
    const trend = [];
    
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
      
      trend.push({
        date: format(date, 'yyyy-MM-dd'),
        dayName: format(date, 'EEE', { locale: es }),
        fullDate: format(date, "d 'de' MMM", { locale: es }),
        hours: parseFloat(hours.toFixed(2)),
        entries: dayEntries.length,
        isToday: isSameDay(date, new Date())
      });
    }
    
    return trend;
  }, [timeEntries]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalHours = trendData.reduce((sum, day) => sum + day.hours, 0);
    const avgHours = totalHours / trendData.length;
    const maxDay = trendData.reduce((max, day) => day.hours > max.hours ? day : max, trendData[0]);
    const minDay = trendData.reduce((min, day) => day.hours < min.hours ? day : min, trendData[0]);
    
    // Calcular tendencia (comparar primera mitad vs segunda mitad)
    const firstHalf = trendData.slice(0, Math.floor(trendData.length / 2));
    const secondHalf = trendData.slice(Math.floor(trendData.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.hours, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.hours, 0) / secondHalf.length;
    
    const trendDirection = secondHalfAvg > firstHalfAvg ? 'up' : 'down';
    const trendPercent = Math.abs(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100).toFixed(1);
    
    return {
      total: totalHours,
      average: avgHours,
      max: maxDay,
      min: minDay,
      trendDirection,
      trendPercent
    };
  }, [trendData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.fullDate}</p>
          <p className="text-sm text-gray-600 mt-1">
            {data.hours.toFixed(1)} horas
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {data.entries} {data.entries === 1 ? 'registro' : 'registros'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card 
      title="Tendencia Últimos 7 Días"
      subtitle={
        <div className="flex items-center gap-2 text-sm">
          {stats.trendDirection === 'up' ? (
            <>
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-600 font-medium">
                +{stats.trendPercent}%
              </span>
            </>
          ) : (
            <>
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-red-600 font-medium">
                -{stats.trendPercent}%
              </span>
            </>
          )}
          <span className="text-gray-500">vs primera mitad de la semana</span>
        </div>
      }
    >
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Promedio</p>
          <p className="text-lg font-bold text-gray-900">
            {stats.average.toFixed(1)}h
          </p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-xs text-green-600 mb-1">Mejor día</p>
          <p className="text-lg font-bold text-green-700">
            {stats.max.hours.toFixed(1)}h
          </p>
          <p className="text-xs text-green-600 mt-1">{stats.max.dayName}</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600 mb-1">Total</p>
          <p className="text-lg font-bold text-blue-700">
            {stats.total.toFixed(1)}h
          </p>
        </div>
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={trendData}>
          <defs>
            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="dayName" 
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
            label={{ value: 'Horas', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="hours"
            stroke="#10b981"
            strokeWidth={3}
            fill="url(#colorHours)"
            dot={(props) => {
              const { cx, cy, payload } = props;
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={payload.isToday ? 6 : 4}
                  fill={payload.isToday ? '#059669' : '#10b981'}
                  stroke="#fff"
                  strokeWidth={2}
                />
              );
            }}
            activeDot={{ r: 8, fill: '#059669' }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Insights */}
      {stats.max.hours > stats.average * 1.5 && (
        <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <p className="text-sm text-yellow-800">
            💡 <strong>Insight:</strong> Tu mejor día ({stats.max.dayName}) tuviste {stats.max.hours.toFixed(1)}h, 
            {' '}{((stats.max.hours / stats.average - 1) * 100).toFixed(0)}% más que tu promedio.
          </p>
        </div>
      )}
    </Card>
  );
};

export default WeeklyTrendChart;
