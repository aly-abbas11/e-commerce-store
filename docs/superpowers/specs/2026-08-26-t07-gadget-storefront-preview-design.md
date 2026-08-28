# Spec: T-07 — Gadget-store preview (home2 / product2)

## Objective

Let you **compare** a bolder electronics-shop UI (Anker/Samsung energy: strong headlines, obvious buy) against the live store, without changing what shoppers see on `/` today.

**User:** you, opening `/home2` and `/product2/[slug]` in the browser.

**Why now:** The shop works. It looks like a generic template. Fix the look on preview routes before Vercel (T-08).

**Success:** `/` and `/product/[slug]` look unchanged. `/home2` and `/product2/[slug]` use **new nav, page, and footer** and feel like a real gadget store. Add to cart on product2 still uses the existing cart.

## Tech stack

- Next.js 14 App Router
- Same Supabase catalog (`fetchHero`, `fetchAllProducts`, `fetchProductBySlug`, demo session flag)
- Root layout already branches on `/admin`; add a branch for gadget preview paths
- Unit tests: `lib/gadget-preview.ts` (path helpers + video kind)

## Commands

```
npm run dev
npm test
npx tsc --noEmit
```

No `supabase db push`. No new env.

## Project structure

```
lib/gadget-preview.ts                 → isGadgetPreviewPath, product2Href, videoKind
lib/gadget-preview.test.ts
app/home2/page.tsx                    → new homepage
app/product2/[slug]/page.tsx          → new product page
components/gadget/gadget-navbar.tsx
components/gadget/gadget-footer.tsx
components/gadget/gadget-hero.tsx
components/gadget/gadget-product-card.tsx
components/gadget/gadget-buy-box.tsx
components/gadget/gadget-video.tsx    → MP4/Cloudinary <video>; IG/TikTok embed
app/layout.tsx                        → swap chrome when path is preview
app/robots.ts                         → disallow /home2 and /product2
```

Live `app/page.tsx`, `app/product/[slug]/page.tsx`, current navbar/footer: **do not restyle**.

## Locked decisions

| Topic | Decision |
|---|---|
| Look | Bold gadget store (Anker/Samsung), not quiet Apple, not black-and-white as a goal |
| Live shop | `/` and `/product/[slug]` unchanged |
| Preview | `/home2` and `/product2/[slug]`, **including** new nav and footer |
| Product v2 URL | Parallel route so you can compare. Cart/search still use live `/product/...` except links you click on preview pages |
| Catalog / cart / checkout / track / blog / admin | Out of scope (keep current UI) |
| Cart on preview | Same `CartProvider` + current drawer. Add to cart on product2 must work |
| Data | Same published catalog (demo cookie still includes demo rows) |
| Video | If admin has a video, product2 plays it: file/Cloudinary as `<video>`; Instagram/TikTok as embed |
| SEO | Preview `noindex`. Sitemap stays live `/` and `/product/...` only |
| Switch `/` to the new look | **Keep both.** Live `/` and `/product/[slug]` stay the current shop. Gadget layout stays on `/home2` and `/product2/[slug]`. Do not replace `/` unless asked. |
| Schema / env | None |

## Approaches considered

1. **Preview URLs + chrome swap in root layout (chosen).** Matches `/` vs `/home2` in two tabs. Smallest risk to live shop.
2. Next.js route group with a separate layout. Cleaner folders; bigger move of `app/`.
3. Cookie that restyles live pages. Cannot compare in two tabs. Rejected.

## Architecture

```
GET / or /product/[slug]
  → current Navbar + page + Footer

GET /home2 or /product2/[slug]
  → GadgetNavbar + preview page + GadgetFooter
  → CartProvider unchanged

product2 “Add to cart”
  → existing cart (same product id/slug)
  → drawer/checkout still current UI
```

`x-pathname` from middleware already exists (used for admin). Reuse it to pick chrome.

On preview pages, product links go to `/product2/{slug}`. Category / “all products” links go to live `/products` (those pages stay old on purpose).

## Preview screens

**Gadget chrome**

- Sticky header: logo, categories, search (existing `/search`), cart count
- Stronger type and a solid primary shop CTA
- Footer: COD, shipping, contact, policy links
- Demo banner still shows if the demo cookie is set
- Theme toggle can stay; we are not doing a color-scheme project

**`/home2`**

- Hero: featured product (or first featured) — large image, short headline, price, **Shop now** (to `/product2/{slug}`), secondary browse categories
- Four category tiles → live `/products/{category}`
- Featured grid (up to 8) with price + shop, linking to `/product2/{slug}`
- Short testimonial/review strip if testimonials exist
- Skip the blog block on home2 (keeps the page “buy”, not magazine)

**`/product2/[slug]`**

- Gallery + buy box: name, price, compare-at, stock, quantity, **Add to cart**, COD line
- Video near the top of the stack if `productVideo` exists
- Features / specs / in-the-box as dense blocks (same data, tighter layout)
- Related products → other `/product2/...` URLs
- Wrong slug → same generic 404 as live (do not leak demo-only products to guests)

## Error handling

| Case | Behavior |
|---|---|
| Unknown `/product2` slug | 404, same as live |
| No featured product for hero | Use first in-stock product with an image; if none, headline + Shop categories only |
| No video | Hide the video block |
| Instagram/TikTok URL in `<video>` | Do **not** use `<video>`; embed instead |
| Guest on demo-only product2 URL | 404 |

## Impact analysis

| Surface | Today | T-07 |
|---|---|---|
| `app/layout.tsx` | Admin vs shop chrome | Third branch: gadget chrome |
| Navbar / footer | One shop shell | New components; old files untouched |
| Homepage | `app/page.tsx` | Unchanged; add `app/home2/page.tsx` |
| Product page | `app/product/[slug]` | Unchanged; add `app/product2/[slug]` |
| Cart / checkout | Shared | Unchanged UI; product2 still adds lines |
| Catalog / search / blog / track | Current | Unchanged (jarring jump from home2 is accepted) |
| `robots.ts` | Disallow admin/demo | Also `/home2`, `/product2` |
| `sitemap.ts` | Live product URLs | Do **not** add preview URLs |
| Admin CMS | Product video field | No form changes |
| Schema / emails / Clarity | — | None |
| Tests | Path/video helpers | New `gadget-preview.test.ts`; do not change order/email/demo tests |

Visibility: preview is public (like `/demo/login`). `noindex` + robots disallow so it is not meant for Google. Anyone with the URL can open it.

## Testing strategy

Failing tests first (`lib/gadget-preview.ts`):

- `/home2` and `/product2/foo` are preview paths; `/` and `/product/foo` are not
- `product2Href("pad")` → `/product2/pad`
- Video URL host: Cloudinary/mp4 → `file`; instagram.com → `instagram`; tiktok.com → `tiktok`; empty → `none`

`npx tsc --noEmit` clean.

**Manual:** `/` looks the same. `/home2` has new chrome + hero + shop CTAs. Open a product on home2 → `/product2/...`. Add to cart. Open the same slug on `/product/...` — old page. Instagram/TikTok/MP4 if a product has one.

## Boundaries

- **Always:** Live `/` and `/product/...` unchanged. Preview has its own chrome. Same catalog. Cart still works from product2.
- **Ask first:** Making `/` the new homepage. Restyling catalog/checkout.
- **Never:** Black-and-white as the goal. Schema push. Replacing admin. Clarity on localhost.

## Out of scope

- T-08 Vercel, T-05 Clarity
- Catalog, cart drawer restyle, checkout, track, blog, admin
- Switching the default homepage
- New video upload pipeline (admin field already exists)

## Success criteria

- [x] `/` and `/product/[slug]` look as they do today
- [x] `/home2` and `/product2/[slug]` use new nav + footer + gadget layout
- [x] Product2 add-to-cart lands in the existing cart
- [x] Video plays or embeds when admin has one; hidden when not
- [x] Preview routes `noindex` / robots-disallowed; sitemap unchanged
- [x] `npx tsc --noEmit` and `npm test` pass

## Phase breakdown

1. Path/video helpers + unit tests (`lib/gadget-preview.ts`)
2. Root layout chrome swap; gadget navbar + footer
3. `/home2` hero, categories, featured, testimonials
4. `/product2/[slug]` buy box, video, related
5. robots + page `noindex`; `npm test` + `tsc`

---
