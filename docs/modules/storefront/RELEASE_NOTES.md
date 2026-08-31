# Gadget storefront preview — release notes

## 2026-09-01 — Biometic /home2 redesign (T-16)

- Preview home now uses a light Biometic look with admin-managed product hero slides, a COD/shipping/returns trust strip, shop-by-type tiles, ranked bestsellers, and buyer proof. Live `/` is unchanged. Requires `hero_slides` migration applied and at least one published slide + testimonial.

## 2026-08-26 — Gadget preview at `/home2` and `/product2` (T-07)

- Compare a bolder electronics-shop layout against the live store without changing `/` or `/product/[slug]`. Open `/home2` and `/product2/[slug]` for the new nav, hero, buy box, and footer. Add to cart still uses the existing cart drawer. Preview URLs are `noindex` and robots-disallowed. Decision: keep both URL sets; do not switch `/`.
