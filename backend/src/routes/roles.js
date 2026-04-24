/**
 * Roles Routes
 * 
 * Responsabilidad: SOLO definir endpoints HTTP
 * - NO lógica de negocio
 * - Solo middleware y delegación a controller
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permissions.js';
import rolesController from '../controllers/roles.controller.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/roles - Listar roles (requiere permiso roles.view.all)
router.get('/', 
  checkPermission('roles', 'view', 'all'),
  rolesController.getAll
);

// GET /api/roles/:id - Ver rol específico
router.get('/:id', 
  checkPermission('roles', 'view', 'all'),
  rolesController.getById
);

// GET /api/roles/:id/permissions - Ver permisos del rol
router.get('/:id/permissions', 
  checkPermission('roles', 'view', 'all'),
  rolesController.getRolePermissions
);

// POST /api/roles - Crear rol (solo superadmin)
router.post('/', 
  checkPermission('roles', 'manage', 'all'),
  rolesController.create
);

// PUT /api/roles/:id - Actualizar rol (solo superadmin)
router.put('/:id', 
  checkPermission('roles', 'manage', 'all'),
  rolesController.update
);

// DELETE /api/roles/:id - Eliminar rol (solo superadmin)
router.delete('/:id', 
  checkPermission('roles', 'manage', 'all'),
  rolesController.deleteRole
);

// POST /api/roles/:id/permissions - Asignar permiso a rol (solo superadmin)
router.post('/:id/permissions', 
  checkPermission('roles', 'manage', 'all'),
  rolesController.assignPermission
);

// DELETE /api/roles/:id/permissions/:permissionId - Remover permiso de rol (solo superadmin)
router.delete('/:id/permissions/:permissionId', 
  checkPermission('roles', 'manage', 'all'),
  rolesController.removePermission
);

// PUT /api/roles/:id/permissions - Actualizar todos los permisos de un rol (solo superadmin)
router.put('/:id/permissions', 
  checkPermission('roles', 'manage', 'all'),
  rolesController.setPermissions
);

export default router;
