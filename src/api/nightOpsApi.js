import {
  supabase,
  supabaseAvailable,
  DEFAULT_STATION,
  getTodayDateString,
} from "../supabaseClient.js";

function requireSupabase() {
  if (!supabaseAvailable || !supabase) {
    throw new Error(
      "Supabase is not configured. Provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable Supabase features."
    );
  }
  return supabase;
}

export async function insertNightTail({
  tailNumber,
  location,
  heatSource,
  drained = false,
}) {
  const client = requireSupabase();
  const payload = {
    station: DEFAULT_STATION,
    night_date: getTodayDateString(),
    tail_number: tailNumber?.toUpperCase(),
    location,
    heat_source: heatSource,
    drained,
  };

  const { data, error } = await client
    .from("night_tails")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchTonightNightTails() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("night_tails")
    .select("*")
    .eq("station", DEFAULT_STATION)
    .eq("night_date", getTodayDateString())
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateMarkedInAt(id) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("night_tails")
    .update({ marked_in_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePurgedAt(id) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("night_tails")
    .update({ purged_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function insertTemperatureLog({ tailNumber, tempF }) {
  const client = requireSupabase();
  const payload = {
    station: DEFAULT_STATION,
    night_date: getTodayDateString(),
    tail_number: tailNumber?.toUpperCase(),
    temp_f: Number(tempF),
    recorded_at: new Date().toISOString(),
  };

  const { data, error } = await client
    .from("temp_logs")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchTonightTempLogs() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("temp_logs")
    .select("*")
    .eq("station", DEFAULT_STATION)
    .eq("night_date", getTodayDateString())
    .order("recorded_at", { ascending: false });

  if (error) throw error;
  return data;
}
