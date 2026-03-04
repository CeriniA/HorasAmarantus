/**
 * Utilidad para detectar duplicados en IndexedDB
 */

import { db } from '../core/db.js';

export const findDuplicates = async () => {
  console.log('🔍 === BUSCANDO DUPLICADOS ===\n');
  
  // Time Entries
  const timeEntries = await db.time_entries.toArray();
  console.log('📊 TIME ENTRIES:', timeEntries.length, 'total\n');
  
  // Agrupar por descripción y fecha
  const groups = {};
  timeEntries.forEach(entry => {
    const key = `${entry.description}_${entry.start_time}_${entry.end_time}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(entry);
  });
  
  // Encontrar duplicados
  const duplicates = Object.entries(groups).filter(([_, entries]) => entries.length > 1);
  
  if (duplicates.length === 0) {
    console.log('✅ No se encontraron duplicados');
  } else {
    console.log(`❌ DUPLICADOS ENCONTRADOS: ${duplicates.length} grupos\n`);
    
    duplicates.forEach(([key, entries], i) => {
      console.log(`\n🔴 Grupo ${i + 1}:`);
      console.log('  Descripción:', entries[0].description);
      console.log('  Fecha:', entries[0].start_time);
      console.log('  Cantidad:', entries.length);
      console.log('  IDs:');
      entries.forEach(e => {
        console.log(`    - id: ${e.id}`);
        console.log(`      client_id: ${e.client_id}`);
        console.log(`      pending_sync: ${e.pending_sync}`);
        console.log(`      synced_at: ${e.synced_at}`);
        console.log('');
      });
    });
  }
  
  console.log('\n=== FIN BÚSQUEDA ===\n');
  return duplicates;
};

// Exponer globalmente en desarrollo
if (import.meta.env.DEV) {
  window.findDuplicates = findDuplicates;
}

export default findDuplicates;
