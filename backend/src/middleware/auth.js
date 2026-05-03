import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { verifyToken } from '../config/auth.js';
import logger from '../utils/logger.js';

import permissionsService from '../services/permissions.service.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    // Agregar datos del usuario al request
    req.user = decoded;
    // Cargar permisos efectivos
    req.user.permissions = await permissionsService.getUserWithPermissions(decoded.id);
    next();
  } catch (error) {
    logger.error('Error en autenticación:', error);
    return res.status(401).json({ error: 'Error de autenticación' });
  }
};

export default authenticate;
