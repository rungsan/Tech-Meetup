---
title: "API Design — CIS"
version: "1.0"
date: "2026-06-25"
style: "REST · Next.js route handlers under /api/v1 · Zod validation (D-003)"
---

# API Design: CIS

## Conventions (D-003)

- **Base:** `/api/v1/{resource}` — resource-oriented nouns, plural.
- **Methods:** GET (list/read), POST (create/action), PATCH (partial update), DELETE.
- **Auth:** session cookie (NextAuth). ABC routes require Azure AD session; E-Motor routes require credential session. RBAC enforced in middleware by menu key.
- **Error shape:** `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": {...} } }`. Codes: `VALIDATION_ERROR`(422), `UNAUTHENTICATED`(401), `FORBIDDEN`(403), `NOT_FOUND`(404), `CONFLICT`(409), `INTERNAL`(500).
- **Pagination:** offset — `?page=1&limit=20` (limit ∈ {10,20,50,100}); response `{ data:[], page, limit, total }`.
- **Validation:** Zod schema per endpoint (request body/query). Generated client uses `fetch` (no react-query — frontend_data_pattern=fetch).
- **Versioning:** URL prefix `/v1`.

## Endpoint Inventory by Domain

### auth
| Method | Path | Story |
|--------|------|-------|
| GET | `/api/auth/[...nextauth]` (Azure AD + credentials) | US-001, US-033 |
| GET | `/api/v1/me` (session + role + menu) | US-001, US-032 |

### inspection (intake + workflow + list)
| Method | Path | Story |
|--------|------|-------|
| POST | `/api/v1/inspections` (single / red-plate / fleet) | US-004, US-005, US-006 |
| GET | `/api/v1/inspections` (all, filters, paginated) | US-017 |
| GET | `/api/v1/inspections/mine` (my work) | US-007 |
| GET | `/api/v1/inspections/{id}` | US-009…US-016 |
| POST | `/api/v1/inspections/{id}/assign` (assign to me) | US-008 |
| PATCH | `/api/v1/inspections/{id}/status` (workflow transition) | US-009…US-014 |
| POST | `/api/v1/inspections/{id}/send-survey` (→ create assignment, email) | US-010 |
| GET | `/api/v1/inspections/{id}/history` | US-015 |
| POST | `/api/v1/inspections/{id}/images` (staff upload) | US-016 |
| POST | `/api/v1/inspections/{id}/images/{img}/revise` (comment) | US-012 |
| POST | `/api/v1/inspections/{id}/sms` | US-010 |
| POST | `/api/v1/integrations/images` (inbound external API ingest) | US-012 (BR-003-02) |

### dashboard / reports
| GET | `/api/v1/dashboard` (counts + 3yr charts, date filter) | US-002, US-003 |
| GET | `/api/v1/reports/status` (+`?export=xlsx`) | US-018 |
| GET | `/api/v1/reports/result` | US-019 |
| GET | `/api/v1/reports/kpi` | US-020 |
| GET | `/api/v1/reports/productivity` | US-021 |

### billing
| GET | `/api/v1/billing` (CIS summary, filters) | US-022 |
| GET | `/api/v1/billing/{year}/{month}` | US-023 |
| POST | `/api/v1/billing/{id}/approve` · `/reject` (+price edit) | US-024 |
| GET | `/api/v1/emotor/billing` (Surveyor, +export pdf/xlsx) | US-040, US-041 |

### master-admin
| GET/POST/PATCH/DELETE | `/api/v1/admin/agents` | US-025 |
| PATCH | `/api/v1/admin/jobs/{id}/email` | US-026 |
| DELETE | `/api/v1/admin/results/{id}` | US-027 |
| GET/POST/PATCH | `/api/v1/admin/survey-companies` (+`/import`) | US-028, US-029 |
| PATCH | `/api/v1/admin/jobs/{id}` (agent/source/vehicle) | US-030 |
| GET/POST/PATCH/DELETE | `/api/v1/admin/vehicle-models` (+`/import`,`/export`) | US-031 |
| GET/PATCH | `/api/v1/admin/roles` (menu permissions) | US-032, US-045 |

### emotor-survey
| GET | `/api/v1/emotor/assignments` (list + dashboard, filters) | US-034 |
| POST | `/api/v1/emotor/assignments/{id}/accept` (+notify+email) | US-035 |
| POST | `/api/v1/emotor/assignments/{id}/reject` (+notify+email) | US-036 |
| GET | `/api/v1/emotor/assignments/{id}` | US-037 |
| POST | `/api/v1/emotor/assignments/{id}/images` (upload) | US-037 |
| POST | `/api/v1/emotor/assignments/{id}/complete` (→ sync CIS) | US-037 |
| POST | `/api/v1/emotor/assignments/{id}/images/{img}/revise` | US-038 |
| POST | `/api/v1/emotor/assignments/{id}/cancel` (reason) | US-039 |

### emotor-admin
| GET/POST/PATCH/DELETE | `/api/v1/emotor/users` (password policy) | US-042, US-043, US-044 |
| GET/PATCH | `/api/v1/emotor/roles` | US-045 |

### system
| GET | `/api/health` (readiness) | skeleton/obs |

## Skeleton Endpoint Matrix (B0)

| Interface | Method | Story | Auth | Example Request | Example Success | Example Error |
|-----------|--------|-------|------|-----------------|-----------------|---------------|
| `/api/health` | GET | — | none | — | `200 {"status":"ok","db":"up"}` | `503 {"status":"degraded"}` |
| `/api/v1/me` | GET | US-001 | session | — | `200 {"id":"..","role":"admin","menus":[..]}` | `401 {"error":{"code":"UNAUTHENTICATED"}}` |
| `/api/v1/inspections` | POST | US-004 | session (abc) | `{"customerType":"individual","customer":{"name":"...","mobile":"..."},"vehicle":{"licensePlate":"กข1234","province":"10","brandId":"..","modelId":"..","chassisNo":"..","vehicleType":"non_ev"},"sourceId":"..","businessDivId":"..","coverageStartDate":"2026-07-01","appointmentStatus":"not_appointed"}` | `201 {"id":"..","jobNo":"CIS-..","status":"new"}` | `422 {"error":{"code":"VALIDATION_ERROR","fields":{"licensePlate":"ห้ามมีขีด/เว้นวรรค"}}}` |
| `/api/v1/inspections/{id}` | GET | US-004 | session (abc) | — | `200 {"id":"..","jobNo":"..","vehicle":{...},"customer":{...},"history":[...]}` | `404 {"error":{"code":"NOT_FOUND"}}` |

> Skeleton proves: auth-gated route → Zod validation (plate rule, red-plate→province=99) → service → Prisma write (Job+Vehicle+Customer+JobHistory) → read-back → UI render. Real Azure AD deferred to B2; skeleton uses a minimal session stub proving the protected-route + role pattern.

## Story ↔ Endpoint Traceability

ครบทุก domain ด้านบน map กับ US-001…US-045 (ดูคอลัมน์ Story). OpenAPI 3.0 spec (`docs/api-spec.yaml`) จะ generate เต็มใน B0/B1 จาก contract นี้ — รอบ 1C เก็บ inventory + skeleton matrix + conventions ให้ `/ai-scaffold`/`/ai-build` ทำงานต่อได้.
