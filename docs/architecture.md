---
title: "Architecture — CIS (Car Inspection System & E-Motor Survey)"
version: "1.0"
date: "2026-06-25"
stack: "Next.js + TypeScript + Prisma + PostgreSQL (D-001)"
---

# Architecture: CIS

## System Overview

CIS ประกอบด้วย 2 subsystem ที่แชร์ฐานข้อมูล/โดเมนเดียวกันแต่แยกผู้ใช้และ auth:

1. **Car Inspection (ฝั่ง ABC)** — เจ้าหน้าที่ ABC สร้าง/บริหารงานตรวจสภาพ ผ่าน workflow 8 สถานะ จนถึงตั้งเบิก
2. **E-Motor Survey (ฝั่ง Surveyor)** — บริษัทตรวจสภาพภายนอกรับงาน อัปโหลดรูป ส่งผล และดูตั้งเบิก

ทั้งสองเป็น Next.js (App Router) application เดียว แยกด้วย route group + auth provider (`(abc)` ใช้ Azure AD, `(emotor)` ใช้ credential DB) ใช้ Prisma + PostgreSQL ร่วมกัน การเชื่อม 2 ระบบเป็น **in-process domain events** (เปลี่ยนสถานะ InspectionJob ↔ SurveyAssignment) ไม่ต้องมี message broker ในขนาดนี้ (design for current size + 1 tier)

## C4 Diagrams

### Level 1 — System Context

```text
                    +-------------------+
                    |  Microsoft        |
                    |  Azure AD (SSO)   |
                    +---------^---------+
                              | OIDC
   +-----------+   uses       |                 +------------------------+
   | ABC Staff |--------------+---------------->|                        |
   | (Car Ins, |                                |        CIS             |  auto email   +------------------+
   |  UW,Admin)|                                |  (Next.js + Postgres)  |-------------->| Email Gateway    |
   +-----------+                                |                        |               | (Auto@ABC.co.th) |
                                                |  - Car Inspection      |               +------------------+
   +-----------+   uses (user/pass)             |  - E-Motor Survey      |   SMS         +------------------+
   | Surveyor  |------------------------------->|                        |-------------->| SMS Provider     |
   | Staff     |                                |                        |               +------------------+
   +-----------+                                +-----^------------+-----+
                                                      |            |  receive images (inbound API)
                                       outbound/inbound|            +-----------------------+
                                                      |                                    |
                                          +-----------+--------+              +------------v-----------+
                                          | (internal sync)    |              | External Image Sources |
                                          | CIS <-> E-Motor    |              | สาขา / TQM / ธุรกิจ4-SCB |
                                          +--------------------+              +------------------------+
```

Actors: **ABC Staff** (Azure AD), **Surveyor Staff** (DB credential). External: **Azure AD**, **Email Gateway**, **SMS Provider**, **External Image APIs**.

### Level 2 — Container

```text
+----------------------------------------------------------------------------------+
|  CIS — Next.js (App Router) on Node                                              |
|                                                                                  |
|  +---------------------------+      +-------------------------------------+      |
|  |  Web UI (React/Tailwind)  |      |  Route Handlers /api/* (REST)       |      |
|  |  (abc) routes  | (emotor) | ---> |  - auth (NextAuth: Azure AD + creds)|      |
|  |  fetch client (api-client)|      |  - inspection / survey / billing    |      |
|  +---------------------------+      |  - reports / admin / images         |      |
|                                     |  + Zod validation, RBAC middleware  |      |
|                                     +------------------+------------------+      |
|                                                        | service layer            |
|                                     +------------------v------------------+       |
|                                     |  Domain Services (use-cases)        |       |
|                                     |  + domain events (job<->survey sync)|       |
|                                     +------------------+------------------+       |
|                                                        | Prisma Client            |
|  +------------------+   OTLP        +------------------v------------------+       |
|  | OTEL Collector   |<-------------|  (instrumentation: logs/traces/metr)|       |
|  +------------------+              +------------------+------------------+       |
+---------------------------------------------------------|------------------------+
                                                          | SQL
                                              +-----------v-----------+
                                              |  PostgreSQL           |
                                              +-----------------------+
   External: Azure AD (OIDC) · Email gateway (SMTP/API) · SMS API · Image source APIs (inbound)
```

### Level 3 — Component (API container)

```text
Route Handlers (/api/v1/*)
  ├─ middleware: auth (session) → RBAC (role→menu) → request log/trace
  ├─ controllers (thin): parse + Zod validate → call service → map errors
  ├─ services (use-cases): InspectionService, SurveyService, BillingService,
  │                        ReportService, AdminService, ImageService, AuthService
  ├─ domain events: JobStatusChanged → create SurveyAssignment ("งานเข้าใหม่"),
  │                 SurveyCompleted  → update InspectionJob status
  └─ repositories: Prisma Client (data access) → PostgreSQL
```

## Key Components

| Component | Responsibility | Technology | Stories |
|-----------|---------------|------------|---------|
| Auth (ABC) | Azure AD SSO, ADD-Group→role, single-group rule | NextAuth + MSAL/OIDC | US-001, US-032 |
| Auth (E-Motor) | user/pass, password policy, session | NextAuth credentials + bcrypt | US-033, US-042 |
| RBAC middleware | menu-level access per role | Next.js middleware | US-032, US-045 |
| Inspection service | create (single/fleet/red-plate), workflow 8 states | TS service + Prisma | US-004…US-017 |
| Survey service (E-Motor) | accept/reject, upload, complete, sync | TS service + Prisma | US-034…US-039 |
| Image service | upload/preview/revise/compare, inbound API ingest | TS + object storage | US-012, US-016, US-037, US-038 |
| Billing service | summary, monthly auto-gen, approve/reject | TS + scheduled job | US-022…US-024, US-040, US-041 |
| Report service | status/result/KPI/productivity + Excel/PDF export | TS + xlsx/pdf libs | US-018…US-021 |
| Notification | auto email + SMS + in-app | email/SMS adapters | US-010, US-013, US-035, US-036 |
| Master admin | survey co., brand/model, agent/source, email | CRUD services | US-025…US-031 |

## Data Flow (primary — inspection lifecycle)

```
ABC create job (US-004) → DB(InspectionJob=งานเข้าใหม่)
  → follow appointment (US-009) → send SV (US-010) → [domain event] SurveyAssignment=งานเข้าใหม่ + auto email
    → Surveyor accept (US-035) → [event] notify CIS + email Auto@ABC → upload images (US-037)
      → Surveyor complete → [event] InspectionJob=รอผล → ABC review images (US-012) → ตรวจรถยนต์แล้ว
        → end of month → auto Billing → approve (US-024)
```

## Integration Points

| System | Protocol | Direction | Purpose | Stories |
|--------|----------|-----------|---------|---------|
| Azure AD | OIDC/OAuth2 | inbound (login) | SSO + role via ADD Group | US-001 |
| Email gateway | SMTP/REST | outbound | auto email (create/accept/reject/result) | US-010, US-035/036 |
| SMS provider | REST | outbound | SMS to customer | US-010 |
| External Image API | REST | inbound | receive inspection images (สาขา/TQM/SCB) | US-012 (BR-003-02) |
| CIS ↔ E-Motor | in-process domain events | bidirectional | job↔survey status sync | US-010, US-037 (BR-003-01/03) |

## Security Architecture (summary — see D-002)

- **AuthN:** ABC = Azure AD (OIDC); E-Motor = username/password (bcrypt, policy ≥8 + 2/3 types). Sessions via NextAuth (HTTP-only cookie).
- **AuthZ:** RBAC — role → menu access matrix, enforced in middleware; ADD-Group single-group rule (>1 group = deny). Role change effective on next login.
- **Secrets:** env vars (no secrets in repo); Azure AD client secret, DB url, email/SMS keys.
- **PII (PDPA):** customer name/mobile, plate, chassis, images — access-controlled; redact in logs by default (fail-closed).
- **Audit:** JobHistory table records every state change (who/when); admin-only delete (US-015).

## Infrastructure Design

| Environment | Runtime | Data | Deploy | Notes |
|-------------|---------|------|--------|-------|
| local | Node (pnpm dev) | PostgreSQL via Docker Compose | native app + docker infra | hot reload |
| dev/staging | Node container | managed PostgreSQL | container deploy | TBD provider (1C open) |
| production | Node container | managed PostgreSQL | container deploy | cloud vs on-prem TBD (charter open; Azure likely) |

Object storage for images (TBD: S3-compatible / Azure Blob — decide before B4). CI: GitHub Actions (lint/test/build). Cost estimate: TBD pending infra decision.

## Architectural Risks

- **R1:** External Image API + Azure AD ขึ้นกับฝ่ายอื่น (charter highest risk) — skeleton ใช้ stub ก่อน, real integration ใน B2/B4.
- **R2:** CIS↔E-Motor sync เป็น in-process — ถ้าแยก deploy ในอนาคตต้องเปลี่ยนเป็น event bus (revisit trigger).
- **R3:** Report/Export ปริมาณมาก (3 ปีย้อนหลัง) — ต้องดู index + query patterns (data-model §query).
