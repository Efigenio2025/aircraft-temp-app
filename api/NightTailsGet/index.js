const { TableClient } = require("@azure/data-tables");

const connectionString = process.env.STORAGE_CONNECTION_STRING;
const tableName = "NightTails";

module.exports = async function (context, req) {
  try {
    if (!connectionString) {
      context.log.error("Missing STORAGE_CONNECTION_STRING");
      return {
        status: 500,
        body: { error: "Server storage not configured." },
      };
    }

    const client = TableClient.fromConnectionString(connectionString, tableName);

    const station = req.query.station || "OMA";
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const partitionKey = `${station}-${date}`;

    const items = [];
    const entities = client.listEntities({
      queryOptions: {
        filter: `PartitionKey eq '${partitionKey}'`,
      },
    });

    for await (const e of entities) {
      items.push({
        id: e.rowKey,
        partitionKey: e.partitionKey,
        tail: e.Tail,
        gate: e.Gate,
        heatSource: e.HeatSource,
        inTime: e.InTime,
        markedInAt: e.MarkedInAt,
        purgedDrained: e.PurgedDrained,
        purgedAt: e.PurgedAt,
      });
    }

    return {
      status: 200,
      body: { station, date, items },
    };
  } catch (err) {
    context.log.error("NightTailsGet Error", err);
    return {
      status: 500,
      body: { error: "Failed to load night tails." },
    };
  }
};
