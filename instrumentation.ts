// Next.js instrumentation hook — starts OpenTelemetry (B0 proof: console exporters).
// Service name comes from OTEL_SERVICE_NAME env. OTLP backend deferred (D-006).
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { NodeSDK } = await import("@opentelemetry/sdk-node");
  const { ConsoleSpanExporter } = await import("@opentelemetry/sdk-trace-node");
  const { PeriodicExportingMetricReader, ConsoleMetricExporter } = await import(
    "@opentelemetry/sdk-metrics"
  );

  const sdk = new NodeSDK({
    traceExporter: new ConsoleSpanExporter(),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new ConsoleMetricExporter(),
      exportIntervalMillis: 15000,
    }),
  });

  sdk.start();
}
