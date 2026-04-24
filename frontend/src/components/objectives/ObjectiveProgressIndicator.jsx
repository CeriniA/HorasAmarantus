/**
 * Indicador Compacto de Progreso
 * Muestra una barra de progreso simple con porcentaje
 */

export const ObjectiveProgressIndicator = ({ completedHours = 0, targetHours = 0, compact = false }) => {
  const progressPercentage = targetHours > 0 ? (completedHours / targetHours) * 100 : 0;
  
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

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${Math.min(100, progressPercentage)}%` }}
          />
        </div>
        <span className={`text-xs font-bold ${getTextColor()} min-w-[3rem] text-right`}>
          {Math.min(100, progressPercentage).toFixed(0)}%
        </span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs sm:text-sm font-medium text-gray-700">
          {completedHours.toFixed(1)}h / {targetHours}h
        </span>
        <span className={`text-xs sm:text-sm font-bold ${getTextColor()}`}>
          {Math.min(100, progressPercentage).toFixed(0)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
          style={{ width: `${Math.min(100, progressPercentage)}%` }}
        />
      </div>
    </div>
  );
};

export default ObjectiveProgressIndicator;
