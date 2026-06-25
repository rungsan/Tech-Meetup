import { db } from "@/lib/db";
import { apiError } from "@/lib/api";
import { SESSION_COOKIE, signSession } from "@/lib/session";
import { NextResponse } from "next/server";

// SKELETON STUB (D-002): logs in the seeded ABC admin. B2 replaces with Azure AD SSO.
export async function POST() {
  const user = await db.user.findFirst({ where: { system: "abc", status: "active" } });
  if (!user) return apiError("UNAUTHENTICATED", "ไม่พบผู้ใช้ ABC (ยังไม่ได้ seed)");

  const res = NextResponse.json({ id: user.id, displayName: user.displayName });
  res.cookies.set(SESSION_COOKIE, signSession(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return res;
}
