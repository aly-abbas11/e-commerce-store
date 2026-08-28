# T-09 — Easy admin: products + shop types

Requirements, impact, and UI choices for the first admin slice. Master plan: `docs/plans/2026-08-27-t09-easy-admin-products-categories-plan.md`. UI detail: `docs/ui/2026-08-27-t09-easy-admin-products-categories-ui.md`.

## Goal

The owner can add a product as easily as Shopify, with fewer boxes, and can add shop types without a developer. Live shop: https://voltgear-coral.vercel.app/ — admin: https://voltgear-coral.vercel.app/admin/products

## Decisions (locked)

- First slice only: short product form + shop type CRUD.
- Form fields: name, photos, **video link** (+ optional cover photo), price, old price, shop type, short summary, full details, availability, show on homepage. Practice-product checkbox at the bottom.
- Hidden extras stay in the database; save merges them so nothing is wiped. Video is on the form, not hidden.
- Shop types in a `categories` table, seeded with the current four.
- Rename changes the display name; URL slug stays.
- Cannot delete a type while products use it.
- Same admin login. No full admin restyle in this task.

Later (already on the tracker): T-10 homepage sections, T-11 event theme, T-12 rest of admin layout.

## Requirements

1. Product add/edit is short, labels in everyday words.
2. Owner can add / edit / delete shop types.
3. Shop menu, category pages, and both homes (`/` and `/home2`) follow the database list.
4. Existing catalog keeps working after seed.
5. Extra product content already on live products still shows to shoppers after a save from the short form.
6. Owner can paste a TikTok / Instagram / MP4 link so shoppers see the product in use.

## Impact analysis

### Data model

New table `categories`:

- `id` uuid
- `name` text (what people see)
- `slug` text unique (URL piece, e.g. `smartwatch`)
- `description` text optional
- `image_url` text optional (homepage tile)
- `sort_order` int
- `created_at` timestamptz

Seed rows matching today’s `lib/categories.ts`: smartwatch, power-bank, charger, earbuds.

`products.category` stays text. It stores the type **slug**. No foreign key in v1 (drafts and old rows must not fail the migration). App rules enforce “type must exist” on publish.

`ProductCategory` union of four names becomes `string`.

Need a migration. Do not `db push` until the owner asks.

### Shared / cross-cutting

- `lib/categories.ts` — today the only list. Replace with DB helpers; keep thin wrappers if needed so imports do not explode in one step.
- `lib/catalog.ts` — filters typed to four types; change to string; counts must include new types, not only the old four.
- `lib/db/store.ts` `fetchCategoryCounts` loops hardcoded `CATEGORIES` — must loop DB types.
- `lib/db/map.ts` casts category to the four-name union.
- `lib/db/publish.ts` `toLiveProductRow` writes the full document. Short form must send a merged document or the server must merge.

### Who can see what

One admin password. No extra roles. Shoppers only see published products and the type list. Types are not secret. **No warehouse/tenant leak in this app** — single store.

| Screen | Exposes today | After T-09 | Limited? |
|---|---|---|---|
| Shop nav / footer | four hardcoded types | all DB types | public on purpose |
| `/products/[slug]` | 404 if not in hardcoded list | 404 if slug not in DB | yes |
| Admin products | all products | same | admin cookie |
| Admin shop types | n/a | all types | admin cookie |

### Other screens / endpoints

Nav, mega menu, footer, gadget nav/footer, category pills, tabbed collections, `/` category cards, `/home2` catalog tiles, `/products/[category]`, sitemap, write-review category filter, `GET /api/store/products?category=`, admin product dropdown, `revalidatePath(/products/${category})`.

Sanity schema still lists four types — unused at runtime; leave it; do not spend time on Studio.

### Tests that will change

- `lib/db/publish.test.ts` — add merge-hidden-fields and type-in-use delete rules (new helpers).
- No Jest/Playwright admin suite today. `npm test` is node:test files listed in `package.json`.

### Integration

No webhooks. Revalidate paths when types or products change.

### Spawned follow-ups (tracker)

- T-10 homepage sections CRUD
- T-11 event theme + color suggestions
- T-12 easier layout for the rest of admin

## Phase breakdown (draft — expand after plan approval)

1. Tests for merge-on-save and type delete rules.
2. Migration + seed.
3. Admin shop types CRUD.
4. Storefront reads DB types.
5. Short product form.
6. Check `/` and `/home2`; deploy when asked.

## Approval

Plan + UI wait for the owner to reply **approved**.
