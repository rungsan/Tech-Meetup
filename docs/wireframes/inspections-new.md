---
name: แจ้งตรวจสภาพใหม่
description: ฟอร์มสร้างรายการตรวจสภาพ (รายคัน / ป้ายแดง / Fleet)
type: form
archetype: form
route: /inspections/new
shell: app-shell
layout: content-only
roles: [admin, uw, car_ins_staff]
stories: [US-004, US-005, US-006]
trigger: กดเมนู "แจ้งตรวจสภาพใหม่"
---

> **Shell:** ครอบด้วย AppShell → ดู [app-shell.md](app-shell.md)
> **Content area:** `<main class="flex-1 overflow-y-auto p-6">` — wireframe นี้แสดงเฉพาะ content area

```
┌─ CONTENT AREA (p-6) ───────────────────────────────────────────────────────────┐
│  แจ้งตรวจสภาพรถใหม่ (text-2xl)                                  [ บันทึก ]       │
│  สร้างรายการตรวจสภาพ — รายคันหรือกลุ่ม Fleet                                       │
│──────────────────────────────────────────────────────────────────────────────────│
│  ข้อมูลงาน                                                                        │
│   Source* [AutoComplete] · ฝ่ายธุรกิจ* [AutoComplete] · Agent [AutoComplete]      │
│   อีเมลผู้แจ้งงาน [____;____]  (หลายอีเมลคั่นด้วย ";")                              │
│   [☐] แจ้งงานกลุ่ม Fleet     → (เปิดโหมด Fleet: [Stepper 2–10] [สร้าง])           │
│──────────────────────────────────────────────────────────────────────────────────│
│  ข้อมูลลูกค้า                                                                     │
│   ประเภท* (◉ บุคคลทั่วไป ○ นิติบุคคล) · ชื่อ-นามสกุล* [____] · มือถือ* [____]      │
│──────────────────────────────────────────────────────────────────────────────────│
│  ข้อมูลรถยนต์                                          [☐] รถป้ายแดง               │
│   ทะเบียน* [____] (ห้ามขีด/เว้นวรรค) · จังหวัด* [Select] (=99 ถ้าป้ายแดง, disabled)│
│   ยี่ห้อ* [AutoComplete] · รุ่น* [AutoComplete] · เลขตัวถัง [____] · ประเภท(◉NonEV ○EV)│
│──────────────────────────────────────────────────────────────────────────────────│
│  การนัด & หมายเหตุ                                                                │
│   สถานะการนัด* (○ ยังไม่ได้นัด ○ นัดลูกค้า) · วันเริ่มคุ้มครอง* [date]             │
│   หมายเหตุ ไม่ส่ง Survey [Select: ลูกค้าส่งรูป / ตัวแทนส่งรูป / สาขาตรวจเอง / …]    │
└──────────────────────────────────────────────────────────────────────────────────┘
   (Fleet mode) แสดงการ์ดข้อมูลรถซ้ำตามจำนวน Stepper, แต่ละการ์ดมีปุ่ม [ลบ]
```

## Components
- PageHeader (action: บันทึก), FormField, AutoCompleteField, Stepper (fleet), StatusPill (n/a), Modal (ยืนยันบันทึก)

## States
- **Default** — ฟอร์มว่าง โหมดรายคัน
- **Empty** — n/a (เป็นฟอร์มสร้าง)
- **Loading** — ระหว่างบันทึก (ปุ่ม disabled + spinner); autocomplete loading
- **Error** — validation inline (ทะเบียนมีขีด/เว้นวรรค, ฟิลด์บังคับว่าง) → error token ใต้ field; บันทึกล้มเหลว → banner
- **Success** — Modal "บันทึกสำเร็จ" → ไปหน้ารายการ / รายละเอียด
- **Edge (Fleet)** — ทะเบียนซ้ำ → เตือนรายคัน; กด "สร้าง" ซ้ำ นับต่อจากเดิม (สูงสุด 10)

## Interactions
- ติ๊ก "รถป้ายแดง" → จังหวัด = "99" + disabled (US-005)
- ติ๊ก "Fleet" → แสดง Stepper + ปุ่มสร้าง → render การ์ดรถตามจำนวน (US-006)
- กด "บันทึก" → Modal ยืนยัน → POST /api/v1/inspections → 201 → redirect; 422 → inline errors

## Design Notes
- **Skeleton scope:** โหมดรายคัน (US-004) คือ golden path — validation (ทะเบียน, ป้ายแดง→99), POST→read-back. Fleet (US-006) UI วางไว้แต่ logic เต็มทำใน B1.
- a11y: ทุก field มี label + required indicator; error ผูก aria-describedby
