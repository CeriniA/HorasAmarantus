/**
 * Users Routes
 * 
 * Responsabilidad: SOLO definir endpoints HTTP
 * - NO lógica de negocio
 * - NO acceso a base de datos
 * - Solo middleware y delegación a controller
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin, canManageUser } from '../middleware/roles.js';
import { validateCreateUser, validateUpdateUser } from '../middleware/validators.js';
import usersController from '../controllers/users.controller.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/users - Obtener usuarios según rol
router.get('/', usersController.getAll);

// GET /api/users/:id - Obtener un usuario
router.get('/:id', usersController.getById);

// POST /api/users - Crear usuario (solo admin/superadmin)
router.post('/', requireAdmin, canManageUser, validateCreateUser, usersController.create);

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', validateUpdateUser, usersController.update);

// DELETE /api/users/:id - Eliminar usuario (solo admin)
router.delete('/:id', requireAdmin, usersController.deleteUser);

export default router;
