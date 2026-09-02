# Task 8 Report — Shop wiring (fail-open)

## Status: DONE

## Files

| Action | Path |
|--------|------|
| Created | `components/analytics/first-party-tracker.tsx` |
| Modified | `lib/first-party-analytics.ts` |
| Modified | `lib/first-party-analytics.test.ts` |
| Modified | `app/layout.tsx` |
| Modified | `app/product/[slug]/page.tsx` |
| Modified | `app/checkout/page.tsx` |
| Modified | `components/product/product-view-tracker.tsx` |
| Modified | `components/cart/cart-provider.tsx` |
| Modified | `components/product/add-to-cart.tsx` |
| Modified | `components/product/purchase-section.tsx` |
| Modified | `components/product/buy-now.tsx` |
| Modified | `components/product/sticky-add-to-cart.tsx` |
| Modified | `components/product/quick-view.tsx` |
| Modified | `components/product/product-card.tsx` |
| Modified | `components/product/frequently-bought-together.tsx` |
| Modified | `components/cart/cart-upsell.tsx` |

Not modified: ingest route, gadget buy-box, `/product2`, checkout pricing/COD, `package.json` (tests appended to existing file).

## TDD evidence

### RED (`pageTypeFromPath` missing)

```text
✖ maps live shop paths to page types
  TypeError: pageTypeFromPath is not a function
ℹ tests 5  pass 4  fail 1
```

### GREEN (path mapper)

```text
ℹ tests 5  pass 5  fail 0
```

### RED (payload + validation helpers)

```text
✖ includes properties, variant_id, and product_slug … actual undefined
✖ validationCategoryFromFieldName is not a function
✖ checkoutValidationCategoryFromHttp is not a function
ℹ tests 8  pass 5  fail 3
```

### GREEN (focused)

```text
ℹ tests 8  pass 8  fail 0
```

### tsc / full suite

```text
$ npx tsc --noEmit
(exit 0)

$ npm test
ℹ tests 160  pass 160  fail 0
```

## Concerns

- `Product._id` is `products.id` (UUID). `variantId` is `variant._key` (`key ?? id`); ingest drops non-UUIDs.
- Gadget buy-box does not pass `productId`; `shouldCollectPath` in `trackFirstParty` is the backstop.
- `clearCart` after a successful order does not emit `remove_from_cart`.
- CMS `/[slug]` pages map to `other` (only `/blog`, `/warranty` → `content`).
- No live browser funnel check this task (no ingest DB push).
- No git commit. No `supabase db push`.
