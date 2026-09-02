### Task 1: Ingest parse, sanitize, source, origin, rate limit

**Files:**
- Create: `lib/db/analytics-ingest-rules.ts`
- Test: `lib/db/analytics-ingest-rules.test.ts`
- Modify: `package.json` (`test` script â€” append the new test file)

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
- `normalizeSource`: spec precedence; known utm_source values map case-insensitively onto `tiktok|meta|facebookâ†’meta|google|instagramâ†’meta`; unknown explicit utm_source â†’ `other`; search hosts `google.`, `bing.`, `yahoo.`, `duckduckgo.` â†’ organic.
- `isAllowedAnalyticsOrigin`: if `origin` missing, return true; else compare hostname (strip port) to `host`.
- `createMemoryRateLimiter`: Map of key â†’ timestamps; key = `ip:`+ip or `sid:`+sid; if neither, **always allow** (no `"unknown"` key). Evict oldest when `maxKeys` exceeded. Production uses limit 60 / 60s / maxKeys 5000.

- [ ] **Step 4: Run the tests and make sure they pass**

Run: `npx tsx --test lib/db/analytics-ingest-rules.test.ts`

Expected: PASS

- [ ] **Step 5: Add file to `package.json` `test` script; run `npm test`**

Expected: existing T-14 tests still PASS.

