/**
 * Servicio de Objetivos (Frontend)
 * Comunicación con la API de objectives
 */

import api from './api';

/**
 * Obtener todos los objetivos
 */
export const getAllObjectives = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.organizational_unit_id) params.append('organizational_unit_id', filters.organizational_unit_id);
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);

  const queryString = params.toString();
  const url = queryString ? `/objectives?${queryString}` : '/objectives';
  
  const data = await api.get(url);
  return data; // api.get ya devuelve data directamente
};

/**
 * Obtener un objetivo por ID
 */
export const getObjectiveById = async (id) => {
  const data = await api.get(`/objectives/${id}`);
  return data;
};

/**
 * Crear un nuevo objetivo
 */
export const createObjective = async (objectiveData) => {
  const data = await api.post('/objectives', objectiveData);
  return data;
};

/**
 * Actualizar un objetivo
 */
export const updateObjective = async (id, objectiveData) => {
  const data = await api.put(`/objectives/${id}`, objectiveData);
  return data;
};

/**
 * Marcar objetivo como completado/no completado
 */
export const markObjectiveCompletion = async (id, completionData) => {
  const data = await api.post(`/objectives/${id}/complete`, completionData);
  return data;
};

/**
 * Eliminar un objetivo
 */
export const deleteObjective = async (id) => {
  const data = await api.delete(`/objectives/${id}`);
  return data;
};

/**
 * Obtener análisis de un objetivo
 */
export const getObjectiveAnalysis = async (id) => {
  const data = await api.get(`/objectives/${id}/analysis`);
  return data;
};

/**
 * Obtener distribución semanal de un objetivo
 */
export const getObjectiveSchedule = async (id) => {
  const data = await api.get(`/objectives/${id}/schedule`);
  return data;
};

/**
 * Guardar distribución semanal de un objetivo
 */
export const saveObjectiveSchedule = async (id, schedule) => {
  const data = await api.post(`/objectives/${id}/schedule`, { schedule });
  return data;
};

/**
 * Verificar si un usuario puede crear un objetivo personal
 */
export const canUserCreatePersonal = async (userId) => {
  const data = await api.get(`/objectives/user/${userId}/can-create-personal`);
  return data;
};

export default {
  getAllObjectives,
  getObjectiveById,
  createObjective,
  updateObjective,
  markObjectiveCompletion,
  deleteObjective,
  getObjectiveAnalysis,
  getObjectiveSchedule,
  saveObjectiveSchedule,
  canUserCreatePersonal
};
