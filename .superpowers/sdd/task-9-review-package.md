# Task 9 review package (uncommitted)

Review only Task 9 admin bundle + UI. Do not re-review ingest or shop wiring.

## Created
- `lib/db/analytics-bundle-rules.ts`
- `lib/db/analytics-bundle-rules.test.ts`

## Modified
- `lib/db/analytics.ts`
- `lib/db/analytics-traffic-rules.ts` (`buildLandingPages`)
- `lib/db/analytics-traffic-rules.test.ts`
- `components/admin/analytics-console.tsx`
- `package.json`

Read those files. Do not mutate. Do not re-run full suite.

Named risks:
1. Locked copy exact? Retention banner, Converted helper, delivered table title, funnel headings.
2. Tabs order: Overview · Products · Cities · Customers · Traffic · Funnel · Insights · Query
3. Overview NA list no longer includes Visitors and web funnel
4. `!trafficRangeAvailable` → null shop/session fields, deliveredBySource still filled, fulfillment-only insights
5. T-14 `buildOrderFunnel` still used for COD block; no % across shop→COD gap
6. Unique visitors from cohort distinct visitor_id, not visitors table
