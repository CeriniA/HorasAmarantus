/**
 * Servicio para operaciones online
 * Maneja la lógica de comunicación con el servidor
 */

export class OnlineService {
  constructor(apiService, repository) {
    this.api = apiService;
    this.repository = repository;
  }

  /**
   * Crear entidad online
   */
  async create(data, endpoint) {
    const result = await this.api.post(endpoint, data);

    // Guardar en cache local
    const cached = {
      ...result,
      pending_sync: false,
      synced_at: new Date().toISOString()
    };
    await this.repository.save(cached);

    return result;
  }

  /**
   * Actualizar entidad online
   */
  async update(id, updates, endpoint) {
    const result = await this.api.put(`${endpoint}/${id}`, updates);

    // Actualizar cache local
    const cached = {
      ...result,
      pending_sync: false,
      synced_at: new Date().toISOString()
    };
    await this.repository.save(cached);

    return result;
  }

  /**
   * Eliminar entidad online
   */
  async delete(id, endpoint) {
    await this.api.delete(`${endpoint}/${id}`);
    await this.repository.delete(id);
  }

  /**
   * Obtener todas las entidades
   */
  async getAll(endpoint) {
    const result = await this.api.get(endpoint);
    
    // Cachear en local
    const items = Array.isArray(result) ? result : result[Object.keys(result)[0]];
    if (items && items.length > 0) {
      await this.repository.saveMany(items.map(item => ({
        ...item,
        pending_sync: false,
        synced_at: new Date().toISOString()
      })));
    }

    return result;
  }

  /**
   * Obtener por ID
   */
  async getById(id, endpoint) {
    const result = await this.api.get(`${endpoint}/${id}`);
    
    // Cachear en local
    await this.repository.save({
      ...result,
      pending_sync: false,
      synced_at: new Date().toISOString()
    });

    return result;
  }
}

export default OnlineService;
