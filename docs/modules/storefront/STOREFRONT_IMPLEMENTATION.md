# Gadget storefront preview implementation

A second look for the shop, on preview URLs only. **Keep both:** live `/` and `/product/[slug]` stay the current shop; gadget chrome stays on `/home2` and `/product2/[slug]`. Do not replace `/` unless asked.

## Who uses it

You, opening `/home2` and `/product2/[slug]`. Shoppers on `/` keep the current chrome.

## Routes

| URL | What you get |
|---|---|
| `/` | Current homepage, navbar, footer |
| `/product/[slug]` | Current product page |
| `/home2` | **T-16 redesign:** Biometic light chrome, Ronin-style product hero slides (admin-managed), trust strip, shop-by-type, bestsellers, proof. Product links go to `/product2/{slug}`. Category / all-products links go to live `/products` |
| `/product2/[slug]` | Gadget product page (visual language still older zinc/yellow until T-17) |

Wrong slug → the same generic 404 as live. A guest opening a demo-only product still 404s (`fetchProductBySlug` + demo cookie).

## Homepage sections (`/home2`)

1. Hero slides from `hero_slides` (published, max 8) — autoplay, pause on hover, desktop split / mobile stack
2. Trust: COD · free shipping threshold · returns/warranty · curated
3. Shop by type — tile only if ≥1 in-stock product with image
4. Bestsellers — featured → order qty → product_view counts (`pickBestsellers`)
5. Proof — published testimonials

Admin: `/admin/hero` manages slides (live singleton kept under “Live home hero”). Migration: `supabase/migrations/20260901010000_hero_slides.sql` — **push before using slides in prod/local DB**.

## Chrome

Root `app/layout.tsx` branches on `/admin` via `x-pathname`. Preview paths use `isGadgetPreviewPath`: gadget navbar + footer, demo banner if the demo cookie is on, existing `CartProvider` / drawer / cart effects. Urgency ticker, trust bar, review popup, and compare bar stay off on preview.

Nav (T-16): Logo · shop types · Search · Track · Cart.

## Cart and video

Add to cart on product2 uses the same `addItem` as the live buy box. Checkout and the drawer UI are unchanged.

If admin saved `productVideo`, product2 shows it: Instagram/TikTok as an iframe embed; Cloudinary/MP4 as `<video>`. No video field → the block is hidden. No new upload pipeline.

## SEO

Page metadata is `noindex, nofollow`. `robots.ts` disallows `/home2` and `/product2`. Sitemap still lists live `/` and `/product/...` only.

## Key files

| Path | Role |
|---|---|
| `lib/gadget-preview.ts` | Path helpers + video kind/embed (unit-tested) |
| `lib/db/hero-slide-rules.ts` | Publish / CTA helpers |
| `lib/db/bestsellers-rules.ts` | Ranking helper |
| `app/home2/page.tsx` | Preview homepage |
| `app/product2/[slug]/page.tsx` | Preview product page |
| `components/gadget/*` | Navbar, footer, hero slider, cards, buy box, video |
| `app/admin/hero/page.tsx` | Slide CRUD + legacy live hero |
| `app/layout.tsx` | Chrome swap |
| `app/robots.ts` | Disallow preview paths |

## Out of this module

Replacing `/` with the gadget look, restyling catalog/search/checkout/blog/admin beyond hero slides, T-17 product2 redesign, T-18 catalog chrome.
