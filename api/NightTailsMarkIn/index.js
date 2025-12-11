const { TableClient } = require("@azure/data-tables");
const { getConnectionString } = require("../shared/getConnectionString");
const tableName = "NightTails";

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

    const id = context.bindingData.id;
    const { partitionKey, markedInAt } = req.body || {};

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

    const entity = await client.getEntity(partitionKey, id);

    const valueToSet = markedInAt || new Date().toISOString();
    entity.MarkedInAt = valueToSet;

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
    context.log.error("Error in NightTailsMarkIn:", err);
    if (err.statusCode === 404) {
      context.res = {
        status: 404,
        body: { error: "Night tail not found." },
      };
      return;
    }
    context.res = {
      status: 500,
      body: { error: "Failed to mark in night tail." },
    };
  }
};
