# Plan: T-19 Gadget craft system (motion, type, copy, icons)

## 1. Plain summary
We will make the VoltGear **gadget preview** feel premium, calm, and trustworthy. Shoppers should notice smooth motion, clear type, honest words, and realistic icons. The goal is faster find → product → buy (COD). Live shop at `/` does not change. We will not add a heavy animation library or emoji chrome.

## 2. Goal
Done means: one shared craft layer on preview (motion tokens, type scale, icon set, voice rules) applied on home, shop, PDP, care/company pages, and gadget cart/compare — with reduced-motion support and no invented trust claims.

## 3. In scope
- CSS motion tokens + expand `GadgetReveal` (play-once, stagger delays)
- Type scale refinements for Fraunces + DM Sans (sizes/weights/line length)
- Conversion microcopy pass (CTAs, trust lines under buttons, empty states)
- Upgrade category glyphs + consistent Lucide UI icons (decorative `aria-hidden`)
- Apply on gadget preview routes only
- Document tokens in `docs/ui/`

## 4. Out of scope
- Live `/` and `/products` redesign — keep both shops
- Framer Motion / GSAP page transitions — CWV risk
- New brand colors / full visual rebrand — Biometic stays
- Emoji in UI chrome — trust risk
- Invented ratings, customer counts, or fake SLAs — site-config rules
- Admin redesign

## 5. Who this is for
- Shoppers on gadget preview (COD buyers in PK)
- You reviewing `/home2` → buy path for conversion feel

## 6. How it works today
Biometic cream/forest exists. Fraunces + DM Sans loaded. Some hovers and `GadgetReveal` on home. Simple SVG category glyphs. Copy is uneven. Care pages are themed but craft is not one system.

## 7. How it will work after
One craft system: sections reveal once with soft motion; cards lift with border/shadow cues; type hierarchy is consistent; CTAs say clear actions with COD/warranty lines from real settings; categories use richer custom glyphs; UI chrome uses one Lucide weight.

## 8. Chosen approach
**Option 1 — Craft token system** (exceptional within CSS + existing React, not Option 2 libraries). Uniqueness comes from coherent motion + voice + icons on Biometic, not from trendy animation frameworks.

## 9. Other options we considered
- Option 2 Framer Motion — rejected for bundle/CWV and over-animation risk
- Option 3 light polish only — too weak for “exceptionally great”
- Option 4 new brand — fights locked Biometic

## 10. Codebase contact points
| Area | Change | Why |
|------|--------|-----|
| `app/globals.css` | Motion + type token classes | Single source |
| `components/gadget/gadget-reveal.tsx` | Stagger-friendly delays | Reuse |
| `components/gadget/gadget-fonts.ts` | Keep families; maybe weight vars | Locked A |
| `components/gadget/gadget-category-glyphs.tsx` | Richer product glyphs | Icons |
| Home sections / cards / buy box | Apply tokens + copy | Conversion |
| Support / article shells | Type + icon consistency | Care path |
| Cart drawer gadget branch | Micro feedback + copy | Buy path |
| `lib/gadget-preview` / tests | Only if new helpers | Optional |

## 11. Screens and workflow impact
| Screen | Before → after | Risk |
|--------|----------------|------|
| `/home2` | Ad hoc motion → tokenized reveals | Over-motion if delays too long |
| `/products2` | Flat chips → clearer type + glyph polish | None if SVG only |
| `/product2` | Good buy box → trust microcopy under CTA | Claim honesty |
| Care/company | Themed → matching type/icons | Low |
| Cart/compare (session) | Themed → same craft | Low |
| Live `/` | Unchanged | Must not break |

## 12. Data and rules
- Trust lines only from `normalizeSettings` (COD, warranty months, free-ship threshold, phone/WA)
- Motion: `transform`/`opacity` only; `prefers-reduced-motion` → instant final state + non-motion hover border/bg
- Icons: custom filled SVGs for categories; Lucide for UI; no emoji in chrome
- Copy: short, specific, no exclamation spam; familiar CTAs (“Buy now”, “Place order”)

## 13. Edge cases and decisions
- Reduced motion → agreed: keep state feedback, drop travel
- Missing settings → hide claim, don’t invent
- Large product grids → stagger only first row / section, not every card IO
- Slow devices → short durations (≤400ms interactive, ≤700ms reveal)
- Keyboard users → focus rings stay; Buy Now always in DOM (not hover-only)
- Out of stock → clear CTA copy, no fake urgency
- Double-submit / cart feedback → existing cart effects; polish message only

## 14. Step-by-step build order
1. Add motion/type CSS tokens under `.gadget-theme` in `globals.css` — verify reduced-motion in DevTools.
2. Extend `GadgetReveal` delay usage on `/home2` sections — verify play-once scroll.
3. Upgrade `CategoryGlyph` set + map shop types — verify category slider.
4. Apply type scale classes to support/article/shop headers — visual check.
5. Microcopy pass: buy box, cart, contact CTAs, empty states — only real trust facts.
6. Lucide consistency pass on gadget nav/footer/support icons — stroke weight 1.75–2.
7. Smoke: `/home2` → product → Buy Now → cart → checkout chrome; care footer links.
8. Update `docs/modules/storefront` + close T-19 notes when approved shipped.

## 15. Impact and risks
- Motion fatigue → keep subtle-noticeable, not bold
- Bundle size → no new motion library
- Accidental live theme leak → tokens only under `.gadget-theme`

## 16. Test checklist
- [ ] Preview home reveals once; reduced-motion shows content immediately
- [ ] Category glyphs render for all mapped types + fallback
- [ ] Buy Now always visible on mobile (not hover-only)
- [ ] Trust lines match settings or hide
- [ ] Live `/` unchanged
- [ ] `npx tsx --test lib/gadget-preview.test.ts` still green

## 17. Open questions
None — defaults locked by “choose best.”

## 18. Approval
- [x] User approved this plan
- Date / note: 2026-09-01 — user replied “approve”
