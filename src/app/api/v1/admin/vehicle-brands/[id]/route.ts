import { apiError, apiOk } from "@/lib/api";
import { getSessionUser } from "@/lib/session";
import { updateBrand, deleteBrand } from "@/lib/vehicle/service";
import { brandUpdateSchema } from "@/lib/vehicle/schema";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return apiError("UNAUTHENTICATED", "ยังไม่ได้เข้าสู่ระบบ");
  const { id } = await params;
  const parsed = brandUpdateSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    const fields = Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), i.message]));
    return apiError("VALIDATION_ERROR", "ข้อมูลไม่ผ่านการตรวจสอบ", fields);
  }
  const updated = await updateBrand(id, parsed.data);
  if (!updated) return apiError("NOT_FOUND", "ไม่พบยี่ห้อ");
  return apiOk(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return apiError("UNAUTHENTICATED", "ยังไม่ได้เข้าสู่ระบบ");
  const { id } = await params;
  const deleted = await deleteBrand(id);
  if (!deleted) return apiError("NOT_FOUND", "ไม่พบยี่ห้อ");
  return apiOk({ id, deleted: true });
}
