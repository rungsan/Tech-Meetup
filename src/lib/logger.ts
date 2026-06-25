import pino from "pino";

// Structured JSON logger. Fail-closed redaction (D-006 / NFR-SEC-05):
// never log PII — customer name, mobile, license plate, chassis. Log ids/job_no only.
export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base: { service: process.env.OTEL_SERVICE_NAME ?? "cis" },
  redact: {
    paths: [
      "*.mobile",
      "*.name",
      "*.corporateName",
      "*.licensePlate",
      "*.chassisNo",
      "customer",
      "vehicle.licensePlate",
      "vehicle.chassisNo",
    ],
    censor: "[redacted]",
  },
});

/** Child logger bound to a request/correlation id. */
export function requestLogger(requestId: string) {
  return logger.child({ requestId });
}
