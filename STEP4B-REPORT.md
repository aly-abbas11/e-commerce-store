# STEP 4B — Variant Cart & Server Checkout Integrity

Phase: Step 4B of the VoltGear store build.
Scope: make a selected product variant trustworthy end-to-end — PDP → Cart → Checkout →
server-side order validation → stored order — with the server as the single authority for
price, stock, availability, ownership and totals. No redesign of existing UI.

---

## 1. Git State Before
Branch `main`. Pre-existing uncommitted work from earlier steps was preserved untouched; nothing
was staged or committed during this phase. Baseline status before this phase: 53 lines (52
pre-existing modified files + untracked `STEP4-REPORT.md`). No new commits, pushes, resets or
clean operations were performed.

## 2. Cart Architecture Before
`components/cart/cart-provider.tsx` stored lines in `localStorage` under `ecomm-cart`. Each
`CartItem` was `{ slug, name, price, image?, quantity }`. Cart identity was the **slug alone**:
`addItem` merged by slug, `removeItem`/`updateQuantity` operated on slug, the count was the sum of
quantities. Consequence: two variants of one product would merge into a single line, a variant
could not be distinguished from the base product, and the client price was the only price carried
into checkout.

## 3. Order API Before
`app/api/checkout/route.ts` accepted `items[{slug,name,price,quantity}]`, `customer`,
`payment`, and client-computed `subtotal`/`shipping`/`total`. It used the client `subtotal` when
present, otherwise a client-price-derived subtotal; stored `items` verbatim (client names and
prices); and never resolved the product, variant, stock or current price. A request with
`{ slug, price: 1 }` or a forged `total: 1` would have persisted those values. `OrderItem` had no
variant fields; `sanity/schemas/order.ts` did not exist (orders are `order` documents inside
`sanity/schemas/commerce.ts` with item fields slug/name/price/quantity).

## 4. Variant Cart Identity
`CartItem` gained optional `variantKey`, `variantName`, `variantSku`. A new `cartLineKey(item)`
helper returns `slug::variantKey` for variant lines and `slug` otherwise. `addItem`, `removeItem`
and `updateQuantity` now key on the line identity, so variants never merge into the base line or
into each other. Legacy stored entries without `variantKey` remain valid non-variant lines.

## 5. Multi-Variant Cart
Black ×2 + White ×1 of the same product now produce two distinct lines (verified in both the
direct-API and browser suites). Removing the White line leaves the Black line intact; quantities
are tracked per line; the navbar badge remains the sum of quantities (count semantics preserved).

## 6. Cart Persistence
Persistence logic in `CartProvider` is unchanged (hydrate on mount, persist on change, same
`ecomm-cart` key). The browser suite reloads the page mid-journey and confirms the variant line,
variant name and quantity survive the reload and render in the drawer.

## 7. Buy Now Variant
`BuyNow` now passes the selected variant's `variantKey`/`variantName`/`variantSku` (and variant
price) into the cart when the product has variants, so a non-default variant flows straight into
checkout. The sticky CTA uses the unambiguous default variant when one exists and is otherwise
suppressed. Verified: selecting White then Buy Now lands on `/checkout` with a White line
(`variantKey: variant-white`, price 7,500) in the cart.

## 8. Server Product Resolution
New `lib/checkout-server.ts` resolves every checkout line against Sanity at order time via the
write client (token, uncached) so the freshest published document is used, with a storefront-fetch
fallback. Client-provided `name` and `price` on items are ignored entirely.

## 9. Server Variant Resolution
The server matches `variantKey` against the product's own `variants` by `_key` (with `sku` as an
accepted alias). A variant key that does not exist, or belongs to a different product
(cross-product key), is rejected with a 400. A line for a variant product that omits `variantKey`
is rejected — there is no silent fallback to the default variant.

## 10. Server Price Resolution
Unit price is derived server-side: `variant.price ?? product.price`, validated to be a finite
positive number. Line totals and the subtotal are computed from these server prices, so the client
price is never trusted.

## 11. Price Tampering
Direct-API test: `{ slug, price: 1, variantKey: "variant-black", quantity: 1 }` (real variant
price 4,999) is accepted but the stored order line records 4,999 with `lineTotal` 4,999. A second
case against a legacy product (`price: 1` for `voltgear-pro-s2`, real price) stores the real price.
A fake `subtotal: 1, shipping: 1, total: 1` is likewise ignored; the server writes its own totals.

## 12. Stale Price
An order placed after the variant price moves 7,500 → 8,250 is stored at the **current** 8,250
with `lineTotal` 8,250, even though the browser cart still displayed 7,500. The checkout response
returns server totals, and the order-confirmation screen renders the server total (Rs 8,250).

## 13. Server Stock Validation
Every resolved line is checked against the current stock state via `lib/stock.ts`
(`in-stock`/`low-stock` purchasable, `out-of-stock` rejected). The product-level status is used for
non-variant lines; the variant status for variant lines.

## 14. Stale Stock
A variant that becomes `out-of-stock` after the item was added to the cart is rejected at order
time with the customer-safe message "One of your items is sold out. Please remove it and try
again." The browser test confirms no order is created and the user sees that message (no raw
error/stack).

## 15. Quantity Validation
Quantities are validated server-side: must be an integer between 1 and 99. `0`, `-2`, `1.5` and
`100` are all rejected with a 400.

## 16. Order Total Integrity
`subtotal`, `shipping` and `total` are computed exclusively on the server from resolved lines.
The client's `subtotal`/`shipping`/`total` are never read. The stored order's subtotal, shipping
and total equal the server-computed values, and the success screen shows the server total.

## 17. Shipping Threshold
Shipping is derived from the **server-resolved subtotal** against the current site settings
(free-shipping threshold and fee from `siteSettings`, normalized through `normalizeSettings`).
Verified: 4,999 subtotal → 199 shipping; 17,498 subtotal → free shipping.

## 18. Order Schema Changes
Additive only. The `order` document's item objects in `sanity/schemas/commerce.ts` gained optional
`variantKey`, `variantName`, `variantSku` and `lineTotal`. No existing field was renamed or
removed, so old orders and the Sanity Studio keep working.

## 19. Stored Order Verification
Stored order lines for a White ×2 checkout contain `slug`, `name` (product snapshot), `price`
7,500, `quantity` 2, `variantKey "variant-white"`, `variantName "White"`, `variantSku
"VG-TST-WHT"` and `lineTotal` 15,000; order subtotal 15,000, shipping 0, total 15,000. Multi-line
orders store Black (`lineTotal` 9,998 for qty 2) and White (`lineTotal` 7,500) as distinct rows.

## 20. Order Confirmation / Email
The checkout route emails the customer with server-derived item names, prices and quantities plus
the variant name (`"Variant Test Product — White × 2"`). The customer track page
(`/track`, `components/orders/track-order.tsx`) renders `Name — VariantName` per line and the order
lookup API (`app/api/orders/[orderId]`) forwards `variantName`.

## 21. Cart Drawer / Cart Page / Checkout Display
Cart drawer, `/cart` page and checkout step-0 and order-summary now key lines by `cartLineKey` and
render the variant name under the product name; remove buttons are labelled with the variant
(`Remove <Product> <Variant>`) for accessible removal of the correct line.

## 22. ProductCard / QuickView / FBT Safety
New `getDefaultVariant()` in `lib/stock.ts` returns the single `isDefault` variant only when
exactly one exists. ProductCard, QuickView, the cart upsell and the FBT "Complete Your Setup" only
auto-add a variant when that unambiguous default exists; otherwise variant products surface
"View Options" (linking to the PDP) and are excluded from direct-add/upsell lists. FBT's current
product likewise uses the default variant or disables "Add All to Cart" with an explanatory title.

## 23. Legacy Regression
Products without variants are unaffected: their checkout lines carry no variant metadata, prices
resolve from the product price, and the full legacy COD flow (Section C / H / J of the UI suite,
the admin suite, and the 763 SSR checks) still passes unchanged.

## 24. Direct API Tampering Tests
New admin-suite section "I. Checkout tampering (direct API)" covering: fake variant price, fake
base price, forged totals, nonexistent variant, cross-product variant, sold-out variant, invalid
quantities (0/-2/1.5/100), ambiguous variant product without a variant key, stale price, stale
stock, multi-variant line math, gift-wrap fee, empty cart, and a line with no slug. Each positive
case verifies the stored order via the token client; each negative case verifies the 400.

## 25. Fixture Strategy
Each run creates a disposable "Variant Test Product" (base 5,000) with Black
(`variant-black`, `VG-TST-BLK`, 4,999, in-stock, `isDefault`), White (`variant-white`,
`VG-TST-WHT`, 7,500, in-stock) and Sold Out (`variant-sold`, `VG-TST-SOLD`, 8,000, out-of-stock).
Slugs are unique per run (`vg-variant-tamper-*` for the API suite, `vg-variant-ui-*` for the
browser suite) so runs never collide. The browser suite polls the CDN until the new PDP is served.

## 26. Fixture Cleanup
Both suites delete the fixture product and all orders/email events/review submissions they created
in `finally`-style cleanup sections, then assert: zero fixture products by id and by slug, zero
orders for the test emails, and the dataset restored to 4 orders / 4 email events / 0
review-submissions. A standalone post-run check confirmed the same.

## 27. Files Changed
`lib/types.ts` (OrderItem variant fields), `components/cart/cart-provider.tsx` (line identity),
`components/cart/cart-drawer.tsx`, `app/cart/page.tsx`, `app/checkout/page.tsx` (keys, variant
display, payload, server-total success screen), `components/product/purchase-section.tsx`,
`components/product/buy-now.tsx`, `components/product/sticky-add-to-cart.tsx`,
`components/product/product-card.tsx`, `components/product/quick-view.tsx`,
`components/product/frequently-bought-together.tsx`, `components/cart/cart-upsell.tsx`,
`lib/stock.ts` (getDefaultVariant), `sanity/schemas/commerce.ts` (order item fields, additive),
`lib/checkout-server.ts` (new — server-side resolution/validation), `app/api/checkout/route.ts`
(server-authoritative), `app/api/orders/[orderId]/route.ts`, `components/orders/track-order.tsx`,
`lib/email.ts`, `scripts/admin-test.mjs`, `scripts/frontend-ui.mjs`. `STEP4B-REPORT.md` (this
file) is the only new untracked artifact.

## 28. Typecheck
`npx tsc --noEmit` — clean, zero errors.

## 29. Lint
`npm run lint` — zero errors; only pre-existing warnings (mega-menu, product-comparison,
sticky-add-to-cart `<img>`, FBT hook dependency) remain.

## 30. Build
Full production build (`NODE_OPTIONS="--max-old-space-size=4096" npm run build` after
`taskkill //IM node.exe //F` and `rm -rf .next`) — succeeds; PDP routes prerender (16 product
paths), checkout/products/search/track render on demand.

## 31. Test Suites
Prod server on :3001. SSR suite `scripts/frontend-ssr.mjs`: **763 passed, 0 failed** (unchanged).
UI suite `scripts/frontend-ui.mjs`: **144 passed, 0 failed** (was 113; +31 new variant checks in
section L). Admin suite `scripts/admin-test.mjs`: **115 passed, 0 failed** (was 84; +31 new
tampering checks in section I). Combined: **1,022 checks green**, zero regressions.

## 32. Remaining Issues
None blocking. Notes: (a) the standalone `components/product/add-to-cart.tsx` is unused by any
render path and remains untouched; (b) Sanity Studio validation for the new order-item fields is
additive-only by design; (c) abandoned-cart and review-reminder flows still use client cart values
for their best-effort payloads (they create no orders and persist nothing authoritative).

## 33. Git State After
Branch `main`; nothing staged, nothing committed. The only new artifact is `STEP4B-REPORT.md`.
Dataset restored to its baseline (4 orders, 4 email events, 0 review submissions, zero fixture
products by id and by slug).

## 34. Verdict
**STEP 4 FULLY COMPLETE** — variant identity survives PDP → cart → checkout → storage, the server
is the sole authority for product/variant price, stock, availability, ownership, line totals and
order totals, tampered or stale client data is rejected or corrected, all 1,022 checks pass, and
fixtures leave no residue.

## 35. Next Recommended Phase
**STEP 5 — Catalog & Collection Pages.** With variant-cart integrity proven, the natural next phase
is the catalog surface: a dedicated category/collection experience (filters, sorting, breadcrumb
facets) plus the products grid and navigation polish. Reuse the `getDefaultVariant` / server-authority
patterns established here so any quick-add surface added in the catalog never bypasses variant and
price integrity.