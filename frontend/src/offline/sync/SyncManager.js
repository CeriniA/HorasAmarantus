/**
 * Gestor principal de sincronización
 * Orquesta la sincronización de todos los tipos de entidades
 */

import { SyncQueue } from './SyncQueue.js';
import { db } from '../core/db.js';
import { connectivityService } from '../../services/ConnectivityService.js';
import logger from '../../utils/logger.js';

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
    logger.info('✅ Conexión restaurada, sincronizando...');
    this.sync();
  }

  /**
   * Handler para evento offline
   */
  handleOffline() {
    logger.info('📴 Conexión perdida, modo offline activado');
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
   * ✅ MEJORADO: Usa ConnectivityService para verificar backend real
   */
  async isOnline() {
    const status = await connectivityService.checkConnectivity();
    return status.online && status.backend;
  }

  /**
   * Verificar conectividad real con el backend (solo cuando sea necesario)
   * ✅ MEJORADO: Delega al ConnectivityService
   */
  async checkBackendHealth() {
    return await connectivityService.isBackendReachable();
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
          // ✅ NUEVO: Verificar si debe saltarse por exponential backoff
          if (this.shouldSkipRetry(item)) {
            const requiredDelay = this.calculateBackoff(item.retry_count);
            const lastRetry = new Date(item.last_retry_at);
            const timeSinceLastRetry = Date.now() - lastRetry.getTime();
            const remainingDelay = Math.ceil((requiredDelay - timeSinceLastRetry) / 1000);
            
            if (import.meta.env.DEV) {
              console.log(`⏸️ Item #${item.id} esperando backoff (${remainingDelay}s restantes)`);
            }
            continue; // Saltar este item por ahora
          }

          if (import.meta.env.DEV) {
            console.log(`🔄 Sincronizando item #${item.id}:`, {
              type: item.entity_type,
              action: item.action,
              entity_id: item.entity_id,
              retry: item.retry_count || 0
            });
          }
          
          // ✅ MEJORADO: Sincronizar PRIMERO
          // Solo si tiene éxito, remover de la cola
          await this.syncItem(item);
          
          if (import.meta.env.DEV) {
            console.log(`✅ Item #${item.id} sincronizado exitosamente`);
          }
          
          // ✅ Solo remover si la sincronización fue exitosa
          await this.queue.remove(item.id);
          
          if (import.meta.env.DEV) {
            console.log(`🗑️ Item #${item.id} removido de cola`);
          }
          
          results.synced++;
          
        } catch (error) {
          console.error(`❌ Error syncing item ${item.id}:`, error);
          results.failed++;
          results.errors.push({
            item: item.id,
            error: error.message
          });

          // ✅ MEJORADO: Clasificar error y decidir estrategia
          const errorType = this.classifyError(error);
          const retryCount = (item.retry_count || 0) + 1;
          const maxRetries = 5;
          
          // Marcar como permanente si:
          // 1. Es un error permanente (400, 404, etc.)
          // 2. O se excedió el número de reintentos
          const isPermanentError = errorType === 'permanent' || retryCount > maxRetries;
          
          try {
            // Actualizar el item existente en lugar de crear uno nuevo
            await this.queue.update(item.id, {
              retry_count: retryCount,
              error: error.message,
              error_type: errorType,
              permanent_error: isPermanentError,
              last_retry_at: new Date().toISOString()
            });
            
            if (import.meta.env.DEV) {
              if (isPermanentError) {
                const reason = errorType === 'permanent' 
                  ? `error ${errorType}` 
                  : `${retryCount} intentos`;
                console.warn(`⚠️ Item #${item.id} marcado como error permanente (${reason})`);
              } else {
                const nextDelay = this.calculateBackoff(retryCount);
                console.log(`🔁 Item #${item.id} se reintentará en ${nextDelay/1000}s (intento ${retryCount}/${maxRetries}, tipo: ${errorType})`);
              }
            }
          } catch (updateError) {
            console.error('Error actualizando item en cola:', updateError);
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
   * ✅ NUEVO: Clasificar tipo de error
   * @param {Error} error - Error a clasificar
   * @returns {string} 'permanent' | 'temporary' | 'network'
   */
  classifyError(error) {
    // Errores de red
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return 'network';
    }

    // Errores HTTP
    const status = error.response?.status;
    
    if (!status) {
      return 'network';
    }

    // Errores permanentes (no reintentar)
    // 400: Bad Request - datos inválidos
    // 401: Unauthorized - no autenticado
    // 403: Forbidden - sin permisos
    // 404: Not Found - recurso no existe
    // 409: Conflict - conflicto de datos
    // 422: Unprocessable Entity - validación falló
    if ([400, 401, 403, 404, 409, 422].includes(status)) {
      return 'permanent';
    }

    // Errores temporales (reintentar)
    // 500: Internal Server Error
    // 502: Bad Gateway
    // 503: Service Unavailable
    // 504: Gateway Timeout
    if ([500, 502, 503, 504].includes(status)) {
      return 'temporary';
    }

    // Por defecto, considerar temporal
    return 'temporary';
  }

  /**
   * ✅ NUEVO: Calcular delay para exponential backoff
   * @param {number} retryCount - Número de reintentos
   * @returns {number} Delay en milisegundos
   */
  calculateBackoff(retryCount) {
    // Exponential backoff: 2^n * 1000ms
    // Retry 0: 0ms (primer intento)
    // Retry 1: 2s
    // Retry 2: 4s
    // Retry 3: 8s
    // Retry 4: 16s
    // Retry 5: 32s
    // Máximo: 60s
    const baseDelay = 1000; // 1 segundo
    const maxDelay = 60000; // 60 segundos
    
    if (retryCount === 0) {
      return 0; // Sin delay en el primer intento
    }

    const delay = Math.pow(2, retryCount) * baseDelay;
    return Math.min(delay, maxDelay);
  }

  /**
   * ✅ NUEVO: Verificar si un item debe ser reintentado
   * @param {Object} item - Item de la cola
   * @returns {boolean} true si debe esperar más tiempo
   */
  shouldSkipRetry(item) {
    if (!item.last_retry_at || !item.retry_count) {
      return false; // Primer intento
    }

    const lastRetry = new Date(item.last_retry_at);
    const now = new Date();
    const timeSinceLastRetry = now - lastRetry;
    
    const requiredDelay = this.calculateBackoff(item.retry_count);
    
    return timeSinceLastRetry < requiredDelay;
  }

  /**
   * ✅ NUEVO: Sleep helper
   * @param {number} ms - Milisegundos a esperar
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
