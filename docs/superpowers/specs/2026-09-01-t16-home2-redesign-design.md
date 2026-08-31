# T-16 — `/home2` discovery storefront redesign (phase 1)

**Status:** Design approved in chat 2026-09-01 · awaiting written-spec review  
**Task:** T-16  
**Surface:** Gadget preview `/home2` (+ gadget nav/footer). Live `/` unchanged.

## 1. Problem / goal

VoltGear should feel like a curated tech brand: shoppers quickly find the right accessory type, trust COD/shipping/returns, and buy — without a catalogue dump or deal-bazaar noise.

**Success (first 2–3 months):** faster category/product clicks and more checkout/COD starts from home-driven visits. Brand theater is secondary.

## 2. Scope

### In scope (phase 1)

- Full visual rethink of `/home2` and gadget chrome (nav + footer)
- Admin-managed **hero slide** CRUD (replace singleton hero for preview)
- Homepage sections: Nav · Hero slider · Trust · Shop by type · Bestsellers · Proof · Footer
- Publish gates: ≥1 published hero slide, ≥1 published testimonial
- Biometic-inspired light palette + quiet teal accent (inspiration only)

### Out of scope (phase 1)

- Live `/` and `/product/[slug]`
- `/product2` redesign (follow-up task)
- Catalog listing chrome overhaul (follow-up task)
- Use-case strips, unusual finds, help-choosing CTA, newsletter popups, autoplay-deal spam
- Switching preview to become the live home
- Open-parcel delivery (unless already offered operationally — not claimed on home)

### Later vision (same program, not this build)

One visual language for `/home2` → `/product2` → catalog entry points; implement product2 and catalog after home ships.

## 3. Audience & IA

- **Primary:** Shoppers who already know they need a charger / cable / earbuds / power bank
- **Secondary:** Light discovery for gift/curious browsers (not a magazine homepage)
- **Jobs:** (B) find type fast + (C) trust enough to browse

## 4. Page architecture

Top → bottom on `/home2`:

1. **Nav** — Logo · Shop types (Shop) · Search · Track order · Cart  
2. **Hero slider** — Ronin-inspired rich slides (structure only, not a clone)  
3. **Trust strip** — COD · Free shipping (threshold from settings) · Easy returns/warranty · Authentic/curated  
4. **Shop by type** — category tiles  
5. **Bestsellers** — curated conversion grid (max 8)  
6. **Proof** — testimonials  
7. **Footer** — Logo, shop types, Track, warranty/returns, contact  

Track order is **not** in the trust strip (nav/footer only).

## 5. Hero slider (product + admin)

### Shopper experience

- Rich slide: image, title, short line, price (when product), Shop CTA
- Autoplay with pause on hover; dots + arrows
- Desktop: **split panel** (copy left, art right)
- Mobile: **stack** (image above, copy below)
- Sold out: slide still visible, click disabled, “Out of stock” label
- Max **8** published slides

### Admin / data

New multi-row model (replace singleton `hero_sections` usage on `/home2`):

| Field | Notes |
|-------|--------|
| `image` | Required to publish slide |
| `product_id` | Required; resolves slug, default title, price, stock |
| `title`, `subtitle` | Optional overrides |
| `sort_order` | Manual order |
| `status` | draft / published (match CMS pattern) |

**Link targets (phase 1):** products only. Price/title/link auto-fill from product; overrides optional.

**Publish gate:** cannot publish the home experience with zero published slides — clear admin warning (same spirit for testimonials).

**Empty / invalid:** missing image → cannot publish that slide.

### Inspiration (not copying)

- Structure: [Ronin](https://ronin.pk/) multi-campaign slider energy  
- Color/type calm: [Biometic (v0)](https://v0.app/templates/biometic-wXiS4NDnMdY) light mono system  

## 6. Other sections — rules

| Section | Rules |
|---------|--------|
| Trust | Four items listed above; free-shipping copy uses `freeShippingThreshold` from settings when set |
| Shop by type | Show tile only if ≥1 **in-stock** product with usable image; else hide tile. If zero tiles → hide whole section |
| Bestsellers | Featured first, then fill with most **ordered**, fallback most **viewed**; dedupe; skip OOS; max 8. If zero → hide section (does not block publish) |
| Proof | ≥1 published testimonial required to publish; show up to 3 |
| Nav/Footer | As in architecture; no newsletter popup |

## 7. Visual system (phase 1)

**Direction:** Biometic light + quiet volt (teal labels only).

| Token | Value | Use |
|-------|--------|-----|
| Canvas | `#FAFAFA` | Page background |
| Surface | `#FFFFFF` | Panels, cards |
| Line | `#EAEAEA` | Borders / dividers |
| Muted | `#666666` | Secondary text |
| Ink | `#171717` | Text, primary buttons |
| Volt (quiet) | teal ~`#0f766e` | Eyebrows / section labels only |

- Density: **airy** — generous gaps, soft ~8–12px radius, bordered tiles  
- Typography: bold, tight tracking on headlines (Biometic-like), not Inter-default marketing mush  
- Motion: slider autoplay + pause on hover; 2–3 subtle transitions total — no glow spam  
- Avoid: purple SaaS, cream/terracotta cliché, dark neon gadget clone of old `/home2`

## 8. Impact analysis

### Data model

- **New:** `hero_slides` (or equivalent) table — multi-slide; migrate away from singleton-only hero for `/home2`
- **Keep:** `hero_sections` may remain for live `/` until a later cutover; preview must not break live
- **Reuse:** `products`, `testimonials`, `shop_types` / categories, `site_settings`, `order_items`, T-15 `analytics_events` (`product_view`) for bestsellers fill
- **Migration:** seed at least one slide from current featured hero product + image if possible so preview isn’t empty after deploy

### Storefront contact points

| Area | Change |
|------|--------|
| `app/home2/page.tsx` | New section stack |
| `components/gadget/*` | New hero slider; restyle nav/footer/cards to Biometic system |
| `app/layout.tsx` / gadget chrome | Nav item set |
| `lib/db/store.ts` | `fetchHeroSlides`, bestsellers query helper |
| Live `app/page.tsx` | **No change** |

### Admin contact points

| Area | Change |
|------|--------|
| `app/admin/hero/*` + API | Slide list CRUD, reorder, publish gates |
| Testimonials admin | Enforce ≥1 published before “home ready” warning (or shared publish checklist) |

### Tests / behavior that will change

- Any tests assuming singleton `fetchHero` on `/home2`
- Gadget hero component snapshots / unit tests if present
- Bestsellers ordering tests (new)

### Cross-cutting

- Demo session (`is_demo`) must filter slides/products/testimonials like today
- Images: Cloudinary / existing upload path — no new CDN
- Analytics: homepage should keep first-party tracker working on preview if already mounted in chrome

### Access / visibility

Not a warehouse-scope feature. Public shop + admin auth only. No per-module visibility table required.

### Spawned follow-up tasks

| ID | Title | Notes |
|----|--------|--------|
| T-17 | `/product2` redesign to match Biometic + guided buy | Depends on T-16 |
| T-18 | Catalog entry chrome for gadget preview | Depends on T-16 |
| T-10 | Homepage sections CRUD (generic blocks) | Still planned; T-16 hero slides are a focused slice, not full T-10 |

## 9. Testing (acceptance)

- [ ] `/home2` shows agreed sections in order with Biometic tokens  
- [ ] Slider autoplays, pauses on hover, dots/arrows work  
- [ ] Desktop split / mobile stack  
- [ ] OOS slide visible, non-clickable, labeled  
- [ ] Trust copy matches settings where applicable  
- [ ] Category tiles respect in-stock + image rule  
- [ ] Bestsellers = featured → orders → views, max 8  
- [ ] Admin: create/reorder/publish slides; block publish with 0 slides  
- [ ] Admin warning with 0 testimonials  
- [ ] Live `/` unchanged  
- [ ] Demo cookie still scopes demo catalog  

## 10. Open questions

None that block phase 1 behavior.

## 11. Approval

- [x] Architecture / data / visual wireframe approved in chat (2026-09-01)  
- [ ] User approved this written spec file  
- [ ] Implementation plan next (writing-plans) after spec OK  
