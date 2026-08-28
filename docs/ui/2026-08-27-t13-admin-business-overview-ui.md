# UI Plan: Admin business overview (Home)

## 1. Plain summary

Turn `/admin` into a calm Home: six number tiles on top, a “Needs you” list under them. Same admin look as Orders and Products. No charts. No new brand.

## 2. Links

- Product / master plan: `docs/plans/2026-08-27-t13-admin-business-overview-plan.md` (approved 2026-08-27)
- Spec: `docs/superpowers/specs/2026-08-27-t13-admin-business-overview-design.md`
- Chat: Option 1 action home; pending = New + Processing; recommended counting rules

## 3. Goal

You can read the day in a few seconds on a phone or laptop, then tap a tile to do the work. It should feel like the rest of this admin, not a purple analytics product.

## 4. In scope (screens & surfaces)

- `/admin` Home (tiles, Needs you, empty, error, practice-hidden line)
- Admin sidebar: **Home** first; active state for exact `/admin` only
- Login success: land on Home
- Orders list: optional `?status=` (pending, shipped, delivered, cancelled); no param = full list
- Products list: optional `?stock=attention`; no param = full list
- Tile and row hover/focus; loading is the existing server page load (no skeleton library)
- Mobile stacking vs desktop grid

## 5. Out of scope

- Live shop `/` and `/home2`
- Charts, date picker, compare to yesterday
- Restyling Orders table chrome, Settings, Messaging (T-12)
- New fonts, new icon set, glow cards, dark-only dashboard
- Toasts on Home (read-only)

## 6. Current app UI snapshot

- **Color:** Light admin: white background, near-black text, zinc borders, red destructive. Dark class exists (electric blue primary) but admin pages use the same tokens as the rest of the app.
- **Type:** `font-sans`, list titles `text-2xl font-semibold`, body `text-sm`, muted labels `text-muted-foreground`.
- **Spacing:** Page blocks `space-y-4`; table cells `px-3 py-2`; cards `rounded-lg border`.
- **Shape:** `rounded-lg` / `rounded-md`; light shadow on Card.
- **Layout:** Left sidebar 14rem (`w-56`), “Store admin”, links `px-3 py-2 text-sm`; active = `bg-primary text-primary-foreground`.
- **Components:** shadcn Button, Input, Card, table (Orders). Product list is a simple table + search.
- **Motion:** Almost none (hover underline on order IDs).
- **Tone:** Utilitarian warehouse admin, not marketing.
- **Breakpoints:** Sidebar hidden on small screens; header menu button (`md:hidden`).

**Must stay:** same tokens, same sidebar, same heading size as “Orders”.

## 7. Research collage

| REF | URL | Steal | Fit |
|---|---|---|---|
| Shopify Home | https://qstomy.com/en/blog-posts/what-is-the-shopify-dashboard | 4–6 daily metrics, not a full report wall | high |
| Shopify metrics bar | https://shopify.dev/docs/api/shopifyql/latest/web-components/metrics-bar | Equal-width metric cards in one row; click through | high |
| WooCommerce Home | https://woocommerce.com/document/woocommerce-analytics/ | Actionable orders on home; cancelled out of sales | high |
| Polaris / admin apps | https://shopify.dev/docs/apps/design/app-structure | Work stays in the admin body; no extra nav chrome | medium |
| Current VoltGear admin | `components/admin/admin-shell.tsx`, order-list | Reuse Card + table language | high |

Repeated theme: **metrics row + work list**. Bad fit: analytics chart dashboards, KPI sparks, “AI insights”.

## 8. Chosen direction

**Direction A — Quiet tiles + list** (recommended, locked with Option 1).

Keep current admin skin. Six equal cards in a grid. Large number, small label. Whole card is a link. Below, a bordered list titled Needs you. Empty = one muted sentence.

## 9. Directions we did not pick

- **B — Chart dashboard:** bars for 7 days. Out of product scope; looks like a SaaS template.
- **C — Inbox only:** no money tiles. Conflicts with the approved plan.
- **D — Colored status rainbow:** each tile a different bright color. Fights this admin’s black/white/zinc look.

## 10. Visual mockup index

Image generation skipped (no explicit image request; GenerateImage rule). Wireframes below are the source of truth.

- **UI-01** Home desktop, filled — keep
- **UI-02** Home mobile — keep
- **UI-03** Home empty zeros — keep
- **UI-04** Home error — keep
- **UI-05** Home practice-hidden line — keep
- **UI-06** Sidebar with Home active — keep
- **UI-07** Orders filtered from tile — keep

**UI-01 desktop**

```
[ Store admin ]
  Home          ← active
  Orders
  Products
  ...

  Home
  [ Today's orders  4 ] [ Today's money  Rs 12,400 ] [ Pending  2 ]
  [ Delivered today 1 ] [ Cancelled today  1 ] [ Low stock  3 ]

  Needs you
  VG-AB12  Ali Khan     New          Rs 3,499     →
  VG-CD34  Sara         Processing   Rs 1,250     →
  1 shipped, waiting to mark delivered            →
  PowerCore 20K  Low stock                        →
  2 reviews waiting                               →
  1 product draft                                 →

  2 practice orders hidden
```

**UI-02 mobile:** title, then 2-column tile grid, then Needs you full width.

**UI-03:** six tiles showing `0` / `Rs 0`; Needs you omitted (no section heading if empty).

**UI-04:** title + `text-destructive` sentence: “Could not load the overview. Open Orders and try again.” No fake zeros.

**UI-05:** tiles at zero; muted line under the grid.

**UI-06:** Home `bg-primary`; Orders not highlighted on `/admin`.

**UI-07:** Orders heading unchanged; table already filtered; search still above the table.

## 11. Design tokens

Reuse existing CSS variables. Do not add new colors.

- Background / card / border / muted / destructive: current `--*`
- Tile number: `text-2xl font-semibold tabular-nums`
- Tile label: `text-sm text-muted-foreground`
- Cancelled count: same as other numbers (not red) so six tiles stay even; cancelled **rows** in Needs you can use muted
- Spacing: `gap-3` tiles, `space-y-6` between grid and Needs you
- Radius: `rounded-lg` (Card)
- Breakpoints: `grid-cols-2 md:grid-cols-3 xl:grid-cols-6`
- Motion: none besides existing link hover underline

## 12. Layout system

Same AdminShell. Content: `space-y-6` in the main pane (match list pages’ padding: none extra wrapper if shell already pads — check shell: children sit in `flex-1`; order list has no page padding class on the shell… read shell).

Admin shell main: `{children}` only. Order list is `space-y-4` with no outer px. **Home uses the same:** no new max-width container. If order list looks tight, match it exactly.

Nav order: Home, Orders, Products, Shop types, Pages, Hero, Settings, Testimonials, Reviews, Messaging.

Home active: `pathname === "/admin"` only. Other items keep `pathname === href || startsWith(href + "/")`.

## 13. Component inventory

| Name | Purpose | States | Content | New vs reuse |
|---|---|---|---|---|
| AdminShell nav item Home | Go to overview | default, active, hover | “Home” | reuse Link, add row |
| Dashboard | Page body | default, empty, error | heading + tiles + list | **new** |
| MetricTile | One number + label, entire card clickable | default, hover, focus-visible | label, value | **new**, built from Card + Link |
| NeedsYouList | Work rows | default, empty (hidden) | title + rows | **new** |
| NeedsYouRow | One line + chevron | default, hover, focus | title, meta, link | **new** |
| PracticeHiddenNote | Demo disclaimer | hidden if 0 | “N practice orders hidden” | **new** (a `<p>`) |
| OrderList | Optional status filter | unfiltered / filtered / empty match | existing table | reuse + query |
| ProductList | Optional stock filter | same | existing table | reuse + query |
| Button / Input / Card | chrome | existing | existing | reuse |

No new modal. No toast.

## 14. Screen-by-screen spec

### Home `/admin`

- **Purpose:** Daily snapshot + next actions.
- **Who:** Store owner.
- **Layout top → bottom:** `h1` “Home”; optional error; 6 tiles; Needs you (if any rows); practice note (if N > 0).
- **Tiles (left → right, wrap):** Today’s orders; Today’s money; Pending; Delivered today; Cancelled today; Low stock.
- **Each tile:** label on top, value below. Entire card is `<a>`. `aria-label` e.g. “Today’s orders, 4”.
- **Needs you heading:** “Needs you”
- **Row types and copy:**
  - Order: `{orderId}` · `{customerName}` · `{status label}` · `{price}` → `/admin/orders/{id}`
  - Shipped bucket: `{n} shipped, waiting to mark delivered` → `/admin/orders?status=shipped`
  - Product stock: `{name}` · `Low stock` or `Sold out` → `/admin/products/{id}`
  - Reviews: `{n} reviews waiting` → `/admin/reviews`
  - Drafts: `{n} product draft` / `{n} product drafts` → first draft’s edit page if n=1, else `/admin/products` (unfiltered; drafts still visible in the table)
- **Empty:** tiles 0; no Needs you block.
- **Loading:** Next.js server render; no extra spinner.
- **Error:** destructive text; no tiles (do not show zeros).
- **Mobile:** 2 columns; desktop 3; xl 6.
- **Mockups:** UI-01–UI-05.

### Sidebar

- First link **Home** → `/admin`
- **Mockup:** UI-06

### Login

- Success `router.replace("/admin")`
- No new login layout

### Orders list

- Read `status` search param: `pending` (new+processing), `shipped`, `delivered`, `cancelled`
- Unknown param = ignore (full list)
- Search still filters the already-status-filtered rows
- Heading stays “Orders”
- **Mockup:** UI-07

### Products list

- `stock=attention` → low-stock or out-of-stock (all products in the admin table, including drafts — the **tile** already excluded drafts; the list filter can show drafts that are low so you can fix them). **Correction to stay consistent with plan:** plan says click goes to products with attention = low/out. Plan low-stock **tile** is published live only. List filter: show products whose stock is low or out, still including drafts if they match (owner can fix). Demo products: show in the filtered list (owner may want to see them) but they did not affect the tile count.
- Heading stays “Products”

## 15. User flows (UI steps)

1. Sign in → Home with tiles.
2. Tap Pending → Orders table showing only New + Processing.
3. Tap an order row on Home → order detail.
4. Tap Low stock → Products filtered to low/sold out.
5. Tap reviews line → Reviews page.
6. Open Orders in the sidebar → full unfiltered table.
7. Sign out still from sidebar.

## 16. Accessibility

- Tiles are real links with clear names (not clickable divs).
- Focus ring: existing `ring` token (`focus-visible` on links).
- Contrast: default foreground on card; muted labels on white — current admin contrast.
- Needs you rows are links; status text is not the only cue (order id + name).
- Errors in `text-destructive` and in the page, not only color.
- Sidebar Home vs Orders must not both look active on Home.

## 17. Content & microcopy

Exact strings:

- Home
- Today’s orders
- Today’s money
- Pending
- Delivered today
- Cancelled today
- Low stock
- Needs you
- `{n} shipped, waiting to mark delivered`
- `{n} reviews waiting`
- `{n} product draft` / `{n} product drafts`
- `{n} practice orders hidden`
- Could not load the overview. Open Orders and try again.
- Status labels: New, Processing, Shipped, Delivered, Cancelled (same as Orders)
- Sold out / Low stock on product rows

No emoji. No “Welcome back!”. No “Insights”.

## 18. Build order (UI only)

1. Metric tiles + heading in Home (zeros OK) — look like Cards beside each other.
2. Needs you list styling — match order table density (`text-sm`, border, padding).
3. Sidebar + login target.
4. Filter query on Orders/Products — confirm list still looks the same when unfiltered.
5. Empty, error, practice line.
6. Phone width: two columns, tap targets ≥ 44px on tiles (`min-h-11` content padding).

Files: `app/admin/page.tsx`, `components/admin/dashboard.tsx`, `admin-shell.tsx`, `admin-login-form.tsx`, `order-list.tsx`, `product-list.tsx`.

## 19. Impact on existing screens

- Orders/Products tables: extra filter only when the query is present.
- All other admin pages: sidebar gains Home; active highlight rules as above.
- Shop: none.

## 20. Open questions

None.

## 21. Approval

- [x] User approved this UI plan
- Date / note: 2026-08-27 — user replied “approved”
