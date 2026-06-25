import { InspectionList } from "@/components/inspection-list";

// US-017 — all inspections list (search/filter + Assign to me).
export default function AllInspectionsPage() {
  return <InspectionList scope="all" title="รายการตรวจสภาพ" subtitle="งานทั้งหมดของทุกเจ้าหน้าที่" />;
}
