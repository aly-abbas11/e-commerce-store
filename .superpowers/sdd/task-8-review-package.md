# Task 8 review package (uncommitted)

Review only Task 8 shop wiring. Do not re-review ingest/checkout attach.

## Created
- `components/analytics/first-party-tracker.tsx`

## Modified
- `lib/first-party-analytics.ts` (pageTypeFromPath, singleton, trackFirstParty, properties/variant_id)
- `lib/first-party-analytics.test.ts`
- `app/layout.tsx` (FirstPartyTracker live shop only)
- `app/product/[slug]/page.tsx`
- `app/checkout/page.tsx`
- `components/product/product-view-tracker.tsx`
- `components/cart/cart-provider.tsx`
- add-to-cart sites: add-to-cart, purchase-section, buy-now, sticky-add-to-cart, quick-view, product-card, frequently-bought-together, cart-upsell

## Not modified (must stay that way)
- `components/gadget/gadget-buy-box.tsx`
- `/product2` pages

Read those files. Do not mutate. Do not re-run full suite.
