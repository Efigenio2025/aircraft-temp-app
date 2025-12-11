const { getConnectionString } = require("../shared/getConnectionString");

module.exports = async function (context) {
  context.log("NightTailsGet test function hit.");

  const hasConnectionString = !!getConnectionString(context);

  return {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: {
      ok: true,
      message: "NightTailsGet is alive",
      hasConnectionString,
    },
  };
};
