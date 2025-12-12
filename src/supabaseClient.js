import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const DEFAULT_STATION = "OMA";

export function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
