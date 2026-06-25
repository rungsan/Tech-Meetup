import { db } from "@/lib/db";
import { apiError, apiOk } from "@/lib/api";
import { getSessionUser } from "@/lib/session";

// Master data for the create-inspection form (Source/Division/Brand/Model).
export async function GET() {
  const user = await getSessionUser();
  if (!user) return apiError("UNAUTHENTICATED", "ยังไม่ได้เข้าสู่ระบบ");

  const [sources, divisions, brands, models] = await Promise.all([
    db.source.findMany({ orderBy: { name: "asc" } }),
    db.businessDivision.findMany({ orderBy: { name: "asc" } }),
    db.vehicleBrand.findMany({ where: { status: "active" }, orderBy: { name: "asc" } }),
    db.vehicleModel.findMany({
      where: { status: "active" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, brandId: true, vehicleType: true },
    }),
  ]);

  return apiOk({ sources, divisions, brands, models });
}
