# Task 1 Report: Ingest parse, sanitize, source, origin, rate limit

## What was implemented

Created `lib/db/analytics-ingest-rules.ts` with pure functions for T-15 first-party analytics ingest:

- **`ANALYTICS_EVENT_NAMES`** — whitelist of seven event names (no purchase/order_placed).
- **Length caps** — exported constants: path 200, slug 180, utm/campaign 80, click id 128, referrer 200.
- **`normalizePathname`** — parses path via `https://local.invalid` base URL; returns pathname only (no query); defaults to `/`; truncates to cap.
- **`sanitizeReferrer`** — returns `origin + pathname` (no search/hash); empty string if unparseable; truncates to cap.
- **`parseIngestBody`** — validates UUID `event_id`, whitelisted event name and `page_type`, per-event properties (cart quantity integer, checkout step details|confirm, validation category list), strips unknown property keys, ignores `is_demo`, copies `product_id` only when UUID-shaped, optional `slug` with cap.
- **`normalizeSource`** — precedence: explicit UTM (known map case-insensitive; unknown → `other`) → click ids (ttclid/fbclid/gclid) → search referrer (google/bing/yahoo/duckduckgo) → other external referrer → direct.
- **`isAllowedAnalyticsOrigin`** — missing origin allowed; otherwise hostname (port stripped) must match host.
- **`createMemoryRateLimiter`** — sliding window per `ip:` or `sid:` key; always allows when neither present (no global unknown bucket); evicts oldest key when `maxKeys` exceeded.

## What was tested and results

| Suite | Tests | Result |
|-------|-------|--------|
| `parseIngestBody` | 2 | PASS |
| `sanitizeReferrer` | 1 | PASS |
| `normalizeSource` | 1 | PASS |
| `isAllowedAnalyticsOrigin` | 1 | PASS |
| `createMemoryRateLimiter` | 1 | PASS |
| `normalizePathname` | 1 | PASS |
| Full `npm test` (T-14 + new) | 98 | PASS |

## TDD Evidence

### RED

```text
$ npx tsx --test lib/db/analytics-ingest-rules.test.ts

Error: Cannot find module './analytics-ingest-rules'
Require stack:
- C:\Users\pc\Downloads\e commerce store\lib\db\analytics-ingest-rules.test.ts
  code: 'MODULE_NOT_FOUND'

✖ lib\db\analytics-ingest-rules.test.ts
ℹ tests 1
ℹ pass 0
ℹ fail 1
```

### GREEN (focused)

```text
$ npx tsx --test lib/db/analytics-ingest-rules.test.ts

▶ parseIngestBody … ✔ (2 tests)
▶ sanitizeReferrer … ✔ (1 test)
▶ normalizeSource … ✔ (1 test)
▶ isAllowedAnalyticsOrigin … ✔ (1 test)
▶ createMemoryRateLimiter … ✔ (1 test)
▶ normalizePathname … ✔ (1 test)
ℹ tests 7
ℹ pass 7
ℹ fail 0
```

### GREEN (full suite)

```text
$ npm test

ℹ tests 98
ℹ pass 98
ℹ fail 0
```

## Files changed

| File | Action |
|------|--------|
| `lib/db/analytics-ingest-rules.test.ts` | Created (tests from brief) |
| `lib/db/analytics-ingest-rules.ts` | Created (implementation) |
| `package.json` | Appended test file to `test` script |

## Self-review

- Followed TDD: test file first, confirmed RED, then minimal implementation.
- Brief and spec excerpt aligned; no conflicts.
- Did not touch `analytics-rules.ts`, API routes, cookies, checkout, or migrations.
- Exports match brief interfaces; caps and whitelist behavior match spec excerpt.
- Rate limiter correctly allows unkeyed requests without a shared bucket (verified by test).
- `is_demo` stripped from parsed event (verified by test).

## Concerns

- **Coverage gaps**: Brief-provided tests do not exercise invalid UUID `event_id`, invalid `page_type`, cart/checkout property validation failures, `fbclid` → meta, missing-origin allow, or rate-limiter eviction at `maxKeys`. Implementation follows spec but those paths are untested.
- **Cart events without `quantity`**: `add_to_cart` / `remove_from_cart` accept empty `{}` properties when quantity is omitted; spec implies `{ quantity }` but brief tests do not lock required quantity.
- **Production defaults** (60/min, maxKeys 5000) are documented in brief but not exported as constants; callers will set them in the API task.

## Fix pass

Addressed DONE_WITH_CONCERNS items: required cart `quantity`, spec `product_slug` field, and missing spec/brief test coverage.

### Changes

- `add_to_cart` / `remove_from_cart`: reject when `quantity` is missing or not an integer (no longer accept `{}`).
- `parseIngestBody`: read `product_slug` from payload; store on event as `product_slug` (cap 180); invalid/non-string omitted.
- Added 8 tests: invalid `event_id`, missing cart quantity, non-integer quantity, `product_slug` + `is_demo`, invalid `checkout_step`, `phone` category accepted, unknown category rejected, `fbclid` → meta, missing origin allowed.

### RED (focused, before implementation)

```text
$ npx tsx --test lib/db/analytics-ingest-rules.test.ts

✖ rejects add_to_cart when quantity is missing (true !== false)
✖ copies product_slug and ignores is_demo (undefined !== 'widget')
ℹ tests 15
ℹ pass 13
ℹ fail 2
```

### GREEN (focused)

```text
$ npx tsx --test lib/db/analytics-ingest-rules.test.ts

▶ parseIngestBody … ✔ (9 tests)
▶ sanitizeReferrer … ✔ (1 test)
▶ normalizeSource … ✔ (1 test)
▶ isAllowedAnalyticsOrigin … ✔ (2 tests)
▶ createMemoryRateLimiter … ✔ (1 test)
▶ normalizePathname … ✔ (1 test)
ℹ tests 15
ℹ pass 15
ℹ fail 0
```

### GREEN (full suite)

```text
$ npm test

ℹ tests 106
ℹ pass 106
ℹ fail 0
```

### Files changed

| File | Action |
|------|--------|
| `lib/db/analytics-ingest-rules.ts` | Cart quantity required; `product_slug` field |
| `lib/db/analytics-ingest-rules.test.ts` | +8 tests for spec gaps |
