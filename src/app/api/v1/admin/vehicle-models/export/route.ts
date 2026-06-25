import { apiError } from "@/lib/api";
import { getSessionUser } from "@/lib/session";
import { exportCsv } from "@/lib/vehicle/service";

// GET /api/v1/admin/vehicle-models/export — Download Master as CSV (US-031)
// Note: BRD asks Excel; B1 ships CSV (Excel-openable). .xlsx formatting = named deferral to B3.
export async function GET() {
  const user = await getSessionUser();
  if (!user) return apiError("UNAUTHENTICATED", "ยังไม่ได้เข้าสู่ระบบ");
  const csv = await exportCsv();
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="vehicle-master.csv"',
    },
  });
}
