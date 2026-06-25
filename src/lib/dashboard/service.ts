import { db } from "../db";

// US-002 — dashboard aggregates. Cost chart deferred until billing exists (US-022+) — volume only for now.
export async function dashboardSummary(currentUserId: string) {
  const [grouped, recentAll, recentMine, yearlyRows] = await Promise.all([
    db.inspectionJob.groupBy({
      by: ["status"],
      where: { deletedAt: null },
      _count: { _all: true },
    }),
    db.inspectionJob.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { vehicle: true, customer: true },
    }),
    db.inspectionJob.findMany({
      where: { deletedAt: null, ownerUserId: currentUserId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { vehicle: true, customer: true },
    }),
    db.$queryRaw<{ yr: number; count: bigint }[]>`
      SELECT EXTRACT(YEAR FROM created_at)::int AS yr, COUNT(*)::bigint AS count
      FROM inspection_jobs WHERE deleted_at IS NULL
      GROUP BY yr ORDER BY yr DESC LIMIT 3`,
  ]);

  const statusCounts: Record<string, number> = {};
  for (const g of grouped) statusCounts[g.status] = g._count._all;

  const yearly = yearlyRows.map((r) => ({ year: r.yr, count: Number(r.count) })).reverse();

  return { statusCounts, yearly, recentAll, recentMine };
}
