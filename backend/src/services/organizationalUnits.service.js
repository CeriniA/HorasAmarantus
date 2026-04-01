/**
 * Organizational Units Service
 */

import { supabase } from '../config/database.js';
import logger from '../utils/logger.js';

const getAll = async () => {
  const { data, error } = await supabase
    .from('organizational_units')
    .select('*')
    .eq('is_active', true)
    .order('path');

  if (error) {
    logger.error('Error obteniendo unidades:', error);
    throw new Error('Error obteniendo unidades organizacionales');
  }

  return data;
};

const getById = async (id) => {
  const { data, error } = await supabase
    .from('organizational_units')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new Error('Unidad no encontrada');
  }

  return data;
};

const create = async (unitData) => {
  // Explicitly create the object to insert, ignoring any other properties.
  const newUnit = {
    name: unitData.name,
    type: unitData.type,
    parent_id: unitData.parent_id
  };

  const { data, error } = await supabase
    .from('organizational_units')
    .insert(newUnit)
    .select()
    .single();

  if (error) {
    logger.error('Error creando unidad:', error);
    throw new Error('Error creando unidad organizacional');
  }

  logger.info('Unidad organizacional creada:', data.name);
  return data;
};

const update = async (id, updates) => {
  const { data, error } = await supabase
    .from('organizational_units')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logger.error('Error actualizando unidad:', error);
    throw new Error('Error actualizando unidad organizacional');
  }

  logger.info('Unidad organizacional actualizada:', id);
  return data;
};

const createBulk = async (units) => {
  // Llamar a la función RPC de Supabase para la inserción masiva
  const { data, error } = await supabase.rpc('bulk_insert_org_units', { units_to_insert: units });

  if (error) {
    logger.error('Error en la inserción masiva de unidades:', error);
    throw new Error('Error en la inserción masiva de unidades organizacionales');
  }

  logger.info('Inserción masiva completada:', { created: data.created_count, updated: data.updated_count, errors: data.errors });
  return data;
};

const deleteUnit = async (id) => {
  const { error } = await supabase
    .from('organizational_units')
    .delete()
    .eq('id', id);

  if (error) {
    logger.error('Error eliminando unidad:', error);
    throw new Error('Error eliminando unidad organizacional');
  }

  logger.info('Unidad organizacional eliminada:', id);
  return true;
};

export default {
  getAll,
  getById,
  create,
  update,
  deleteUnit,
  createBulk
};
