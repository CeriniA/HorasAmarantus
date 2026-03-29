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
import logger from '../utils/logger.js';

/**
 * GET /api/users
 */
const getAll = async (req, res) => {
  try {
    const users = await usersService.getAll(req.user);
    res.json({ users });
  } catch (error) {
    logger.error('Error en getAll users controller:', error);
    res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
};

/**
 * GET /api/users/:id
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await usersService.getById(id, req.user);
    res.json({ user });
  } catch (error) {
    logger.error('Error en getById users controller:', error);
    
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'No tienes permisos') {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

/**
 * POST /api/users
 */
const create = async (req, res) => {
  try {
    const user = await usersService.create(req.body);
    res.status(201).json({ user });
  } catch (error) {
    logger.error('Error en create users controller:', error);
    res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
};

/**
 * PUT /api/users/:id
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await usersService.update(id, req.body, req.user);
    res.json({ user });
  } catch (error) {
    logger.error('Error en update users controller:', error);
    
    if (error.message === 'No tienes permisos' || 
        error.message.includes('gestionar usuarios')) {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
};

/**
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await usersService.deleteUser(id);
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    logger.error('Error en delete users controller:', error);
    res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  deleteUser
};
