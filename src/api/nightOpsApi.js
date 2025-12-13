import {
  supabaseRequest,
  supabaseAvailable,
  DEFAULT_STATION,
  getTodayDateString,
} from "../supabaseClient.js";

function requireSupabase() {
  if (!supabaseAvailable) {
    throw new Error(
      "Supabase is not configured. Provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable Supabase features."
    );
  }
}

export async function insertNightTail({
  tailNumber,
  location,
  heatSource,
  drained = false,
}) {
  requireSupabase();
  const payload = {
    station: DEFAULT_STATION,
    night_date: getTodayDateString(),
    tail_number: tailNumber?.toUpperCase(),
    location,
    heat_source: heatSource,
    drained,
  };

  const data = await supabaseRequest("/night_tails", {
    method: "POST",
    body: payload,
    prefer: "return=representation",
  });

  return Array.isArray(data) ? data[0] : data;
}

export async function fetchTonightNightTails() {
  requireSupabase();
  return supabaseRequest("/night_tails", {
    searchParams: {
      select: "*",
      station: `eq.${DEFAULT_STATION}`,
      night_date: `eq.${getTodayDateString()}`,
      order: "created_at.desc",
    },
  });
}

export async function updateMarkedInAt(id) {
  requireSupabase();
  const data = await supabaseRequest("/night_tails", {
    method: "PATCH",
    searchParams: { id: `eq.${id}` },
    body: { marked_in_at: new Date().toISOString() },
    prefer: "return=representation",
  });

  return Array.isArray(data) ? data[0] : data;
}

export async function updatePurgedAt(id) {
  requireSupabase();
  const data = await supabaseRequest("/night_tails", {
    method: "PATCH",
    searchParams: { id: `eq.${id}` },
    body: { purged_at: new Date().toISOString() },
    prefer: "return=representation",
  });

  return Array.isArray(data) ? data[0] : data;
}

export async function insertTemperatureLog({ tailNumber, tempF }) {
  requireSupabase();
  const payload = {
    station: DEFAULT_STATION,
    night_date: getTodayDateString(),
    tail_number: tailNumber?.toUpperCase(),
    temp_f: Number(tempF),
    recorded_at: new Date().toISOString(),
  };

  const data = await supabaseRequest("/temp_logs", {
    method: "POST",
    body: payload,
    prefer: "return=representation",
  });

  return Array.isArray(data) ? data[0] : data;
}

export async function fetchTonightTempLogs() {
  requireSupabase();
  return supabaseRequest("/temp_logs", {
    searchParams: {
      select: "*",
      station: `eq.${DEFAULT_STATION}`,
      night_date: `eq.${getTodayDateString()}`,
      order: "recorded_at.desc",
    },
  });
}
