/**
 * ============================================
 * MIDDLEWARE DE AUTENTICACIÓN JWT
 * ============================================
 * 
 * Manejo completo de autenticación con JWT.
 * Incluye verificación de tokens, roles y permisos.
 * 
 * Uso:
 *   import { authenticate, requireRole } from './middleware/auth.js';
 *   router.get('/admin', authenticate, requireRole('admin'), handler);
 */

import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { USER_ROLES, hasRole } from '../config/constants.js';
import { AuthenticationError, AuthorizationError } from './errorHandler.js';

/**
 * ============================================
 * GENERACIÓN DE TOKENS
 * ============================================
 */

/**
 * Genera un access token JWT
 * @param {Object} payload - Datos del usuario
 * @returns {string} Token JWT
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Genera un refresh token JWT
 * @param {Object} payload - Datos del usuario
 * @returns {string} Refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

/**
 * Genera ambos tokens (access y refresh)
 * @param {Object} user - Usuario autenticado
 * @returns {Object} { accessToken, refreshToken }
 */
export const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

/**
 * ============================================
 * VERIFICACIÓN DE TOKENS
 * ============================================
 */

/**
 * Verifica un token JWT
 * @param {string} token - Token a verificar
 * @returns {Object} Payload decodificado
 * @throws {AuthenticationError} Si el token es inválido
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Token expirado');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new AuthenticationError('Token inválido');
    }
    throw new AuthenticationError('Error al verificar token');
  }
};

/**
 * Extrae el token del header Authorization
 * @param {Object} req - Request de Express
 * @returns {string|null} Token extraído o null
 */
export const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }

  // Formato: "Bearer TOKEN"
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * ============================================
 * MIDDLEWARE DE AUTENTICACIÓN
 * ============================================
 */

/**
 * Middleware para verificar que el usuario está autenticado
 * Agrega req.user con los datos del usuario
 */
export const authenticate = (req, res, next) => {
  try {
    // Extraer token
    const token = extractToken(req);
    
    if (!token) {
      throw new AuthenticationError('Token no proporcionado');
    }

    // Verificar token
    const decoded = verifyToken(token);

    // Agregar usuario al request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware opcional de autenticación
 * No lanza error si no hay token, solo agrega req.user si existe
 */
export const optionalAuth = (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (token) {
      const decoded = verifyToken(token);
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
    }

    next();
  } catch (error) {
    // Ignorar errores de autenticación en modo opcional
    next();
  }
};

/**
 * ============================================
 * MIDDLEWARE DE AUTORIZACIÓN (ROLES)
 * ============================================
 */

/**
 * Middleware para verificar que el usuario tiene un rol específico
 * @param {string} requiredRole - Rol requerido
 * @returns {Function} Middleware
 */
export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    try {
      // Verificar que el usuario está autenticado
      if (!req.user) {
        throw new AuthenticationError('Usuario no autenticado');
      }

      // Verificar rol
      if (!hasRole(req.user.role, requiredRole)) {
        throw new AuthorizationError(
          `Se requiere rol ${requiredRole} o superior`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware para verificar que el usuario es admin
 */
export const requireAdmin = requireRole(USER_ROLES.ADMIN);

/**
 * Middleware para verificar que el usuario es superadmin
 */
export const requireSuperadmin = requireRole(USER_ROLES.SUPERADMIN);

/**
 * ============================================
 * MIDDLEWARE DE OWNERSHIP
 * ============================================
 */

/**
 * Middleware para verificar que el usuario es dueño del recurso
 * o tiene permisos de admin
 * @param {string} paramName - Nombre del parámetro con el ID del usuario
 * @returns {Function} Middleware
 */
export const requireOwnership = (paramName = 'userId') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Usuario no autenticado');
      }

      const resourceUserId = req.params[paramName];

      // Admin puede acceder a todo
      if (hasRole(req.user.role, USER_ROLES.ADMIN)) {
        return next();
      }

      // Usuario debe ser el dueño
      if (req.user.id !== resourceUserId) {
        throw new AuthorizationError(
          'No tienes permisos para acceder a este recurso'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * ============================================
 * HELPERS
 * ============================================
 */

/**
 * Decodifica un token sin verificar (útil para debugging)
 * @param {string} token - Token a decodificar
 * @returns {Object} Payload decodificado
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};

/**
 * Verifica si un token está expirado
 * @param {string} token - Token a verificar
 * @returns {boolean} true si está expirado
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    return decoded.exp < Date.now() / 1000;
  } catch {
    return true;
  }
};

/**
 * Obtiene el tiempo restante de un token en segundos
 * @param {string} token - Token a verificar
 * @returns {number} Segundos restantes o 0 si expiró
 */
export const getTokenTimeRemaining = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return 0;
    }
    const remaining = decoded.exp - Date.now() / 1000;
    return remaining > 0 ? remaining : 0;
  } catch {
    return 0;
  }
};

/**
 * ============================================
 * EXPORT DEFAULT
 * ============================================
 */
export default {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyToken,
  extractToken,
  authenticate,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireSuperadmin,
  requireOwnership,
  decodeToken,
  isTokenExpired,
  getTokenTimeRemaining,
};
