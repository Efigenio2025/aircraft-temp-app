const { TableClient } = require("@azure/data-tables");

const connectionString = process.env.STORAGE_CONNECTION_STRING;
const tableName = "NightTails";

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

    const entity = await client.getEntity(partitionKey, id);

    entity.PurgedDrained = purgedDrained;
    entity.PurgedAt = purgedAt || new Date().toISOString();

    await client.updateEntity(entity, "Replace");

    context.res = {
      status: 200,
      body: {
        id,
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
    context.log.error("Error in NightTailsPurge:", err);
    if (err.statusCode === 404) {
      context.res = {
        status: 404,
        body: { error: "Night tail not found." },
      };
      return;
    }
    context.res = {
      status: 500,
      body: { error: "Failed to update purge info." },
    };
  }
};
