"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label, Input, Select, FieldError } from "@/components/ui/field";

type Model = { id: string; name: string; vehicleType: string; status: string };
type Brand = { id: string; name: string; status: string; models: Model[] };

export default function VehicleModelsAdminPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [q, setQ] = useState("");
  const [banner, setBanner] = useState<string | null>(null);
  const [newBrand, setNewBrand] = useState("");
  const [brandErr, setBrandErr] = useState<string | undefined>();
  const [csv, setCsv] = useState("");

  const load = useCallback(async (query = "") => {
    const res = await fetch(`/api/v1/admin/vehicle-brands${query ? `?q=${encodeURIComponent(query)}` : ""}`);
    if (res.ok) setBrands((await res.json()).data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addBrand() {
    setBrandErr(undefined);
    const res = await fetch("/api/v1/admin/vehicle-brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newBrand }),
    });
    if (res.status === 201) {
      setNewBrand("");
      load(q);
    } else {
      const b = await res.json().catch(() => null);
      setBrandErr(b?.error?.fields?.name ?? "เพิ่มไม่สำเร็จ");
    }
  }

  async function toggleBrand(b: Brand) {
    await fetch(`/api/v1/admin/vehicle-brands/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: b.status === "active" ? "inactive" : "active" }),
    });
    load(q);
  }

  async function delBrand(b: Brand) {
    if (!confirm(`ลบยี่ห้อ "${b.name}" และรุ่นทั้งหมด?`)) return;
    await fetch(`/api/v1/admin/vehicle-brands/${b.id}`, { method: "DELETE" });
    load(q);
  }

  async function addModel(brandId: string, name: string, vehicleType: string) {
    await fetch("/api/v1/admin/vehicle-models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId, name, vehicleType }),
    });
    load(q);
  }

  async function delModel(id: string) {
    await fetch(`/api/v1/admin/vehicle-models/${id}`, { method: "DELETE" });
    load(q);
  }

  async function doImport() {
    const res = await fetch("/api/v1/admin/vehicle-models/import", {
      method: "POST",
      headers: { "Content-Type": "text/csv" },
      body: csv,
    });
    const b = await res.json();
    setBanner(`นำเข้า ${b.imported ?? 0} รายการ${b.errors?.length ? ` (ผิดพลาด ${b.errors.length})` : ""}`);
    setCsv("");
    load(q);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-fg">จัดการยี่ห้อ / รุ่นรถ</h1>
          <p className="mt-1 text-sm text-fg-muted">เพิ่ม/แก้ไข/ลบ + นำเข้า/ส่งออก Master</p>
        </div>
        {/* download endpoint, not a page route — Link is inappropriate here */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/v1/admin/vehicle-models/export"
          className="inline-flex items-center rounded-md border border-line px-4 py-2 text-sm text-fg hover:bg-canvas"
        >
          Download Master (CSV)
        </a>
      </div>

      {banner && (
        <div className="mb-4 rounded-md border border-line bg-info-subtle p-3 text-sm text-info">{banner}</div>
      )}

      <div className="mb-4 flex gap-2">
        <Input
          placeholder="ค้นหายี่ห้อ/รุ่น"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(q)}
        />
        <Button variant="outline" onClick={() => load(q)}>
          ค้นหา
        </Button>
      </div>

      <section className="mb-6 rounded-lg border border-line bg-card p-4">
        <h2 className="mb-2 font-medium text-fg">เพิ่มยี่ห้อ</h2>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Label htmlFor="nb">ยี่ห้อใหม่</Label>
            <Input id="nb" value={newBrand} onChange={(e) => setNewBrand(e.target.value)} />
            <FieldError>{brandErr}</FieldError>
          </div>
          <Button onClick={addBrand} disabled={!newBrand.trim()}>
            เพิ่ม
          </Button>
        </div>
      </section>

      <div className="space-y-4">
        {brands.map((b) => (
          <BrandCard
            key={b.id}
            brand={b}
            onToggle={() => toggleBrand(b)}
            onDelete={() => delBrand(b)}
            onAddModel={addModel}
            onDelModel={delModel}
          />
        ))}
        {brands.length === 0 && (
          <p className="rounded-md border border-line bg-card p-6 text-center text-sm text-fg-muted">
            ไม่มีข้อมูล — เพิ่มยี่ห้อหรือนำเข้า Master
          </p>
        )}
      </div>

      <section className="mt-6 rounded-lg border border-line bg-card p-4">
        <h2 className="mb-2 font-medium text-fg">นำเข้า Master (CSV)</h2>
        <p className="mb-2 text-xs text-fg-muted">รูปแบบ: brand,model,vehicleType (vehicleType = non_ev | ev)</p>
        <textarea
          className="h-24 w-full rounded-md border border-line bg-card px-3 py-2 text-sm text-fg"
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          placeholder={"brand,model,vehicleType\nHonda,Civic,non_ev"}
        />
        <div className="mt-2 flex justify-end">
          <Button onClick={doImport} disabled={!csv.trim()}>
            นำเข้า
          </Button>
        </div>
      </section>
    </div>
  );
}

function BrandCard({
  brand,
  onToggle,
  onDelete,
  onAddModel,
  onDelModel,
}: {
  brand: Brand;
  onToggle: () => void;
  onDelete: () => void;
  onAddModel: (brandId: string, name: string, type: string) => void;
  onDelModel: (id: string) => void;
}) {
  const [mn, setMn] = useState("");
  const [mt, setMt] = useState("non_ev");
  return (
    <div className="rounded-lg border border-line bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium text-fg">
          {brand.name}{" "}
          <span className={brand.status === "active" ? "text-success" : "text-fg-subtle"}>
            ({brand.status})
          </span>
        </span>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onToggle}>
            {brand.status === "active" ? "ปิดใช้งาน" : "เปิดใช้งาน"}
          </Button>
          <Button variant="outline" onClick={onDelete}>
            ลบ
          </Button>
        </div>
      </div>
      <ul className="mb-2 space-y-1 text-sm text-fg-muted">
        {brand.models.map((m) => (
          <li key={m.id} className="flex items-center justify-between">
            <span>
              {m.name} · {m.vehicleType === "ev" ? "EV" : "Non EV"} · {m.status}
            </span>
            <button className="text-xs text-danger" onClick={() => onDelModel(m.id)}>
              ลบ
            </button>
          </li>
        ))}
        {brand.models.length === 0 && <li className="text-fg-subtle">— ยังไม่มีรุ่น —</li>}
      </ul>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input placeholder="รุ่นใหม่" value={mn} onChange={(e) => setMn(e.target.value)} />
        </div>
        <Select value={mt} onChange={(e) => setMt(e.target.value)} className="w-32">
          <option value="non_ev">Non EV</option>
          <option value="ev">EV</option>
        </Select>
        <Button
          onClick={() => {
            if (mn.trim()) {
              onAddModel(brand.id, mn, mt);
              setMn("");
            }
          }}
          disabled={!mn.trim()}
        >
          เพิ่มรุ่น
        </Button>
      </div>
    </div>
  );
}
