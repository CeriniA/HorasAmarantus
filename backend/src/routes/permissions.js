/**
 * Permissions Routes
 * 
 * Responsabilidad: SOLO definir endpoints HTTP
 * - NO lógica de negocio
 * - NO acceso a base de datos
 * - Solo middleware y delegación a controller
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { canManageRoles } from '../middleware/permissions.js';
import permissionsController from '../controllers/permissions.controller.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/permissions - Obtener todos los permisos disponibles
// Solo superadmin puede ver el catálogo completo
router.get('/', canManageRoles, permissionsController.getAll);

// GET /api/permissions/me - Obtener mis permisos
// Cualquier usuario puede ver sus propios permisos
router.get('/me', permissionsController.getMyPermissions);

// GET /api/permissions/user/:userId - Obtener permisos de un usuario
// Solo superadmin puede ver permisos de otros usuarios
router.get('/user/:userId', canManageRoles, permissionsController.getUserPermissions);

// POST /api/permissions/user/:userId - Asignar permiso a usuario
// Solo superadmin puede asignar permisos individuales
router.post('/user/:userId', canManageRoles, permissionsController.assignUserPermission);

// DELETE /api/permissions/user/:userId/:permissionId - Remover permiso de usuario
// Solo superadmin puede remover permisos individuales
router.delete('/user/:userId/:permissionId', canManageRoles, permissionsController.removeUserPermission);

export default router;
