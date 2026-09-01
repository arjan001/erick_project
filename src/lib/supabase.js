/**
 * Supabase client — Eric Rabar
 * Credentials are read from VITE_ env vars (Vite exposes only VITE_* to the browser).
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Service-role client — use ONLY in backend functions (Deno), never in the browser.
 * The service role key is stored as a Base44 secret: VITE_SERVICE_ROLE_SECRET.
 * Reading it here is safe only if this file is imported server-side.
 */
export const isSupabaseConfigured = () => !!(supabaseUrl && supabaseAnonKey);