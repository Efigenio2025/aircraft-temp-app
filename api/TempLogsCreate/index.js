const { v4: uuidv4 } = require("uuid");
const { getSupabaseClient } = require("../_supabaseClient");

module.exports = async function (context, req) {
  try {
    const supabase = getSupabaseClient(context);
    if (!supabase) {
      context.res = {
        status: 500,
        body: { error: "Supabase is not configured." },
      };
      return;
    }

    const {
      tail,
      location,
      heatSource,
      temp,
      status,
      time,
      notes,
      station = "OMA",
      dateOverride,
    } = req.body || {};

    if (!tail || temp === undefined || temp === null || !status) {
      context.res = {
        status: 400,
        body: { error: "tail, temp, and status are required." },
      };
      return;
    }

    const now = new Date();
    const dateStr = dateOverride || now.toISOString().slice(0, 10);
    const numericTemp = typeof temp === "number" ? temp : Number(temp);

    if (Number.isNaN(numericTemp)) {
      context.res = {
        status: 400,
        body: { error: "temp must be a number." },
      };
      return;
    }

    const id = uuidv4();
    const payload = {
      id,
      station,
      date: dateStr,
      tail,
      location: location || "",
      heat_source: heatSource || "",
      temp: numericTemp,
      status,
      time: time || now.toISOString(),
      notes: notes || "",
    };

    const data = await supabase.request("/temp_logs", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(payload),
    });

    const saved = Array.isArray(data) && data.length ? data[0] : payload;

    context.res = {
      status: 201,
      body: {
        id: saved.id,
        partitionKey: `${saved.station}-${saved.date}`,
        tail: saved.tail,
        location: saved.location,
        heatSource: saved.heat_source,
        temp: saved.temp,
        status: saved.status,
        time: saved.time,
        notes: saved.notes,
      },
    };
  } catch (err) {
    context.log.error("Error in TempLogsCreate:", err);
    context.res = {
      status: 500,
      body: { error: "Failed to create temp log." },
    };
  }
};
