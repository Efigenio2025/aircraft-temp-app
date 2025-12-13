const { URL } = require("url");

function getSupabaseClient(context) {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    context.log.error("Missing Supabase configuration (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)");
    return null;
  }

  try {
    // Validate URL shape early for clearer errors
    new URL(SUPABASE_URL);
  } catch (err) {
    context.log.error("Invalid SUPABASE_URL", err);
    return null;
  }

  const headers = {
    apiKey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  async function request(path, options = {}) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase request failed (${response.status}): ${errorText}`);
    }

    if (response.status === 204) return null;
    return response.json();
  }

  return { request };
}

module.exports = { getSupabaseClient };
