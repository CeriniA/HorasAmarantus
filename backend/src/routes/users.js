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
import { checkPermission, checkResourceAccess } from '../middleware/permissions.js';
import { validateCreateUser, validateUpdateUser } from '../middleware/validators.js';
import usersController from '../controllers/users.controller.js';
import usersService from '../services/users.service.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/users - Obtener usuarios según permisos RBAC
router.get('/', usersController.getAll);

// GET /api/users/:id - Obtener un usuario específico
router.get('/:id', 
  checkResourceAccess('users', 'view', async (req) => {
    return await usersService.getById(req.params.id);
  }),
  usersController.getById
);

// POST /api/users - Crear usuario (requiere permiso users.create.all)
router.post('/', 
  checkPermission('users', 'create', 'all'),
  validateCreateUser, 
  usersController.create
);

// PUT /api/users/:id - Actualizar usuario (verifica acceso al recurso)
router.put('/:id', 
  checkResourceAccess('users', 'update', async (req) => {
    return await usersService.getById(req.params.id);
  }),
  validateUpdateUser, 
  usersController.update
);

// DELETE /api/users/:id - Eliminar usuario (requiere permiso users.delete.all)
router.delete('/:id', 
  checkPermission('users', 'delete', 'all'),
  usersController.deleteUser
);

export default router;
