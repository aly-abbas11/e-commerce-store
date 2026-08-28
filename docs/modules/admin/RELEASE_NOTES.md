# Admin CMS — release notes

## 2026-08-27 — Commerce intelligence (T-14)

- **Analytics** is in the admin menu. Delivered revenue is the primary number. See `docs/modules/analytics/RELEASE_NOTES.md`.

## 2026-08-27 — Required category on products (T-09)

- Add and Edit Product now have a required **Category** list from Shop types (names, not codes). You cannot save or publish without picking one that exists.
- Changing the category and publishing moves the product onto the matching shop page.

## 2026-08-27 — Admin Home snapshot (T-13)

- Sign in lands on **Home**: today’s orders, today’s money, pending work, delivered today, cancelled today, and low stock.
- A **Needs you** list opens the matching order, product, or reviews page. Practice orders are not counted as sales.

## 2026-08-27 — Easy product form + shop types (T-09)

- Product add/edit only asks for what you need, including a TikTok/Instagram video link. Extra old fields are kept in the background.
- Shop types can be added, renamed, and deleted from `/admin/categories`. The shop menu follows that list after the `categories` table is pushed.
- Product photos: upload a square **2048 × 2048**. The shop shows them sharp (no stretch of a small file). Tiny uploads get a warning.

## 2026-08-26 — Custom admin CMS (T-02)

- Staff can add and edit products (including video), pages, hero, settings, testimonials, and review submissions from `/admin` without Sanity or SQL.
- Save keeps a draft; shoppers only see a change after Publish. Editing a live product leaves the current shop version in place until you Publish again.
