import { supabase } from '../config/supabase';
import {
  getSyncQueue,
  removeSyncQueueItem,
  updateSyncQueueItem,
  getPendingSyncTimeEntries,
  setSyncMetadata,
  getSyncMetadata,
  db
} from '../db/indexedDB';

// =====================================================
// SERVICIO DE SINCRONIZACIÓN
// =====================================================

class SyncService {
  constructor() {
    this.isSyncing = false;
    this.syncInterval = null;
    this.listeners = [];
  }

  // Iniciar sincronización automática
  startAutoSync(intervalMs = 30000) { // 30 segundos por defecto
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Sincronizar inmediatamente
    this.sync();

    // Configurar sincronización periódica
    this.syncInterval = setInterval(() => {
      this.sync();
    }, intervalMs);

    // Escuchar cambios de conectividad
    window.addEventListener('online', () => {
      console.log('Conexión restaurada, sincronizando...');
      this.sync();
    });

    window.addEventListener('offline', () => {
      console.log('Conexión perdida, modo offline activado');
      this.notifyListeners({ type: 'offline' });
    });
  }

  // Detener sincronización automática
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Agregar listener para eventos de sincronización
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Remover listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  // Notificar a los listeners
  notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }

  // Verificar si hay conexión a internet
  async isOnline() {
    if (!navigator.onLine) {
      return false;
    }

    try {
      // Intentar hacer una petición pequeña a Supabase
      const { error } = await supabase.from('users').select('id').limit(1);
      return !error;
    } catch (error) {
      return false;
    }
  }

  // Sincronizar todos los datos pendientes
  async sync() {
    if (this.isSyncing) {
      console.log('Sincronización ya en progreso, saltando...');
      return { success: false, message: 'Sync already in progress' };
    }

    const online = await this.isOnline();
    if (!online) {
      console.log('Sin conexión, sincronización pospuesta');
      this.notifyListeners({ type: 'offline' });
      return { success: false, message: 'No internet connection' };
    }

    this.isSyncing = true;
    this.notifyListeners({ type: 'sync_start' });

    try {
      const results = {
        success: true,
        synced: 0,
        failed: 0,
        errors: []
      };

      // Obtener cola de sincronización
      const queue = await getSyncQueue();
      
      console.log(`Sincronizando ${queue.length} items...`);

      for (const item of queue) {
        try {
          await this.syncItem(item);
          await removeSyncQueueItem(item.id);
          results.synced++;
        } catch (error) {
          console.error(`Error syncing item ${item.id}:`, error);
          results.failed++;
          results.errors.push({
            item: item.id,
            error: error.message
          });

          // Incrementar contador de reintentos
          const retryCount = (item.retry_count || 0) + 1;
          
          // Si ha fallado más de 5 veces, marcar como error permanente
          if (retryCount > 5) {
            await updateSyncQueueItem(item.id, {
              retry_count: retryCount,
              error: error.message,
              permanent_error: true
            });
          } else {
            await updateSyncQueueItem(item.id, {
              retry_count: retryCount,
              error: error.message
            });
          }
        }
      }

      // Actualizar metadata de última sincronización
      await setSyncMetadata('last_sync', new Date().toISOString());
      await setSyncMetadata('last_sync_result', results);

      this.notifyListeners({ 
        type: 'sync_complete', 
        data: results 
      });

      console.log('Sincronización completada:', results);
      return results;

    } catch (error) {
      console.error('Error durante sincronización:', error);
      this.notifyListeners({ 
        type: 'sync_error', 
        error: error.message 
      });
      return { 
        success: false, 
        message: error.message 
      };
    } finally {
      this.isSyncing = false;
    }
  }

  // Sincronizar un item individual
  async syncItem(item) {
    const { entity_type, action, data } = item;

    switch (entity_type) {
      case 'time_entries':
        return await this.syncTimeEntry(action, data);
      
      case 'users':
        return await this.syncUser(action, data);
      
      case 'organizational_units':
        return await this.syncOrganizationalUnit(action, data);
      
      default:
        throw new Error(`Unknown entity type: ${entity_type}`);
    }
  }

  // Sincronizar registro de horas
  async syncTimeEntry(action, data) {
    switch (action) {
      case 'create': {
        // Verificar si ya existe en el servidor (por client_id)
        const { data: existing } = await supabase
          .from('time_entries')
          .select('id')
          .eq('client_id', data.client_id)
          .single();

        if (existing) {
          // Ya existe, actualizar local con el ID del servidor
          await db.time_entries.update(data.client_id, {
            id: existing.id,
            pending_sync: false,
            synced_at: new Date().toISOString()
          });
          return;
        }

        // Crear en el servidor
        const { data: created, error } = await supabase
          .from('time_entries')
          .insert({
            client_id: data.client_id,
            user_id: data.user_id,
            organizational_unit_id: data.organizational_unit_id,
            description: data.description,
            start_time: data.start_time,
            end_time: data.end_time,
            status: data.status
          })
          .select()
          .single();

        if (error) throw error;

        // Actualizar local con el ID del servidor
        await db.time_entries.update(data.client_id, {
          id: created.id,
          pending_sync: false,
          synced_at: new Date().toISOString()
        });
        break;
      }

      case 'update': {
        const { error } = await supabase
          .from('time_entries')
          .update({
            description: data.description,
            start_time: data.start_time,
            end_time: data.end_time,
            status: data.status
          })
          .eq('client_id', data.client_id);

        if (error) throw error;

        // Actualizar local
        await db.time_entries.update(data.client_id, {
          pending_sync: false,
          synced_at: new Date().toISOString()
        });
        break;
      }

      case 'delete': {
        const { error } = await supabase
          .from('time_entries')
          .delete()
          .eq('client_id', data.client_id);

        if (error) throw error;
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  // Sincronizar usuario (placeholder)
  async syncUser(action, data) {
    // Implementar según necesidades
    console.log('Syncing user:', action, data);
  }

  // Sincronizar unidad organizacional (placeholder)
  async syncOrganizationalUnit(action, data) {
    // Implementar según necesidades
    console.log('Syncing organizational unit:', action, data);
  }

  // Descargar datos del servidor a local
  async downloadData(userId) {
    try {
      const online = await this.isOnline();
      if (!online) {
        throw new Error('No hay conexión a internet');
      }

      // Descargar unidades organizacionales
      const { data: orgUnits, error: orgError } = await supabase
        .from('organizational_units')
        .select('*')
        .eq('is_active', true);

      if (orgError) throw orgError;

      await db.organizational_units.bulkPut(orgUnits);

      // Descargar usuarios (solo si es admin/supervisor)
      const { data: currentUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (currentUser?.role === 'admin' || currentUser?.role === 'supervisor') {
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*')
          .eq('is_active', true);

        if (usersError) throw usersError;
        await db.users.bulkPut(users);
      }

      // Descargar registros de horas del usuario
      const { data: timeEntries, error: timeError } = await supabase
        .from('time_entries')
        .select(`
          *,
          organizational_units(id, name, type),
          users(id, name, email)
        `)
        .eq('user_id', userId)
        .order('start_time', { ascending: false })
        .limit(100);

      if (timeError) throw timeError;

      // Guardar en IndexedDB
      for (const entry of timeEntries) {
        await db.time_entries.put({
          ...entry,
          pending_sync: false,
          synced_at: new Date().toISOString()
        });
      }

      await setSyncMetadata('last_download', new Date().toISOString());

      this.notifyListeners({ 
        type: 'download_complete',
        data: {
          orgUnits: orgUnits.length,
          timeEntries: timeEntries.length
        }
      });

      return {
        success: true,
        downloaded: {
          orgUnits: orgUnits.length,
          timeEntries: timeEntries.length
        }
      };

    } catch (error) {
      console.error('Error downloading data:', error);
      throw error;
    }
  }

  // Obtener estado de sincronización
  async getSyncStatus() {
    const [
      lastSync,
      lastDownload,
      pendingCount,
      queueCount
    ] = await Promise.all([
      getSyncMetadata('last_sync'),
      getSyncMetadata('last_download'),
      db.time_entries.where('pending_sync').equals(true).count(),
      db.sync_queue.count()
    ]);

    return {
      lastSync,
      lastDownload,
      pendingCount,
      queueCount,
      isSyncing: this.isSyncing,
      isOnline: await this.isOnline()
    };
  }
}

// Exportar instancia única (singleton)
export const syncService = new SyncService();

export default syncService;
