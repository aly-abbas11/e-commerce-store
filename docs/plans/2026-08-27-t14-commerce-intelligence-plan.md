# Plan: T-14 Commerce intelligence

## 1. Plain summary

Add an admin Analytics page that treats **delivered orders** as real money. Placed revenue stays visible but is labeled as not realized. Missing sources show Not available. Practice orders are excluded.

## 2. Goal

You can answer delivered profit, city cancel rate, delivery rate, reorder rate, and funnel drop from stored orders.

## 3. In scope

Executive KPIs, product and city tables, customer cohorts, operational funnel, whitelist query builder, saved reports, drilldown, admin cost field, admin-only APIs.

## 4. Out of scope

Rebuild orders/checkout/products/tracking. Visitor analytics. Ad spend / ROAS. Confirmed / out-for-delivery / returned statuses. Materialized tables. Public cost or profit.

## 5. Who this is for

Store owner in `/admin`.

## 6. How it works today

Home shows today-only counts. No date-range delivered revenue. No product profit.

## 7. How it will work after

`/admin/analytics` with Karachi date ranges. Click a total to see the orders.

## 8. Chosen approach

Server-side aggregation over existing orders + status history. Whitelist query builder (no SQL). cost_price on products, never mapped to the shop.

## 9. Other options we considered

SQL console (unsafe). Third-party BI (extra ops). Guessing visitor numbers (forbidden).

## 10. Codebase contact points

See `docs/modules/analytics/ANALYTICS_IMPLEMENTATION.md`.

## 11. Screens and workflow impact

Admin Analytics is new. Product form cost is optional. Shop unchanged.

## 12. Data and rules

See spec `docs/superpowers/specs/2026-08-27-t14-commerce-intelligence-design.md`.

## 13. Edge cases and decisions

Demo excluded. Incomplete cost → profit Not available. No email → skip customer merge. Unknown metric → 422. Drilldown strips email/phone.

## 14. Step-by-step build order

Rules + tests → migration → APIs → UI → verify with real orders.

## 15. Impact and risks

Product save needs `cost_price` column. Push the T-14 migration before relying on profit.

## 16. Test checklist

Unit tests for revenue, demo skip, SQL rejection, city normalize, funnel, no PII in drilldown, mapProduct omits cost. Manual: `/admin/analytics` after login.

## 17. Open questions

None. Owner away; recommended path locked.

## 18. Approval

- [x] Owner away: implement recommended path (2026-08-27)
