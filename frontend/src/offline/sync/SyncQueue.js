/**
 * Gestión de la cola de sincronización
 * Responsable de agregar, obtener y eliminar items de la cola
 */

import { db } from '../core/db.js';

export class SyncQueue {
  constructor() {
    this.table = db.sync_queue;
  }

  /**
   * Agregar item a la cola
   * IMPORTANTE: Previene duplicados verificando si ya existe
   */
  async add(entityType, entityId, action, data) {
    // Verificar si ya existe un item idéntico en la cola
    const existing = await this.table
      .where('entity_type').equals(entityType)
      .and(item => item.entity_id === entityId && item.action === action)
      .first();
    
    if (existing) {
      if (import.meta.env.DEV) {
        console.warn(`⚠️ Item ya existe en cola:`, {
          type: entityType,
          id: entityId,
          action
        });
      }
      // Actualizar el item existente con los nuevos datos
      await this.table.update(existing.id, {
        data,
        timestamp: new Date().toISOString(),
        error: null
      });
      return existing.id;
    }
    
    // Agregar nuevo item
    const id = await this.table.add({
      entity_type: entityType,
      entity_id: entityId,
      action,
      data,
      timestamp: new Date().toISOString(),
      retry_count: 0,
      error: null
    });
    
    if (import.meta.env.DEV) {
      console.log(`✅ Item agregado a cola #${id}:`, {
        type: entityType,
        entity_id: entityId,
        action
      });
    }
    
    return id;
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
