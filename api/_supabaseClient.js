const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const DEFAULT_STATION = process.env.VITE_DEFAULT_STATION || "OMA";
const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function buildRestUrl(pathname, searchParams = {}) {
  const url = new URL(`${supabaseUrl}/rest/v1${pathname}`);
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}

async function supabaseRequest(pathname, { method = "GET", body, searchParams, prefer } = {}) {
  if (!supabaseConfigured) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const headers = {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
    "Content-Type": "application/json",
  };

  if (prefer) {
    headers.Prefer = prefer;
  }

  const response = await fetch(buildRestUrl(pathname, searchParams), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = `Supabase request failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      message = errorBody?.message || message;
    } catch (err) {
      // Ignore JSON parse errors but log for diagnostics
      console.error("Failed to parse Supabase error response:", err);
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

module.exports = {
  supabaseRequest,
  supabaseConfigured,
  DEFAULT_STATION,
  getTodayDateString,
};
