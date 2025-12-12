import { supabase, DEFAULT_STATION, getTodayDateString } from "../supabaseClient.js";

export async function insertNightTail({
  tailNumber,
  location,
  heatSource,
  drained = false,
}) {
  const payload = {
    station: DEFAULT_STATION,
    night_date: getTodayDateString(),
    tail_number: tailNumber?.toUpperCase(),
    location,
    heat_source: heatSource,
    drained,
  };

  const { data, error } = await supabase
    .from("night_tails")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchTonightNightTails() {
  const { data, error } = await supabase
    .from("night_tails")
    .select("*")
    .eq("station", DEFAULT_STATION)
    .eq("night_date", getTodayDateString())
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateMarkedInAt(id) {
  const { data, error } = await supabase
    .from("night_tails")
    .update({ marked_in_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePurgedAt(id) {
  const { data, error } = await supabase
    .from("night_tails")
    .update({ purged_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function insertTemperatureLog({ tailNumber, tempF }) {
  const payload = {
    station: DEFAULT_STATION,
    night_date: getTodayDateString(),
    tail_number: tailNumber?.toUpperCase(),
    temp_f: Number(tempF),
    recorded_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("temp_logs")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchTonightTempLogs() {
  const { data, error } = await supabase
    .from("temp_logs")
    .select("*")
    .eq("station", DEFAULT_STATION)
    .eq("night_date", getTodayDateString())
    .order("recorded_at", { ascending: false });

  if (error) throw error;
  return data;
}
