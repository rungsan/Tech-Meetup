import { apiError, apiOk, newRequestId } from "@/lib/api";
import { getSessionUser } from "@/lib/session";
import { getInspection, updateInspection, softDeleteInspection } from "@/lib/inspection/service";
import { updateInspectionSchema } from "@/lib/inspection/schema";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return apiError("UNAUTHENTICATED", "ยังไม่ได้เข้าสู่ระบบ");

  const { id } = await params;
  const job = await getInspection(id);
  if (!job) return apiError("NOT_FOUND", "ไม่พบงานตรวจสภาพ");
  return apiOk(job);
}

// PATCH /api/v1/inspections/{id} — edit job (US-030 pattern).
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return apiError("UNAUTHENTICATED", "ยังไม่ได้เข้าสู่ระบบ");

  const { id } = await params;
  const parsed = updateInspectionSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    const fields = Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), i.message]));
    return apiError("VALIDATION_ERROR", "ข้อมูลไม่ผ่านการตรวจสอบ", fields);
  }
  const updated = await updateInspection(id, parsed.data, { userId: user.id, requestId: newRequestId() });
  if (!updated) return apiError("NOT_FOUND", "ไม่พบงานตรวจสภาพ");
  return apiOk({ id: updated.id, status: updated.status });
}

// DELETE /api/v1/inspections/{id} — soft delete (US-027 pattern; Admin-gated in B1).
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return apiError("UNAUTHENTICATED", "ยังไม่ได้เข้าสู่ระบบ");

  const { id } = await params;
  const deleted = await softDeleteInspection(id, { userId: user.id, requestId: newRequestId() });
  if (!deleted) return apiError("NOT_FOUND", "ไม่พบงานตรวจสภาพ");
  return apiOk({ id: deleted.id, deleted: true });
}
