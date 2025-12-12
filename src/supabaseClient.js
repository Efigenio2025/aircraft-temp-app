import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const DEFAULT_STATION = "OMA";

export function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const envSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl =
  envSupabaseUrl ?? "https://vzeklfluxzcdkccjklmd.supabase.co";
const supabaseAnonKey =
  envSupabaseAnonKey ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6ZWtsZmx1eHpjZGtjY2prbG1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjYyNzUsImV4cCI6MjA4MTEwMjI3NX0.GJsXhcBJt1uL6qSDIoAved7CxPF5InFP8l43sBEXYCI";

const supabaseEnvConfigured = Boolean(envSupabaseUrl && envSupabaseAnonKey);

export const supabaseAvailable = Boolean(supabaseUrl && supabaseAnonKey);

if (!supabaseEnvConfigured) {
  console.warn(
    "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY were not provided; using the default project configuration instead."
  );
}

export const supabase = supabaseAvailable
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
