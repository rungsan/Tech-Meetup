---
title: "Project Charter — CIS (Car Inspection System & E-Motor Survey)"
version: "1.0"
date: "2026-06-25"
status: "approved"
approved_date: "2026-06-25"
source: "Derived from docs/BRD.md and docs/USER_STORY.md (FSD Car Inspection System v1.2)"
---

# Project Charter: CIS — ระบบตรวจสภาพรถยนต์ & E-Motor Survey

> บริษัท ABC ประกันภัย จำกัด · พัฒนาโดย Rungsan Suyala (Stream I.T. Consulting)
> สถานะ: **approved** (2026-06-25) — charter ผ่านการอนุมัติเพื่อเข้าสู่ 1B Requirements
> หมายเหตุ: ค่าที่ flag เป็น TBD/Open (decision maker เดี่ยว, metrics baseline, deadline, budget/infra) อนุมัติให้ใช้ค่า draft ไปก่อน และจะ refine/ยืนยันใน 1B–1C

## 1. Problem Statement

**"เจ้าหน้าที่ตรวจสภาพรถของ ABC ประกันภัย และบริษัท Surveyor ภายนอก ขาดระบบกลางครบวงจรในการบริหารงานตรวจสภาพรถก่อนทำประกัน ทำให้การติดตามสถานะงาน การนัดหมายลูกค้า การประสานงาน ABC↔Surveyor และการสรุป KPI/ตั้งเบิก ต้องทำผ่านช่องทางที่กระจัดกระจายและทำด้วยมือ ส่งผลให้เสียเวลา เกิดข้อผิดพลาด และผู้บริหารขาดข้อมูลแบบ real-time"**

| มิติ | รายละเอียด |
|------|-----------|
| Who | Car Ins Staff, UW, Admin (ฝั่ง ABC) + Surveyor / Surveyor IT Admin (ฝั่งภายนอก) + ผู้บริหารสายรับประกันภัย |
| Problem | ไม่มีระบบกลางครบวงจร; ติดตามสถานะ/นัดหมายกระจัดกระจาย; ประสานงาน ABC↔Surveyor ไม่มีศูนย์กลาง; KPI/ตั้งเบิกทำมือ; ไม่มี real-time dashboard |
| Impact | เสียเวลา, ข้อผิดพลาดสูง, ติดตามงานยาก, ผู้บริหารตัดสินใจช้าเพราะขาดข้อมูล |
| Workaround (ปัจจุบัน) | ช่องทางหลายช่องทาง + งานเอกสาร/Excel ทำมือ |
| Urgency (ทำไมต้องตอนนี้) | ต้องการระบบกลาง รองรับงาน Fleet ลูกค้าองค์กร + แจ้งเตือนอัตโนมัติ + รายงานผู้บริหาร |

## 2. Stakeholders

| Stakeholder | กลุ่ม | Interest | Influence | Key Concern |
|-------------|-------|----------|-----------|-------------|
| ผู้ช่วยกรรมการผู้จัดการ สายรับประกันภัย | Sponsor / Decision Maker | high | high | คุณค่าทางธุรกิจ, KPI, ความสำเร็จโครงการ |
| ฝ่ายรับประกันภัยรถยนต์ (ผอ./รอง ผอ./ผจก./หัวหน้าทีม) | Product Owner / SME | high | high | กระบวนการตรวจสภาพถูกต้อง, workflow 8 สถานะ |
| สายสารสนเทศ (ฝ่ายเทคโนโลยี / พัฒนาระบบสารสนเทศ) | IT / Operators | high | high | สถาปัตยกรรม, integration, security, maintainability |
| สำนักบริหารความเสี่ยงฯ (DPO) | Regulator | medium | high | PDPA, การคุ้มครองข้อมูลส่วนบุคคล |
| Car Ins Staff / UW / Admin | End Users (ABC) | high | medium | ใช้งานง่าย, ติดตามงานสะดวก |
| Surveyor / Surveyor IT Admin | End Users (ภายนอก) | high | medium | รับงาน/ส่งผล/อัปโหลดรูป/ตั้งเบิกออนไลน์ |
| บริษัท Surveyor (Vendor) | Integration Partner | medium | medium | ค่าตรวจสภาพ, การตั้งเบิกถูกต้อง |
| Stream I.T. Consulting (Rungsan Suyala) | Dev Team | high | medium | ส่งมอบตรง requirement, คุณภาพ, ตามกรอบ framework |

### RACI Matrix (R=Responsible, A=Accountable, C=Consulted, I=Informed)

| Stakeholder | Charter | Requirements | Architecture | Build | Deploy | Operate |
|-------------|---------|--------------|--------------|-------|--------|---------|
| Sponsor (ผู้ช่วยกรรมการฯ) | A | I | I | I | A | I |
| Product Owner (ฝ่ายรับประกันภัยรถ) | C | R/A | C | I | C | C |
| IT / สายสารสนเทศ | C | C | A | C | R | R/A |
| DPO | C | C | C | I | C | C |
| Dev Team (Stream I.T.) | R | R | R | R/A | R | C |
| End Users (ABC + Surveyor) | I | C | I | I | I | I |

> **Gap flag:** ยังไม่ระบุชื่อ decision maker เดี่ยวที่อนุมัติ charter — สมมติเป็น "ผู้ช่วยกรรมการผู้จัดการ สายรับประกันภัย" (ยืนยันใน approval §7)

## 3. Constraints

| มิติ | Constraint | Severity | Risk |
|------|-----------|----------|------|
| Technology | ต้อง Login ด้วย Microsoft Azure AD (SSO) + RBAC ผ่าน ADD Group สำหรับ ABC Staff (BR-001-01/02, BR-003-05) | **Hard** | พึ่งพา Azure AD config ขององค์กร |
| Technology | ต้อง integrate External Image APIs (สาขา, TQM, ธุรกิจ4/SCB), Email (Auto@ABC.co.th), SMS | **Hard** | ขึ้นกับความพร้อม/สัญญา API ภายนอก |
| Technology | ต้องเป็น Web Application รองรับเบราว์เซอร์มาตรฐาน; E-Motor รองรับอัปโหลดรูปภาคสนาม | **Hard** | — |
| Regulatory | PDPA — ข้อมูลส่วนบุคคลลูกค้า/รถ; มี DPO กำกับ; ต้องมี audit trail (Job History) | **Hard** | ต้อง redact/ควบคุมการเข้าถึง |
| Security | RBAC ควบคุมทุกเมนู; Password Policy E-Motor (≥8 ตัว, 2/3 ประเภท); Role change มีผลเมื่อ login ใหม่ | **Hard** | — |
| Team | ผู้พัฒนา: solo (Rungsan) + AI-assisted | **Soft** | ความเร็ว/ภาระงานรวมศูนย์ที่คนเดียว |
| Time | ❓ ไม่ระบุ deadline ใน BRD | Open | ต้องยืนยันกับ sponsor |
| Budget | ❓ ไม่ระบุงบ/infra budget ใน BRD | Open | ต้องยืนยัน |
| Infrastructure | ❓ ไม่ระบุ cloud/on-prem/SLA ใน BRD (แต่ Azure AD ⇒ น่าจะ Microsoft ecosystem) | Open | ตัดสินใจใน 1C |

- **Hard constraints:** 5 (Azure AD/RBAC, External APIs, Web app, PDPA+audit, security/password policy)
- **Soft constraints:** 1 (solo dev team)
- **Open (ต้องยืนยัน):** 3 (Time, Budget, Infrastructure)
- **Highest risk:** การพึ่งพา External Image APIs และ Azure AD ที่อยู่นอกการควบคุมของทีมพัฒนา

## 4. Success Metrics

> ⚠️ **AI-drafted** จาก business goals — baseline เป็น TBD รอ sponsor/PO ยืนยันตัวเลขจริง

| # | Metric | Baseline | Target | Timeframe | Measurement |
|---|--------|----------|--------|-----------|-------------|
| 1 | เวลาเฉลี่ยในการบริหาร/ติดตาม 1 รายการตรวจสภาพ (รับแจ้ง→ปิดงาน) | TBD (manual) | ลดลง ≥40% | 3 เดือนหลัง launch | System logs / Job History timestamps |
| 2 | สัดส่วนงานตรวจสภาพที่ดำเนินผ่านระบบกลาง | 0% | ≥90% | 3 เดือนหลัง launch | Inspection records |
| 3 | เวลาในการสรุป KPI + รายการตั้งเบิกประจำเดือน | TBD (ทำมือ, หลายชม.) | <30 นาที (อัตโนมัติ) | At launch | Report generation time |
| 4 | อัตราการส่ง Auto Email/Notification สำเร็จ (สร้างงาน/รับงาน/ปฏิเสธ/ส่งผล) | N/A | ≥99% | 1 เดือนหลัง launch | Email/notification delivery log |
| 5 | Dashboard ผู้บริหารแสดงข้อมูลเทียบ 3 ปีย้อนหลังแบบ near real-time | N/A (ไม่มี) | พร้อมใช้, refresh ≤1 วัน | At launch | Dashboard availability check |

- **Primary metric:** #1 (ลดเวลาบริหารงานต่อรายการ) — ตรงกับ problem statement ที่สุด
- **Measurement plan complete:** ใช่ (ทุก metric มีแหล่งวัด; baseline ที่เป็น TBD ต้องเก็บก่อน/ช่วงต้นโครงการ)

## 5. Scope Boundaries

### In Scope
**Car Inspection System (ABC):** Login Azure AD · Dashboard (8 สถานะ + กราฟ 3 ปี) · แจ้งตรวจสภาพใหม่ (รายคัน/Fleet ≤10/ป้ายแดง) · รายการของฉัน (workflow 8 สถานะ) · รายการตรวจสภาพทั้งหมด · รายงาน 5 แบบ (สถานะ/สรุปผล/KPI/บันทึกงาน/ตั้งเบิก) + Export Excel · ตั้งเบิก+อนุมัติ · จัดการอีเมล Agent · จัดการ Survey · จัดการยี่ห้อ/รุ่นรถ · Role Setting

**E-Motor Survey (Surveyor):** Login user/password · รับงาน/ปฏิเสธ/อัปโหลดรูป/ส่งผล (Complete) · แก้ไขรูปตาม comment · สรุปตั้งเบิก (เดือน/ปี) + Export PDF/Excel · จัดการผู้ใช้ · Role Setting

**Integration:** Azure AD · Email/SMS · External Image APIs · Car Inspection ↔ E-Motor auto-sync

### Out of Scope
- ระบบรับประกันภัยรถยนต์หลัก (Underwriting) · การชำระเงินออนไลน์ · Mobile App (native) · ระบบจัดการเอกสารกรมธรรม์ (Policy Mgmt) · integration อื่นนอกเหนือ BR-003

### Assumptions & Open Questions
- A1: Azure AD/ADD Group ขององค์กรพร้อมใช้และทีมเข้าถึง config ได้ → ต้องยืนยันใน 1C
- A2: External Image APIs (สาขา/TQM/ธุรกิจ4/SCB) มี spec/สัญญาพร้อม → ยืนยันใน 1B/1C
- A3: Email gateway (Auto@ABC.co.th) + SMS provider พร้อมใช้
- A4: Tech stack ยังไม่กำหนด (greenfield) → เคาะใน 1C ผ่าน /ai-decide
- A5: Deadline/Budget/Infra ยังไม่ระบุ → ต้องยืนยันกับ sponsor
- **Biggest scope risk:** Workflow 8 สถานะ + เคส "ลบรอย Remark" 2 รูปแบบ + Fleet — มีโอกาส scope creep หากรายละเอียด state transition ไม่ชัดใน 1B

## 6. Project Sizing

- **Depth:** medium
- **Type:** web + api
- **Extensions:** [web, api]
- **Estimated scope:** medium — 45 user stories (USER_STORY.md), 2 subsystem, integration หลายระบบ, RBAC, รายงาน 5+ แบบ
- **Rationale:** จำนวน story (45) อยู่ขอบ small/medium แต่ความซับซ้อน (2 ระบบ + cross-system integration + PDPA + reporting) ทำให้จัดเป็น medium (full framework + gates ครบ) — re-calibrate หลัง 1B เมื่อ story/SP ชัด

## 7. Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Sponsor (Decision Maker) | ผู้ช่วยกรรมการผู้จัดการ สายรับประกันภัย *(ยืนยันชื่อภายหลัง)* | 2026-06-25 | ✓ approved |
| Product Owner | ฝ่ายรับประกันภัยรถยนต์ *(ยืนยันชื่อภายหลัง)* | 2026-06-25 | ✓ approved |

> Approved by project owner (Rungsan Suyala, Stream I.T. Consulting) on behalf of stakeholders — ค่าที่ค้างยืนยัน (ชื่อ decision maker, metrics baseline, deadline, infra) จะปรับใน 1B–1C โดยไม่บล็อกการเดินงาน

---
*Generated by AI-SDLC v3 — /ai-charter generate (draft, derived from BRD/USER_STORY)*
