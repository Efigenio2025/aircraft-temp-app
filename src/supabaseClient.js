import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const DEFAULT_STATION = "OMA";

export function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseAvailable = Boolean(supabaseUrl && supabaseAnonKey);

if (!supabaseAvailable) {
  console.warn(
    "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY were not provided; Supabase features will be disabled."
  );
}

export const supabase = supabaseAvailable
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
