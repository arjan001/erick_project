/**
 * Supabase client — Studio22
 *
 * Uses VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from .env.local
 * Install the client:  npm install @supabase/supabase-js
 *
 * Usage:
 *   import { supabase } from '@/lib/supabase';
 *   const { data, error } = await supabase.from('Artist').select('*');
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseAnonKey &&
    !supabaseUrl.includes('your-project-ref')) {
  // Dynamic import so the app doesn't crash if @supabase/supabase-js isn't installed yet
  const { createClient } = await import('@supabase/supabase-js').catch(() => ({ createClient: null }));
  if (createClient) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
}

export { supabase };

/**
 * Check if Supabase is configured
 */
export const isSupabaseConfigured = () =>
  !!(supabaseUrl &&
     supabaseAnonKey &&
     !supabaseUrl.includes('your-project-ref') &&
     supabase);