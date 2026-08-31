# UI Plan: T-19 Gadget craft system

## 1. Plain summary
This UI work makes the gadget preview feel premium and trustworthy with shared motion, type, icons, and conversion words. Live shop stays old look.

## 2. Links
- Product plan: `docs/plans/2026-09-01-t19-gadget-craft-system-plan.md`
- Spec intake: T-19 in `docs/dev-priorities.md`
- Palette: `docs/ui/2026-09-01-gadget-biometic-palette.md`
- Related chat: preview-only, Option 1 craft tokens, Fraunces+DM Sans, SVG no emoji, noticeable motion

## 3. Goal
Shoppers feel calm confidence and act (browse → Buy Now → checkout) with less friction. UI looks handcrafted Biometic, not generic AI SaaS.

## 4. In scope (screens & surfaces)
- `/home2` hero, trust, bestsellers, lifestyle, categories, reviews, blogs
- `/products2`, `/products2/[category]`
- `/product2/[slug]` buy box + sections
- Care: contact, track, faq, warranty, shipping-returns
- Company: about, privacy, terms, bulk-order, blog list/post
- Gadget cart page + cart drawer (session)
- Compare (session)
- Shared: navbar/footer icons, chips, buttons, empty states

## 5. Out of scope
Live `/`, admin, Framer Motion, emoji UI, new color brand, map/chat widgets

## 6. Current app UI snapshot
- Colors: cream `#F5F1E8`, forest `#1F3626`, sage `#8FA888`, charcoal, taupe
- Type: Fraunces display, DM Sans UI
- Motion: hover scale/lift, `.gadget-reveal`, review card keyframes, reduced-motion hooks
- Icons: Lucide in nav; custom `CategoryGlyph` circles
- Tone: calm retail, COD-first
- Density: airy marketing home; shop grid normal

## 7. Research collage
| Source | Steal | Fit |
|--------|-------|-----|
| [css-animation.com state motion a11y](https://www.css-animation.com/accessible-motion-architecture/focus-and-state-motion-accessibility/) | Non-motion hover cue + transform/opacity | High |
| [Motion.page performance](https://motion.page/docs/sdk/performance) | Play-once reveals, stagger groups | High |
| [Tōdai product card](https://todai.bariafurii.com/en/anatomy-of-a-product-card/) | Buy actions always in DOM | High |
| [Strive / Tentenc typography](https://strive-commerce.com/guides/typography-for-online-stores) | Serif+sans, 2 families max | High (keep current pair) |
| [Lucide](https://lucide.dev/) / [Phosphor](https://phosphoricons.com/) | Consistent UI stroke icons | High |
| [Cartylabs / ConvertCart microcopy](https://cartylabs.com/blog/shopify-checkout-microcopy-guide/) | Specific trust lines under CTAs | High |
| Avoid | Purple glow AI kits, emoji nav, layout-property animation | — |

Themes seen: compositor-only motion, play-once scroll, familiar CTAs, trust beside Buy Now, custom category art.

## 8. Chosen direction
**Craft token system (Option 1)** — deepen Biometic with motion/type/icon/voice tokens. Exceptional = coherence and restraint, not spectacle.

## 9. Directions we did not pick
Framer-heavy (2), light-only polish (3), full rebrand (4).

## 10. Visual mockup index
Text-wireframe labels (image gen not required for approval):
- UI-01 Home section reveal sequence
- UI-02 Category glyph circle hover
- UI-03 Product card + Buy Now (always visible)
- UI-04 PDP CTA + trust line
- UI-05 Care page header type scale
- UI-06 Reduced-motion = static final

## 11. Design tokens
### Color (unchanged Biometic)
Use existing `--g-*` vars.

### Motion
| Token | Value | Use |
|-------|-------|-----|
| `--g-ease` | `cubic-bezier(0.22, 1, 0.36, 1)` | Reveals |
| `--g-dur-fast` | `180ms` | Hover/focus |
| `--g-dur-med` | `320ms` | Card lift |
| `--g-dur-reveal` | `700ms` | Section enter |
| Lift | `translateY(-2px)` to `-4px` | Cards |
| Scale | `1.03` max image | Media hover |

Reduced-motion: opacity/transform none; keep border-color change on hover.

### Typography
| Role | Font | Size (mobile → desktop) | Weight |
|------|------|-------------------------|--------|
| Display H1 | Fraunces | 2.25rem → 3rem | 600 |
| Section H2 | Fraunces | 1.5rem → 2rem | 600 |
| Body | DM Sans | 0.9375–1rem | 400 |
| UI / CTA | DM Sans | 0.875rem | 600 |
| Eyebrow | DM Sans | 0.6875rem | 600 uppercase tracking |

Price: tabular nums where possible; never Fraunces for tiny UI.

### Spacing / radius
Keep current 2xl cards (~1rem radius), max-w-6xl home/shop, max-w-3xl care.

### Breakpoints
Existing sm/md/lg; touch targets ≥44px.

## 12. Layout system
No shell redesign. Craft layers onto existing gadget chrome.

## 13. Component inventory
| Name | Purpose | States | New/reuse |
|------|---------|--------|-----------|
| `GadgetReveal` | Scroll enter | hidden/in, delay, reduced | Reuse+extend |
| Motion utility classes | hover-lift, press | hover/focus/active | New CSS |
| Type utility classes | display/section/body | — | New CSS |
| `CategoryGlyph` | Category art | default/hover | Upgrade |
| Lucide icons | Nav/care UI | decorative | Reuse consistent stroke |
| Buy Now button | Convert | default/hover/disabled/sold-out | Reuse + copy |
| Trust micro-line | Under CTA | shown/hidden if no settings | New pattern |
| Empty state | Shop/cart | — | Copy refresh |

## 14. Screen-by-screen spec

### Home `/home2`
- Purpose: discover → category/product
- Layout: existing sections
- Motion: each major section `GadgetReveal` with 0/80/160ms stagger children where cheap
- Copy: keep short benefit lines; no fake stats
- Mockup: UI-01

### Shop `/products2`
- Sticky find bar unchanged structurally
- Category chips: upgraded glyphs where circles used
- Empty: “No matches — clear search”
- Mockup: UI-02

### PDP `/product2`
- Buy Now primary; line under: COD / warranty / free ship from settings only
- Specs headings use section type class
- Mockup: UI-04

### Care / company pages
- Existing `GadgetSupportLayout` / `GadgetArticleShell`
- Apply display/body scale; Lucide icons forest color
- Mockup: UI-05

### Cart (gadget session)
- Forest checkout button; shipping progress bar already themed
- Empty: browse products2

## 15. User flows (UI steps)
1. Land `/home2` → sections reveal → tap category → `/products2/[cat]`
2. Open product → Buy Now → cart drawer feedback → checkout `?from=gadget`
3. Footer Care → warranty/shipping → Contact WhatsApp

## 16. Accessibility
- `prefers-reduced-motion` honored
- Focus visible rings forest
- Decorative glyphs `aria-hidden`
- CTAs not hover-only
- Contrast charcoal on cream

## 17. Content & microcopy
- Buttons: “Buy now”, “Proceed to checkout”, “Send message”, “Browse products”
- Under Buy Now examples (only if true): “Cash on delivery”, “X-month warranty”, “Free shipping over Rs …”
- Avoid: “100% safe!!!”, fake countdown, emoji bullets

## 18. Build order (UI only)
Match product plan §14 steps 1–7.

## 19. Impact on existing screens
Preview surfaces gain craft; live shop untouched.

## 20. Open questions
None.

## 21. Approval
- [x] User approved this UI plan
- Date / note: 2026-09-01 — user replied “approve”
