
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
      "&order=time.desc";

    const items = await supabase.request(`/temp_logs${filter}`);

    context.res = {
      status: 200,
      body: {
        station,
        date,
        items: (items || []).map((entity) => ({
          id: entity.id,
          partitionKey: `${entity.station}-${entity.date}`,
          tail: entity.tail,
          location: entity.location,
          heatSource: entity.heat_source,
          temp: entity.temp,
          status: entity.status,
          time: entity.time,
          notes: entity.notes,
        })),
      },
    };
  } catch (err) {
    context.log.error("Error in TempLogsGetTonight:", err);
    context.res = {
      status: 500,
      body: { error: "Failed to load temp logs." },
    };
  }
};
