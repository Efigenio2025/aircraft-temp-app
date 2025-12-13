const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const DEFAULT_STATION = import.meta.env.VITE_DEFAULT_STATION || "OMA";
export const supabaseAvailable = Boolean(supabaseUrl && supabaseAnonKey);

export function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function buildRestUrl(pathname, searchParams = {}) {
  const url = new URL(`${supabaseUrl}/rest/v1${pathname}`);
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}

export async function supabaseRequest(pathname, { method = "GET", body, searchParams, prefer } = {}) {
  if (!supabaseAvailable) {
    throw new Error(
      "Supabase is not configured. Provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable Supabase features."
    );
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
      // Ignore JSON parse errors but surface the original exception in logs
      console.error("Failed to parse Supabase error response:", err);
    }
    throw new Error(message);
  }

  // Some DELETE operations may return empty bodies
  if (response.status === 204) return null;
  return response.json();
}
