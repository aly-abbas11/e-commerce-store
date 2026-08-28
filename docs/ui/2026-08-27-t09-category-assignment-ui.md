# UI Plan: Category assignment

## 1. Plain summary

On Add Product and Edit Product, the existing shop-type dropdown is relabeled **Category**. It stays the same native select used elsewhere in admin. Options are human names from Shop types. The first choice is **Pick a category**. The field is required. If there are no types, the existing “Add a shop type first” link stays. No new screens, modals, or colors.

## 2. Links

- Product plan: `docs/plans/2026-08-27-t09-category-assignment-plan.md`
- Approved with that plan on 2026-08-27 (“approved”).

## 3. Goal

The owner must notice they have to pick a category. The control should look like the rest of the product form, not a new widget.

## 4. In scope (screens & surfaces)

- Add product (`/admin/products/new`) — Category field
- Edit product (`/admin/products/[id]`) — Category field
- Empty list message + link to add a shop type
- Server error text shown under the existing red error line

## 5. Out of scope

Shop types list/add/edit pages, storefront category pages, Commerce nav, create-category modal, nested types.

## 6. Current app UI snapshot

Admin uses a white page, `h-11` bordered native selects, `Label` above fields, `text-destructive` errors, black primary buttons. Product form is two columns on large screens; category sits in the right column with price and stock.

## 7. Research collage

Reuse the current select. WooCommerce’s product editor uses a category checklist plus “Add new”; we keep one required dropdown because this shop has one type per product.

## 8. Chosen direction

Keep the native select. Change copy and empty state only.

## 9. Directions we did not pick

Searchable combobox, modal to create a type, multi-select. Extra complexity for a short list.

## 10. Visual mockup index

None generated — this is the existing control with new labels.

## 11. Design tokens

Reuse existing: `border-input`, `bg-background`, `h-11`, `text-sm`, `text-destructive`, `text-muted-foreground`.

## 12. Layout system

No layout change. Category stays in the right column under Old price.

## 13. Component inventory

- Label “Category” — reuse `Label`, `htmlFor="category"`
- Native `select` — required; first option value `""` text **Pick a category**
- Options — `name` visible, `slug` as value
- Empty: link **Add a shop type first** → `/admin/categories/new`
- Error: existing paragraph under the save/publish bar

## 14. Screen-by-screen spec

**Add product / Edit product**

- Label: Category
- If types exist: select, required, placeholder option, then one option per type (name)
- If the saved slug is not in the list: show placeholder (must pick again)
- If no types: no select; link to add a shop type
- Save/Publish with empty or invalid value: “Pick a category.” (or the server sentence for unknown slugs)

## 15. User flows (UI steps)

1. Open Add product → Category shows Pick a category
2. Save without picking → error, stay on the form
3. Pick a name → Save draft works
4. Edit → change Category → Publish → shop category pages update

## 16. Accessibility

Select has an associated label. `required` is set. Keyboard can open and change the native select. Errors appear as text next to the actions (existing pattern).

## 17. Content & microcopy

- Label: `Category`
- Placeholder: `Pick a category`
- Empty list: `Add a shop type first`
- Missing: `Pick a category.`
- Unknown: `Pick a category that exists in Shop types.`

## 18. Build order (UI only)

1. Relabel and placeholder on `product-form.tsx`
2. Stop passing hardcoded fallback types into add/edit pages
3. Click through add + edit

## 19. Impact on existing screens

Only the product form category control. Shop types admin unchanged.

## 20. Open questions

None.

## 21. Approval

- [x] User approved this UI plan
- Date / note: 2026-08-27 — approved with the product plan (same “approved” reply)
