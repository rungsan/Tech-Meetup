---
name: รายละเอียดงานตรวจสภาพ (workflow)
description: หน้ารายละเอียด job + ดำเนิน workflow 8 สถานะ + tabs
type: detail
archetype: detail
route: /inspections/[id]
shell: app-shell
layout: content-only
roles: [admin, uw, car_ins_staff]
stories: [US-009, US-010, US-011, US-012, US-013, US-014, US-015, US-016]
trigger: กด Job ID จากรายการ / รายการของฉัน
---

> **Shell:** ครอบด้วย AppShell → ดู [app-shell.md](app-shell.md)
> **Content area:** `<main class="flex-1 overflow-y-auto p-6">`

```
┌─ CONTENT AREA (p-6) ───────────────────────────────────────────────────────────┐
│  Job CIS-2026-000123   [StatusPill: ส่ง SV ออกตรวจสอบ]        [ Complete ▾ ]    │
│  ทะเบียน กข1234 · ลูกค้า สมชาย · Source สาขา A                                    │
│──────────────────────────────────────────────────────────────────────────────────│
│  [ รายละเอียด ] [ Job History ] [ ข้อความ 🔵 ] [ Car Inspect Image ]   ← Tabs    │
│──────────────────────────────────────────────────────────────────────────────────│
│  (Tab: รายละเอียด)                                                                │
│   Job Information: เลขอ้างอิง, วันคุ้มครอง, ฝ่ายธุรกิจ                              │
│   ข้อมูลลูกค้า · ข้อมูลรถยนต์                                                       │
│   ── ส่วนตามสถานะปัจจุบัน ──                                                       │
│   • ติดตามนัดหมาย: วันนัด/เวลา/สถานที่/หมายเหตุ + (Fleet: [Select Job ID ย่อย])   │
│   • ส่ง SV: ข้อมูล Survey ที่ assign, [แก้ราคาตรวจสภาพ], [ส่ง SMS ลูกค้า]          │
│   • รอผล: แถบ Car Inspect Image (preview/Revise), [รายงานผล]                       │
│   Update Status: [Select: …/ ลบรอย Remark / ยกเลิก ]                               │
└──────────────────────────────────────────────────────────────────────────────────┘
  (Tab: Job History) DataTable: วันเวลา · ผู้ดำเนินการ · action   [Admin: ลบรายการ]
  (Tab: ข้อความ) รายการข้อความ + ส่งใหม่
  (Tab: Car Inspect Image) ImageUploader + ImageCompare (ก่อน/หลัง Revise)
```

## Components
- PageHeader (action: Complete dropdown), StatusPill, Tabs, DataTable (history), ImageUploader, ImageCompare, Modal (ยืนยันเปลี่ยนสถานะ), FormField, AutoCompleteField

## States
- **Default** — แสดง tab รายละเอียดตามสถานะปัจจุบัน
- **Loading** — โหลด job (skeleton placeholders ใน content), tab content loading
- **Error** — โหลด/บันทึกล้มเหลว → message + retry; 404 → "ไม่พบงาน"
- **Empty** — Job History/ข้อความ/Image ว่าง → EmptyState
- **Success / edge** — กด Complete → Modal ยืนยัน → สถานะถัดไปตาม workflow; "ลบรอย Remark" → แตก 2 รูปแบบ (US-013/014); "ยกเลิก" → เก็บประวัติ + StatusPill ยกเลิก

## Interactions
- Tabs สลับ section · Complete → PATCH /status (Modal ยืนยัน) → สถานะถัดไป
- ส่ง SV: POST /send-survey → สร้าง SurveyAssignment + auto email (US-010)
- Revise รูป: POST /images/{img}/revise + comment (US-012); compare ก่อน/หลัง
- 🔵 บน tab ข้อความ = มีข้อความใหม่ (NotificationBell pattern, NFR-NOT-01)
- Admin เท่านั้นลบ Job History (US-015)

## Design Notes
- **Skeleton scope:** หน้านี้ใน B0 พิสูจน์แค่ **read-back** ของ job ที่สร้าง (US-004) — แสดง tab รายละเอียด + Job History ที่บันทึกตอน create. Workflow transitions เต็ม (US-009…016) ทำใน B1.
- เป็นหน้าที่ workflow-walk (P0) ต้องเดินครบ: create → send-SV → survey → result → done (ดู workflow-walks ก่อน B1)
- a11y: Tabs มี role=tablist/tab/tabpanel + keyboard nav; Modal focus-trap
