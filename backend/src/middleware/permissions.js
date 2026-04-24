/**
 * Middleware de Permisos RBAC
 * 
 * Responsabilidades:
 * - Verificar permisos granulares
 * - Validar acceso a recursos
 * - Considerar alcances (all, team, own)
 */

import permissionsService from '../services/permissions.service.js';
import { RESOURCES, ACTIONS, SCOPES } from '../models/constants.js';
import logger from '../utils/logger.js';

/**
 * Middleware para verificar un permiso específico
 * @param {string} resource - Recurso (users, time_entries, etc.)
 * @param {string} action - Acción (view, create, update, delete)
 * @param {string} scope - Alcance (all, team, own) - default: 'all'
 * @returns {Function} Middleware function
 * 
 * @example
 * router.get('/users', authenticate, checkPermission('users', 'view', 'all'), controller.getAll);
 */
export const checkPermission = (resource, action, scope = SCOPES.ALL) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const hasPermission = await permissionsService.userCan(
        req.user.id,
        resource,
        action,
        scope
      );

      if (!hasPermission) {
        logger.warn(`Permiso denegado: ${req.user.username} intentó ${action} en ${resource} (scope: ${scope})`);
        return res.status(403).json({ 
          error: 'No tienes permisos para realizar esta acción',
          required: `${resource}.${action}.${scope}`
        });
      }

      next();
    } catch (error) {
      logger.error('Error verificando permiso:', error);
      return res.status(500).json({ error: 'Error verificando permisos' });
    }
  };
};

/**
 * Middleware para verificar múltiples permisos (OR logic)
 * El usuario debe tener AL MENOS UNO de los permisos especificados
 * @param {Array<{resource, action, scope}>} permissions - Array de permisos
 * @returns {Function} Middleware function
 * 
 * @example
 * router.get('/entries', authenticate, checkAnyPermission([
 *   { resource: 'time_entries', action: 'view', scope: 'all' },
 *   { resource: 'time_entries', action: 'view', scope: 'team' }
 * ]), controller.getAll);
 */
export const checkAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      // Verificar si tiene alguno de los permisos
      const checks = await Promise.all(
        permissions.map(({ resource, action, scope = SCOPES.ALL }) =>
          permissionsService.userCan(req.user.id, resource, action, scope)
        )
      );

      const hasAnyPermission = checks.some(check => check === true);

      if (!hasAnyPermission) {
        logger.warn(`Permiso denegado: ${req.user.username} no tiene ninguno de los permisos requeridos`);
        return res.status(403).json({ 
          error: 'No tienes permisos para realizar esta acción',
          requiredAny: permissions.map(p => `${p.resource}.${p.action}.${p.scope || 'all'}`)
        });
      }

      next();
    } catch (error) {
      logger.error('Error verificando permisos:', error);
      return res.status(500).json({ error: 'Error verificando permisos' });
    }
  };
};

/**
 * Middleware para verificar acceso a un recurso específico
 * Considera ownership y team membership
 * @param {string} resource - Recurso
 * @param {string} action - Acción
 * @param {Function} getTargetResource - Función para obtener el recurso objetivo
 * @returns {Function} Middleware function
 * 
 * @example
 * router.put('/users/:id', authenticate, checkResourceAccess(
 *   'users', 
 *   'update',
 *   async (req) => await usersService.getById(req.params.id)
 * ), controller.update);
 */
export const checkResourceAccess = (resource, action, getTargetResource) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      // Obtener el recurso objetivo
      const targetResource = await getTargetResource(req);

      if (!targetResource) {
        return res.status(404).json({ error: 'Recurso no encontrado' });
      }

      // Verificar acceso
      const hasAccess = await permissionsService.canAccessResource(
        req.user.id,
        resource,
        action,
        targetResource
      );

      if (!hasAccess) {
        logger.warn(`Acceso denegado: ${req.user.username} intentó ${action} recurso ${resource}`);
        return res.status(403).json({ 
          error: 'No tienes permisos para acceder a este recurso'
        });
      }

      // Agregar el recurso al request para uso posterior
      req.targetResource = targetResource;
      next();
    } catch (error) {
      logger.error('Error verificando acceso a recurso:', error);
      return res.status(500).json({ error: 'Error verificando acceso' });
    }
  };
};

/**
 * Middleware para cargar permisos del usuario en el request
 * Útil para endpoints que necesitan verificar múltiples permisos
 * @returns {Function} Middleware function
 */
export const loadUserPermissions = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const permissions = await permissionsService.getUserPermissions(req.user.id);
    req.userPermissions = permissions;
    
    next();
  } catch (error) {
    logger.error('Error cargando permisos:', error);
    return res.status(500).json({ error: 'Error cargando permisos' });
  }
};

/**
 * Helper para verificar permiso en el request (después de loadUserPermissions)
 * @param {Object} req - Request object
 * @param {string} resource - Recurso
 * @param {string} action - Acción
 * @param {string} scope - Alcance
 * @returns {boolean}
 */
export const hasPermissionInRequest = (req, resource, action, scope = SCOPES.ALL) => {
  if (!req.userPermissions) {
    return false;
  }
  
  const permissionKey = `${resource}.${action}.${scope}`;
  return req.userPermissions.includes(permissionKey);
};

// ============================================================================
// SHORTCUTS COMUNES (para compatibilidad con código existente)
// ============================================================================

/**
 * Verificar si puede ver todos los usuarios
 */
export const canViewAllUsers = checkPermission(RESOURCES.USERS, ACTIONS.VIEW, SCOPES.ALL);

/**
 * Verificar si puede crear usuarios
 */
export const canCreateUsers = checkPermission(RESOURCES.USERS, ACTIONS.CREATE, SCOPES.ALL);

/**
 * Verificar si puede ver todos los registros de tiempo
 */
export const canViewAllTimeEntries = checkPermission(RESOURCES.TIME_ENTRIES, ACTIONS.VIEW, SCOPES.ALL);

/**
 * Verificar si puede ver registros de su equipo
 */
export const canViewTeamTimeEntries = checkAnyPermission([
  { resource: RESOURCES.TIME_ENTRIES, action: ACTIONS.VIEW, scope: SCOPES.ALL },
  { resource: RESOURCES.TIME_ENTRIES, action: ACTIONS.VIEW, scope: SCOPES.TEAM }
]);

/**
 * Verificar si puede gestionar unidades organizacionales
 */
export const canManageOrgUnits = checkPermission(RESOURCES.ORG_UNITS, ACTIONS.UPDATE, SCOPES.ALL);

/**
 * Verificar si puede ver reportes
 */
export const canViewReports = checkAnyPermission([
  { resource: RESOURCES.REPORTS, action: ACTIONS.VIEW, scope: SCOPES.ALL },
  { resource: RESOURCES.REPORTS, action: ACTIONS.VIEW, scope: SCOPES.TEAM },
  { resource: RESOURCES.REPORTS, action: ACTIONS.VIEW, scope: SCOPES.OWN }
]);

/**
 * Verificar si puede exportar reportes
 */
export const canExportReports = checkAnyPermission([
  { resource: RESOURCES.REPORTS, action: ACTIONS.EXPORT, scope: SCOPES.ALL },
  { resource: RESOURCES.REPORTS, action: ACTIONS.EXPORT, scope: SCOPES.TEAM }
]);

/**
 * Verificar si puede gestionar roles y permisos
 */
export const canManageRoles = checkPermission(RESOURCES.ROLES, ACTIONS.MANAGE, SCOPES.ALL);

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  checkPermission,
  checkAnyPermission,
  checkResourceAccess,
  loadUserPermissions,
  hasPermissionInRequest,
  // Shortcuts
  canViewAllUsers,
  canCreateUsers,
  canViewAllTimeEntries,
  canViewTeamTimeEntries,
  canManageOrgUnits,
  canViewReports,
  canExportReports,
  canManageRoles
};
