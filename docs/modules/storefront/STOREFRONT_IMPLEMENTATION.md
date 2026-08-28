# Gadget storefront preview implementation

A second look for the shop, on preview URLs only. **Keep both:** live `/` and `/product/[slug]` stay the current shop; gadget chrome stays on `/home2` and `/product2/[slug]`. Do not replace `/` unless asked.

## Who uses it

You, opening `/home2` and `/product2/[slug]`. Shoppers on `/` keep the current chrome.

## Routes

| URL | What you get |
|---|---|
| `/` | Current homepage, navbar, footer |
| `/product/[slug]` | Current product page |
| `/home2` | Gadget homepage: dark hero, category tiles, featured grid, testimonials. Product links go to `/product2/{slug}`. Category / all-products links go to live `/products` |
| `/product2/[slug]` | Gadget product page: gallery + buy box, video if set, features/specs/in-the-box, related cards on `/product2/...` |

Wrong slug → the same generic 404 as live. A guest opening a demo-only product still 404s (`fetchProductBySlug` + demo cookie).

## Chrome

Root `app/layout.tsx` already branches on `/admin` via `x-pathname`. Preview paths use `isGadgetPreviewPath`: gadget navbar + footer, demo banner if the demo cookie is on, existing `CartProvider` / drawer / cart effects. Urgency ticker, trust bar, review popup, and compare bar stay off on preview so the whole screen is the new look.

Logo on preview goes to `/home2`. Footer “View current shop” goes to `/`.

## Cart and video

Add to cart on product2 uses the same `addItem` as the live buy box. Checkout and the drawer UI are unchanged.

If admin saved `productVideo`, product2 shows it: Instagram/TikTok as an iframe embed; Cloudinary/MP4 as `<video>`. No video field → the block is hidden. No new upload pipeline.

## SEO

Page metadata is `noindex, nofollow`. `robots.ts` disallows `/home2` and `/product2`. Sitemap still lists live `/` and `/product/...` only.

## Key files

| Path | Role |
|---|---|
| `lib/gadget-preview.ts` | Path helpers + video kind/embed (unit-tested) |
| `app/home2/page.tsx` | Preview homepage |
| `app/product2/[slug]/page.tsx` | Preview product page |
| `components/gadget/*` | Navbar, footer, hero, cards, buy box, video |
| `app/layout.tsx` | Chrome swap |
| `app/robots.ts` | Disallow preview paths |

## Out of this module

Replacing `/` with the gadget look, restyling catalog/search/checkout/blog/admin, Vercel (T-08), Clarity (T-05), schema or env changes.
