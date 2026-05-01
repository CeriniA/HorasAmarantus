/**
 * Rutas de Objetivos
 * Solo accesibles para administradores y superadministradores
 */

import express from 'express';
import * as objectivesController from '../controllers/objectives.controller.js';
import { authenticate } from '../middleware/auth.js';
import { checkPermission, checkAnyPermission } from '../middleware/permissions.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * GET /api/objectives
 * Obtener todos los objetivos (con filtros opcionales)
 * Query params: status, organizational_unit_id, start_date, end_date
 * Permite ver todos (admin) o solo propios (operario)
 */
router.get('/', 
  checkAnyPermission([
    { resource: 'objectives', action: 'view', scope: 'all' },
    { resource: 'objectives', action: 'view', scope: 'team' },
    { resource: 'objectives', action: 'view', scope: 'own' }
  ]),
  objectivesController.getAllObjectives
);

/**
 * GET /api/objectives/:id
 * Obtener un objetivo por ID
 */
router.get('/:id',
  checkPermission('objectives', 'view', 'all'),
  objectivesController.getObjectiveById
);

/**
 * GET /api/objectives/:id/analysis
 * Obtener análisis de un objetivo (horas reales vs objetivo)
 */
router.get('/:id/analysis',
  checkPermission('objectives', 'view', 'all'),
  objectivesController.getObjectiveAnalysis
);

/**
 * POST /api/objectives
 * Crear un nuevo objetivo
 * Permite crear si tiene permiso para company, assigned o personal
 */
router.post('/',
  checkAnyPermission([
    { resource: 'objectives', action: 'create', scope: 'company' },
    { resource: 'objectives', action: 'create', scope: 'assigned' },
    { resource: 'objectives', action: 'create', scope: 'personal' }
  ]),
  objectivesController.createObjective
);

/**
 * PUT /api/objectives/:id
 * Actualizar un objetivo
 * Permite actualizar todos (admin) o solo propios (operario)
 */
router.put('/:id',
  checkAnyPermission([
    { resource: 'objectives', action: 'update', scope: 'all' },
    { resource: 'objectives', action: 'update', scope: 'own' }
  ]),
  objectivesController.updateObjective
);

/**
 * POST /api/objectives/:id/complete
 * Marcar objetivo como completado/no completado
 */
router.post('/:id/complete',
  checkPermission('objectives', 'update', 'all'),
  objectivesController.markObjectiveCompletion
);

/**
 * DELETE /api/objectives/:id
 * Eliminar un objetivo
 * Permite eliminar todos (admin) o solo propios (operario)
 */
router.delete('/:id',
  checkAnyPermission([
    { resource: 'objectives', action: 'delete', scope: 'all' },
    { resource: 'objectives', action: 'delete', scope: 'own' }
  ]),
  objectivesController.deleteObjective
);

/**
 * GET /api/objectives/:id/schedule
 * Obtener distribución semanal de un objetivo
 */
router.get('/:id/schedule',
  checkPermission('objectives', 'view', 'all'),
  objectivesController.getObjectiveSchedule
);

/**
 * POST /api/objectives/:id/schedule
 * Guardar distribución semanal de un objetivo
 */
router.post('/:id/schedule',
  checkPermission('objectives', 'update', 'all'),
  objectivesController.saveObjectiveSchedule
);

/**
 * GET /api/objectives/user/:userId/can-create-personal
 * Verificar si un usuario puede crear un objetivo personal
 */
router.get('/user/:userId/can-create-personal',
  objectivesController.canUserCreatePersonal
);

export default router;
