/**
 * Servicio para operaciones offline
 * Maneja la lógica de guardar datos localmente
 */

export class OfflineService {
  constructor(repository, syncQueue) {
    this.repository = repository;
    this.syncQueue = syncQueue;
  }

  /**
   * Crear entidad offline
   */
  async create(data, entityType) {
    // Guardar en repositorio local
    const saved = await this.repository.save(data);

    // Agregar a cola de sincronización
    await this.syncQueue.add(entityType, saved.id, 'create', saved);

    return saved;
  }

  /**
   * Actualizar entidad offline
   */
  async update(id, updates, entityType) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error(`Entity ${id} not found`);
    }

    const updated = {
      ...existing,
      ...updates,
      pending_sync: true,
      updated_at: new Date().toISOString()
    };

    await this.repository.save(updated);
    await this.syncQueue.add(entityType, id, 'update', updated);

    return updated;
  }

  /**
   * Eliminar entidad offline
   */
  async delete(id, entityType) {
    await this.repository.delete(id);
    await this.syncQueue.add(entityType, id, 'delete', { id });
  }

  /**
   * Obtener todas las entidades
   */
  async getAll() {
    return await this.repository.findAll();
  }

  /**
   * Obtener por ID
   */
  async getById(id) {
    return await this.repository.findById(id);
  }
}

export default OfflineService;
