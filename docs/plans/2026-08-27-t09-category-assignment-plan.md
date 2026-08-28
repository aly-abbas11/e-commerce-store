# Plan: Category assignment (T-09 remaining)

## 1. Plain summary

Every product must belong to one shop type. That list is the same one you already manage under **Admin → Shop types** (the `categories` table). The Add Product and Edit Product screens will show a required **Category** dropdown with human names from that table, not a hardcoded list. Saving a draft or publishing will fail if no category is picked, or if the value is missing from the table. Changing the category and publishing will move the product onto the matching shop page (`/products/...`). We will not add subcategories, a hide/inactive switch, a new Commerce menu, or a “create category” popup.

## 2. Goal

Done means: you cannot save or publish a product without a real category from Shop types, the form never uses a baked-in list, and after you publish a category change the live category page shows the product in the new group and not the old one.

## 3. In scope

- Relabel the product-form field to **Category**.
- Load options only from the shop-types table (names shown, slug stored).
- Empty first choice: **Pick a category**. Do not auto-select the first type.
- Require a valid category on **create, save draft, and publish**.
- Server rejects empty, unknown, or leftover hardcoded slugs (including the old silent `charger` default).
- Allow changing category on edit; live shop updates on **Publish** (same as other product fields).
- On publish, refresh both the old and new category pages so the shop does not keep a stale page.
- Product form pages must not fall back to the hardcoded four types.

## 4. Out of scope

- Nested / parent-child categories — you asked to wait.
- A new `is_active` / hide switch — “active” means the type still exists in Shop types (delete is already blocked while products use it).
- A new `category_id` UUID column — the unique slug is already the reference; a second id adds a database change with no extra shopper benefit.
- Renaming admin to **Commerce → Categories** — that is a later admin layout task (T-12). Source stays **Admin → Shop types**.
- “Create new category” modal on the product form — extra UI; you already add types on the Shop types page. The empty-state link to add a type stays.
- Changing how category pages look for shoppers.
- Product cards that still print the slug (`smartwatch`) instead of the name — not required for assignment to work.

## 5. Who this is for

You (the store owner) on Add / Edit Product. Shoppers only notice that a product sits on the right category page after you publish.

## 6. How it works today

The form already has **Shop type**, loaded from the database, showing names and saving the slug (for example `smartwatch`). Publish already refuses an empty slug, but:

- Draft save does **not** require a category.
- New products can be stored as `charger` if the field is empty.
- The server does not check that the slug exists in Shop types.
- Add/Edit Product can fall back to four types hardcoded in code if the table read fails.
- The first type is auto-selected, so you can save without really choosing.
- Publishing a category change does not refresh the **old** category page cache.

## 7. How it will work after

You open Add or Edit Product. **Category** is required. The list is only what is in Shop types. You pick a name. Save and Publish both fail with a clear sentence if you skip it or send a fake value. After Publish, `/products/old-type` and `/products/new-type` both update.

## 8. Chosen approach

**Option 1 — Tighten the existing slug assignment.** Keep `products.category` as the shop-type slug. Validate it against the `categories` table on every write. This matches how the shop already filters and builds `/products/[category]` URLs. Shopify and WooCommerce both treat a category/collection as a required (or strongly expected) assignment; we do not need Shopify’s global taxonomy tree or WooCommerce’s many-categories-per-product. One product, one type, as today.

## 9. Other options we considered

- **Option 2 — Add `category_id` UUID foreign key** and keep the slug in sync. More “database correct,” but rename already keeps the slug stable, and every shop page already keys off the slug. Extra migration and dual writes for a one-person shop.
- **Option 3 — Inactive flag + Commerce nav + create-category modal.** Matches the original brief wording more literally, and is much more work. Hide/inactive is unused today; Commerce nav is T-12; the modal duplicates Shop types.

## 10. Codebase contact points

| Area | Change | Why |
|---|---|---|
| `lib/db/category-rules.ts` (+ tests) | Add `categoryIsAssignable(slug, types)` | Shared rule: non-empty and in the live list |
| `lib/db/publish.ts` (+ tests) | `canSaveDraft` and `canPublish` require a valid category | Block save and publish |
| `lib/db/admin-store.ts` | Create/save/publish load shop types and reject bad slugs; drop `charger` default; revalidate old + new category paths | Server is source of truth |
| `app/api/admin/products` and `[id]` | Unchanged shape; they already pass `doc` into those helpers | Errors return 400 |
| `components/admin/product-form.tsx` | Label **Category**, required, placeholder option, no silent first value | Owner-facing field |
| `app/admin/products/new/page.tsx` and `[id]/page.tsx` | Do not pass `FALLBACK_SHOP_TYPES` | No hardcoded form options |
| Storefront `/products/[category]`, nav, home tiles | Read only (already filter by slug) | Assignment shows up after publish |
| `lib/categories.ts` `FALLBACK_SHOP_TYPES` | Leave for storefront emergency fallback only | Must not feed the product form |
| Database | No new table or column | Slug already `text not null` |

## 11. Screens and workflow impact

| Screen / flow | Before | After | Risk |
|---|---|---|---|
| Add product | Shop type, first type pre-picked | Category, must pick | You cannot save a nameless draft without a type |
| Edit product | Can change type; draft may not require it | Must keep or pick a valid type | Orphan slug (not in the list) must be re-picked |
| Publish | Empty category blocked; fake slug allowed | Fake slug blocked | Clear error text |
| Shop types admin | Unchanged | Still the only place to add/rename/delete types | None |
| `/products/[slug]` | Filters live `category` | Same, cache refreshed for old and new | Stale cache if we forget old path |
| Gadget `/home2` | Tiles by slug | Unchanged | None |

## 12. Data and rules

- Stored field: `products.category` (text slug). Draft JSON uses the same `category` string.
- Display: `categories.name`. Value: `categories.slug`.
- Valid means: trimmed slug is one of the current shop-type slugs.
- Invalid means: empty, whitespace, unknown slug, or the old silent `charger` fill-in when that type was not chosen.
- Permissions: same admin cookie as today. Shoppers never pick a category.
- Live vs draft: shoppers see the live column. A draft category change is not on the shop until Publish.

## 13. Edge cases and decisions

- Empty type list: form shows the existing “Add a shop type first” link; save and publish fail on the server.
- Table read fails on the product form: show no hardcoded options; treat as empty list (do not use `FALLBACK_SHOP_TYPES`).
- Draft without category: blocked.
- Publish without category: blocked (already, plus must exist in the table).
- Unknown / deleted slug on an old product: dropdown does not pretend it is valid; owner must pick a current type.
- Double submit: unchanged busy button.
- Rename a shop type: slug stays; product assignment stays; shoppers see the new name.
- Delete a type in use: still blocked (existing rule).
- Change category on a published product, save draft only: shop stays on the old page until Publish.
- Change category and publish: product leaves the old page and appears on the new one; both pages revalidated.
- Demo products: same rule.
- Concurrent two admins: last write wins, same as today.
- Performance: type list is small (a handful of rows).
- Out of scope items in section 4 stay out.

## 14. Step-by-step build order

1. **Tests first** in `lib/db/category-rules.test.ts` and `lib/db/publish.test.ts`: assignable vs empty/unknown; draft and publish require a real slug from a provided type list.
2. **Rules** in `lib/db/category-rules.ts` and `lib/db/publish.ts`: implement until tests pass.
3. **Admin writes** in `lib/db/admin-store.ts`: fetch shop types, reject bad category on create/save/publish, remove `|| "charger"`, revalidate previous category path on publish when it changed.
4. **Form** in `product-form.tsx` and the add/edit pages: label, required select, placeholder, no fallback list.
5. **Check:** `npm test`, `npx tsc --noEmit`. On localhost: add product without category → blocked; pick Smartwatches → save; publish; open `/products/smartwatch`. Edit to Power Banks, publish; old page no longer lists it, new page does. Confirm an old product still keeps FAQ after save.

## 15. Impact and risks

If we keep auto-selecting the first type, “required” is fake. If we forget the server check, someone can POST a fake slug. If we forget to revalidate the old category page, shoppers may still see the product there until cache expires. No database push is required.

## 16. Test checklist

- Add product, leave Category on “Pick a category”, save → error, no row (or no successful save).
- Add product, pick a real name, save draft → ok.
- Publish with a slug not in Shop types (API) → 400.
- Edit product, change category, publish → new category page has it; old one does not.
- Shop types page still add/rename/delete as today.
- Empty Shop types list → form tells you to add a type first.
- Live `/` and `/home2` still load.
- Admin still needs the password.

## 17. Open questions

None. Recommended choices are locked from “do what’s recommended.”

## 18. Approval

- [x] User approved this plan
- Date / note: 2026-08-27 — “approved”
