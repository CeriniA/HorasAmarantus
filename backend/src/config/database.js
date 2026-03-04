import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

// Crear cliente de Supabase con service_role key
// IMPORTANTE: Este cliente tiene acceso completo, solo usar en backend
export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default supabase;
