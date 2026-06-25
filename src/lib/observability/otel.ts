import { metrics, trace } from "@opentelemetry/api";

const METER_NAME = "cis.inspection";
const TRACER_NAME = "cis";

export const tracer = trace.getTracer(TRACER_NAME);
const meter = metrics.getMeter(METER_NAME);

// Domain metrics (D-006): one outcome counter + one latency histogram per critical flow.
export const createJobCounter = meter.createCounter("cis_create_job_total", {
  description: "Total inspection-job create attempts, labelled by result",
});

export const createJobDuration = meter.createHistogram("cis_create_job_duration_ms", {
  description: "Inspection-job create latency in milliseconds",
  unit: "ms",
});
