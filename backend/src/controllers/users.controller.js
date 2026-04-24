/**
 * Users Controller
 * 
 * Responsabilidades:
 * - Recibir requests HTTP
 * - Llamar a services
 * - Formatear respuestas
 * - Manejo de errores HTTP
 */

import usersService from '../services/users.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * GET /api/users
 * Query params:
 * - includeInactive: boolean - Si true, incluye usuarios inactivos
 */
const getAll = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true';
  const users = await usersService.getAll(req.user, { includeInactive });
  res.json({ users });
});

/**
 * GET /api/users/:id
 */
const getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await usersService.getById(id, req.user);
  res.json({ user });
});

/**
 * POST /api/users
 */
const create = asyncHandler(async (req, res) => {
  const user = await usersService.create(req.body);
  res.status(201).json({ user });
});

/**
 * PUT /api/users/:id
 */
const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await usersService.update(id, req.body, req.user);
  res.json({ user });
});

/**
 * DELETE /api/users/:id
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await usersService.deleteUser(id);
  res.json({ message: 'Usuario eliminado exitosamente' });
});

export default {
  getAll,
  getById,
  create,
  update,
  deleteUser
};
