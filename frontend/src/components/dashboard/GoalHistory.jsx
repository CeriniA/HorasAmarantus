/**
 * Historial de Objetivos
 * Muestra el cumplimiento de objetivos en semanas/meses anteriores
 */

import { useMemo } from 'react';
import { format, subWeeks, startOfWeek, endOfWeek, differenceInWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import Card from '../common/Card';
import { safeDate, calculateHours } from '../../utils/dateHelpers';
import { Award, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

export const GoalHistory = ({ timeEntries, weeklyGoal = 40, user }) => {
  const historyData = useMemo(() => {
    const today = new Date(); // OK: fecha actual
    const history = [];

    // Calcular cuántas semanas mostrar (máximo 8, o menos si el usuario es nuevo)
    let maxWeeks = 8;
    if (user?.created_at) {
      const userCreatedDate = new Date(user.created_at);
      // Validar que la fecha sea válida
      if (!isNaN(userCreatedDate.getTime())) {
        const weeksSinceCreation = differenceInWeeks(today, userCreatedDate);
        // Mostrar como máximo las semanas que el usuario ha existido (excluyendo la actual)
        maxWeeks = Math.min(8, Math.max(0, weeksSinceCreation));
      }
    }

    // Si el usuario es muy nuevo (menos de 1 semana), no mostrar historial
    if (maxWeeks === 0) {
      return {
        history: [],
        stats: {
          achieved: 0,
          almost: 0,
          successRate: 0,
          avgCompletion: 0,
          totalWeeks: 0
        }
      };
    }

    // Obtener últimas N semanas (excluyendo la actual)
    for (let i = 1; i <= maxWeeks; i++) {
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

      // Calcular porcentaje de cumplimiento
      const percentage = (totalHours / weeklyGoal) * 100;

      // Determinar estado
      let status = 'pending';
      if (percentage >= 100) status = 'achieved';
      else if (percentage >= 90) status = 'almost';
      else if (percentage >= 70) status = 'partial';
      else status = 'missed';

      history.push({
        weekNumber: i,
        weekStart,
        weekEnd,
        dateRange: `${format(weekStart, 'd MMM', { locale: es })} - ${format(weekEnd, 'd MMM', { locale: es })}`,
        totalHours: totalHours,
        goal: weeklyGoal,
        percentage: Math.min(percentage, 100),
        status,
        entries: weekEntries.length
      });
    }

    // Calcular estadísticas
    const achieved = history.filter(w => w.status === 'achieved').length;
    const almost = history.filter(w => w.status === 'almost').length;
    const successRate = ((achieved + almost) / history.length) * 100;
    const avgCompletion = history.reduce((sum, w) => sum + w.percentage, 0) / history.length;

    return {
      history,
      stats: {
        achieved,
        almost,
        successRate,
        avgCompletion,
        totalWeeks: history.length
      }
    };
  }, [timeEntries, weeklyGoal, user?.created_at]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'achieved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'almost':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'partial':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'achieved':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'almost':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'partial':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      default:
        return 'bg-red-50 border-red-200 text-red-700';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'achieved':
        return 'Cumplido';
      case 'almost':
        return 'Casi cumplido';
      case 'partial':
        return 'Parcial';
      default:
        return 'No cumplido';
    }
  };

  return (
    <Card 
      title="Historial de Objetivos"
      icon={Award}
      subtitle={historyData.stats.totalWeeks > 0 ? `Últimas ${historyData.stats.totalWeeks} semanas` : 'Sin historial aún'}
    >
      {historyData.stats.totalWeeks === 0 ? (
        <div className="text-center py-8">
          <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            ¡Bienvenido! Completa tu primera semana para ver tu historial de objetivos.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Estadísticas Generales */}
          <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-700">
              {historyData.stats.achieved}
            </p>
            <p className="text-xs text-green-600 mt-1">Cumplidos</p>
          </div>

          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-700">
              {historyData.stats.successRate.toFixed(0)}%
            </p>
            <p className="text-xs text-blue-600 mt-1">Tasa de éxito</p>
          </div>

          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
            <Award className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-700">
              {historyData.stats.avgCompletion.toFixed(0)}%
            </p>
            <p className="text-xs text-purple-600 mt-1">Promedio</p>
          </div>
        </div>

        {/* Lista de Semanas */}
        <div className="space-y-2">
          {historyData.history.map((week) => (
            <div
              key={week.weekNumber}
              className={`p-3 rounded-lg border transition-all hover:shadow-md ${getStatusColor(week.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(week.status)}
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">
                        {week.dateRange}
                      </p>
                      <span className="text-xs font-semibold">
                        {getStatusLabel(week.status)}
                      </span>
                    </div>
                    
                    {/* Barra de progreso */}
                    <div className="mt-2 bg-white bg-opacity-50 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          week.status === 'achieved' ? 'bg-green-500' :
                          week.status === 'almost' ? 'bg-blue-500' :
                          week.status === 'partial' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${week.percentage}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs opacity-75">
                        {week.totalHours.toFixed(1)}h / {week.goal}h
                      </span>
                      <span className="text-xs font-semibold">
                        {week.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje motivacional */}
        {historyData.stats.achieved >= 6 && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">
                  ¡Excelente consistencia!
                </p>
                <p className="text-sm text-green-700">
                  Has cumplido {historyData.stats.achieved} de las últimas {historyData.stats.totalWeeks} semanas
                </p>
              </div>
            </div>
          </div>
        )}

        {historyData.stats.successRate < 50 && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 <strong>Consejo:</strong> Intenta establecer un objetivo más realista o distribuir mejor tu tiempo durante la semana.
            </p>
          </div>
        )}
        </div>
      )}
    </Card>
  );
};

export default GoalHistory;
