# Task 9 Report — Admin bundle + UI

## Status: DONE

## Files

| Action | Path |
|--------|------|
| Created | `lib/db/analytics-bundle-rules.ts` |
| Created | `lib/db/analytics-bundle-rules.test.ts` |
| Modified | `lib/db/analytics.ts` |
| Modified | `lib/db/analytics-traffic-rules.ts` |
| Modified | `lib/db/analytics-traffic-rules.test.ts` |
| Modified | `components/admin/analytics-console.tsx` |
| Modified | `package.json` — appended `lib/db/analytics-bundle-rules.test.ts` |

Not modified: `lib/db/analytics-rules.ts` (T-14 math), `app/api/admin/analytics/route.ts` (same GET).

## TDD evidence

### RED (`assembleAnalyticsBundle` / `buildLandingPages` missing)

```text
Error: Cannot find module './analytics-bundle-rules'
TypeError: buildLandingPages is not a function
ℹ tests 12  pass 10  fail 2
```

### GREEN (focused)

```text
npx tsx --test lib/db/analytics-traffic-rules.test.ts lib/db/analytics-bundle-rules.test.ts
ℹ tests 13  pass 13  fail 0
```

### tsc / full suite

```text
$ npx tsc --noEmit
(exit 0)

$ npm test
ℹ tests 163  pass 163  fail 0
```

New tests: 3 (`assembleAnalyticsBundle` ×2, `buildLandingPages` ×1).

## Bundle

- Outside 90-day window: `traffic.available === false`, session fields + `shopFunnel` null, `retentionNotice` true, `deliveredBySource` still filled, insights fulfillment-only.
- Inside window: visitors = distinct live cohort `visitor_id`; sessions = cohort length; converted from shop funnel; `bySource` / `landingPages` / `shopFunnel` filled.
- `webFunnel` removed. Loader fail-opens on missing analytics tables/columns (empty arrays).

## Commits

None (per instructions). No `supabase db push`.

## Concerns

- Analytics tables may still be unpushed: Traffic shows zeros inside retention, not a 500.
- Missing attrib columns → all delivered rows Unattributed.
- `executive.unavailable.visitors` still exists for T-14 tests; Overview NA list no longer shows “Visitors and web funnel”.
- No browser pass (no DevTools MCP). UI verified by types + unit tests only.
