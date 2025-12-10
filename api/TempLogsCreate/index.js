const { TableClient } = require("@azure/data-tables");
const { v4: uuidv4 } = require("uuid");

const connectionString = process.env.STORAGE_CONNECTION_STRING;
const tableName = "TempLogs";

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
      location,
      heatSource,
      temp,
      status,
      time,
      notes,
      station = "OMA",
      dateOverride,
    } = req.body || {};

    if (!tail || temp === undefined || temp === null || !status) {
      return {
        status: 400,
        body: { error: "tail, temp, and status are required." },
      };
    }

    const now = new Date();
    const dateStr = dateOverride || now.toISOString().slice(0, 10);
    const partitionKey = \`\${station}-\${dateStr}\`;
    const rowKey = uuidv4();

    const numericTemp =
      typeof temp === "number" ? temp : Number(temp);

    const entity = {
      partitionKey,
      rowKey,
      Tail: tail,
      Location: location || "",
      HeatSource: heatSource || "",
      Temp: numericTemp,
      Status: status,
      Time: time || now.toISOString(),
      Notes: notes || "",
    };

    await client.createEntity(entity);

    return {
      status: 201,
      body: {
        id: rowKey,
        partitionKey,
        tail: entity.Tail,
        location: entity.Location,
        heatSource: entity.HeatSource,
        temp: entity.Temp,
        status: entity.Status,
        time: entity.Time,
        notes: entity.Notes,
      },
    };
  } catch (err) {
    context.log.error("Error in TempLogsCreate:", err);
    return {
      status: 500,
      body: { error: "Failed to create temp log." },
    };
  }
};
