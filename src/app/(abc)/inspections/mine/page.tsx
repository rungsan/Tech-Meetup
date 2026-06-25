import { InspectionList } from "@/components/inspection-list";

// US-007 — my work list (jobs owned by the current user).
export default function MyWorkPage() {
  return <InspectionList scope="mine" title="รายการของฉัน" subtitle="งานที่ฉันรับผิดชอบ" />;
}
