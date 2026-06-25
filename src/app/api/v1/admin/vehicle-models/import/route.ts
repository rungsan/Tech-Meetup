import { apiError, apiOk } from "@/lib/api";
import { getSessionUser } from "@/lib/session";
import { importCsv } from "@/lib/vehicle/service";

// POST /api/v1/admin/vehicle-models/import — import Master from CSV (US-031)
// Accepts raw CSV text (Content-Type text/csv) or { csv } JSON.
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return apiError("UNAUTHENTICATED", "ยังไม่ได้เข้าสู่ระบบ");

  const ct = req.headers.get("content-type") ?? "";
  let csv = "";
  if (ct.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    csv = body?.csv ?? "";
  } else {
    csv = await req.text();
  }
  if (!csv.trim()) return apiError("VALIDATION_ERROR", "ไม่มีข้อมูล CSV");

  const result = await importCsv(csv);
  return apiOk(result);
}
