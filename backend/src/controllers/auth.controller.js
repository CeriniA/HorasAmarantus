/**
 * Auth Controller
 * 
 * Responsabilidades:
 * - Recibir requests HTTP
 * - Llamar a services
 * - Formatear respuestas
 * - Manejo de errores HTTP
 */

import authService from '../services/auth.service.js';
import logger from '../utils/logger.js';

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    res.json(result);
  } catch (error) {
    logger.error('Error en login controller:', error);
    
    if (error.message === 'Credenciales inválidas') {
      return res.status(401).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user
    });
  } catch (error) {
    logger.error('Error en register controller:', error);
    res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
};

/**
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    res.json({ user });
  } catch (error) {
    logger.error('Error en getCurrentUser controller:', error);
    
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

/**
 * POST /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    logger.error('Error en changePassword controller:', error);
    
    if (error.message.includes('requerida') || error.message.includes('caracteres')) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === 'Contraseña actual incorrecta') {
      return res.status(401).json({ error: error.message });
    }
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

/**
 * PUT /api/auth/me/email
 */
const updateEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await authService.updateEmail(req.user.id, email);
    res.json({ 
      message: 'Email actualizado correctamente',
      user
    });
  } catch (error) {
    logger.error('Error en updateEmail controller:', error);
    
    if (error.message.includes('inválido') || error.message.includes('en uso')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export default {
  login,
  register,
  getCurrentUser,
  changePassword,
  updateEmail
};
