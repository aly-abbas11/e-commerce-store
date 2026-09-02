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
  source: string | null; // snapshot; null/empty â†’ Unattributed
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
- First shop row `conversionFromPrevious` is `1` (same as T-14 funnel first step) or `null` â€” use `null` and do not render `%` on Sessions. T-14 uses `1` for Placed; shop Sessions should **not** show â€œ100% of previousâ€. Spec: `% of previous` only between transition rows. Implement: Sessions has `conversionFromPrevious: null`.
- Assert every non-null rate is `<= 1`.

`trafficRangeAvailable(range, now)`: `range.start >= karachiYmd(now - 90 days)` (inclusive start of window).

`buildDeliveredBySource(deliveredOrders)`: group by snapshot source; missing â†’ key `unattributed`, label **Unattributed**. Never map missing to `direct`.

- [ ] **Step 1: Failing tests**

Must include:

- ATC without PDP: reach(add_to_cart) can exceed reach(product_view); **add-to-cart % of previous** still `<= 1` (intersection over PV).
- Checkout from previous-session cart: ATC then later checkout counts; reverse timestamps do not.
- Unique visitors from cohort sessions, not a visitors table length.
- Demo sessions excluded.
- Range starting day 91 â†’ `trafficRangeAvailable` false.
- Order with null snapshot â†’ Unattributed, not Direct.
- Direct session source stays `direct`.

- [ ] **Step 2: Run â€” expect FAIL**

- [ ] **Step 3: Implement**

- [ ] **Step 4: PASS + `npm test`**

