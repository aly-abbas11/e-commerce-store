# Contact page + Shop All redesign (gadget preview)

**Date:** 2026-09-01  
**Surface:** `/contact` (new) + `/products2` + `/products2/[category]`  
**Out of scope:** Live `/` and `/products`, faceted price/stock sidebar, map, live chat, admin CMS for contact copy

## Goal

Raise browse→product and support reach rates on the cream/forest preview path: Shop All must feel trustworthy and easy to scan; Contact must get COD shoppers to WhatsApp/Call in one tap.

## Locked decisions (optimal)

| Decision | Choice | Why |
|----------|--------|-----|
| Shop All scope | Find bar + trust strip + shared shell | Conversion needs both access and reassurance |
| Contact priority | WhatsApp / Call first, form second | COD / PK support patterns; form keeps email channel |
| Contact route | Shared `/contact` | Already linked from nav/footer/sitemap/warranty |
| Chrome | Add `/contact` to gadget continuity | Keeps Biometic nav when coming from `/home2` |
| Claims | Only real settings (COD, warranty months, free-ship threshold, phone/WA/email) | No invented ratings or reply-time SLAs |
| Cards | Keep `GadgetArrivalCard` | Buy Now already converts; don’t rebuild cards |
| Live catalog | Unchanged | Preview-only work |

## Shop All

### Structure (top → bottom)

1. **Header** — Breadcrumb (`Home` → Shop / category), Fraunces title, one supporting sentence (COD + clear pricing tone).
2. **Trust strip** — Up to three cues from `normalizeSettings`: COD (if enabled), warranty label (if months set), free shipping threshold. Hide missing items; never invent.
3. **Sticky find bar** — Search input (`q`), sort chips (Featured, Price ↑, Price ↓), result count. Sticky under the nav while scrolling the grid. Mobile: stack search above sort.
4. **Category chips** — All + shop types; active = forest fill; horizontal scroll on small screens.
5. **Product grid** — `GadgetArrivalCard`; in-stock first (existing behavior).
6. **Empty state** — Clear copy + link to clear `q` / view all.

### Implementation shape

- Extract a shared server-friendly shell (e.g. `GadgetShopCatalog`) used by `/products2` and `/products2/[category]`.
- Sticky find bar may be a small client island; filtering/sorting can stay URL-driven (`?q=&sort=`) as today.
- Category page keeps category filter; still shows All + type chips for easy switching.

## Contact

### Structure

1. **Header** — “Contact us” + soft line (“We usually reply the same day”) — no numeric SLA.
2. **Primary CTAs** — Large WhatsApp + Call buttons from settings (`whatsappNumber`, `supportPhone` / `phone`). Hide either if unset.
3. **Secondary** — Email (if set) + links to `/track` and `/warranty`.
4. **Form** — Existing fields → `POST /api/contact`. Biometic styling when under `.gadget-theme` (variant or gadget-wrapped form). Keep live-chrome usable (shadcn tokens).
5. **Continuity** — `isGadgetContinuityPath` includes `/contact`.

### WhatsApp link

- Build `https://wa.me/<digits>` from configured number (strip spaces/`+`); if invalid/missing, omit button.

## Non-goals

- Redesigning live `/products` or `/search` catalog UI beyond existing session link rewrites.
- Price range / availability faceted filters.
- New webhook/admin inbox beyond current Slack/log contact API.

## Success checks

- From `/home2`, Contact and Shop All keep gadget chrome.
- Shop All: search + sort update URL and grid; trust strip only shows configured facts.
- Contact: WhatsApp/Call open correctly when configured; form still succeeds via `/api/contact`.
- Live `/products` look and routes unchanged.

## Files (expected)

| Path | Role |
|------|------|
| `app/contact/page.tsx` | New contact page |
| `components/gadget/gadget-contact-*.tsx` | Channels + themed form wrapper (as needed) |
| `components/gadget/gadget-shop-catalog.tsx` | Shared shop shell |
| `app/products2/page.tsx` | Thin page → shell |
| `app/products2/[category]/page.tsx` | Thin page → shell |
| `lib/gadget-preview.ts` | `/contact` continuity |
| `lib/gadget-preview.test.ts` | Continuity tests |
| `components/sections/contact-form.tsx` | Optional `variant` for Biometic look |
