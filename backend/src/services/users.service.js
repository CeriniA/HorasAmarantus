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
import { hasPermission } from '../models/types.js';
import logger from '../utils/logger.js';

/**
 * Obtener todos los usuarios según el rol
 */
const getAll = async (user) => {
  let query = supabase
    .from('users')
    .select('id, username, email, name, role, organizational_unit_id, is_active, created_at')
    .eq('is_active', true);

  // Filtrar según rol
  if (!hasPermission(user.role, 'VIEW_ALL_USERS')) {
    // Operarios solo ven su propio perfil
    query = query.eq('id', user.id);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Error obteniendo usuarios:', error);
    throw new Error('Error obteniendo usuarios');
  }

  return data;
};

/**
 * Obtener un usuario por ID
 */
const getById = async (userId, requestingUser) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, email, name, role, organizational_unit_id, is_active, created_at')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new Error('Usuario no encontrado');
  }

  // Verificar permisos
  if (!hasPermission(requestingUser.role, 'VIEW_ALL_USERS') && userId !== requestingUser.id) {
    throw new Error('No tienes permisos');
  }

  return data;
};

/**
 * Crear un usuario
 */
const create = async (userData) => {
  const { username, email, password, name, role, organizational_unit_id } = userData;

  // Hash password
  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .insert({
      username,
      email: email || null,
      password_hash,
      name,
      role,
      organizational_unit_id
    })
    .select('id, username, email, name, role, organizational_unit_id, is_active, created_at')
    .single();

  if (error) {
    logger.error('Error creando usuario:', error);
    throw new Error('Error creando usuario');
  }

  logger.info('Usuario creado:', username);
  return data;
};

/**
 * Actualizar un usuario
 */
const update = async (userId, updates, requestingUser) => {
  // Verificar permisos básicos
  if (userId !== requestingUser.id && 
      !hasPermission(requestingUser.role, 'UPDATE_ANY_USER')) {
    throw new Error('No tienes permisos');
  }

  const updateData = { ...updates };

  // Verificar si intenta cambiar rol
  if (updateData.role) {
    // Solo superadmin puede cambiar roles
    if (requestingUser.role !== USER_ROLES.SUPERADMIN) {
      delete updateData.role;
    }
    // Admin no puede crear/editar otros admins o superadmins
    else if (requestingUser.role === USER_ROLES.ADMIN && 
             (updateData.role === USER_ROLES.ADMIN || updateData.role === USER_ROLES.SUPERADMIN)) {
      throw new Error('No puedes gestionar usuarios con rol admin o superadmin');
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
    .select('id, username, email, name, role, organizational_unit_id, is_active, created_at')
    .single();

  if (error) {
    logger.error('Error actualizando usuario:', error);
    throw new Error('Error actualizando usuario');
  }

  logger.info('Usuario actualizado:', userId);
  return data;
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
