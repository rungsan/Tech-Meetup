# Golden Example — Patterns from Walking Skeleton

**Source:** US-004 — สร้างรายการตรวจสภาพคันเดียว
**Extracted:** 2026-06-25
**Tech Stack:** Next.js (App Router) + TypeScript + Prisma + PostgreSQL (D-001)

> This is the **law** for B1+ AI-generated modules. New stories must follow these patterns.

## File Structure

```
src/
  app/
    (abc)/                 # authenticated ABC route group (layout = session guard)
      <domain>/
        page.tsx           # server component (list/detail) or "use client" form
        [id]/page.tsx
    api/v1/<resource>/
      route.ts             # REST handler (GET/POST)
      [id]/route.ts        # item handler
    login/page.tsx
  lib/
    <domain>/
      schema.ts            # Zod request contracts
      service.ts           # business logic (use-cases) — NO transport here
    db.ts                  # Prisma singleton
    api.ts                 # apiOk / apiError / newRequestId
    session.ts             # getSessionUser()
    logger.ts              # pino (PII-redacted)
    observability/otel.ts  # tracer + domain metrics
  components/ui/           # shared UI primitives (token-only)
```

## Naming Conventions

- Files: kebab-case routes; `schema.ts` / `service.ts` per domain under `src/lib/<domain>/`.
- API routes: `/api/v1/<plural-resource>` (D-003).
- DB: snake_case columns via Prisma `@map`; model = PascalCase; `cuid` PK (D-004).
- Tests: `*.test.ts` (unit, vitest) · `e2e/us-NNN-*.spec.ts` (Playwright).

## Route Handler Pattern (transport — thin)

```ts
// src/app/api/v1/inspections/route.ts
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return apiError("UNAUTHENTICATED", "ยังไม่ได้เข้าสู่ระบบ");

  const parsed = createInspectionSchema.safeParse(await req.json());
  if (!parsed.success) {
    const fields = Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), i.message]));
    return apiError("VALIDATION_ERROR", "ข้อมูลไม่ผ่านการตรวจสอบ", fields);
  }
  const job = await createInspection(parsed.data, { userId: user.id, requestId: newRequestId() });
  return apiOk({ id: job.id, jobNo: job.jobNo, status: job.status }, 201);
}
```
**Rule:** handler = auth → validate (Zod) → call service → map result/error. No business logic or Prisma in the handler.

## Service Pattern (business logic + observability + audit)

```ts
// src/lib/inspection/service.ts
export async function createInspection(input, ctx) {
  const log = requestLogger(ctx.requestId);
  return tracer.startActiveSpan("inspection.create", async (span) => {
    log.info({ jobNo }, "inspection.create start");          // structured, no PII
    try {
      const job = await db.$transaction(async (tx) => {       // multi-table write
        return tx.inspectionJob.create({ data: { /* + vehicle + customer + history */ } });
      });
      createJobCounter.add(1, { result: "success" });          // metric
      createJobDuration.record(performance.now() - started, { result: "success" });
      log.info({ jobId: job.id }, "inspection.create done");
      return job;
    } catch (err) { /* counter result:error + log.error + span ERROR */ throw err; }
    finally { span.end(); }
  });
}
```
**Rules:** every state-changing service ⇒ (1) span, (2) outcome counter + latency histogram, (3) entry+completion structured logs (no PII — log ids/job_no), (4) write a `JobHistory` audit row inside the transaction.

## Validation / Zod Pattern

`src/lib/<domain>/schema.ts` exports a Zod schema; domain rules live here (e.g. plate `^[^\s-]+$`, conditional required via `.refine`). Reused by the route handler AND unit tests.

## Error Contract

`{ error: { code, message, fields? } }` via `apiError(code, msg, fields)` — codes/status in `src/lib/api.ts` (D-003).

## Database Pattern

Prisma singleton (`src/lib/db.ts`); writes that touch >1 table use `db.$transaction`; `@map` snake_case; audit via `JobHistory`.

## UI Pattern

- Pages under `(abc)/` inherit the session-guard layout.
- Forms = `"use client"`, submit via `fetch`, render field errors from the 422 `fields` map.
- **Tokens only** — `bg-card`, `text-fg`, `border-line`, `text-danger`, `bg-primary text-primary-fg`. Never raw hex / `text-gray-*` (D-007 contract).

## Test Pattern

- Unit (vitest): test the Zod schema / pure service logic — deterministic, no network.
- E2E (Playwright): `e2e/us-NNN-*.spec.ts` — happy path (UI click-through) + ≥1 error path; assert read-back.

## Anti-Patterns (DO NOT)

- ❌ Business logic or Prisma calls inside route handlers.
- ❌ Logging PII (names, mobile, plate, chassis, images).
- ❌ Raw colors/fonts in components (use preset tokens).
- ❌ State change without a `JobHistory` audit row.
- ❌ Returning ad-hoc error shapes (always `apiError`).

## Checklist for New Modules (B1+)

- [ ] `schema.ts` (Zod) + `service.ts` (logic) under `src/lib/<domain>/`
- [ ] Route handler: auth → validate → service → `apiOk`/`apiError`
- [ ] Multi-table writes in `$transaction` + audit row
- [ ] Span + counter + histogram + structured logs (no PII)
- [ ] Page uses session-guard layout + semantic tokens
- [ ] Unit test (schema/logic) + E2E (`e2e/us-NNN-*.spec.ts`)
- [ ] Demo evidence recorded in story-index before `done`
