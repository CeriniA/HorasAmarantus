/**
 * Estrategia de sincronización para Organizational Units
 */

import { SyncStrategy } from './SyncStrategy.js';

export class OrgUnitSyncStrategy extends SyncStrategy {
  /**
   * Sincronizar un item de organizational unit
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
   * Crear organizational unit en el servidor
   */
  async create(data) {
    const { organizationalUnit } = await this.api.post('/organizational-units', {
      name: data.name,
      type: data.type,
      parent_id: data.parent_id
    });

    // IMPORTANTE: El servidor devuelve un NUEVO id
    // Debemos eliminar el registro local y crear uno nuevo
    
    // 1. Eliminar registro local con id temporal
    await this.repository.delete(data.id);
    
    // 2. Guardar con el id del servidor
    await this.repository.save({
      ...organizationalUnit,
      pending_sync: false,
      synced_at: new Date().toISOString()
    });

    return organizationalUnit;
  }

  /**
   * Actualizar organizational unit en el servidor
   */
  async update(data) {
    if (!data.id) {
      throw new Error('ID required for update');
    }

    const { organizationalUnit } = await this.api.put(`/organizational-units/${data.id}`, {
      name: data.name,
      type: data.type,
      parent_id: data.parent_id
    });

    // Actualizar local
    await this.repository.save({
      ...organizationalUnit,
      pending_sync: false,
      synced_at: new Date().toISOString()
    });

    return organizationalUnit;
  }

  /**
   * Eliminar organizational unit en el servidor
   */
  async delete(data) {
    if (!data.id) {
      throw new Error('ID required for delete');
    }

    await this.api.delete(`/organizational-units/${data.id}`);
    
    // Eliminar local
    await this.repository.delete(data.id);
  }
}

export default OrgUnitSyncStrategy;
