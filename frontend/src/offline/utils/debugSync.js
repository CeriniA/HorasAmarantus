/**
 * Utilidades de debugging para sincronización
 */

import { db } from '../core/db.js';
import { syncQueue } from '../index.js';

/**
 * Ver estado completo de sincronización
 */
export const debugSyncStatus = async () => {
  console.log('🔍 === DEBUG SYNC STATUS ===');
  
  // 1. Cola de sincronización
  const queue = await syncQueue.getAll();
  console.log('\n📋 SYNC QUEUE:', queue.length, 'items');
  queue.forEach((item, i) => {
    console.log(`  ${i + 1}.`, {
      id: item.id,
      type: item.entity_type,
      action: item.action,
      entity_id: item.entity_id,
      retry_count: item.retry_count,
      error: item.error,
      permanent_error: item.permanent_error
    });
  });

  // 2. Time entries pendientes
  const allTimeEntries = await db.time_entries.toArray();
  const pendingTimeEntries = allTimeEntries.filter(e => e.pending_sync === true);
  console.log('\n⏰ TIME ENTRIES:');
  console.log('  Total:', allTimeEntries.length);
  console.log('  Pendientes:', pendingTimeEntries.length);
  if (pendingTimeEntries.length > 0) {
    console.log('  Detalles:', pendingTimeEntries.map(e => ({
      id: e.id,
      client_id: e.client_id,
      description: e.description?.substring(0, 30),
      pending_sync: e.pending_sync
    })));
  }

  // 3. Organizational units pendientes
  const allOrgUnits = await db.organizational_units.toArray();
  const pendingOrgUnits = allOrgUnits.filter(u => u.pending_sync === true);
  console.log('\n🏢 ORGANIZATIONAL UNITS:');
  console.log('  Total:', allOrgUnits.length);
  console.log('  Pendientes:', pendingOrgUnits.length);
  if (pendingOrgUnits.length > 0) {
    console.log('  Detalles:', pendingOrgUnits.map(u => ({
      id: u.id,
      name: u.name,
      type: u.type,
      parent_id: u.parent_id,
      pending_sync: u.pending_sync
    })));
  }

  // 4. Verificar correlación
  console.log('\n🔗 CORRELACIÓN QUEUE vs DATA:');
  for (const item of queue) {
    let found = false;
    
    if (item.entity_type === 'time_entries') {
      const entry = allTimeEntries.find(e => 
        e.id === item.entity_id || e.client_id === item.entity_id
      );
      found = !!entry;
      console.log(`  ${item.entity_type} #${item.id}:`, found ? '✅ Encontrado' : '❌ NO encontrado');
      if (found && entry) {
        console.log('    Data:', {
          id: entry.id,
          client_id: entry.client_id,
          pending_sync: entry.pending_sync
        });
      }
    }
    
    if (item.entity_type === 'organizational_units') {
      const unit = allOrgUnits.find(u => u.id === item.entity_id);
      found = !!unit;
      console.log(`  ${item.entity_type} #${item.id}:`, found ? '✅ Encontrado' : '❌ NO encontrado');
      if (found && unit) {
        console.log('    Data:', {
          id: unit.id,
          name: unit.name,
          pending_sync: unit.pending_sync
        });
      }
    }
  }

  console.log('\n=== FIN DEBUG ===\n');
};

/**
 * Exponer globalmente en desarrollo
 */
if (import.meta.env.DEV) {
  window.debugSync = debugSyncStatus;
}

export default debugSyncStatus;
