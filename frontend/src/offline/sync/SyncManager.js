/**
 * Gestor principal de sincronización
 * Orquesta la sincronización de todos los tipos de entidades
 */

import { SyncQueue } from './SyncQueue.js';
import { db } from '../core/db.js';

// URL base del API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class SyncManager {
  constructor() {
    this.queue = new SyncQueue();
    this.strategies = new Map();
    this.isRunning = false;
    this.listeners = [];
    this.syncInterval = null;
    this.isAutoSyncStarted = false;
    
    // Bind event handlers para poder removerlos después
    this.handleOnline = this.handleOnline.bind(this);
    this.handleOffline = this.handleOffline.bind(this);
  }

  /**
   * Registrar estrategia de sincronización para un tipo de entidad
   */
  registerStrategy(entityType, strategy) {
    this.strategies.set(entityType, strategy);
  }

  /**
   * Handler para evento online
   */
  handleOnline() {
    if (import.meta.env.DEV) {
      console.log('✅ Conexión restaurada, sincronizando...');
    }
    this.sync();
  }

  /**
   * Handler para evento offline
   */
  handleOffline() {
    if (import.meta.env.DEV) {
      console.log('❌ Conexión perdida, modo offline activado');
    }
    this.notifyListeners({ type: 'offline' });
  }

  /**
   * Iniciar sincronización automática
   */
  startAutoSync(intervalMs = 30000) {
    // Prevenir múltiples inicializaciones
    if (this.isAutoSyncStarted) {
      if (import.meta.env.DEV) {
        console.warn('⚠️ AutoSync ya está iniciado, ignorando...');
      }
      return;
    }

    this.isAutoSyncStarted = true;

    if (import.meta.env.DEV) {
      console.log('🚀 Iniciando AutoSync...');
    }

    // Sincronizar inmediatamente
    this.sync();

    // Configurar sincronización periódica
    this.syncInterval = window.setInterval(() => {
      this.sync();
    }, intervalMs);

    // Escuchar cambios de conectividad (solo una vez)
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  /**
   * Detener sincronización automática
   */
  stopAutoSync() {
    if (import.meta.env.DEV) {
      console.log('🛑 Deteniendo AutoSync...');
    }

    if (this.syncInterval) {
      window.clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    // Remover event listeners
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);

    this.isAutoSyncStarted = false;
  }

  /**
   * Agregar listener para eventos de sincronización
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Remover listener
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  /**
   * Notificar a los listeners
   */
  notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }

  /**
   * Verificar si hay conexión a internet
   * Solo usa navigator.onLine para evitar peticiones innecesarias al backend
   */
  async isOnline() {
    return navigator.onLine;
  }

  /**
   * Verificar conectividad real con el backend (solo cuando sea necesario)
   */
  async checkBackendHealth() {
    try {
      const response = await fetch(`${API_URL}/health`, { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Sincronizar todos los items pendientes
   */
  async sync() {
    if (this.isRunning) {
      if (import.meta.env.DEV) {
        console.log('⏸️ Sincronización ya en progreso, saltando...');
      }
      return { success: false, message: 'Sync already in progress' };
    }

    const online = await this.isOnline();
    if (!online) {
      if (import.meta.env.DEV) {
        console.log('📴 Sin conexión, sincronización pospuesta');
      }
      this.notifyListeners({ type: 'offline' });
      return { success: false, message: 'No internet connection' };
    }

    this.isRunning = true;
    this.notifyListeners({ type: 'sync_start' });

    const results = {
      success: true,
      synced: 0,
      failed: 0,
      errors: []
    };

    try {
      const items = await this.queue.getPending();
      
      if (import.meta.env.DEV) {
        console.log(`🔄 Sincronizando ${items.length} items...`);
      }

      for (const item of items) {
        try {
          if (import.meta.env.DEV) {
            console.log(`🔄 Sincronizando item #${item.id}:`, {
              type: item.entity_type,
              action: item.action,
              entity_id: item.entity_id
            });
          }
          
          // CRÍTICO: Remover de la cola ANTES de sincronizar
          // Esto previene que otra llamada a sync() vea el mismo item
          await this.queue.remove(item.id);
          
          if (import.meta.env.DEV) {
            console.log(`🗑️ Item #${item.id} removido de cola, sincronizando...`);
          }
          
          // Ahora sincronizar
          await this.syncItem(item);
          
          if (import.meta.env.DEV) {
            console.log(`✅ Item #${item.id} sincronizado exitosamente`);
          }
          
          results.synced++;
          
        } catch (error) {
          console.error(`❌ Error syncing item ${item.id}:`, error);
          results.failed++;
          results.errors.push({
            item: item.id,
            error: error.message
          });

          // IMPORTANTE: Re-agregar a la cola porque falló
          // Incrementar retry_count
          const retryCount = (item.retry_count || 0) + 1;
          const isPermanentError = retryCount > 5;
          
          try {
            await this.queue.table.add({
              entity_type: item.entity_type,
              entity_id: item.entity_id,
              action: item.action,
              data: item.data,
              timestamp: new Date().toISOString(),
              retry_count: retryCount,
              error: error.message,
              permanent_error: isPermanentError
            });
            
            if (import.meta.env.DEV) {
              console.log(`🔁 Item #${item.id} re-agregado a cola (retry: ${retryCount})`);
            }
          } catch (reAddError) {
            console.error('Error re-agregando item a cola:', reAddError);
          }
        }
      }

      // Actualizar metadata
      await this.setSyncMetadata('last_sync', new Date().toISOString());
      await this.setSyncMetadata('last_sync_result', results);

      this.notifyListeners({ 
        type: 'sync_complete', 
        data: results 
      });

      if (import.meta.env.DEV) {
        console.log('✅ Sincronización completada:', results);
      }

      return results;

    } catch (error) {
      console.error('❌ Error durante sincronización:', error);
      this.notifyListeners({ 
        type: 'sync_error', 
        error: error.message 
      });
      return { 
        success: false, 
        message: error.message 
      };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Sincronizar un item individual
   */
  async syncItem(item) {
    const strategy = this.strategies.get(item.entity_type);
    
    if (!strategy) {
      throw new Error(`No strategy registered for entity type: ${item.entity_type}`);
    }

    return await strategy.sync(item);
  }

  /**
   * Obtener estado de sincronización
   */
  async getSyncStatus() {
    const [lastSync, queueCount] = await Promise.all([
      this.getSyncMetadata('last_sync'),
      this.queue.count()
    ]);

    // Contar pendientes filtrando en memoria
    const allEntries = await db.time_entries.toArray();
    const pendingCount = allEntries.filter(entry => entry.pending_sync === true).length;

    return {
      lastSync,
      pendingCount,
      queueCount,
      isSyncing: this.isRunning,
      isOnline: await this.isOnline()
    };
  }

  /**
   * Guardar metadata de sincronización
   */
  async setSyncMetadata(key, value) {
    await db.sync_metadata.put({
      key,
      value,
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Obtener metadata de sincronización
   */
  async getSyncMetadata(key) {
    const metadata = await db.sync_metadata.get(key);
    return metadata?.value || null;
  }
}

export default SyncManager;
