# Spec: T-06 — Demo sandbox (same database)

## Objective

Let you walk the real shop as a **demo shopper** (`/demo/login`, user `demo` / password `demo`), tag everything that sandbox creates, and wipe **only** that layer from `/admin`. Live catalog and live orders stay. No second Supabase project.

**User:** you on `/demo/login`. Real customers stay guests.

**Why now:** Test cart, COD, emails, and admin packing without mixing test rows into live data and without a second database.

**Success:** Log in at `/demo/login` → a banner shows the demo account → you can see demo products/pages (guests cannot) and place orders that are marked demo → **Remove demo data** in admin deletes only `is_demo` rows.

## Tech stack

- Next.js 14 App Router, same cookie pattern as admin (`vg_admin`)
- Same Supabase project. New `is_demo` columns where missing
- Shop queries already hide demo **reviews** and **testimonials**. Extend that to products, pages, and orders
- Unit tests: `lib/db/demo-rules.ts` + `lib/db/demo-rules.test.ts`

## Commands

```
npm run dev
npm test
npx tsc --noEmit
```

Schema change needs `supabase db push` — **ask before pushing**.

## Project structure

```
app/demo/login/page.tsx
app/api/demo/login/route.ts
app/api/demo/logout/route.ts
components/demo/demo-login-form.tsx
components/demo/demo-banner.tsx          → shown on the shop when the demo cookie is set
app/admin/...                            → Remove demo data
app/api/admin/demo/route.ts              → DELETE purge (admin only)
lib/demo.ts                              → cookie + isDemoRequest
lib/db/demo-rules.ts                     → visibility + purge list (unit-tested)
supabase/migrations/YYYYMMDDHHMMSS_demo_sandbox.sql
```

Do not add real customer accounts. Do not create a second database.

## Locked decisions

| Topic | Decision |
|---|---|
| Approach | Same DB + `is_demo` flags + `/demo/login` (not a second Supabase) |
| Login | `/demo/login` — username `demo`, password `demo` |
| Session | httpOnly cookie `vg_demo` (same idea as `vg_admin`) |
| Guest shop | Published **and** `is_demo` is not true |
| Demo session | Published, **including** `is_demo` rows, plus live catalog |
| New orders in demo session | Always `is_demo = true` even if the product is live |
| New reviews in demo session | `is_demo = true` |
| Admin CMS | Checkbox **Demo** on products, pages, testimonials. Guests never see those |
| Purge | Admin **Remove demo data** deletes every `is_demo` row (and demo orders’ items/history) |
| Singletons | Hero and site settings are **not** demo and **not** purged |
| Emails | Demo checkout still sends confirmation (so you can test T-04). Status emails still send |
| Clarity | Still off until T-08 |
| Public `/demo/login` | Intentional. `demo` / `demo` is guessable |

## Approaches considered

1. **Same DB + demo cookie + `is_demo` (chosen).** Matches “demo user” and “wipe demo data.”
2. Second Supabase project. True isolation, extra project, extra env. Rejected.
3. Whole-site `DEMO_MODE` env. Would hide or fake the live store. Rejected.

## Architecture

```
Guest
  → shop queries: published AND is_demo is not true

POST /api/demo/login { username: "demo", password: "demo" }
  → Set-Cookie vg_demo
  → Banner: “Demo account”

Demo session checkout / review
  → persist with is_demo = true

Admin
  → Demo badge on demo orders
  → POST/DELETE purge → delete is_demo products, pages, testimonials,
     reviews, review_submissions, orders (cascade items/history)
```

Migration adds `is_demo boolean not null default false` on `products`, `pages`, `orders`, `review_submissions` (reviews and testimonials already have it).

Sitemap and `/api/store/products` stay guest-shaped (no demo products).

## Admin screens

- Orders table: **Demo** badge when `is_demo`
- Product / page / testimonial forms: **Demo** checkbox (Save/Publish still apply)
- Settings area or Orders page: **Remove demo data** with a confirm. Admin cookie required.

## Shop

- Banner while the demo cookie is set: demo account name, Sign out → `/api/demo/logout`
- `/demo/login` `noindex`. Middleware does not require the cookie except we do not treat `/demo` as admin.

## Error handling

| Case | Behavior |
|---|---|
| Wrong demo login | 401, same pattern as admin |
| Guest opens a demo-only product URL | 404 (do not leak that it exists) |
| Purge unsigned | 401 |
| Purge empty | Success, “No demo data” |
| Live product ordered in demo session | Order is demo; product is **not** deleted on purge |

## Testing strategy

Failing tests first (`lib/db/demo-rules.ts`).

- Guest catalog excludes `is_demo` products
- Demo session catalog includes them
- `markDemoOrder` sets `is_demo` regardless of product
- Purge list is only `is_demo` ids — live orders/products absent
- Login accepts only username `demo` and password `demo`

`npx tsc --noEmit` clean.

**Manual:** `/demo/login` → banner → add to cart → place order → `/admin/orders` shows Demo → Remove demo data → live orders remain. Guest `/products` never listed the demo product.

## Boundaries

- **Always:** Guests never see `is_demo` catalog. Demo session tags new orders/reviews. Purge is admin-only and only `is_demo`.
- **Ask first:** `supabase db push`. Changing `demo`/`demo` to a secret. Demo login using `ADMIN_TOKEN`.
- **Never:** Second database. Real customer accounts. Wiping hero/settings. Clarity on localhost.

## Out of scope

- T-05 Clarity (after T-08)
- T-07 storefront redesign, T-08 Vercel
- Staff accounts, card payments, courier APIs

## Success criteria

- [ ] `/demo/login` with `demo` / `demo` sets a cookie and shows a shop banner
- [ ] Guests do not see demo products/pages; demo session does
- [ ] Demo-session orders are `is_demo` and can be packed in admin
- [ ] Remove demo data deletes only demo rows
- [ ] Hero/settings untouched
- [x] `npx tsc --noEmit` and `npm test` pass
- [x] Schema pushed only after you approve

## Open questions

None. Intent confirmed 2026-08-26.
