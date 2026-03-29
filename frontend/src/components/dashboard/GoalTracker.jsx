/**
 * Seguimiento de Objetivos
 * Muestra progreso hacia metas semanales/mensuales
 */

import { useMemo } from 'react';
import { startOfWeek, endOfWeek, differenceInDays, isSameDay, format } from 'date-fns';
import { es } from 'date-fns/locale';
import Card from '../common/Card';
import { Target, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import { safeDate, calculateHours, extractDate } from '../../utils/dateHelpers';

export const GoalTracker = ({ timeEntries, goalType = 'weekly', customGoal = null }) => {
  // Calcular progreso
  const goalData = useMemo(() => {
    const today = new Date(); // OK: fecha actual
    let targetHours = customGoal || 40; // Default: 40h semanales
    let periodStart, periodEnd;
    
    if (goalType === 'weekly') {
      periodStart = startOfWeek(today, { weekStartsOn: 1 });
      periodEnd = endOfWeek(today, { weekStartsOn: 1 });
      targetHours = customGoal || 40;
    } else if (goalType === 'monthly') {
      periodStart = new Date(today.getFullYear(), today.getMonth(), 1); // OK: construir fecha
      periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0); // OK: construir fecha
      targetHours = customGoal || 160;
    }
    
    // Filtrar entries del período
    const periodEntries = timeEntries.filter(entry => {
      const entryDate = safeDate(entry.start_time);
      return entryDate >= periodStart && entryDate <= periodEnd;
    });
    
    // Calcular horas actuales
    const currentHours = periodEntries.reduce((sum, entry) => {
      return sum + calculateHours(entry.start_time, entry.end_time);
    }, 0);
    
    // Calcular días trabajados y días restantes
    const daysWorked = new Set(
      periodEntries.map(e => extractDate(e.start_time))
    ).size;
    
    const daysRemaining = differenceInDays(periodEnd, today);
    
    // Calcular días laborables restantes (lunes a sábado, SIN domingo)
    // Empezar desde mañana (i=1) porque hoy ya está en curso
    let workDaysRemaining = 0;
    for (let i = 1; i <= daysRemaining; i++) {
      const checkDate = new Date(today); // OK: fecha actual
      checkDate.setDate(checkDate.getDate() + i);
      const dayOfWeek = checkDate.getDay();
      // Excluir domingo (0)
      if (dayOfWeek !== 0) {
        workDaysRemaining++;
      }
    }
    
    // Calcular progreso
    const progress = (currentHours / targetHours) * 100;
    const remaining = targetHours - currentHours;
    
    // Calcular promedio necesario
    const requiredDailyAvg = workDaysRemaining > 0 
      ? remaining / workDaysRemaining 
      : 0;
    
    // Calcular promedio actual
    const currentDailyAvg = daysWorked > 0 ? currentHours / daysWorked : 0;
    
    // Proyección
    const projectedTotal = currentDailyAvg * (daysWorked + workDaysRemaining);
    
    // Estado
    let status = 'on_track';
    if (progress >= 100) {
      status = 'achieved';
    } else if (projectedTotal < targetHours * 0.9) {
      status = 'behind';
    } else if (projectedTotal > targetHours * 1.1) {
      status = 'ahead';
    }
    
    return {
      targetHours,
      currentHours,
      progress: Math.min(progress, 100),
      remaining: Math.max(remaining, 0),
      daysWorked,
      daysRemaining: workDaysRemaining,
      requiredDailyAvg,
      currentDailyAvg,
      projectedTotal,
      status,
      periodStart,
      periodEnd
    };
  }, [timeEntries, goalType, customGoal]);

  // Colores según estado
  const getStatusColor = () => {
    switch (goalData.status) {
      case 'achieved':
        return 'text-green-600';
      case 'ahead':
        return 'text-blue-600';
      case 'on_track':
        return 'text-primary-600';
      case 'behind':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusMessage = () => {
    switch (goalData.status) {
      case 'achieved':
        return '🎉 ¡Objetivo cumplido!';
      case 'ahead':
        return '🚀 Vas adelantado';
      case 'on_track':
        return '✅ En buen camino';
      case 'behind':
        return '⚠️ Necesitas acelerar';
      default:
        return '';
    }
  };

  const getProgressColor = () => {
    if (goalData.progress >= 100) return 'stroke-green-500';
    if (goalData.progress >= 80) return 'stroke-primary-500';
    if (goalData.progress >= 50) return 'stroke-blue-500';
    return 'stroke-orange-500';
  };

  // Verificar si es lunes (inicio de semana)
  const today = new Date(); // OK: fecha actual
  const isMonday = today.getDay() === 1;
  const isNewWeek = isMonday && isSameDay(today, goalData.periodStart);

  return (
    <Card 
      title={`Objetivo ${goalType === 'weekly' ? 'Semanal' : 'Mensual'}`}
      subtitle={getStatusMessage()}
    >
      <div className="space-y-6">
        {/* Indicador de Nueva Semana */}
        {isNewWeek && goalType === 'weekly' && (
          <div className="p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-lg border-2 border-blue-200 animate-pulse">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <div className="text-center">
                <p className="font-semibold text-blue-900">
                  ¡Nueva Semana!
                </p>
                <p className="text-sm text-blue-700">
                  {format(goalData.periodStart, "d 'de' MMMM", { locale: es })} - {format(goalData.periodEnd, "d 'de' MMMM", { locale: es })}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Tu objetivo: <strong>{goalData.targetHours}h</strong> (lunes a sábado)
                </p>
              </div>
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        )}

        {/* Progreso Circular */}
        <div className="flex justify-center">
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-40 h-40 transform -rotate-90">
              {/* Círculo de fondo */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="#e5e7eb"
                strokeWidth="12"
                fill="none"
              />
              {/* Círculo de progreso */}
              <circle
                cx="80"
                cy="80"
                r="70"
                className={getProgressColor()}
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - goalData.progress / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div className="absolute text-center">
              <span className={`text-3xl font-bold ${getStatusColor()}`}>
                {goalData.progress.toFixed(0)}%
              </span>
              <p className="text-xs text-gray-500 mt-1">completado</p>
            </div>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-4 w-4 text-gray-500 mr-1" />
              <p className="text-xs text-gray-500">Objetivo</p>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {goalData.targetHours.toFixed(0)}h
            </p>
          </div>

          <div className="text-center p-3 bg-primary-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-4 w-4 text-primary-500 mr-1" />
              <p className="text-xs text-primary-600">Actual</p>
            </div>
            <p className="text-xl font-bold text-primary-700">
              {goalData.currentHours.toFixed(1)}h
            </p>
          </div>
        </div>

        {/* Información detallada */}
        {goalData.status !== 'achieved' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm text-blue-900">Faltan</span>
              </div>
              <span className="font-semibold text-blue-700">
                {goalData.remaining.toFixed(1)}h
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm text-purple-900">Días laborables restantes</span>
              <span className="font-semibold text-purple-700">
                {goalData.daysRemaining}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-sm text-orange-900">Promedio necesario</span>
              <span className="font-semibold text-orange-700">
                {goalData.requiredDailyAvg.toFixed(1)}h/día
              </span>
            </div>

            {/* Proyección */}
            <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <p className="text-xs text-gray-600 mb-1">Proyección</p>
              <p className="text-sm font-medium text-gray-900">
                A tu ritmo actual ({goalData.currentDailyAvg.toFixed(1)}h/día), 
                alcanzarás <strong>{goalData.projectedTotal.toFixed(0)}h</strong>
              </p>
              {goalData.projectedTotal < goalData.targetHours && (
                <p className="text-xs text-orange-600 mt-1">
                  ⚠️ {(goalData.targetHours - goalData.projectedTotal).toFixed(0)}h por debajo del objetivo
                </p>
              )}
              {goalData.projectedTotal > goalData.targetHours && (
                <p className="text-xs text-green-600 mt-1">
                  ✨ {(goalData.projectedTotal - goalData.targetHours).toFixed(0)}h por encima del objetivo
                </p>
              )}
            </div>
          </div>
        )}

        {/* Mensaje de éxito */}
        {goalData.status === 'achieved' && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
            <div className="text-center">
              <p className="text-2xl mb-2">🎉</p>
              <p className="font-semibold text-green-900 mb-1">
                ¡Felicitaciones!
              </p>
              <p className="text-sm text-green-700">
                Completaste tu objetivo de {goalData.targetHours}h
              </p>
              <p className="text-xs text-green-600 mt-2">
                Trabajaste {goalData.currentHours.toFixed(1)}h en {goalData.daysWorked} días
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GoalTracker;
