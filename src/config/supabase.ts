import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Custom error handler to suppress PGRST116 errors
const customErrorHandler = (error: any) => {
  // Suppress PGRST116 (no rows) errors during profile creation
  if (error?.code === 'PGRST116') return;
  
  // Log other errors that might indicate actual problems
  console.error('Supabase error:', error);
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    // Custom error handler for all requests
    onError: customErrorHandler
  }
});

export type { Database };