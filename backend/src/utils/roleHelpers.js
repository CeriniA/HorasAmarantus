/**
 * Role Helpers
 * Utilidades para trabajar con roles del sistema
 */

import { USER_ROLES } from '../models/constants.js';
import logger from './logger.js';

/**
 * Verifica si un rol es un rol del sistema (no se puede eliminar)
 * @param {string} roleName - Nombre del rol
 * @returns {boolean}
 */
export const isSystemRole = (roleName) => {
  return Object.values(USER_ROLES).includes(roleName);
};

/**
 * Verifica si un rol es válido (existe en constantes)
 * @param {string} roleName - Nombre del rol
 * @returns {boolean}
 */
export const isValidSystemRole = (roleName) => {
  return USER_ROLES[roleName.toUpperCase()] === roleName;
};

/**
 * Obtiene el label amigable de un rol
 * @param {string} roleName - Nombre del rol
 * @returns {string}
 */
export const getRoleLabel = (roleName) => {
  const labels = {
    [USER_ROLES.SUPERADMIN]: 'Superadministrador',
    [USER_ROLES.ADMIN]: 'Administrador',
    [USER_ROLES.OPERARIO]: 'Operario'
  };
  
  return labels[roleName] || roleName;
};

/**
 * Verifica si un usuario tiene un rol específico
 * @param {Object} user - Usuario
 * @param {string} requiredRole - Rol requerido (usar constantes USER_ROLES)
 * @returns {boolean}
 */
export const hasRole = (user, requiredRole) => {
  // Validar que el rol requerido sea válido (opcional pero recomendado)
  if (!Object.values(USER_ROLES).includes(requiredRole)) {
    logger.warn(`Advertencia: "${requiredRole}" no es un rol del sistema conocido`);
  }
  return user?.role === requiredRole;
};

/**
 * Verifica si un usuario tiene alguno de los roles especificados
 * @param {Object} user - Usuario
 * @param {string[]} allowedRoles - Roles permitidos (usar constantes USER_ROLES)
 * @returns {boolean}
 */
export const hasAnyRole = (user, allowedRoles) => {
  // Validar que todos los roles sean válidos
  const systemRoles = Object.values(USER_ROLES);
  const invalidRoles = allowedRoles.filter(role => !systemRoles.includes(role));
  if (invalidRoles.length > 0) {
    logger.warn(`Advertencia: Roles no reconocidos del sistema: ${invalidRoles.join(', ')}`);
  }
  return allowedRoles.includes(user?.role);
};

/**
 * Verifica si un rol tiene permisos de administrador
 * @param {string} roleName - Nombre del rol
 * @returns {boolean}
 */
export const isAdminRole = (roleName) => {
  return [USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN].includes(roleName);
};

/**
 * Obtiene todos los roles del sistema (constantes)
 * @returns {string[]}
 */
export const getSystemRoles = () => {
  return Object.values(USER_ROLES);
};

export default {
  isSystemRole,
  isValidSystemRole,
  getRoleLabel,
  hasRole,
  hasAnyRole,
  isAdminRole,
  getSystemRoles
};
