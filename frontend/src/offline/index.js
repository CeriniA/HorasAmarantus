/**
 * Punto de entrada principal del módulo offline
 * Exporta todas las clases y funciones necesarias
 */

// Core
export { db } from './core/db.js';
export { runMigrations } from './core/migrations.js';

// Repositories
export { BaseRepository } from './repositories/BaseRepository.js';
export { TimeEntryRepository } from './repositories/TimeEntryRepository.js';
export { OrgUnitRepository } from './repositories/OrgUnitRepository.js';
export { UserRepository } from './repositories/UserRepository.js';

// Sync
export { SyncManager } from './sync/SyncManager.js';
export { SyncQueue } from './sync/SyncQueue.js';
export { SyncStrategy } from './sync/strategies/SyncStrategy.js';
export { TimeEntrySyncStrategy } from './sync/strategies/TimeEntrySyncStrategy.js';
export { OrgUnitSyncStrategy } from './sync/strategies/OrgUnitSyncStrategy.js';

// Services
export { OfflineService } from './services/OfflineService.js';
export { OnlineService } from './services/OnlineService.js';

// Instancias singleton
import { db } from './core/db.js';
import { runMigrations } from './core/migrations.js';
import { SyncManager } from './sync/SyncManager.js';
import { TimeEntryRepository } from './repositories/TimeEntryRepository.js';
import { OrgUnitRepository } from './repositories/OrgUnitRepository.js';
import { UserRepository } from './repositories/UserRepository.js';
import { SyncQueue } from './sync/SyncQueue.js';
import { TimeEntrySyncStrategy } from './sync/strategies/TimeEntrySyncStrategy.js';
import { OrgUnitSyncStrategy } from './sync/strategies/OrgUnitSyncStrategy.js';
import { api } from '../services/api.js';

// Crear instancias
export const timeEntryRepository = new TimeEntryRepository();
export const orgUnitRepository = new OrgUnitRepository();
export const userRepository = new UserRepository();
export const syncQueue = new SyncQueue();

// Crear sync manager y registrar estrategias
export const syncManager = new SyncManager();
syncManager.registerStrategy(
  'time_entries',
  new TimeEntrySyncStrategy(api, timeEntryRepository)
);
syncManager.registerStrategy(
  'organizational_units',
  new OrgUnitSyncStrategy(api, orgUnitRepository)
);

export default {
  db,
  runMigrations,
  timeEntryRepository,
  orgUnitRepository,
  userRepository,
  syncQueue,
  syncManager
};
