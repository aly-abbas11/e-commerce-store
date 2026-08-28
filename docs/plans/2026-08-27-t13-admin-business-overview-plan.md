# Plan: T-13 — Admin business overview (dashboard)

## 1. Plain summary

You run this shop yourself. After you sign in, you should see how the day is going without opening Orders, Products, and Reviews one by one.

Today `/admin` jumps straight to the orders table. There is no home.

This work turns `/admin` into a **Home** screen: today’s orders, today’s money, work still waiting (New + Processing), delivered today, cancelled today, low stock, and a short “needs you” list. Tiles open the lists you already have. Shoppers never see this page.

## 2. Goal

Done means: you sign in to admin and land on a clear snapshot of **today in Pakistan** plus **what still needs packing**. Numbers match the rules below. Practice orders do not pollute the money.

## 3. In scope

- Replace the `/admin` redirect with a Home dashboard.
- Put **Home** first in the admin sidebar.
- After login, go to Home (not Orders).
- Six number tiles (see section 12).
- A **Needs you** list (open orders, shipped waiting to mark delivered, low/sold-out products, reviews waiting, unpublished product drafts).
- Click a tile or row to open the matching admin page. Orders and Products get simple URL filters so the right rows show.
- Pure counting rules in a small tested helper (same style as order-rules).
- Same admin password as today. No new tables.

## 4. Out of scope

- Charts, yesterday vs today, 7-day reports, or a date picker — that is a later reports job, not this home.
- Changing how shoppers see `/`, `/home2`, checkout, email, or `/track`.
- Restyling Orders, Settings, and the rest of admin (T-12).
- Homepage section builder (T-10) or event colors (T-11).
- Stock quantity numbers (the shop only has in stock / low / out).
- Card payments, tax reports, or Microsoft Clarity (T-05).
- Pushing the database or deploying until you say **push** / **deploy**.

## 5. Who this is for

You (the store owner). Shoppers are not affected.

## 6. How it works today

Sign in → `/admin` → redirect to `/admin/orders`. You scan the full table. Low stock is only on each product. Reviews live on another page.

## 7. How it will work after

Sign in → **Home**. Six tiles. A short list of work. Click through to pack an order, restock, or approve a review. Orders and Products still exist in the sidebar.

## 8. Chosen approach

**Option 1 — Action home** (you chose the recommended path).

Count in code from data we already load (orders, products, review submissions). No new analytics database. “Today” is **Asia/Karachi** (Pakistan), midnight to now.

This matches Shopify Home (daily health, not deep reports) and WooCommerce (cancelled is not sales; “needs action” on the home screen).

## 9. Other options we considered

- **Reports home** with charts and week compare — extra clutter for one operator; skip for now.
- **Inbox only** (no money numbers) — you asked for today’s orders and revenue.

## 10. Codebase contact points

| Area | Change | Why |
|---|---|---|
| `app/admin/page.tsx` | write | Dashboard instead of redirect |
| `components/admin/admin-shell.tsx` | write | Home link first |
| `components/messaging/admin-login-form.tsx` | write | After login → `/admin` |
| `components/admin/order-list.tsx` + orders page | write | Optional `?status=` filter |
| `components/admin/product-list.tsx` + products page | write | Optional `?stock=attention` filter |
| `lib/order-store.ts` / `lib/db/store.ts` `getAllOrders` | read | Same list as Orders |
| `lib/db/admin-store.ts` products + review submissions | read | Low stock + reviews + drafts |
| New `lib/db/dashboard-rules.ts` + test | write | All counting rules, unit-tested |
| New `components/admin/dashboard.tsx` | write | Tiles + Needs you |
| Shop pages, checkout, emails | none | Out of scope |

## 11. Screens and workflow impact

| Screen | Before | After | Risk |
|---|---|---|---|
| `/admin` | Jump to Orders | Home snapshot | Bookmark users who expected Orders still have the Orders link |
| Login | Goes to Orders | Goes to Home | None; one extra click to Orders if you want the table |
| Sidebar | Starts at Orders | Home, then Orders, … | Active highlight for `/admin` must not also light up every child |
| Orders | Full table | Same table; Home can open it already filtered | Filter must not hide search |
| Products | Full table | Same; Home can open low/sold-out | Practice products stay visible on Products, hidden from Home money/stock |
| Reviews | Full queue | Unchanged; Home links here | None |
| Live shop | Unchanged | Unchanged | None |

## 12. Data and rules

**Live vs practice.** Ignore `isDemo` orders and `isDemo` products on Home. If any practice orders exist, show a small line: “N practice orders hidden.”

**Today.** Calendar day in `Asia/Karachi`, from 00:00 to now.

**Tiles**

| Tile | Rule | Click goes to |
|---|---|---|
| Today’s orders | Count of live orders with `createdAt` today (any status, including cancelled) | `/admin/orders` |
| Today’s money | Sum of `total` for live orders created today whose status is **not** cancelled | `/admin/orders` |
| Pending | Count of live orders with status **new** or **processing** (any day) | `/admin/orders?status=pending` |
| Delivered today | Live orders whose status is **delivered** and `statusUpdatedAt` is today | `/admin/orders?status=delivered` |
| Cancelled today | Live orders whose status is **cancelled** and `statusUpdatedAt` is today | `/admin/orders?status=cancelled` |
| Low stock | Count of live, published products with `stockStatus` **low-stock** or **out-of-stock** | `/admin/products?stock=attention` |

Money is rupees (`formatPrice`). Empty shop shows **0**, not an error.

**Needs you** (hide a row when its count is 0)

- Pending orders (newest first, up to 8 rows) → order detail
- Shipped, not yet delivered (count + link) → `/admin/orders?status=shipped`
- Low / sold-out products (up to 8) → product edit
- Review submissions with status pending → `/admin/reviews`
- Product drafts / unpublished (status not published) → product edit

**Labels on screen (exact)**

- Home
- Today’s orders
- Today’s money
- Pending
- Delivered today
- Cancelled today
- Low stock
- Needs you
- Practice orders hidden

## 13. Edge cases and decisions

All locked as the recommended path:

- **Pending** = New + Processing, any day (work pile, not only today).
- **Today’s order count** includes cancelled placed today.
- **Today’s money** excludes cancelled. Includes New, Processing, Shipped, Delivered (COD: placed is expected cash until you cancel).
- **Delivered today / Cancelled today** use the time you **set that status**, not the original order date. Delivering yesterday’s order today counts as delivered today.
- **Timezone** = Asia/Karachi. Do not use UTC midnight or the server’s local clock.
- **Missing `statusUpdatedAt`:** do not count that order on the “today” status tiles.
- **Missing `total`:** treat as 0.
- **Missing status:** treat as `new` (same as tracking).
- **Shipped** is not a top tile. It only appears under Needs you.
- **Demo / practice** never in tiles or money. Products list in admin can still show them.
- **Draft products** do not count as low stock. Only published live products.
- **Variants:** Home uses the product’s own stock flag, not each variant (this shop has no quantity field).
- **No live refresh:** numbers update when you open or refresh the page (`force-dynamic`, same as Orders).
- **Same admin cookie.** No extra roles.
- **Partial load failure:** if orders fail, show an error on Home; do not pretend zeros.
- **Double-submit / concurrent:** Home is read-only. No writes.
- **Undo:** none. Changing an order status on the order page is still how you fix a number.
- **Mobile:** tiles stack two-wide on a phone, six-wide on a wide screen. Needs you is a simple list.
- **Out of scope if it appears later:** compare to yesterday, top-selling SKU, live visitor count.

## 14. Step-by-step build order

1. **Rules + tests** — Add `lib/db/dashboard-rules.ts` and `lib/db/dashboard-rules.test.ts`. Cover today in Karachi, pending, money excluding cancelled, demo skip, delivered-today vs created-today. Run `npx tsx --test lib/db/dashboard-rules.test.ts` until green. Add the file to `package.json` `test`.
2. **Home page data** — Change `app/admin/page.tsx` to load orders, products, and review submissions (existing helpers). Pass a computed snapshot into a new `Dashboard` component. Verify `/admin` no longer 307s to Orders when logged in (expect 200).
3. **Sidebar + login** — Home first in `admin-shell`. Login `replace("/admin")`. Active state: `/admin` exact match only. Click Home vs Orders in the sidebar.
4. **Click-through filters** — Orders: `status=pending|shipped|delivered|cancelled`. Products: `stock=attention`. Empty filter = current full list. Search still works on the filtered set.
5. **Empty and demo** — With no orders, all zeros and no Needs you rows. With only demo orders, zeros plus “practice orders hidden.”
6. **Typecheck + suite** — `npx tsc --noEmit` and `npm test`. Open `/admin` (login), `/admin/orders`, `/`, `/home2` and confirm shop pages unchanged.

Do not deploy unless you say **deploy**.

## 15. Impact and risks

- Wrong timezone near midnight would move “today” by a few hours — Karachi is fixed to avoid that.
- Counting cancelled in money would make a bad day look fine — we exclude them.
- Counting demo checkout as sales would lie — we hide them.
- Sidebar “active” highlighting every page if we use `startsWith("/admin")` — Home must be exact `/admin` only.
- Loading every order/product in memory is what Orders/Products already do; Home uses the same size of data. No new table until the list gets huge (out of scope).

## 16. Test checklist

- Login lands on Home with six tiles.
- Place a live COD order: today’s orders +1, today’s money + total, pending +1, Needs you shows it.
- Mark it processing: pending unchanged (still pending).
- Mark it shipped: pending −1; Needs you shows shipped.
- Mark it delivered the same day: delivered today +1; shipped row gone.
- Cancel a today order: today’s orders still includes it; today’s money drops that total; cancelled today +1.
- Cancel an old order today: cancelled today +1; today’s money unchanged.
- Practice checkout: numbers unchanged; hidden line appears.
- Product set to low stock (published, not demo): low stock +1; Needs you lists it.
- Draft product low stock: not in the tile.
- Pending review: Needs you links to Reviews.
- `/` and `/home2` still 200 and look the same.
- Logged-out `/admin` still goes to login.

## 17. Open questions

None. Recommended defaults are locked.

## 18. Approval

- [x] User approved this plan
- Date / note: 2026-08-27 — user replied “approve” (Option 1, recommended rules)
