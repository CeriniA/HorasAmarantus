/**
 * ROLE HELPERS - Utilidades para manejo de roles
 * 
 * Centraliza toda la lógica relacionada con roles de usuario.
 * NUNCA verificar roles inline, SIEMPRE usar estas funciones.
 */

import { USER_ROLES } from '../constants';

/**
 * Verificar si el usuario es superadmin
 * @param {Object} user - Usuario a verificar
 * @returns {boolean}
 */
export const isSuperadmin = (user) => {
  if (!user) return false;
  return user.role === USER_ROLES.SUPERADMIN;
};

/**
 * Verificar si el usuario es admin (NO incluye superadmin)
 * @param {Object} user - Usuario a verificar
 * @returns {boolean}
 */
export const isAdmin = (user) => {
  if (!user) return false;
  return user.role === USER_ROLES.ADMIN;
};

/**
 * Verificar si el usuario es admin O superadmin
 * @param {Object} user - Usuario a verificar
 * @returns {boolean}
 */
export const isAdminOrSuperadmin = (user) => {
  if (!user) return false;
  return user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUPERADMIN;
};

/**
 * Verificar si el usuario es operario
 * @param {Object} user - Usuario a verificar
 * @returns {boolean}
 */
export const isOperario = (user) => {
  if (!user) return false;
  return user.role === USER_ROLES.OPERARIO;
};

/**
 * Verificar si el usuario tiene uno de los roles especificados
 * @param {Object} user - Usuario a verificar
 * @param {...string} roles - Roles a verificar
 * @returns {boolean}
 */
export const hasRole = (user, ...roles) => {
  if (!user) return false;
  return roles.includes(user.role);
};

/**
 * Filtrar usuarios según permisos del usuario actual
 * @param {Array} users - Lista de usuarios
 * @param {Object} currentUser - Usuario actual
 * @returns {Array} - Usuarios filtrados
 */
export const filterUsersByPermission = (users, currentUser) => {
  if (!users || !currentUser) return [];
  
  // Superadmin ve todos
  if (isSuperadmin(currentUser)) {
    return users;
  }
  
  // Admin solo ve operarios
  if (isAdmin(currentUser)) {
    return users.filter(u => u.role === USER_ROLES.OPERARIO);
  }
  
  // Operarios no ven selector de usuarios
  return [];
};

/**
 * Obtener clase CSS para badge de rol
 * @param {string} role - Rol del usuario
 * @returns {string} - Clases CSS
 */
export const getRoleBadgeColor = (role) => {
  const colors = {
    [USER_ROLES.SUPERADMIN]: 'bg-purple-100 text-purple-800',
    [USER_ROLES.ADMIN]: 'bg-blue-100 text-blue-800',
    [USER_ROLES.OPERARIO]: 'bg-green-100 text-green-800'
  };
  
  return colors[role] || 'bg-gray-100 text-gray-800';
};

/**
 * Verificar si un usuario puede editar a otro
 * @param {Object} currentUser - Usuario que intenta editar
 * @param {Object} targetUser - Usuario a editar
 * @returns {boolean}
 */
export const canEditUser = (currentUser, targetUser) => {
  if (!currentUser || !targetUser) return false;
  
  // Superadmin puede editar a todos
  if (isSuperadmin(currentUser)) return true;
  
  // Admin solo puede editar operarios
  if (isAdmin(currentUser)) {
    return targetUser.role === USER_ROLES.OPERARIO;
  }
  
  // Operarios solo pueden editar su propio perfil
  return currentUser.id === targetUser.id;
};

/**
 * Verificar si un usuario puede eliminar a otro
 * @param {Object} currentUser - Usuario que intenta eliminar
 * @param {Object} targetUser - Usuario a eliminar
 * @returns {boolean}
 */
export const canDeleteUser = (currentUser, targetUser) => {
  if (!currentUser || !targetUser) return false;
  
  // Superadmin puede eliminar a todos (excepto a sí mismo)
  if (isSuperadmin(currentUser)) {
    return currentUser.id !== targetUser.id;
  }
  
  // Admin solo puede eliminar operarios
  if (isAdmin(currentUser)) {
    return targetUser.role === USER_ROLES.OPERARIO;
  }
  
  // Operarios no pueden eliminar usuarios
  return false;
};

/**
 * Verificar si un usuario puede crear otro con un rol específico
 * @param {Object} currentUser - Usuario que intenta crear
 * @param {string} targetRole - Rol del usuario a crear
 * @returns {boolean}
 */
export const canCreateUserWithRole = (currentUser, targetRole) => {
  if (!currentUser || !targetRole) return false;
  
  // Superadmin puede crear cualquier rol
  if (isSuperadmin(currentUser)) return true;
  
  // Admin solo puede crear operarios
  if (isAdmin(currentUser)) {
    return targetRole === USER_ROLES.OPERARIO;
  }
  
  // Operarios no pueden crear usuarios
  return false;
};
