---
target: docs/design/architecture-package.md
phase: 1C
gate: discover-to-build
date: "2026-06-25"
---

# Architecture Package — CIS

> Canonical Phase 1C package. Status: **draft for review** (UI wireframes + workflow walks + G1 evidence file pending — see §11).

## 1. Context

| Item | Evidence |
|---|---|
| Project name | CIS (Car Inspection System & E-Motor Survey) |
| Current phase | 1C |
| Project type | web + api |
| Active extensions | web, api |
| Primary users / actors | ABC Staff (Car Ins/UW/Admin), Surveyor Staff/IT Admin |
| External systems | Azure AD, Email gateway, SMS provider, External Image APIs |

## 2. Architecture Overview

C4 L1/L2/L3 diagrams + narrative: **[docs/architecture.md](../architecture.md)** (source of truth). Single Next.js app, 2 route groups `(abc)`/`(emotor)`, shared Prisma+PostgreSQL, in-process domain events for CIS↔E-Motor sync.

## 3. Technology Decisions

| Decision ID | Area | Decision | Rationale | Revisit Trigger |
|---|---|---|---|---|
| D-001 | runtime/framework/db | Next.js + TS + Prisma + PostgreSQL | framework-fit, full-TS, dev speed | org mandates SQL Server/.NET |
| D-002 | auth/authz | NextAuth (Azure AD + creds) + RBAC menu-matrix | 2-system auth, central RBAC | MFA/SAML/other IdP |
| D-003 | api/transport | REST /api/v1 + error shape + offset pg + Zod | contract-first, type-safe | huge lists → cursor |
| D-004 | data | cuid PK, snake_case @map, audit cols, JobHistory | consistency + auditability | normalize email/central audit |
| D-006 | observability | OTEL/OTLP in-process, JobHistory audit, fail-closed redaction | PDPA-safe, debuggable | APM vendor / retention rule |

Coverage: runtime ✓ · framework ✓ · API ✓ · data+migration ✓ · authN/Z ✓ · testing (Playwright + unit, D-001) ✓ · deployment (container, infra provider TBD) ⚠ · UI framework+design system (Next/Tailwind + shadcn/ui + preset `trust-corporate`, D-007) ✓

> UI design: `docs/wireframes/` (app-shell, design-system, components, _index + skeleton screens). D-007.

## 4. Data Model

Full inventory (19 entities), ERD, conventions, query patterns, Prisma sketch: **[docs/data-model.md](../data-model.md)**.

| Entity (core) | Purpose | Key Fields | Relationships | Query Patterns | Indexes |
|---|---|---|---|---|---|
| InspectionJob | งาน 1 คัน, 8 สถานะ | job_no, status, owner | 1:1 Vehicle/Customer; N:1 Source/Agent/Division | by owner+status+date; by status counts | (owner,status,created_at),(status) |
| Vehicle | รถ (red-plate→99) | license_plate, province, type | 1:1 Job; N:1 Brand/Model | by plate | GIN(plate) |
| SurveyAssignment | E-Motor work item | status, price | 1:1 Job; N:1 SurveyCompany | by company+status | (survey_co_id,status) |
| Billing | ตั้งเบิกต่อ job | prices, status, year/month | 1:1 Job | by year/month/status | (year,month,status) |
| Role/MenuPermission | RBAC | menu_key, access | 1:N | by role | (role_id) |

## 5. API / Interface Contracts

Inventory by domain + conventions: **[docs/api-design.md](../api-design.md)**.

| Interface | Consumer | Provider | Contract Artifact | Auth | Error Shape |
|---|---|---|---|---|---|
| REST /api/v1/* | Web UI (fetch) | Next.js route handlers | docs/api-design.md (→ api-spec.yaml in B0) | NextAuth session | `{error:{code,message,fields?}}` |
| Inbound image API | External (สาขา/TQM/SCB) | /api/v1/integrations/images | docs/api-design.md | token (B4) | same |
| CIS↔E-Motor | internal | domain events | docs/architecture.md §dataflow | n/a | n/a |

### Skeleton Endpoint Matrix

| Skeleton Interface | Method | Story | Auth | Example Request | Example Success | Example Error |
|---|---|---|---|---|---|---|
| `/api/health` | GET | — | none | — | `200 {"status":"ok"}` | `503` |
| `/api/v1/me` | GET | US-001 | session | — | `200 {role,menus}` | `401 UNAUTHENTICATED` |
| `/api/v1/inspections` | POST | US-004 | session | `{customer,vehicle,sourceId,...}` | `201 {id,jobNo,status:"new"}` | `422 VALIDATION_ERROR` |
| `/api/v1/inspections/{id}` | GET | US-004 | session | — | `200 {job,vehicle,customer,history}` | `404 NOT_FOUND` |

## 5b. Contract Chain Summary

| Layer | Canonical Source | Skeleton Target | Notes |
|---|---|---|---|
| Data schema | prisma/schema.prisma | InspectionJob+Vehicle+Customer+JobHistory | D-004 conventions |
| Service / logic | services/InspectionService | createInspection(input) | validation + audit write |
| Transport / API | /api/v1/inspections route handler | POST + GET | D-003 error/validation |
| UI / client | (abc)/inspections/new + api-client | create form + read-back | content-area pattern |
| Validation / error | Zod schema + error mapper | plate rule, red-plate→99 | `{error:{code,...}}` |

## 6. Security Architecture

| Concern | Decision | Evidence |
|---|---|---|
| Authentication | Azure AD (ABC) + credentials (E-Motor) via NextAuth | D-002, architecture.md §security |
| Authorization | RBAC role→menu matrix, middleware; ADD single-group rule | D-002, US-032/045 |
| Secrets | env vars only | architecture.md |
| PII / sensitive | access-controlled; fail-closed redaction in logs | D-006, nfr NFR-SEC-05 |
| Audit / traceability | JobHistory table (who/when/action) | D-004, D-006, US-015 |

## 7. Infrastructure Architecture

| Environment | Runtime | Data Services | Deployment | Verification |
|---|---|---|---|---|
| local | Node pnpm dev | PostgreSQL (Docker Compose) | native + docker | /api/health, e2e |
| dev/staging | Node container | managed PostgreSQL | container (provider TBD) | smoke |
| production | Node container | managed PostgreSQL + object storage | container (cloud vs on-prem TBD) | smoke + monitor |

> Infra provider, object storage, CI host = **open** (decide before B4/S3). Azure ecosystem likely (Azure AD).

## 8. Observability Architecture

Intent: **[docs/design/observability-intent.md](observability-intent.md)** · Decisions: D-006.

| Concern | Decision | Evidence |
|---|---|---|
| Critical flows | OF-001…OF-006 | observability-intent §2 |
| Structured logging | OTEL JSON, no PII | D-006 |
| Trace/correlation | request_id+trace_id via context | D-006 |
| Metrics / SLI | create-job success, notification delivery ≥99% | obs-intent §5 |
| Audit event model | JobHistory rows | D-004/D-006 |
| Redaction boundaries | fail-closed, id/job_no only | D-006 |
| Health/readiness | GET /api/health | api-design.md |

## 9. Walking Skeleton Scope

| Field | Value |
|---|---|
| Selected story | **US-004** — สร้างรายการตรวจสภาพคันเดียว (D-005) |
| Why representative | core CRUD + validation + auth-gated + DB write + audit — pattern ที่ 45 stories ลอกตาม |
| Layers exercised | UI(form) → API(REST+Zod) → service → Prisma → PostgreSQL → read-back → render |
| Skeleton UI surfaces | `abc-login.md` (stub), `inspections-new.md`, `inspections-detail.md` (drafted, D-007) |
| Golden patterns to prove | routing, auth/session+role, Zod validation, error shape, Prisma access, audit write, test, OTEL |
| Observability proof goals | obs-intent §7 (log/trace/metric/audit/health) |
| B0 validation targets | D-001/D-002/D-003/D-004/D-006 validation targets |
| Explicit exclusions | real Azure AD (B2), fleet, workflow transitions, reports, billing, external image API |
| Success criteria | create→read US-004 works end-to-end + obs proof + green test + CI |

Layer coverage:

| Layer / Capability | Required? | Evidence Planned |
|---|---|---|
| Data persistence | yes | Prisma migrate + write Job/Vehicle/Customer/JobHistory |
| API entry point | yes | POST/GET /api/v1/inspections |
| Business logic | yes | InspectionService (validation, audit) |
| UI / client | yes | new + detail pages (fetch client) |
| Auth / access control | yes | protected route + role/menu (stub provider) |
| Observability proof | yes | obs-intent §7 |
| Tests | yes | unit (service) + Playwright (create flow) |
| CI | yes | GitHub Actions lint/test/build |
| Deployment | yes | container build (B0 deploy smoke) |

Supporting artifact: `docs/design/b0-readiness-checklist.md` — **pending** (§11).

## 10. Human Approval

| Approver | Role | Date | Decision | Notes |
|---|---|---|---|---|
| (ABC) | Product Owner | | pending | |
| Rungsan Suyala | Tech Lead / Architect | 2026-06-25 | pending | submitted with package |

## 11. Remaining 1C Work (before discover-to-build / G1 gate)

- [x] `/ai-design ui` — app-shell + design-system (preset trust-corporate) + components catalog + 25-screen inventory + 3 skeleton screens full (D-007); remaining screen wireframes follow in B1
- [x] `/ai-design workflow` — [workflow-walks.md](workflow-walks.md): C1(skeleton)+C2 clear, C3/C4 gaps-raised (R-002/R-003)
- [x] `docs/design/discover-to-build-evidence.md` — G1 H1–H6 all pass + S1–S4 pass
- [x] `docs/design/b0-readiness-checklist.md` — ready for B0 (pending G1 approval)
- [ ] `docs/api-spec.yaml` — formal OpenAPI (deferred: generated in B0 from api-design.md)
- [ ] Human approval of package (G1 gate)
