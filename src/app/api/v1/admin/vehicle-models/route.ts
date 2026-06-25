import { apiError, apiOk } from "@/lib/api";
import { getSessionUser } from "@/lib/session";
import { createModel } from "@/lib/vehicle/service";
import { modelCreateSchema } from "@/lib/vehicle/schema";

// POST /api/v1/admin/vehicle-models — create a model (US-031)
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return apiError("UNAUTHENTICATED", "ยังไม่ได้เข้าสู่ระบบ");
  const parsed = modelCreateSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    const fields = Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), i.message]));
    return apiError("VALIDATION_ERROR", "ข้อมูลไม่ผ่านการตรวจสอบ", fields);
  }
  return apiOk(await createModel(parsed.data), 201);
}
