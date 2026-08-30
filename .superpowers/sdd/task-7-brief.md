### Task 7: Ingest route, cleanup, checkout attach

**Files:**
- Create: `app/api/analytics/event/route.ts`
- Create: `lib/db/analytics-cleanup-rules.ts` + `.test.ts` (cutoff timestamps)
- Modify: `app/api/checkout/route.ts`
- Modify: `lib/db/store.ts` `createOrderRow`
- Modify: `lib/order-store.ts` `NewOrderInput`

**Interfaces:**
- Consumes: Tasks 1â€“2, 6
- Produces: ingest handler; `attachOrderAttribution` best-effort; `planAnalyticsCleanup(now)`

`planAnalyticsCleanup(now)` returns `{ sessionLastActivityBefore: Date; visitorLastSeenBefore: Date }` (90 days / 365 days). Test those cutoffs.

Ingest route:

1. Parse JSON; on throw still `{ ok: true }`.
2. Origin check â†’ drop + log reason `origin`.
3. Path excluded (`/admin`, gadget) â†’ drop.
4. Rate limit 60/min/IP (`x-forwarded-for` first hop) else `vg_sid`; no unknown bucket.
5. `parseIngestBody`; fail â†’ drop + log.
6. Resolve session (cookies `vg_vid`, `vg_sid`, `vg_demo`).
7. If new session, apply sanitized attribution first-touch.
8. If product_id set, `select id from products where id =` ; if missing, null the relation (same for variant, and variant.product_id must match).
9. Insert event; unique violation on `event_id` â†’ ignore (do not update).
10. Set-Cookie vid/sid; `{ ok: true }`.
11. Occasionally (e.g. 1/50 requests) delete expired sessions then orphan visitors â€” **bounded** (e.g. `.limit(100)`).

Logs: `console.info("[analytics-ingest]", { reason, name, path })` where path is `normalizePathname` only. Test a helper `ingestLogFields` never includes `?`.

Checkout:

```ts
let persisted = await createOrder({ ...baseOrder, orderId });
// retries as today
if (persisted) {
  try {
    await attachOrderAttribution(orderId, request);
  } catch (err) {
    console.error("[analytics-checkout]", "attach failed");
  }
}
```

`attachOrderAttribution`: read `vg_sid`; if missing/expired/error, return. Else update order snapshot columns. **Must not throw into checkout catch** (inner try).

Unit-test `orderAttributionFromSession(session | null)` â†’ all-null vs copied fields. Missing session â†’ Unattributed mapping in traffic rules already tested.

- [ ] **Step 1:** Tests for cleanup cutoffs, log fields, `orderAttributionFromSession(null)` all null, duplicate event_id â€œkeep originalâ€ as a pure merge function if extractable.

- [ ] **Step 2â€“4:** Implement route + attach; `npm test`; `npx tsc --noEmit`

Manual check later: failed attach still returns order JSON.

## Controller notes (binding)

- Do **not** git commit. Do **not** run `supabase db push`.
- TDD: write failing tests first for cleanup cutoffs, `ingestLogFields`, `orderAttributionFromSession`, duplicate `event_id` keep-original.
- Append new test files to `package.json` `test` script.
- Checkout must never fail because analytics columns are missing (migration may not be pushed yet). Do **not** add attrib columns to `createOrderRow` INSERT. Add an UPDATE helper (e.g. `updateOrderAttributionRow`) and swallow missing-column / lookup errors.
- `is_demo` only from httpOnly `vg_demo` (`DEMO_COOKIE` / `isDemoRequest`), never JSON.
- Public ingest always HTTP 200 `{ ok: true }` — no session internals in the body.
- Cookies: `vg_vid` (~1 year), `vg_sid` (rolling 30 minutes / `SESSION_IDLE_MS`). httpOnly, SameSite=Lax, Secure in production. Mirror `demoCookieOptions()` style.
- Client first POST may include `attribution` (utm_*, click ids, referrer). Apply first-touch only on **new** session (`shouldApplyFirstTouch`). Truncate with existing caps (utm/campaign 80, click id 128, referrer 200, path 200).
- Task 1 follow-ups (do in this task):
  1. Parse `variant_id` UUID like `product_id` in `parseIngestBody`.
  2. Apply campaign/click-id caps when storing first-touch.
  3. Pass shop host into `normalizeSource` so same-origin referrer is **direct**, not referral. Add a test.
- Path exclude: `shouldCollectPath` from `lib/first-party-analytics.ts`.
- Origin: `isAllowedAnalyticsOrigin(origin, host)` using request Origin vs Host.
- Rate limit: module-level `createMemoryRateLimiter({ limit: 60, windowMs: 60_000, maxKeys: 5000 })`. IP = first hop of `x-forwarded-for`, else `vg_sid`. Never `"unknown"`.
- Duplicate event_id: unique violation (Postgres `23505`) → ignore, do not update.
- Cleanup: `planAnalyticsCleanup(now)` → `{ sessionLastActivityBefore, visitorLastSeenBefore }` = now−90d / now−365d. Occasional bounded delete (1/50, `.limit(100)`): sessions by `last_activity_at`, then visitors with no sessions and old `last_seen_at`.
- `ingestLogFields`: reason, name, `normalizePathname(path)` only — never query strings, UTMs, emails, click ids.
- `orderAttributionFromSession(null)` → all snapshot fields null. Non-null session copies source/medium/campaign/campaign_id/ttclid/fbclid/gclid + session/visitor ids.
- Use `getServiceClient()` for writes. Follow existing `app/api/checkout/route.ts` and `lib/db/store.ts` patterns.
- After implement: focused tests, then `npm test`, then `npx tsc --noEmit`.
- Report to `.superpowers/sdd/task-7-report.md`.
---
