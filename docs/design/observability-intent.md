---
target: docs/design/observability-intent.md
phase: 1C
gate: discover-to-build
date: "2026-06-25"
---

# Observability Intent — CIS

## 1. Scope

| Field | Value |
|---|---|
| Project name | CIS |
| Current phase | 1C |
| Primary product shape | web + api (2 subsystem) |
| Active extensions | web, api |
| Primary runtime / platform | Node (Next.js) |
| Main production environments | dev/staging/production (provider TBD) |

## 2. Critical Flows

| Flow ID | Flow / Journey | Why critical | Success signal | Failure signal | Owner |
|---|---|---|---|---|---|
| OF-001 | Create inspection job (US-004) | จุดเริ่มทุกงาน | job created + JobHistory | validation/DB error | ABC |
| OF-002 | Send SV → create assignment + email (US-010) | จุดเชื่อม CIS→E-Motor | assignment=งานเข้าใหม่ + email sent | sync/email fail | ABC |
| OF-003 | Surveyor accept/reject (US-035/036) | SLA การรับงาน | status update + email Auto@ABC | notify/email fail | Surveyor |
| OF-004 | Surveyor complete → sync CIS (US-037) | ส่งผลกลับ | InspectionJob=รอผล | sync fail | Surveyor |
| OF-005 | Approve billing (US-024) | การเงิน | billing=approved | wrong amount/authz | ABC |
| OF-006 | Inbound image ingest API (US-012) | รับรูปจากภายนอก | image stored + linked | ingest/validation fail | System |

## 3. Audit And Compliance Signals

| Concern | Requirement | Required evidence | Retention / handling |
|---|---|---|---|
| Security-sensitive mutations | ทุก state change ของ job/billing | JobHistory row (who/when/action) | retain ≥ audit policy (TBD) |
| Access to sensitive data | ดู/ส่งออกข้อมูลลูกค้า/รูป | access log (no PII in log body) | PDPA |
| Compliance-regulated activity | export รายงานที่มี PII | log export event (actor, scope) | PDPA |
| Administrative actions | role change, delete report/user | JobHistory / admin audit | admin-only |

## 4. Sensitive Data And Redaction Boundaries

| Data class | Example | In logs? | Redaction rule |
|---|---|---|---|
| PII | ชื่อลูกค้า, มือถือ, ทะเบียน, เลขตัวถัง | no | hash/omit; log job_no/id instead |
| Images | รูปตรวจสภาพ | no (only ref/id) | store ref, not content |
| Secrets / credentials | Azure secret, DB url, SMS key | no | env only, never logged |
| Identifiers | job_no, user_id, role | yes | allowed (non-PII) |

## 5. Metrics And SLO Candidates

| Type | Candidate | Why | Proposed target | Deferred? |
|---|---|---|---|---|
| SLI | create-job success rate | core flow health | ≥99% | no |
| SLI | email/notification delivery (charter #4) | notification reliability | ≥99% | no |
| SLO | API p95 latency (read) | UX | TBD (set in S2) | yes |
| Domain KPI | jobs by status, time-in-state | KPI report (US-020) | n/a (report) | no |
| Cardinality | metric labels (status, division) | avoid explosion | bounded enums only | no |

## 6. Topology And Propagation Assumptions

| Area | Decision / assumption | Rationale |
|---|---|---|
| Request boundaries | per HTTP route handler | Next.js |
| Background jobs | monthly billing auto-gen (scheduled) | US-040 |
| Cross-service calls | none (in-process events) | single app (D-001) |
| Event propagation | in-process domain events job↔survey | size + 1 tier |
| Correlation strategy | request_id + trace_id propagated via context | OTEL |

## 7. Skeleton Proof Requirements (B0)

| Proof item | Required? | Planned evidence |
|---|---|---|
| Structured log on entry+completion for one flow (OF-001) | yes | create-job logs (no PII) |
| Error-path diagnostic w/ correlation | yes | validation-fail log w/ request_id |
| Trace/span chain across skeleton flow | yes | OTEL span: route→service→prisma |
| ≥1 latency + ≥1 outcome metric | yes | create_job_duration + create_job_total{result} |
| Audit event for one state change | yes | JobHistory row on create |
| Health/readiness smoke target | yes | GET /api/health |

## 8. Planned Artifacts And Command Path

| Stage | Artifact / Command | Output |
|---|---|---|
| Discover | this file | approved intent |
| Discover | D-001, D-006 + architecture-package §8 | observability decisions linked |
| B0 | docs/build/b0-execution-evidence.md | skeleton proof captured |
| Post-B0 | `/ai-scaffold skills observability` | generated logging/tracing/metrics/apm constraints |
| Validation | `/ai-validate gate discover-to-build` + `skeleton-to-expand` | intent + proof checked |

## 9. Open Questions And Deferred Decisions

| Item | Why deferred | Owner | Target phase |
|---|---|---|---|
| OTEL backend (Tempo/Jaeger/Datadog) | infra not decided | IT | 1C/B0 |
| API latency SLO targets | need baseline | Dev | S2 |
| Audit retention period | legal/PDPA input | DPO | B2 |

## 10. Human Approval

| Approver | Role | Date | Decision | Notes |
|---|---|---|---|---|
| Rungsan Suyala | Tech Lead / Architect | 2026-06-25 | pending | submitted with 1C package |
| (ABC) | Product Owner | | pending | |
