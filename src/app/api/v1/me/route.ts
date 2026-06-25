import { apiError, apiOk } from "@/lib/api";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return apiError("UNAUTHENTICATED", "ยังไม่ได้เข้าสู่ระบบ");
  // Skeleton: menus derived from role.system (full RBAC matrix in B1, US-032).
  const menus =
    user.role.system === "abc"
      ? ["dashboard", "inspections", "reports", "billing", "admin"]
      : ["assignments", "billing"];
  return apiOk({ ...user, menus });
}
