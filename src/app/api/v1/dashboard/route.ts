import { apiError, apiOk } from "@/lib/api";
import { getSessionUser } from "@/lib/session";
import { dashboardSummary } from "@/lib/dashboard/service";

// GET /api/v1/dashboard — status counts + 3-year volume + recent lists (US-002)
export async function GET() {
  const user = await getSessionUser();
  if (!user) return apiError("UNAUTHENTICATED", "ยังไม่ได้เข้าสู่ระบบ");
  return apiOk(await dashboardSummary(user.id));
}
