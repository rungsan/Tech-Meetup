import { apiError, apiOk } from "@/lib/api";
import { getSessionUser } from "@/lib/session";
import { assignInspection } from "@/lib/inspection/service";

// POST /api/v1/inspections/{id}/assign — "Assign to me" (US-008)
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return apiError("UNAUTHENTICATED", "ยังไม่ได้เข้าสู่ระบบ");
  const { id } = await params;
  const job = await assignInspection(id, user.id);
  if (!job) return apiError("NOT_FOUND", "ไม่พบงานตรวจสภาพ");
  return apiOk({ id: job.id, ownerUserId: job.ownerUserId });
}
