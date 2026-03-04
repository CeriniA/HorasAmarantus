/**
 * Estrategia base de sincronización
 * Todas las estrategias específicas heredan de esta clase
 */

export class SyncStrategy {
  constructor(apiService, repository) {
    this.api = apiService;
    this.repository = repository;
  }

  /**
   * Sincronizar un item (debe ser implementado por subclases)
   */
  async sync(_item) {
    throw new Error('sync() must be implemented by subclass');
  }

  /**
   * Crear en el servidor
   */
  async create(_data) {
    throw new Error('create() must be implemented by subclass');
  }

  /**
   * Actualizar en el servidor
   */
  async update(_data) {
    throw new Error('update() must be implemented by subclass');
  }

  /**
   * Eliminar en el servidor
   */
  async delete(_data) {
    throw new Error('delete() must be implemented by subclass');
  }
}

export default SyncStrategy;
