
      context.res = {
        status: 500,
        body: { error: "Supabase is not configured." },
      };
      return;
    }

    const id = context.bindingData.id;
    const { partitionKey, purgedDrained, purgedAt } = req.body || {};

    if (!id) {
      context.res = {
        status: 400,
        body: { error: "id (rowKey) is required in route." },
      };
      return;
    }

    if (!partitionKey) {
      context.res = {
        status: 400,
        body: { error: "partitionKey is required in body." },
      };
      return;
    }

    if (!purgedDrained) {
      context.res = {
        status: 400,
        body: { error: "purgedDrained is required (Yes / No / N/A)." },
      };
      return;
    }

    const [station, date] = partitionKey.split("-");
    if (!station || !date) {
      context.res = {
        status: 400,
        body: { error: "partitionKey must include station-date." },
      };
      return;
    }

    const valueToSet = purgedAt || new Date().toISOString();
    const filter =
      `?id=eq.${encodeURIComponent(id)}` +
      `&station=eq.${encodeURIComponent(station)}` +
      `&date=eq.${encodeURIComponent(date)}`;

    const data = await supabase.request(`/night_tails${filter}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        purged_drained: purgedDrained,
        purged_at: valueToSet,
      }),
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
        partitionKey: `${updated.station}-${updated.date}`,
        tail: updated.tail,
        gate: updated.gate,
        heatSource: updated.heat_source,
        inTime: updated.in_time,
        markedInAt: updated.marked_in_at,
        purgedDrained: updated.purged_drained,
        purgedAt: updated.purged_at,
      },
    };
  } catch (err) {
    context.log.error("Error in NightTailsPurge:", err);
    context.res = {
      status: 500,
      body: { error: "Failed to update purge info." },
    };
  }
};
