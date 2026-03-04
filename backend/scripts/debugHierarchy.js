/**
 * Script para verificar jerarquías en organizational_units
 * Ejecutar: node scripts/debugHierarchy.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY requeridos');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugHierarchy() {
  try {
    console.log('🔍 Verificando jerarquías en organizational_units...\n');

    // Obtener todas las unidades
    const { data: units, error } = await supabase
      .from('organizational_units')
      .select('*')
      .eq('is_active', true)
      .order('type', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    console.log(`📊 Total de unidades: ${units.length}\n`);

    // Agrupar por tipo
    const byType = units.reduce((acc, u) => {
      if (!acc[u.type]) acc[u.type] = [];
      acc[u.type].push(u);
      return acc;
    }, {});

    // Mostrar resumen
    console.log('📈 Resumen por tipo:');
    console.log('─────────────────────────────────────');
    Object.keys(byType).forEach(type => {
      const withParent = byType[type].filter(u => u.parent_id).length;
      const withoutParent = byType[type].length - withParent;
      console.log(`${type.padEnd(12)} : ${byType[type].length} total (${withParent} con parent, ${withoutParent} sin parent)`);
    });
    console.log('─────────────────────────────────────\n');

    // Verificar áreas
    console.log('🏢 ÁREAS (deben tener parent_id = null):');
    console.log('─────────────────────────────────────');
    const areas = byType['area'] || [];
    areas.forEach(area => {
      const status = area.parent_id ? '❌ TIENE PARENT (ERROR)' : '✅';
      console.log(`${status} ${area.name} (id: ${area.id.substring(0, 8)}...)`);
      if (area.parent_id) {
        console.log(`   ⚠️  parent_id: ${area.parent_id}`);
      }
    });
    console.log('');

    // Verificar procesos
    console.log('⚙️  PROCESOS (deben tener parent_id = área):');
    console.log('─────────────────────────────────────');
    const processes = byType['process'] || [];
    processes.forEach(process => {
      if (!process.parent_id) {
        console.log(`❌ ${process.name} - SIN PARENT_ID`);
      } else {
        const parent = units.find(u => u.id === process.parent_id);
        if (!parent) {
          console.log(`❌ ${process.name} - PARENT NO EXISTE (${process.parent_id})`);
        } else if (parent.type !== 'area') {
          console.log(`❌ ${process.name} - PARENT NO ES ÁREA (es ${parent.type})`);
        } else {
          console.log(`✅ ${process.name} → ${parent.name}`);
        }
      }
    });
    console.log('');

    // Verificar subprocesos
    console.log('📋 SUBPROCESOS (deben tener parent_id = proceso):');
    console.log('─────────────────────────────────────');
    const subprocesses = byType['subprocess'] || [];
    subprocesses.forEach(subprocess => {
      if (!subprocess.parent_id) {
        console.log(`❌ ${subprocess.name} - SIN PARENT_ID`);
      } else {
        const parent = units.find(u => u.id === subprocess.parent_id);
        if (!parent) {
          console.log(`❌ ${subprocess.name} - PARENT NO EXISTE (${subprocess.parent_id})`);
        } else if (parent.type !== 'process') {
          console.log(`❌ ${subprocess.name} - PARENT NO ES PROCESO (es ${parent.type})`);
        } else {
          const grandparent = units.find(u => u.id === parent.parent_id);
          console.log(`✅ ${subprocess.name} → ${parent.name} → ${grandparent?.name || 'N/A'}`);
        }
      }
    });
    console.log('');

    // Verificar tareas
    console.log('✓ TAREAS (deben tener parent_id = subproceso):');
    console.log('─────────────────────────────────────');
    const tasks = byType['task'] || [];
    tasks.forEach(task => {
      if (!task.parent_id) {
        console.log(`❌ ${task.name} - SIN PARENT_ID`);
      } else {
        const parent = units.find(u => u.id === task.parent_id);
        if (!parent) {
          console.log(`❌ ${task.name} - PARENT NO EXISTE (${task.parent_id})`);
        } else if (parent.type !== 'subprocess') {
          console.log(`❌ ${task.name} - PARENT NO ES SUBPROCESO (es ${parent.type})`);
        } else {
          console.log(`✅ ${task.name} → ${parent.name}`);
        }
      }
    });
    console.log('');

    // Mostrar jerarquía completa
    console.log('🌳 JERARQUÍA COMPLETA:');
    console.log('─────────────────────────────────────');
    areas.forEach(area => {
      console.log(`📁 ${area.name}`);
      
      const areaProcesses = processes.filter(p => p.parent_id === area.id);
      areaProcesses.forEach(process => {
        console.log(`  ├─ ⚙️  ${process.name}`);
        
        const processSubprocesses = subprocesses.filter(s => s.parent_id === process.id);
        processSubprocesses.forEach((subprocess, idx) => {
          const isLast = idx === processSubprocesses.length - 1;
          console.log(`  │  ${isLast ? '└─' : '├─'} 📋 ${subprocess.name}`);
          
          const subprocessTasks = tasks.filter(t => t.parent_id === subprocess.id);
          subprocessTasks.forEach((task, taskIdx) => {
            const isLastTask = taskIdx === subprocessTasks.length - 1;
            const prefix = isLast ? '     ' : '  │  ';
            console.log(`${prefix}${isLastTask ? '└─' : '├─'} ✓ ${task.name}`);
          });
        });
      });
      console.log('');
    });

    // Problemas encontrados
    const problems = [];
    
    areas.forEach(a => {
      if (a.parent_id) problems.push(`Área "${a.name}" tiene parent_id`);
    });
    
    processes.forEach(p => {
      if (!p.parent_id) problems.push(`Proceso "${p.name}" sin parent_id`);
      else {
        const parent = units.find(u => u.id === p.parent_id);
        if (!parent) problems.push(`Proceso "${p.name}" con parent_id inválido`);
        else if (parent.type !== 'area') problems.push(`Proceso "${p.name}" con parent que no es área`);
      }
    });
    
    subprocesses.forEach(s => {
      if (!s.parent_id) problems.push(`Subproceso "${s.name}" sin parent_id`);
      else {
        const parent = units.find(u => u.id === s.parent_id);
        if (!parent) problems.push(`Subproceso "${s.name}" con parent_id inválido`);
        else if (parent.type !== 'process') problems.push(`Subproceso "${s.name}" con parent que no es proceso`);
      }
    });
    
    tasks.forEach(t => {
      if (!t.parent_id) problems.push(`Tarea "${t.name}" sin parent_id`);
      else {
        const parent = units.find(u => u.id === t.parent_id);
        if (!parent) problems.push(`Tarea "${t.name}" con parent_id inválido`);
        else if (parent.type !== 'subprocess') problems.push(`Tarea "${t.name}" con parent que no es subproceso`);
      }
    });

    if (problems.length > 0) {
      console.log('\n⚠️  PROBLEMAS ENCONTRADOS:');
      console.log('─────────────────────────────────────');
      problems.forEach(p => console.log(`❌ ${p}`));
      console.log('');
    } else {
      console.log('\n✅ No se encontraron problemas en la jerarquía\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

debugHierarchy();
