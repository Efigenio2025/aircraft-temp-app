const {
  supabaseRequest,
  supabaseConfigured,
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

    const id = context.bindingData.id;
    const { markedInAt } = req.body || {};

    if (!id) {
      context.res = {
        status: 400,
        body: { error: "id (rowKey) is required in route." },
      };
      return;
    }

    const valueToSet = markedInAt || new Date().toISOString();

    const data = await supabaseRequest("/night_tails", {
      method: "PATCH",
      searchParams: { id: `eq.${encodeURIComponent(id)}` },
      body: { marked_in_at: valueToSet },
      prefer: "return=representation",
    });

    const updated = Array.isArray(data) && data.length ? data[0] : null;
    if (!updated) {
      context.res = {
        status: 404,
        body: { error: "Night tail not found." },
      };
      return;
    }

    context.res = {
      status: 200,
      body: {
        id: updated.id,
        partitionKey: `${updated.station}-${updated.night_date}`,
        tail: updated.tail_number,
        location: updated.location,
        heatSource: updated.heat_source,
        drained: updated.drained,
        markedInAt: updated.marked_in_at,
        purgedAt: updated.purged_at,
      },
    };
  } catch (err) {
    context.log.error("Error in NightTailsMarkIn:", err);
    context.res = {
      status: 500,
      body: { error: "Failed to mark in night tail." },
    };
  }
};
