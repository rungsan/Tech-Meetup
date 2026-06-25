"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label, Input, Select, FieldError } from "@/components/ui/field";

type Master = {
  sources: { id: string; name: string }[];
  divisions: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  models: { id: string; name: string; brandId: string; vehicleType: string }[];
};

type Errors = Record<string, string>;

export default function NewInspectionPage() {
  const router = useRouter();
  const [m, setM] = useState<Master | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  // form state
  const [customerType, setCustomerType] = useState("individual");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [province, setProvince] = useState("");
  const [isRedPlate, setIsRedPlate] = useState(false);
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [chassisNo, setChassisNo] = useState("");
  const [vehicleType, setVehicleType] = useState("non_ev");
  const [sourceId, setSourceId] = useState("");
  const [businessDivId, setBusinessDivId] = useState("");
  const [coverageStartDate, setCoverageStartDate] = useState("");
  const [appointmentStatus, setAppointmentStatus] = useState("not_appointed");

  useEffect(() => {
    fetch("/api/v1/masters")
      .then((r) => r.json())
      .then(setM)
      .catch(() => setBanner("โหลดข้อมูลตั้งต้นไม่สำเร็จ"));
  }, []);

  const models = m?.models.filter((x) => x.brandId === brandId) ?? [];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setBanner(null);
    const payload = {
      customerType,
      customer: { name, mobile },
      vehicle: {
        licensePlate,
        province: isRedPlate ? "99" : province,
        isRedPlate,
        brandId,
        modelId,
        chassisNo,
        vehicleType,
      },
      sourceId,
      businessDivId,
      coverageStartDate,
      appointmentStatus,
    };
    const res = await fetch("/api/v1/inspections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.status === 201) {
      const job = await res.json();
      router.push(`/inspections/${job.id}`);
      return;
    }
    const body = await res.json().catch(() => null);
    if (res.status === 422 && body?.error?.fields) {
      setErrors(body.error.fields);
      setBanner("ข้อมูลไม่ผ่านการตรวจสอบ");
    } else {
      setBanner(body?.error?.message ?? "บันทึกไม่สำเร็จ");
    }
    setSubmitting(false);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-fg">แจ้งตรวจสภาพรถใหม่</h1>
          <p className="mt-1 text-sm text-fg-muted">สร้างรายการตรวจสภาพ (รายคัน)</p>
        </div>
      </div>

      {banner && (
        <div className="mb-4 rounded-md border border-line bg-danger-subtle p-3 text-sm text-danger" role="alert">
          {banner}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        <section className="rounded-lg border border-line bg-card p-4">
          <h2 className="mb-3 font-medium text-fg">ข้อมูลลูกค้า</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="customerType">ประเภท</Label>
              <Select id="customerType" value={customerType} onChange={(e) => setCustomerType(e.target.value)}>
                <option value="individual">บุคคลทั่วไป</option>
                <option value="corporate">นิติบุคคล</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="name">ชื่อ-นามสกุล / ชื่อนิติบุคคล</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              <FieldError>{errors["customer.name"]}</FieldError>
            </div>
            <div>
              <Label htmlFor="mobile">มือถือ</Label>
              <Input id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
              <FieldError>{errors["customer.mobile"]}</FieldError>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-line bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium text-fg">ข้อมูลรถยนต์</h2>
            <label className="flex items-center gap-2 text-sm text-fg">
              <input
                type="checkbox"
                checked={isRedPlate}
                onChange={(e) => setIsRedPlate(e.target.checked)}
              />
              รถป้ายแดง
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="plate">ทะเบียน</Label>
              <Input id="plate" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} />
              <FieldError>{errors["vehicle.licensePlate"]}</FieldError>
            </div>
            <div>
              <Label htmlFor="province">จังหวัด</Label>
              <Input
                id="province"
                value={isRedPlate ? "99" : province}
                disabled={isRedPlate}
                onChange={(e) => setProvince(e.target.value)}
              />
              <FieldError>{errors["vehicle.province"]}</FieldError>
            </div>
            <div>
              <Label htmlFor="vehicleType">ประเภท</Label>
              <Select id="vehicleType" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                <option value="non_ev">Non EV</option>
                <option value="ev">EV</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="brand">ยี่ห้อ</Label>
              <Select
                id="brand"
                value={brandId}
                onChange={(e) => {
                  setBrandId(e.target.value);
                  setModelId("");
                }}
              >
                <option value="">— เลือก —</option>
                {m?.brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
              <FieldError>{errors["vehicle.brandId"]}</FieldError>
            </div>
            <div>
              <Label htmlFor="model">รุ่น</Label>
              <Select id="model" value={modelId} onChange={(e) => setModelId(e.target.value)} disabled={!brandId}>
                <option value="">— เลือก —</option>
                {models.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </Select>
              <FieldError>{errors["vehicle.modelId"]}</FieldError>
            </div>
            <div>
              <Label htmlFor="chassis">เลขตัวถัง</Label>
              <Input id="chassis" value={chassisNo} onChange={(e) => setChassisNo(e.target.value)} />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-line bg-card p-4">
          <h2 className="mb-3 font-medium text-fg">ข้อมูลงาน & การนัด</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="source">Source</Label>
              <Select id="source" value={sourceId} onChange={(e) => setSourceId(e.target.value)}>
                <option value="">— เลือก —</option>
                {m?.sources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
              <FieldError>{errors["sourceId"]}</FieldError>
            </div>
            <div>
              <Label htmlFor="division">ฝ่ายธุรกิจ</Label>
              <Select id="division" value={businessDivId} onChange={(e) => setBusinessDivId(e.target.value)}>
                <option value="">— เลือก —</option>
                {m?.divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
              <FieldError>{errors["businessDivId"]}</FieldError>
            </div>
            <div>
              <Label htmlFor="coverage">วันเริ่มคุ้มครอง</Label>
              <Input
                id="coverage"
                type="date"
                value={coverageStartDate}
                onChange={(e) => setCoverageStartDate(e.target.value)}
              />
              <FieldError>{errors["coverageStartDate"]}</FieldError>
            </div>
            <div>
              <Label htmlFor="appt">สถานะการนัด</Label>
              <Select id="appt" value={appointmentStatus} onChange={(e) => setAppointmentStatus(e.target.value)}>
                <option value="not_appointed">ยังไม่ได้นัดลูกค้า</option>
                <option value="appointed">นัดลูกค้า</option>
              </Select>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </div>
      </form>
    </div>
  );
}
