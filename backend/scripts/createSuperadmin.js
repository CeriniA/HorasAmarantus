/**
 * Script para crear usuario superadmin
 * Ejecutar: node scripts/createSuperadmin.js
 */

import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSuperadmin() {
  try {
    console.log('🔐 Creando superadmin...\n');

    // Datos del superadmin
    const email = 'superamarantus';
    const password = 'ContraseñaDificil123!';
    const name = 'Super Administrador';

    // Generar hash del password
    console.log('⏳ Generando hash del password...');
    const password_hash = await bcrypt.hash(password, 10);
    console.log('✅ Hash generado\n');

    // Verificar si el usuario ya existe
    const { data: existing } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', email)
      .single();

    if (existing) {
      console.log('⚠️  Usuario ya existe, actualizando a superadmin...');
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          role: 'superadmin',
          password_hash,
          is_active: true
        })
        .eq('email', email);

      if (updateError) throw updateError;
      
      console.log('✅ Usuario actualizado a superadmin\n');
    } else {
      console.log('➕ Creando nuevo usuario...');
      
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          email,
          password_hash,
          name,
          role: 'superadmin',
          is_active: true
        });

      if (insertError) throw insertError;
      
      console.log('✅ Usuario creado exitosamente\n');
    }

    // Verificar
    const { data: user, error: selectError } = await supabase
      .from('users')
      .select('id, email, name, role, is_active, created_at')
      .eq('email', email)
      .single();

    if (selectError) throw selectError;

    console.log('📋 Detalles del usuario:');
    console.log('─────────────────────────────────────');
    console.log('Email:    ', user.email);
    console.log('Nombre:   ', user.name);
    console.log('Rol:      ', user.role);
    console.log('Activo:   ', user.is_active);
    console.log('Creado:   ', new Date(user.created_at).toLocaleString());
    console.log('─────────────────────────────────────\n');

    console.log('🎉 ¡Superadmin creado exitosamente!');
    console.log('\n📝 Credenciales:');
    console.log('─────────────────────────────────────');
    console.log('Email:    ', email);
    console.log('Password: ', password);
    console.log('─────────────────────────────────────\n');

    console.log('⚠️  IMPORTANTE: Guarda estas credenciales en un lugar seguro');
    console.log('💡 Puedes hacer login en: http://localhost:5173/login\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar
createSuperadmin();
