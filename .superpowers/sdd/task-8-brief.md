### Task 8: Shop wiring (fail-open)

**Files:**
- Modify: `app/layout.tsx` — mount tracker **only** when `!isAdmin && !isGadget`
- Create: `components/analytics/first-party-tracker.tsx` (client) — path change → `page_view`; skip collect paths
- Modify: `components/product/product-view-tracker.tsx` — pass `productId={product._id}`; call first-party `product_view` in the same effect as GA (GA stays)
- Modify: `app/product/[slug]/page.tsx` — pass `_id`
- Modify: `components/cart/cart-provider.tsx` — optional `productId`/`variantId`; after successful add/remove, `track` add/remove (not on gadget path)
- Modify: add-to-cart / purchase-section / buy-now / sticky / quick-view / product-card / FBT / cart-upsell to pass `productId: product._id` where the Product is in scope. Gadget buy-box: do **not** pass into first-party if path is gadget; provider already skips via `shouldCollectPath`
- Modify: `app/checkout/page.tsx` — on mount `checkout_started`; on enter step 1/2 `checkout_step`; details `onInvalid` / `reportValidity` → `checkout_validation_error` with category from `event.target.name`; 409 → `price_changed`; 400 stock/empty → matching category. Do **not** emit on fetch network failure. Keep GA `trackBeginCheckout` as-is (optional).

Do not emit first-party from `gadget-buy-box` even if cart-provider is shared: `shouldCollectPath(window.location.pathname)` inside provider.

- [ ] **Step 1:** Extend `lib/first-party-analytics.test.ts` for `pageTypeFromPath("/checkout") === "checkout"`, `"/products" → catalog`, `"/" → home`.

- [ ] **Step 2–4:** Implement wiring; `npx tsc --noEmit`

## Controller notes (binding)

- Do **not** git commit. Do **not** `supabase db push`.
- Fail-open: never throw from track calls; existing `createFirstPartyClient` already swallows fetch errors.
- **One per-tab queue:** export a browser singleton (e.g. `getBrowserAnalyticsClient()`) so layout tracker, PDP, cart, and checkout share the same sequential queue. Do not `createFirstPartyClient()` per component.
- Add `pageTypeFromPath(pathname)` with tests: `/` → home, `/products` → catalog, `/checkout` → checkout. Also map `/product/...` → product, `/cart` → cart, `/search` → search; else `other` (or `content` for known content paths if obvious).
- Extend `FirstPartyTrackEvent` so cart/checkout can send `properties` (`quantity`, `step`, `category`) plus optional `product_id`, `variant_id`, `product_slug`. The POST body must match ingest (`event_id`, `name`, `path`, `page_type`, optional product fields, `properties`).
- Layout: mount `<FirstPartyTracker />` only in the live-shop branch (`!isAdmin && !isGadget`). Do not mount on gadget or admin.
- Tracker: `usePathname` → `page_view` when `shouldCollectPath`; skip `/admin`, `/home2`, `/product2`.
- PDP: `ProductViewTracker` accepts `productId?: string`; fire first-party `product_view` in the same `useEffect` as GA `trackViewItem`. Pass `product._id` from `app/product/[slug]/page.tsx`. Do not add tracker on `/product2`.
- CartItem: optional `productId` / `variantId`. After a successful add, if `shouldCollectPath`, track `add_to_cart` with integer `quantity`. After successful remove or qty→0, track `remove_from_cart` with the removed quantity. Old saved carts without ids: omit product_id (slug snapshot ok).
- Pass `productId: product._id` (and variant id if in scope) from: `add-to-cart.tsx`, `purchase-section.tsx`, `buy-now.tsx`, `sticky-add-to-cart.tsx`, `quick-view.tsx`, `product-card.tsx`, `frequently-bought-together.tsx`, `cart-upsell.tsx`.
- `gadget-buy-box.tsx`: do **not** pass productId into addItem for first-party; provider skip is the backstop. Do not import first-party analytics there.
- Checkout (`app/checkout/page.tsx`):
  - Mount: `checkout_started`
  - Enter details (step 1): `checkout_step` `{ step: "details" }`
  - Enter confirm (step 2): `checkout_step` `{ step: "confirm" }`
  - Invalid HTML / `reportValidity`: `checkout_validation_error` with category from `event.target.name` mapped to ingest list (`name`, `email`, `phone`, `address`, `city`, else `other`)
  - HTTP 409: category `price_changed`
  - HTTP 400 stock/empty cart: matching category (`stock` / `empty_cart`) if the API signals that; else `other`
  - Do **not** emit first-party on fetch network failure
  - Keep existing GA `trackBeginCheckout`
- Append tests to `package.json` if you add a new test file; otherwise extend `lib/first-party-analytics.test.ts`.
- `npx tsc --noEmit` and `npm test` before reporting.
- Report: `.superpowers/sdd/task-8-report.md`
