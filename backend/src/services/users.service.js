/**
 * Users Service
 * 
 * Responsabilidades:
 * - Lógica de negocio de usuarios
 * - Validaciones de permisos
 * - Acceso a base de datos
 * - Gestión de usuarios
 */

import bcrypt from 'bcryptjs';
import { supabase } from '../config/database.js';
import { USER_ROLES } from '../models/constants.js';
import permissionsService from './permissions.service.js';
import logger from '../utils/logger.js';
import { ConflictError, ValidationError, NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';

/**
 * Obtener todos los usuarios según el rol
 * @param {Object} user - Usuario que hace la petición
 * @param {Object} options - Opciones de filtrado
 * @param {boolean} options.includeInactive - Si true, incluye usuarios inactivos
 */
const getAll = async (user, options = {}) => {
  const { includeInactive = false } = options;
  
  try {
    logger.info('getAll users - user.id:', user?.id);
    
    let query = supabase
      .from('users')
      .select(`
        id,
        username,
        email,
        name,
        role_id,
        organizational_unit_id,
        is_active,
        created_at,
        roles (
          id,
          slug,
          name
        )
      `);

    // Filtrar por is_active solo si no se solicitan inactivos
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    // Filtrar según permisos RBAC
    if (user && user.id) {
      const canViewAll = await permissionsService.userCan(user.id, 'users', 'view', 'all');
      logger.info('canViewAll:', canViewAll);
      
      if (!canViewAll) {
        // Operarios solo ven su propio perfil
        query = query.eq('id', user.id);
      }
    } else {
      logger.warn('Usuario sin ID, filtrando a ninguno');
      // Si no hay user.id, no retornar nada
      return [];
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error obteniendo usuarios:', error);
      throw new Error('Error obteniendo usuarios');
    }

    logger.info(`Usuarios obtenidos: ${data?.length || 0}`);

    // Agregar slug del rol para compatibilidad
    return data.map(u => ({
      ...u,
      role: u.roles?.slug || 'operario'
    }));
  } catch (error) {
    logger.error('Error en getAll users:', error);
    throw error;
  }
};

/**
 * Obtener un usuario por ID
 */
const getById = async (userId, requestingUser) => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      username,
      email,
      name,
      role_id,
      organizational_unit_id,
      is_active,
      created_at,
      roles (
        id,
        slug,
        name
      )
    `)
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new Error('Usuario no encontrado');
  }

  // Verificar permisos RBAC
  const canViewAll = await permissionsService.userCan(requestingUser.id, 'users', 'view', 'all');
  if (!canViewAll && userId !== requestingUser.id) {
    throw new Error('No tienes permisos');
  }

  // Agregar slug del rol para compatibilidad
  return {
    ...data,
    role: data.roles?.slug || 'operario'
  };
};

/**
 * Crear un usuario
 */
const create = async (userData) => {
  const { username, email, password, name, role_id, organizational_unit_id } = userData;

  // Hash password
  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .insert({
      username,
      email: email || null,
      password_hash,
      name,
      role_id,  // Ahora usa role_id
      organizational_unit_id
    })
    .select(`
      id,
      username,
      email,
      name,
      role_id,
      organizational_unit_id,
      is_active,
      created_at,
      roles (
        id,
        slug,
        name
      )
    `)
    .single();

  if (error) {
    logger.error('Error creando usuario:', error);
    
    // Errores de duplicados
    if (error.code === '23505') {
      if (error.message.includes('username')) {
        throw new ConflictError('El username ya existe');
      }
      if (error.message.includes('email')) {
        throw new ConflictError('El email ya existe');
      }
      throw new ConflictError('El usuario ya existe');
    }
    
    // Otros errores de constraint
    if (error.code?.startsWith('23')) {
      throw new ValidationError(`Error de validación: ${error.message}`);
    }
    
    throw new Error(error.message || 'Error creando usuario');
  }

  logger.info('Usuario creado:', username);
  
  // Agregar slug del rol para compatibilidad
  return {
    ...data,
    role: data.roles?.slug || 'operario'
  };
};

/**
 * Actualizar un usuario
 */
const update = async (userId, updates, requestingUser) => {
  // Verificar permisos básicos RBAC
  const canUpdateAny = await permissionsService.userCan(requestingUser.id, 'users', 'update', 'all');
  if (userId !== requestingUser.id && !canUpdateAny) {
    throw new Error('No tienes permisos');
  }

  const updateData = { ...updates };

  // Verificar si intenta cambiar role_id
  if (updateData.role_id) {
    // Solo superadmin puede cambiar roles
    const isSuperadmin = requestingUser.role === USER_ROLES.SUPERADMIN;
    if (!isSuperadmin) {
      delete updateData.role_id;
    } else {
      // Admin no puede crear/editar otros admins o superadmins
      // Obtener el rol objetivo
      const { data: targetRole } = await supabase
        .from('roles')
        .select('slug')
        .eq('id', updateData.role_id)
        .single();
      
      if (requestingUser.role === USER_ROLES.ADMIN && 
          (targetRole?.slug === USER_ROLES.ADMIN || targetRole?.slug === USER_ROLES.SUPERADMIN)) {
        throw new Error('No puedes gestionar usuarios con rol admin o superadmin');
      }
    }
  }

  // Si hay password, hashearlo
  if (updateData.password) {
    updateData.password_hash = await bcrypt.hash(updateData.password, 10);
    delete updateData.password;
  }

  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select(`
      id,
      username,
      email,
      name,
      role_id,
      organizational_unit_id,
      is_active,
      created_at,
      roles (
        id,
        slug,
        name
      )
    `)
    .single();

  if (error) {
    logger.error('Error actualizando usuario:', error);
    throw new Error('Error actualizando usuario');
  }

  logger.info('Usuario actualizado:', userId);
  
  // Agregar slug del rol para compatibilidad
  return {
    ...data,
    role: data.roles?.slug || 'operario'
  };
};

/**
 * Eliminar un usuario (soft delete)
 */
const deleteUser = async (userId) => {
  const { error } = await supabase
    .from('users')
    .update({ is_active: false })
    .eq('id', userId);

  if (error) {
    logger.error('Error eliminando usuario:', error);
    throw new Error('Error eliminando usuario');
  }

  logger.info('Usuario eliminado:', userId);
  return true;
};

export default {
  getAll,
  getById,
  create,
  update,
  deleteUser
};
