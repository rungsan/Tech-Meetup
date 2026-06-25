# AI-SDLC Framework v3 — Generic Agent Instructions

> **Version:** 3.3
> **Last Updated:** 2026-06-09
> **Audience:** Any AI agent runtime (Claude, Gemini, Codex, open-source agents)
> **See Also:** [docs/framework-reference.md](docs/framework-reference.md), [CLAUDE.md](CLAUDE.md), [GEMINI.md](GEMINI.md)

This file is the **runtime-agnostic** agent contract. Codex should use this file directly. If you are Claude Code, also load `CLAUDE.md`. If you are Gemini, also load `GEMINI.md`.

## First Action — ALWAYS

Read `ai-sdlc/tracking/project-state.md` before doing anything.

## Commands

All 37 commands live under `ai-sdlc/commands/`. Each has a YAML frontmatter with `reads:`, `updates:`, `requires_approval:`, `token_budget:`, `phase_constraint:`. Use `/ai-help` when the runtime supports slash commands; otherwise read and execute `ai-sdlc/commands/ai-help.md`. See `docs/framework-reference.md` for the canonical catalog.

### Codex / direct-file invocation rule

If the runtime does **not** provide a native slash-command registry:

1. map `/ai-foo` to `ai-sdlc/commands/ai-foo.md`
2. read the command frontmatter first
3. load only the files required by the selected mode/flag
4. execute the command instructions
5. update source-of-truth files
6. run `/ai-sync` or execute `ai-sdlc/commands/ai-sync.md`

Example Codex-style request:

- "Execute `ai-sdlc/commands/ai-init.md`"
- "Run the `/ai-build` command for story US-042 by following `ai-sdlc/commands/ai-build.md`"

## How to Work

1. Read `ai-sdlc/tracking/project-state.md`.
2. Read `ai-sdlc/playbooks/_index.md`.
3. Read the current phase file under `ai-sdlc/phases/`.
4. Execute the appropriate command.
5. Update `ai-sdlc/tracking/project-state.md` after any state change.
6. Run `/ai-sync` to refresh derived files.

## File Paths

All framework files live under `ai-sdlc/`. Command frontmatter paths (`tracking/...`) are relative to that directory.

## Tracking Rules

**Source-of-truth:** `tracking/project-state.md`, `tracking/story-index.md`, `tracking/changelog.md`, `tracking/decision-log.md`, `tracking/risks.md`, `tracking/anti-patterns.md`.

**Derived (never write directly):** `tracking/dashboard-data.json`, `tracking/sprint-backlog.md`, `tracking/rtm.md`.

**Session:** `tracking/recovery.md`.

## Token Efficiency

1. Frontmatter-first reading.
2. Honor `token_budget`.
3. Conditional reads — only load what the active mode needs.
4. Cache shared context once per multi-step command.
5. Never write derived files.

## Approval Rules

See `ai-sdlc/config/workflow-rules.yaml`. Reads + in-sprint code edits are autonomous; adding stories, architecture changes, gate passage, and phase transitions require human approval.

## Session Recovery

On interrupted restart: read `ai-sdlc/tracking/recovery.md` -> read `project-state.md` -> resume -> clear recovery when done.

## Evidence Packages

Quality gates verify canonical evidence package completeness before phase transitions:

- **Discover-to-B0**: charter, requirements, architecture-package, observability-intent, b0-readiness-checklist
- **Ship S1–S3**: s1-validation-evidence, s2-hardening-evidence, s3-deploy-readiness
- **Evolve**: feedback-log, iteration-plan, tech-debt-register, performance-review

ANY-phase commands (`ai-status`, `ai-help`, `ai-risk`, `ai-change`, `ai-handoff`) read this package readiness to provide informed guidance.

## Generated Skills

`/ai-scaffold skills` produces project-specific pattern overlays in `ai-sdlc/playbooks/generated/` (DB / API / UI / design tokens + four observability files). Most project-specific overlays are strongest after B0. Observability skills should be grounded in Discover intent first and then refreshed after B0 so downstream commands consult proven operational constraints automatically.

## Full Reference

`docs/framework-reference.md` is the single source of truth for commands, phases, gates, playbooks, extensions, and matrices.
