# Task 5 Report — Client bootstrap queue

## Status: COMPLETE

## Files

| Action | Path |
|--------|------|
| Created | `lib/first-party-analytics.ts` |
| Created | `lib/first-party-analytics.test.ts` |
| Modified | `package.json` — appended test file to `test` script |

## Exports

- `shouldCollectPath(pathname)` — false for `/admin`, `/admin/*`, and gadget preview paths (`isGadgetPreviewPath`)
- `captureLandingAttribution(href, referrer)` — parses utm/click params from href; referrer via `sanitizeReferrer`
- `createFirstPartyClient({ fetch, getHref, getReferrer, newEventId? })` — synchronous attribution capture; sequential queue; first POST includes `attribution` + `credentials: 'include'`

## RED evidence

Before implementation existed, focused run failed as expected:

```
Error: Cannot find module './first-party-analytics'
```

Tests authored first (verbatim cookie-less double-fire test + `shouldCollectPath` cases + attribution assertions).

## GREEN evidence

### Focused

```
npx tsx --test lib/first-party-analytics.test.ts
ℹ tests 3
ℹ pass 3
ℹ fail 0
```

### Full suite

```
npm test
ℹ tests 145
ℹ pass 145
ℹ fail 0
```

## Must-include cases covered

| Case | Test |
|------|------|
| Cookie-less PDP: first event before second | `sends the first event before the second on a cookie-less PDP` |
| First body `attribution.utm_source === 'tiktok'` | same |
| Sanitized referrer without `?` | same |
| `shouldCollectPath("/home2") === false` | `skips admin, gadget preview, and allows live shop paths` |
| `shouldCollectPath("/admin/analytics") === false` | same |
| `shouldCollectPath("/product/pad") === true` | same |

## Commits

None (per instructions).

## Concerns

- No auto-retry on fetch failure (errors swallowed per spec); `event_id` reuse on retry is structurally supported via per-item id assignment if retry is added later.
- `newEventId` injectable for tests; defaults to `crypto.randomUUID`.

---

## Bugfix — `isFirstSend` cleared on failed fetch

### Status: FIXED

### Bug

`isFirstSend` was cleared in `finally` even when `sendEvent` threw. If the first POST failed, the second queued event was sent without `attribution`, losing landing UTM.

### Fix

Set `isFirstSend = false` only after `sendEvent` succeeds (inside `try`, not `finally`).

### Test

`retries attribution on the next event when the first fetch fails` — first fetch rejects, second succeeds; `bodies[1].attribution.utm_source === 'tiktok'`.

### RED evidence

```
AssertionError: Expected values to be strictly equal:
+ undefined
- 'tiktok'
```

### GREEN evidence

```
npx tsx --test lib/first-party-analytics.test.ts — 4 pass, 0 fail
npm test — 146 pass, 0 fail
```

### Files

| Action | Path |
|--------|------|
| Modified | `lib/first-party-analytics.ts` |
| Modified | `lib/first-party-analytics.test.ts` |

### Commits

None (per instructions).
