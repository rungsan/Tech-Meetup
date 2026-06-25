---
target: docs/design/discover-to-build-evidence.md
phase: 1C
gate: discover-to-build
date: "2026-06-25"
---

# Discover to Build Evidence (G1)

> G1 ผ่านด้วย **หลักฐาน + human approval** ไม่ใช่แค่เจตนา.

## Hard Criteria Evidence

| Criterion | Status | Required Artifact | Evidence Link | Human Notes |
|---|---|---|---|---|
| H1 Project charter approved | **pass** | docs/charter.md | [charter.md](../charter.md) (status: approved 2026-06-25) | TBD items (deadline/budget/infra) deferred, not blocking |
| H2 Requirements complete | **pass** | tracking/story-index.md | [story-index.md](../../ai-sdlc/tracking/story-index.md) — 45 stories, ACs in [USER_STORY.md](../USER_STORY.md), SP+MoSCoW+deps | Must 50.2% ≤60% |
| H3 Architecture documented | **pass** | docs/design/architecture-package.md | [architecture-package.md](architecture-package.md) + [architecture.md](../architecture.md) (C4 L1/L2/L3) | data + API linked |
| H4 Tech stack decisions recorded | **pass** | tracking/decision-log.md | [decision-log.md](../../ai-sdlc/tracking/decision-log.md) — D-001…D-007 | all accepted |
| H5 Walking skeleton scope defined | **pass** | architecture-package §9 | [§9](architecture-package.md) + D-005 + [workflow-walks C1=clear](workflow-walks.md) | US-004, layer coverage matrix |
| H6 Observability intent documented | **pass** | docs/design/observability-intent.md | [observability-intent.md](observability-intent.md) + architecture-package §8 + D-006 | 6 flows, B0 proofs |
| H7 UI foundation — visual contract (conditional-hard, UI present) | **pass** | docs/wireframes/design-system.md + ADR | [design-system.md](../wireframes/design-system.md) (preset trust-corporate) + D-007 + P0 wireframes [abc-login](../wireframes/abc-login.md)/[core-dashboard](../wireframes/core-dashboard.md)/[inspections-new](../wireframes/inspections-new.md) + app-shell variant + [_index](../wireframes/_index.md) | entry+dashboard+data-entry wireframed; preset logged as ADR |

Status values: `pass`, `fail`, `waived`. — **7/7 hard = pass**

## Soft Criteria Evidence

| Criterion | Status | Evidence Link | Notes |
|---|---|---|---|
| S1 NFRs documented | **pass** | [docs/nfr.md](../nfr.md) | 9 categories, measurable targets |
| S2 Critical flows + success signals | **pass** | [observability-intent §2](observability-intent.md) + [workflow-walks](workflow-walks.md) | OF-001…OF-006 |
| S3 UI wireframes for key screens | **pass** | [docs/wireframes/](../wireframes/_index.md) | app-shell + 3 skeleton screens + 25-screen inventory |
| S4 Risk register initialized | **pass** | [risks.md](../../ai-sdlc/tracking/risks.md) | R-001…R-003 |

## Gate Decision

| Field | Value |
|---|---|
| Automated check result | **PASS** (7/7 hard, 4/4 soft) |
| Human approval required | yes |
| Product owner decision | **approved** (2026-06-25) |
| Tech lead decision | **approved** (Rungsan Suyala, 2026-06-25) |
| Decision date | 2026-06-25 |
| Conditions / follow-up tasks | R-002 object storage (pre-B4), R-003 billing scheduler (pre-B3), Azure AD real integration (B2), api-spec.yaml formalized (B0) |

**G1 GATE: PASSED — proceed to B0 Walking Skeleton.**
