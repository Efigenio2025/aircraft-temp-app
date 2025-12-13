const { v4: uuidv4 } = require("uuid");
const {
  supabaseRequest,
  supabaseConfigured,
  DEFAULT_STATION,
  getTodayDateString,
} = require("../_supabaseClient");

module.exports = async function (context, req) {
  try {
    if (!supabaseConfigured) {
      context.res = {
        status: 500,
        body: { error: "Supabase is not configured." },
      };
      return;
    }

    const { tail, tailNumber, temp, location, heatSource, status, time, notes, dateOverride } =
      req.body || {};

    const tailValue = (tailNumber || tail || "").toUpperCase();
    if (!tailValue || temp === undefined || temp === null) {
      context.res = {
        status: 400,
        body: { error: "tail and temp are required." },
      };
      return;
    }

    const numericTemp = typeof temp === "number" ? temp : Number(temp);
    if (Number.isNaN(numericTemp)) {
      context.res = {
        status: 400,
        body: { error: "temp must be a number." },
      };
      return;
    }

    const timestamp = time || new Date().toISOString();
    const payload = {
      id: uuidv4(),
      station: DEFAULT_STATION,
      night_date: dateOverride || getTodayDateString(),
      tail_number: tailValue,
      temp_f: numericTemp,
      recorded_at: timestamp,
      location: location || "",
      heat_source: heatSource || "",
      status: status || "",
      notes: notes || "",
    };

    const data = await supabaseRequest("/temp_logs", {
      method: "POST",
      body: payload,
      prefer: "return=representation",
    });

    const saved = Array.isArray(data) && data.length ? data[0] : payload;

    context.res = {
      status: 201,
      body: {
        id: saved.id,
        partitionKey: `${saved.station}-${saved.night_date}`,
        tail: saved.tail_number,
        temp: saved.temp_f,
        recordedAt: saved.recorded_at,
        location: saved.location,
        heatSource: saved.heat_source,
        status: saved.status,
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
