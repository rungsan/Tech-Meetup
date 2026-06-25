# Wireframe Index — CIS

- App shell: [app-shell.md](app-shell.md) · Design system: [design-system.md](design-system.md) · Components: [components.md](components.md)
- Preset: `trust-corporate`
- **Skeleton (B0)** screens marked ✅ — drafted full this round. Others = inventory now, wireframes drafted in B1 (P1/P2 lighter).

## ABC — Car Inspection

| # | File | Screen | Route | Shell | Archetype | Pri | Stories | Skeleton |
|---|------|--------|-------|-------|-----------|-----|---------|----------|
| 0 | app-shell.md | App Shell | * | — | layout | P0 | — | ✅ |
| 1 | abc-login.md | ABC Login (Azure AD) | /login | none | form | P0 | US-001 | ✅ |
| 2 | core-dashboard.md | Dashboard | /dashboard | app-shell | dashboard | P0 | US-002, US-003 | — |
| 3 | inspections-new.md | แจ้งตรวจสภาพใหม่ | /inspections/new | app-shell | form | P0 | US-004, US-005, US-006 | ✅ |
| 4 | inspections-mine.md | รายการของฉัน | /inspections/mine | app-shell | list | P0 | US-007, US-008 | — |
| 5 | inspections-all.md | รายการตรวจสภาพ | /inspections | app-shell | list | P0 | US-017, US-008 | — |
| 6 | inspections-detail.md | รายละเอียดงาน (workflow) | /inspections/[id] | app-shell | detail | P0 | US-009…US-016 | ✅ |
| 7 | reports-status.md | รายงานสถานะ | /reports/status | app-shell | list | P1 | US-018 | — |
| 8 | reports-result.md | รายงานสรุปผล | /reports/result | app-shell | list | P1 | US-019 | — |
| 9 | reports-kpi.md | รายงาน KPI | /reports/kpi | app-shell | dashboard | P1 | US-020 | — |
| 10 | reports-productivity.md | รายงานบันทึกงาน | /reports/productivity | app-shell | list | P2 | US-021 | — |
| 11 | billing.md | รายการตั้งเบิก + อนุมัติ | /billing | app-shell | list | P1 | US-022, US-023, US-024 | — |
| 12 | admin-agents.md | จัดการอีเมล Agent | /admin/agents | app-shell | list | P1 | US-025 | — |
| 13 | admin-job-email.md | แก้อีเมลจาก Job | /admin/job-email | app-shell | form | P2 | US-026 | — |
| 14 | admin-results.md | ลบรายงานผล | /admin/results | app-shell | list | P2 | US-027 | — |
| 15 | admin-survey.md | จัดการ Survey | /admin/survey | app-shell | list | P1 | US-028, US-029 | — |
| 16 | admin-job-edit.md | แก้ Agent/Source/รถ | /admin/job-edit | app-shell | form | P1 | US-030 | — |
| 17 | admin-vehicle-models.md | ยี่ห้อ/รุ่นรถ | /admin/vehicle-models | app-shell | list | P1 | US-031 | — |
| 18 | admin-roles.md | Role Setting | /admin/roles | app-shell | form | P1 | US-032 | — |

## E-Motor — Surveyor

| # | File | Screen | Route | Shell | Archetype | Pri | Stories | Skeleton |
|---|------|--------|-------|-------|-----------|-----|---------|----------|
| 19 | emotor-login.md | E-Motor Login | /emotor/login | none | form | P0 | US-033 | — |
| 20 | emotor-assignments.md | รายการตรวจสภาพ + dashboard | /emotor/assignments | app-shell | list | P0 | US-034, US-035, US-036, US-039 | — |
| 21 | emotor-assignment-detail.md | รายละเอียด + อัปโหลด/ส่งผล | /emotor/assignments/[id] | app-shell | detail | P0 | US-037, US-038 | — |
| 22 | emotor-billing.md | สรุปตั้งเบิก | /emotor/billing | app-shell | list | P1 | US-040, US-041 | — |
| 23 | emotor-users.md | จัดการผู้ใช้ | /emotor/users | app-shell | list | P1 | US-042, US-043, US-044 | — |
| 24 | emotor-roles.md | Role Setting (E-Motor) | /emotor/roles | app-shell | form | P1 | US-045 | — |

## Role summary
- **ABC:** Admin (ทุกเมนู), UW (งาน+รายงาน+ตั้งเบิก view), Car Ins Staff (งาน+รายงานพื้นฐาน)
- **E-Motor:** Surveyor IT Admin (ทุกเมนู), Surveyor (งาน+ตั้งเบิก)

> 25 screens total (1 layout + 24 screens). Skeleton subset (B0): app-shell, abc-login, inspections-new, inspections-detail.
