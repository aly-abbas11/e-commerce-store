# UI Plan: Commerce intelligence (T-14)

## 1. Plain summary

Admin Analytics page in the existing VoltGear admin look. Delivered revenue is the lead number. Missing data says Not available.

## 2. Links

- Spec: `docs/superpowers/specs/2026-08-27-t14-commerce-intelligence-design.md`
- Owner away: recommended COD path locked and implemented.

## 3. Goal

Staff can audit delivered money, products, cities, customers, and the order funnel without a new visual brand.

## 4. In scope (screens & surfaces)

- `/admin/analytics` with range buttons, tabs (Overview, Products, Cities, Customers, Funnel, Query), drilldown table, saved reports.
- Nav item **Analytics**.
- Product form field **Your cost (hidden from shop)**.
- Home line linking to Analytics.

## 5. Out of scope

Storefront, checkout, order pipeline, marketing dashboards, charts libraries.

## 6. Current app UI snapshot

Admin: cards, `h-11` buttons, muted labels, bordered tables, PKR via `formatPrice`, no purple SaaS chrome.

## 7. Research collage

Shopify Analytics (delivered vs placed as separate), COD ops reports that never treat placed as cash. Kept local admin language instead of a new BI skin.

## 8. Chosen direction

Match T-13 Home: tiles + tables + click-through. Primary tile is delivered revenue. Placed revenue has “not realized” helper text.

## 9. Directions we did not pick

Embedded Metabase / SQL editor (unsafe). Chart-heavy dashboard (no volume yet).

## 10. Visual mockup index

Text implementation against existing admin; no generated mockups (owner away).

## 11. Design tokens

Reuse existing admin tokens. No new palette.

## 12. Layout system

Admin shell. Range buttons wrap. Tables `overflow-x-auto`.

## 13. Component inventory

- Range buttons (existing Button)
- Metric tiles (Card)
- Tabs (existing)
- Tables (same as Orders)
- Query selects (native, same as product category)
- Drilldown table linking to `/admin/orders/[orderId]`

## 14. Screen-by-screen spec

See `docs/modules/analytics/ANALYTICS_IMPLEMENTATION.md`.

## 15. User flows (UI steps)

Pick range → read delivered revenue → click the number → see orders → open an order.

## 16. Accessibility

Buttons have labels. Tables have headers. Focus rings on tiles. Tabs are keyboard-accessible.

## 17. Content & microcopy

“Delivered revenue”, “Placed revenue — not realized”, “Not available”, “Your cost (hidden from shop)”.

## 18. Build order (UI only)

Shipped with T-14 APIs.

## 19. Impact on existing screens

Home gains a link. Product form gains cost. Shop unchanged.

## 20. Open questions

None — owner asked to lock recommended UI.

## 21. Approval

- [x] Owner away: implement recommended admin language (2026-08-27)
