module.exports = async function (context, req) {
  context.log("NightTailsGet test function hit.");

  const hasConnectionString = !!process.env.STORAGE_CONNECTION_STRING;

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
