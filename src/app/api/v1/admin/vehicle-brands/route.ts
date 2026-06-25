import { apiError, apiOk } from "@/lib/api";
import { getSessionUser } from "@/lib/session";
import { listVehicles, createBrand } from "@/lib/vehicle/service";
import { brandCreateSchema, vehicleListQuerySchema } from "@/lib/vehicle/schema";

// GET /api/v1/admin/vehicle-brands?q= — list brands (with models) + search (US-031)
export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return apiError("UNAUTHENTICATED", "ยังไม่ได้เข้าสู่ระบบ");
  const parsed = vehicleListQuerySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "พารามิเตอร์ค้นหาไม่ถูกต้อง");
  return apiOk({ data: await listVehicles(parsed.data.q) });
}

// POST — create brand
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return apiError("UNAUTHENTICATED", "ยังไม่ได้เข้าสู่ระบบ");
  const parsed = brandCreateSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    const fields = Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), i.message]));
    return apiError("VALIDATION_ERROR", "ข้อมูลไม่ผ่านการตรวจสอบ", fields);
  }
  return apiOk(await createBrand(parsed.data), 201);
}
