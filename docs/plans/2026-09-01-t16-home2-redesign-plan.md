# Plan: T-16 /home2 redesign

## 1. Plain summary
We rebuild the gadget preview homepage at `/home2` so VoltGear feels calm, clear, and trustworthy. Shoppers see a product campaign slider, then trust, categories, bestsellers, and reviews. Staff manage slider images and product links in admin. The live shop at `/` does not change yet.

## 2. Goal
`/home2` matches the approved design: Biometic light look, Ronin-style product slider, conversion-core sections, and clear admin publish rules.

## 3. In scope
- New hero slides in the database and admin
- New `/home2` layout and gadget nav/footer look
- Trust, categories, bestsellers, proof rules from the spec
- Unit tests for slide publish rules and bestsellers ranking

## 4. Out of scope
- Live `/` switch — keep current shop
- `/product2` redesign — T-17 later
- Catalog chrome overhaul — T-18 later
- Extra discovery sections (use-cases, unusual finds)

## 5. Who this is for
- Shoppers on the preview URLs
- Store owner using `/admin/hero`
- You, reviewing before making preview the live home later

## 6. How it works today
`/home2` uses a single hero, category tiles, featured products, and testimonials in a dark zinc/yellow gadget look. Admin hero is one singleton row for the live home fields.

## 7. How it will work after
`/home2` uses light Biometic colors. Multiple admin slides drive the hero. Trust sits under the hero. Categories and bestsellers follow the locked rules. Live `/` still uses the old singleton hero.

## 8. Chosen approach
Category-led page under a product campaign slider; Biometic + quiet teal; airy density; product-only slide links for phase 1.

## 9. Other options we considered
- Live `/` first — rejected; safer on preview
- Full autoplay-only image carousel without product data — rejected; rich slides won
- Pure mono with no volt accent — rejected; quiet teal keeps brand

## 10. Codebase contact points
See implementation plan file map in `docs/superpowers/plans/2026-09-01-t16-home2-redesign.md`.

## 11. Screens and workflow impact
- `/home2`: full visual + section change
- `/admin/hero`: slide list instead of (or above) legacy singleton for preview
- `/`, checkout, cart: unchanged

## 12. Data and rules
- Table `hero_slides`: image, product_id, title, subtitle, sort_order, status, is_demo
- Publish home needs ≥1 published slide and ≥1 published testimonial
- Bestsellers: featured → orders → views, max 8

## 13. Edge cases and decisions
All agreed in the design spec (OOS slides, empty categories, caps, trust copy, etc.). No open TBDs.

## 14. Step-by-step build order
Follow Tasks 1–8 in `docs/superpowers/plans/2026-09-01-t16-home2-redesign.md`.

## 15. Impact and risks
- Migration must not break live `hero_sections`
- Bestsellers need order/view queries — fall back gracefully if analytics empty
- Preview with zero slides looks broken until admin adds one — gate + seed guidance

## 16. Test checklist
Same as design spec §9 plus `npm test` and `tsc --noEmit`.

## 17. Open questions
None.

## 18. Approval
- [ ] User approved this plan
- Date / note: …
