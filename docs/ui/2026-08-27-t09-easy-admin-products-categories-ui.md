# UI Plan: Easy admin — products + shop types

## 1. Plain summary

Make the product screen and a new Shop types screen as easy as Shopify: few boxes, names that explain themselves, no extra chrome.

## 2. Links

- Product plan: `docs/plans/2026-08-27-t09-easy-admin-products-categories-plan.md`
- Spec: `docs/superpowers/specs/2026-08-27-t09-easy-admin-products-categories-design.md`
- Chat: owner asked for Shopify-easy, fewer questions; recommended path locked

## 3. Goal

A new person can add a product without asking what a field means. Shop types feel like a simple list: add, change, delete.

## 4. In scope (screens & surfaces)

- Admin left menu (add **Shop types** under Products)
- `/admin/products` list (labels only if needed)
- `/admin/products/new` and `/admin/products/[id]` short form
- `/admin/categories` list
- `/admin/categories/new` and `/admin/categories/[id]` (or one list with a simple add row — prefer **list + edit page**, like Products)
- Empty, error, and “cannot delete” messages
- Mobile: stack; desktop: Shopify-like main + side column on the product form

## 5. Out of scope

- Orders, pages, hero, settings, testimonials, reviews, messaging look
- Live shopper product page layout
- Event theme UI
- New fonts, purple “AI SaaS” look, new component library

## 6. Current app UI snapshot

Admin today: left nav, white cards, shadcn inputs, primary buttons, `h-11` fields, “Store admin” title. Product form is one long column of sections (Basics, Media, Video, Variants, Copy, Reviews).

Keep that skin. Change structure and copy, not the brand of admin.

## 7. Research collage

| Source | What we took |
|---|---|
| [Shopify product details](https://help.shopify.com/en/manual/products/details/product-details-page) | Title, media, price, compare-at, organization (type). You do not have to fill every box. |
| [Shopify product details overview](https://help.shopify.com/en/manual/products/details) | Price/inventory on the product when there are no variants. We have no quantity field; we use Availability. |
| [Shopify collections delete](https://help.shopify.com/en/manual/products/collections/smart-collections/create) | Confirm before delete. We are stricter: block delete if products still use the type (our type is the menu group, not a loose collection). |
| This admin | Same nav, buttons, and fields so it still feels like VoltGear admin |

We did not copy Shopify’s shipping, channels, SEO handle box, or metafields. Those make Shopify harder; we stay shorter. Video stays because you run TikTok clips so shoppers see the product.

## 8. Chosen direction

**Shopify-simple on the current admin skin.** Desktop product form: wide left (name, photos, details), narrow right (price, availability, shop type, homepage). Everyday labels. No new visual identity.

## 9. Directions we did not pick

- Full admin redesign — later T-12
- Advanced accordion for extras — still noisy
- Wizard (many steps) — slower than one short page

## 10. Visual mockup index

Images were not generated (owner asked not to be flooded). Wireframes below are the spec.

**UI-01 Product form desktop**

```
[ Save draft ] [ Publish ]

Product name
[ ................................ ]

Photos
[ + add photos ]
Use a square photo, 2048 × 2048 pixels. Crop phone photos to a square first.

Video link (TikTok, Instagram, or MP4)
[ paste link ........ ]
Cover photo (optional)
[ + ]

Short summary
[ ........ ]

Full details
[ ........ ]

                 | Price          [     ]
                 | Old price      [     ]
                 | Shop type      [ v ]
                 | Availability   [ v ]
                 | [ ] Show on homepage
                 | [ ] Practice product — guests cannot see this
```

**UI-02 Product form mobile:** same blocks stacked, side column under the photos.

**UI-03 Shop types list**

```
Shop types                    [ Add shop type ]

Name            Products   Actions
Smartwatches    6          Edit
Power Banks     4          Edit
…               0          Edit  Delete
```

**UI-04 Cannot delete:** “Move 6 products to another shop type first.”

**UI-05 Empty types:** should not happen after seed; if it did: “Add your first shop type.”

## 11. Design tokens

Reuse admin: background, card, border, primary button, destructive for delete, `text-sm` labels, `h-11` inputs, `rounded-md`. No new colors.

## 12. Layout system

Admin shell unchanged except one nav item. Content width same as product form today. Product form: `lg:grid` 2/3 + 1/3.

## 13. Component inventory

- **AdminShell nav** — add Shop types. Reuse.
- **ProductForm** — rewrite layout/fields. Reuse MediaField, PublishBar.
- **CategoryList / CategoryForm** — new, copy ProductList patterns (table, Add button).
- **Cannot-delete alert** — text + link to Products.

States: default, saving, error text under the bar, empty list, blocked delete.

## 14. Screen-by-screen spec

### Product add/edit

- Purpose: create or change a product
- Who: owner
- Layout: UI-01 / UI-02
- Controls: fields in section 12 of the product plan (including video link + optional cover); Save draft; Publish; Unpublish/Discard when editing
- Copy: labels exactly as the plan table (Product name, Photos, Video link, Cover photo, Price, Old price (optional), Shop type, Short summary, Full details, Availability, Show on homepage, Practice product — guests cannot see this)
- Empty name: cannot save (same rule as today, slug filled for you)
- Error: red sentence, no jargon
- Shop type dropdown: types from the database; if none, “Add a shop type first” with a link

### Shop types list

- Purpose: see all menu groups
- Add shop type → new form
- Edit → name, description, photo, sort order
- Delete → confirm; if in use, block (UI-04)

### Shop type form

- Shop type name (required)
- Short description (optional, category page)
- Photo (optional, homepage tile)
- Sort number (optional; default last)

## 15. User flows (UI steps)

1. Sign in → Products → Add product → fill short form → Publish
2. Shop types → Add shop type → save → Products → pick it on a product
3. Try Delete on a used type → read the message → change those products → delete

## 16. Accessibility

Labels on every field. Buttons at least 44px (`min-h-11`). Delete confirm. Focus ring on controls. Errors as text, not color alone.

## 17. Content & microcopy

| Place | Copy |
|---|---|
| Nav | Shop types |
| List title | Shop types |
| Add | Add shop type |
| Delete blocked | This shop type still has {n} products. Move them to another type, then you can delete it. |
| Product save error | Say the missing piece in plain words (name, price, shop type). |

No “slug”, “SKU”, “compare-at”, “CMS”, “JSON”, or “Cloudinary public ID” on these screens.

## 18. Build order (UI only)

1. Nav label
2. Shop types list + form (same look as Products)
3. Short product form layout + labels
4. Empty and blocked-delete sentences
5. Check at `/admin/products` and `/admin/categories` on phone and desktop

## 19. Impact on existing screens

Product form changes. Admin nav gains one link. Other admin pages unchanged. Live shop look unchanged except new types in the menu.

## 20. Open questions

None.

## 21. Approval

- [x] User approved this UI plan
- Date / note: 2026-08-27 — “approved”
