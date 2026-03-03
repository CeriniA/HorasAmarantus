import Dexie from 'dexie';

// Crear base de datos IndexedDB para almacenamiento offline
export const db = new Dexie('SistemaHorasDB');

// Definir schema de la base de datos local
db.version(1).stores({
  // Usuarios (cache local)
  users: 'id, email, role, organizational_unit_id',
  
  // Unidades organizacionales (cache local)
  organizational_units: 'id, parent_id, type, level, name',
  
  // Registros de horas (con sincronización)
  time_entries: 'id, client_id, user_id, organizational_unit_id, start_time, status, pending_sync',
  
  // Cola de sincronización
  sync_queue: '++id, entity_type, entity_id, action, timestamp, retry_count',
  
  // Metadata de sincronización
  sync_metadata: 'key, value, updated_at'
});

// =====================================================
// HELPERS PARA SYNC QUEUE
// =====================================================

export const addToSyncQueue = async (entityType, entityId, action, data) => {
  try {
    await db.sync_queue.add({
      entity_type: entityType,
      entity_id: entityId,
      action: action, // 'create', 'update', 'delete'
      data: data,
      timestamp: new Date().toISOString(),
      retry_count: 0,
      error: null
    });
  } catch (error) {
    console.error('Error adding to sync queue:', error);
  }
};

export const getSyncQueue = async () => {
  try {
    return await db.sync_queue.orderBy('timestamp').toArray();
  } catch (error) {
    console.error('Error getting sync queue:', error);
    return [];
  }
};

export const removeSyncQueueItem = async (id) => {
  try {
    await db.sync_queue.delete(id);
  } catch (error) {
    console.error('Error removing sync queue item:', error);
  }
};

export const updateSyncQueueItem = async (id, updates) => {
  try {
    await db.sync_queue.update(id, updates);
  } catch (error) {
    console.error('Error updating sync queue item:', error);
  }
};

export const clearSyncQueue = async () => {
  try {
    await db.sync_queue.clear();
  } catch (error) {
    console.error('Error clearing sync queue:', error);
  }
};

// =====================================================
// HELPERS PARA TIME ENTRIES
// =====================================================

export const saveTimeEntryLocally = async (entry) => {
  try {
    // Si no tiene client_id, generar uno
    if (!entry.client_id) {
      entry.client_id = crypto.randomUUID();
    }
    
    // Marcar como pendiente de sincronización
    entry.pending_sync = true;
    entry.synced_at = null;
    
    // Guardar en IndexedDB
    await db.time_entries.put(entry);
    
    // Agregar a cola de sincronización
    await addToSyncQueue('time_entries', entry.client_id, 'create', entry);
    
    return entry;
  } catch (error) {
    console.error('Error saving time entry locally:', error);
    throw error;
  }
};

export const updateTimeEntryLocally = async (clientId, updates) => {
  try {
    const entry = await db.time_entries.get({ client_id: clientId });
    if (!entry) {
      throw new Error('Time entry not found');
    }
    
    const updatedEntry = { ...entry, ...updates, pending_sync: true };
    await db.time_entries.put(updatedEntry);
    
    // Agregar a cola de sincronización
    await addToSyncQueue('time_entries', clientId, 'update', updatedEntry);
    
    return updatedEntry;
  } catch (error) {
    console.error('Error updating time entry locally:', error);
    throw error;
  }
};

export const deleteTimeEntryLocally = async (clientId) => {
  try {
    await db.time_entries.delete(clientId);
    await addToSyncQueue('time_entries', clientId, 'delete', { client_id: clientId });
  } catch (error) {
    console.error('Error deleting time entry locally:', error);
    throw error;
  }
};

export const getLocalTimeEntries = async (userId) => {
  try {
    if (userId) {
      return await db.time_entries.where('user_id').equals(userId).toArray();
    }
    return await db.time_entries.toArray();
  } catch (error) {
    console.error('Error getting local time entries:', error);
    return [];
  }
};

export const getPendingSyncTimeEntries = async () => {
  try {
    return await db.time_entries.where('pending_sync').equals(true).toArray();
  } catch (error) {
    console.error('Error getting pending sync time entries:', error);
    return [];
  }
};

// =====================================================
// HELPERS PARA ORGANIZATIONAL UNITS (CACHE)
// =====================================================

export const cacheOrganizationalUnits = async (units) => {
  try {
    await db.organizational_units.bulkPut(units);
  } catch (error) {
    console.error('Error caching organizational units:', error);
  }
};

export const getLocalOrganizationalUnits = async () => {
  try {
    return await db.organizational_units.toArray();
  } catch (error) {
    console.error('Error getting local organizational units:', error);
    return [];
  }
};

export const getOrganizationalUnitById = async (id) => {
  try {
    return await db.organizational_units.get(id);
  } catch (error) {
    console.error('Error getting organizational unit by id:', error);
    return null;
  }
};

// =====================================================
// HELPERS PARA USERS (CACHE)
// =====================================================

export const cacheUsers = async (users) => {
  try {
    await db.users.bulkPut(users);
  } catch (error) {
    console.error('Error caching users:', error);
  }
};

export const getLocalUsers = async () => {
  try {
    return await db.users.toArray();
  } catch (error) {
    console.error('Error getting local users:', error);
    return [];
  }
};

export const getUserById = async (id) => {
  try {
    return await db.users.get(id);
  } catch (error) {
    console.error('Error getting user by id:', error);
    return null;
  }
};

// =====================================================
// HELPERS PARA SYNC METADATA
// =====================================================

export const setSyncMetadata = async (key, value) => {
  try {
    await db.sync_metadata.put({
      key,
      value,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error setting sync metadata:', error);
  }
};

export const getSyncMetadata = async (key) => {
  try {
    const metadata = await db.sync_metadata.get(key);
    return metadata?.value || null;
  } catch (error) {
    console.error('Error getting sync metadata:', error);
    return null;
  }
};

// =====================================================
// LIMPIAR BASE DE DATOS LOCAL
// =====================================================

export const clearLocalDatabase = async () => {
  try {
    await db.time_entries.clear();
    await db.organizational_units.clear();
    await db.users.clear();
    await db.sync_queue.clear();
    await db.sync_metadata.clear();
  } catch (error) {
    console.error('Error clearing local database:', error);
  }
};

// =====================================================
// ESTADÍSTICAS DE LA BASE DE DATOS LOCAL
// =====================================================

export const getLocalDatabaseStats = async () => {
  try {
    const [
      timeEntriesCount,
      orgUnitsCount,
      usersCount,
      syncQueueCount,
      pendingSyncCount
    ] = await Promise.all([
      db.time_entries.count(),
      db.organizational_units.count(),
      db.users.count(),
      db.sync_queue.count(),
      db.time_entries.where('pending_sync').equals(true).count()
    ]);
    
    return {
      timeEntries: timeEntriesCount,
      organizationalUnits: orgUnitsCount,
      users: usersCount,
      syncQueue: syncQueueCount,
      pendingSync: pendingSyncCount
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return {
      timeEntries: 0,
      organizationalUnits: 0,
      users: 0,
      syncQueue: 0,
      pendingSync: 0
    };
  }
};

export default db;
