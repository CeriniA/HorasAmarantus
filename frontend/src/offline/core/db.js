/**
 * Configuración de IndexedDB con Dexie
 * Solo responsable de la configuración del esquema
 */

import Dexie from 'dexie';

// Crear base de datos IndexedDB
export const db = new Dexie('SistemaHorasDB');

// Definir schema
db.version(1).stores({
  // Usuarios (cache local)
  users: 'id, username, role, organizational_unit_id',
  
  // Unidades organizacionales (cache local)
  organizational_units: 'id, parent_id, type, level, name',
  
  // Registros de horas (con sincronización)
  time_entries: 'id, client_id, user_id, organizational_unit_id, start_time, end_time, status, pending_sync',
  
  // Cola de sincronización
  sync_queue: '++id, entity_type, entity_id, action, timestamp, retry_count',
  
  // Metadata de sincronización
  sync_metadata: 'key, value, updated_at',
  
  // ✅ NUEVO: Mapeo de IDs temporales a IDs del servidor
  id_mappings: 'temp_id, server_id, entity_type, created_at'
});

export default db;
