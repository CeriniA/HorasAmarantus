/**
 * Time Entries Routes
 * 
 * Responsabilidad: SOLO definir endpoints HTTP
 * - NO lógica de negocio
 * - NO acceso a base de datos
 * - Solo middleware y delegación a controller
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { checkAnyPermission, checkResourceAccess } from '../middleware/permissions.js';
import { validateCreateTimeEntry, validateUpdateTimeEntry } from '../middleware/validators.js';
import timeEntriesController from '../controllers/timeEntries.controller.js';
import timeEntriesService from '../services/timeEntries.service.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/time-entries - Obtener registros según permisos RBAC
router.get('/', timeEntriesController.getAll);

// POST /api/time-entries - Crear registro (requiere permiso create.own como mínimo)
router.post('/', 
  checkAnyPermission([
    { resource: 'time_entries', action: 'create', scope: 'all' },
    { resource: 'time_entries', action: 'create', scope: 'own' }
  ]),
  validateCreateTimeEntry, 
  timeEntriesController.create
);

// PUT /api/time-entries/:id - Actualizar registro (verifica acceso al recurso)
router.put('/:id', 
  checkResourceAccess('time_entries', 'update', async (req) => {
    return await timeEntriesService.getById(req.params.id);
  }),
  validateUpdateTimeEntry, 
  timeEntriesController.update
);

// POST /api/time-entries/bulk - Crear múltiples registros
router.post('/bulk', 
  checkAnyPermission([
    { resource: 'time_entries', action: 'create', scope: 'all' },
    { resource: 'time_entries', action: 'create', scope: 'own' }
  ]),
  timeEntriesController.createBulk
);

// DELETE /api/time-entries/bulk - Eliminar múltiples registros
router.delete('/bulk', 
  checkAnyPermission([
    { resource: 'time_entries', action: 'delete', scope: 'all' },
    { resource: 'time_entries', action: 'delete', scope: 'own' }
  ]),
  timeEntriesController.deleteBulk
);

// DELETE /api/time-entries/:id - Eliminar registro (verifica acceso al recurso)
router.delete('/:id', 
  checkResourceAccess('time_entries', 'delete', async (req) => {
    return await timeEntriesService.getById(req.params.id);
  }),
  timeEntriesController.deleteOne
);

export default router;
