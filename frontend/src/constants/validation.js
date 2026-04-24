/**
 * Constantes de Validación
 * Valores para validaciones y tolerancias del sistema
 */

export const VALIDATION = {
  // Tolerancia de horas (para comparación de totales)
  TIME_TOLERANCE_HOURS: 0.08, // ~5 minutos
  TIME_TOLERANCE_MINUTES: 5,
  
  // Límites de entrada
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_TASK_NAME_LENGTH: 100,
  MIN_HOURS: 0.1, // 6 minutos mínimo
  MAX_HOURS_PER_DAY: 24,
  
  // Validación de fechas
  MAX_DAYS_IN_PAST: 90, // 3 meses
  MAX_DAYS_IN_FUTURE: 30, // 1 mes
  
  // Formato de visualización
  HOURS_DECIMAL_PLACES: 1, // Mostrar 1 decimal en horas
};


// Constantes de validación para objetivos
export const OBJECTIVE_VALIDATION = {
  // Nombre
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 200,
  
  // Descripción y criterios
  DESCRIPTION_MAX_LENGTH: 1000,
  SUCCESS_CRITERIA_MAX_LENGTH: 2000,
  COMPLETION_NOTES_MAX_LENGTH: 1000,
  
  // Horas objetivo
  TARGET_HOURS_MIN: 0.5,
  TARGET_HOURS_MAX: 10000,
  HOURS_WARNING_THRESHOLD: 1000, // Advertir si supera 1000 horas
  HOURS_PER_DAY_MAX: 24, // Imposible superar 24h/día
  HOURS_PER_DAY_WARNING: 12, // Advertir si requiere más de 12h/día
  
  // Período
  PERIOD_MIN_DAYS: 1,
  PERIOD_MAX_DAYS: 365,
  PERIOD_WARNING_DAYS: 365, // Advertir si supera 1 año
  
  // Urgencia (días restantes)
  URGENCY_OVERDUE: 0, // Vencido
  URGENCY_CRITICAL: 3, // 0-3 días
  URGENCY_HIGH: 7, // 4-7 días
  URGENCY_MEDIUM: 14, // 8-14 días
  // >14 días = baja urgencia
};

export default VALIDATION;
