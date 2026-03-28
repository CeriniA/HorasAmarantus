/**
 * Configuración de IndexedDB con Dexie
 * Solo responsable de la configuración del esquema
 */

import Dexie from 'dexie';

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

export default db;
