import { SpanStatusCode } from "@opentelemetry/api";
import { db } from "../db";
import { requestLogger } from "../logger";
import { tracer, createJobCounter, createJobDuration } from "../observability/otel";
import type { CreateInspectionInput } from "./schema";

function genJobNo(): string {
  const y = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
  return `CIS-${y}-${rand}`;
}

export type CreateContext = { userId: string; requestId: string };

/**
 * Create an inspection job — the golden multi-table write (D-005):
 * InspectionJob + Vehicle + Customer + JobHistory in one transaction,
 * with structured log (no PII), a trace span, and outcome+latency metrics.
 */
export async function createInspection(input: CreateInspectionInput, ctx: CreateContext) {
  const log = requestLogger(ctx.requestId);
  const started = performance.now();

  return tracer.startActiveSpan("inspection.create", async (span) => {
    const jobNo = genJobNo();
    // red-plate ⇒ province forced to "99" (US-004 / US-005 AC)
    const province = input.vehicle.isRedPlate ? "99" : input.vehicle.province;
    log.info({ jobNo, customerType: input.customerType }, "inspection.create start");

    try {
      const job = await db.$transaction(async (tx) => {
        const created = await tx.inspectionJob.create({
          data: {
            jobNo,
            status: "new",
            customerType: input.customerType,
            sourceId: input.sourceId,
            businessDivId: input.businessDivId,
            coverageStartDate: new Date(input.coverageStartDate),
            appointmentStatus: input.appointmentStatus,
            notSurveyReason: input.notSurveyReason,
            notifyEmails: input.notifyEmails,
            createdById: ctx.userId,
            ownerUserId: ctx.userId,
            vehicle: {
              create: {
                licensePlate: input.vehicle.licensePlate,
                province,
                isRedPlate: input.vehicle.isRedPlate,
                brandId: input.vehicle.brandId,
                modelId: input.vehicle.modelId,
                chassisNo: input.vehicle.chassisNo,
                vehicleType: input.vehicle.vehicleType,
              },
            },
            customer: {
              create: {
                type: input.customerType,
                name: input.customer.name,
                corporateName: input.customer.corporateName,
                mobile: input.customer.mobile,
              },
            },
            history: {
              create: {
                action: "created",
                detail: "สร้างรายการตรวจสภาพ",
                performedBy: ctx.userId,
              },
            },
          },
        });
        return created;
      });

      span.setAttribute("job.id", job.id);
      span.setAttribute("job.no", job.jobNo);
      createJobCounter.add(1, { result: "success" });
      createJobDuration.record(performance.now() - started, { result: "success" });
      log.info({ jobId: job.id, jobNo: job.jobNo }, "inspection.create done");
      span.setStatus({ code: SpanStatusCode.OK });
      return job;
    } catch (err) {
      createJobCounter.add(1, { result: "error" });
      createJobDuration.record(performance.now() - started, { result: "error" });
      log.error({ jobNo, err: (err as Error).message }, "inspection.create failed");
      span.setStatus({ code: SpanStatusCode.ERROR, message: (err as Error).message });
      throw err;
    } finally {
      span.end();
    }
  });
}

export async function getInspection(id: string) {
  return db.inspectionJob.findUnique({
    where: { id },
    include: {
      vehicle: { include: { model: { include: { brand: true } } } },
      customer: true,
      source: true,
      businessDiv: true,
      history: { orderBy: { performedAt: "asc" } },
    },
  });
}
