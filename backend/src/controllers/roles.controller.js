/**
 * Roles Controller
 * 
 * Responsabilidad: Orquestar requests HTTP para roles
 * - Validar request
 * - Llamar a service
 * - Formatear response
 */

import { asyncHandler } from '../middleware/errorHandler.js';
import rolesService from '../services/roles.service.js';

/**
 * GET /api/roles
 * Obtener todos los roles
 */
const getAll = asyncHandler(async (req, res) => {
  const roles = await rolesService.getAll();
  res.json({ roles });
});

/**
 * GET /api/roles/:id
 * Obtener un rol por ID
 */
const getById = asyncHandler(async (req, res) => {
  const role = await rolesService.getById(req.params.id);
  res.json({ role });
});

/**
 * GET /api/roles/:id/permissions
 * Obtener permisos de un rol
 */
const getRolePermissions = asyncHandler(async (req, res) => {
  const permissions = await rolesService.getRolePermissions(req.params.id);
  res.json({ permissions });
});

/**
 * POST /api/roles
 * Crear nuevo rol
 */
const create = asyncHandler(async (req, res) => {
  const role = await rolesService.create(req.body);
  res.status(201).json({ role });
});

/**
 * PUT /api/roles/:id
 * Actualizar rol
 */
const update = asyncHandler(async (req, res) => {
  const role = await rolesService.update(req.params.id, req.body);
  res.json({ role });
});

/**
 * DELETE /api/roles/:id
 * Eliminar rol
 */
const deleteRole = asyncHandler(async (req, res) => {
  await rolesService.deleteRole(req.params.id);
  res.json({ message: 'Rol eliminado correctamente' });
});

/**
 * POST /api/roles/:id/permissions
 * Asignar permiso a rol
 */
const assignPermission = asyncHandler(async (req, res) => {
  const { permissionId } = req.body;
  await rolesService.assignPermission(req.params.id, permissionId);
  res.json({ message: 'Permiso asignado correctamente' });
});

/**
 * DELETE /api/roles/:id/permissions/:permissionId
 * Remover permiso de rol
 */
const removePermission = asyncHandler(async (req, res) => {
  await rolesService.removePermission(req.params.id, req.params.permissionId);
  res.json({ message: 'Permiso removido correctamente' });
});

/**
 * PUT /api/roles/:id/permissions
 * Actualizar todos los permisos de un rol
 */
const setPermissions = asyncHandler(async (req, res) => {
  const { permissionIds } = req.body;
  await rolesService.setPermissions(req.params.id, permissionIds);
  res.json({ message: 'Permisos actualizados correctamente' });
});

export default {
  getAll,
  getById,
  getRolePermissions,
  create,
  update,
  deleteRole,
  assignPermission,
  removePermission,
  setPermissions
};
