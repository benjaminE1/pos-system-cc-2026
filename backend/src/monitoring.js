const { useAzureMonitor } = require('@azure/monitor-opentelemetry');

useAzureMonitor({
  azureMonitorExporterOptions: {
    connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
  }
});
