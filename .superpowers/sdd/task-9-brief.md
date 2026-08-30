### Task 9: Admin bundle + UI

**Files:**
- Modify: `lib/db/analytics.ts` `loadAnalyticsBundle`
- Modify: `components/admin/analytics-console.tsx`
- Modify: `app/api/admin/analytics/route.ts` only if types need no change (same GET)

Replace `webFunnel: "Not available"` with structured payload:

```ts
traffic: {
  available: boolean;
  visitors: number | null;
  sessions: number | null;
  convertedSessions: number | null;
  bySource: { source: string; sessions: number }[] | null;
  landingPages: { path: string; sessions: number }[] | null;
  deliveredBySource: { source: string; orders: number; deliveredRevenue: number }[];
};
shopFunnel: ShopFunnelStep[] | null;
insights: InsightCard[];
retentionNotice: boolean;
```

When `!trafficRangeAvailable`, set shop/session fields null/`available: false`, still fill `deliveredBySource` from T-14 delivered orders. `insights`: fulfillment-only when traffic NA; else full catalog.

UI:

- Tabs: Overview, Products, Cities, Customers, Traffic, Funnel, Insights, Query
- Overview: remove “Visitors and web funnel” from the NA list
- Retention banner copy **exactly** from spec when `retentionNotice`
- Traffic tiles + helper on Converted Sessions
- Delivered table title: **Delivered Orders by Source — delivered during selected period**
- Funnel: two headings **Shop conversion — session cohort** and **COD / fulfillment — order cohort**; `% of previous` only when `conversionFromPrevious != null` and not across the unit gap
- Insights cards

- [ ] **Step 1:** Unit-test bundle assembly helper `assembleAnalyticsBundle(...)` if extracted; otherwise test traffic+insights composition in traffic/insight tests (already done) and implement UI.

- [ ] **Step 2–4:** Implement; `npx tsc --noEmit`; `npm test`

## Controller notes (binding)

- Do **not** git commit. Do **not** `supabase db push`.
- Do **not** rewrite T-14 money/lifecycle math in `lib/db/analytics-rules.ts`. Keep existing Overview tiles and COD funnel from `buildOrderFunnel`.
- Extract `assembleAnalyticsBundle(...)` as a **pure** function (no DB) and unit-test:
  1. When `trafficRangeAvailable` is false: `traffic.available === false`, visitors/sessions/converted/bySource/landingPages/shopFunnel are null, `retentionNotice === true`, `deliveredBySource` still filled, insights fulfillment-only (`buildInsights` with `trafficAvailable: false`).
  2. When available: visitors = `countCohortVisitors` (distinct visitor_id, live cohort), sessions = cohort length, convertedSessions from shop funnel converted step, bySource/landingPages/shopFunnel filled. Missing values render as **Not available**, never `0` when unavailable.
- Locked UI copy:
  - Retention: `First-party traffic data is available for the last 90 days only. Order and delivered-revenue analytics remain available for this range.`
  - Converted Sessions helper: `Sessions linked to ≥1 successful order`
  - Delivered table title: `Delivered Orders by Source — delivered during selected period`
  - Funnel headings: `Shop conversion — session cohort` and `COD / fulfillment — order cohort`
- Tabs **in this order**: Overview · Products · Cities · Customers · Traffic · Funnel · Insights · Query
- Overview NA list: remove `Visitors and web funnel`. Keep Confirmed, Out for delivery, Returned, Marketing/ROAS, Contribution profit.
- No conversion % between converted sessions and orders (do not mix shop % with COD funnel).
- Unattributed ≠ Direct: `buildDeliveredBySource` already maps missing snapshot to Unattributed.
- If analytics tables/columns are missing (migration unpushed), fail-open: treat as no sessions/events (empty arrays), still return T-14 bundle. Do not 500 the admin page.
- Load live (`is_demo = false`) sessions + their events via `getServiceClient()`. Unique visitors must **not** be `COUNT(analytics_visitors)`.
- Landing pages: if Task 3 has no helper, add `buildLandingPages(sessions, range)` grouping `landingPath` (skip empty), same sort as bySource. Test it.
- Insights: use `buildInsights` from `lib/db/analytics-insight-rules.ts`. When traffic NA, pass `trafficAvailable: false` so only fulfillment rules 8–9 can fire. Prior shop window must also sit inside retention for HIGH.
- Insights UI: one card per id; show title, HIGH/MEDIUM, evidence, possible causes, recommended checks. No visitor ids, emails, phones.
- Match existing analytics-console visual language (MetricButton, Card, tables). Do not split the file unless it becomes unreadable.
- Remove `webFunnel` from the bundle type (replaced by `traffic` + `shopFunnel`).
- Append new tests to `package.json` `test` script.
- `npx tsc --noEmit` and `npm test`.
- Report: `.superpowers/sdd/task-9-report.md`
