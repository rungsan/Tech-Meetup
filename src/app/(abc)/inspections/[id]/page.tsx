import Link from "next/link";
import { notFound } from "next/navigation";
import { getInspection } from "@/lib/inspection/service";

const STATUS_LABEL: Record<string, string> = {
  new: "งานเข้าใหม่",
  follow_appointment: "ติดตามนัดหมายลูกค้า",
  send_survey: "ส่ง SV ออกตรวจสอบ",
  track_survey: "ติดตาม SV",
  await_result: "รอผลตรวจรถยนต์",
  inspected: "ตรวจรถยนต์แล้ว",
  no_survey: "ไม่ส่ง SV ตรวจสภาพรถ",
  cancelled: "ยกเลิก",
};

export default async function InspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getInspection(id);
  if (!job) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-fg">งาน {job.jobNo}</h1>
          <p className="mt-1 text-sm text-fg-muted">
            ทะเบียน {job.vehicle?.licensePlate} · {job.customer?.name ?? job.customer?.corporateName}
          </p>
        </div>
        <span className="rounded-md bg-info-subtle px-3 py-1 text-sm text-info">
          {STATUS_LABEL[job.status] ?? job.status}
        </span>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-line bg-card p-4">
          <h2 className="mb-2 font-medium text-fg">ข้อมูลรถยนต์</h2>
          <dl className="space-y-1 text-sm text-fg-muted">
            <div>ทะเบียน: {job.vehicle?.licensePlate}</div>
            <div>จังหวัด: {job.vehicle?.province}</div>
            <div>
              ยี่ห้อ/รุ่น: {job.vehicle?.model.brand.name} {job.vehicle?.model.name}
            </div>
            <div>ประเภท: {job.vehicle?.vehicleType === "ev" ? "EV" : "Non EV"}</div>
          </dl>
        </div>
        <div className="rounded-lg border border-line bg-card p-4">
          <h2 className="mb-2 font-medium text-fg">ข้อมูลงาน</h2>
          <dl className="space-y-1 text-sm text-fg-muted">
            <div>Source: {job.source.name}</div>
            <div>ฝ่ายธุรกิจ: {job.businessDiv.name}</div>
            <div>วันเริ่มคุ้มครอง: {job.coverageStartDate.toISOString().slice(0, 10)}</div>
          </dl>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-card p-4">
        <h2 className="mb-2 font-medium text-fg">Job History</h2>
        <ul className="space-y-1 text-sm text-fg-muted">
          {job.history.map((h) => (
            <li key={h.id}>
              {h.performedAt.toISOString().slice(0, 19).replace("T", " ")} — {h.action}
              {h.detail ? ` (${h.detail})` : ""}
            </li>
          ))}
        </ul>
      </section>

      <Link href="/inspections/new" className="text-sm text-primary underline">
        + สร้างรายการใหม่
      </Link>
    </div>
  );
}
