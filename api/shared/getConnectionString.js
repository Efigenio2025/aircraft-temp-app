function getConnectionString(context) {
  const value =
    process.env.STORAGE_CONNECTION_STRING ||
    process.env.AZURE_STORAGE_CONNECTION_STRING ||
    process.env.AzureWebJobsStorage ||
    process.env.CUSTOMCONNSTR_STORAGE_CONNECTION_STRING;

  if (!value && context && context.log) {
    context.log.error(
      "Missing storage connection string (tried STORAGE_CONNECTION_STRING, AZURE_STORAGE_CONNECTION_STRING, AzureWebJobsStorage, CUSTOMCONNSTR_STORAGE_CONNECTION_STRING)."
    );
  }

  return value;
}

module.exports = { getConnectionString };
