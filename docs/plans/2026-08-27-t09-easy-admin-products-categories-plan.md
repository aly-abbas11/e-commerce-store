# Plan: T-09 — Easy admin: products + shop types

## 1. Plain summary

You run this shop yourself. Adding a product should feel as easy as Shopify, and nicer because the form only asks for what a shop page needs.

Today the product screen is long and hard. Shop types (Smartwatches, Power Banks, and so on) are stuck in code, so you cannot add a new type yourself.

This work shortens the product screen and lets you add, rename, and delete shop types from admin. The live shop menu and category pages will follow what you save. Extra old product data (FAQ, variants, specs) is not deleted; it just leaves this form so the screen stays calm. **Video stays on the form** so you can paste TikTok (or Instagram / MP4) links for shoppers.

Homepage section builder, event colors, and a full admin restyle wait for later tasks.

## 2. Goal

Done means: on [the live admin](https://voltgear-coral.vercel.app/admin/products) you can add a product in a few clear fields, and you can add a new shop type that shows up in the shop menu — without editing code.

## 3. In scope

- Short product add/edit form with plain labels, including a simple video link.
- Hide extra product fields from this form (not video). Keep that hidden data if it already exists.
- New **Shop types** admin page: list, add, edit, delete.
- Store shop types in the database (not in a code file).
- Put the four current types into that list so nothing on the live shop breaks.
- Shop menu, footer, category pages, homepage tiles, and gadget preview read types from the database.
- Same admin password as today.

## 4. Out of scope

- Homepage section builder (add/reorder home blocks) — later, T-10.
- Event theme and color suggestions — later, T-11.
- Restyling Orders, Settings, and the rest of admin — later, T-12. This slice only makes Products and Shop types easy.
- Changing how the live shop product page looks for shoppers (except a new type appearing in the menu).
- Card payments, stock quantity counts, or variants on this form.
- Deleting extra product columns from the database.

## 5. Who this is for

You (the store owner). Shoppers only notice new or renamed shop types in the menu.

## 6. How it works today

You open Products, then a long form. Category is a fixed list of four. To add “Cables” you would need a developer. Saving the form writes every field, including ones you may not understand.

## 7. How it will work after

You open Products and see: name, photos, **video link**, price, old price, shop type, short summary, full details, availability, show on homepage. Save draft / Publish stay.

You open Shop types, add “Cables”, and the shop menu gets Cables. Products can pick Cables.

## 8. Chosen approach

**A. Shop types live in a database table.** Nav and product dropdown read that table.

**B. Product form shows only the short list (plus video).** On save, hidden fields from the existing product are copied forward so FAQ/variants/specs are not wiped.

This matches Shopify’s “you don’t have to fill every box” idea, but our form is shorter than Shopify’s (no shipping weight, barcodes, or sales channels).

## 9. Other options we considered

- Keep types in a code file and only change the form — you still cannot add a type yourself.
- Delete extra product fields from the database — would break old product pages that still show FAQ or specs.
- Put extra fields behind an “Advanced” accordion — still clutter; you asked for simple.

## 10. Codebase contact points

| Area | Change | Why |
|---|---|---|
| New `categories` table + seed of 4 types | write | Source of truth |
| `lib/categories.ts` and every file that imports it | both | Stop using a hardcoded list |
| `lib/types.ts` `ProductCategory` | write | Allow any type slug, not only four |
| `lib/catalog.ts`, `lib/db/store.ts`, `lib/db/map.ts` | both | Counts and catalog filters |
| Nav, footer, mega menu, category pills, tabbed collections | both | Live menu |
| `/`, `/home2`, `/products/[category]`, sitemap | both | Pages follow DB types |
| Gadget nav/footer | both | Preview stays in sync |
| `components/admin/product-form.tsx` | write | Short form + merge on save |
| `components/admin/admin-shell.tsx` | write | Add Shop types link |
| New admin pages + `/api/admin/categories` | write | CRUD |
| `lib/db/publish.ts` + tests | both | Preserve hidden fields; type must exist |
| `docs/modules/admin/` | write | After ship |

## 11. Screens and workflow impact

| Screen | Before | After | Risk |
|---|---|---|---|
| Admin product add/edit | Long form | Short form, plain names | Saving must not wipe hidden data |
| Admin product list | Same | Same, plus easier “Add product” | Low |
| Admin Shop types | Does not exist | List + add/edit/delete | Deleting a type in use must be blocked |
| Live nav / footer / category page | Four hardcoded types | Types from database | Must seed the four current ones first |
| Live product page | Unchanged layout | Unchanged; extras still show if old data exists | Low |
| `/home2` Catalog tiles | Four hardcoded | From database | Keep both storefronts working |

## 12. Data and rules

**Product form (what you see)**

| Label on screen | Meaning |
|---|---|
| Product name | What shoppers see |
| Photos | Gallery |
| Video link (optional) | TikTok, Instagram, or MP4 so shoppers see the product in use |
| Cover photo (optional) | Picture shown before the video plays |
| Price | Selling price (Rs) |
| Old price (optional) | Crossed-out price for a sale |
| Shop type | Which menu group |
| Short summary | One or two lines |
| Full details | Longer text |
| Availability | In stock / Low stock / Out of stock |
| Show on homepage | Featured flag |

Product web address (slug) is made from the name automatically. It is not shown on the form.

The Cloudinary video ID box is **not** on the form (too technical). If an old product already has one, save keeps it.

**Still saved in the background if already there:** brand, SKU, badge, variants, features, specs, compatibility, in the box, FAQ, reviews on the product.

**Shop type row:** name, short description, optional photo, sort order. Web address slug is made from the name when you add it. Renaming later changes the name shoppers see; the URL stays so old links do not break.

**Delete type:** not allowed while any product still uses it. The screen says how many products to move first.

**Publish:** still needs name, auto slug, shop type, and a price that is zero or more.

**Who can edit:** same admin login as now.

## 13. Edge cases and decisions

- Empty type list: seed the four current types; do not go live with an empty list.
- New type with no products: menu still shows it; category page says no products yet.
- Delete type with products: blocked, with a clear sentence.
- Rename type: name and description change; URL slug does not.
- Two types with the same URL: blocked.
- Save product without touching hidden fields: old FAQ/variants remain. Video link on the form is what shoppers get.
- Empty video link: no video block on the shop (same as today).
- New product: hidden fields stay empty.
- Price empty: treat as 0 for draft; publish still needs a valid number.
- No photos: allow draft; publish allowed (shop already handles missing images).
- Double save: same as today (button busy state).
- Demo product checkbox: keep at the bottom, labeled **Practice product — guests cannot see this**.
- Gadget `/home2` and live `/` both use the new type list.
- Database change: new table. We **do not** push that change until you say to.
- Production: we **do not** deploy until you say deploy.

## 14. Step-by-step build order

1. Add rules tests for: cannot delete a type in use; save product keeps hidden fields; slug from name.
2. Add `categories` table migration and seed the four current types. (Push only when you say.)
3. Read/write helpers for shop types.
4. Admin Shop types list + add/edit/delete screens.
5. Point nav, catalog, sitemap, home, home2 at the database list.
6. Shorten the product form; merge hidden fields on save; dropdown from live types.
7. Check on localhost: add a type, add a product, confirm menu; confirm an old product still has its extras after save.
8. Deploy only when you ask.

## 15. Impact and risks

Saving a short form could wipe extra data if we forget to merge. Tests and a check on an existing product with video/FAQ catch that.

If we forget to seed types, the shop menu could go empty. Seed is required before switching the nav.

## 16. Test checklist

- Add shop type “Cables” → appears in admin list and shop menu.
- Rename “Cables” → shoppers see the new name; old URL still works.
- Delete “Cables” with no products → gone from menu.
- Delete Smartwatches while products use it → blocked.
- Add product with only the short fields → shows on the shop under that type.
- Add product with a TikTok (or Instagram) link → shoppers see the video on the product page.
- Edit an old product and save → FAQ/variants still on the shopper product page; video is whatever is in the video link box.
- Live `/` and `/home2` both show the types.
- Admin still needs the password.

## 17. Open questions

None. Recommended choices are locked so you do not have to decide each small rule.

## 18. Approval

- [x] User approved this plan
- Date / note: 2026-08-27 — “approved” (video link kept on the form)
