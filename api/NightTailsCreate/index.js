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
      gate,
      heatSource,
      inTime,
      station = "OMA",
      dateOverride,
    } = req.body || {};

    if (!tail) {
      context.res = {
        status: 400,
        body: { error: "tail is required." },
      };
      return;
    }

    const now = new Date();
    const dateStr = dateOverride || now.toISOString().slice(0, 10);

    const id = uuidv4();
    const payload = {
      id,
      station,
      date: dateStr,
      tail,
      gate: gate || "",
      heat_source: heatSource || "",
      in_time: inTime || "",
      marked_in_at: "",
      purged_drained: "N/A",
      purged_at: "",
    };

    const data = await supabase.request("/night_tails", {
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
        gate: saved.gate,
        heatSource: saved.heat_source,
        inTime: saved.in_time,
        markedInAt: saved.marked_in_at,
        purgedDrained: saved.purged_drained,
        purgedAt: saved.purged_at,
      },
    };
  } catch (err) {
    context.log.error("Error in NightTailsCreate:", err);
    context.res = {
      status: 500,
      body: { error: "Failed to create night tail." },
    };
  }
};
