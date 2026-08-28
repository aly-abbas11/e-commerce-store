# Plan: T-01 — Replace Sanity with Supabase

## 1. Plain summary

This local store still reads and writes **Sanity**. We already created a new Supabase project named `e-commerce-store` (ref `xkqahftdjgkwncgrdkhc`, Sydney) and linked this repo to it.

T-01 moves **all current Sanity data** into that database, including images. Then we point the Next.js app at Supabase only. The site must still **look and work the same** — same pages, cart, cash-on-delivery checkout, and current theme.

We do a **hard switch** on this machine. If something breaks, we **stay on Supabase and fix it**. We do not add a switch back to Sanity.

Staff will not get a full product admin yet (that is T-02). `/studio` will send them to the existing admin login instead of a 404.

## 2. Goal

Done means: on this computer, `npm run dev` shows the real catalog, pages, checkout, order tracking, reviews, and current emails, all from Supabase. No page still calls Sanity. Every image lives on Cloudinary or Supabase Storage. Sanity Studio is no longer the editor.

## 3. In scope

- SQL tables that match today’s store objects (products, variants, pages, settings, orders, and the rest).
- CLI migrations pushed to the linked project (`supabase db push`).
- A copy script that reads Sanity and writes Supabase.
- Copy **every** Sanity record. Stop and fix if any row fails.
- Copy **every** image. Try Cloudinary first. If Cloudinary is missing or fails, upload to Supabase Storage.
- Replace `lib/sanity` with a server-side Supabase data layer. Keep the same function names the pages already use, where that is easy.
- Point checkout, orders, reviews, settings, messages, and email queue at Supabase.
- Block a second “Place order” click so only one order is saved.
- Redirect `/studio` to `/admin/login`.
- Allow `*.supabase.co` images in `next.config.mjs`.
- Put Supabase URL and key placeholders in `.env.example`. Real keys stay in gitignored `.env.local`.
- After copy, refuse to switch if the product list is empty.

## 4. Out of scope

- Full product CMS / new admin screens — T-02. Staff cannot edit products in a nice UI until then.
- New order-admin screens beyond what already exists — T-03.
- New email templates or extra status emails — T-04. Today’s confirmation / flow emails must still work.
- Funnel analytics in our own tables — T-05.
- Staging vs production split — T-06.
- Black-and-white redesign and extra TikTok/Instagram UI — T-07.
- Vercel production wiring — T-08.
- Card payments / Stripe. Checkout stays cash on delivery.
- A feature flag that turns Sanity back on.

## 5. Who this is for

- **Shoppers** on the local store: same browse, cart, COD checkout, track-order, reviews.
- **Store staff**: cannot use Sanity Studio. They use `/admin/login` for the existing broadcast tools. Product edits wait for T-02.
- **You (developer)**: one database (Supabase) to fix and extend.

## 6. How it works today

Sanity holds products, hero, pages, settings, testimonials, reviews, orders, email events, and WhatsApp broadcast data.

The Next.js server calls `fetchFromSanity` and `getWriteClient`. Images come from `cdn.sanity.io` and sometimes Cloudinary. Checkout is COD only. Orders and email events are Sanity documents (private dotted IDs). `/studio` is the CMS. If Sanity tokens are missing, orders are only logged, not saved.

## 7. How it will work after

The same screens call a new data layer that uses the **Supabase service role on the server**.

Shoppers never write the database from the browser with the anon key.

Public catalog reads go through Next.js. Checkout, reviews, and email queue writes go through Next.js API routes.

Images in the database are URLs we own (Cloudinary or Supabase Storage). The app does not depend on `cdn.sanity.io`.

`/studio` redirects to `/admin/login`.

## 8. Chosen approach

**Option 1:** real SQL tables, server-side Supabase client, CLI migrations.

Images: Cloudinary first; Supabase Storage if Cloudinary fails.

We picked this because catalog filters, stock, and orders need real columns. A JSON dump would be faster to copy and harder to run a store on. An extra ORM (Prisma/Drizzle) is not needed for this cutover.

## 9. Other options we considered

- **JSON document dump** — fast copy, weak queries. Rejected.
- **Prisma/Drizzle on top** — extra layer we do not use today. Rejected for T-01.
- **Move all images to Supabase Storage from the start** — extra risk; Cloudinary is already in the app. Rejected as the *first* path. It remains the **fallback** if Cloudinary fails.

## 10. Codebase contact points

| Area | What we change | Why |
|---|---|---|
| `supabase/migrations/` | Add SQL for all tables, indexes, RLS | Schema lives in git, then `db push` |
| `lib/sanity/*` | Replace with `lib/db` (or keep wrappers that call Supabase) | Single place pages already import |
| `lib/types.ts` | Drop `SanityImageSource`; use URL strings | Images are URLs after copy |
| `lib/catalog.ts`, `lib/checkout-server.ts`, `lib/order-store.ts`, `lib/message-store.ts` | Same public functions, new backend | Catalog, checkout, orders, broadcasts |
| `lib/sanity/image.ts` and every `imageUrl()` caller | Read URL strings / Cloudinary / storage public URL | No Sanity image builder |
| Storefront pages under `app/` | Little or no visual change; data source only | Keep look the same |
| `app/api/*` (checkout, orders, reviews, settings, flows, messaging, upload) | Write/read Supabase | Server writes only |
| `app/studio/[[...tool]]/page.tsx` | Redirect to `/admin/login` | No 404; no Studio |
| `next.config.mjs` | Allow Supabase storage host; drop Sanity host when unused | `next/image` |
| `package.json` | Add `@supabase/supabase-js` (and `@supabase/ssr` only if we need cookies; T-01 is server-service-role) | Talk to the project |
| Scripts that use `@sanity/client` | Point at Supabase or mark as Sanity-only migrate helpers | `frontend-ssr.mjs` etc. must not require Sanity after cutover |
| `.env.example` | Supabase placeholders | Local setup |
| `sanity/` folder and Studio deps | Stop using in the running app. Can leave files on disk until a later cleanup if safer, but the running app must not call them | Hard switch |

## 11. Screens and workflow impact

| Screen / flow | Before | After | Risk |
|---|---|---|---|
| Home, catalog, product, search, compare | Sanity | Supabase | Missing products or images |
| Cart + COD checkout | Sanity stock + orders | Supabase | Order not saved; double order |
| Track order | Sanity | Supabase | Old orders missing if copy failed |
| Blog, about, warranty, CMS pages | Sanity | Supabase | Missing pages |
| Write review | Sanity | Supabase | Review not stored |
| `/studio` | Sanity editor | Redirect to `/admin/login` | Staff look for Studio |
| Admin broadcast | Sanity message docs | Supabase tables | Broadcast list empty if copy failed |
| Emails on order | Sanity `emailEvent` | Supabase table | Queue not copied |

Cart, wishlist, and compare in the **browser** stay as they are (local state). Only server data moves.

## 12. Data and rules

Plain English first:

- One row per product. Variants are child rows. Images are URL strings on the product or child image rows.
- One settings row for the store (brand, colors, shipping, COD flag).
- One hero row. Pages and blog posts share a pages table (`page_type` static or blog).
- Testimonials and product reviews are tables. Review submissions waiting for approval stay a table.
- Orders have a unique `order_id`, customer fields, line items, totals, payment `cod`, status, and status history.
- Email queue rows keep kind, email, payload, due time, sent time.
- Broadcast campaigns and contacts stay tables.

Exact names (Postgres `public`):

- `products` — `id`, `sanity_id`, `name`, `slug` (unique), `brand`, `sku`, `category`, `price`, `compare_at_price`, `short_description`, `description` (jsonb Portable Text), `features` (jsonb), `specifications` (jsonb), `compatibility` (jsonb), `in_the_box` (jsonb), `product_video` (jsonb), `product_faq` (jsonb), `stock_status`, `rating`, `review_count`, `featured`, `badge`, `cloudinary_images` (jsonb of strings), timestamps.
- `product_images` — `id`, `product_id`, `url`, `sort_order`, `source` (`cloudinary` or `supabase`).
- `product_variants` — `id`, `product_id`, `key`, `name`, `sku`, `price`, `compare_at_price`, `stock_status`, `image_url`, `is_default`.
- `product_reviews` — embedded reviews copied from product documents.
- `review_submissions` — pending/approved/rejected queue.
- `site_settings` — single row (or keyed `id = 1`).
- `hero_sections` — single active hero + JSON for CTAs/stats + `featured_product_id`.
- `pages` — `slug` unique, `page_type`, `sections` jsonb, SEO fields, cover `url`.
- `testimonials`.
- `orders` — unique `order_id`, customer jsonb or columns, `payment`, money fields, `status`, `status_updated_at`.
- `order_items` — lines for each order.
- `order_status_history`.
- `email_events`.
- `message_campaigns`, `message_recipients`.
- `broadcast_contacts`, `broadcast_suppressed`.

**Statuses (unchanged):** product stock `in-stock` / `low-stock` / `out-of-stock`. Order `new` / `processing` / `shipped` / `delivered` / `cancelled`. Review submission `pending` / `approved` / `rejected`.

**Permissions:**

- Enable RLS on all tables.
- No public insert/update/delete for shoppers via the anon key.
- Next.js server uses `SUPABASE_SERVICE_ROLE_KEY` for reads and writes (same idea as today’s Sanity write token).
- Anon key may be used later; T-01 does not let the browser write catalog or orders.

**Validation:** unique product `slug`, unique `order_id`, COD only at checkout, prices checked server-side as today (409 if price changed).

**Idempotency:** checkout UI must ignore a second submit while a request is in flight and after success. Server must reject a duplicate `order_id` if one is sent twice.

## 13. Edge cases and decisions

- Happy path: copy all data and images, then switch the app.
- Image copy: all images must move. Cloudinary first; if Cloudinary is missing or fails, Supabase Storage. Do not cut over while any image is only on Sanity.
- Data copy: all-or-nothing. Stop, fix, continue. Do not skip rows.
- Empty catalog after copy: failed switch. Fix and retry.
- Permissions: server writes only. Shoppers read through the site. Product editing waits for T-02.
- Double checkout: block the second click. One order only.
- If the store breaks: stay on Supabase and fix. No Sanity fallback flag.
- `/studio`: redirect to `/admin/login`, not 404.
- Missing Cloudinary keys: use Supabase Storage for images.
- Concurrent copy: run the migrate script once; do not run two copies at the same time.
- Partial script crash: treat as failed; fix; re-run in a safe way (upsert by `sanity_id` / `order_id` so a retry does not duplicate).
- Old Sanity image URLs: not used after cutover.
- Performance: current catalog size is a normal store, not millions of rows. Normal indexes on `slug`, `category`, `order_id`, `customer email` are enough.
- Undo: git can revert code, but the agreed product path is fix-forward on Supabase.
- Mobile vs desktop: no layout change in T-01.
- Notifications: keep existing email sends; do not add new templates.

## 14. Step-by-step build order

1. **Env check**  
   **Where:** `.env.local` (gitignored), `.env.example`.  
   **What:** Require `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Keep existing Cloudinary vars.  
   **Verify:** Script prints “keys present” or “Cloudinary missing → will use Storage” without printing secret values.

2. **SQL migration**  
   **Where:** `supabase/migrations/<timestamp>_init_store.sql`.  
   **What:** Create tables, unique indexes, RLS, service-role access. Create a public storage bucket `product-images` for the Cloudinary fallback.  
   **Verify:** `supabase db push` (or dry-run then push). Tables visible in the Supabase dashboard.

3. **Supabase server client**  
   **Where:** `lib/supabase/server.ts`.  
   **What:** Create a server client with the service role. Never import this file into client components.  
   **Verify:** A tiny script or `db query` that `select count` on `products` works.

4. **Migrate script (data)**  
   **Where:** `scripts/migrate-sanity-to-supabase.mjs`.  
   **What:** Read all Sanity types we listed. Upsert into Postgres. Fail the process on the first unfixed error (after a clear log).  
   **Verify:** Counts in Supabase match Sanity counts for products, pages, orders, etc.

5. **Migrate script (images)**  
   **Where:** same script.  
   **What:** For each Sanity image, try Cloudinary upload; on missing keys or upload error, upload to Supabase Storage. Save the final URL on the row.  
   **Verify:** No product image URL contains `cdn.sanity.io`. Every product with images has at least one working URL. Zero remaining Sanity-only images.

6. **Empty-catalog gate**  
   **Where:** end of migrate script.  
   **What:** If `products` count is 0, exit with failure and do not tell us to switch the app.  
   **Verify:** Running against an empty destination fails loudly.

7. **Data layer swap**  
   **Where:** `lib/catalog.ts`, `lib/sanity/settings.ts` (or `lib/db/settings.ts`), `lib/order-store.ts`, `lib/message-store.ts`, `lib/checkout-server.ts`, `lib/sanity/image.ts`.  
   **What:** Same exports, Supabase inside. Keep `getStockState` as-is.  
   **Verify:** Typecheck (`npx tsc --noEmit`). Home and `/products` load locally with real names and prices.

8. **API routes**  
   **Where:** `app/api/checkout/route.ts`, orders, reviews, settings, flows, abandoned-cart, messaging, upload.  
   **What:** Persist to Supabase. Checkout: keep COD-only and price check; ignore duplicate submit (client `placing` plus server unique `order_id`).  
   **Verify:** Place one COD order. Refresh. Track page finds it by order id + email. Click Place order twice quickly → still one order.

9. **Pages and image helpers**  
   **Where:** pages and components that import `fetchFromSanity` / `imageUrl`.  
   **What:** Use the new layer and URL strings. No visual redesign.  
   **Verify:** Click through home, product, cart, checkout, track, blog, a CMS page, write-review. Same look as before.

10. **Studio redirect**  
    **Where:** `app/studio/[[...tool]]/page.tsx`.  
    **What:** Redirect to `/admin/login`.  
    **Verify:** Open `/studio` → land on admin login.

11. **Config and scripts**  
    **Where:** `next.config.mjs`, `scripts/frontend-ssr.mjs`, `scripts/frontend-ui.mjs` (and other Sanity scripts).  
    **What:** Allow Supabase image host. Verification scripts must run against Supabase or be updated so they do not fail the cutover.  
    **Verify:** `npm run build` succeeds without Sanity env. Local `npm run dev` does not request Sanity.

12. **Fix-forward**  
    **Where:** whatever broke.  
    **What:** If a page is empty or an image 404s, fix data or code on Supabase. Do not re-enable Sanity.  
    **Verify:** The failing screen works.

## 15. Impact and risks

- **Broken images** if we leave Sanity CDN URLs. Reduced by “all images must move” and URL check.
- **Lost orders** if copy misses private Sanity docs. Reduced by count checks and all-or-nothing.
- **Open database** if RLS is off and the anon key is in the browser. Reduced by server-only service role writes and RLS with no public writes.
- **Double orders.** Reduced by disabling the button and unique `order_id`.
- **Cannot edit products** until T-02. Accepted. Staff use SQL/dashboard or wait.
- **Verification scripts** still talk to Sanity and fail CI/local checks. Update them in step 11.
- **Secrets:** never commit `.env.local` or print API keys in logs.

## 16. Test checklist

- [ ] `supabase db push` applied; tables exist on `xkqahftdjgkwncgrdkhc`.
- [ ] Migrate: Sanity counts equal Supabase counts (products, pages, orders, reviews, emails, campaigns).
- [ ] No image URL is `cdn.sanity.io`.
- [ ] Product list is not empty after copy.
- [ ] Home, catalog, product detail, search, cart look the same.
- [ ] COD checkout creates one order.
- [ ] Double click Place order still one order.
- [ ] Track order works with that order id + email.
- [ ] Old copied orders still track if they existed in Sanity.
- [ ] Review submit stores a row.
- [ ] Existing email flow still queues/sends as today (or logs in dev without Resend key).
- [ ] `/studio` goes to `/admin/login`.
- [ ] Broadcast admin still lists contacts/campaigns.
- [ ] `npx tsc --noEmit` clean.
- [ ] `npm run build` without Sanity project id.
- [ ] If Cloudinary is unset, images still exist on Supabase Storage.

## 17. Open questions

None.

## 18. Approval

- [x] User approved this plan
- Date / note: 2026-08-26 — user replied “yes start implementation”

