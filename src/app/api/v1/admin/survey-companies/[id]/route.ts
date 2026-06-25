import { apiError, apiOk } from "@/lib/api";
import { getSessionUser } from "@/lib/session";
import { updateSurveyCompany, softDeleteSurveyCompany } from "@/lib/survey/service";
import { surveyUpdateSchema } from "@/lib/survey/schema";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return apiError("UNAUTHENTICATED", "ยังไม่ได้เข้าสู่ระบบ");
  const { id } = await params;
  const parsed = surveyUpdateSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    const fields = Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), i.message]));
    return apiError("VALIDATION_ERROR", "ข้อมูลไม่ผ่านการตรวจสอบ", fields);
  }
  const updated = await updateSurveyCompany(id, parsed.data);
  if (!updated) return apiError("NOT_FOUND", "ไม่พบบริษัท Survey");
  return apiOk(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return apiError("UNAUTHENTICATED", "ยังไม่ได้เข้าสู่ระบบ");
  const { id } = await params;
  const deleted = await softDeleteSurveyCompany(id);
  if (!deleted) return apiError("NOT_FOUND", "ไม่พบบริษัท Survey");
  return apiOk({ id, deleted: true });
}
