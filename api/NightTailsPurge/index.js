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

    const id = context.bindingData.id;
    const { partitionKey, purgedDrained, purgedAt } = req.body || {};

    if (!id) {
      return {
        status: 400,
        body: { error: "id (rowKey) is required in route." },
      };
    }

    if (!partitionKey) {
      return {
        status: 400,
        body: { error: "partitionKey is required in body." },
      };
    }

    if (!purgedDrained) {
      return {
        status: 400,
        body: { error: "purgedDrained is required (Yes / No / N/A)." },
      };
    }

    const entity = await client.getEntity(partitionKey, id);

    entity.PurgedDrained = purgedDrained;
    entity.PurgedAt = purgedAt || new Date().toISOString();

    await client.updateEntity(entity, "Replace");

    return {
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
      return {
        status: 404,
        body: { error: "Night tail not found." },
      };
    }
    return {
      status: 500,
      body: { error: "Failed to update purge info." },
    };
  }
};
