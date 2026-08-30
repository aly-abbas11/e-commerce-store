# Task 7 Report — Ingest route, cleanup, checkout attach

## Status: DONE

## Files

| Action | Path |
|--------|------|
| Created | `app/api/analytics/event/route.ts` |
| Created | `lib/db/analytics-cleanup-rules.ts` |
| Created | `lib/db/analytics-cleanup-rules.test.ts` |
| Created | `lib/db/analytics-cleanup.ts` |
| Created | `lib/db/analytics-checkout-rules.ts` |
| Created | `lib/db/analytics-checkout-rules.test.ts` |
| Created | `lib/db/analytics-checkout.ts` |
| Modified | `lib/db/analytics-ingest-rules.ts` |
| Modified | `lib/db/analytics-ingest-rules.test.ts` |
| Modified | `app/api/checkout/route.ts` |
| Modified | `lib/db/store.ts` (`updateOrderAttributionRow` only; INSERT unchanged) |
| Modified | `package.json` (`test` script) |
| Modified | `lib/db/analytics-traffic-rules.ts` (tsc `Set` iteration) |
| Modified | `lib/db/analytics-insight-rules.ts` (tsc `Map` iteration) |

Not modified (by design): `lib/order-store.ts` `NewOrderInput`, `createOrderRow` INSERT. Attribution is a post-persist UPDATE so checkout never depends on analytics columns.

## Behavior

- Public ingest always HTTP 200 `{ ok: true }`. Parse/origin/rate-limit/DB errors fail-open. `is_demo` from `vg_demo` only.
- Sequence: JSON parse → origin → `shouldCollectPath` → 60/min IP-or-`vg_sid` (no `"unknown"`) → `parseIngestBody` → session resolve → first-touch on new session (capped; same-origin referrer → `direct`) → product/variant FK bind → event insert (`23505` ignore) → Set-Cookie `vg_vid` (~1y) / `vg_sid` (30m) → ~1/50 bounded cleanup (100 rows).
- Logs: `console.info("[analytics-ingest]", ingestLogFields(...))` — reason, name, normalized path only.
- Checkout: after successful `createOrder`, `attachOrderAttribution` in its own try/catch; missing/expired `vg_sid` or lookup/update errors leave snapshot null.

## TDD evidence

### RED

```text
$ npx tsx --test lib/db/analytics-cleanup-rules.test.ts lib/db/analytics-checkout-rules.test.ts lib/db/analytics-ingest-rules.test.ts

Error: Cannot find module './analytics-checkout-rules'
Error: Cannot find module './analytics-cleanup-rules'
✖ copies variant_id … Expected undefined to equal '33333333-…'
✖ treats a same-origin referrer as direct … actual 'referral' expected 'direct'
✖ ingestLogFields is not a function
✖ keepOriginalOnDuplicateEventId is not a function
✖ buildFirstTouch is not a function

ℹ tests 22
ℹ pass 15
ℹ fail 7
```

### GREEN (focused)

```text
$ npx tsx --test lib/db/analytics-cleanup-rules.test.ts lib/db/analytics-checkout-rules.test.ts lib/db/analytics-ingest-rules.test.ts

ℹ tests 23
ℹ pass 23
ℹ fail 0
```

### GREEN (full suite)

```text
$ npm test

ℹ tests 154
ℹ pass 154
ℹ fail 0
```

### tsc

```text
$ npx tsc --noEmit
(exit 0)
```

First `tsc` run failed on pre-existing `Map`/`Set` iteration in Task 3–4 files (`analytics-insight-rules.ts`, `analytics-traffic-rules.ts`). Fixed with `Array.from(...)`. Re-ran those suites (28 pass) then `tsc` (exit 0).

## Self-review

- Checkout still succeeds if attach throws (inner catch in `attachOrderAttribution` + outer catch in checkout route).
- Ingest never returns a non-ok body.
- Logs do not include query strings, UTMs, click ids, emails, or checkout values.
- New tests appended to `package.json` `test`.
- `createOrderRow` INSERT has no attrib columns.
- No git commit. No `supabase db push`.

## Concerns

- Migration `20260828010000_first_party_analytics.sql` is still unpushed; ingest writes and checkout attach fail-open until tables/columns exist.
- No HTTP integration test for `POST /api/analytics/event` (unit tests cover pure helpers; route fail-open depends on live Supabase).
- In-memory rate limiter is per-instance (matches spec for serverless).
- Duplicate `event_id` keep-original is enforced by unique index `23505` plus a pure helper; no live DB test of that path.
- `NewOrderInput` was not extended (controller: attrib via UPDATE after persist).
