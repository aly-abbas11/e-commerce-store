# Demo sandbox implementation

Same Supabase project as live. A demo cookie reveals extra catalog and tags new orders/reviews so you can wipe them from admin. There is no second database.

## Who uses it

- **You** at `/demo/login` (username `demo`, password `demo`). Cookie `vg_demo`.
- **Guests** never see `is_demo` products, pages, testimonials, or reviews.
- **Admin** (`ADMIN_TOKEN`) can check **Demo** on CMS forms and run **Remove demo data** on `/admin/orders`.

## Shop

While the cookie is set, a banner sits under the ticker with Sign out (`POST /api/demo/logout`). Catalog, search, product pages, blog, and `/api/store/products` include demo rows. Checkout and review submit always persist `is_demo = true`, even on a live product.

A guest opening a demo-only URL gets a generic 404. Sitemap and robots stay guest-shaped (`/demo` is disallowed). `/demo/login` is `noindex`.

## Admin

Product, page, and testimonial forms have a **Demo** checkbox. Publish writes `is_demo`. Demo orders show a **Demo** badge on the list and detail.

**Remove demo data** confirms, then `DELETE /api/admin/demo` (admin cookie required) deletes `is_demo` rows on products, pages, testimonials, product reviews, review submissions, and orders (items/history cascade). Empty purge returns `{ empty: true }` and the UI says “No demo data”. Hero and site settings are never deleted.

## Schema

Migration `supabase/migrations/20260826180000_demo_sandbox.sql` adds `is_demo boolean not null default false` on `products`, `pages`, `orders`, and `review_submissions` (reviews and testimonials already had the column). Pushed 2026-08-26.

## Key files

| Path | Role |
|---|---|
| `lib/db/demo-rules.ts` | Login, visibility, purge list (unit-tested) |
| `lib/demo.ts` | Cookie helpers |
| `app/demo/login/page.tsx` | Sign-in page |
| `app/api/demo/login/route.ts` | Sets `vg_demo` |
| `app/api/demo/logout/route.ts` | Clears cookie |
| `components/demo/demo-banner.tsx` | Shop banner |
| `app/api/admin/demo/route.ts` | Admin purge |
| `components/admin/remove-demo-data.tsx` | Confirm + wipe |
| `lib/db/store.ts` | Guest vs demo catalog filters |

## Out of this module

Second Supabase project, real customer accounts, changing `demo`/`demo` to a secret, Clarity (T-05), Vercel (T-08), wiping hero or settings.
