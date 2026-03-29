/**
 * Time Entries Service
 * 
 * Responsabilidades:
 * - Lógica de negocio de time entries
 * - Validaciones de permisos
 * - Acceso a base de datos
 * - Cálculos y transformaciones
 */

import { supabase } from '../config/database.js';
import { USER_ROLES, TIME_ENTRY_STATUS } from '../models/constants.js';
import { hasPermission, PERMISSIONS } from '../models/types.js';
import logger from '../utils/logger.js';

/**
 * Obtener todos los time entries según el rol del usuario
 */
const getAll = async (user) => {
  let query = supabase
    .from('time_entries')
    .select(`
      *,
      organizational_units (id, name, type),
      users (id, name, email, weekly_goal, monthly_goal, standard_daily_hours)
    `)
    .order('start_time', { ascending: false });

  // Filtrar según rol
  if (!hasPermission(user.role, 'VIEW_ALL_ENTRIES')) {
    query = query.eq('user_id', user.id);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Error obteniendo registros:', error);
    throw new Error('Error obteniendo registros de tiempo');
  }

  return data;
};

/**
 * Validar permisos para crear registros para otro usuario
 */
const validateCreatePermissions = async (requestingUser, targetUserId) => {
  // Solo usuarios con permiso pueden crear para otros
  if (targetUserId !== requestingUser.id && 
      !hasPermission(requestingUser.role, 'CREATE_ENTRY_FOR_OTHERS')) {
    throw new Error('No puedes crear registros para otros usuarios');
  }

  // Si se especifica user_id diferente, validar que el admin no cree para otros admins/superadmins
  if (targetUserId && targetUserId !== requestingUser.id) {
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', targetUserId)
      .single();

    if (userError || !targetUser) {
      throw new Error('Usuario no encontrado');
    }

    // Admin NO puede crear registros para otros admins o superadmins
    if (requestingUser.role === USER_ROLES.ADMIN && 
        (targetUser.role === USER_ROLES.ADMIN || targetUser.role === USER_ROLES.SUPERADMIN)) {
      throw new Error('No puedes crear registros para usuarios admin o superadmin');
    }
  }

  return true;
};

/**
 * Crear un time entry
 */
const create = async (entryData, requestingUser) => {
  const { organizational_unit_id, description, start_time, end_time, user_id } = entryData;
  
  // Determinar usuario objetivo
  const targetUserId = user_id || requestingUser.id;
  
  // Validar permisos
  await validateCreatePermissions(requestingUser, targetUserId);

  // Crear registro
  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      client_id: crypto.randomUUID(),
      user_id: targetUserId,
      organizational_unit_id,
      description,
      start_time,
      end_time,
      status: TIME_ENTRY_STATUS.COMPLETED
    })
    .select(`
      *,
      organizational_units (id, name, type),
      users (id, name, email)
    `)
    .single();

  if (error) {
    logger.error('Error creando registro:', error);
    throw new Error('Error creando registro de tiempo');
  }

  logger.info('Time entry creado:', data.id);
  return data;
};

/**
 * Validar permisos para actualizar un registro
 */
const validateUpdatePermissions = async (entryId, requestingUser) => {
  const { data: existing, error: fetchError } = await supabase
    .from('time_entries')
    .select('*')
    .eq('id', entryId)
    .single();

  if (fetchError || !existing) {
    throw new Error('Registro no encontrado');
  }

  if (existing.user_id !== requestingUser.id && 
      !hasPermission(requestingUser.role, 'UPDATE_ANY_ENTRY')) {
    throw new Error('No puedes editar registros de otros usuarios');
  }

  return existing;
};

/**
 * Actualizar un time entry
 */
const update = async (entryId, updateData, requestingUser) => {
  // Validar permisos
  await validateUpdatePermissions(entryId, requestingUser);

  // Actualizar
  const { data, error } = await supabase
    .from('time_entries')
    .update(updateData)
    .eq('id', entryId)
    .select(`
      *,
      organizational_units (id, name, type),
      users (id, name, email)
    `)
    .single();

  if (error) {
    logger.error('Error actualizando registro:', error);
    throw new Error('Error actualizando registro de tiempo');
  }

  logger.info('Time entry actualizado:', entryId);
  return data;
};

/**
 * Validar que no haya solapamientos entre entries
 */
const validateNoOverlaps = (entries) => {
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const entry1 = entries[i];
      const entry2 = entries[j];
      
      const start1 = new Date(entry1.start_time);
      const end1 = new Date(entry1.end_time);
      const start2 = new Date(entry2.start_time);
      const end2 = new Date(entry2.end_time);
      
      // Verificar solapamiento
      if ((start1 < end2 && end1 > start2)) {
        throw new Error(`Las entradas ${i + 1} y ${j + 1} se solapan en tiempo`);
      }
    }
  }
  return true;
};

/**
 * Validar entries para bulk create
 */
const validateBulkEntries = (entries) => {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error('Debe proporcionar al menos un registro');
  }

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    
    if (!entry.organizational_unit_id) {
      throw new Error(`Entrada ${i + 1}: organizational_unit_id es requerido`);
    }
    
    if (!entry.start_time || !entry.end_time) {
      throw new Error(`Entrada ${i + 1}: start_time y end_time son requeridos`);
    }

    // Validar que end_time > start_time
    const start = new Date(entry.start_time);
    const end = new Date(entry.end_time);
    
    if (end <= start) {
      throw new Error(`Entrada ${i + 1}: La hora de fin debe ser posterior a la de inicio`);
    }
  }

  // Validar solapamientos
  validateNoOverlaps(entries);

  return true;
};

/**
 * Calcular total de horas de entries
 */
const calculateTotalHours = (entries) => {
  let totalHours = 0;
  entries.forEach(entry => {
    const start = new Date(entry.start_time);
    const end = new Date(entry.end_time);
    const hours = (end - start) / (1000 * 60 * 60);
    totalHours += hours;
  });
  return Math.round(totalHours * 100) / 100;
};

/**
 * Crear múltiples time entries (bulk)
 */
const createBulk = async (entries, requestingUser, targetUserId) => {
  // Validar entries
  validateBulkEntries(entries);

  // Determinar usuario objetivo
  const userId = targetUserId || requestingUser.id;
  
  // Validar permisos
  await validateCreatePermissions(requestingUser, userId);

  // Preparar datos para inserción
  const timeEntriesToInsert = entries.map(entry => ({
    client_id: crypto.randomUUID(),
    user_id: userId,
    organizational_unit_id: entry.organizational_unit_id,
    description: entry.description || null,
    start_time: entry.start_time,
    end_time: entry.end_time,
    status: TIME_ENTRY_STATUS.COMPLETED
  }));

  // Insertar todos los registros
  const { data, error } = await supabase
    .from('time_entries')
    .insert(timeEntriesToInsert)
    .select(`
      *,
      organizational_units (id, name, type),
      users (id, name, email)
    `);

  if (error) {
    logger.error('Error creando registros masivos:', error);
    throw new Error('Error creando registros de tiempo');
  }

  const totalHours = calculateTotalHours(data);

  logger.info(`${data.length} time entries creados en bulk`);

  return {
    created: data.length,
    total_hours: totalHours,
    timeEntries: data
  };
};

/**
 * Validar permisos para eliminar registros
 */
const validateDeletePermissions = async (entryIds, requestingUser) => {
  const { data: existing, error: fetchError } = await supabase
    .from('time_entries')
    .select('id, user_id')
    .in('id', entryIds);

  if (fetchError) {
    logger.error('Error verificando permisos de eliminación:', fetchError);
    throw new Error('Error verificando permisos');
  }

  // Verificar permisos
  const unauthorized = existing.some(entry => 
    entry.user_id !== requestingUser.id && 
    !hasPermission(requestingUser.role, 'DELETE_ANY_ENTRY')
  );

  if (unauthorized) {
    throw new Error('No puedes eliminar registros de otros usuarios');
  }

  return existing;
};

/**
 * Eliminar múltiples time entries (bulk)
 */
const deleteBulk = async (ids, requestingUser) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new Error('Se requiere un array de IDs');
  }

  // Validar permisos
  await validateDeletePermissions(ids, requestingUser);

  // Eliminar todos de una vez
  const { error } = await supabase
    .from('time_entries')
    .delete()
    .in('id', ids);

  if (error) {
    logger.error('Error eliminando registros:', error);
    throw new Error('Error eliminando registros de tiempo');
  }

  logger.info(`${ids.length} time entries eliminados`);
  return { deleted: ids.length };
};

/**
 * Eliminar un time entry
 */
const deleteOne = async (entryId, requestingUser) => {
  // Validar permisos
  await validateDeletePermissions([entryId], requestingUser);

  const { error } = await supabase
    .from('time_entries')
    .delete()
    .eq('id', entryId);

  if (error) {
    logger.error('Error eliminando registro:', error);
    throw new Error('Error eliminando registro de tiempo');
  }

  logger.info('Time entry eliminado:', entryId);
  return { deleted: 1 };
};

export default {
  getAll,
  create,
  update,
  createBulk,
  deleteBulk,
  deleteOne
};
