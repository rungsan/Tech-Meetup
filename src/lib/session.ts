import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { db } from "./db";

// Skeleton stub session (D-002): HMAC-signed cookie carrying the user id.
// B2 replaces this with NextAuth (Azure AD for ABC, credentials for E-Motor).
export const SESSION_COOKIE = "cis_session";

function secret() {
  return process.env.SESSION_SECRET ?? "dev-only-insecure-secret";
}

export function signSession(userId: string): string {
  const sig = createHmac("sha256", secret()).update(userId).digest("hex");
  return `${userId}.${sig}`;
}

function verify(token: string): string | null {
  const idx = token.lastIndexOf(".");
  if (idx < 0) return null;
  const userId = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = createHmac("sha256", secret()).update(userId).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return userId;
}

export type SessionUser = {
  id: string;
  displayName: string;
  role: { name: string; system: string };
};

/** Returns the authenticated user, or null. Server-side only. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const userId = verify(token);
  if (!userId) return null;
  const user = await db.user.findUnique({ where: { id: userId }, include: { role: true } });
  if (!user || user.status !== "active") return null;
  return {
    id: user.id,
    displayName: user.displayName,
    role: { name: user.role.name, system: user.role.system },
  };
}
