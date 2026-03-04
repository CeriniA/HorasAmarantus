/**
 * Repositorio para Users
 * Operaciones específicas de usuarios
 */

import { BaseRepository } from './BaseRepository.js';

export class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  /**
   * Buscar por email
   */
  async findByEmail(email) {
    return await this.findWhere('email', email);
  }

  /**
   * Buscar por rol
   */
  async findByRole(role) {
    return await this.findWhere('role', role);
  }

  /**
   * Buscar por unidad organizacional
   */
  async findByOrgUnit(orgUnitId) {
    return await this.findWhere('organizational_unit_id', orgUnitId);
  }

  /**
   * Obtener usuario actual (del localStorage)
   */
  async getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(window.atob(token.split('.')[1]));
      return await this.findById(payload.id);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
}

export default UserRepository;
