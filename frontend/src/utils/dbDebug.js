/**
 * Utilidades de debugging para IndexedDB
 * Solo disponibles en desarrollo
 */

import { db } from '../offline/core/db.js';

/**
 * Ver estado completo de la base de datos
 */
export const debugDB = async () => {
  if (!import.meta.env.DEV) {
    console.warn('Debug DB solo disponible en desarrollo');
    return;
  }

  console.group('📊 Estado de IndexedDB');

  try {
    // Usuarios
    const users = await db.users.toArray();
    console.log('👥 Usuarios:', users.length, users);

    // Unidades organizacionales
    const orgUnits = await db.organizational_units.toArray();
    console.log('🏢 Unidades organizacionales:', orgUnits.length, orgUnits);

    // Registros de horas
    const timeEntries = await db.time_entries.toArray();
    console.log('⏰ Registros de horas:', timeEntries.length, timeEntries);

    // Cola de sincronización
    const syncQueue = await db.sync_queue.toArray();
    console.log('🔄 Cola de sincronización:', syncQueue.length, syncQueue);

    // Registros pendientes
    const pending = await db.time_entries.where('pending_sync').equals(true).toArray();
    console.log('⚠️ Pendientes de sincronizar:', pending.length, pending);

    // Metadata
    const metadata = await db.sync_metadata.toArray();
    console.log('📋 Metadata:', metadata);

  } catch (error) {
    console.error('❌ Error leyendo DB:', error);
  }

  console.groupEnd();
};

/**
 * Limpiar toda la base de datos
 */
export const clearDB = async () => {
  if (!import.meta.env.DEV) {
    console.warn('Clear DB solo disponible en desarrollo');
    return;
  }

  const confirm = window.confirm(
    '⚠️ ¿Estás seguro de que quieres borrar TODA la base de datos local?\n\n' +
    'Esto eliminará:\n' +
    '- Usuarios cacheados\n' +
    '- Unidades organizacionales\n' +
    '- Registros de horas\n' +
    '- Cola de sincronización\n\n' +
    'Tendrás que volver a iniciar sesión.'
  );

  if (!confirm) {
    console.log('❌ Limpieza cancelada');
    return;
  }

  try {
    await db.users.clear();
    await db.organizational_units.clear();
    await db.time_entries.clear();
    await db.sync_queue.clear();
    await db.sync_metadata.clear();

    console.log('✅ Base de datos limpiada completamente');
    console.log('🔄 Recarga la página para empezar de nuevo');
  } catch (error) {
    console.error('❌ Error limpiando DB:', error);
  }
};

/**
 * Limpiar solo la cola de sincronización
 */
export const clearSyncQueue = async () => {
  if (!import.meta.env.DEV) {
    console.warn('Clear sync queue solo disponible en desarrollo');
    return;
  }

  try {
    const queue = await db.sync_queue.toArray();
    console.log(`🗑️ Limpiando ${queue.length} items de la cola...`);

    await db.sync_queue.clear();

    console.log('✅ Cola de sincronización limpiada');
  } catch (error) {
    console.error('❌ Error limpiando cola:', error);
  }
};

/**
 * Reparar registros con pending_sync inconsistente
 */
export const repairPendingSync = async () => {
  if (!import.meta.env.DEV) {
    console.warn('Repair solo disponible en desarrollo');
    return;
  }

  try {
    // Obtener todos los registros
    const allEntries = await db.time_entries.toArray();
    
    // Obtener IDs en la cola
    const queueItems = await db.sync_queue.toArray();
    const queueIds = new Set(queueItems.map(item => item.entity_id));

    let fixed = 0;

    for (const entry of allEntries) {
      let needsUpdate = false;
      const updates = {};

      // Reparar pending_sync undefined/null
      if (entry.pending_sync !== true && entry.pending_sync !== false) {
        updates.pending_sync = queueIds.has(entry.id) || queueIds.has(entry.client_id);
        needsUpdate = true;
        console.log(`🔧 Reparando pending_sync undefined: ${entry.id}`);
      }

      // Verificar consistencia con cola
      const shouldBePending = queueIds.has(entry.id) || queueIds.has(entry.client_id);
      const isPending = entry.pending_sync === true;

      if (shouldBePending !== isPending) {
        updates.pending_sync = shouldBePending;
        needsUpdate = true;
        console.log(`🔧 Inconsistencia: ${entry.id} → pending_sync: ${shouldBePending}`);
      }

      if (needsUpdate) {
        await db.time_entries.update(entry.id, updates);
        fixed++;
      }
    }

    console.log(`✅ Reparación completa: ${fixed} registros corregidos`);
  } catch (error) {
    console.error('❌ Error reparando:', error);
  }
};

/**
 * Exportar datos para backup
 */
export const exportDB = async () => {
  if (!import.meta.env.DEV) {
    console.warn('Export solo disponible en desarrollo');
    return;
  }

  try {
    const data = {
      users: await db.users.toArray(),
      organizational_units: await db.organizational_units.toArray(),
      time_entries: await db.time_entries.toArray(),
      sync_queue: await db.sync_queue.toArray(),
      sync_metadata: await db.sync_metadata.toArray(),
      exported_at: new Date().toISOString()
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new window.Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `indexeddb-backup-${Date.now()}.json`;
    a.click();
    
    window.URL.revokeObjectURL(url);

    console.log('✅ Base de datos exportada');
  } catch (error) {
    console.error('❌ Error exportando:', error);
  }
};

/**
 * Hacer disponibles en window para acceso desde consola
 */
if (import.meta.env.DEV) {
  window.dbDebug = {
    debug: debugDB,
    clear: clearDB,
    clearQueue: clearSyncQueue,
    repair: repairPendingSync,
    export: exportDB
  };

  console.log(
    '%c💡 Utilidades de DB disponibles en window.dbDebug',
    'color: #4CAF50; font-weight: bold; font-size: 12px;'
  );
  console.log('Comandos disponibles:');
  console.log('  window.dbDebug.debug()      - Ver estado de la DB');
  console.log('  window.dbDebug.clear()      - Limpiar toda la DB');
  console.log('  window.dbDebug.clearQueue() - Limpiar cola de sync');
  console.log('  window.dbDebug.repair()     - Reparar inconsistencias');
  console.log('  window.dbDebug.export()     - Exportar backup');
}

export default {
  debugDB,
  clearDB,
  clearSyncQueue,
  repairPendingSync,
  exportDB
};
