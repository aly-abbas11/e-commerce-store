# Orders and tracking implementation

Staff packing in the T-02 admin shell, plus shopper `/track`. Checkout is still cash on delivery. New email HTML is T-04.

## Who uses it

- **You** at `/admin/orders` (same `ADMIN_TOKEN` cookie / Bearer as the rest of admin).
- **Customers** at `/track` with the order ID and the email used at checkout.

## Admin

`/admin/orders` is a compact table: order ID, date, name, status, total. Search filters ID, name, and email. The table does not show phone, address, or line items.

Click a row for `/admin/orders/[orderId]`: full customer (name, email, phone, address, city, postal if stored), items, totals, COD, timeline, and a status form. Any of the five statuses is allowed. An optional note is stored on the history entry.

Unknown IDs 404. Admin pages send `noindex`. Unsigned visits redirect to `/admin/login`.

## Shopper track

`GET /api/orders/[orderId]?email=` returns status, history, items, and totals. It never includes phone or address. Missing orders and wrong emails both return the same 404 copy so the ID is not leaked.

`/track` auto-searches when `?orderId=` and `?email=` are in the URL. After a match it stacks: status headline, pipeline timeline (placed → processing → shipped → delivered; cancelled only when cancelled), items and totals, then a contact link.

When the order is still `new` or `processing` and less than 24 hours old, Track shows **Cancel order** (confirm inline). `POST /api/orders/[orderId]/cancel` with `{ email }` sets `cancelled`, note `Cancelled by customer`, and sends the same cancelled email as admin.

## Status updates

`POST /api/orders/[orderId]/status` is unchanged in contract: admin-only, `{ status, note }`, writes history, emails when status is not `new`. T-03 does not change email copy.

## Key files

| Path | Role |
|---|---|
| `app/admin/orders/page.tsx` | Compact list |
| `app/admin/orders/[orderId]/page.tsx` | Full detail |
| `app/api/admin/orders/route.ts` | Admin list JSON |
| `app/api/orders/[orderId]/route.ts` | Shopper lookup (redacted) |
| `app/api/orders/[orderId]/cancel/route.ts` | Shopper self-cancel (24h, new/processing) |
| `app/api/orders/[orderId]/status/route.ts` | Admin status + email |
| `components/admin/order-list.tsx` | Table + search |
| `components/admin/order-detail.tsx` | Detail + status form |
| `components/orders/track-order.tsx` | Track form and result |
| `lib/db/order-rules.ts` | Redaction and status helpers (unit-tested) |
| `lib/order-store.ts` | `getAllOrders`, `getOrderById`, `updateOrderStatus` |

## Out of this module

Transactional email templates (T-04; see `docs/modules/email/`), analytics (T-05), staging (T-06), storefront redesign (T-07), Vercel (T-08), courier APIs, packing slips, refunds, invoices, staff accounts, card payments.
