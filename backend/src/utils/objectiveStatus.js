/**
 * Utilidades para manejo de estados de objetivos
 * Calcula estados automáticos basados en fechas y cumplimiento
 */

import { OBJECTIVE_STATUS, OBJECTIVE_PROGRESS_STATUS } from '../models/constants.js';
import logger from './logger.js';

/**
 * Calcula el estado automático de un objetivo basado en fechas
 * @param {Object} objective - Objetivo con start_date, end_date, is_completed
 * @returns {string} Estado calculado
 */
export const calculateObjectiveStatus = (objective) => {
  const now = new Date();
  const startDate = new Date(objective.start_date);
  const endDate = new Date(objective.end_date);

  // Si está marcado como completado manualmente
  if (objective.is_completed === true) {
    return OBJECTIVE_STATUS.COMPLETED;
  }

  // Si está marcado como no completado y ya pasó la fecha
  if (objective.is_completed === false && now > endDate) {
    return OBJECTIVE_STATUS.FAILED;
  }

  // Si aún no empezó
  if (now < startDate) {
    return OBJECTIVE_STATUS.PLANNED;
  }

  // Si ya pasó la fecha de fin y no está marcado
  if (now > endDate && objective.is_completed === null) {
    return OBJECTIVE_STATUS.PENDING_REVIEW;
  }

  // Si está en el período activo
  if (now >= startDate && now <= endDate) {
    return OBJECTIVE_STATUS.IN_PROGRESS;
  }

  // Por defecto, planificado
  return OBJECTIVE_STATUS.PLANNED;
};

/**
 * Actualiza el estado de un objetivo si es necesario
 * @param {Object} objective - Objetivo a evaluar
 * @returns {Object} Objetivo con estado actualizado si cambió
 */
export const updateObjectiveStatusIfNeeded = (objective) => {
  const currentStatus = objective.status;
  const calculatedStatus = calculateObjectiveStatus(objective);
  
  // Calcular sub-estado de progreso
  const progressStatus = getProgressStatus({ ...objective, status: calculatedStatus });

  // Solo actualizar si el estado calculado es diferente
  if (currentStatus !== calculatedStatus) {
    logger.info(`Estado de objetivo ${objective.id} actualizado: ${currentStatus} → ${calculatedStatus}`, {
      progress_status: progressStatus
    });
    return {
      ...objective,
      status: calculatedStatus,
      progress_status: progressStatus,
      status_updated_at: new Date().toISOString()
    };
  }

  return {
    ...objective,
    progress_status: progressStatus
  };
};

/**
 * Actualiza estados de múltiples objetivos
 * @param {Array<Object>} objectives - Array de objetivos
 * @returns {Array<Object>} Objetivos con estados actualizados
 */
export const updateMultipleObjectivesStatus = (objectives) => {
  if (!objectives || objectives.length === 0) {
    return [];
  }

  return objectives.map(objective => updateObjectiveStatusIfNeeded(objective));
};

/**
 * Verifica si un objetivo está vencido
 * @param {Object} objective - Objetivo a verificar
 * @returns {boolean} True si está vencido
 */
export const isObjectiveOverdue = (objective) => {
  const now = new Date();
  const endDate = new Date(objective.end_date);
  
  return now > endDate && objective.is_completed !== true;
};

/**
 * Calcula días restantes para un objetivo
 * @param {Object} objective - Objetivo
 * @returns {number} Días restantes (negativo si ya pasó)
 */
export const getDaysRemaining = (objective) => {
  const now = new Date();
  const endDate = new Date(objective.end_date);
  
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Obtiene el porcentaje de tiempo transcurrido
 * @param {Object} objective - Objetivo
 * @returns {number} Porcentaje (0-100)
 */
export const getTimeProgress = (objective) => {
  const now = new Date();
  const startDate = new Date(objective.start_date);
  const endDate = new Date(objective.end_date);
  
  // Si aún no empezó
  if (now < startDate) {
    return 0;
  }
  
  // Si ya terminó
  if (now > endDate) {
    return 100;
  }
  
  // Calcular porcentaje
  const totalTime = endDate - startDate;
  const elapsedTime = now - startDate;
  const percentage = (elapsedTime / totalTime) * 100;
  
  return Math.round(percentage);
};

/**
 * Calcula el progreso esperado según el tiempo transcurrido
 * @param {Object} objective - Objetivo con fechas
 * @returns {number} Porcentaje esperado (0-100)
 */
export const getExpectedProgress = (objective) => {
  const now = new Date();
  const startDate = new Date(objective.start_date);
  const endDate = new Date(objective.end_date);
  
  // Si no ha empezado
  if (now < startDate) return 0;
  
  // Si ya terminó
  if (now > endDate) return 100;
  
  // Calcular porcentaje de tiempo transcurrido
  const totalTime = endDate - startDate;
  const elapsedTime = now - startDate;
  const expectedProgress = (elapsedTime / totalTime) * 100;
  
  return Math.round(expectedProgress);
};

/**
 * Calcula el sub-estado de progreso (ON_TRACK, BEHIND, AHEAD)
 * @param {Object} objective - Objetivo con completed_hours y target_hours
 * @returns {string|null} Sub-estado de progreso o null si no aplica
 */
export const getProgressStatus = (objective) => {
  // Solo calcular si está en progreso
  if (objective.status !== OBJECTIVE_STATUS.IN_PROGRESS) {
    return null;
  }
  
  const actualProgress = objective.completed_hours && objective.target_hours
    ? (objective.completed_hours / objective.target_hours) * 100
    : 0;
  
  const expectedProgress = getExpectedProgress(objective);
  
  // Margen de tolerancia del 10%
  const tolerance = 10;
  
  if (actualProgress >= expectedProgress + tolerance) {
    return OBJECTIVE_PROGRESS_STATUS.AHEAD;
  } else if (actualProgress < expectedProgress - tolerance) {
    return OBJECTIVE_PROGRESS_STATUS.BEHIND;
  } else {
    return OBJECTIVE_PROGRESS_STATUS.ON_TRACK;
  }
};

export default {
  calculateObjectiveStatus,
  updateObjectiveStatusIfNeeded,
  updateMultipleObjectivesStatus,
  isObjectiveOverdue,
  getDaysRemaining,
  getTimeProgress,
  getExpectedProgress,
  getProgressStatus
};
