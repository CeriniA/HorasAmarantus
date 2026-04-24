/**
 * Componente de Progreso de Objetivo
 * Muestra barra de progreso, horas completadas y días restantes
 */

import { Clock, Calendar, TrendingUp } from 'lucide-react';
import { differenceInDays } from 'date-fns';

export const ObjectiveProgress = ({ objective }) => {
  const completedHours = objective.completed_hours || 0;
  const targetHours = objective.target_hours || 0;
  const progressPercentage = targetHours > 0 ? (completedHours / targetHours) * 100 : 0;
  const remainingHours = Math.max(0, targetHours - completedHours);
  
  // Calcular días restantes
  const today = new Date();
  const endDate = new Date(objective.end_date);
  const daysRemaining = differenceInDays(endDate, today);
  
  // Determinar color según progreso
  const getProgressColor = () => {
    if (progressPercentage >= 100) return 'bg-green-600';
    if (progressPercentage >= 75) return 'bg-blue-600';
    if (progressPercentage >= 50) return 'bg-yellow-500';
    if (progressPercentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTextColor = () => {
    if (progressPercentage >= 100) return 'text-green-600';
    if (progressPercentage >= 75) return 'text-blue-600';
    if (progressPercentage >= 50) return 'text-yellow-600';
    if (progressPercentage >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 text-gray-500 mb-1">
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-xs font-medium">Meta</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-gray-900">{targetHours}h</p>
        </div>
        
        <div className="text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 text-gray-500 mb-1">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-xs font-medium">Completado</span>
          </div>
          <p className={`text-base sm:text-lg font-bold ${getTextColor()}`}>
            {completedHours.toFixed(1)}h
          </p>
        </div>
        
        <div className="text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 text-gray-500 mb-1">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-xs font-medium">Días rest.</span>
          </div>
          <p className={`text-base sm:text-lg font-bold ${daysRemaining < 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {daysRemaining < 0 ? 'Vencido' : daysRemaining}
          </p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso</span>
          <span className={`text-sm sm:text-base font-bold ${getTextColor()}`}>
            {Math.min(100, progressPercentage).toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 sm:h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${Math.min(100, progressPercentage)}%` }}
          />
        </div>
      </div>

      {/* Horas restantes */}
      {remainingHours > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Faltan:</span>
          <span className="font-semibold text-gray-900">{remainingHours.toFixed(1)}h</span>
        </div>
      )}

      {/* Alerta si está vencido */}
      {daysRemaining < 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-2.5 sm:p-3 rounded">
          <p className="text-xs sm:text-sm text-red-700 font-medium">
            ⚠️ Este objetivo venció hace {Math.abs(daysRemaining)} días
          </p>
        </div>
      )}

      {/* Alerta si está próximo a vencer */}
      {daysRemaining >= 0 && daysRemaining <= 7 && progressPercentage < 80 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2.5 sm:p-3 rounded">
          <p className="text-xs sm:text-sm text-yellow-700 font-medium">
            ⏰ Quedan {daysRemaining} días para completar
          </p>
        </div>
      )}

      {/* Mensaje de éxito */}
      {progressPercentage >= 100 && (
        <div className="bg-green-50 border-l-4 border-green-400 p-2.5 sm:p-3 rounded">
          <p className="text-xs sm:text-sm text-green-700 font-medium">
            ✅ ¡Objetivo completado! {progressPercentage.toFixed(0)}% de la meta
          </p>
        </div>
      )}
    </div>
  );
};

export default ObjectiveProgress;
