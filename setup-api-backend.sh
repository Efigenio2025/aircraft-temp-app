#!/usr/bin/env bash
set -e

echo "Resetting api folder..."
rm -rf api
mkdir api
cd api

echo "Creating host.json..."
cat > host.json << 'EOF'
{
  "version": "2.0"
}
EOF

echo "Creating package.json..."
cat > package.json << 'EOF'
{
  "name": "aircraft-temp-api",
  "version": "1.0.0",
  "description": "Azure Functions backend for aircraft temp logging",
  "main": "index.js",
  "license": "MIT",
  "dependencies": {
    "@azure/data-tables": "^13.2.2",
    "uuid": "^9.0.0"
  }
}
EOF

echo "Installing backend dependencies..."
npm install

###############################################################################
# TEMP LOGS: CREATE  (POST /api/temp-logs)
###############################################################################
echo "Creating TempLogsCreate..."
mkdir TempLogsCreate
cat > TempLogsCreate/function.json << 'EOF'
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": [ "post" ],
      "route": "temp-logs"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
EOF

cat > TempLogsCreate/index.js << 'EOF'
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
EOF

###############################################################################
# TEMP LOGS: GET TONIGHT  (GET /api/temp-logs?station=&date=)
###############################################################################
echo "Creating TempLogsGetTonight..."
mkdir TempLogsGetTonight
cat > TempLogsGetTonight/function.json << 'EOF'
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": [ "get" ],
      "route": "temp-logs"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
EOF

cat > TempLogsGetTonight/index.js << 'EOF'
const { TableClient } = require("@azure/data-tables");

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

    const station = req.query.station || "OMA";
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const partitionKey = \`\${station}-\${date}\`;

    const items = [];
    const iterator = client.listEntities({
      queryOptions: {
        filter: \`PartitionKey eq '\${partitionKey}'\`,
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

    return {
      status: 200,
      body: {
        station,
        date,
        items,
      },
    };
  } catch (err) {
    context.log.error("Error in TempLogsGetTonight:", err);
    return {
      status: 500,
      body: { error: "Failed to load temp logs." },
    };
  }
};
EOF

###############################################################################
# NIGHT TAILS: GET  (GET /api/night-tails?station=&date=)
###############################################################################
echo "Creating NightTailsGet..."
mkdir NightTailsGet
cat > NightTailsGet/function.json << 'EOF'
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": [ "get" ],
      "route": "night-tails"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
EOF

cat > NightTailsGet/index.js << 'EOF'
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
    const partitionKey = \`\${station}-\${date}\`;

    const items = [];
    const iterator = client.listEntities({
      queryOptions: {
        filter: \`PartitionKey eq '\${partitionKey}'\`,
      },
    });

    for await (const entity of iterator) {
      items.push({
        id: entity.rowKey,
        partitionKey: entity.partitionKey,
        tail: entity.Tail,
        gate: entity.Gate,
        heatSource: entity.HeatSource,
        inTime: entity.InTime,
        markedInAt: entity.MarkedInAt,
        purgedDrained: entity.PurgedDrained,
        purgedAt: entity.PurgedAt,
      });
    }

    return {
      status: 200,
      body: {
        station,
        date,
        items,
      },
    };
  } catch (err) {
    context.log.error("Error in NightTailsGet:", err);
    return {
      status: 500,
      body: { error: "Failed to load tonight's aircraft." },
    };
  }
};
EOF

###############################################################################
# NIGHT TAILS: CREATE  (POST /api/night-tails)
###############################################################################
echo "Creating NightTailsCreate..."
mkdir NightTailsCreate
cat > NightTailsCreate/function.json << 'EOF'
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": [ "post" ],
      "route": "night-tails"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
EOF

cat > NightTailsCreate/index.js << 'EOF'
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
EOF

###############################################################################
# NIGHT TAILS: MARK IN  (PATCH /api/night-tails/:id/mark-in)
###############################################################################
echo "Creating NightTailsMarkIn..."
mkdir NightTailsMarkIn
cat > NightTailsMarkIn/function.json << 'EOF'
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": [ "patch" ],
      "route": "night-tails/{id}/mark-in"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
EOF

cat > NightTailsMarkIn/index.js << 'EOF'
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
EOF

###############################################################################
# NIGHT TAILS: PURGE  (PATCH /api/night-tails/:id/purge)
###############################################################################
echo "Creating NightTailsPurge..."
mkdir NightTailsPurge
cat > NightTailsPurge/function.json << 'EOF'
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": [ "patch" ],
      "route": "night-tails/{id}/purge"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
EOF

cat > NightTailsPurge/index.js << 'EOF'
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
EOF

echo "Done creating API backend."
chmod +x setup-api-backend.sh
./setup-api-backend.sh
