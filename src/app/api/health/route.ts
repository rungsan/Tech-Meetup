import { db } from "@/lib/db";
import { apiOk } from "@/lib/api";
import { NextResponse } from "next/server";

// Readiness smoke target (obs-intent §7). No auth.
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return apiOk({ status: "ok", db: "up" });
  } catch {
    return NextResponse.json({ status: "degraded", db: "down" }, { status: 503 });
  }
}
