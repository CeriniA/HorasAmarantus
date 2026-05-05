/**
 * Configuración de IndexedDB con Dexie
 * Solo responsable de la configuración del esquema
 */

import Dexie from 'dexie';
import logger from '../../utils/logger';

// Crear base de datos IndexedDB
export const db = new Dexie('SistemaHorasDB');

// Definir schema - Versión 1 (inicial)
db.version(1).stores({
  users: 'id, username, role, organizational_unit_id',
  organizational_units: 'id, parent_id, type, level, name',
  time_entries: 'id, client_id, user_id, organizational_unit_id, start_time, end_time, status, pending_sync',
  sync_queue: '++id, entity_type, entity_id, action, timestamp, retry_count',
  sync_metadata: 'key, value, updated_at'
});

// Versión 2 - Agregar mapeo de IDs
db.version(2).stores({
  users: 'id, username, role, organizational_unit_id',
  organizational_units: 'id, parent_id, type, level, name',
  time_entries: 'id, client_id, user_id, organizational_unit_id, start_time, end_time, status, pending_sync',
  sync_queue: '++id, entity_type, entity_id, action, timestamp, retry_count',
  sync_metadata: 'key, value, updated_at',
  id_mappings: 'temp_id, server_id, entity_type, created_at'
});

// Versión 3 - Agregar campos faltantes para RBAC y time_entries offline
db.version(3).stores({
  users: 'id, username, email, name, role, role_id, organizational_unit_id',
  organizational_units: 'id, parent_id, type, level, name, is_active',
  time_entries: 'id, client_id, user_id, organizational_unit_id, description, start_time, end_time, total_hours, status, pending_sync, created_at, updated_at',
  sync_queue: '++id, entity_type, entity_id, action, timestamp, retry_count',
  sync_metadata: 'key, value, updated_at',
  id_mappings: 'temp_id, server_id, entity_type, created_at'
});

// Migración: limpiar datos inconsistentes
db.version(3).upgrade(async tx => {
  try {
    // Eliminar usuarios sin role_id o permissions (forzar re-login)
    const users = await tx.table('users').toArray();
    for (const user of users) {
      if (!user.role_id || !user.permissions) {
        await tx.table('users').delete(user.id);
      }
    }
    // Limpiar time_entries sin campos nuevos (re-sync)
    await tx.table('time_entries').clear();
  } catch (error) {
    logger.error('Error en migración db v3:', error);
  }
});

export default db;
