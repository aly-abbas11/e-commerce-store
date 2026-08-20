# STEP 4C — Price Change Reconfirmation & Currency Label Closure

**Phase:** STEP 4C (post-STEP 4B)
**Status:** ✅ Complete — all suites green, typecheck clean, lint 0 errors, dataset pristine.

Server stays authoritative throughout. Client `items[].price` is only a *reviewed-price snapshot*, never authority. A price drift is a **409** (retry expected), never a silent order.

---

## 1. Summary
Replaced STEP 4B's "silent server-price override" with a reconfirmation flow on top of 4B's already-verified integrity:

- **Runtime:** `/api/checkout` short-circuits to `409 PRICE_CHANGED` when a client-supplied line price drifts from the server-resolved unit price. No order, no email, no event, no `trackPurchase` on 409. The checkout page refreshes the affected cart line(s) **by line identity**, renders an amber `role="alert"` notice (old→new per line), and requires an explicit second confirmation; the second submit creates the order.
- **Schema:** order-document item fields in `sanity/schemas/commerce.ts` relabelled (`price`→"Unit Price", `lineTotal`→"Line Total"); order-level totals no longer say "(USD)". Catalog "Price (USD)" in `sanity/schemas/product.ts` is out of scope.

## 2. Baseline (what 4B guaranteed)
SSR 916 / UI 151 / Admin 124 = 1,191 all green. orders=4, emailEvents=4, zero fixtures. 4B guarantees (all still true): free-shipping threshold uses server subtotal; gift-wrap server fee 199 on the 4,999 line; no stock bypass; variants merge by `slug::variantKey`; client price non-authoritative; forged subtotals/totals ignored.

## 3. Problem statement
The 4B path silently accepted a stale cart price (White 7,500 in cart, server now 8,250) and stored 8,250 — creating an order + email without the customer ever seeing the change. Contract now requires explicit second confirmation surfaced as a 409.

## 4. Client-price-is-snapshot decision
`lib/checkout-server.ts:90` `reviewedPrice()`: a client `price` that is missing/NaN/non-positive/non-number is treated as **no snapshot** → no comparison → proceed authoritatively (backward compatible). Only a present, finite, positive numeric snapshot is compared. This is why all "no price sent" checkouts remain 200.

## 5. 409 precedence rule
Per line in `resolveCheckout`: unknown product → variant-not-found → out-of-stock → quantity → **price mismatch collected last**. Availability errors short-circuit to a blocking 400 before any 409. A mismatch is non-blocking per line but, if *any* line mismatches, the whole request returns 409 (after all lines resolve). Hence "sold-out + price changed" → sold-out 400, never 409.

## 6. 409 payload contract
`app/api/checkout/route.ts:75`
```jsonc
{
  "code": "PRICE_CHANGED",
  "error": "One or more item prices changed since you last viewed your cart.",
  "items": [ { "slug", "variantKey?", "variantName?", "oldPrice":7500, "newPrice":8250 } ],
  "lines":  [ { "slug", "variantKey?", "price":8250 } ],
  "subtotal":8250, "shipping":0, "total":8250
}
```
200 contract unchanged except it now *also* returns `lines` (authoritative unit prices) for client sync.

## 7. Route short-circuit (before createOrder/email)
`app/api/checkout/route.ts:68-111`: returns 409 immediately when `resolveCheckout` yields `ok:"price_changed"` — before `createOrder(113)`, `enqueueEmailEvent`, and `sendOrderConfirmationEmail(128)`, and before client `trackPurchase`. Only the `ok:"ok"` branch persists.

## 8. Cart line identity
Cart keys are `slug::variantKey` (4B; `components/cart/cart-provider.tsx:50` STORAGE_KEY + key fn). The 409 refresh (`app/checkout/page.tsx:142-148`) uses the same rule (`variantKey ? slug+::+variantKey : slug`) and **never** updates by slug alone, preserving distinct variant lines.

## 9. updateItemPrice
`components/cart/cart-provider.tsx:103-107`: maps over items, replacing `price` on the matching key (preserving qty/variant/name/image) and writes `ecomm-cart` via the save effect (line 69) so E2E can assert persistence.

## 10. Checkout page 409 handling
`app/checkout/page.tsx:139-156`
1. `setPlacing(true)`, `setPriceChanged(null)`.
2. POSTs items (with snapshot prices) + client-recomputed subtotal/shipping/total.
3. On `res.status===409 && data.code==="PRICE_CHANGED"`: for each `data.lines` call `updateItemPrice(key, line.price)`; `setPriceChanged({items, subtotal, shipping, total})`; `return` — no navigation, no success banner, no email.
4. On `!res.ok` throw route error (400 sold-out / qty / ambiguous).
5. Only on 200: `setPlacedOrder(orderId)` + `trackPurchase`.

## 11. priceChanged state shape
`app/checkout/page.tsx:84-92`: `{ items: PriceMismatch[]; subtotal; shipping; total } | null`. Purely UI-side to drive the notice and recompute the visible summary.

## 12. Notice UI
`app/checkout/page.tsx:606-630` — inside the step-2 summary above Place Order. Amber muted surface, `role="alert"`, `AlertTriangle` icon, title "Prices changed while you were checking out.", a `<ul>` of `<li>` entries `White: Rs 7,500 → Rs 8,250`, plus "Your order summary has been updated… please review it before placing your order again." No focus steal, no modal.

## 13. Notice lifecycle (clear rules)
`app/checkout/page.tsx:218-226` effect (deps: items.length, step, giftWrap): cleared when the cart changes shape, the user moves step, or gift-wrap toggles. A fresh 409 re-populates it. Manual re-submit does NOT clear it; only a successful 200 (or a cart/step change) does.

## 14. No auto-resubmit on 409
`placeOrder` returns after `setPriceChanged` on 409, so the form never re-submits automatically. The customer clicks "Place Order" again; the same handler now POSTs server-aligned prices → `ok:"ok"` → order created.

## 15. Summary total stays server-authoritative
The visible summary total (`app/checkout/page.tsx:709-731`) is recomputed from refreshed line prices via `updateItemPrice`, matching the 409 `total`. The success screen reads `placedTotal ?? total` from the order object (`page.tsx:266`) — never a client price.

## 16. Gift-wrap on 409
Gift wrap (fee 199) is folded into `resolveShippingAndTotal` (`lib/checkout-server.ts:213`) before the mismatch check, so the 409 `total` includes the wrap fee and the free-shipping threshold is re-evaluated on the server subtotal — identical to 4B.

## 17. Missing/malformed price handling
`lib/checkout-server.ts:90`:
- `price === undefined/null` → no snapshot.
- `typeof price !== "number"` / `Number.isNaN(price)` / `price <= 0` → no snapshot.
- Otherwise → compared.
Keeps every "no price sent" checkout on 200 with zero client changes.

## 18. Server-side totals formula
`lib/checkout-server.ts:223-229` `resolveShippingAndTotal`: shipping = `subtotal===0 || subtotal>=freeShippingThreshold ? 0 : settings.shippingFee`; total = `subtotal + shipping + (giftWrap?GIFT_WRAP_FEE:0)`. Mirrors the client page (96-98).

## 19. Email / events not triggered on 409
Route returns at line 75 (409) before `createOrder(113)`, `enqueueEmailEvent`, `sendOrderConfirmationEmail(128)`. Direct-API suite asserts the `emailEvent` count is unchanged after a 409 (Part 45G). UI suite asserts no new order row after the first attempt (Part 44: `ordersAfterRec === ordersBeforeRec + 1`).

## 20. trackPurchase gated on real place
`app/checkout/page.tsx` calls analytics `trackPurchase` only in the 200 branch (after `setPlacedOrder`); a 409 never records a purchase event.

## 21. Direct-API test section (I)
Rewritten in `scripts/admin-test.mjs` (tests A-F, then retained cases 2/3/4/5/6/7/8/9/10) to encode the 4C contract:
- **A.** Same-price (no snapshot) → 200 at 4,999 (documents "missing price ⇒ no comparison").
- **B.** Stale price increase → 409 (oldPrice 7500 / newPrice 8250, totals 8250/0/8250); reconfirm → 200 at 8250; assert no order + no confirmation emailEvent created on the 409.
- **C.** Stale price decrease → 409 (no silent benefit to the customer).
- **D.** Multi-line both changed → 409 listing 2 items; reconfirm → 200.
- **E.** Non-variant fake price → 409 (`newPrice` = real product price); reconfirm at real price → 200.
- **F.** Sold-out + price changed → sold-out 400 (precedence over 409).
Retained: nonexistent variant, cross-product variant, out-of-stock variant, invalid quantities, ambiguous (no variantKey), gift wrap, multi-variant, legacy product.

## 22. Direct-API: 409 creates nothing (Part 45G)
Each 409 case captures `count(*[_type=="order" && customer.email==TAMPER_EMAIL])` before/after and asserts equality, plus the `order-confirmation` emailEvent count is still 0 after a 409.

## 23. Direct-API: forged totals still ignored
Cases pass forged `subtotal/shipping/total`; the 409/200 responses carry server-recomputed values (e.g. B. 409 total 8250; t9 200 total 17,498; t10 200 total 4999+199+199).

## 24. Direct-API: reconfirm semantics
After a 409 the test resubmits with the corrected server price (or omits the price — no snapshot) and asserts 200 + stored `items[0].price === newPrice` + `subtotal === newPrice`.

## 25. Browser E2E L6 — stale-price reconfirmation (Part 44)
White added to cart at 7,500; Sanity patched → 8,250; first "Place Order" → 409 (no "Order Confirmed!" within 6s); notice visible (`div[role="alert"]` filtered by title, White, 7,500, 8,250); summary total → "Rs 8,250"; `localStorage.getItem("ecomm-cart")[0].price` → 8250; second "Place Order" → 200 Order Confirmed; exactly one new order row; stored `items[0].price === 8250`.

## 26. Browser E2E L5 — same-price control
White added at 7,500 with no drift; "Place Order" → 200 Order Confirmed; success screen "Rs 7,500". Confirms no false-positive 409.

## 27. Browser E2E L7 — stale stock (precedence)
White goes out-of-stock; "Place Order" → 400 with customer-safe alert `/sold out/i` (precedence over any price check); no order.

## 28. Browser console / network hygiene
Section I asserts 0 `pageerror` / `console.error` during the full UI suite — the 409 branch, the JSON `fetch` parse, and the notice render produce no client errors.

## 29. Typecheck + lint
`npx tsc --noEmit`: clean (no errors). `npm run lint`: 0 errors. Pre-existing warnings only (product-comparison `useEffect` deps; sticky-add-to-cart `<img>`; unrelated) — none introduced by 4C.

## 30. Verification result
| Suite | Result |
|---|---|
| frontend-ssr | ✅ 916 passed, 0 failed |
| frontend-ui | ✅ 151 passed, 0 failed |
| admin-test | ✅ 124 passed, 0 failed |
| tsc --noEmit | ✅ clean |
| eslint | ✅ 0 errors |
| Sanity dataset | pristine: orders=4, emailEvents=4, 0 `vg-variant-*` products |

No git operations performed (no stage/commit/push/reset/clean); all changes left in the working tree on branch `main`.

### Files touched
- `lib/checkout-server.ts` (new) — `resolveCheckout`, `CheckoutLine`, `PriceMismatch`, `reviewedPrice`, mismatch collection, server totals.
- `app/api/checkout/route.ts` — 409 short-circuit before `createOrder`/email; 200 returns `lines`.
- `app/checkout/page.tsx` — 409 handler, `updateItemPrice` by line identity, `role="alert"` notice, clear-on-change effect, `trackPurchase` gated on 200.
- `components/cart/cart-provider.tsx` — `updateItemPrice` (preserves qty/variant) + context exposure.
- `sanity/schemas/commerce.ts` — order item currency labels cleaned.
- `scripts/admin-test.mjs` — section I rewritten for 409/reconfirm semantics.
- `scripts/frontend-ui.mjs` — L6 converted to the 409 + reconfirm E2E.
- `STEP4C-REPORT.md` — this report.
