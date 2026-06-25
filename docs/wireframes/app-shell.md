# App Shell — wireframe selection

**Variants:** `app-shell` (authenticated) for both ABC and E-Motor · `shell: none` for login pages
**Preset:** trust-corporate
**Canonical anatomy + rules:** [shell-spec.md](../../ai-sdlc/templates/design-system/app-shell/shell-spec.md) — do not redraw.

> CIS มี 2 authenticated shell ที่ใช้ golden app-shell เดียวกัน ต่างกันที่ nav map + brand context (ABC vs Surveyor) และ auth provider.

## Nav map — ABC (Car Inspection)
- Overview: Dashboard → /dashboard
- งาน: แจ้งตรวจสภาพใหม่ → /inspections/new · รายการของฉัน → /inspections/mine · รายการตรวจสภาพ → /inspections
- รายงาน: สถานะ → /reports/status · สรุปผล → /reports/result · KPI → /reports/kpi · บันทึกงาน → /reports/productivity
- ตั้งเบิก: รายการตั้งเบิก → /billing
- ตั้งค่า (Admin): จัดการอีเมล → /admin/agents · แก้อีเมลจาก Job → /admin/job-email · ลบรายงานผล → /admin/results · จัดการ Survey → /admin/survey · แก้ Agent/Source/รถ → /admin/job-edit · ยี่ห้อ/รุ่นรถ → /admin/vehicle-models · Role Setting → /admin/roles

## Nav map — E-Motor (Surveyor)
- งาน: รายการตรวจสภาพ → /emotor/assignments
- ตั้งเบิก: สรุปตั้งเบิก → /emotor/billing
- ตั้งค่า (IT Admin): จัดการผู้ใช้ → /emotor/users · Role Setting → /emotor/roles

## Role visibility (ABC) — driven by RBAC MenuPermission (US-032)
| Item | Admin | UW | Car Ins Staff |
|------|-------|----|--------------|
| Dashboard | ✓ | ✓ | ✓ |
| แจ้งตรวจสภาพใหม่ / รายการของฉัน / รายการตรวจสภาพ | ✓ | ✓ | ✓ |
| รายงาน (สถานะ/สรุปผล) | ✓ | ✓ | ✓ |
| รายงาน KPI / บันทึกงาน | ✓ | ✓ | — |
| รายการตั้งเบิก | ✓ | ✓ (view) | — |
| ตั้งค่า (Admin menus) | ✓ | — | — |

## Role visibility (E-Motor) — RBAC (US-045)
| Item | Surveyor IT Admin | Surveyor |
|------|-------------------|----------|
| รายการตรวจสภาพ | ✓ | ✓ |
| สรุปตั้งเบิก | ✓ | ✓ |
| จัดการผู้ใช้ / Role Setting | ✓ | — |

## Topbar
- Brand: "CIS" (ABC) / "E-Motor Survey" (Surveyor) + context label (ฝ่าย/บริษัท) · 🔔 notification (Job History new message) · user + role · logout
- Role change ระหว่างใช้งาน → ถ้า menu ถูกถอนสิทธิ แสดง "ไม่มีสิทธิเข้าถึงหน้าจอนี้ กรุณาออกจากระบบและเข้าใหม่" (US-032)
