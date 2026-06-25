import { apiError, apiOk } from "@/lib/api";
import { getSessionUser } from "@/lib/session";
import { listSurveyCompanies, createSurveyCompany } from "@/lib/survey/service";
import { surveyCreateSchema, surveyListQuerySchema } from "@/lib/survey/schema";

// GET /api/v1/admin/survey-companies?q= — list + search (US-028)
export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return apiError("UNAUTHENTICATED", "ยังไม่ได้เข้าสู่ระบบ");
  const parsed = surveyListQuerySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "พารามิเตอร์ค้นหาไม่ถูกต้อง");
  return apiOk({ data: await listSurveyCompanies(parsed.data.q) });
}

// POST — create survey company
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return apiError("UNAUTHENTICATED", "ยังไม่ได้เข้าสู่ระบบ");
  const parsed = surveyCreateSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    const fields = Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), i.message]));
    return apiError("VALIDATION_ERROR", "ข้อมูลไม่ผ่านการตรวจสอบ", fields);
  }
  try {
    return apiOk(await createSurveyCompany(parsed.data), 201);
  } catch {
    return apiError("CONFLICT", "รหัสบริษัทซ้ำ");
  }
}
