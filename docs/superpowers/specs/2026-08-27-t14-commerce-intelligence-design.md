# T-14 — Commerce intelligence (COD)

## Goal

Admin can see **delivered revenue** (money from orders that actually arrived), not only orders placed. Practice orders are excluded. Missing data shows **Not available**, never a guess.

## Locked decisions (owner away — recommended path)

- Existing statuses only: New, Processing, Shipped, Delivered, Cancelled. Confirmed / Out for delivery / Returned = **Not available**.
- Do not change checkout or the order pipeline.
- Timezone: **Asia/Karachi** calendar days.
- **Placed** = order `createdAt` in range.
- **Delivered / shipped / cancelled / processing counts in range** = first time that status appears in **status history** (else `statusUpdatedAt` if that is the current status).
- **Delivered revenue** = sum of those delivered-in-range order totals. Cancelled money is never delivered revenue.
- **Delivery rate** = of orders placed in range, share that are **currently** delivered.
- **Cancel rate** = of orders placed in range, share that are **currently** cancelled.
- Demo/`isDemo` orders excluded.
- **cost_price** on products, admin only, never on public product JSON.
- **Delivered gross profit** = delivered revenue − (cost × qty on those delivered orders). Incomplete if any line has no cost.
- Contribution profit / visitors / ads / ROAS / UTM = **Not available** (no source).
- Web funnel (visitor → cart) = **Not available** until T-05.
- Operational funnel uses history: Placed → Processing → Shipped → Delivered.
- Customer key = trimmed lowercase email (same as track). No phone merge.
- Query builder is a whitelist (metric + dimension + range). No SQL.
- Drilldown lists order number, date, status, city, total — **no email or phone**.
- Server-side aggregation; no materialized tables yet (volume is small).
- Admin-only APIs.

## UI

Same admin language as Home. Lead tile is **Delivered revenue**. Placed revenue is labeled “not realized”. Tabs: Overview, Products, Cities, Customers, Funnel, Query. Range buttons: Today, Yesterday, Last 7, Last 30, This month, Custom. Product form: **Your cost (hidden from shop)**.

## Impact

| Surface | Today | After T-14 | Gap |
|---|---|---|---|
| Shop / public product JSON | no cost | still no cost | none |
| Admin Home | today snapshot | unchanged + link to Analytics | none |
| Admin Orders | source of truth | consumed, not rebuilt | none |
| Admin Products | no cost field | optional internal cost | admin-only |
| Analytics APIs | none | admin cookie required | 401 if unsigned |
| Customer PII on analytics | n/a | order number/city/total only | emails never returned |

Follow-ups (not this task): visitor funnel after T-05; ad spend/ROAS when a spend source exists.

## Phase breakdown

1. Rules + tests — `lib/db/analytics-rules.ts`.
2. `cost_price` + saved reports migration.
3. Admin APIs under `/api/admin/analytics`.
4. `/admin/analytics` UI + cost field + nav.
5. Verify with real orders; show Not available where empty.

## Approval

Owner away 2026-08-27: recommended COD path locked and implemented.
