# UI Plan: /home2 hero offers

## 1. Plain summary

Make the `/home2` hero fill the screen under the sticky nav, and keep the rest of the page in the same calm zinc / yellow language.

Keep the VoltGear gadget look (dark zinc, yellow Shop now). Split the hero: copy on a solid dark panel, a large campaign-style product photo beside it. Show was / now / % off on the **price row**. One quiet line under the buttons for COD and free shipping. Do not add banners, tickers, carousels, or badges on the photo.

Below the hero: Catalog tiles, Featured picks with the same price-row sale treatment, and a dark Proof strip. Live `/` does not change.

## 2. Links

- Product / master plan: none — UI-only run (T-07 gadget preview already exists)
- Related: `docs/superpowers/specs/2026-08-26-t07-gadget-storefront-preview-design.md` (keep both `/` and `/home2`)
- Chat: layered calm offer; combined whisper; keep both CTAs; % off on price only; freeze below hero; hybrid A+B layout

## 3. Goal

A shopper should see, in one glance:

1. What VoltGear is selling
2. The featured product’s deal (if any)
3. How they pay / ship
4. One obvious Shop now

“Good UI” here means calm, not empty. Famous-store energy without Best Buy clutter.

## 4. In scope (screens & surfaces)

- `/home2` (`GadgetHero`, category tiles, featured cards, testimonials)
- Desktop split + full-viewport hero
- Mobile stack
- States: on sale, not on sale, no featured product, sold out featured, COD off, free-shipping threshold missing, both trust bits on

## 5. Out of scope

- Live `/` and `/product/[slug]`
- `/product2/[slug]`
- Nav, footer, cart drawer, search, catalog, checkout, admin CMS forms
- New announcement ticker / countdown / carousel
- New database fields (use headline, subhead, featured product, `compareAtPrice`, `codEnabled`, `freeShippingThreshold`)
- Clarity, Vercel, schema push

## 6. Current app UI snapshot

- Chrome and hero: zinc-950, white type, yellow-400 CTA and labels
- Sharp `rounded-sm`, almost no shadow
- Hero today: eyebrow “Shop the drop”, CMS headline, optional subhead, **price only**, Shop now + Browse all, product image
- Live `/` already has COD + shipping lines and a red % badge on the photo — `/home2` must not copy that stack
- Gadget pages skip the live urgency ticker

## 7. Research collage

| Source | What we took |
|---|---|
| [Anker home](https://www.anker.com/home-com) | One product story with one save line; categories below |
| [Best Buy](https://www.bestbuy.com/) | One campaign feeling — not five offers |
| Apple Store | Skipped (too quiet; already rejected) |
| Samsung / BBH “Buying tech made simple” | Do not strobe pop-ups and deals |
| [Baymard carousels](https://baymard.com/blog/homepage-carousel) | No auto-rotating promo slides |
| [LogRocket hero anatomy](https://blog.logrocket.com/ux-design/hero-section-anatomy-ux/) | Headline → support → CTA → visual |
| COD / shipping UX | Trust as a whisper near the action, not a second hero |

## 8. Chosen direction

**Hybrid A + B**

- **A:** Copy sits on a **solid** zinc-950 column (readable, current structure)
- **B:** Photo is **larger and more poster-like** (~60% width on desktop, full-bleed crop, dark studio)

Not B’s text-on-photo (contrast and clutter). Not C’s coupon-first stack.

## 9. Directions we did not pick

- **A only:** too much like today’s template; photo stays small
- **B only:** type on the image; harder to keep calm and accessible
- **C tight deal stack:** offer wins, brand headline loses

## 10. Visual mockup index

| Label | Shows | Keep? |
|---|---|---|
| UI-01 A desktop sale | Split + sale | Keep as structure reference |
| UI-02 A mobile sale | Stacked sale | Keep stacking order |
| UI-03 A desktop no-sale | Sale layer gone | Keep this behavior |
| UI-04 / UI-05 / UI-06 B | Billboard / scrim | Steal photo scale only; drop overlay type |
| **UI-07 hybrid desktop sale** | Locked layout | **Keep** |
| **UI-08 hybrid mobile sale** | Locked mobile | **Keep** |
| **UI-09 hybrid desktop no-sale** | Locked no-sale | **Keep** |

Ignore fake extra badges/buttons the image model invented.

## 11. Design tokens

Use existing gadget tokens. Do not introduce live-shop primary blue.

| Token | Value | Where |
|---|---|---|
| Hero bg / copy column | `zinc-950` | Hero, nav already |
| Body below | `white` / `zinc-50` / `zinc-950` | Catalog / Picks / Proof |
| Accent | `yellow-400` | Eyebrow, % off, Shop now, cart (unchanged) |
| Muted copy | `zinc-300` subhead, `zinc-400` whisper | |
| Price now | white, `text-3xl`–`text-4xl`, `font-black` | |
| Price was | `zinc-500` line-through | |
| % off | `yellow-400`, `text-sm font-black` | Same row as price |
| Shop now | `bg-yellow-400 text-zinc-950` | Primary |
| Browse all | `border-zinc-600` | Secondary |
| Radius | `rounded-sm` | Buttons only; hero photo is flush |
| Type | Existing gadget: uppercase `font-black` H1; body not all-caps | |
| Spacing | `px-4 lg:px-8`; sections `py-16 lg:py-20`; hero fills remaining viewport | |
| Breakpoints | stack `< lg`; split `lg+` | |
| Motion | none beyond button/image hover (no autoplay) | |

## 12. Layout system

**Desktop (`lg` and up)**

- Hero fills the viewport under the sticky 4rem nav: `min-h-[calc(100dvh-4rem)]`
- Grid: **2/5 copy, 3/5 photo**, photo flush to the top / right / bottom (no gap, no radius)
- Copy column: solid zinc-950, vertically centered, `px-4 lg:px-8`
- Photo: `object-cover` campaign crop

**Mobile**

- Same min-height for the whole hero (copy + photo)
- Order: copy then photo; photo at least ~42vh so the first screen is the hero

Nav/footer unchanged.

## 13. Component inventory

### GadgetHero (reuse + extend)

- **Purpose:** Homepage offer + featured product
- **New vs reuse:** reuse file; add price sale row + whisper; widen photo
- **States:** default/sale, no-sale, no product, sold out, trust line variants
- **Shows:** eyebrow, headline, subhead, price block, two links, whisper, image
- **Hover:** Shop now `yellow-300`; Browse all border white; image no zoom required (optional slight scale is allowed if it stays calm)
- **Focus:** visible ring on links/buttons (yellow or white)
- **Disabled:** Shop now still goes to product2 even if sold out (shopper can read); do **not** add a third “sold out” button. Optional small “Sold out” text under the price — not a red badge on the photo

### Price block (inside GadgetHero)

- Now price always if product exists
- Was + % only if `compareAtPrice > price`
- % = round((compare − now) / compare × 100), hide if ≤ 0

### Whisper (inside GadgetHero)

- One line, `text-sm text-zinc-400`
- Parts joined with ` · `
- COD part if `codEnabled`
- Shipping part if threshold > 0: `Free shipping over {formatPrice(threshold)}`
- If only one part, no extra ` · `
- If neither, hide the whole line

No new shadcn Badge. No live `Hero` component.

## 14. Screen-by-screen spec

### `/home2` hero — default (product on sale)

- **Purpose:** Sell the featured gadget and the deal
- **Who:** You previewing `/home2`; later shoppers if `/` is ever switched (not this task)
- **Layout:** hybrid split as section 12
- **Copy**
  - Eyebrow: `Shop the drop` (keep)
  - H1: `hero.headline` or product name or `Power your everyday.`
  - Subhead: `hero.subheadline` if present; omit if empty
  - Price: `{formatPrice(now)}` `{formatPrice(was)}` `–{n}%`
  - Shop now → `/product2/{slug}`
  - Browse all → `/products`
  - Whisper: `Cash on delivery · Free shipping over {threshold}`
- **Data:** `fetchHero` featured product (same fallback as today: featured → in-stock with image)
- **Empty/loading/error:** page already fails soft to empty products; hero with no product: see below
- **Mobile vs desktop:** stack vs 2/5–3/5
- **Mockups:** UI-07, UI-08

### `/home2` hero — no sale

- Same layout
- Price is now only
- Whisper still shows
- **Mockup:** UI-09

### `/home2` hero — no product

- No image column (or empty zinc-900 panel — prefer **no image**, copy uses full width)
- Shop now label becomes `Shop categories` → `/products` (today’s behavior)
- Hide Browse all if it would duplicate (keep Browse all anyway — user locked two CTAs; Shop categories + Browse all both go `/products`. **Spec:** if no product, **one** yellow button `Shop categories` + outline Browse all still to `/products` is redundant. User locked two buttons when there **is** a product. **No product:** yellow `Shop categories` only, drop outline duplicate. This is the one exception.)
- No price row
- Whisper still if COD/shipping on

### `/home2` hero — sold out featured

- Still show product and photo
- Price as usual
- Shop now still links to product2 (page says sold out)
- Optional `Sold out` as `text-xs font-bold uppercase text-zinc-400` under price — not on the image

### Below-hero sections

Same zinc / yellow language. No extra banners.

**Shop by type (Catalog)**  
White. Small kicker `Catalog`. Four tall tiles (`aspect-[3/4]`), name on a dark bar at the bottom. Links to live `/products/{category}`.

**Featured (Picks)**  
Light zinc-50 band. Kicker `Picks`. Same 8 cards. Price row matches the hero (now / was / % off on the price, no badge on the photo). Shop → `/product2/{slug}`.

**What buyers say (Proof)**  
Full-bleed zinc-950. Kicker `Proof` in yellow. Three quotes, hairline gaps, no boxed borders.

### `/home2` rest

Nav and footer unchanged.

## 15. User flows (UI steps)

1. Open `/home2`
2. Read headline + deal
3. Click **Shop now** → `/product2/{slug}`
4. Or **Browse all** → live `/products`
5. Or scroll to Catalog / Picks / Proof
6. If no deal, still click Shop now; whisper still explains COD/shipping

## 16. Accessibility

- Hero is one `<section>`
- H1 is the CMS/product headline (one H1 on the page)
- Shop now / Browse all are links, min 44px height
- Price: visually struck “was”; screen reader: `{now}, was {was}, {n} percent off`
- Whisper is plain text, not a marquee
- Image `alt` = product name
- Contrast: white/yellow on zinc-950; do not put small yellow type on the photo
- No auto-rotating content
- Focus visible on both CTAs

## 17. Content & microcopy

| Slot | Copy |
|---|---|
| Eyebrow | Shop the drop |
| Fallback H1 | Power your everyday. |
| Shop now | Shop now |
| No product primary | Shop categories |
| Browse all | Browse all |
| Whisper COD | Cash on delivery |
| Whisper shipping | Free shipping over {formatted PKR} |
| Joiner | ` · ` (spaces around the middle dot) |
| Sold out hint | Sold out |
| % off | `–{n}%` (en dash) |

No “Hurry”, no countdown, no “LIMITED!!”.

## 18. Build order (UI only)

1. Extend `GadgetHero` props: product, headline, subhead, `codEnabled`, `freeShippingThreshold`
2. Price row with was / % rules
3. Whisper builder
4. Full-viewport grid 2/5–3/5 + flush photo
5. Wire `app/home2/page.tsx` with `normalizeSettings` / config (same as live home)
6. Catalog / Picks / Proof below-hero
7. Mobile stack check
8. States: no sale, no product, sold out, COD off
9. Visual check on `/home2` only; `/` must look unchanged

Files: `components/gadget/gadget-hero.tsx`, `components/gadget/gadget-product-card.tsx`, `components/gadget/gadget-sale.ts`, `app/home2/page.tsx`. No new packages.

## 19. Impact on existing screens

| Screen | Change |
|---|---|
| `/home2` hero | Full viewport; sale + whisper |
| `/home2` rest | Catalog / Picks / Proof as above |
| `/`, product, product2, nav, footer | No |
| Admin hero fields | No new fields; use existing |

## 20. Open questions

None that block layout. (If no product, only one yellow button — stated in §14.)

## 21. Approval

- [x] User approved this UI plan
- Date / note: 2026-08-26 — “yes”
