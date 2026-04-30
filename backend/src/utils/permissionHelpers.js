/**
 * Permission Helpers (Backend)
 * Utilidades para trabajar con claves de permisos
 */

import { SCOPES } from '../models/constants.js';

/**
 * Construye una clave de permiso
 * @param {string} resource - Recurso (ej: 'time_entries')
 * @param {string} action - Acción (ej: 'read', 'create', 'update', 'delete')
 * @param {string} scope - Alcance (ej: 'all', 'own', 'team')
 * @returns {string} Clave de permiso (ej: 'time_entries.read.own')
 * 
 * @example
 * buildPermissionKey('time_entries', 'read', 'own')
 * // Returns: 'time_entries.read.own'
 */
export const buildPermissionKey = (resource, action, scope = SCOPES.ALL) => {
  if (!resource || !action) {
    throw new Error('Resource and action are required to build permission key');
  }
  return `${resource}.${action}.${scope}`;
};

/**
 * Parsea una clave de permiso en sus componentes
 * @param {string} key - Clave de permiso (ej: 'time_entries.read.own')
 * @returns {Object} { resource, action, scope }
 * 
 * @example
 * parsePermissionKey('time_entries.read.own')
 * // Returns: { resource: 'time_entries', action: 'read', scope: 'own' }
 */
export const parsePermissionKey = (key) => {
  if (!key || typeof key !== 'string') {
    throw new Error('Invalid permission key');
  }
  
  const [resource, action, scope = SCOPES.ALL] = key.split('.');
  
  if (!resource || !action) {
    throw new Error('Permission key must have at least resource and action');
  }
  
  return { resource, action, scope };
};

/**
 * Verifica si una clave de permiso es válida
 * @param {string} key - Clave de permiso
 * @returns {boolean} true si es válida
 */
export const isValidPermissionKey = (key) => {
  try {
    parsePermissionKey(key);
    return true;
  } catch {
    return false;
  }
};
