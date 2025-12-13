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

    const station = req.query.station || DEFAULT_STATION;
    const nightDate = req.query.date || getTodayDateString();

    const items = await supabaseRequest("/night_tails", {
      searchParams: {
        select: "*",
        station: `eq.${station}`,
        night_date: `eq.${nightDate}`,
        order: "created_at.desc",
      },
    });

    context.res = {
      status: 200,
      body: {
        station,
        date: nightDate,
        items: (items || []).map((entity) => ({
          id: entity.id,
          partitionKey: `${entity.station}-${entity.night_date}`,
          tail: entity.tail_number,
          location: entity.location,
          heatSource: entity.heat_source,
          drained: entity.drained,
          markedInAt: entity.marked_in_at,
          purgedAt: entity.purged_at,
        })),
      },
    };
  } catch (err) {
    context.log.error("Error in NightTailsGet:", err);
    context.res = {
      status: 500,
      body: { error: "Failed to load night tails." },
    };
  }
};
