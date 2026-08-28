# T-15 First-party traffic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add first-party session/event collection and Traffic / shop-funnel / Insights to existing `/admin/analytics` without rebuilding T-14 money reports.

**Architecture:** Shop JS posts whitelisted events to `POST /api/analytics/event` (service-role write). A per-tab bootstrap queue captures landing UTM/referrer and waits for the first response to set `vg_vid`/`vg_sid` before later events. Successful checkout attaches a compact attribution snapshot best-effort; order create never depends on analytics. Admin loaders join the session cohort to T-14 order records.

**Tech Stack:** Next.js 14 App Router, Supabase service role, existing admin cookie, `tsx --test` (same as T-14), Karachi timezone helpers in `lib/db/analytics-rules.ts`.

**Spec:** `docs/superpowers/specs/2026-08-27-t15-first-party-traffic-design.md`

## Global Constraints

- Do not rewrite T-14 money/lifecycle math in `lib/db/analytics-rules.ts`.
- Checkout never depends on analytics succeeding.
- Public ingest always HTTP 200 `{ ok: true }` — no totals, profit, credentials, or session internals.
- Live shop only: exclude `/admin`, `/home2`, `/product2`.
- `is_demo` from httpOnly `vg_demo` only; never from JSON.
- Shop `% of previous` and Insights use ordered transition rates (never > 100%).
- Unattributed ≠ Direct.
- Optional GA/Clarity stay; admin analytics must not read them.
- No TikTok/Meta APIs, session recording, Query traffic metrics, or second Analytics page.
- Ask before `supabase db push`. Do not deploy unless asked.
- Do not git commit unless the user explicitly asked.
- `npm test` and `npx tsc --noEmit` after each task. Add new test files to the `test` script in `package.json`.

## File map

| Path | Responsibility |
|---|---|
| `lib/db/analytics-ingest-rules.ts` | Whitelist, sanitize, source precedence, origin, rate-limit helper, log path |
| `lib/db/analytics-ingest-rules.test.ts` | Tests for ingest rules |
| `lib/db/analytics-session-rules.ts` | Visitor/session expiry, demo split, first-touch apply-once |
| `lib/db/analytics-session-rules.test.ts` | Session tests |
| `lib/db/analytics-traffic-rules.ts` | Cohort, visitors, shop funnel reach + transitions, retention window, delivered-by-source |
| `lib/db/analytics-traffic-rules.test.ts` | Funnel math tests |
| `lib/db/analytics-insight-rules.ts` | Closed insight catalog |
| `lib/db/analytics-insight-rules.test.ts` | Insight tests |
| `lib/db/analytics-cleanup-rules.ts` | What to delete after 90 days / 1 year |
| `lib/first-party-analytics.ts` | Client queue, landing snapshot, fail-open emit |
| `lib/first-party-analytics.test.ts` | Bootstrap race test |
| `lib/db/analytics.ts` | Load traffic/insights into existing bundle |
| `lib/db/store.ts` / `lib/order-store.ts` | Additive order attribution columns |
| `app/api/analytics/event/route.ts` | Public ingest |
| `app/api/checkout/route.ts` | Best-effort snapshot after successful create |
| `components/admin/analytics-console.tsx` | Traffic, Funnel blocks, Insights |
| `app/layout.tsx` | Mount tracker on live shop only |
| `supabase/migrations/20260828010000_first_party_analytics.sql` | Schema |

Do not split `analytics-console.tsx` unless it becomes unreadable; follow the existing large-file pattern.

---

### Task 1: Ingest parse, sanitize, source, origin, rate limit

**Files:**
- Create: `lib/db/analytics-ingest-rules.ts`
- Test: `lib/db/analytics-ingest-rules.test.ts`
- Modify: `package.json` (`test` script — append the new test file)

**Interfaces:**
- Consumes: nothing
- Produces: `parseIngestBody`, `sanitizeReferrer`, `normalizePathname`, `normalizeSource`, `isAllowedAnalyticsOrigin`, `createMemoryRateLimiter`, `ANALYTICS_EVENT_NAMES`, string length caps

- [ ] **Step 1: Write the failing test**

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createMemoryRateLimiter,
  isAllowedAnalyticsOrigin,
  normalizePathname,
  normalizeSource,
  parseIngestBody,
  sanitizeReferrer,
} from "./analytics-ingest-rules";

describe("parseIngestBody", () => {
  it("accepts a whitelisted page_view and drops extra properties", () => {
    const parsed = parseIngestBody({
      event_id: "11111111-1111-4111-8111-111111111111",
      name: "page_view",
      path: "/products?x=1",
      page_type: "catalog",
      properties: { page_type: "nope", extra: true },
      is_demo: true,
    });
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.event.name, "page_view");
    assert.equal(parsed.event.path, "/products");
    assert.deepEqual(parsed.event.properties, {});
    assert.equal("is_demo" in parsed.event, false);
  });

  it("rejects unknown event names", () => {
    const parsed = parseIngestBody({
      event_id: "11111111-1111-4111-8111-111111111111",
      name: "purchase",
      path: "/",
      page_type: "home",
      properties: {},
    });
    assert.equal(parsed.ok, false);
  });
});

describe("sanitizeReferrer", () => {
  it("strips query and fragment", () => {
    assert.equal(
      sanitizeReferrer("https://tiktok.com/v/1?click=abc#x"),
      "https://tiktok.com/v/1"
    );
  });
});

describe("normalizeSource", () => {
  it("follows UTM then click id then organic then referral then direct", () => {
    assert.equal(normalizeSource({ utm_source: "tiktok" }).source, "tiktok");
    assert.equal(normalizeSource({ ttclid: "tt" }).source, "tiktok");
    assert.equal(normalizeSource({ gclid: "g" }).source, "google");
    assert.equal(normalizeSource({ referrer: "https://www.google.com/search" }).source, "organic");
    assert.equal(normalizeSource({ referrer: "https://news.example/a" }).source, "referral");
    assert.equal(normalizeSource({}).source, "direct");
    assert.equal(normalizeSource({ utm_source: "???" }).source, "other");
  });
});

describe("isAllowedAnalyticsOrigin", () => {
  it("rejects a different origin host", () => {
    assert.equal(isAllowedAnalyticsOrigin("https://evil.example", "voltgear-coral.vercel.app"), false);
    assert.equal(isAllowedAnalyticsOrigin("https://voltgear-coral.vercel.app", "voltgear-coral.vercel.app"), true);
  });
});

describe("createMemoryRateLimiter", () => {
  it("limits per ip and does not use a global unknown bucket", () => {
    const lim = createMemoryRateLimiter({ limit: 2, windowMs: 60_000, maxKeys: 10 });
    assert.equal(lim.take({ ip: "1.1.1.1" }), true);
    assert.equal(lim.take({ ip: "1.1.1.1" }), true);
    assert.equal(lim.take({ ip: "1.1.1.1" }), false);
    assert.equal(lim.take({ ip: "2.2.2.2" }), true);
    assert.equal(lim.take({}), true);
    assert.equal(lim.take({}), true);
  });
});

describe("normalizePathname", () => {
  it("never keeps a query string", () => {
    assert.equal(normalizePathname("/product/a?utm_source=x"), "/product/a");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test lib/db/analytics-ingest-rules.test.ts`

Expected: FAIL (module not found)

- [ ] **Step 3: Write minimal implementation**

Implement in `lib/db/analytics-ingest-rules.ts`:

- Caps: path 200, slug 180, utm/campaign 80, click id 128, referrer 200.
- `normalizePathname`: URL-parse against `https://local.invalid` + pathname only, default `/`.
- `sanitizeReferrer`: parse URL; return `origin + pathname` (no search/hash); empty string if invalid.
- `parseIngestBody`: require UUID `event_id`; whitelist names; whitelist `page_type`; per-event properties (`quantity` integer for cart; `step` details|confirm; `category` validation list); strip unknown keys; copy product ids only if they look like UUIDs (existence check is the API task).
- `normalizeSource`: spec precedence; known utm_source values map case-insensitively onto `tiktok|meta|facebook→meta|google|instagram→meta`; unknown explicit utm_source → `other`; search hosts `google.`, `bing.`, `yahoo.`, `duckduckgo.` → organic.
- `isAllowedAnalyticsOrigin`: if `origin` missing, return true; else compare hostname (strip port) to `host`.
- `createMemoryRateLimiter`: Map of key → timestamps; key = `ip:`+ip or `sid:`+sid; if neither, **always allow** (no `"unknown"` key). Evict oldest when `maxKeys` exceeded. Production uses limit 60 / 60s / maxKeys 5000.

- [ ] **Step 4: Run the tests and make sure they pass**

Run: `npx tsx --test lib/db/analytics-ingest-rules.test.ts`

Expected: PASS

- [ ] **Step 5: Add file to `package.json` `test` script; run `npm test`**

Expected: existing T-14 tests still PASS.

---

### Task 2: Session resolve rules

**Files:**
- Create: `lib/db/analytics-session-rules.ts`
- Test: `lib/db/analytics-session-rules.test.ts`

**Interfaces:**
- Consumes: `normalizeSource` from Task 1
- Produces: `SESSION_IDLE_MS = 30 * 60 * 1000`, `resolveAnalyticsSession`, `shouldApplyFirstTouch`

```ts
export type SessionState = {
  id: string;
  visitorId: string;
  lastActivityAt: string;
  isDemo: boolean;
  source?: string;
};

export function resolveAnalyticsSession(input: {
  now: Date;
  cookieVisitorId: string | null;
  cookieSessionId: string | null;
  demoCookie: boolean;
  existingSession: SessionState | null;
  existingVisitorId: string | null;
}): {
  visitorId: string;
  sessionId: string;
  isNewSession: boolean;
  isNewVisitor: boolean;
  isDemo: boolean;
};
```

New visitor id / session id: `crypto.randomUUID()` (injectable in tests).

- [ ] **Step 1: Write the failing test**

Cases:

- No cookies → new visitor + new session, `isNewSession` true.
- Session last activity 29 minutes ago → reuse.
- Session last activity 31 minutes ago → new session, **same** visitor.
- Replayed cookie for a session whose `lastActivityAt` is 31 minutes ago → new session (do not resurrect).
- `existingSession.isDemo === false` and `demoCookie === true` → new session, same visitor.
- `shouldApplyFirstTouch(isNewSession)` true only when new.

- [ ] **Step 2: Run test — expect FAIL**

- [ ] **Step 3: Implement `resolveAnalyticsSession`**

Do not overwrite source here; caller applies first-touch only if `isNewSession`.

- [ ] **Step 4: Tests PASS; `npm test` still green**

---

### Task 3: Traffic cohort, ordered funnel, retention, Unattributed

**Files:**
- Create: `lib/db/analytics-traffic-rules.ts`
- Test: `lib/db/analytics-traffic-rules.test.ts`

**Interfaces:**
- Consumes: `YmdRange`, `karachiYmd`, `addDaysYmd`, `isoInRange`, `buildOrderFunnel` from `analytics-rules.ts` (do not copy T-14 order math)
- Produces: `RAW_RETENTION_DAYS = 90`, `trafficRangeAvailable`, `buildShopFunnel`, `countCohortVisitors`, `buildSessionsBySource`, `buildDeliveredBySource`

Types:

```ts
export type TrafficEvent = {
  sessionId: string;
  name: string;
  occurredAt: string;
};

export type TrafficSession = {
  id: string;
  visitorId: string;
  startedAt: string;
  isDemo: boolean;
  source: string | null;
  landingPath: string | null;
};

export type AttributedOrder = {
  orderId: string;
  createdAt: string;
  sessionId: string | null;
  source: string | null; // snapshot; null/empty → Unattributed
  isDemo?: boolean;
};
```

`buildShopFunnel(sessions, events, orders, range)`:

- Cohort = live sessions with `startedAt` in range.
- **Reach counts:** distinct session ids with each event name; converted reach = distinct cohort sessions whose id is on a non-demo order.
- **conversionFromPrevious:**
  - Product view: `|PV| / |Sessions|`
  - Add to cart: `|sessions with PV then later ATC| / |PV|`
  - Checkout: `|sessions with ATC then later checkout_started| / |ATC reach|`
  - Converted: `|sessions with checkout_started then later order.createdAt| / |checkout_started reach|`
- First shop row `conversionFromPrevious` is `1` (same as T-14 funnel first step) or `null` — use `null` and do not render `%` on Sessions. T-14 uses `1` for Placed; shop Sessions should **not** show “100% of previous”. Spec: `% of previous` only between transition rows. Implement: Sessions has `conversionFromPrevious: null`.
- Assert every non-null rate is `<= 1`.

`trafficRangeAvailable(range, now)`: `range.start >= karachiYmd(now - 90 days)` (inclusive start of window).

`buildDeliveredBySource(deliveredOrders)`: group by snapshot source; missing → key `unattributed`, label **Unattributed**. Never map missing to `direct`.

- [ ] **Step 1: Failing tests**

Must include:

- ATC without PDP: reach(add_to_cart) can exceed reach(product_view); **add-to-cart % of previous** still `<= 1` (intersection over PV).
- Checkout from previous-session cart: ATC then later checkout counts; reverse timestamps do not.
- Unique visitors from cohort sessions, not a visitors table length.
- Demo sessions excluded.
- Range starting day 91 → `trafficRangeAvailable` false.
- Order with null snapshot → Unattributed, not Direct.
- Direct session source stays `direct`.

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement**

- [ ] **Step 4: PASS + `npm test`**

---

### Task 4: Insights catalog

**Files:**
- Create: `lib/db/analytics-insight-rules.ts`
- Test: `lib/db/analytics-insight-rules.test.ts`

**Interfaces:**
- Consumes: Task 3 funnel transition rates + T-14 order lists
- Produces: `buildInsights`, `relativeDrop`, `FULFILLMENT_MATURITY_HOURS = 24`

```ts
export type InsightCard = {
  id: string;
  title: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  evidence: string[];
  possibleCauses: string[];
  recommendedChecks: string[];
};
```

`relativeDrop(prior, current)`: if `prior === 0` return `null`; else `(prior - current) / prior` (lower-is-worse metrics).

`relativeRise(prior, current)`: if `prior === 0` return `null`; else `(current - prior) / prior` (**cancel rate only**).

Rules 1–9 exactly as spec. One card per id (worst candidate). No LOW cards. Max 8. Shop floors on **transition** rates. `landing_low_pdp` skip paths that are `/checkout` or start with `/checkout/`. Fulfillment rules filter `createdAt <= now - 24h` for current and prior.

- [ ] **Step 1: Failing tests** for: prior_rate 0 does not fire relative; two sources only emit one `source_underperforms`; fresh orders do not trigger processing-gap; checkout landing does not trigger `landing_low_pdp`; below 30 sessions emits no shop cards; T-15 does not emit `confidence: "LOW"`.

- [ ] **Step 2–4:** RED → implement → PASS + `npm test`

---

### Task 5: Client bootstrap queue

**Files:**
- Create: `lib/first-party-analytics.ts`
- Test: `lib/first-party-analytics.test.ts`

**Interfaces:**
- Consumes: Task 1 sanitizers (or duplicate pathname-only helper to keep this module browser-safe without pulling server secrets — **import only pure functions** from ingest-rules)
- Produces: `createFirstPartyClient`, `shouldCollectPath`, `captureLandingAttribution`

`shouldCollectPath(pathname)`: false for `/admin`, `/home2`, `/product2` (use `isGadgetPreviewPath`).

`createFirstPartyClient({ fetch, getHref, getReferrer })`:

- On construct, `captureLandingAttribution()` from href search + sanitized referrer **synchronously**.
- `track(event)` returns immediately (fail-open). Pushes onto a queue.
- A single worker: first request sends with `attribution`. Later requests wait until the first `fetch` promise settles, then send **without** requiring attribution (server ignores after first-touch).
- Each `track` gets a new `event_id` (`crypto.randomUUID`). Retry of the same queue item reuses that id.
- `fetch` errors swallowed.

- [ ] **Step 1: Failing test — cookie-less double fire**

Fake `fetch` that resolves only after both `track` calls were invoked:

```ts
it("sends the first event before the second on a cookie-less PDP", async () => {
  const calls: string[] = [];
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  const client = createFirstPartyClient({
    fetch: async (_url, init) => {
      const body = JSON.parse(String(init?.body));
      calls.push(body.name);
      if (calls.length === 1) await gate;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    },
    getHref: () => "https://shop.test/product/pad?utm_source=tiktok&ttclid=abc",
    getReferrer: () => "https://www.tiktok.com/t/x?foo=1",
  });
  const p1 = client.track({ name: "page_view", path: "/product/pad", page_type: "product" });
  const p2 = client.track({
    name: "product_view",
    path: "/product/pad",
    page_type: "product",
    product_id: "11111111-1111-4111-8111-111111111111",
  });
  await Promise.resolve();
  assert.deepEqual(calls, ["page_view"]);
  release();
  await Promise.all([p1, p2]);
  assert.deepEqual(calls, ["page_view", "product_view"]);
  // first body has attribution.utm_source tiktok and sanitized referrer without query
});
```

Also: `shouldCollectPath("/home2") === false`, `/admin/analytics` false, `/product/pad` true.

- [ ] **Step 2–4:** RED → implement sequential queue → PASS

---

### Task 6: Migration

**Files:**
- Create: `supabase/migrations/20260828010000_first_party_analytics.sql`

**Interfaces:** none (SQL)

- [ ] **Step 1: Write migration** (no unit test file)

Requirements:

- Tables as spec; RLS enabled; **no** anon insert/select policies.
- `analytics_events.event_id` unique.
- `analytics_events.session_id` references `analytics_sessions(id) ON DELETE CASCADE`.
- `analytics_events.visitor_id` references `analytics_visitors(id)` (restrict or cascade visitors only after sessions gone).
- `analytics_events.product_id` → `products(id) ON DELETE SET NULL`
- `analytics_events.variant_id` → `product_variants(id) ON DELETE SET NULL`
- `orders.analytics_session_id` → `analytics_sessions(id) ON DELETE SET NULL`
- `orders.analytics_visitor_id` → `analytics_visitors(id) ON DELETE SET NULL`
- Snapshot columns on orders: `attrib_source`, `attrib_medium`, `attrib_campaign`, `attrib_campaign_id`, `attrib_ttclid`, `attrib_fbclid`, `attrib_gclid` (text, nullable)
- Indexes: `analytics_sessions(started_at)`, `analytics_sessions(is_demo)`, `analytics_events(session_id, name, occurred_at)`, `analytics_events(event_id)`

- [ ] **Step 2: Stop and ask the user before `supabase db push`**

Do not push in this task unless they already said to push.

---

### Task 7: Ingest route, cleanup, checkout attach

**Files:**
- Create: `app/api/analytics/event/route.ts`
- Create: `lib/db/analytics-cleanup-rules.ts` + `.test.ts` (cutoff timestamps)
- Modify: `app/api/checkout/route.ts`
- Modify: `lib/db/store.ts` `createOrderRow`
- Modify: `lib/order-store.ts` `NewOrderInput`

**Interfaces:**
- Consumes: Tasks 1–2, 6
- Produces: ingest handler; `attachOrderAttribution` best-effort; `planAnalyticsCleanup(now)`

`planAnalyticsCleanup(now)` returns `{ sessionLastActivityBefore: Date; visitorLastSeenBefore: Date }` (90 days / 365 days). Test those cutoffs.

Ingest route:

1. Parse JSON; on throw still `{ ok: true }`.
2. Origin check → drop + log reason `origin`.
3. Path excluded (`/admin`, gadget) → drop.
4. Rate limit 60/min/IP (`x-forwarded-for` first hop) else `vg_sid`; no unknown bucket.
5. `parseIngestBody`; fail → drop + log.
6. Resolve session (cookies `vg_vid`, `vg_sid`, `vg_demo`).
7. If new session, apply sanitized attribution first-touch.
8. If product_id set, `select id from products where id =` ; if missing, null the relation (same for variant, and variant.product_id must match).
9. Insert event; unique violation on `event_id` → ignore (do not update).
10. Set-Cookie vid/sid; `{ ok: true }`.
11. Occasionally (e.g. 1/50 requests) delete expired sessions then orphan visitors — **bounded** (e.g. `.limit(100)`).

Logs: `console.info("[analytics-ingest]", { reason, name, path })` where path is `normalizePathname` only. Test a helper `ingestLogFields` never includes `?`.

Checkout:

```ts
let persisted = await createOrder({ ...baseOrder, orderId });
// retries as today
if (persisted) {
  try {
    await attachOrderAttribution(orderId, request);
  } catch (err) {
    console.error("[analytics-checkout]", "attach failed");
  }
}
```

`attachOrderAttribution`: read `vg_sid`; if missing/expired/error, return. Else update order snapshot columns. **Must not throw into checkout catch** (inner try).

Unit-test `orderAttributionFromSession(session | null)` → all-null vs copied fields. Missing session → Unattributed mapping in traffic rules already tested.

- [ ] **Step 1:** Tests for cleanup cutoffs, log fields, `orderAttributionFromSession(null)` all null, duplicate event_id “keep original” as a pure merge function if extractable.

- [ ] **Step 2–4:** Implement route + attach; `npm test`; `npx tsc --noEmit`

Manual check later: failed attach still returns order JSON.

---

### Task 8: Shop wiring (fail-open)

**Files:**
- Modify: `app/layout.tsx` — mount tracker **only** when `!isAdmin && !isGadget`
- Create: `components/analytics/first-party-tracker.tsx` (client) — path change → `page_view`; skip collect paths
- Modify: `components/product/product-view-tracker.tsx` — pass `productId={product._id}`; call first-party `product_view` in the same effect as GA (GA stays)
- Modify: `app/product/[slug]/page.tsx` — pass `_id`
- Modify: `components/cart/cart-provider.tsx` — optional `productId`/`variantId`; after successful add/remove, `track` add/remove (not on gadget path)
- Modify: add-to-cart / purchase-section / buy-now / sticky / quick-view / product-card / FBT / cart-upsell to pass `productId: product._id` where the Product is in scope. Gadget buy-box: do **not** pass into first-party if path is gadget; provider already skips via `shouldCollectPath`
- Modify: `app/checkout/page.tsx` — on mount `checkout_started`; on enter step 1/2 `checkout_step`; details `onInvalid` / `reportValidity` → `checkout_validation_error` with category from `event.target.name`; 409 → `price_changed`; 400 stock/empty → matching category. Do **not** emit on fetch network failure. Keep GA `trackBeginCheckout` as-is (optional).

Do not emit first-party from `gadget-buy-box` even if cart-provider is shared: `shouldCollectPath(window.location.pathname)` inside provider.

- [ ] **Step 1:** Extend `lib/first-party-analytics.test.ts` for `pageTypeFromPath("/checkout") === "checkout"`, `"/products" → catalog`, `"/" → home`.

- [ ] **Step 2–4:** Implement wiring; `npx tsc --noEmit`

---

### Task 9: Admin bundle + UI

**Files:**
- Modify: `lib/db/analytics.ts` `loadAnalyticsBundle`
- Modify: `components/admin/analytics-console.tsx`
- Modify: `app/api/admin/analytics/route.ts` only if types need no change (same GET)

Replace `webFunnel: "Not available"` with structured payload:

```ts
traffic: {
  available: boolean;
  visitors: number | null;
  sessions: number | null;
  convertedSessions: number | null;
  bySource: { source: string; sessions: number }[] | null;
  landingPages: { path: string; sessions: number }[] | null;
  deliveredBySource: { source: string; orders: number; deliveredRevenue: number }[];
};
shopFunnel: ShopFunnelStep[] | null;
insights: InsightCard[];
retentionNotice: boolean;
```

When `!trafficRangeAvailable`, set shop/session fields null/`available: false`, still fill `deliveredBySource` from T-14 delivered orders. `insights`: fulfillment-only when traffic NA; else full catalog.

UI:

- Tabs: Overview, Products, Cities, Customers, Traffic, Funnel, Insights, Query
- Overview: remove “Visitors and web funnel” from the NA list
- Retention banner copy **exactly** from spec when `retentionNotice`
- Traffic tiles + helper on Converted Sessions
- Delivered table title: **Delivered Orders by Source — delivered during selected period**
- Funnel: two headings **Shop conversion — session cohort** and **COD / fulfillment — order cohort**; `% of previous` only when `conversionFromPrevious != null` and not across the unit gap
- Insights cards

- [ ] **Step 1:** Unit-test bundle assembly helper `assembleAnalyticsBundle(...)` if extracted; otherwise test traffic+insights composition in traffic/insight tests (already done) and implement UI.

- [ ] **Step 2–4:** Implement; `npx tsc --noEmit`; `npm test`

---

### Task 10: Verification

- [ ] **Step 1:** `npm test` — all T-14 + T-15 files green
- [ ] **Step 2:** `npx tsc --noEmit` — clean
- [ ] **Step 3:** Manual / curl when server running:
  - Unsigned `GET /api/admin/analytics` → 401
  - `POST /api/analytics/event` with `{ name: "purchase" }` → `{ ok: true }`
  - Cross-origin Origin header → `{ ok: true }`
  - After `db push`: live PDP `/product/...` then `/admin/analytics` Traffic (demo cookie off)
  - Place order with analytics thrown/mocked → order still created
  - `/home2` does not increment live sessions
- [ ] **Step 4:** Do not claim done until Task 6 was pushed **or** the user deferred push. Shop events need the migration.

---

## Self-review vs spec

| Spec requirement | Task |
|---|---|
| Bootstrap queue / first-visit race | 5 |
| Ordered funnel transitions ≤ 100% | 3, 4 |
| Sanitized referrer + length caps | 1 |
| 90-day cleanup + CASCADE / SET NULL | 6, 7 |
| Serverless rate limit, no unknown bucket | 1, 7 |
| Cross-origin still `{ ok: true }` | 1, 7 |
| Checkout never depends on analytics | 7 |
| Unattributed vs Direct | 3 |
| Insights closed catalog | 4 |
| T-14 untouched money math | 3, 9 |
| Gadget/admin/demo | 5, 8 |
| No TikTok/Meta/replay/Query traffic | out of scope |

No TBD. Types in later tasks match Task 1–4 names.
