---
target: docs/design/b0-readiness-checklist.md
phase: 1C
gate: discover-to-build
date: "2026-06-25"
---

# B0 Readiness Checklist

> เป้าหมาย: ทำให้ walking skeleton (US-004) executable โดยไม่มี hidden assumption.

## 1. Skeleton Scope

| Item | Status | Evidence | Notes |
|---|---|---|---|
| Skeleton story selected | pass | D-005, architecture-package §9 | US-004 สร้าง inspection |
| Story is Must priority | pass | story-index.md | US-004 = Must |
| Story exercises all required layers | pass | architecture-package §9 layer matrix | UI→API→service→Prisma→DB→render + auth + obs |
| Explicit exclusions recorded | pass | architecture-package §9 | Azure AD จริง/fleet/workflow/reports/billing excluded |

## 2. Contract Readiness

| Contract | Status | Source | Notes |
|---|---|---|---|
| API contract complete for skeleton flow | pass | [api-design.md](../api-design.md) skeleton matrix | POST/GET inspections, /me, /health |
| Data model complete for skeleton entities | pass | [data-model.md](../data-model.md) §skeleton + Prisma sketch | Job/Vehicle/Customer/JobHistory + masters |
| Validation + error shape documented | pass | D-003, api-design.md | Zod + `{error:{code,message,fields}}` |
| Auth / access assumptions documented | pass | D-002, architecture §security | stub provider in B0; Azure AD in B2 |

## 2b. Skeleton Endpoint Matrix

| Item | Status | Source | Notes |
|---|---|---|---|
| Endpoint list complete | pass | architecture-package §5 | health, me, POST/GET inspections |
| Example request/response captured | pass | api-design.md | 201/200 examples |
| Error examples captured | pass | api-design.md | 422/401/404 |

## 2c. Contract Chain Summary

| Item | Status | Source | Notes |
|---|---|---|---|
| Data → service → transport explicit | pass | architecture-package §5b | |
| UI/client consumption path explicit | pass | §5b + wireframes inspections-new/detail | fetch client |
| Validation/error ownership by layer | pass | §5b | Zod at handler, mapper for error shape |

## 3. Architecture Decisions To Validate In B0

| Decision ID | Decision | B0 validation target | Pass condition |
|---|---|---|---|
| D-001 | Next.js+Prisma+PostgreSQL | local stack boots 1 command; Prisma↔PG flow | create+read US-004 works |
| D-002 | NextAuth + RBAC | protected route + role/menu (stub) | unauth denied; role gates menu |
| D-003 | REST + Zod + error shape | endpoint returns success+error shape | 201/422 match contract |
| D-004 | cuid PK, snake_case, JobHistory audit | migration + audit write | tables created; audit row on create |
| D-006 | OTEL + JobHistory audit + redaction | log/trace/metric/health/audit | obs proofs captured (no PII) |
| D-007 | golden shell + preset trust-corporate | screens render w/ tokens | ui-token-guard passes |

## 4. Execution Inputs

| Input | Status | Source | Notes |
|---|---|---|---|
| Canonical config sufficient for B0 | pass | config/project.yaml | tech/commands/paths set (golden_page TBD by scaffold) |
| Local development strategy defined | partial | D-001, architecture §infra | app native + PostgreSQL via Docker Compose; finalize in `/ai-scaffold setup` |
| Test strategy for skeleton defined | pass | architecture-package §9 | unit (service) + Playwright (create flow) |
| Seed / fixture assumptions defined | pass | data-model §migration/seed | ≥1 Source/Division/Brand/Model + ABC admin user |
| Seed plan explicit enough to run skeleton | pass | data-model.md | seed masters then create US-004 |

## 5. Observability Proof Targets

| Proof target | Status | Source | Notes |
|---|---|---|---|
| Critical flow chosen | pass | observability-intent OF-001 | create inspection |
| Structured logging target | pass | obs-intent §7, D-006 | entry+completion, no PII |
| Trace/correlation target | pass | obs-intent §7 | span route→service→prisma |
| Metrics / SLI target | pass | obs-intent §5/§7 | create_job_duration + _total{result} |
| Health/readiness target | pass | api-design /api/health | 200 ok / 503 |

## 6. Open Risks Before B0

| Risk / Assumption | Impact on B0 | Mitigation in B0 | Owner |
|---|---|---|---|
| R-001 external integrations | low (skeleton uses stub) | stub Azure AD/email | Rungsan |
| R-002 object storage | none (images not in skeleton) | defer to B4 | Rungsan |
| Local dev infra finalization | low | `/ai-scaffold setup` writes compose | Rungsan |

## 6b. Skeleton UI Surface Readiness

| Item | Status | Source | Notes |
|---|---|---|---|
| Skeleton screens identified | pass | wireframes _index (skeleton ✅) | abc-login, inspections-new, inspections-detail |
| Skeleton UI interactions documented | pass | the 3 skeleton wireframes | states + interactions |
| Layout/shell assumptions explicit | pass | app-shell.md + design-system.md | golden shell + trust-corporate |

## 7. Decision

| Field | Value |
|---|---|
| Ready for B0 | **yes** (pending G1 human approval) |
| Blocking gaps | none for skeleton (C1 walk = clear) |
| Recommended next command | `/ai-validate gate discover-to-build` → `/ai-phase next` → `/ai-scaffold` |
