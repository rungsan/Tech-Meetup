/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin file-tracing to this project so Windows user-profile junctions
  // (e.g. "Application Data") are never scanned.
  outputFileTracingRoot: import.meta.dirname,
  // Keep node-only libs out of the webpack bundle (run as Node externals).
  serverExternalPackages: [
    "@opentelemetry/sdk-node",
    "@opentelemetry/sdk-trace-node",
    "@opentelemetry/sdk-metrics",
    "@prisma/client",
    "prisma",
    "pino",
    "pino-pretty",
  ],
};

export default nextConfig;
