/**
 * Estrategia de sincronización para Time Entries
 */

import { SyncStrategy } from './SyncStrategy.js';
import { idMappingService } from '../../../services/IdMappingService.js';

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
    const tempId = data.id;

    const { timeEntry } = await this.api.post('/time-entries', {
      organizational_unit_id: data.organizational_unit_id,
      description: data.description,
      start_time: data.start_time,
      end_time: data.end_time
    });

    const serverId = timeEntry.id;

    // ✅ MEJORADO: Mapear IDs y actualizar referencias
    if (tempId !== serverId) {
      // 1. Mapear ID temporal a ID del servidor
      await idMappingService.mapId(tempId, serverId, 'time_entries');

      // 2. Actualizar referencias en la cola de sincronización
      await idMappingService.updateReferencesInQueue('time_entries', tempId, serverId);

      // 3. Eliminar registro local con ID temporal
      await this.repository.delete(tempId);

      if (import.meta.env.DEV) {
        console.log(`🔗 ID temporal ${tempId} mapeado a ${serverId}`);
      }
    }
    
    // 4. Guardar con el ID del servidor
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
