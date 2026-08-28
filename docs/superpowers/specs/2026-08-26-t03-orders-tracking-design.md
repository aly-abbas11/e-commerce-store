# Spec: T-03 — Orders, statuses, customer tracking

## Objective

Let staff pack and ship from the existing `/admin` shell, and make shopper `/track` easier to read (timeline, copy, mobile). Checkout stays cash on delivery. New email templates stay T-04.

**User:** you in admin; customers on `/track`.

**Why now:** T-02 shipped a CMS with no Orders screen. `/track` and the status API already exist.

**Success:** Sidebar **Orders** → compact table → click opens **full detail** (contact, address, items, timeline). Any status can be set with an optional note. `/track` still needs Order ID + email; after a match, status, timeline, items, and totals are clear on a phone. Shopper lookup never returns phone or address.

## Tech stack

- Next.js 14 App Router, T-02 admin shell (`components/admin/admin-shell.tsx`)
- Existing `lib/order-store.ts` (`getAllOrders`, `getOrderById`, `updateOrderStatus`)
- Existing `POST /api/orders/[orderId]/status` (admin) and `GET /api/orders/[orderId]?email=` (shopper)
- Same `ADMIN_TOKEN` cookie + Bearer as T-02
- Current UI components. Not T-07 storefront redesign.

## Commands

```
npm run dev
npm test
npx tsc --noEmit
```

## Project structure

```
app/admin/orders/page.tsx              → compact table
app/admin/orders/[orderId]/page.tsx    → full detail + status form
app/api/admin/orders/route.ts          → GET list (admin)
components/admin/order-list.tsx
components/admin/order-detail.tsx
components/orders/track-order.tsx      → restyle lookup result
lib/order-store.ts                     → reuse; add list/detail shaping if needed
lib/db/order-rules.ts                  → unit-tested shopper-redaction + status rules
```

Do not rebuild messaging, checkout, or email HTML.

## Locked decisions

| Topic | Decision |
|---|---|
| Approach | Orders inside the T-02 admin (Option 1) |
| List | Compact table: Order ID, date, customer name, status, total. Search by ID / name / email |
| Detail | Click row → full summary: name, email, phone, address, city, items, totals, COD, timeline |
| Status | Any of `new` / `processing` / `shipped` / `delivered` / `cancelled` + optional note |
| Track lookup | Order ID + email, unchanged API |
| Track UI | Status headline, vertical timeline, items + totals, mobile-first. No phone/address |
| Wrong lookup | Generic “couldn’t find” — no leak that the ID exists |
| Emails | Keep sending today’s status emails from the existing status route. New templates = T-04 |
| Auth | Same admin password/cookie |

## Architecture

```
Admin /admin/orders
  → GET /api/admin/orders          (cookie/Bearer)
  → getAllOrders()                 compact rows
Admin /admin/orders/[orderId]
  → getOrderById() on the server   full customer
  → POST /api/orders/[orderId]/status   { status, note }
Shopper /track
  → GET /api/orders/[orderId]?email=
  → redacted JSON (no phone/address)
```

`getAllOrders()` already exists. Add an admin list route rather than exposing `getAllOrders` to the browser.

Shopper GET already omits phone/address. Keep that contract; add a unit test so it cannot regress.

## Impact analysis

| Area | Verdict |
|---|---|
| Data model | No migration. Reuse `orders`, `order_items`, `order_status_history`. |
| Auth | Same `ADMIN_TOKEN` cookie / Bearer. Middleware already guards `/admin/*`. |
| Shopper PII | `/track` and `GET /api/orders/[orderId]` stay redacted. Admin detail is the only phone/address surface. |
| Emails | Status POST still sends today's templates. New HTML = T-04. |
| Checkout / messaging | Unchanged. `getAllOrders()` now newest-first (list + any other callers). |
| Follow-ups | None spawned. T-04 already exists. |

Status POST already validates `ORDER_STATUSES` and emails when status is not `new`. T-03 does not change email copy.

## Admin screens

**Nav:** add Orders to `AdminShell` (with Products, Pages, Hero, Settings, Testimonials, Reviews, Messaging).

**`/admin/orders`**
- Table: Order ID, date, customer name, status, total (PKR)
- Search filters the table (ID, name, email)
- Empty state if there are no orders
- Row is a link to `/admin/orders/[orderId]`
- No phone, address, or line items in the table

**`/admin/orders/[orderId]`**
- Customer block: name, email, phone, address, city (and postal if stored)
- Items: name, variant, qty, price
- Totals: subtotal, shipping, total, payment = COD
- Timeline from `statusHistory`
- Form: status `<select>` (all five), optional note, Update
- Unknown id → notFound()

Robots: `noindex` on admin order pages.

## Track page (`/track`)

Keep the form (Order ID, email used at checkout, Track order). Auto-search when `?orderId=` and `?email=` are in the URL.

After a match, stack on all breakpoints:

1. Status headline (human label) + order ID + last updated
2. Vertical timeline: placed → processing → shipped → delivered. Show **cancelled** only if the order is cancelled. Current step marked; past steps complete; admin note under a step when present
3. Items and totals; payment as cash on delivery
4. Short “questions → contact page” line

Never render phone or address.

Copy: “Enter the order ID from your confirmation email” / “We couldn’t find an order for those details. Check the order ID and email.”

## Error handling

| Case | Behavior |
|---|---|
| Admin unsigned | Redirect to `/admin/login` |
| Admin unknown order | 404 |
| Status update fails | Old status remains; error on the detail page |
| Track missing fields | Native required; no fetch |
| Track wrong pair | Generic not-found message |
| Track server/network | “Something went wrong. Try again.” |

## Testing strategy

Write failing tests for redaction and status notes **before** UI (`lib/db/order-rules.ts` + `lib/db/order-rules.test.ts`). Extend `npm test`.

- Shopper payload builder strips `phone` and `address` even if present on the order
- Wrong email → treat as not found (same 404 shape)
- Admin list row only includes table fields (id, date, name, status, total) — not address
- `update` accepts any of the five statuses; note is stored on the history entry when provided
- `npx tsc --noEmit` clean

**Manual:** login → Orders → open an order → set shipped + note → `/track` with that ID and email shows Shipped and the note. Phone/address only on admin detail.

## Code style

Follow T-02 admin patterns: server list/detail pages, client forms, `adminFetch`, `isAdminRequest`. Reuse `ORDER_STATUSES` from `lib/order-store.ts`. Do not add an orders CMS package.

## Boundaries

- **Always:** Redact shopper order JSON. Admin detail is the only place for phone/address. Any status allowed. Tests for redaction before UI.
- **Ask first:** New status values, tracking-carrier integrations, changing checkout, new email HTML.
- **Never:** Staff accounts. Card payments. Sanity. Publishing shopper PII on `/track`. T-07 visual redesign of the storefront chrome (track can look like today’s shop, just clearer).

## Out of scope

- T-04 new transactional email templates (existing send-on-status stays)
- T-05 analytics, T-06 staging, T-07 storefront redesign, T-08 Vercel
- Courier APIs, printed packing slips, refunds, invoices

## Success criteria

- [x] `/admin/orders` compact table; search; click through to detail
- [x] Detail shows full COD customer + items + timeline
- [x] Any of the five statuses can be set with an optional note; `/track` reflects it
- [x] `/track` is readable on a phone: headline, timeline, items; no phone/address
- [x] Wrong track lookup does not leak that an order ID exists
- [x] `npx tsc --noEmit` and `npm test` pass

## Open questions

None. Intent confirmed 2026-08-26. Approach: Option 1 (admin shell + restyle `/track`).
