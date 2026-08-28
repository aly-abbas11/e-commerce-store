# T-09 — Category assignment (remaining)

## Requirements

Every product must belong to one shop type from **Admin → Shop types**. Add/Edit Product shows a required **Category** field loaded from the database (names shown, slug stored). Save draft and publish reject empty, unknown, or hardcoded fallback values. Changing category and publishing moves the product on live `/products/[slug]` pages. No nested types, no `category_id` column, no Commerce nav, no create-category modal.

Plan: `docs/plans/2026-08-27-t09-category-assignment-plan.md` (approved 2026-08-27).

## Impact analysis

| Area | Today | After | Gap / follow-up |
|---|---|---|---|
| `products.category` | text slug, not null | same; must match `categories.slug` | no migration |
| Admin product form | Shop type, first type pre-picked, fallback list | Category, must pick, DB list only | this task |
| Draft save | name + slug only | also valid category | this task |
| Publish | empty slug blocked; fake slug allowed | must exist in Shop types | this task |
| Create product | silent `charger` default | no default | this task |
| Category pages | filter live slug; old path not revalidated | revalidate old + new | this task |
| Shop types CRUD | add/rename/delete | unchanged | — |
| Storefront nav / home / home2 | already by slug | unchanged | — |
| Orders, emails, dashboard, demo | no category writes | none | — |
| Auth | admin cookie | same | — |

No spawned T-## rows. Nested categories and Commerce nav stay T-12 / later.

## Phase breakdown

1. Rules + tests (`categoryIsAssignable`, draft/publish gates).
2. Admin create/save/publish use those gates; drop `charger` default; revalidate old category path.
3. Product form label, placeholder, no hardcoded fallback.
4. Verify locally; no db push.

## Acceptance

- Cannot save or publish without a real Shop types slug.
- Form options come only from the database.
- After publish, old and new category pages update.
