/**
 * Migraciones de IndexedDB
 * Se ejecutan automáticamente al iniciar la app
 */

import { db } from './indexedDB';

/**
 * Migración: Reparar pending_sync undefined/null
 */
const migratePendingSync = async () => {
  try {
    const allEntries = await db.time_entries.toArray();
    const queueItems = await db.sync_queue.toArray();
    const queueIds = new Set(queueItems.map(item => item.entity_id));

    let fixed = 0;

    for (const entry of allEntries) {
      // Si pending_sync es undefined o null, establecer valor correcto
      if (entry.pending_sync !== true && entry.pending_sync !== false) {
        const shouldBePending = queueIds.has(entry.id) || queueIds.has(entry.client_id);
        
        await db.time_entries.update(entry.id, {
          pending_sync: shouldBePending,
          synced_at: shouldBePending ? null : entry.synced_at || new Date().toISOString()
        });
        
        fixed++;
      }
    }

    if (fixed > 0 && import.meta.env.DEV) {
      console.log(`✅ Migración: ${fixed} registros reparados (pending_sync)`);
    }

    return { success: true, fixed };
  } catch (error) {
    console.error('❌ Error en migración pending_sync:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Ejecutar todas las migraciones
 */
export const runMigrations = async () => {
  if (import.meta.env.DEV) {
    console.log('🔄 Ejecutando migraciones de IndexedDB...');
  }

  const results = [];

  // Migración 1: pending_sync
  results.push(await migratePendingSync());

  const totalFixed = results.reduce((sum, r) => sum + (r.fixed || 0), 0);
  const allSuccess = results.every(r => r.success);

  if (import.meta.env.DEV && totalFixed > 0) {
    console.log(`✅ Migraciones completadas: ${totalFixed} registros reparados`);
  }

  return {
    success: allSuccess,
    totalFixed,
    results
  };
};

export default runMigrations;
