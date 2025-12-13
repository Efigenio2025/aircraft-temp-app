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

    const station = req.query.station || "OMA";
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const filter =
      `?station=eq.${encodeURIComponent(station)}&date=eq.${encodeURIComponent(date)}` +
      "&order=tail.asc";

    const items = await supabase.request(`/night_tails${filter}`);

    context.res = {
      status: 200,
      body: {
        station,
        date,
        items: (items || []).map((e) => ({
          id: e.id,
          partitionKey: `${e.station}-${e.date}`,
          tail: e.tail,
          gate: e.gate,
          heatSource: e.heat_source,
          inTime: e.in_time,
          markedInAt: e.marked_in_at,
          purgedDrained: e.purged_drained,
          purgedAt: e.purged_at,
        })),
      },
    };
  } catch (err) {
    context.log.error("NightTailsGet Error", err);
    context.res = {
      status: 500,
      body: { error: "Failed to load night tails." },
    };
  }
};
