/**
 * Permissions Controller
 * 
 * Responsabilidades:
 * - Recibir requests HTTP
 * - Llamar a services
 * - Formatear respuestas
 * - Manejo de errores HTTP
 */

import permissionsService from '../services/permissions.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

/**
 * GET /api/permissions
 * Obtener todos los permisos disponibles
 */
const getAll = asyncHandler(async (req, res) => {
  const permissions = await permissionsService.getAllPermissions();
  res.json({ permissions });
});

/**
 * GET /api/permissions/user/:userId
 * Obtener permisos efectivos de un usuario
 */
const getUserPermissions = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const permissionsInfo = await permissionsService.getUserPermissionsInfo(userId);
  res.json(permissionsInfo);
});

/**
 * GET /api/permissions/me
 * Obtener permisos del usuario autenticado
 */
const getMyPermissions = asyncHandler(async (req, res) => {
  const permissionsInfo = await permissionsService.getUserPermissionsInfo(req.user.id);
  res.json(permissionsInfo);
});

/**
 * POST /api/permissions/user/:userId
 * Asignar un permiso individual a un usuario
 * Body: { permissionId, granted }
 */
const assignUserPermission = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { permissionId, granted = true } = req.body;
  
  const result = await permissionsService.assignUserPermission(userId, permissionId, granted);
  
  logger.info(`Permiso ${granted ? 'concedido' : 'revocado'} a usuario ${userId} por ${req.user.username}`);
  
  res.json({ 
    success: true,
    userPermission: result 
  });
});

/**
 * DELETE /api/permissions/user/:userId/:permissionId
 * Remover un permiso individual de un usuario
 */
const removeUserPermission = asyncHandler(async (req, res) => {
  const { userId, permissionId } = req.params;
  
  await permissionsService.removeUserPermission(userId, permissionId);
  
  logger.info(`Permiso removido de usuario ${userId} por ${req.user.username}`);
  
  res.json({ success: true });
});

export default {
  getAll,
  getUserPermissions,
  getMyPermissions,
  assignUserPermission,
  removeUserPermission
};
