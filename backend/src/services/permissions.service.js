/**
 * Permissions Service
 * 
 * Responsabilidades:
 * - Verificar permisos de usuarios
 * - Gestionar roles y permisos
 * - Obtener permisos efectivos de un usuario
 * - Asignar/revocar permisos individuales
 */

import { supabase } from '../config/database.js';
import { RESOURCES, ACTIONS, SCOPES, buildPermissionKey } from '../models/constants.js';
import logger from '../utils/logger.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../middleware/errorHandler.js';

/**
 * Verificar si un usuario tiene un permiso específico
 * @param {string} userId - ID del usuario
 * @param {string} resource - Recurso (users, time_entries, etc.)
 * @param {string} action - Acción (view, create, update, delete)
 * @param {string} scope - Alcance (all, team, own)
 * @returns {Promise<boolean>}
 */
const userCan = async (userId, resource, action, scope = SCOPES.ALL) => {
  try {
    // Usar la función de PostgreSQL
    const { data, error } = await supabase
      .rpc('user_has_permission', {
        p_user_id: userId,
        p_resource: resource,
        p_action: action,
        p_scope: scope
      });

    if (error) {
      logger.error('Error verificando permiso:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    logger.error('Error en userCan:', error);
    return false;
  }
};

/**
 * Verificar si un usuario tiene un permiso (usando clave completa)
 * @param {string} userId - ID del usuario
 * @param {string} permissionKey - Clave del permiso (ej: 'users.view.all')
 * @returns {Promise<boolean>}
 */
const userHasPermission = async (userId, permissionKey) => {
  const [resource, action, scope = SCOPES.ALL] = permissionKey.split('.');
  return userCan(userId, resource, action, scope);
};

/**
 * Obtener todos los permisos efectivos de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array<string>>} - Array de claves de permisos
 */
const getUserPermissions = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_permissions_view')
      .select('permission_key')
      .eq('user_id', userId)
      .eq('has_permission', true);

    if (error) {
      logger.error('Error obteniendo permisos de usuario:', error);
      throw new Error('Error obteniendo permisos');
    }

    return data.map(p => p.permission_key);
  } catch (error) {
    logger.error('Error en getUserPermissions:', error);
    throw error;
  }
};

/**
 * Obtener información completa de permisos de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} - Información de rol y permisos
 */
const getUserPermissionsInfo = async (userId) => {
  try {
    // Obtener usuario con rol
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        username,
        role_id,
        roles (
          id,
          name,
          slug
        )
      `)
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Obtener permisos del rol
    const { data: rolePermissions, error: roleError } = await supabase
      .from('role_permissions')
      .select(`
        permissions (
          resource,
          action,
          scope,
          description
        )
      `)
      .eq('role_id', user.role_id);

    if (roleError) {
      logger.error('Error obteniendo permisos del rol:', roleError);
      throw new Error('Error obteniendo permisos del rol');
    }

    // Obtener permisos individuales del usuario
    const { data: userPermissions, error: userPermError } = await supabase
      .from('user_permissions')
      .select(`
        granted,
        permissions (
          resource,
          action,
          scope,
          description
        )
      `)
      .eq('user_id', userId);

    if (userPermError) {
      logger.error('Error obteniendo permisos individuales:', userPermError);
      throw new Error('Error obteniendo permisos individuales');
    }

    // Construir lista de permisos efectivos
    const permissions = new Set();
    
    // Agregar permisos del rol
    rolePermissions.forEach(rp => {
      if (rp.permissions) {
        const key = buildPermissionKey(
          rp.permissions.resource,
          rp.permissions.action,
          rp.permissions.scope
        );
        permissions.add(key);
      }
    });

    // Aplicar excepciones individuales
    userPermissions.forEach(up => {
      if (up.permissions) {
        const key = buildPermissionKey(
          up.permissions.resource,
          up.permissions.action,
          up.permissions.scope
        );
        
        if (up.granted) {
          permissions.add(key);
        } else {
          permissions.delete(key);
        }
      }
    });

    return {
      userId: user.id,
      username: user.username,
      role: user.roles,
      permissions: Array.from(permissions),
      rolePermissions: rolePermissions.map(rp => rp.permissions).filter(Boolean),
      userPermissions: userPermissions.map(up => ({
        ...up.permissions,
        granted: up.granted
      })).filter(p => p.resource)
    };
  } catch (error) {
    logger.error('Error en getUserPermissionsInfo:', error);
    throw error;
  }
};

/**
 * Obtener todos los roles disponibles
 * @returns {Promise<Array>}
 */
const getAllRoles = async () => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      logger.error('Error obteniendo roles:', error);
      throw new Error('Error obteniendo roles');
    }

    return data;
  } catch (error) {
    logger.error('Error en getAllRoles:', error);
    throw error;
  }
};

/**
 * Obtener un rol por ID con sus permisos
 * @param {string} roleId - ID del rol
 * @returns {Promise<Object>}
 */
const getRoleById = async (roleId) => {
  try {
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('id', roleId)
      .single();

    if (roleError || !role) {
      throw new NotFoundError('Rol no encontrado');
    }

    // Obtener permisos del rol
    const { data: permissions, error: permError } = await supabase
      .from('role_permissions')
      .select(`
        permissions (
          id,
          resource,
          action,
          scope,
          description
        )
      `)
      .eq('role_id', roleId);

    if (permError) {
      logger.error('Error obteniendo permisos del rol:', permError);
      throw new Error('Error obteniendo permisos del rol');
    }

    return {
      ...role,
      permissions: permissions.map(p => p.permissions).filter(Boolean)
    };
  } catch (error) {
    logger.error('Error en getRoleById:', error);
    throw error;
  }
};

/**
 * Obtener todos los permisos disponibles
 * @returns {Promise<Array>}
 */
const getAllPermissions = async () => {
  try {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('resource, action, scope');

    if (error) {
      logger.error('Error obteniendo permisos:', error);
      throw new Error('Error obteniendo permisos');
    }

    return data;
  } catch (error) {
    logger.error('Error en getAllPermissions:', error);
    throw error;
  }
};

/**
 * Asignar un permiso individual a un usuario
 * @param {string} userId - ID del usuario
 * @param {string} permissionId - ID del permiso
 * @param {boolean} granted - true = conceder, false = revocar
 * @returns {Promise<Object>}
 */
const assignUserPermission = async (userId, permissionId, granted = true) => {
  try {
    // Verificar que el usuario existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Verificar que el permiso existe
    const { data: permission, error: permError } = await supabase
      .from('permissions')
      .select('id')
      .eq('id', permissionId)
      .single();

    if (permError || !permission) {
      throw new NotFoundError('Permiso no encontrado');
    }

    // Insertar o actualizar el permiso de usuario
    const { data, error } = await supabase
      .from('user_permissions')
      .upsert({
        user_id: userId,
        permission_id: permissionId,
        granted
      }, {
        onConflict: 'user_id,permission_id'
      })
      .select()
      .single();

    if (error) {
      logger.error('Error asignando permiso:', error);
      throw new Error('Error asignando permiso');
    }

    logger.info(`Permiso ${granted ? 'concedido' : 'revocado'} a usuario ${userId}`);
    return data;
  } catch (error) {
    logger.error('Error en assignUserPermission:', error);
    throw error;
  }
};

/**
 * Remover un permiso individual de un usuario
 * @param {string} userId - ID del usuario
 * @param {string} permissionId - ID del permiso
 * @returns {Promise<void>}
 */
const removeUserPermission = async (userId, permissionId) => {
  try {
    const { error } = await supabase
      .from('user_permissions')
      .delete()
      .eq('user_id', userId)
      .eq('permission_id', permissionId);

    if (error) {
      logger.error('Error removiendo permiso:', error);
      throw new Error('Error removiendo permiso');
    }

    logger.info(`Permiso removido de usuario ${userId}`);
  } catch (error) {
    logger.error('Error en removeUserPermission:', error);
    throw error;
  }
};

/**
 * Verificar si un usuario puede acceder a un recurso específico
 * Considera el alcance (all, team, own)
 * @param {string} userId - ID del usuario
 * @param {string} resource - Recurso
 * @param {string} action - Acción
 * @param {Object} targetResource - Recurso objetivo (para verificar ownership/team)
 * @returns {Promise<boolean>}
 */
const canAccessResource = async (userId, resource, action, targetResource = null) => {
  try {
    // Verificar permiso 'all'
    if (await userCan(userId, resource, action, SCOPES.ALL)) {
      return true;
    }

    // Si no hay recurso objetivo, solo verificar 'own'
    if (!targetResource) {
      return await userCan(userId, resource, action, SCOPES.OWN);
    }

    // Verificar permiso 'team'
    if (await userCan(userId, resource, action, SCOPES.TEAM)) {
      // Obtener organizational_unit_id del usuario
      const { data: user } = await supabase
        .from('users')
        .select('organizational_unit_id')
        .eq('id', userId)
        .single();

      if (user && user.organizational_unit_id === targetResource.organizational_unit_id) {
        return true;
      }
    }

    // Verificar permiso 'own'
    if (await userCan(userId, resource, action, SCOPES.OWN)) {
      return targetResource.user_id === userId || targetResource.id === userId;
    }

    return false;
  } catch (error) {
    logger.error('Error en canAccessResource:', error);
    return false;
  }
};

export default {
  userCan,
  userHasPermission,
  getUserPermissions,
  getUserPermissionsInfo,
  getAllRoles,
  getRoleById,
  getAllPermissions,
  assignUserPermission,
  removeUserPermission,
  canAccessResource
};
