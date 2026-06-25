"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label, Input, FieldError } from "@/components/ui/field";

type Survey = {
  id: string;
  name: string;
  code: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  status: string;
};

export default function SurveyAdminPage() {
  const [rows, setRows] = useState<Survey[]>([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState({ name: "", code: "", contactName: "", phone: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);

  const load = useCallback(async (query = "") => {
    const res = await fetch(`/api/v1/admin/survey-companies${query ? `?q=${encodeURIComponent(query)}` : ""}`);
    if (res.ok) setRows((await res.json()).data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function add() {
    setErrors({});
    setBanner(null);
    const res = await fetch("/api/v1/admin/survey-companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.status === 201) {
      setForm({ name: "", code: "", contactName: "", phone: "", email: "" });
      load(q);
    } else {
      const b = await res.json().catch(() => null);
      if (b?.error?.fields) setErrors(b.error.fields);
      else setBanner(b?.error?.message ?? "บันทึกไม่สำเร็จ");
    }
  }

  async function toggle(s: Survey) {
    await fetch(`/api/v1/admin/survey-companies/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s.status === "active" ? "inactive" : "active" }),
    });
    load(q);
  }

  async function del(s: Survey) {
    if (!confirm(`ลบบริษัท "${s.name}"?`)) return;
    await fetch(`/api/v1/admin/survey-companies/${s.id}`, { method: "DELETE" });
    load(q);
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-fg">จัดการบริษัท Survey</h1>
        <p className="mt-1 text-sm text-fg-muted">เพิ่ม/แก้ไข/ลบ บริษัทตรวจสภาพรถภายนอก</p>
      </div>

      {banner && (
        <div className="mb-4 rounded-md border border-line bg-danger-subtle p-3 text-sm text-danger">{banner}</div>
      )}

      <section className="mb-6 rounded-lg border border-line bg-card p-4">
        <h2 className="mb-3 font-medium text-fg">เพิ่ม Survey ทีละรายการ</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor="name">ชื่อบริษัท</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <FieldError>{errors.name}</FieldError>
          </div>
          <div>
            <Label htmlFor="code">รหัส</Label>
            <Input id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <FieldError>{errors.code}</FieldError>
          </div>
          <div>
            <Label htmlFor="contact">ผู้ติดต่อ</Label>
            <Input id="contact" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="phone">โทรศัพท์</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="email">อีเมล</Label>
            <Input id="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <FieldError>{errors.email}</FieldError>
          </div>
          <div className="flex items-end">
            <Button onClick={add} disabled={!form.name.trim() || !form.code.trim()}>
              บันทึก
            </Button>
          </div>
        </div>
      </section>

      <div className="mb-3 flex gap-2">
        <Input placeholder="ค้นหาชื่อ/รหัส" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load(q)} />
        <Button variant="outline" onClick={() => load(q)}>
          ค้นหา
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full text-sm">
          <thead className="bg-card text-fg-muted">
            <tr>
              <th className="p-2 text-left">ชื่อ</th>
              <th className="p-2 text-left">รหัส</th>
              <th className="p-2 text-left">ผู้ติดต่อ</th>
              <th className="p-2 text-left">สถานะ</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-t border-line text-fg">
                <td className="p-2">{s.name}</td>
                <td className="p-2">{s.code}</td>
                <td className="p-2">{s.contactName ?? "—"}</td>
                <td className="p-2">
                  <span className={s.status === "active" ? "text-success" : "text-fg-subtle"}>{s.status}</span>
                </td>
                <td className="p-2 text-right">
                  <button className="mr-3 text-xs text-info" onClick={() => toggle(s)}>
                    {s.status === "active" ? "ปิด" : "เปิด"}
                  </button>
                  <button className="text-xs text-danger" onClick={() => del(s)}>
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-fg-muted">
                  ไม่มีข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
