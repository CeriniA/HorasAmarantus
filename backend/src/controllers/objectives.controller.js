/**
 * Controlador de Objetivos
 * Maneja las peticiones HTTP para el CRUD de objetivos
 */

import * as objectivesService from '../services/objectives.service.js';
import logger from '../utils/logger.js';
import { asyncHandler, ValidationError } from '../middleware/errorHandler.js';

/**
 * GET /api/objectives
 * Obtener todos los objetivos (con filtros opcionales)
 */
const getAllObjectives = asyncHandler(async (req, res) => {
  const user = req.user;
  const filters = {
    status: req.query.status,
    objective_type: req.query.objective_type,
    organizational_unit_id: req.query.organizational_unit_id,
    assigned_to_user_id: req.query.assigned_to_user_id,
    start_date: req.query.start_date,
    end_date: req.query.end_date
  };

  const objectives = await objectivesService.getAll(user, filters);
  logger.info(`Objetivos retornados: ${objectives.length}`);
  res.json(objectives);
});

/**
 * GET /api/objectives/:id
 * Obtener un objetivo por ID
 */
const getObjectiveById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const objective = await objectivesService.getById(id);
  res.json(objective);
});

/**
 * POST /api/objectives
 * Crear un nuevo objetivo
 */
const createObjective = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const objectiveData = req.body;

  // Validaciones básicas
  if (!objectiveData.name || !objectiveData.start_date || !objectiveData.end_date || 
      !objectiveData.target_hours) {
    throw new ValidationError('Faltan campos requeridos: name, start_date, end_date, target_hours');
  }

  // organizational_unit_id es requerido solo para objetivos de empresa
  // success_criteria es opcional

  // Validar que target_hours sea positivo
  if (objectiveData.target_hours <= 0) {
    throw new ValidationError('Las horas objetivo deben ser mayores a 0');
  }

  // Validar que end_date >= start_date
  if (new Date(objectiveData.end_date) < new Date(objectiveData.start_date)) {
    throw new ValidationError('La fecha de fin debe ser posterior a la fecha de inicio');
  }

  const objective = await objectivesService.create(objectiveData, userId);
  res.status(201).json(objective);
});

/**
 * PUT /api/objectives/:id
 * Actualizar un objetivo
 */
const updateObjective = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const objectiveData = req.body;

  // Validar que no se intente modificar campos de auditoría
  delete objectiveData.created_by;
  delete objectiveData.created_at;
  delete objectiveData.updated_at;

  // Si se está actualizando target_hours, validar que sea positivo
  if (objectiveData.target_hours !== undefined && objectiveData.target_hours <= 0) {
    throw new ValidationError('Las horas objetivo deben ser mayores a 0');
  }

  // Si se están actualizando fechas, validar rango
  if (objectiveData.start_date && objectiveData.end_date) {
    if (new Date(objectiveData.end_date) < new Date(objectiveData.start_date)) {
      throw new ValidationError('La fecha de fin debe ser posterior a la fecha de inicio');
    }
  }

  const objective = await objectivesService.update(id, objectiveData);
  res.json(objective);
});

/**
 * POST /api/objectives/:id/complete
 * Marcar objetivo como completado/no completado
 */
const markObjectiveCompletion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { is_completed, completion_notes } = req.body;

  // Validar que is_completed sea booleano
  if (typeof is_completed !== 'boolean') {
    throw new ValidationError('El campo is_completed debe ser true o false');
  }

  const objective = await objectivesService.markCompletion(
    id, 
    { is_completed, completion_notes }, 
    userId
  );
  res.json(objective);
});

/**
 * DELETE /api/objectives/:id
 * Eliminar un objetivo
 */
const deleteObjective = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await objectivesService.remove(id);
  res.json({ message: 'Objetivo eliminado correctamente' });
});

/**
 * GET /api/objectives/:id/analysis
 * Obtener análisis de un objetivo (horas reales vs objetivo)
 */
const getObjectiveAnalysis = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const analysis = await objectivesService.getAnalysis(id);
  res.json(analysis);
});

/**
 * GET /api/objectives/:id/schedule
 * Obtener distribución semanal de un objetivo
 */
const getObjectiveSchedule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const schedule = await objectivesService.getWeeklySchedule(id);
  logger.info(`Distribución semanal obtenida para objetivo ${id}`);
  res.json(schedule);
});

/**
 * POST /api/objectives/:id/schedule
 * Guardar distribución semanal de un objetivo
 */
const saveObjectiveSchedule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { schedule } = req.body;

  if (!Array.isArray(schedule)) {
    throw new ValidationError('El campo schedule debe ser un array');
  }

  const savedSchedule = await objectivesService.saveWeeklySchedule(id, schedule);
  logger.info(`Distribución semanal guardada para objetivo ${id}: ${schedule.length} días`);
  res.json(savedSchedule);
});

/**
 * GET /api/objectives/user/:userId/can-create-personal
 * Verificar si un usuario puede crear un objetivo personal
 */
const canUserCreatePersonal = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const canCreate = await objectivesService.canCreatePersonalObjective(userId);
  logger.info(`Usuario ${userId} puede crear objetivo personal: ${canCreate}`);
  res.json({ canCreate });
});

export {
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
