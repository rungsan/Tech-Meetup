import { SpanStatusCode } from "@opentelemetry/api";
import { db } from "../db";
import { requestLogger } from "../logger";
import { tracer, createJobCounter, createJobDuration } from "../observability/otel";
import type { CreateInspectionInput, UpdateInspectionInput, ListInspectionQuery } from "./schema";

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
  return db.inspectionJob.findFirst({
    where: { id, deletedAt: null },
    include: {
      vehicle: { include: { model: { include: { brand: true } } } },
      customer: true,
      source: true,
      businessDiv: true,
      history: { orderBy: { performedAt: "asc" } },
    },
  });
}

/** Search / filter / paginate (US-017 pattern). Excludes soft-deleted. */
export async function listInspections(q: ListInspectionQuery) {
  const where: Record<string, unknown> = { deletedAt: null };
  if (q.status) where.status = q.status;
  if (q.q) {
    where.OR = [
      { jobNo: { contains: q.q, mode: "insensitive" } },
      { vehicle: { licensePlate: { contains: q.q, mode: "insensitive" } } },
      { customer: { name: { contains: q.q, mode: "insensitive" } } },
    ];
  }
  const [data, total] = await Promise.all([
    db.inspectionJob.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (q.page - 1) * q.limit,
      take: q.limit,
      include: { vehicle: true, customer: true },
    }),
    db.inspectionJob.count({ where }),
  ]);
  return { data, page: q.page, limit: q.limit, total };
}

/** Edit a job + write an audit row (US-030 pattern). */
export async function updateInspection(id: string, patch: UpdateInspectionInput, ctx: CreateContext) {
  const log = requestLogger(ctx.requestId);
  return tracer.startActiveSpan("inspection.update", async (span) => {
    try {
      const existing = await db.inspectionJob.findFirst({ where: { id, deletedAt: null } });
      if (!existing) return null;
      const updated = await db.$transaction(async (tx) => {
        const job = await tx.inspectionJob.update({
          where: { id },
          data: {
            appointmentStatus: patch.appointmentStatus,
            notSurveyReason: patch.notSurveyReason,
            ...(patch.customer && { customer: { update: patch.customer } }),
            ...(patch.vehicle && { vehicle: { update: patch.vehicle } }),
          },
        });
        await tx.jobHistory.create({
          data: { jobId: id, action: "updated", detail: "แก้ไขข้อมูลงาน", performedBy: ctx.userId },
        });
        return job;
      });
      log.info({ jobId: id }, "inspection.update done");
      span.setAttribute("job.id", id);
      return updated;
    } finally {
      span.end();
    }
  });
}

/** Soft delete + audit (D-004). */
export async function softDeleteInspection(id: string, ctx: CreateContext) {
  const existing = await db.inspectionJob.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;
  return db.$transaction(async (tx) => {
    const job = await tx.inspectionJob.update({ where: { id }, data: { deletedAt: new Date() } });
    await tx.jobHistory.create({
      data: { jobId: id, action: "deleted", detail: "ลบรายการ (soft)", performedBy: ctx.userId },
    });
    return job;
  });
}
