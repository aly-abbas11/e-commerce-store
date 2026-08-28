# Spec: T-13 — Admin business overview (dashboard)

## Objective

Give the store owner a **Home** screen in `/admin` that answers “how is today going, and what still needs me?” without opening every list.

**User:** you, signed in with the existing admin password.

**Why now:** `/admin` redirects to Orders. Money, pending work, cancellations, and low stock are scattered.

**Success:** After login you land on Home. Six tiles plus a Needs you list, using the locked counting rules. Shoppers never see this page. Live `/` and `/home2` stay unchanged.

## Tech stack

- Next.js 14 App Router, existing admin shell
- Existing `getAllOrders`, `listAdminProducts`, `listReviewSubmissions`
- Same `ADMIN_TOKEN` cookie + Bearer
- Current shadcn admin chrome (no T-07 look)
- Unit tests: `lib/db/dashboard-rules.ts` (same pattern as `order-rules.ts`)

## Commands

```
npm run dev
npm test
npx tsc --noEmit
```

No `db push`. No deploy unless you say **deploy**.

## Project structure

```
app/admin/page.tsx                     → Home (no redirect)
components/admin/dashboard.tsx         → tiles + Needs you
components/admin/admin-shell.tsx       → Home first in nav
components/messaging/admin-login-form.tsx → after login → /admin
components/admin/order-list.tsx        → ?status= filter
components/admin/product-list.tsx      → ?stock=attention
lib/db/dashboard-rules.ts              → counting (tested)
lib/db/dashboard-rules.test.ts
```

## Locked decisions

| Topic | Decision |
|---|---|
| Approach | Option 1 — Action home (approved 2026-08-27) |
| Pending | New + Processing, any day |
| Today | Asia/Karachi calendar day |
| Today’s orders | Live orders created today, any status |
| Today’s money | Sum of `total` for those orders except cancelled |
| Delivered / cancelled today | Status **set** today (`statusUpdatedAt`) |
| Demo | Hidden from tiles and money; optional “N practice orders hidden” |
| Low stock tile | Published, live products with low-stock **or** out-of-stock |
| Drafts | Not in low-stock count; listed under Needs you |
| Shipped | Needs you only, not a top tile |
| Charts / date picker | Out of scope |
| Auth | Same admin cookie |

Full rules: `docs/plans/2026-08-27-t13-admin-business-overview-plan.md`.

## Impact analysis

Swept 2026-08-27. Admin-only read surface. No shopper data-visibility change.

### Data model

No new tables or columns. Counts from `orders` (+ status / `status_updated_at` / `is_demo` / `created_at` / `total`), `products` (`stock_status`, `status`, `is_demo`), `review_submissions` (`status`).

### Shared / cross-cutting

- `middleware.ts` already gates `/admin/*` except login. Home stays behind the cookie.
- `getAllOrders` loads every order (Orders page already does this). Home reuses that; no new query layer unless lists get huge later.
- `toAdminOrderListItem` stays the list shape; dashboard rules take `Order[]` and return a snapshot.

### Visibility audit

| Module / screen | Exposes today | Should be limited to | Limited now? | Gap → task |
|---|---|---|---|---|
| New Home `/admin` | — | Admin only | Cookie on `/admin/*` | None |
| Orders list/detail | All orders (demo tagged) | Admin | Yes | Home **hides** demo from numbers (stricter than the table) |
| Products list | All products including drafts/demo | Admin | Yes | Home low-stock = published + not demo only |
| Reviews queue | All submissions | Admin | Yes | Home only pending |
| Live shop `/`, `/home2`, product pages | Published catalog | Guests / demo session | Yes (`status = published`) | No change |
| Checkout / track / emails | Order as today | Shopper or staff APIs | Yes | No change |
| `/api/admin/*` | Staff writes | Admin Bearer/cookie | Yes | No new write API required |
| Clarity / T-05 | Shop only | Admin excluded | Yes | Home not logged in Clarity |

**Summary:** Shopper surfaces do not leak Home. Admin Home must not count practice orders as sales. No extra T-## spawned.

### Tests that will change

- `package.json` `test` script: add `lib/db/dashboard-rules.test.ts`.
- Existing order-rules tests stay. Order list gains an optional filter; default (no query) must still show the full table.

### Integration

No webhooks, no email, no Vercel env, no Supabase migration.

### Spawned follow-ups

None. T-12 (easier rest of admin) still later. Charts/date range stay unscheduled.

## Out of this spec

Storefront redesign, T-10 home builder, T-11 themes, T-12 restyle, payments, Clarity ID.

## UI

See `docs/ui/2026-08-27-t13-admin-business-overview-ui.md` (approved 2026-08-27).

## Phase breakdown

### Phase 1 — Counting rules
Pure helpers + tests: Karachi “today”, pending, money without cancelled, demo skip, delivered/cancelled by status time, filters.

**Accept:** `npx tsx --test lib/db/dashboard-rules.test.ts` green.

### Phase 2 — Home screen
`/admin` renders tiles + Needs you. Sidebar Home first. Login lands on Home.

**Accept:** logged-in `/admin` is 200 (not a redirect to Orders). Tiles use the exact labels.

### Phase 3 — Click-through filters
Orders `?status=`; Products `?stock=attention`. Unfiltered lists unchanged.

**Accept:** pending tile opens only New + Processing; empty query shows all.

### Phase 4 — Empty / error / shop unchanged
Zeros with no Needs you; load failure message; `/` and `/home2` still 200.

**Accept:** `npm test` and `npx tsc --noEmit` green.
