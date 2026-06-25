"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STATUSES: [string, string][] = [
  ["new", "งานเข้าใหม่"],
  ["follow_appointment", "ติดตามนัดหมาย"],
  ["send_survey", "ส่ง SV ออกตรวจ"],
  ["track_survey", "ติดตาม SV"],
  ["await_result", "รอผลตรวจ"],
  ["inspected", "ตรวจแล้ว"],
  ["no_survey", "ไม่ส่ง SV"],
  ["cancelled", "ยกเลิก"],
];

type Job = { id: string; jobNo: string; status: string; vehicle: { licensePlate: string } | null };
type Summary = {
  statusCounts: Record<string, number>;
  yearly: { year: number; count: number }[];
  recentAll: Job[];
  recentMine: Job[];
};

export default function DashboardPage() {
  const [s, setS] = useState<Summary | null>(null);

  useEffect(() => {
    fetch("/api/v1/dashboard")
      .then((r) => r.json())
      .then(setS)
      .catch(() => {});
  }, []);

  const maxYear = Math.max(1, ...(s?.yearly.map((y) => y.count) ?? [1]));

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-fg">Dashboard</h1>
        <p className="mt-1 text-sm text-fg-muted">ภาพรวมงานตรวจสภาพรถ</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATUSES.map(([key, label]) => (
          <Link
            key={key}
            href={`/inspections?status=${key}`}
            className="rounded-lg border border-line bg-card p-4 transition-colors hover:border-line-strong"
          >
            <div className="text-2xl font-semibold text-fg">{s?.statusCounts[key] ?? 0}</div>
            <div className="mt-1 text-sm text-fg-muted">{label}</div>
          </Link>
        ))}
      </div>

      <section className="mb-6 rounded-lg border border-line bg-card p-4">
        <h2 className="mb-3 font-medium text-fg">ปริมาณการตรวจสภาพ (3 ปีย้อนหลัง)</h2>
        {s?.yearly.length ? (
          <div className="space-y-2">
            {s.yearly.map((y) => (
              <div key={y.year} className="flex items-center gap-3 text-sm">
                <span className="w-12 text-fg-muted">{y.year}</span>
                <div className="h-5 flex-1 rounded bg-canvas">
                  <div
                    className="h-5 rounded bg-primary"
                    style={{ width: `${Math.round((y.count / maxYear) * 100)}%` }}
                  />
                </div>
                <span className="w-10 text-right text-fg">{y.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-fg-muted">ยังไม่มีข้อมูล</p>
        )}
        <p className="mt-2 text-xs text-fg-subtle">* กราฟค่าใช้จ่ายจะแสดงเมื่อมีข้อมูลตั้งเบิก (US-022+)</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <RecentList title="รายการของฉัน (ล่าสุด)" jobs={s?.recentMine ?? []} href="/inspections/mine" />
        <RecentList title="รายการตรวจสภาพ (ล่าสุด)" jobs={s?.recentAll ?? []} href="/inspections" />
      </div>
    </div>
  );
}

function RecentList({ title, jobs, href }: { title: string; jobs: Job[]; href: string }) {
  return (
    <section className="rounded-lg border border-line bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-medium text-fg">{title}</h2>
        <Link href={href} className="text-xs text-primary underline">
          ไปหน้ารายการ
        </Link>
      </div>
      <ul className="space-y-1 text-sm">
        {jobs.map((j) => (
          <li key={j.id} className="flex justify-between text-fg-muted">
            <Link href={`/inspections/${j.id}`} className="text-primary underline">
              {j.jobNo}
            </Link>
            <span>{j.vehicle?.licensePlate ?? "—"}</span>
          </li>
        ))}
        {jobs.length === 0 && <li className="text-fg-subtle">— ไม่มีรายการ —</li>}
      </ul>
    </section>
  );
}
