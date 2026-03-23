/**
 * Utilidades de debugging para sincronización
 */

import { syncManager } from '../offline/index.js';
import { db } from '../offline/core/db.js';

export const syncDebug = {
  /**
   * Ver estado completo de sincronización
   */
  async status() {
    console.group('📊 Estado de Sincronización');
    
    try {
      // Estado del SyncManager
      const status = await syncManager.getSyncStatus();
      console.log('SyncManager Status:', status);
      
      // Cola de sincronización
      const queue = await db.sync_queue.toArray();
      console.log('Cola de Sincronización:', queue);
      console.log('Items en cola:', queue.length);
      
      // Registros pendientes
      const pendingEntries = await db.time_entries
        .where('pending_sync')
        .equals(1)
        .toArray();
      console.log('Time Entries Pendientes:', pendingEntries);
      console.log('Entries pendientes:', pendingEntries.length);
      
      // Resumen
      console.log('\n📋 RESUMEN:');
      console.log(`  Cola: ${queue.length} items`);
      console.log(`  Pendientes: ${pendingEntries.length} entries`);
      console.log(`  Total: ${status.pendingCount + status.queueCount}`);
      
    } catch (error) {
      console.error('Error obteniendo estado:', error);
    }
    
    console.groupEnd();
  },

  /**
   * Limpiar cola de sincronización
   */
  async clearQueue() {
    console.log('🗑️ Limpiando cola de sincronización...');
    
    try {
      const count = await db.sync_queue.count();
      await db.sync_queue.clear();
      console.log(`✅ ${count} items eliminados de la cola`);
      
      // Actualizar estado
      await this.status();
    } catch (error) {
      console.error('Error limpiando cola:', error);
    }
  },

  /**
   * Limpiar registros pendientes
   */
  async clearPending() {
    console.log('🗑️ Limpiando registros pendientes...');
    
    try {
      const entries = await db.time_entries
        .where('pending_sync')
        .equals(1)
        .toArray();
      
      console.log(`Encontrados ${entries.length} registros pendientes`);
      
      // Marcar como sincronizados
      for (const entry of entries) {
        await db.time_entries.update(entry.id, {
          pending_sync: false,
          synced_at: new Date().toISOString()
        });
      }
      
      console.log(`✅ ${entries.length} registros marcados como sincronizados`);
      
      // Actualizar estado
      await this.status();
    } catch (error) {
      console.error('Error limpiando pendientes:', error);
    }
  },

  /**
   * Limpiar todo
   */
  async clearAll() {
    console.log('🗑️ Limpiando TODO...');
    await this.clearQueue();
    await this.clearPending();
    console.log('✅ Limpieza completa');
  },

  /**
   * Forzar sincronización
   */
  async forceSync() {
    console.log('🔄 Forzando sincronización...');
    
    try {
      const result = await syncManager.sync();
      console.log('Resultado:', result);
      await this.status();
    } catch (error) {
      console.error('Error en sincronización:', error);
    }
  },

  /**
   * Ver items con error permanente
   */
  async showErrors() {
    console.group('❌ Items con Error Permanente');
    
    try {
      const errors = await db.sync_queue
        .where('permanent_error')
        .equals(1)
        .toArray();
      
      console.log(`Encontrados ${errors.length} items con error permanente:`);
      errors.forEach((item, i) => {
        console.log(`\n${i + 1}. Item #${item.id}:`);
        console.log(`   Tipo: ${item.entity_type}`);
        console.log(`   Acción: ${item.action}`);
        console.log(`   Error: ${item.error}`);
        console.log(`   Reintentos: ${item.retry_count}`);
      });
      
    } catch (error) {
      console.error('Error obteniendo errores:', error);
    }
    
    console.groupEnd();
  },

  /**
   * Eliminar items con error permanente
   */
  async clearErrors() {
    console.log('🗑️ Eliminando items con error permanente...');
    
    try {
      const errors = await db.sync_queue
        .where('permanent_error')
        .equals(1)
        .toArray();
      
      for (const item of errors) {
        await db.sync_queue.delete(item.id);
      }
      
      console.log(`✅ ${errors.length} items con error eliminados`);
      await this.status();
    } catch (error) {
      console.error('Error eliminando errores:', error);
    }
  }
};

// Exponer globalmente para debugging
if (import.meta.env.DEV) {
  window.syncDebug = syncDebug;
  console.log('💡 Utilidades de Sync disponibles en window.syncDebug');
  console.log('Comandos disponibles:');
  console.log('  window.syncDebug.status()      - Ver estado completo');
  console.log('  window.syncDebug.clearQueue()  - Limpiar cola');
  console.log('  window.syncDebug.clearPending()- Limpiar pendientes');
  console.log('  window.syncDebug.clearAll()    - Limpiar todo');
  console.log('  window.syncDebug.forceSync()   - Forzar sync');
  console.log('  window.syncDebug.showErrors()  - Ver errores');
  console.log('  window.syncDebug.clearErrors() - Limpiar errores');
}

export default syncDebug;
