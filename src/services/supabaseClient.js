import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  if (url.includes('YOUR_SUPABASE') || url.includes('placeholder')) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const hasValidCreds = isValidUrl(supabaseUrl) && supabaseAnonKey && !supabaseAnonKey.includes('YOUR_SUPABASE');

export const supabase = hasValidCreds
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: {
        signUp: async () => ({ data: null, error: { message: 'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.local.' } }),
        signInWithPassword: async () => ({ data: null, error: { message: 'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.local.' } }),
        signOut: async () => ({ error: { message: 'Supabase não configurado.' } }),
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: { message: 'Supabase não configurado.' } }),
        resetPasswordForEmail: async () => ({ error: { message: 'Supabase não configurado.' } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: { message: 'Supabase não configurado.' } }),
            order: async () => ({ data: [], error: { message: 'Supabase não configurado.' } }),
          }),
          order: async () => ({ data: [], error: { message: 'Supabase não configurado.' } }),
          single: async () => ({ data: null, error: { message: 'Supabase não configurado.' } }),
        }),
        insert: async () => ({ data: null, error: { message: 'Supabase não configurado.' } }),
        update: async () => ({ data: null, error: { message: 'Supabase não configurado.' } }),
        delete: async () => ({ data: null, error: { message: 'Supabase não configurado.' } }),
      }),
    };

if (!hasValidCreds) {
  console.warn(
    '[Supabase] Variáveis de ambiente VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configuradas ou inválidas em .env.local. Usando cliente simulado.'
  );
}
