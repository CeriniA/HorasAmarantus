/**
 * Repositorio base con operaciones CRUD genéricas
 * Todos los repositorios específicos heredan de esta clase
 */

import { db } from '../core/db.js';

export class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    this.table = db[tableName];
  }

  /**
   * Obtener todos los registros
   */
  async findAll() {
    return await this.table.toArray();
  }

  /**
   * Buscar por ID
   */
  async findById(id) {
    return await this.table.get(id);
  }

  /**
   * Guardar (crear o actualizar)
   */
  async save(entity) {
    await this.table.put(entity);
    return entity;
  }

  /**
   * Guardar múltiples registros
   */
  async saveMany(entities) {
    await this.table.bulkPut(entities);
    return entities;
  }

  /**
   * Eliminar por ID
   */
  async delete(id) {
    await this.table.delete(id);
  }

  /**
   * Contar registros
   */
  async count() {
    return await this.table.count();
  }

  /**
   * Limpiar tabla
   */
  async clear() {
    await this.table.clear();
  }

  /**
   * Buscar donde (filtro genérico)
   */
  async findWhere(field, value) {
    return await this.table.where(field).equals(value).toArray();
  }
}

export default BaseRepository;
