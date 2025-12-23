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

    const {
      tail,
      tailNumber,
      location,
      heatSource,
      drained = false,
      dateOverride,
    } = req.body || {};

    const tailValue = (tailNumber || tail || "").toUpperCase();
    if (!tailValue) {
      context.res = {
        status: 400,
        body: { error: "tail is required." },
      };
      return;
    }

    const nightDate = dateOverride || getTodayDateString();
    const payload = {
      station: DEFAULT_STATION,
      night_date: nightDate,
      tail_number: tailValue,
      location: location || "",
      heat_source: heatSource || "",
      drained: Boolean(drained),
      marked_in_at: null,
      purged_at: null,
    };

    const data = await supabaseRequest("/night_tails", {
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
        location: saved.location,
        heatSource: saved.heat_source,
        drained: saved.drained,
        markedInAt: saved.marked_in_at,
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
