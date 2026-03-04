/**
 * Estrategia de sincronización para Time Entries
 */

import { SyncStrategy } from './SyncStrategy.js';

export class TimeEntrySyncStrategy extends SyncStrategy {
  /**
   * Sincronizar un item de time entry
   */
  async sync(item) {
    const { action, data } = item;

    switch (action) {
      case 'create':
        return await this.create(data);
      case 'update':
        return await this.update(data);
      case 'delete':
        return await this.delete(data);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  /**
   * Crear time entry en el servidor
   */
  async create(data) {
    const { timeEntry } = await this.api.post('/time-entries', {
      organizational_unit_id: data.organizational_unit_id,
      description: data.description,
      start_time: data.start_time,
      end_time: data.end_time
    });

    // IMPORTANTE: El servidor devuelve un NUEVO id
    // Debemos eliminar el registro local y crear uno nuevo
    
    // 1. Eliminar registro local con id temporal
    await this.repository.delete(data.id);
    
    // 2. Guardar con el id del servidor
    await this.repository.save({
      ...timeEntry,
      pending_sync: false,
      synced_at: new Date().toISOString()
    });

    return timeEntry;
  }

  /**
   * Actualizar time entry en el servidor
   */
  async update(data) {
    if (!data.id) {
      throw new Error('ID required for update');
    }

    const { timeEntry } = await this.api.put(`/time-entries/${data.id}`, {
      description: data.description,
      start_time: data.start_time,
      end_time: data.end_time,
      organizational_unit_id: data.organizational_unit_id
    });

    // Actualizar local
    await this.repository.markAsSynced(data.id, timeEntry);

    return timeEntry;
  }

  /**
   * Eliminar time entry en el servidor
   */
  async delete(data) {
    if (!data.id) {
      throw new Error('ID required for delete');
    }

    await this.api.delete(`/time-entries/${data.id}`);
    
    // Eliminar local
    await this.repository.delete(data.id);
  }
}

export default TimeEntrySyncStrategy;
