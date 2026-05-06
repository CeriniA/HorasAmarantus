/**
 * Utilidades para cálculos de objetivos
 * Helpers reutilizables para métricas y análisis de objetivos
 */

import supabase from '../config/database.js';
import logger from './logger.js';

/**
 * Calcula las horas completadas para un objetivo según su tipo
 * @param {Object} objective - Objeto objetivo completo
 * @returns {Promise<number>} Total de horas completadas
 */
export const calculateCompletedHours = async (objective) => {
  try {
    const { objective_type, organizational_unit_id, assigned_to_user_id, created_by, start_date, end_date } = objective;

    let query = supabase
      .from('time_entries')
      .select('total_hours')
      .gte('start_time', start_date)
      .lte('start_time', end_date);

    // Lógica específica por tipo de objetivo
    switch (objective_type) {
      case 'company':
        // Objetivos de empresa: filtrar por unidad organizacional
        if (!organizational_unit_id || organizational_unit_id === 'null') {
          logger.warn('Objetivo de empresa sin organizational_unit_id válido:', { id: objective.id, organizational_unit_id });
          return 0;
        }
        query = query.eq('organizational_unit_id', organizational_unit_id);
        logger.debug('Calculando horas por área:', { organizational_unit_id, start_date, end_date });
        break;

      case 'assigned':
        // Objetivos asignados: filtrar por usuario asignado
        if (!assigned_to_user_id || assigned_to_user_id === 'null') {
          logger.warn('Objetivo asignado sin assigned_to_user_id válido:', { id: objective.id, assigned_to_user_id });
          return 0;
        }
        query = query.eq('user_id', assigned_to_user_id);
        logger.debug('Calculando horas por usuario asignado:', { assigned_to_user_id, start_date, end_date });
        break;

      case 'personal':
        // Objetivos personales: filtrar por creador
        if (!created_by || created_by === 'null') {
          logger.warn('Objetivo personal sin created_by válido:', { id: objective.id, created_by });
          return 0;
        }
        query = query.eq('user_id', created_by);
        logger.debug('Calculando horas por creador:', { created_by, start_date, end_date });
        break;

      default:
        logger.error('Tipo de objetivo desconocido:', { objective_type, id: objective.id });
        return 0;
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
    const completedHours = await calculateCompletedHours(objective);

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
  const completedHours = await calculateCompletedHours(objective);

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
