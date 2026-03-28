/**
 * Repositorio para Time Entries
 * Operaciones específicas de registros de horas
 */

import { BaseRepository } from './BaseRepository.js';
import { TIME_ENTRY_STATUS } from '../../constants';
import { generateUUID } from '../../utils/uuid.js';

export class TimeEntryRepository extends BaseRepository {
  constructor() {
    super('time_entries');
  }

  /**
   * Buscar registros pendientes de sincronización
   */
  async findPending() {
    const all = await this.findAll();
    return all.filter(entry => entry.pending_sync === true);
  }

  /**
   * Buscar por usuario
   */
  async findByUser(userId) {
    return await this.findWhere('user_id', userId);
  }

  /**
   * Buscar por unidad organizacional
   */
  async findByOrgUnit(orgUnitId) {
    return await this.findWhere('organizational_unit_id', orgUnitId);
  }

  /**
   * Buscar por rango de fechas
   */
  async findByDateRange(startDate, endDate) {
    const all = await this.findAll();
    return all.filter(entry => {
      const entryDate = new Date(entry.start_time);
      return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
    });
  }

  /**
   * Preparar entrada para guardar localmente
   */
  prepareForLocal(entry, userId) {
    return {
      id: entry.id || generateUUID(),
      client_id: entry.client_id || generateUUID(),
      user_id: userId,
      organizational_unit_id: entry.organizational_unit_id,
      description: entry.description,
      start_time: entry.start_time,
      end_time: entry.end_time,
      total_hours: entry.total_hours || this.calculateHours(entry.start_time, entry.end_time),
      status: entry.status || TIME_ENTRY_STATUS.COMPLETED,
      pending_sync: true,
      synced_at: null,
      created_at: entry.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Marcar como sincronizado
   */
  async markAsSynced(id, serverData) {
    const entry = await this.findById(id);
    if (!entry) return null;

    const synced = {
      ...entry,
      ...serverData,
      pending_sync: false,
      synced_at: new Date().toISOString()
    };

    return await this.save(synced);
  }

  /**
   * Calcular horas entre dos timestamps
   */
  calculateHours(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  }

  /**
   * Contar pendientes
   */
  async countPending() {
    const pending = await this.findPending();
    return pending.length;
  }
}

export default TimeEntryRepository;
