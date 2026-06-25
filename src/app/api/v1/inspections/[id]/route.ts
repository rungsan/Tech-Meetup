import { apiError, apiOk } from "@/lib/api";
import { getSessionUser } from "@/lib/session";
import { getInspection } from "@/lib/inspection/service";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return apiError("UNAUTHENTICATED", "ยังไม่ได้เข้าสู่ระบบ");

  const { id } = await params;
  const job = await getInspection(id);
  if (!job) return apiError("NOT_FOUND", "ไม่พบงานตรวจสภาพ");
  return apiOk(job);
}
