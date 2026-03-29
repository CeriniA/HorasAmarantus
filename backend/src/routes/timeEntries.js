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
import { validateCreateTimeEntry, validateUpdateTimeEntry } from '../middleware/validators.js';
import timeEntriesController from '../controllers/timeEntries.controller.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/time-entries - Obtener registros según rol
router.get('/', timeEntriesController.getAll);

// POST /api/time-entries - Crear registro
router.post('/', validateCreateTimeEntry, timeEntriesController.create);

// PUT /api/time-entries/:id - Actualizar registro
router.put('/:id', validateUpdateTimeEntry, timeEntriesController.update);

// POST /api/time-entries/bulk - Crear múltiples registros
router.post('/bulk', timeEntriesController.createBulk);

// DELETE /api/time-entries/bulk - Eliminar múltiples registros
router.delete('/bulk', timeEntriesController.deleteBulk);

// DELETE /api/time-entries/:id - Eliminar registro
router.delete('/:id', timeEntriesController.deleteOne);

export default router;
