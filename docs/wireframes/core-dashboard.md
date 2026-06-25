---
name: Dashboard
description: หน้า Dashboard สรุปสถานะงานตรวจสภาพ + กราฟเทียบ 3 ปี
type: dashboard
archetype: dashboard
route: /dashboard
shell: app-shell
layout: content-only
roles: [admin, uw, car_ins_staff]
stories: [US-002, US-003]
trigger: login สำเร็จ / กดเมนู Dashboard
---

> **Shell:** ครอบด้วย AppShell → ดู [app-shell.md](app-shell.md)
> **Content area:** `<main class="flex-1 overflow-y-auto p-6">`

```
┌─ CONTENT AREA (p-6) ───────────────────────────────────────────────────────────┐
│  Dashboard (text-2xl)                            [ช่วงเวลา: 30/60/90/กำหนดเอง ▾] │
│  ภาพรวมงานตรวจสภาพรถ                                          [ตกลง] [ล้างค่า]   │
│──────────────────────────────────────────────────────────────────────────────────│
│  ┌ StatCard ┐ ┌ StatCard ┐ ┌ StatCard ┐ ┌ StatCard ┐  ← clickable → รายการตรวจสภาพ│
│  │งานเข้าใหม่│ │ติดตามนัด │ │ส่ง SV ตรวจ│ │ติดตาม SV │     (filter สถานะอัตโนมัติ)  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                            │
│  ┌ StatCard ┐ ┌ StatCard ┐ ┌ StatCard ┐ ┌ StatCard ┐                            │
│  │รอผลตรวจ  │ │ตรวจแล้ว  │ │ไม่ส่ง SV │ │ยกเลิก    │   (8 สถานะ)                  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                            │
│──────────────────────────────────────────────────────────────────────────────────│
│  ┌ ChartBar: ปริมาณตรวจสภาพ 3 ปี ┐  ┌ ChartBar: ค่าใช้จ่าย 3 ปี ┐                 │
│  └──────────────────────────────┘  └──────────────────────────┘                 │
│  ┌ ChartPie: Top 5 Survey ┐  ┌ ChartBar: สถานะงานทั้งหมด ┐                        │
│  └────────────────────────┘  └──────────────────────────┘                        │
│──────────────────────────────────────────────────────────────────────────────────│
│  รายการของฉัน (5 ล่าสุด) → [ไปหน้ารายการ]   รายการตรวจสภาพ (5 ล่าสุด) → [ไปหน้า]  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## Components
- PageHeader (action: ตัวกรองช่วงเวลา), StatCard (×8, clickable), ChartBar, ChartPie, DataTable (mini 5-row), FilterBar

## States
- **Default** — แสดง card + กราฟตามช่วงเวลา default
- **Empty** — ไม่มีข้อมูลในช่วงเวลา → EmptyState ในกราฟ + card = 0
- **Loading** — skeleton placeholders ของ card + กราฟ
- **Error** — โหลดล้มเหลว → message + retry
- **Edge** — กรองช่วงเวลากำหนดเอง: เลือกวันเริ่ม-สิ้นสุด

## Interactions
- กด StatCard → ไป /inspections พร้อม filter สถานะนั้น (US-002)
- เปลี่ยนช่วงเวลา (30/60/90/custom) + ตกลง → GET /api/v1/dashboard refresh; ล้างค่า → default (US-003)

## Design Notes
- P0 landing แต่ **ไม่อยู่ใน skeleton** (skeleton = create flow); draft เต็มเป็น UI visual contract สำหรับ H7
- กราฟใช้ token จาก preset (ไม่ hardcode สี)
- a11y: card เป็น link มี aria-label; กราฟมี text alternative/table fallback
