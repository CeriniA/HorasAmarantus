/**
 * Repositorio para Organizational Units
 * Operaciones específicas de unidades organizacionales
 */

import { BaseRepository } from './BaseRepository.js';

export class OrgUnitRepository extends BaseRepository {
  constructor() {
    super('organizational_units');
  }

  /**
   * Buscar por tipo
   */
  async findByType(type) {
    return await this.findWhere('type', type);
  }

  /**
   * Buscar por nivel
   */
  async findByLevel(level) {
    return await this.findWhere('level', level);
  }

  /**
   * Buscar hijos de una unidad
   */
  async findChildren(parentId) {
    return await this.findWhere('parent_id', parentId);
  }

  /**
   * Buscar unidades raíz (sin padre)
   */
  async findRoots() {
    const all = await this.findAll();
    return all.filter(unit => !unit.parent_id);
  }

  /**
   * Construir árbol jerárquico
   */
  async buildTree() {
    const all = await this.findAll();
    const roots = all.filter(unit => !unit.parent_id);
    
    const buildNode = (unit) => ({
      ...unit,
      children: all
        .filter(child => child.parent_id === unit.id)
        .map(buildNode)
    });

    return roots.map(buildNode);
  }

  /**
   * Obtener path completo de una unidad
   */
  async getPath(unitId) {
    const path = [];
    let current = await this.findById(unitId);

    while (current) {
      path.unshift(current);
      current = current.parent_id ? await this.findById(current.parent_id) : null;
    }

    return path;
  }
}

export default OrgUnitRepository;
