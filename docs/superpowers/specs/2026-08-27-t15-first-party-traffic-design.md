# Spec: T-15 — First-party traffic, funnel, and conversion insights

## Objective

Give the store owner **first-party** answers inside existing `/admin/analytics`: who visited, from where, where they dropped, and what to check next — using VoltGear’s own Supabase data. T-14 remains the money and COD-lifecycle engine. This task does not add a second analytics product.

**User:** you, signed in to `/admin/analytics`.

**Why now:** T-14 can report delivered revenue and Placed → Processing → Shipped → Delivered. Visitors, sources, shop conversion, and drop-off are still **Not available**. Optional GA/Clarity are not the source of truth.

**Success:** After a live shopper hits a tagged campaign, views a live PDP, adds to cart, enters `/checkout`, and places a COD order, Analytics (inside the 90-day raw window) shows that session in Traffic and the shop funnel, links the order as a converted session, and T-14 still reports Order (New) → Delivered and delivered revenue. Tracking failure never blocks buying. Demo, `/admin`, `/home2`, and `/product2` never inflate live numbers.

## Tech stack

- Next.js 14 App Router, existing admin Analytics console
- Supabase (service-role writes on the server only; RLS on; no anon insert)
- Same admin cookie / Bearer as T-14
- Same Karachi presets and `h-11` admin chrome
- Unit tests beside T-14: `lib/db/*analytics*.test.ts` via `npm test`
- Schema: new migration; **ask before `supabase db push`**

## Commands

```
npm run dev
npm test
npx tsc --noEmit
```

No deploy unless you say **deploy**.

## Chosen approach

**Approach A:** first-party cookies + `POST /api/analytics/event` + best-effort checkout link.

Rejected:

- **B** — middleware page logs plus a second client pipeline for cart/checkout (two exclusion rules, funnel drift).
- **C** — browser writes to Supabase with the anon key (breaks T-01 “shoppers never write via anon”; cannot trust httpOnly `vg_demo`).

## Locked decisions

| Topic | Decision |
|---|---|
| Surfaces counted | Live shop only. `/admin/*`, `/home2`, `/product2` excluded at client and server |
| Demo | `is_demo` stamped at write from httpOnly `vg_demo`. Same `vg_vid` may have live and demo sessions. Live reports use `is_demo = false` only. Demo/live mismatch on an active session → **new session**, same visitor |
| GA / Clarity | Keep existing optional loaders. Admin analytics never reads them |
| `checkout_started` | Shopper genuinely enters `/checkout` |
| Checkout steps | `details` and `confirm` only (not Cart) |
| Validation | Category only, never submitted values. HTML + known 400/409. Not network/500 |
| Add/remove cart | After successful `cart-provider` mutation, not button impressions |
| `product_view` | Live PDP `app/product/[slug]` only |
| Order conversion | `POST /api/checkout` is the only authority. Place Order click / failed request is not an order |
| Checkout vs analytics | **Checkout never depends on analytics succeeding.** Session lookup is best-effort. Lookup failure → null FKs and null snapshot; order still creates; later source = **Unattributed** |
| T-14 | Authoritative for lifecycle, delivered revenue, profit, products, cities, customers, query builder, financial drilldown |
| Statuses | New → Processing → Shipped → Delivered / Cancelled. No Confirmed |
| Timezone / presets | Asia/Karachi; reuse T-14 presets |
| Session idle | 30 minutes. Enforced with `last_activity_at`, not cookie presence alone. Rolling cookie expiry may match, but a stale/replayed `vg_sid` must not resurrect an old session |
| Session cohort | Traffic + shop funnel: sessions with `started_at` in range and `is_demo = false` |
| Funnel units | Shop **reach counts** = distinct `session_id` with that event (may be non-nested). Shop **`% of previous` and Insights** = ordered transition rates (never > 100%). COD block = T-14 order counts. **No conversion % across the session→order unit change** |
| Unique visitors | `COUNT(DISTINCT visitor_id)` from that live session cohort. Never `COUNT(analytics_visitors)` |
| Attribution on session | First-touch frozen at session create from client landing context. New UTM inside 30 minutes does not new-session and does not overwrite first-touch |
| Attribution on order | Compact snapshot copied at successful checkout. Survives 90-day raw purge |
| Direct vs Unattributed | Direct = real session with no external source. Unattributed = order has no usable snapshot. Never map missing snapshot to Direct |
| Raw retention | **Implemented cleanup**, not a reporting-only window. Sessions with `last_activity_at` older than 90 days are deleted; events on those sessions `ON DELETE CASCADE`. Orders stay; FKs `ON DELETE SET NULL`; attribution snapshot remains. Visitors with no remaining sessions and `last_seen_at` older than ~1 year (`vg_vid` lifetime) **are deleted**. If the selected range starts before the 90-day window, Traffic + shop funnel + shop insights = **Not available** (not a partial count). T-14 money/orders and delivered-by-source from snapshots remain |
| Query builder | Unchanged T-14 whitelist |
| Ads / ROAS / contribution profit | Still **Not available** |
| Fingerprinting | None. Random `vg_vid` only |
| Session recording / TikTok / Meta APIs | Out of scope (T-05 / later) |

## Architecture

```
Live shop JS (not admin, not gadget)
  → one per-tab send queue / bootstrap promise
  → capture landing UTM/click/referrer synchronously at tracker init
  → first POST establishes vg_vid / vg_sid; later events wait for that
  → POST /api/analytics/event  { event_id, name, path, page_type, product_*, properties, attribution? }
  → server: origin check, rate limit, whitelist, sanitize strings,
            stamp is_demo from vg_demo,
            expire/split session, first-touch on NEW session only,
            insert event (ignore duplicate event_id)
  → always { ok: true } to the shopper

Successful POST /api/checkout
  → create order first (business path)
  → best-effort: resolve vg_sid → set analytics_session_id, analytics_visitor_id, snapshot
  → on any analytics failure: leave those null; order still saved
```

Optional GA `dataLayer` helpers in `lib/analytics.ts` stay. First-party calls are a sibling, not a replacement that admin reads.

### Public ingest payload

```text
{
  event_id,          // UUID; new per genuine action; retries reuse
  name,
  path,              // pathname only
  page_type,

  product_id?,
  variant_id?,
  product_slug?,

  properties,        // per-event schema only

  attribution?: {
    utm_source?, utm_medium?, utm_campaign?, utm_id?,
    utm_content?, utm_term?,
    ttclid?, fbclid?, gclid?,
    referrer?
  }
}
```

The browser reads UTM/click IDs/referrer from the **landing document**, not from the ingest request’s HTTP referrer (that referrer is usually VoltGear). Capture that landing context **synchronously when the tracker initializes** and attach it to the **first** queued request. Server uses `attribution` **only when creating a session**. Do not store arbitrary query parameters.

### First-visit cookie/session bootstrap

On a cookie-less first hit (typical PDP: `page_view` and `product_view` almost together), both requests must not race to create two visitors/sessions or drop landing attribution.

`lib/first-party-analytics.ts` uses **one shared per-tab send queue** and a **bootstrap promise**:

1. Initialize: snapshot `window.location` search (utm/click ids) and sanitized `document.referrer` immediately.
2. First analytics POST is the only request allowed until it completes (cookies set).
3. Queued later events then send, each with its own `event_id`; retries of one send reuse that id.

Test: two events fired immediately on a cookie-less PDP visit produce one visitor, one session, and first-touch from the captured landing context.

`is_demo` in JSON is ignored.

### Event whitelist

| `name` | When | `properties` |
|---|---|---|
| `page_view` | Live path change | `{}` (`page_type` is a column) |
| `product_view` | Live PDP only | `{}` (ids/slug are columns) |
| `add_to_cart` | After successful `addItem` | `{ quantity }` integer |
| `remove_from_cart` | After a line is actually removed (incl. qty → 0) | `{ quantity }` integer |
| `checkout_started` | Enter `/checkout` | `{}` |
| `checkout_step` | Enter Details or Confirm | `{ step: "details" \| "confirm" }` |
| `checkout_validation_error` | HTML invalid or known 400/409 | `{ category }` from `name`, `email`, `phone`, `address`, `city`, `empty_cart`, `price_changed`, `stock`, `other` |

No browser `purchase` / `order_placed` event for VoltGear analytics.

`page_type`: `home`, `catalog`, `product`, `cart`, `checkout`, `search`, `content`, `other`.

Cart lines gain optional `productId` / `variantId` so add/remove can send stable ids. Old saved carts without ids: store slug snapshot, leave `product_id` null. Do not guess.

### Dedup

Every genuine user action gets a new `event_id`. Only retries of that exact send reuse it. Do **not** use a semantic id such as `product_view:{id}` for the life of `sessionStorage`. Funnel uniqueness is `COUNT(DISTINCT session_id)`, not “one product_view per visitor forever.”

Duplicate `event_id`: insert ignored; original row is **not** updated.

### Session rules

Cookies: `vg_vid` (~1 year), `vg_sid` (rolling ~30 minutes). httpOnly, `SameSite=Lax`, Secure in production.

On ingest:

1. If rate-limited → drop, `{ ok: true }`, write nothing.
2. Resolve visitor (create `vg_vid` if missing).
3. If `vg_sid` missing, last activity > 30 minutes, or `session.is_demo` ≠ current `vg_demo` → new session; Set-Cookie new `vg_sid`.
4. Else refresh `last_activity_at` and cookie.
5. First-touch + `device_type` (`mobile` / `tablet` / `desktop` / `other`) + landing path only on **create**.

### Source precedence (deterministic)

Normalized `source` on the session:

1. Validated explicit UTM/source
2. Recognized click id (`ttclid` → tiktok, `fbclid` → meta, `gclid` → google)
3. Recognized search-engine referrer → `organic`
4. Other external referrer → `referral`
5. No external attribution → `direct`
6. Malformed/unknown explicit attribution → `other`

Never send unknown explicit values to `direct`.

Sanitize before store (and never log the raw values):

- `referrer`: hostname/origin, or origin + pathname; **strip query and fragment**. Reject or empty if unparseable.
- Explicit length caps on `utm_*`, click ids, referrer, `path`, `product_slug`, landing path, and other user-controlled strings (implementation constants; truncate or drop the field).

Allowed source labels in reports: `tiktok`, `meta`, `google`, `organic`, `direct`, `referral`, `other`, plus **Unattributed** on **order** source reports only.

### Product references

`product_id` / `variant_id` must match existing `products.id` / `product_variants.id` (UUID FKs, `ON DELETE SET NULL`). Invalid or unknown ids: store the event **without** the product relation (keep a short slug snapshot if present). Forged ids must not appear in product metrics. Variant must belong to that product when both are set; otherwise drop the variant relation.

### Ingest safety

- Body size cap; one event per request
- Lightweight bot UA drop
- Reject obviously **cross-origin** POSTs (`Origin` / `Host` mismatch after validation). Still `{ ok: true }`, write nothing
- Best-effort in-memory rate limit **60 events / minute / client IP** (TTL + size-bounded map). Safe on Vercel/serverless (no shared global memory). **If IP is missing, key by `vg_sid` only. Never use a global `"unknown"` bucket.** Exceeded → drop, `{ ok: true }`
- RLS enabled; no anon write policy
- HTTP 200 with body `{ ok: true }` only. Never totals, profit, credentials, or session internals
- Internal logs: reason code, event name, **normalized pathname** (no query string). Truncate those fields. Never log checkout values, emails, phones, UTMs, click ids, raw referrers, or secrets

### Checkout link

On successful order create only, copy from the resolved live-or-demo session:

- `analytics_session_id`, `analytics_visitor_id`
- snapshot: source, medium, campaign, campaign id, ttclid, fbclid, gclid

FKs: nullable, `ON DELETE SET NULL`. Snapshot columns stay when sessions are purged.

Analytics lookup/expiry/error → nulls; **order still created**.

## Data model

```text
analytics_visitors
- id
- first_seen_at
- last_seen_at

analytics_sessions
- id
- visitor_id
- started_at
- last_activity_at
- is_demo
- landing_path
- referrer
- source, medium, campaign, campaign_id, campaign_content, campaign_term
- ttclid, fbclid, gclid
- device_type

analytics_events
- id
- event_id UNIQUE
- session_id
- visitor_id
- is_demo
- name
- occurred_at
- path
- page_type
- product_id nullable  → products(id) ON DELETE SET NULL
- variant_id nullable  → product_variants(id) ON DELETE SET NULL
- product_slug nullable
- properties JSONB     -- strict per-event schema only
```

Orders (additive):

- `analytics_session_id` nullable FK `ON DELETE SET NULL`
- `analytics_visitor_id` nullable FK `ON DELETE SET NULL`
- compact attribution snapshot columns (not a live join)

**Deletion**

- `analytics_events.session_id` → `analytics_sessions(id)` **ON DELETE CASCADE**
- `orders.analytics_session_id` / `analytics_visitor_id` → **ON DELETE SET NULL**
- Lightweight cleanup (bounded deletes from ingest and/or admin analytics load; no extra cron product): delete sessions with `last_activity_at` < now − 90 days (events cascade). Delete visitors with zero remaining sessions and `last_seen_at` older than ~1 year. Order snapshots are never deleted by this job.

## Counting (Karachi)

**Session cohort** = `analytics_sessions.started_at` in range AND `is_demo = false`.

A session may complete after the range end; that is intended.

**Visitors** = distinct `visitor_id` on that cohort.

**Shop conversion (session cohort)**

**Reach counts** (may be non-nested; a session can add-to-cart without a PDP view):

1. Sessions — all cohort sessions  
2. Product view — had `product_view`  
3. Add to cart — had `add_to_cart`  
4. Checkout started — had `checkout_started`  
5. Converted session — linked to ≥1 successful website order  

**`% of previous` and Insights** use **ordered transitions** (`occurred_at` earlier, then later, same `session_id`). These rates cannot exceed 100%:

| Rate | Definition |
|---|---|
| Product view % | sessions with Product View / Sessions |
| Add to cart % | sessions with Product View **then later** Add to Cart / Product View sessions |
| Checkout started % | sessions with Add to Cart **then later** Checkout Started / Add-to-Cart sessions |
| Converted % | sessions with Checkout Started **then later** a successful linked order / Checkout Started sessions |

“Then later” compares event `occurred_at` (and order `created_at` for conversion). Insights absolute thresholds use these same transition rates, not independent reach ratios.

Do **not** show a conversion percentage between Converted sessions and Orders placed.

**COD / fulfillment (T-14 order cohort)** — orders **placed** in range (`createdAt`, live):

1. Orders placed  
2. Processing (first reached processing)  
3. Shipped  
4. Delivered  

Existing T-14 history rules. Click-through drilldown unchanged (order number, date, status, city, total — no email/phone).

**Delivered Orders by Source — delivered during selected period** uses T-14 delivered-in-range orders grouped by the **order snapshot**. Unattributed is its own row. This is not the delivery outcome of the Traffic session table.

**Query builder** unchanged.

## UI (`/admin/analytics`)

Same page, same range controls, same Overview money tiles. Delivered revenue stays the lead KPI.

Tabs: Overview · Products · Cities · Customers · **Traffic** · Funnel · **Insights** · Query

**Overview:** money/order tiles unchanged. Remove “Visitors and web funnel” from the Not available list. Keep Confirmed, Out for delivery, Returned, Marketing/ROAS, Contribution profit.

**Traffic tiles:** Unique visitors; Sessions; **Converted Sessions** with helper `Sessions linked to ≥1 successful order`.

**Traffic tables:** sessions by source; landing pages; **Delivered Orders by Source — delivered during selected period**.

**Funnel:** two labeled blocks (shop session cohort, then COD order cohort) as one journey visually, separate math.

**Insights:** read-only cards. Nothing writes to the shop.

**Retention notice** (once, top of Traffic / Funnel / Insights) when the range starts before the 90-day raw window:

> First-party traffic data is available for the last 90 days only. Order and delivered-revenue analytics remain available for this range.

Affected traffic/shop-funnel/shop-insight tiles then show **Not available**, not zero.

Missing data is **Not available**, never fabricated.

No visitor ids, emails, or phones on Traffic/Insights.

## Insights

Pure function of numbers already on the page. Max 8 cards. HIGH then larger gaps. T-15 emits **HIGH** and **MEDIUM** only; LOW exists on the type for later rules but is not produced.

Card: stable `id`, title, confidence, evidence, possible causes (hypotheses), recommended checks. No psychology claims. No auto storefront changes.

**Floors**

- Shop / source / landing / validation: cohort sessions ≥ 30. Skip entirely if traffic is outside retention (empty insights of that kind, not fake zeros).
- Fulfillment (rules 8–9): **mature** placed orders ≥ 10. Still allowed outside 90-day raw retention.
- HIGH: shop ≥ 100 sessions **or** fulfillment ≥ 30 mature orders, **and** a usable prior period of the same Karachi length. Shop prior must also sit inside retention.

**Relative change:** For shop conversion and processing (lower is worse):
`relative_drop = (prior_rate - current_rate) / prior_rate`, fire if `>= 0.25`.
For **cancel rate only** (higher is worse):
`relative_rise = (current_rate - prior_rate) / prior_rate`, fire if `>= 0.25`.
If `prior_rate = 0`, skip the relative comparison and rely on the absolute rule. Evidence still shows both rates and the percentage-point change.

**One card per rule id.** If several sources/landings/categories qualify, emit only the worst candidate. Do not suffix ids (`source_underperforms:tiktok` is forbidden in T-15).

**Fulfillment maturity:** rules 8 and 9 (and their prior-period comparison) include only orders with `createdAt` ≥ **24 hours** ago. The T-14 Funnel block itself is unchanged and still includes fresh orders.

**Closed rule list**

1. `shop_drop_product_view`  
2. `shop_drop_add_to_cart`  
3. `shop_drop_checkout`  
4. `shop_drop_convert`  
5. `source_underperforms` — ≥ 30 sessions for that source; converted-session rate ≤ half the site session conversion rate; worst gap wins  
6. `landing_low_pdp` — ≥ 30 sessions on that path; product-view reach < 20%; exclude `/checkout` (and confirmation, which is still `/checkout`) and already-excluded admin/gadget paths. Direct-to-checkout is not “PDP failure”  
7. `checkout_validation_hotspot` — ≥ 20 validation events; one category ≥ 40%; dominant category only  
8. `fulfillment_processing_gap` — mature placed → processing < 50% or relative drop ≥ 25%  
9. `fulfillment_cancel_rate` — mature placed currently cancelled ≥ 25%, or relative **rise** ≥ 25% `(current - prior) / prior`  

Absolute shop floors (also fire without a worsening trend) use **transition rates**, not independent reach ratios: product-view/sessions < 30%; Product View then later Add to Cart / Product View < 15%; Add to Cart then later Checkout / Add-to-Cart < 30%; Checkout then later linked order / Checkout started < 40%.

No ROAS, ad spend, contribution profit, gadget, demo, unit-mixing, or “Unattributed = Direct” insights.

## Impact analysis

| Surface | Today | After T-15 | Gap / follow-up |
|---|---|---|---|
| Live shop pages | Optional GA only | Anonymous first-party events; fail-open | None for buying |
| `/home2`, `/product2` | Preview | Not in live traffic | None |
| `/admin/*` | Staff | Still excluded | None |
| Demo (`vg_demo`, same DB) | Practice catalog/orders | Practice sessions/events stamped `is_demo` at write | Purge later may include analytics demo rows (spawn if needed at closeout) |
| Cart provider | Local storage | Optional `productId`/`variantId`; emit add/remove | Additive; old carts remain valid |
| Live PDP | GA view_item | + `product_view` with product id | Gadget PDP unchanged |
| `/checkout` | GA begin_checkout on Details→Confirm | `checkout_started` on enter; steps; validation categories | Abandoned-cart email unchanged |
| `POST /api/checkout` | Creates order | Best-effort session + snapshot; **must not fail the order** | None |
| `orders` | No attribution columns | Nullable FKs + snapshot | Old orders = Unattributed |
| T-14 Overview/Products/Cities/Customers/Query | Money + COD funnel | Unchanged math; Funnel tab gains shop block; Traffic + Insights tabs | Query stays money-only |
| Public product JSON | No `cost_price` | Still none | Regression test stays |
| Admin analytics APIs | Cookie required | Extra bundle fields; still 401 unsigned | Public ingest is **not** an admin API |
| `POST /api/analytics/event` | None | Public write; `{ ok: true }` only | Rate limit + whitelist |
| Clarity (T-05) | Blocked | Still not source of truth | T-05 unchanged |
| TikTok/Meta APIs | None | Still none | Later task |

**Visibility:** shoppers never see analytics totals. Public ingest exposes no privileged data. Drilldown still strips email/phone.

**T-14 tests that must stay green:** delivered vs cancelled money, demo skip, SQL rejection, city normalize, operational funnel, no PII in drilldown, `mapProduct` omits cost.

**Spawned follow-ups (not this task):** demo purge of analytics tables if admin “Remove demo data” should wipe them; ad spend/ROAS when a spend source exists; T-05 Clarity replay.

## Project structure (expected)

```
lib/db/analytics-ingest-rules.ts      whitelist, source precedence, session expiry, rate-limit helper (tested)
lib/db/analytics-traffic-rules.ts     session cohort, shop funnel, visitors, sources, retention (tested)
lib/db/analytics-insight-rules.ts     closed insight catalog (tested)
lib/db/analytics-rules.ts             T-14 — do not rewrite money math
lib/db/analytics.ts                   load Traffic/Funnel/Insights into existing bundle
lib/first-party-analytics.ts          shop client helper (fail-open); keep lib/analytics.ts for GA
app/api/analytics/event/route.ts      public ingest
app/api/checkout/route.ts             best-effort attribution attach
lib/db/store.ts                       createOrderRow additive columns
components/admin/analytics-console.tsx Traffic + Funnel blocks + Insights
app/layout.tsx                        mount tracker on live shop only
components/cart/cart-provider.tsx     successful add/remove emit; optional productId
components/product/product-view-tracker.tsx  product_view + product id
app/checkout/page.tsx                 checkout_started / steps / validation categories
supabase/migrations/YYYYMMDDHHMMSS_first_party_analytics.sql
```

## Phase breakdown

See implementation plan: `docs/plans/2026-08-28-t15-first-party-traffic-plan.md`.

1. Rules + failing tests (ingest, sanitize, session, ordered funnel, insights, client bootstrap queue).  
2. Migration (tables, CASCADE/SET NULL, RLS, order columns). Ask before push.  
3. `POST /api/analytics/event` + shop tracker queue (exclusions, fail-open, origin, rate limit, cleanup).  
4. Checkout best-effort snapshot; cart/PDP/checkout event hooks.  
5. Extend `/api/admin/analytics` bundle + console tabs.  
6. Verify: T-14 tests green; unsigned admin 401; public ingest `{ ok: true }` only; gadget/demo excluded; failed analytics does not block checkout.

## Tests (minimum)

Existing T-14 + `mapProduct` cost omission.

New:

- 30-minute expiry; replayed `vg_sid` starts a new session  
- Demo/live mismatch starts a new session; live reports ignore `is_demo = true`  
- First-touch not overwritten; landing `attribution` only on new session  
- Source precedence; malformed ≠ Direct; missing order snapshot = Unattributed  
- Session cohort by `started_at`; shop funnel distinct-session **reach**; `% of previous` is ordered transitions and never > 100% even when ATC-without-PDP exists  
- Visitors from live cohort, not the visitors table  
- Range outside 90 days → traffic Not available; T-14 money still computed  
- Cleanup deletes sessions older than 90 days; events cascade; order FKs null; snapshot remains  
- Insights: one card per id; relative-drop formula + `prior_rate = 0` guard; 24h maturity; no LOW; landing skips checkout; shop thresholds use transition rates  
- Unknown event dropped; body `is_demo` ignored; extra property keys dropped  
- Invalid/forged product or variant cannot contaminate product metrics  
- Duplicate `event_id` does not overwrite the original  
- Rate-limited ingest returns `{ ok: true }` and writes no event; no global `"unknown"` bucket  
- Cross-origin ingest returns `{ ok: true }` and writes no event  
- Referrer stored without query/fragment; user-controlled strings length-capped  
- Two events fired immediately with no cookies share one visitor/session and keep landing attribution  
- Analytics session lookup failure does **not** fail successful checkout  
- Missing/expired `vg_sid` → order with null attribution → Unattributed  
- Logs never contain query strings or submitted checkout values  
- Unsigned `/api/admin/analytics` → 401  

## Out of scope

TikTok Pixel / Ads API, Meta CAPI / Ads API, GA/Clarity as admin source, session replay (T-05), Query-builder traffic metrics, materialized rollups, second Analytics nav/page, Confirmed / out-for-delivery / returned statuses, fingerprinting, storing PII in events, auto-changing the storefront.

## Approval

Sections 1–6 locked (2026-08-27) plus owner spec corrections (2026-08-28): first-visit send queue, ordered funnel transitions, sanitized referrer/length caps, implemented 90-day cleanup with CASCADE, best-effort serverless rate limit, cross-origin reject still `{ ok: true }`. Approved for implementation planning.
