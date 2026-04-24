/**
 * Roles Service
 * 
 * Responsabilidad: Lógica de negocio para gestión de roles
 * - CRUD completo de roles
 * - Gestión de permisos de roles
 * - Validaciones de negocio
 */

import { supabase } from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * Obtener todos los roles
 */
const getAll = async () => {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('name');

  if (error) {
    logger.error('Error obteniendo roles:', error);
    throw new Error('Error obteniendo roles');
  }

  return data;
};

/**
 * Obtener rol por ID
 */
const getById = async (roleId) => {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('id', roleId)
    .single();

  if (error) {
    logger.error('Error obteniendo rol:', error);
    throw new Error('Error obteniendo rol');
  }

  if (!data) {
    throw new Error('Rol no encontrado');
  }

  return data;
};

/**
 * Obtener permisos de un rol
 */
const getRolePermissions = async (roleId) => {
  const { data, error } = await supabase
    .from('role_permissions')
    .select(`
      id,
      permission_id,
      permissions (
        id,
        resource,
        action,
        scope,
        description
      )
    `)
    .eq('role_id', roleId);

  if (error) {
    logger.error('Error obteniendo permisos del rol:', error);
    throw new Error('Error obteniendo permisos del rol');
  }

  return data.map(rp => rp.permissions);
};

/**
 * Crear nuevo rol
 */
const create = async (roleData) => {
  // Validaciones
  if (!roleData.name || !roleData.slug) {
    throw new Error('name y slug son requeridos');
  }

  // Verificar que el slug no exista
  const { data: existing } = await supabase
    .from('roles')
    .select('id')
    .eq('slug', roleData.slug)
    .single();

  if (existing) {
    throw new Error('Ya existe un rol con ese slug');
  }

  const { data, error } = await supabase
    .from('roles')
    .insert({
      name: roleData.name,
      slug: roleData.slug,
      description: roleData.description || null,
      is_system: false, // Roles creados por usuario no son del sistema
      is_active: roleData.is_active !== undefined ? roleData.is_active : true
    })
    .select()
    .single();

  if (error) {
    logger.error('Error creando rol:', error);
    throw new Error('Error creando rol');
  }

  logger.info('Rol creado:', data.id);
  return data;
};

/**
 * Actualizar rol
 */
const update = async (roleId, roleData) => {
  // Verificar que el rol exista
  const role = await getById(roleId);

  // No permitir editar roles del sistema
  if (role.is_system) {
    throw new Error('No se pueden editar roles del sistema');
  }

  // Si se cambia el slug, verificar que no exista
  if (roleData.slug && roleData.slug !== role.slug) {
    const { data: existing } = await supabase
      .from('roles')
      .select('id')
      .eq('slug', roleData.slug)
      .neq('id', roleId)
      .single();

    if (existing) {
      throw new Error('Ya existe un rol con ese slug');
    }
  }

  const { data, error } = await supabase
    .from('roles')
    .update({
      name: roleData.name,
      slug: roleData.slug,
      description: roleData.description,
      is_active: roleData.is_active
    })
    .eq('id', roleId)
    .select()
    .single();

  if (error) {
    logger.error('Error actualizando rol:', error);
    throw new Error('Error actualizando rol');
  }

  logger.info('Rol actualizado:', roleId);
  return data;
};

/**
 * Eliminar rol
 */
const deleteRole = async (roleId) => {
  // Verificar que el rol exista
  const role = await getById(roleId);

  // No permitir eliminar roles del sistema
  if (role.is_system) {
    logger.warn(`Intento de eliminar rol del sistema: ${role.name}`);
    throw new Error(`No se puede eliminar "${role.name}" porque es un rol del sistema`);
  }

  // Verificar que no haya usuarios con este rol (contar todos)
  const { count, error: countError } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('role', role.name);

  if (countError) {
    logger.error('Error contando usuarios con rol:', countError);
    throw new Error('Error verificando usuarios asignados al rol');
  }

  if (count > 0) {
    logger.warn(`Intento de eliminar rol con usuarios asignados: ${role.name} (${count} usuarios)`);
    throw new Error(
      `No se puede eliminar el rol "${role.name}" porque hay ${count} usuario(s) asignado(s). ` +
      `Reasigna los usuarios a otro rol primero.`
    );
  }

  // Eliminar permisos del rol primero (por foreign key)
  await supabase
    .from('role_permissions')
    .delete()
    .eq('role_id', roleId);

  // Eliminar rol
  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id', roleId);

  if (error) {
    logger.error('Error eliminando rol:', error);
    throw new Error('Error eliminando rol');
  }

  logger.info(`Rol eliminado exitosamente: ${role.name} (ID: ${roleId})`);
  return { success: true };
};

/**
 * Asignar permiso a rol
 */
const assignPermission = async (roleId, permissionId) => {
  // Verificar que el rol exista
  await getById(roleId);

  // Verificar que el permiso exista
  const { data: permission } = await supabase
    .from('permissions')
    .select('id')
    .eq('id', permissionId)
    .single();

  if (!permission) {
    throw new Error('Permiso no encontrado');
  }

  // Verificar si ya existe la asignación
  const { data: existing } = await supabase
    .from('role_permissions')
    .select('id')
    .eq('role_id', roleId)
    .eq('permission_id', permissionId)
    .single();

  if (existing) {
    throw new Error('El rol ya tiene este permiso asignado');
  }

  const { data, error } = await supabase
    .from('role_permissions')
    .insert({
      role_id: roleId,
      permission_id: permissionId
    })
    .select()
    .single();

  if (error) {
    logger.error('Error asignando permiso a rol:', error);
    throw new Error('Error asignando permiso a rol');
  }

  logger.info('Permiso asignado a rol:', { roleId, permissionId });
  return data;
};

/**
 * Remover permiso de rol
 */
const removePermission = async (roleId, permissionId) => {
  // Verificar que el rol exista
  await getById(roleId);

  const { error } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role_id', roleId)
    .eq('permission_id', permissionId);

  if (error) {
    logger.error('Error removiendo permiso de rol:', error);
    throw new Error('Error removiendo permiso de rol');
  }

  logger.info('Permiso removido de rol:', { roleId, permissionId });
  return { success: true };
};

/**
 * Asignar múltiples permisos a un rol (reemplaza los existentes)
 */
const setPermissions = async (roleId, permissionIds) => {
  // Verificar que el rol exista
  await getById(roleId);

  // Eliminar permisos actuales
  await supabase
    .from('role_permissions')
    .delete()
    .eq('role_id', roleId);

  // Insertar nuevos permisos
  if (permissionIds && permissionIds.length > 0) {
    const inserts = permissionIds.map(permissionId => ({
      role_id: roleId,
      permission_id: permissionId
    }));

    const { error } = await supabase
      .from('role_permissions')
      .insert(inserts);

    if (error) {
      logger.error('Error asignando permisos a rol:', error);
      throw new Error('Error asignando permisos a rol');
    }
  }

  logger.info('Permisos actualizados para rol:', roleId);
  return { success: true };
};

export default {
  getAll,
  getById,
  getRolePermissions,
  create,
  update,
  deleteRole,
  assignPermission,
  removePermission,
  setPermissions
};
