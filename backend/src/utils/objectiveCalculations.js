/**
 * Utilidades para cálculos de objetivos
 * Helpers reutilizables para métricas y análisis de objetivos
 */

import supabase from '../config/database.js';
import logger from './logger.js';

/**
 * Calcula las horas completadas para un objetivo
 * @param {string} organizationalUnitId - ID de la unidad organizacional
 * @param {string} startDate - Fecha de inicio del objetivo
 * @param {string} endDate - Fecha de fin del objetivo
 * @param {string} assignedUserId - ID del usuario asignado (opcional, para objetivos personales/asignados)
 * @returns {Promise<number>} Total de horas completadas
 */
export const calculateCompletedHours = async (organizationalUnitId, startDate, endDate, assignedUserId = null) => {
  try {
    let query = supabase
      .from('time_entries')
      .select('total_hours')
      .gte('start_time', startDate)
      .lte('start_time', endDate);

    // Si es objetivo de empresa/área, filtrar por unidad organizacional
    if (organizationalUnitId) {
      query = query.eq('organizational_unit_id', organizationalUnitId);
    }

    // Si es objetivo asignado/personal, filtrar por usuario
    if (assignedUserId) {
      query = query.eq('user_id', assignedUserId);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error al calcular horas completadas:', error);
      return 0;
    }

    const totalHours = data.reduce((sum, entry) => sum + (entry.total_hours || 0), 0);
    return parseFloat(totalHours.toFixed(2));
  } catch (error) {
    logger.error('Error en calculateCompletedHours:', error);
    return 0;
  }
};

/**
 * Calcula métricas completas para un objetivo
 * @param {Object} objective - Objeto objetivo con sus datos
 * @returns {Promise<Object>} Métricas calculadas
 */
export const calculateObjectiveMetrics = async (objective) => {
  try {
    const completedHours = await calculateCompletedHours(
      objective.organizational_unit_id,
      objective.start_date,
      objective.end_date,
      objective.assigned_to_user_id
    );

    const targetHours = objective.target_hours || 0;
    const hoursDifference = completedHours - targetHours;
    const percentageOfTarget = targetHours > 0 
      ? (completedHours / targetHours) * 100 
      : 0;

    return {
      completed_hours: completedHours,
      target_hours: targetHours,
      hours_difference: parseFloat(hoursDifference.toFixed(2)),
      percentage_of_target: parseFloat(percentageOfTarget.toFixed(1))
    };
  } catch (error) {
    logger.error('Error en calculateObjectiveMetrics:', error);
    return {
      completed_hours: 0,
      target_hours: objective.target_hours || 0,
      hours_difference: 0,
      percentage_of_target: 0
    };
  }
};

/**
 * Enriquece un objetivo con sus horas completadas
 * @param {Object} objective - Objetivo a enriquecer
 * @returns {Promise<Object>} Objetivo con completed_hours agregado
 */
export const enrichObjectiveWithHours = async (objective) => {
  const completedHours = await calculateCompletedHours(
    objective.organizational_unit_id,
    objective.start_date,
    objective.end_date,
    objective.assigned_to_user_id
  );

  return {
    ...objective,
    completed_hours: completedHours
  };
};

/**
 * Enriquece múltiples objetivos con sus horas completadas
 * @param {Array<Object>} objectives - Array de objetivos
 * @returns {Promise<Array<Object>>} Objetivos enriquecidos
 */
export const enrichObjectivesWithHours = async (objectives) => {
  if (!objectives || objectives.length === 0) {
    logger.info('enrichObjectivesWithHours: No hay objetivos para enriquecer');
    return [];
  }

  logger.info(`enrichObjectivesWithHours: Enriqueciendo ${objectives.length} objetivos`);

  try {
    // Calcular en paralelo para mejor performance
    const enrichedObjectives = await Promise.all(
      objectives.map(objective => enrichObjectiveWithHours(objective))
    );

    logger.info(`enrichObjectivesWithHours: ${enrichedObjectives.length} objetivos enriquecidos`);
    return enrichedObjectives;
  } catch (error) {
    logger.error('Error en enrichObjectivesWithHours:', error);
    // Devolver objetivos sin enriquecer en caso de error
    return objectives.map(obj => ({ ...obj, completed_hours: 0 }));
  }
};

export default {
  calculateCompletedHours,
  calculateObjectiveMetrics,
  enrichObjectiveWithHours,
  enrichObjectivesWithHours
};
