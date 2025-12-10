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
    const { partitionKey, markedInAt } = req.body || {};

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

    const entity = await client.getEntity(partitionKey, id);

    const valueToSet = markedInAt || new Date().toISOString();
    entity.MarkedInAt = valueToSet;

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
    context.log.error("Error in NightTailsMarkIn:", err);
    if (err.statusCode === 404) {
      return {
        status: 404,
        body: { error: "Night tail not found." },
      };
    }
    return {
      status: 500,
      body: { error: "Failed to mark in night tail." },
    };
  }
};
