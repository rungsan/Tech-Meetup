import { db } from "@/lib/db";
import { apiError, apiOk, newRequestId } from "@/lib/api";
import { getSessionUser } from "@/lib/session";
import { createInspection } from "@/lib/inspection/service";
import { createInspectionSchema } from "@/lib/inspection/schema";

// POST /api/v1/inspections — create a single inspection (US-004).
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return apiError("UNAUTHENTICATED", "ยังไม่ได้เข้าสู่ระบบ");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("VALIDATION_ERROR", "รูปแบบข้อมูลไม่ถูกต้อง");
  }

  const parsed = createInspectionSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fields[issue.path.join(".")] = issue.message;
    }
    return apiError("VALIDATION_ERROR", "ข้อมูลไม่ผ่านการตรวจสอบ", fields);
  }

  const job = await createInspection(parsed.data, {
    userId: user.id,
    requestId: newRequestId(),
  });
  return apiOk({ id: job.id, jobNo: job.jobNo, status: job.status }, 201);
}

// GET /api/v1/inspections — recent jobs (skeleton minimal; full filters in B1, US-017).
export async function GET() {
  const user = await getSessionUser();
  if (!user) return apiError("UNAUTHENTICATED", "ยังไม่ได้เข้าสู่ระบบ");

  const jobs = await db.inspectionJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { vehicle: true, customer: true },
  });
  return apiOk({ data: jobs, page: 1, limit: 20, total: jobs.length });
}
