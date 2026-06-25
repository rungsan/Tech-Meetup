---
description: "Workflow-walk — design-time end-to-end trace of every P0 capability."
artifact: workflow-walks
phase: [1C, B1]
generated_at: "2026-06-25"
---

# Workflow Walks — CIS

> Walk the whole path: trigger → screen → action → API → service/data → response → render → **can the actor act?** → next.
> Status: `present` / `missing` / `assumed`. Verdict: `clear` / `gaps-raised` / `blocked`.

## Capability index

| # | Capability (actor's goal) | Primary actor | Stories | Verdict |
|---|---------------------------|---------------|---------|---------|
| C1 | สร้างงานตรวจสภาพและรับงานมาติดตาม | ABC Staff | US-004, US-008, US-007 | clear |
| C2 | ส่งงานให้ Surveyor แล้วงานไปโผล่ใน E-Motor | ABC + System | US-010, US-011, US-034 | clear |
| C3 | Surveyor รับงาน ตรวจ ส่งผล → sync กลับ → ABC ปิดงาน | Surveyor + ABC | US-035, US-037, US-012 | gaps-raised |
| C4 | อนุมัติตั้งเบิกประจำเดือน | ABC Admin | US-040, US-024 | gaps-raised |

---

## C1 — สร้างงานตรวจสภาพและรับงานมาติดตาม

**Actor:** ABC Staff · **Trigger:** กดเมนู "แจ้งตรวจสภาพใหม่" · **Stories:** US-004, US-008, US-007

| Hop | Actor sees / does | Surface | Behind it | Handoff |
|-----|-------------------|---------|-----------|---------|
| trigger | คลิกเมนูแจ้งตรวจสภาพใหม่ | sidebar nav | — | present |
| screen | ฟอร์มแจ้งงาน | inspections-new.md | — | present |
| action | กรอก + กด บันทึก | PageHeader action + FormField | — | present |
| request | `POST /api/v1/inspections` | route handler | — | present |
| service/data | เขียน Job+Vehicle+Customer+JobHistory | InspectionService | `inspection_jobs, vehicles, customers, job_history` | present |
| response | `201 {id,jobNo,status:"new"}` | error shape D-003 | — | present |
| render | ไปหน้ารายละเอียด job | inspections-detail.md | — | present |
| **act** | จะติดตามงานต่อ → "Assign to me" แล้วงานเข้า "รายการของฉัน" | assign button (US-008) → inspections-mine.md (US-007) | — | present |
| next | งานอยู่ใน My Work สถานะ "งานเข้าใหม่" | — | — | present |

**Dead-end check:** หลังสร้าง job เจ้าหน้าที่ต้องการรับมาดูแล → มีปุ่ม Assign to me (US-008) + หน้ารายการของฉัน (US-007) รองรับ → ไม่ตัน

**Findings:** none.
**Verdict:** clear

---

## C2 — ส่งงานให้ Surveyor แล้วงานไปโผล่ใน E-Motor

**Actor:** ABC Staff (+ System) · **Trigger:** job อยู่ขั้น "ส่ง SV ออกตรวจสอบ" · **Stories:** US-010, US-011, US-034

| Hop | Actor sees / does | Surface | Behind it | Handoff |
|-----|-------------------|---------|-----------|---------|
| trigger | เปิด job ขั้นส่ง SV | inspections-detail.md | — | present |
| screen | แสดง Survey ที่ assign + ราคา | detail tab (ส่ง SV) | — | present |
| action | กด Complete (ส่ง SV) | PageHeader Complete + Modal | — | present |
| request | `POST /api/v1/inspections/{id}/send-survey` | route handler | — | present |
| service/data | สร้าง SurveyAssignment(=งานเข้าใหม่) + emit event + auto email | InspectionService + domain event | `survey_assignments` | present |
| response | `200 {assignmentId,status}` + email queued | — | — | present |
| render | job → "ส่ง SV/ติดตาม SV" | inspections-detail.md | — | present |
| **act** | Surveyor ต้องเห็นงานใหม่ใน E-Motor เพื่อรับ | emotor-assignments.md (US-034) ดึง assignment status=งานเข้าใหม่ | — | present |
| next | งานปรากฏใน E-Motor list พร้อมปุ่ม "รับงาน/ปฏิเสธ" | — | — | present |

**Dead-end check:** ABC กด Complete แล้ว → Surveyor ต้องทำงานต่อได้ → SurveyAssignment สร้างจริง + E-Motor list query status (US-034) → ไม่ตัน (in-process event, BR-003-01)

**Findings:**
- service/data — auto email ขึ้นกับ email gateway — **assumed** — resolution: **accepted** (provider config เป็นงาน B2/B4; flow ไม่ตันเพราะ email เป็น side-effect ไม่บล็อก state).
**Verdict:** clear

---

## C3 — Surveyor รับงาน ตรวจ ส่งผล → sync กลับ → ABC ปิดงาน

**Actor:** Surveyor → ABC · **Trigger:** มีงานใหม่ใน E-Motor · **Stories:** US-035, US-037, US-012

| Hop | Actor sees / does | Surface | Behind it | Handoff |
|-----|-------------------|---------|-----------|---------|
| trigger | งานเข้าใหม่ใน E-Motor (+ email Auto@ABC) | emotor-assignments.md | — | present |
| action(SV) | กด "รับงาน" | accept button + Modal (US-035) | — | present |
| request | `POST /api/v1/emotor/assignments/{id}/accept` | route handler | — | present |
| service/data | status=รับงาน + notify CIS + email | SurveyService + event | `survey_assignments` | present |
| action(SV) | อัปโหลดรูป + กด Complete | emotor-assignment-detail.md ImageUploader (US-037) | — | present |
| request | `POST .../images` + `POST .../complete` | route handler | object storage | **assumed** |
| service/data | เก็บรูป + status=ส่งผล + emit → InspectionJob=รอผล | SurveyService + event | `inspection_images, survey_assignments` | present |
| render(ABC) | ABC เห็นรูปใน "Car Inspect Image" | inspections-detail.md (US-012) | — | present |
| **act** | ABC review → Revise (comment) หรือ รายงานผล → Complete | Revise/รายงานผล controls (US-012) | — | present |
| next | InspectionJob → "ตรวจรถยนต์แล้ว" | — | — | present |

**Dead-end check:** Surveyor ส่งผลแล้ว → ABC ต้องดูรูปและตัดสินใจได้ → แถบ Car Inspect Image + Revise + รายงานผล (US-012) รองรับครบ → ไม่ตัน. Surveyor ที่โดน Revise → US-038 ให้แก้รูปได้ → ไม่ตัน

**Findings:**
- request (upload images) — **object storage ยังไม่ตัดสินใจ** (S3-compatible / Azure Blob) — resolution: **raised** → ต้องเลือกก่อน B4 (US-037 ไม่อยู่ใน skeleton). บันทึกเป็น risk + ADR ใน B4. ดู [architecture.md](../architecture.md) §infra.
- inbound External Image API (สาขา/TQM/SCB, BR-003-02) — **assumed** — resolution: **accepted** (สเปก API ภายนอกเป็น B4; charter flag เป็นความเสี่ยงสูงสุดแล้ว).
**Verdict:** gaps-raised → object storage decision (pre-B4)

---

## C4 — อนุมัติตั้งเบิกประจำเดือน

**Actor:** ABC Admin · **Trigger:** สิ้นเดือน (ระบบสร้างตั้งเบิกอัตโนมัติ) · **Stories:** US-040, US-024

| Hop | Actor sees / does | Surface | Behind it | Handoff |
|-----|-------------------|---------|-----------|---------|
| trigger | สิ้นเดือน → auto-gen billing (ดูได้วันที่ 3) | scheduled job | — | **assumed** |
| screen | รายการตั้งเบิกเดือนนั้น | billing.md (US-023) | — | present |
| action | เลือกรายการ → กด อนุมัติ/ไม่อนุมัติ (+แก้ราคา) | billing.md controls (US-024) | — | present |
| request | `POST /api/v1/billing/{id}/approve` หรือ `/reject` | route handler | — | present |
| service/data | status=อนุมัติ/ไม่อนุมัติ + เหตุผล + audit | BillingService | `billings, job_history` | present |
| response | `200 {status}` | — | — | present |
| render | สถานะตั้งเบิกอัปเดต | billing.md | — | present |
| **act** | Surveyor เห็นผลอนุมัติฝั่ง E-Motor | emotor-billing.md (US-040/041) | — | present |
| next | ตั้งเบิก approved → Surveyor ดูได้ | — | — | present |

**Dead-end check:** Admin อนุมัติแล้ว → Surveyor ต้องเห็นผล → emotor-billing แสดงสถานะตั้งเบิก (US-041) → ไม่ตัน

**Findings:**
- trigger — **scheduler (auto-gen สิ้นเดือน) กลไกยังไม่ระบุ** (cron/queue) — resolution: **raised** → ตัดสินใจตอน B3/B4 (billing ไม่อยู่ใน skeleton); ระหว่างนี้ระบุใน architecture เป็น "scheduled job".
**Verdict:** gaps-raised → billing scheduler mechanism (pre-B3)

---

## Summary

- **Skeleton (US-004) flow = C1 → clear.** B0 ปลอดภัยที่จะเริ่ม.
- Cross-system loop (C2/C3) ออกแบบครบ ไม่ตัน — sync เป็น in-process domain events.
- **2 gaps raised** (นอก skeleton): object storage สำหรับรูป (pre-B4), billing scheduler (pre-B3). ทั้งคู่ deferred โดยมี owner/phase — ไม่บล็อก G1/B0. แนะนำบันทึกเป็น risk ผ่าน `/ai-risk`.
