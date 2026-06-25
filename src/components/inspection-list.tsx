"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";

type Row = {
  id: string;
  jobNo: string;
  status: string;
  createdAt: string;
  ownerUserId: string | null;
  vehicle: { licensePlate: string } | null;
  customer: { name: string | null; corporateName: string | null } | null;
};

const STATUS = [
  ["", "ทุกสถานะ"],
  ["new", "งานเข้าใหม่"],
  ["follow_appointment", "ติดตามนัดหมาย"],
  ["send_survey", "ส่ง SV ออกตรวจ"],
  ["await_result", "รอผลตรวจ"],
  ["inspected", "ตรวจแล้ว"],
  ["cancelled", "ยกเลิก"],
] as const;

export function InspectionList({ scope, title, subtitle }: { scope: "all" | "mine"; title: string; subtitle: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    const p = new URLSearchParams({ scope });
    if (q) p.set("q", q);
    if (status) p.set("status", status);
    const res = await fetch(`/api/v1/inspections?${p}`);
    if (res.ok) {
      const b = await res.json();
      setRows(b.data);
      setTotal(b.total);
    }
  }, [scope, q, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function assign(id: string) {
    await fetch(`/api/v1/inspections/${id}/assign`, { method: "POST" });
    load();
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-fg">{title}</h1>
        <p className="mt-1 text-sm text-fg-muted">
          {subtitle} · {total} รายการ
        </p>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <Input
          className="max-w-xs"
          placeholder="ค้นหา Job ID / ทะเบียน / ชื่อลูกค้า"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
        />
        <Select className="max-w-[180px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </Select>
        <Button variant="outline" onClick={load}>
          ค้นหา
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full text-sm">
          <thead className="bg-card text-fg-muted">
            <tr>
              <th className="p-2 text-left">Job ID</th>
              <th className="p-2 text-left">ทะเบียน</th>
              <th className="p-2 text-left">ลูกค้า</th>
              <th className="p-2 text-left">สถานะ</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-line text-fg">
                <td className="p-2">
                  <Link href={`/inspections/${r.id}`} className="text-primary underline">
                    {r.jobNo}
                  </Link>
                </td>
                <td className="p-2">{r.vehicle?.licensePlate ?? "—"}</td>
                <td className="p-2">{r.customer?.name ?? r.customer?.corporateName ?? "—"}</td>
                <td className="p-2">{r.status}</td>
                <td className="p-2 text-right">
                  {scope === "all" && (
                    <button className="text-xs text-info" onClick={() => assign(r.id)}>
                      Assign to me
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-fg-muted">
                  ไม่มีรายการ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
