# Spec: T-02 — Custom admin CMS

## Objective

Replace Sanity Studio with a staff CMS **in this Next.js store** so one editor can add and edit the full catalog and site content, then publish it to the shop.

**User:** the store owner, alone, using the existing `/admin/login` shared password (`ADMIN_TOKEN`).

**Why now:** T-01 moved data to Supabase and turned `/studio` into a login redirect. There is no editor. The shop still looks the same; this task adds the missing staff UI, not a storefront redesign.

**Success:** From `/admin`, you can create a product from scratch with **every field the product page already uses** (including video), edit existing catalog and content, keep drafts off the shop until Publish, and leave the live version in place while you edit. Shoppers never see `/admin`. `/studio` still lands at `/admin/login`.

## Tech stack

- Next.js 14 App Router (existing app)
- Supabase Postgres + service-role server client (`lib/supabase/server.ts`)
- Existing `ADMIN_TOKEN` Bearer guard (`lib/admin.ts`) plus an httpOnly cookie so `/admin` routes can be blocked on the server
- Cloudinary first for file uploads; Supabase Storage bucket `product-images` if Cloudinary is missing or fails
- Current UI components (`components/ui/*`). Admin is functional, same visual language as the rest of the app. Black-and-white storefront is T-07.

## Commands

```
npm run dev
npm test
npx tsc --noEmit
npx supabase db push
```

Do not commit secrets. Keys stay in gitignored `.env.local`.

## Project structure

```
app/admin/                 → staff pages (login, lists, editors)
app/api/admin/             → authenticated write APIs
components/admin/          → shell, publish bar, media field, forms
lib/admin.ts               → Bearer (and cookie) guard
lib/admin-token.ts         → browser token helper
lib/db/store.ts            → shop reads; must filter published only
lib/db/admin-store.ts      → admin reads/writes including drafts
lib/db/publish.ts          → draft → live mapping (unit-tested)
supabase/migrations/       → status + draft columns, backfill
docs/superpowers/specs/    → this spec
```

Messaging UI stays at `/admin/broadcast` and is linked from the new sidebar. Do not rebuild it.

## Locked decisions

| Topic | Decision |
|---|---|
| Approach | Custom admin in this Next.js app (not Payload/Directus, not a portable CMS kit) |
| Who logs in | One person, existing shared password |
| Content coverage | Everything Studio could edit **except orders** (T-03) |
| Product fields | **All of them**, including add-new. Not a thin name/price form |
| Video | Product video URL (Instagram / TikTok / MP4), Cloudinary public ID, poster |
| Media input | Upload a file **or** paste a URL |
| Save vs Publish | Save writes a draft. Shoppers see it only after Publish |
| Edit a live record | Shoppers keep the **old live version** until Publish |
| Draft scope | Products, pages, testimonials, reviews-on-product, **hero**, **site settings** |
| Shop filter | Storefront, search, sitemap: `status = published` only |
| Images | Cloudinary first; Storage fallback |
| Admin look | Current app chrome. No T-07 redesign |
| After login | Product list, not broadcast |

## Product fields the editor must expose

On **create** and **edit**:

- Basics: name, slug, brand, SKU, category, price, compare-at price, stock status, badge, featured
- Media: image gallery (upload or URL, reorder, remove)
- Video: `url`, `cloudinaryPublicId`, `poster` (empty hides the shop section, same as today)
- Variants: name, SKU, price override, compare-at override, stock, image, default flag
- Copy: short description, full description (stored as today’s Portable Text JSON so the shop `RichText` renderer still works; a textarea wrapped as one block is enough), features, specifications, compatibility, in the box, FAQ
- Reviews attached to that product (add/edit/delete the reviews shown on the product page)

Slug is generated from name on first create and is editable. Slug must stay unique across all product rows (draft and published).

## Status model

Each editable record has:

- `status`: `draft` | `published` | `unpublished`
- `draft`: JSON of the pending document, or null if there is nothing unpublished

| Action | Effect |
|---|---|
| **Save** | Write `draft` only. Live columns unchanged. Do not revalidate the shop. |
| **Publish** | Copy `draft` onto live columns and child tables. `status = published`. Clear `draft`. Revalidate affected paths. |
| **Unpublish** | `status = unpublished`. Live data kept. Shop hides it. |
| **Discard draft** | Set `draft` to null. Form reloads from live columns. |
| **New product / page / testimonial** | Inserted as `status = draft`. Invisible on the shop until Publish. First Save requires **name + slug**. |
| **Delete** | Never-published drafts: delete with one confirm. Published or unpublished: Unpublish, or delete with a second confirm. |

Existing catalog (16 products, pages, hero, settings, testimonials) is backfilled to `status = published` and `draft = null`.

Hero and site settings stay singletons (one row). They still use `draft` + Publish so a half-edited banner does not go live on Save.

### Reviews (two surfaces, one consistency rule)

1. **Product form reviews** — part of the product `draft`. They hit the shop on product Publish, when child `product_reviews` rows are replaced from the draft document.
2. **Review submissions queue** (shopper write-review form) — Approve or Reject. Approve appends that review to the **live** `product_reviews` of a published product **and** to `draft.reviews` if a draft exists, so a later Publish does not wipe the approved review. Reject sets submission status to rejected and does not show on the shop.

## Architecture

```
Browser admin form
    → POST /api/admin/...  (cookie or Authorization: Bearer ADMIN_TOKEN)
        → Next.js server (service-role Supabase)
            → Save: draft JSON
            → Publish: live columns + children (atomic) + revalidatePath
Shop pages
    → lib/db/store.ts
        → SELECT ... WHERE status = 'published'
```

- Shoppers never use the service role or admin APIs.
- Browser never holds `SUPABASE_SERVICE_ROLE_KEY`.
- Login (`POST /api/admin/login`) sets the existing sessionStorage token **and** an httpOnly cookie so `/admin/*` (except `/admin/login`) can redirect on the server when signed out.
- `/studio` continues to redirect to `/admin/login`.

Publish of a product must be **atomic**: live row + `product_images` + `product_variants` + `product_reviews` swap together. If Publish fails, live data stays as it was and the draft remains. Implement as a Postgres function or a single server routine that does not leave half-updated children.

On Publish, revalidate at least: `/`, `/products`, `/products/[category]`, `/product/[slug]`, `/search`, `/sitemap.xml`, and the specific page slug when publishing a page. Hero/settings Publish revalidates `/` and layout-facing paths.

## Screens

Admin uses a shared shell: sidebar on desktop, menu on phone. Functional styling; not T-07.

**Nav:** Products · Pages · Hero · Settings · Testimonials · Reviews · Messaging

**Every editor chrome:** status line (`Draft` / `Live` / `Unpublished` / `Unsaved draft`) and actions: Discard draft · Save · Unpublish · Publish.

| Screen | Behavior |
|---|---|
| `/admin/login` | Existing password form. Success → `/admin/products` (not broadcast). |
| `/admin/products` | List: thumbnail, name, slug, status, stock, price. Search. New product. |
| `/admin/products/new` and `/admin/products/[id]` | One scrolling page, sections: Basics, Media, Video, Variants, Copy, Reviews. |
| `/admin/pages` | List + editor: title, slug, type, cover, SEO, body sections (existing `ContentBlock` shapes: heading, paragraph, list, etc.). |
| `/admin/hero` | Headline, subhead, background image/video, CTAs, stats, featured product. |
| `/admin/settings` | Brand, contact, social (including Instagram/TikTok URLs), shipping, announcement, SEO. |
| `/admin/testimonials` | List + editor. |
| `/admin/reviews` | Pending submissions: approve or reject. |
| `/admin/broadcast` | Existing messaging UI, unchanged, linked from the sidebar. |

Shoppers requesting `/admin` without a cookie go to login. Admin pages send `robots: noindex`.

## Media and video

- Image field: file picker **or** paste URL. Reorder and remove.
- Upload API (admin-authenticated): try Cloudinary; on missing keys or failure, upload to Storage bucket `product-images` and store that public URL.
- Video: same URL-or-upload pattern. Instagram / TikTok / direct MP4 / Cloudinary public ID are all valid in `productVideo`. Empty video fields mean the shop hides the video block (current behavior).
- Fancy TikTok/Instagram **player UI** on the storefront is T-07. T-02 only needs the fields saved and published so today's product video block can show a URL/file.

## Error handling

| Failure | Behavior |
|---|---|
| Duplicate slug | Refuse Save/Publish. Keep the draft. Show the error on the slug field. |
| Upload failure | That file is not attached. Rest of the draft stays. Retry that file. |
| Publish failure | Live data unchanged. Draft kept. Show the error. Retry Publish. |
| Missing/invalid password | 401. Admin pages redirect to login. |
| Publish with missing name, slug, category, or price | Block Publish. Save draft is allowed after name + slug exist. |
| Draft slug in the shop URL | 404 for shoppers. |

## Testing strategy

Write failing tests for publish/draft rules **before** wiring UI (feature-lifecycle stage 5).

**Unit (`npm test`, tsx):**

- Shop loaders omit `draft` and `unpublished`.
- Save does not mutate live columns.
- Publish copies **every** product field, including `productVideo`, images, variants, FAQ, specs, reviews.
- Duplicate slug is rejected.
- Approve-review patches live reviews and any existing draft so Publish cannot drop the approved review.
- Backfill: current rows are `published` with `draft` null.

**Types:** `npx tsc --noEmit` clean.

**Manual (after UI exists):** login → create product with video → Save (shop still missing it) → Publish (shop shows it) → edit live product → Save (shop still old) → Publish (shop updates) → Unpublish (404) → pages/hero/settings same Save vs Publish rule.

## Code style

Follow existing App Router patterns: server data in `lib/db/*`, client forms in `components/admin/*`, `isAdminRequest` on write routes. Prefer boring functions over a generic CMS framework.

Example of the publish contract (illustrative):

```ts
type PublishStatus = "draft" | "published" | "unpublished";

function shopVisible(status: PublishStatus): boolean {
  return status === "published";
}
```

Shop queries always use `shopVisible`. Admin lists return all statuses.

## Boundaries

- **Always:** Filter shop reads to published. Keep service role on the server. Revalidate on Publish. Backfill existing rows to published. Tests for draft/publish before UI. No secrets in git.
- **Ask first:** New npm dependencies, extra Postgres tables beyond `status`/`draft` (and a publish RPC if needed), changing checkout or cart.
- **Never:** Staff accounts / OAuth. Portable CMS package. Sanity fallback. Card payments. Storefront black-and-white redesign. Order admin (T-03). New email templates (T-04). Funnel analytics (T-05). Staging (T-06). Vercel production (T-08).

## Out of scope (other tasks)

- T-03 Orders, statuses, customer tracking (sidebar may link later; no order screens here)
- T-04 Transactional emails
- T-05 Funnel analytics
- T-06 Staging vs production
- T-07 Storefront UI + TikTok/Instagram player chrome
- T-08 Vercel deploy
- Multi-user auth, roles, Sanity Studio revival

## Success criteria

- [ ] You can add a **new** product with every field listed above, including video, Save as draft, then Publish onto the shop.
- [ ] Editing a live product leaves the shop unchanged until Publish.
- [ ] You can edit pages, hero, settings, testimonials with the same Save/Publish rule.
- [ ] You can approve or reject shopper review submissions without a later Publish wiping them.
- [ ] Unpublished and draft products/pages 404 or omit from catalog, search, and sitemap.
- [ ] `/admin` is password-gated; `/studio` still goes to login.
- [ ] Messaging broadcast still works from the sidebar.
- [ ] `npx tsc --noEmit` and `npm test` pass.

## Open questions

None. Intent confirmed 2026-08-26. Approach: custom Next.js admin (Option 1).

## Impact analysis

Shop reads today do **not** filter by publish status. After this feature they must, or drafts leak onto the catalog.

| Surface | Today | After T-02 | Gap |
|---|---|---|---|
| `lib/db/store.ts` product/page/testimonial queries | all rows | `status = published` | add filter |
| `/api/store/products` | all products | published only (via store) | covered |
| Catalog, search, sitemap, product page | any slug | draft/unpublished 404 | filter slugs |
| Hero featured product | any product id | published only | filter |
| Category counts | all products | published only | filter |
| Checkout / orders / track | unchanged | unchanged | none (T-03) |
| `/admin/login`, `/admin/broadcast` | password + Bearer | cookie + Bearer; login goes to products | extend |
| Root layout Navbar/Footer | every page | hide on `/admin` | middleware header |
| `/api/upload` | Cloudinary only, unauthenticated | admin-gated; Storage fallback; video | extend |
| `/api/revalidate` | already admin | call on Publish | reuse |
| Review submissions | pending insert | admin approve/reject + merge into draft | new API |
| RLS | no public writes | unchanged | none |
| Messaging APIs | Bearer | cookie or Bearer | `isAdminRequest` |

Spawned follow-ups: none. Order screens stay T-03.

## Phase breakdown

1. Draft/publish pure functions + tests
2. SQL `status` + `draft` columns + backfill
3. Shop queries published-only
4. Admin auth cookie + middleware + hide store chrome
5. Admin write APIs (products, pages, hero, settings, testimonials, reviews, upload)
6. Admin UI shell + every editor including full product form
7. Wire login → products; broadcast in sidebar
