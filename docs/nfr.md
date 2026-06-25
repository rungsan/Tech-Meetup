---
title: "Non-Functional Requirements — CIS (Car Inspection System & E-Motor Survey)"
version: "1.0"
date: "2026-06-25"
source: "BRD.md §8 + charter constraints"
---

# Non-Functional Requirements — CIS

> Cross-cutting requirements that apply across stories. Derived from BRD §8 and the approved charter.
> These inform 1C architecture decisions and become S1 test criteria.

## 1. Security

| ID | Requirement | Target / Rule | Trace |
|----|-------------|---------------|-------|
| NFR-SEC-01 | Authentication (ABC) | Microsoft Azure AD SSO; ผู้ใช้ต้องอยู่ใน **1 ADD Group เท่านั้น** — อยู่ >1 group = ปฏิเสธสิทธิ | BR-001-01/02, US-001 |
| NFR-SEC-02 | Authentication (E-Motor) | Username/Password ตรวจกับ DB; 1 user = 1 บัญชี | BR-002-01, US-033 |
| NFR-SEC-03 | Password policy (E-Motor) | ≥ 8 ตัวอักษร; อย่างน้อย 2 ใน 3 ประเภท (a-zA-Z / 0-9 / อักขระพิเศษ); confirm ต้องตรง | NFR §8.1, US-042 |
| NFR-SEC-04 | Authorization (RBAC) | ควบคุมการเข้าถึงทุกเมนูตาม Role; การเปลี่ยน Role Setting มีผลเมื่อ **login ใหม่** หรือเมื่อ API ตรวจสิทธิ | US-032, US-045 |
| NFR-SEC-05 | Sensitive data | ข้อมูลส่วนบุคคลลูกค้า/รถ ต้องถูกควบคุมการเข้าถึง; redact by default ใน log/trace (PDPA) | charter, conventions.redaction_profile |

## 2. Compliance

| ID | Requirement | Target / Rule | Trace |
|----|-------------|---------------|-------|
| NFR-CMP-01 | PDPA | คุ้มครองข้อมูลส่วนบุคคล (ชื่อ, มือถือ, ทะเบียน, รูป); มี DPO กำกับ; เก็บเท่าที่จำเป็น | charter §3 (DPO), §8.1 |
| NFR-CMP-02 | Audit trail | ทุก state-changing action บันทึก **Job History** (วันเวลา + ผู้ดำเนินการ); Admin ลบได้, ทั่วไปดูอย่างเดียว | US-015, BR-001-10 |
| NFR-CMP-03 | IP / License | คัดกรอง license ของ dependency ก่อนใช้ (commercial client delivery) | overlays.compliance |

## 3. Usability

| ID | Requirement | Target / Rule | Trace |
|----|-------------|---------------|-------|
| NFR-USA-01 | Auto-complete | ฟิลด์ค้นหา Source, Agent, ยี่ห้อรถ, รุ่นรถ รองรับ auto-complete | NFR §8.2, US-004 |
| NFR-USA-02 | Pagination | 10 / 20 / 50 / 100 รายการต่อหน้า | NFR §8.2, US-007 |
| NFR-USA-03 | Sorting | Sort by คอลัมน์สำคัญในตารางรายการ | NFR §8.2 |
| NFR-USA-04 | Confirmation | Action สำคัญ (บันทึก/ลบ/อนุมัติ/Complete/ยกเลิก) ต้องมี Modal ยืนยัน | USER_STORY (หลาย US) |

## 4. Data Management

| ID | Requirement | Target / Rule | Trace |
|----|-------------|---------------|-------|
| NFR-DAT-01 | Export Excel | รายงานทุกประเภทรองรับ Export .xlsx | BR-001-15, US-018…021 |
| NFR-DAT-02 | Export PDF | รายการตั้งเบิก (E-Motor) รองรับ PDF + Excel | BR-002-09, US-040 |
| NFR-DAT-03 | Import Master | นำเข้า Master (ยี่ห้อ/รุ่นรถ, บริษัท Survey) ผ่าน Template ที่กำหนด + validate ก่อน import | US-029, US-031 |
| NFR-DAT-04 | Multi-email | รองรับหลายอีเมลคั่นด้วย ";" | BR-003-04, US-004, US-025 |

## 5. Real-time Notification

| ID | Requirement | Target / Rule | Trace |
|----|-------------|---------------|-------|
| NFR-NOT-01 | In-app notification | แจ้งเตือนเมื่อมีข้อความใหม่ใน Job History | NFR §8.4, US-007 |
| NFR-NOT-02 | Auto Email | ส่งอีเมลอัตโนมัติ: สร้างงานใหม่, รับงาน, ปฏิเสธงาน (→ Auto@ABC.co.th), ส่งผลตรวจ | BR-001-13, BR-002-04, US-035/036 |
| NFR-NOT-03 | SMS | ส่ง SMS ให้ลูกค้าได้ | BR-001-12, US-010 |
| NFR-NOT-04 | Delivery target | อัตราส่งสำเร็จ ≥ 99% (charter metric #4) | charter §4 |

## 6. Reporting

| ID | Requirement | Target / Rule | Trace |
|----|-------------|---------------|-------|
| NFR-RPT-01 | Time-range | KPI + สรุปผลตรวจ รองรับการเลือกช่วงเวลา | NFR §8.5 |
| NFR-RPT-02 | Dashboard compare | เทียบข้อมูล 3 ปีย้อนหลัง (รวมปีปัจจุบัน) | BR-001-03, US-002 |
| NFR-RPT-03 | Auto billing | สร้างรายการตั้งเบิกอัตโนมัติทุกสิ้นเดือน; ดูได้ตั้งแต่วันที่ 3 ของเดือนถัดไป (จากงานสถานะ "งานสำเร็จ") | BR-002-08, US-040 |

## 7. Compatibility / Platform

| ID | Requirement | Target / Rule | Trace |
|----|-------------|---------------|-------|
| NFR-CMPT-01 | Web app | รองรับเบราว์เซอร์มาตรฐาน | NFR §8.6 |
| NFR-CMPT-02 | Field use (E-Motor) | ออกแบบสำหรับใช้งานภาคสนาม รองรับอัปโหลดรูปจากอุปกรณ์ | NFR §8.6, US-037 |

## 8. Integration

| ID | Requirement | Target / Rule | Trace |
|----|-------------|---------------|-------|
| NFR-INT-01 | Azure AD | SSO + role จาก ADD Group | BR-003-05 |
| NFR-INT-02 | CIS ↔ E-Motor | "Complete" ขั้น "ส่ง SV" → ส่งงานเข้า E-Motor (สถานะ "งานเข้าใหม่") อัตโนมัติ; Surveyor "Complete" → อัปเดตสถานะกลับ CIS อัตโนมัติ | BR-003-01/03, US-010, US-037 |
| NFR-INT-03 | External Image API | รับรูปตรวจสภาพจาก สาขา / TQM / ธุรกิจ4-SCB ผ่าน API; แสดงในแถบ "Car Inspect Image" | BR-003-02, §7.2 |

## 9. Observability (intent — refine in 1C)

| ID | Requirement | Target / Rule |
|----|-------------|---------------|
| NFR-OBS-01 | Logging | Structured logs สำหรับ flow สำคัญ (สร้างงาน, ส่ง SV, ส่งผล, อนุมัติเบิก); ไม่บันทึก PII โดยไม่ redact |
| NFR-OBS-02 | Audit signal | State change ต้องมีหลักฐานใน audit store (ดู NFR-CMP-02) |
| NFR-OBS-03 | Health/metrics | ความพร้อมของ integration (Azure AD, Email, External API) ต้องวัด/แจ้งเตือนได้ |

> **Open / TBD (ยืนยันใน 1C):** Performance targets (response time, concurrent users), Availability/SLA, RTO/RPO, data residency, cloud vs on-prem, retention/backup policy — BRD ยังไม่ระบุ.
