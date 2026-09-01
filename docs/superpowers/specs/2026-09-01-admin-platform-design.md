# Design: VoltGear Shopify-class admin platform

**Status:** Design complete for review — implementation blocked until master plan approval.  
**Master plan:** `docs/plans/2026-09-01-admin-platform-master-plan.md`  
**Research brief:** `docs/plans/2026-09-01-admin-platform-program-DRAFT.md`  
**Date:** 2026-09-01

## Problem

The owner needs a Shopify-easy back office for a COD Pakistan shop: find things fast; control catalog and home; capture contact/complaints; message customers; manage orders—without losing messages in logs or fighting a flat product list.

## Goals

1. Easy navigation and minimal Biometic admin UI.  
2. Inbox for contact + complaints from the storefront.  
3. Catalog control: categories, collections, products/images/details.  
4. Site content + social links (largely exist).  
5. Email (single + bulk + templates) + existing SMS.  
6. Products listed by category in admin.  
7. Collection placement on the home (after T-10).  
8. Order status + detail (exists).  
9. Shopify essentials researched; VoltGear extras kept.

## Non-goals

Full Shopify clone (apps, gift cards, theme editor, multi-warehouse). Card payments. Visual drag-drop email builder (v1).

## Architecture (by module)

### Admin IA (T-21)

Group sidebar: **Home · Orders · Catalog** (Products, Shop types, Collections) · **Content** (Pages, Hero, Home layout, Testimonials) · **Customers** (Inbox, Customers, Reviews) · **Marketing** (Messaging SMS/Email) · **Analytics · Settings**. Preserve all existing routes.

### Inbox (T-22)

- Table `contact_submissions`: id, kind, name, email, subject, message, status, admin_note, is_demo, created_at.  
- Public `POST /api/contact` inserts row (+ optional webhook).  
- Admin `/admin/inbox` list/detail + PATCH status.  
- Complaint = same form with `kind=complaint` (footer already points to `/contact`).

### Collections (T-23)

- Tables `collections`, `collection_products`.  
- Manual picks + optional auto rule (`featured` | `bestsellers`).  
- Home: extend T-10 section catalog with `collection` section type + collectionId.  
- Depends on T-10 PR #3 merge for placement.

### Products by category (T-24)

- Admin list groups by `products.category` / shop types. Empty groups shown when type exists.

### Marketing email (T-25)

- Extend Messaging UI with Email tab.  
- Templates table; send via `lib/email.ts` / Resend / `FROM_EMAIL`.  
- Single address or bulk (batched); consent confirm for pasted lists.

### Customers (T-26)

- Read model from orders + messaging contacts; link to order history.

## Data flow (inbox)

```
Shopper form → POST /api/contact → contact_submissions
                                    ↓
                         Admin Inbox UI (auth)
```

## Error handling

- Public contact: 400 validation; 429 rate limit; 201 on success.  
- Admin: 401 without token; 404 missing id.  
- Bulk email: per-recipient failure logged; campaign continues.

## Testing

- Unit: inbox validation, collection membership rules, home section with collection type.  
- Manual: checklist in master plan §16.  
- Do not break order transactional emails or SMS send.

## Phase breakdown (acceptance)

| Phase | Done when |
|-------|-----------|
| T-10 merged | `/admin/home` works on main; home reorder persists |
| T-21 | Sidebar grouped; old URLs work |
| T-24 | Products grouped by category |
| T-23 | Collections CRUD + home placement |
| T-22 | Contact/complaint visible in Inbox |
| T-25 | Single + bulk email + template |
| T-26 | Customers list usable |

## Impact analysis (summary)

Touches admin shell, contact API, new tables, messaging UI, product list, home renderer (T-10), email module. Orders/analytics mostly untouched. No warehouse-scope model in this store.

## Approval

- [ ] Design + master plan approved by user  
- Then: feature-lifecycle intake → implement per master plan §14
