/**
 * Utilidades de validación para objetivos
 * Validaciones del lado del cliente con mensajes claros
 */

import { OBJECTIVE_TYPES } from '../constants';
import { OBJECTIVE_VALIDATION } from '../constants/validation';
import { safeDate } from './dateHelpers';

/**
 * Valida los datos de un objetivo antes de enviar al servidor
 * @param {Object} data - Datos del objetivo a validar
 * @param {string} objectiveType - Tipo de objetivo (company, assigned, personal)
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateObjectiveData = (data, objectiveType) => {
  const errors = {};

  // Validar nombre
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'El nombre del objetivo es obligatorio';
  } else if (data.name.trim().length < OBJECTIVE_VALIDATION.NAME_MIN_LENGTH) {
    errors.name = `El nombre debe tener al menos ${OBJECTIVE_VALIDATION.NAME_MIN_LENGTH} caracteres`;
  } else if (data.name.trim().length > OBJECTIVE_VALIDATION.NAME_MAX_LENGTH) {
    errors.name = `El nombre no puede exceder ${OBJECTIVE_VALIDATION.NAME_MAX_LENGTH} caracteres`;
  }

  // Validar fechas
  if (!data.start_date) {
    errors.start_date = 'La fecha de inicio es obligatoria';
  }

  if (!data.end_date) {
    errors.end_date = 'La fecha de fin es obligatoria';
  }

  // Validar que end_date >= start_date
  if (data.start_date && data.end_date) {
    const startDate = safeDate(data.start_date);
    const endDate = safeDate(data.end_date);
    
    if (endDate < startDate) {
      errors.end_date = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    // Advertencia si el período es muy corto
    const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    if (diffDays < OBJECTIVE_VALIDATION.PERIOD_MIN_DAYS) {
      errors.end_date = `El objetivo debe tener al menos ${OBJECTIVE_VALIDATION.PERIOD_MIN_DAYS} día de duración`;
    }

    // Advertencia si el período es muy largo
    if (diffDays > OBJECTIVE_VALIDATION.PERIOD_WARNING_DAYS) {
      errors.period_warning = `El objetivo tiene una duración mayor a ${OBJECTIVE_VALIDATION.PERIOD_WARNING_DAYS} días. ¿Estás seguro?`;
    }
  }

  // Validar horas objetivo
  if (!data.target_hours) {
    errors.target_hours = 'Las horas objetivo son obligatorias';
  } else {
    const hours = parseFloat(data.target_hours);
    
    if (isNaN(hours)) {
      errors.target_hours = 'Las horas deben ser un número válido';
    } else if (hours <= 0) {
      errors.target_hours = 'Las horas objetivo deben ser mayores a 0';
    } else if (hours > OBJECTIVE_VALIDATION.TARGET_HOURS_MAX) {
      errors.target_hours = `Las horas objetivo no pueden exceder ${OBJECTIVE_VALIDATION.TARGET_HOURS_MAX.toLocaleString()}`;
    } else if (hours < OBJECTIVE_VALIDATION.TARGET_HOURS_MIN) {
      errors.target_hours = `Las horas objetivo deben ser al menos ${OBJECTIVE_VALIDATION.TARGET_HOURS_MIN}`;
    }

    // Advertencia si las horas son muy altas
    if (hours > OBJECTIVE_VALIDATION.HOURS_WARNING_THRESHOLD) {
      errors.hours_warning = `Las horas objetivo son muy altas (>${OBJECTIVE_VALIDATION.HOURS_WARNING_THRESHOLD}). Verifica que sea correcto.`;
    }
  }

  // Validaciones específicas por tipo
  if (objectiveType === OBJECTIVE_TYPES.COMPANY) {
    if (!data.organizational_unit_id) {
      errors.organizational_unit_id = 'Debes seleccionar un área/proceso para objetivos de empresa';
    }
  }

  if (objectiveType === OBJECTIVE_TYPES.ASSIGNED) {
    if (!data.assigned_to_user_id) {
      errors.assigned_to_user_id = 'Debes seleccionar un usuario para objetivos asignados';
    }
  }

  // Validar descripción (opcional pero con límite)
  if (data.description && data.description.length > OBJECTIVE_VALIDATION.DESCRIPTION_MAX_LENGTH) {
    errors.description = `La descripción no puede exceder ${OBJECTIVE_VALIDATION.DESCRIPTION_MAX_LENGTH} caracteres`;
  }

  // Validar criterios de éxito (opcional pero con límite)
  if (data.success_criteria && data.success_criteria.length > OBJECTIVE_VALIDATION.SUCCESS_CRITERIA_MAX_LENGTH) {
    errors.success_criteria = `Los criterios de cumplimiento no pueden exceder ${OBJECTIVE_VALIDATION.SUCCESS_CRITERIA_MAX_LENGTH} caracteres`;
  }

  return {
    isValid: Object.keys(errors).filter(key => !key.includes('_warning')).length === 0,
    errors
  };
};

/**
 * Valida que las horas objetivo sean razonables para el período
 * @param {number} targetHours - Horas objetivo
 * @param {string} startDate - Fecha de inicio
 * @param {string} endDate - Fecha de fin
 * @returns {Object} { isValid: boolean, warning: string }
 */
export const validateHoursForPeriod = (targetHours, startDate, endDate) => {
  if (!targetHours || !startDate || !endDate) {
    return { isValid: true, warning: null };
  }

  const start = safeDate(startDate);
  const end = safeDate(endDate);
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  // Calcular horas por día
  const hoursPerDay = targetHours / diffDays;

  if (hoursPerDay > OBJECTIVE_VALIDATION.HOURS_PER_DAY_MAX) {
    return {
      isValid: false,
      warning: `Las horas objetivo (${targetHours}h) requieren ${hoursPerDay.toFixed(1)}h por día, lo cual es imposible (máx ${OBJECTIVE_VALIDATION.HOURS_PER_DAY_MAX}h/día).`
    };
  }

  if (hoursPerDay > OBJECTIVE_VALIDATION.HOURS_PER_DAY_WARNING) {
    return {
      isValid: true,
      warning: `Las horas objetivo requieren ${hoursPerDay.toFixed(1)}h por día (>${OBJECTIVE_VALIDATION.HOURS_PER_DAY_WARNING}h/día). Verifica que sea realista.`
    };
  }

  return { isValid: true, warning: null };
};

/**
 * Formatea errores de validación para mostrar al usuario
 * @param {Object} errors - Objeto de errores
 * @returns {string} Mensaje formateado
 */
export const formatValidationErrors = (errors) => {
  const errorMessages = Object.entries(errors)
    .filter(([key]) => !key.includes('_warning'))
    .map(([, message]) => message);

  if (errorMessages.length === 0) return '';
  if (errorMessages.length === 1) return errorMessages[0];

  return `Se encontraron ${errorMessages.length} errores:\n${errorMessages.map((msg, i) => `${i + 1}. ${msg}`).join('\n')}`;
};

/**
 * Obtiene advertencias de validación (no bloquean el envío)
 * @param {Object} errors - Objeto de errores
 * @returns {Array<string>} Array de advertencias
 */
export const getValidationWarnings = (errors) => {
  return Object.entries(errors)
    .filter(([key]) => key.includes('_warning'))
    .map(([, message]) => message);
};

export default {
  validateObjectiveData,
  validateHoursForPeriod,
  formatValidationErrors,
  getValidationWarnings
};
