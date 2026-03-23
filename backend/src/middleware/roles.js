/**
 * Middleware para verificar roles
 * Sistema de 3 roles: superadmin, admin, operario
 */

import { USER_ROLES } from '../models/constants.js';

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'No tienes permisos para realizar esta acción',
        requiredRoles: allowedRoles,
        yourRole: req.user.role
      });
    }

    next();
  };
};

/**
 * Verificar si el usuario puede gestionar a otro usuario
 */
export const canManageUser = (req, res, next) => {
  const { role: userRole } = req.user;
  const { role: targetRole } = req.body;

  // Superadmin puede gestionar a todos
  if (userRole === USER_ROLES.SUPERADMIN) {
    return next();
  }

  // Admin NO puede crear/editar otros admins o superadmins
  if (userRole === USER_ROLES.ADMIN) {
    if (targetRole === USER_ROLES.SUPERADMIN || targetRole === USER_ROLES.ADMIN) {
      return res.status(403).json({ 
        error: 'No puedes gestionar usuarios con rol admin o superadmin' 
      });
    }
    return next();
  }

  // Operarios no pueden gestionar usuarios
  return res.status(403).json({ 
    error: 'No tienes permisos para gestionar usuarios' 
  });
};

// Shortcuts comunes
export const requireSuperadmin = requireRole(USER_ROLES.SUPERADMIN);
export const requireAdmin = requireRole(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN);
export const requireAnyAuth = requireRole(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN, USER_ROLES.OPERARIO);

export default { 
  requireRole, 
  requireSuperadmin,
  requireAdmin, 
  requireAnyAuth,
  canManageUser
};
