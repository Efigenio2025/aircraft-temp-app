const { TableClient } = require("@azure/data-tables");

const connectionString = process.env.STORAGE_CONNECTION_STRING;
const tableName = "TempLogs";

module.exports = async function (context, req) {
  try {
    if (!connectionString) {
      context.log.error("Missing STORAGE_CONNECTION_STRING");
      context.res = {
        status: 500,
        body: { error: "Server storage not configured." },
      };
      return;
    }

    const client = TableClient.fromConnectionString(connectionString, tableName);

    const station = req.query.station || "OMA";
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const partitionKey = `${station}-${date}`;

    const items = [];
    const iterator = client.listEntities({
      queryOptions: {
        filter: `PartitionKey eq '${partitionKey}'`,
      },
    });

    for await (const entity of iterator) {
      items.push({
        id: entity.rowKey,
        partitionKey: entity.partitionKey,
        tail: entity.Tail,
        location: entity.Location,
        heatSource: entity.HeatSource,
        temp: entity.Temp,
        status: entity.Status,
        time: entity.Time,
        notes: entity.Notes,
      });
    }

    items.sort((a, b) => (a.time || "").localeCompare(b.time || "")).reverse();

    context.res = {
      status: 200,
      body: {
        station,
        date,
        items,
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
