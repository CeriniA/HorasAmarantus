import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno de Supabase. ' +
    'Copia .env.example a .env y configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper para manejar errores de Supabase
export const handleSupabaseError = (error) => {
  if (!error) return null;
  
  console.error('Supabase Error:', error);
  
  // Errores comunes
  if (error.message?.includes('JWT')) {
    return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
  }
  
  if (error.message?.includes('duplicate key')) {
    return 'Este registro ya existe.';
  }
  
  if (error.message?.includes('foreign key')) {
    return 'No se puede eliminar porque tiene registros relacionados.';
  }
  
  if (error.message?.includes('violates check constraint')) {
    return 'Los datos no cumplen con las validaciones requeridas.';
  }
  
  return error.message || 'Error desconocido';
};

// Helper para verificar si el usuario está autenticado
export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

// Helper para obtener el usuario actual
export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  
  return user;
};

export default supabase;
