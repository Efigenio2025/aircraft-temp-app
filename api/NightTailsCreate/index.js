const { TableClient } = require("@azure/data-tables");
const { v4: uuidv4 } = require("uuid");

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

    const {
      tail,
      gate,
      heatSource,
      inTime,
      station = "OMA",
      dateOverride,
    } = req.body || {};

    if (!tail) {
      return {
        status: 400,
        body: { error: "tail is required." },
      };
    }

    const now = new Date();
    const dateStr = dateOverride || now.toISOString().slice(0, 10);
    const partitionKey = \`\${station}-\${dateStr}\`;
    const rowKey = uuidv4();

    const entity = {
      partitionKey,
      rowKey,
      Tail: tail,
      Gate: gate || "",
      HeatSource: heatSource || "",
      InTime: inTime || "",
      MarkedInAt: "",
      PurgedDrained: "N/A",
      PurgedAt: "",
    };

    await client.createEntity(entity);

    return {
      status: 201,
      body: {
        id: rowKey,
        partitionKey,
        tail: entity.Tail,
        gate: entity.Gate,
        heatSource: entity.HeatSource,
        inTime: entity.InTime,
        markedInAt: entity.MarkedInAt,
        purgedDrained: entity.PurgedDrained,
        purgedAt: entity.PurgedAt,
      },
    };
  } catch (err) {
    context.log.error("Error in NightTailsCreate:", err);
    return {
      status: 500,
      body: { error: "Failed to create night tail." },
    };
  }
};
