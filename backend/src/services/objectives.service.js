/**
 * Servicio de Objetivos
 * Gestiona objetivos por área/proceso con análisis de eficiencia y eficacia
 * 
 * Tipos de objetivos:
 * - company: Objetivos empresariales por área
 * - assigned: Objetivos asignados a usuario específico con distribución semanal
 * - personal: Objetivos personales del usuario
 */

import supabase from '../config/database.js';
import logger from '../utils/logger.js';
import permissionsService from './permissions.service.js';
import { ValidationError } from '../middleware/errorHandler.js';
import { OBJECTIVE_STATUS, OBJECTIVE_DIAGNOSIS, OBJECTIVE_TYPES } from '../models/constants.js';
import { enrichObjectivesWithHours, calculateCompletedHours } from '../utils/objectiveCalculations.js';
import { updateMultipleObjectivesStatus } from '../utils/objectiveStatus.js';

/**
 * Query SELECT reutilizable para objetivos con relaciones
 */
const OBJECTIVE_SELECT_QUERY = `
  *,
  organizational_units (
    id,
    name,
    type,
    level
  ),
  assigned_to_user:users!objectives_assigned_to_user_id_fkey (
    id,
    name,
    email
  ),
  users!objectives_created_by_fkey (
    id,
    name,
    email
  ),
  completed_by_user:users!objectives_completed_by_fkey (
    id,
    name,
    email
  )
`;

/**
 * Obtener todos los objetivos según permisos del usuario
 * @param {Object} user - Usuario que hace la petición
 * @param {Object} filters - Filtros opcionales
 */
const getAll = async (user, filters = {}) => {
  try {
    let query = supabase
      .from('objectives')
      .select(OBJECTIVE_SELECT_QUERY)
      .order('created_at', { ascending: false });

    // Filtrar según permisos RBAC
    const canViewAll = await permissionsService.userCan(user.id, 'objectives', 'view', 'all');
    const canViewTeam = await permissionsService.userCan(user.id, 'objectives', 'view', 'team');
    
    if (!canViewAll) {
      if (canViewTeam) {
        // Ver solo objetivos de su equipo
        query = query.eq('organizational_unit_id', user.organizational_unit_id);
      } else {
        // Ver solo objetivos propios (asignados o personales)
        query = query.eq('assigned_to_user_id', user.id);
      }
    }

    // Filtros opcionales
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.objective_type) {
      query = query.eq('objective_type', filters.objective_type);
    }

    if (filters.organizational_unit_id) {
      query = query.eq('organizational_unit_id', filters.organizational_unit_id);
    }

    if (filters.assigned_to_user_id) {
      query = query.eq('assigned_to_user_id', filters.assigned_to_user_id);
    }

    if (filters.start_date) {
      query = query.gte('start_date', filters.start_date);
    }

    if (filters.end_date) {
      query = query.lte('end_date', filters.end_date);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error de base de datos al obtener objetivos:', error);
      throw error; // El errorHandler lo formateará
    }

    // Enriquecer objetivos con horas completadas
    const enrichedObjectives = await enrichObjectivesWithHours(data || []);

    // Actualizar estados automáticamente según fechas
    const objectivesWithStatus = updateMultipleObjectivesStatus(enrichedObjectives);

    logger.info(`Objetivos obtenidos: ${objectivesWithStatus?.length || 0} registros`);
    return objectivesWithStatus;
  } catch (error) {
    logger.error('Error en getAll objectives:', error);
    throw error; // Propagar el error para que el errorHandler lo maneje
  }
};

/**
 * Obtener un objetivo por ID
 */
const getById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('objectives')
      .select(OBJECTIVE_SELECT_QUERY)
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Error al obtener objetivo:', error);
      throw new NotFoundError('Objetivo no encontrado');
    }

    return data;
  } catch (error) {
    logger.error('Error en getById objectives:', error);
    throw error;
  }
};

/**
 * Crear un nuevo objetivo
 */
const create = async (objectiveData, userId) => {
  try {
    // Si es objetivo ASIGNADO, cancelar objetivos personales activos del usuario
    if (objectiveData.objective_type === OBJECTIVE_TYPES.ASSIGNED && 
        objectiveData.assigned_to_user_id) {
      
      logger.info('Cancelando objetivos personales activos del usuario:', objectiveData.assigned_to_user_id);
      
      const { error: cancelError } = await supabase
        .from('objectives')
        .update({ 
          status: OBJECTIVE_STATUS.CANCELLED,
          completion_notes: 'Cancelado automáticamente: objetivo asignado por supervisor'
        })
        .eq('assigned_to_user_id', objectiveData.assigned_to_user_id)
        .eq('objective_type', OBJECTIVE_TYPES.PERSONAL)
        .in('status', [OBJECTIVE_STATUS.PLANNED, OBJECTIVE_STATUS.IN_PROGRESS]);
      
      if (cancelError) {
        logger.warn('Error al cancelar objetivos personales:', cancelError);
        // No lanzamos error, solo advertencia - el objetivo asignado se debe crear igual
      } else {
        logger.info('Objetivos personales cancelados exitosamente');
      }
    }

    // Crear el nuevo objetivo
    const { data, error } = await supabase
      .from('objectives')
      .insert([{
        ...objectiveData,
        created_by: userId,
        status: objectiveData.status || OBJECTIVE_STATUS.PLANNED
      }])
      .select(OBJECTIVE_SELECT_QUERY)
      .single();

    if (error) {
      logger.error('Error al crear objetivo:', error);
      throw new ValidationError('Error al crear objetivo');
    }

    logger.info('Objetivo creado:', { id: data.id, name: data.name, created_by: userId });
    return data;
  } catch (error) {
    logger.error('Error en create objectives:', error);
    throw error;
  }
};

/**
 * Actualizar un objetivo
 */
const update = async (id, objectiveData) => {
  try {
    const { data, error } = await supabase
      .from('objectives')
      .update(objectiveData)
      .eq('id', id)
      .select(OBJECTIVE_SELECT_QUERY)
      .single();

    if (error) {
      logger.error('Error al actualizar objetivo:', error);
      throw new ValidationError('Error al actualizar objetivo');
    }

    logger.info('Objetivo actualizado:', { id: data.id, name: data.name });
    return data;
  } catch (error) {
    logger.error('Error en update objectives:', error);
    throw error;
  }
};

/**
 * Marcar objetivo como completado/no completado
 */
const markCompletion = async (id, completionData, userId) => {
  try {
    const { data, error } = await supabase
      .from('objectives')
      .update({
        is_completed: completionData.is_completed,
        completion_notes: completionData.completion_notes || null,
        completed_at: new Date().toISOString(),
        completed_by: userId,
        status: OBJECTIVE_STATUS.COMPLETED
      })
      .eq('id', id)
      .select(OBJECTIVE_SELECT_QUERY)
      .single();

    if (error) {
      logger.error('Error al marcar cumplimiento:', error);
      throw new ValidationError('Error al marcar cumplimiento');
    }

    logger.info('Objetivo marcado como completado:', { 
      id: data.id, 
      is_completed: data.is_completed,
      completed_by: userId 
    });
    return data;
  } catch (error) {
    logger.error('Error en markCompletion objectives:', error);
    throw error;
  }
};

/**
 * Eliminar un objetivo
 */
const remove = async (id) => {
  try {
    const { error } = await supabase
      .from('objectives')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error al eliminar objetivo:', error);
      throw new NotFoundError('Error al eliminar objetivo');
    }

    logger.info('Objetivo eliminado:', { id });
    return { success: true };
  } catch (error) {
    logger.error('Error en remove objectives:', error);
    throw error;
  }
};

/**
 * Obtener análisis de un objetivo (horas reales vs objetivo)
 */
const getAnalysis = async (id) => {
  try {
    // Obtener el objetivo
    const objective = await getById(id);

    // Obtener horas reales del período
    const { data: timeEntries, error } = await supabase
      .from('time_entries')
      .select('total_hours, start_time, end_time, user_id, users(name)')
      .eq('organizational_unit_id', objective.organizational_unit_id)
      .gte('start_time', objective.start_date)
      .lte('start_time', objective.end_date);

    if (error) {
      logger.error('Error al obtener time entries para análisis:', error);
      throw new ValidationError('Error al calcular análisis');
    }

    // Calcular métricas
    const totalHoursReal = timeEntries.reduce((sum, entry) => sum + (entry.total_hours || 0), 0);
    const totalEntries = timeEntries.length;
    const uniqueUsers = new Set(timeEntries.map(e => e.user_id)).size;

    // Calcular diferencia
    const hoursDifference = totalHoursReal - objective.target_hours;
    const percentageOfTarget = objective.target_hours > 0 
      ? (totalHoursReal / objective.target_hours) * 100 
      : 0;

    // Determinar diagnóstico
    let diagnosis = null;
    if (objective.is_completed !== null) {
      if (objective.is_completed && hoursDifference < 0) {
        diagnosis = OBJECTIVE_DIAGNOSIS.EFFICIENT_SUCCESS;
      } else if (objective.is_completed && hoursDifference >= 0) {
        diagnosis = OBJECTIVE_DIAGNOSIS.COSTLY_SUCCESS;
      } else if (!objective.is_completed && hoursDifference < 0) {
        diagnosis = OBJECTIVE_DIAGNOSIS.INCOMPLETE_FAILURE;
      } else if (!objective.is_completed && hoursDifference >= 0) {
        diagnosis = OBJECTIVE_DIAGNOSIS.TOTAL_FAILURE;
      }
    }

    return {
      objective,
      metrics: {
        target_hours: objective.target_hours,
        real_hours: parseFloat(totalHoursReal.toFixed(2)),
        hours_difference: parseFloat(hoursDifference.toFixed(2)),
        percentage_of_target: parseFloat(percentageOfTarget.toFixed(1)),
        total_entries: totalEntries,
        unique_users: uniqueUsers
      },
      diagnosis,
      time_entries: timeEntries
    };
  } catch (error) {
    logger.error('Error en getAnalysis objectives:', error);
    throw error;
  }
};

/**
 * Obtener distribución semanal de un objetivo
 */
const getWeeklySchedule = async (objectiveId) => {
  try {
    const { data, error } = await supabase
      .from('objective_weekly_schedule')
      .select('*')
      .eq('objective_id', objectiveId)
      .order('day_of_week', { ascending: true });

    if (error) {
      logger.error('Error al obtener distribución semanal:', error);
      throw new NotFoundError('Error al obtener distribución semanal');
    }

    return data;
  } catch (error) {
    logger.error('Error en getWeeklySchedule:', error);
    throw error;
  }
};

/**
 * Guardar distribución semanal de un objetivo
 * @param {string} objectiveId - ID del objetivo
 * @param {Array} schedule - Array de objetos con day_of_week, hours_allocated, start_time, end_time
 */
const saveWeeklySchedule = async (objectiveId, schedule) => {
  try {
    // Eliminar distribución existente
    await supabase
      .from('objective_weekly_schedule')
      .delete()
      .eq('objective_id', objectiveId);

    // Insertar nueva distribución
    if (schedule && schedule.length > 0) {
      const scheduleData = schedule.map(day => ({
        objective_id: objectiveId,
        day_of_week: day.day_of_week,
        hours_allocated: day.hours_allocated,
        start_time: day.start_time || null,
        end_time: day.end_time || null,
        is_active: day.is_active !== false
      }));

      const { data, error } = await supabase
        .from('objective_weekly_schedule')
        .insert(scheduleData)
        .select();

      if (error) {
        logger.error('Error al guardar distribución semanal:', error);
        throw new ValidationError('Error al guardar distribución semanal');
      }

      logger.info('Distribución semanal guardada:', { objectiveId, days: data.length });
      return data;
    }

    return [];
  } catch (error) {
    logger.error('Error en saveWeeklySchedule:', error);
    throw error;
  }
};

/**
 * Verificar si un usuario ya tiene un objetivo asignado activo
 */
const userHasActiveAssignedObjective = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('objectives')
      .select('id')
      .eq('assigned_to_user_id', userId)
      .eq('objective_type', OBJECTIVE_TYPES.ASSIGNED)
      .in('status', [OBJECTIVE_STATUS.PLANNED, OBJECTIVE_STATUS.IN_PROGRESS])
      .limit(1);

    if (error) {
      logger.error('Error al verificar objetivo asignado:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    logger.error('Error en userHasActiveAssignedObjective:', error);
    return false;
  }
};

/**
 * Validar que un usuario puede crear un objetivo personal
 * Solo puede si NO tiene un objetivo asignado activo
 */
const canCreatePersonalObjective = async (userId) => {
  const hasAssigned = await userHasActiveAssignedObjective(userId);
  return !hasAssigned;
};

export {
  getAll,
  getById,
  create,
  update,
  markCompletion,
  remove,
  getAnalysis,
  getWeeklySchedule,
  saveWeeklySchedule,
  userHasActiveAssignedObjective,
  canCreatePersonalObjective
};
