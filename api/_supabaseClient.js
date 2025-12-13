import { createClient } from '@supabase/supabase-js';

// Read Supabase configuration from Vite environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Export a supabase client when configuration is present, otherwise null
export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Indicates whether Supabase is configured and available
export const supabaseAvailable = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Default station can be provided via VITE_DEFAULT_STATION or falls back to 'DEFAULT'
export const DEFAULT_STATION = import.meta.env.VITE_DEFAULT_STATION || 'DEFAULT';

// Returns YYYY-MM-DD for today's date (local timezone)
export function getTodayDateString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
