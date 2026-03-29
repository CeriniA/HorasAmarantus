/**
 * Gestión de la cola de sincronización
 * Responsable de agregar, obtener y eliminar items de la cola
 */

import { db } from '../core/db.js';
import logger from '../../utils/logger.js';

export class SyncQueue {
  constructor() {
    this.table = db.sync_queue;
  }

  /**
   * Agregar item a la cola
   * ✅ MEJORADO: Consolida operaciones para evitar duplicados
   */
  async add(entityType, entityId, action, data) {
    // Buscar TODAS las operaciones para esta entidad
    const existingItems = await this.table
      .where('entity_type').equals(entityType)
      .and(item => item.entity_id === entityId)
      .toArray();
    
    if (existingItems.length > 0) {
      // Consolidar operaciones
      const consolidated = this.consolidateOperations(existingItems, action, data);
      
      if (consolidated === null) {
        // Operaciones se cancelan (ej: create + delete)
        // Eliminar todas las operaciones existentes
        for (const item of existingItems) {
          await this.table.delete(item.id);
        }
        
        logger.debug(`🔄 Operaciones consolidadas y canceladas para ${entityType}#${entityId}`);
        
        return null;
      }
      
      // Eliminar operaciones antiguas
      for (const item of existingItems) {
        await this.table.delete(item.id);
      }
      
      // Agregar operación consolidada
      const id = await this.table.add(consolidated);
      
      logger.debug(`🔄 Operaciones consolidadas para ${entityType}#${entityId}:`, {
        previous: existingItems.length,
        action: consolidated.action
      });
      
      return id;
    }
    
    // No hay operaciones previas, agregar nueva
    const id = await this.table.add({
      entity_type: entityType,
      entity_id: entityId,
      action,
      data,
      timestamp: new Date().toISOString(),
      retry_count: 0,
      error: null
    });
    
    logger.debug(`✅ Item agregado a cola #${id}:`, {
      type: entityType,
      entity_id: entityId,
      action
    });
    
    return id;
  }

  /**
   * ✅ NUEVO: Consolidar operaciones para la misma entidad
   * Reglas de consolidación:
   * - create + update = create (con datos actualizados)
   * - create + delete = null (cancelar ambas)
   * - update + update = update (con datos más recientes)
   * - update + delete = delete
   * - delete + * = delete (delete siempre gana)
   */
  consolidateOperations(existingItems, newAction, newData) {
    // Ordenar por timestamp (más antiguo primero)
    const sorted = existingItems.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    // Obtener la última operación
    const lastOp = sorted[sorted.length - 1];
    
    // Reglas de consolidación
    if (lastOp.action === 'create') {
      if (newAction === 'update') {
        // create + update = create (con datos actualizados)
        return {
          entity_type: lastOp.entity_type,
          entity_id: lastOp.entity_id,
          action: 'create',
          data: { ...lastOp.data, ...newData },
          timestamp: new Date().toISOString(),
          retry_count: 0,
          error: null
        };
      } else if (newAction === 'delete') {
        // create + delete = null (cancelar ambas)
        // El registro nunca llegó al servidor, no hay nada que eliminar
        return null;
      } else if (newAction === 'create') {
        // create + create = create (con datos más recientes)
        return {
          entity_type: lastOp.entity_type,
          entity_id: lastOp.entity_id,
          action: 'create',
          data: newData,
          timestamp: new Date().toISOString(),
          retry_count: 0,
          error: null
        };
      }
    }
    
    if (lastOp.action === 'update') {
      if (newAction === 'update') {
        // update + update = update (con datos más recientes)
        return {
          entity_type: lastOp.entity_type,
          entity_id: lastOp.entity_id,
          action: 'update',
          data: { ...lastOp.data, ...newData },
          timestamp: new Date().toISOString(),
          retry_count: 0,
          error: null
        };
      } else if (newAction === 'delete') {
        // update + delete = delete
        return {
          entity_type: lastOp.entity_type,
          entity_id: lastOp.entity_id,
          action: 'delete',
          data: { id: lastOp.entity_id },
          timestamp: new Date().toISOString(),
          retry_count: 0,
          error: null
        };
      } else if (newAction === 'create') {
        // update + create = create (reemplazo completo)
        return {
          entity_type: lastOp.entity_type,
          entity_id: lastOp.entity_id,
          action: 'create',
          data: newData,
          timestamp: new Date().toISOString(),
          retry_count: 0,
          error: null
        };
      }
    }
    
    if (lastOp.action === 'delete') {
      // delete + cualquier cosa = delete (delete siempre gana)
      return {
        entity_type: lastOp.entity_type,
        entity_id: lastOp.entity_id,
        action: 'delete',
        data: lastOp.data,
        timestamp: new Date().toISOString(),
        retry_count: 0,
        error: null
      };
    }
    
    // Fallback: mantener la nueva operación
    return {
      entity_type: lastOp.entity_type,
      entity_id: lastOp.entity_id,
      action: newAction,
      data: newData,
      timestamp: new Date().toISOString(),
      retry_count: 0,
      error: null
    };
  }

  /**
   * Obtener todos los items de la cola
   */
  async getAll() {
    return await this.table.orderBy('timestamp').toArray();
  }

  /**
   * Obtener items pendientes (sin error permanente)
   */
  async getPending() {
    const all = await this.getAll();
    return all.filter(item => !item.permanent_error);
  }

  /**
   * Obtener items con error permanente
   */
  async getErrors() {
    const all = await this.getAll();
    return all.filter(item => item.permanent_error);
  }

  /**
   * Eliminar item de la cola
   */
  async remove(id) {
    await this.table.delete(id);
  }

  /**
   * Actualizar item de la cola
   */
  async update(id, updates) {
    const updated = await this.table.update(id, updates);
    
    if (updated === 0 && import.meta.env.DEV) {
      console.warn(`Sync queue item ${id} not found for update`);
    }
    
    return updated > 0;
  }

  /**
   * Incrementar contador de reintentos
   */
  async incrementRetry(id, errorMessage) {
    const item = await this.table.get(id);
    if (!item) return false;

    const retryCount = (item.retry_count || 0) + 1;
    const updates = {
      retry_count: retryCount,
      error: errorMessage,
      ...(retryCount > 5 && { permanent_error: true })
    };

    return await this.update(id, updates);
  }

  /**
   * Limpiar toda la cola
   */
  async clear() {
    await this.table.clear();
  }

  /**
   * Contar items en la cola
   */
  async count() {
    return await this.table.count();
  }

  /**
   * Contar items pendientes
   */
  async countPending() {
    const pending = await this.getPending();
    return pending.length;
  }
}

export default SyncQueue;
