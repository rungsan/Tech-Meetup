---
name: ABC Login (Azure AD)
description: หน้า login ฝั่ง ABC ผ่าน Microsoft Azure AD
type: form
archetype: form
route: /login
shell: none
layout: fullpage-centered
roles: [public]
stories: [US-001]
trigger: ผู้ใช้ยังไม่ได้ login เข้าถึง protected route หรือเปิดแอป
---

> **Shell:** none — public route, full page (ไม่มี AppShell)

```
┌──────────────────────────── /login (fullpage-centered, canvas) ─────────────────────────────┐
│                                                                                              │
│                          ┌──────────────────────────────────────┐                           │
│                          │            CIS — ABC ประกันภัย         │  ← display font (Spectral)│
│                          │     ระบบตรวจสภาพรถยนต์                  │                           │
│                          │                                        │                           │
│                          │   [  เข้าสู่ระบบด้วย Microsoft  ]       │  ← primary button         │
│                          │                                        │                           │
│                          │   (error) ไม่สามารถเข้าสู่ระบบได้        │  ← danger token, ถ้า fail  │
│                          │                                        │                           │
│                          └──────────────────────────────────────┘                           │
│                          E-Motor Survey? → /emotor/login                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Components
- PageHeader (logo/title variant), button (primary), inline error message

## States
- **Default** — ปุ่ม "เข้าสู่ระบบด้วย Microsoft"
- **Loading** — กดแล้ว redirect ไป Azure AD (ปุ่ม disabled + spinner)
- **Error** — กลับจาก Azure AD แต่ไม่มีสิทธิ / อยู่ >1 ADD Group → "ไม่สามารถเข้าสู่ระบบได้" (danger)
- **Success** — มีสิทธิ → redirect ไป /dashboard

## Interactions
- คลิกปุ่ม → OIDC flow ไป Azure AD → callback → ตรวจ ADD Group → map role → set session → /dashboard
- ผู้ใช้อยู่ >1 ADD Group → deny (US-001 AC)

## Design Notes
- Skeleton ใช้ **stub provider** (จำลอง session+role) เพื่อพิสูจน์ protected-route + role pattern; Azure AD จริง implement ใน B2 (D-002)
- a11y: ปุ่มมี aria-label; error อยู่ใน aria-live region
