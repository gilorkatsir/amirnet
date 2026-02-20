import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let _supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  try {
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'wm_supabase_auth',
        detectSessionInUrl: true,
        flowType: 'implicit',
      },
    });
  } catch (e) {
    console.error('Supabase init failed:', e);
  }
}

export const supabase = _supabase;
