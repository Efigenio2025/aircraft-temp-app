const { TableClient } = require("@azure/data-tables");
const { v4: uuidv4 } = require("uuid");
const { getConnectionString } = require("../shared/getConnectionString");
const tableName = "TempLogs";

module.exports = async function (context, req) {
  try {
    const connectionString = getConnectionString(context);
    if (!connectionString) {
      context.res = {
        status: 500,
        body: { error: "Server storage not configured." },
      };
      return;
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
      context.res = {
        status: 400,
        body: { error: "tail, temp, and status are required." },
      };
      return;
    }

    const now = new Date();
    const dateStr = dateOverride || now.toISOString().slice(0, 10);
    const partitionKey = `${station}-${dateStr}`;
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

    context.res = {
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
    context.res = {
      status: 500,
      body: { error: "Failed to create temp log." },
    };
  }
};
