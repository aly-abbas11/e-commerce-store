# Task 3 Report — Traffic cohort, ordered funnel, retention, Unattributed

## Status: COMPLETE

## Files

| Action | Path |
|--------|------|
| Created | `lib/db/analytics-traffic-rules.ts` |
| Created | `lib/db/analytics-traffic-rules.test.ts` |
| Modified | `package.json` — appended test file to `test` script |

## Exports

- `RAW_RETENTION_DAYS = 90`
- `trafficRangeAvailable(range, now)`
- `countCohortVisitors(sessions, range)`
- `buildSessionsBySource(sessions, range)`
- `buildDeliveredBySource(deliveredOrders)`
- `buildShopFunnel(sessions, events, orders, range)`
- Types: `TrafficEvent`, `TrafficSession`, `AttributedOrder` (+ `total?: number`), `ShopFunnelStep`, `SessionsBySourceRow`, `DeliveredBySourceRow`

## Imports from `analytics-rules.ts`

`YmdRange`, `karachiYmd`, `isoInRange`, `parseIso` — **no** `buildOrderFunnel`; `analytics-rules.ts` unchanged.

## RED evidence

Before implementation existed, focused run failed as expected:

```
Error: Cannot find module './analytics-traffic-rules'
```

Tests were authored first covering all brief must-include cases; implementation followed.

## GREEN evidence

### Focused

```
npx tsx --test lib/db/analytics-traffic-rules.test.ts
ℹ tests 10
ℹ pass 10
ℹ fail 0
```

### Full suite

```
npm test
ℹ tests 124
ℹ pass 124
ℹ fail 0
```

## Must-include cases covered

| Case | Test |
|------|------|
| ATC without PDP; reach can exceed PV; transition ≤ 1 | `allows ATC reach to exceed PV reach while transition rate stays <= 1` |
| ATC then later checkout; reverse timestamps excluded | `counts checkout only when ATC occurred strictly before checkout_started` |
| Distinct cohort visitors | `counts distinct visitor ids from cohort sessions` |
| Demo sessions excluded | `excludes demo sessions from cohort reach` |
| Day 91 → retention false | `is false when range starts on day 91 before now` |
| Null/empty order snapshot → `unattributed` | `maps null or empty snapshot source to unattributed, not direct` |
| Direct session source stays `direct` | `keeps direct session source as direct` |
| Sessions row `conversionFromPrevious: null` | `uses null conversionFromPrevious on Sessions` |

## Commits

None (per instructions).

## Concerns

- `parseIso` imported from `analytics-rules` for strict timestamp ordering (not listed in binding import list but required for “then later” logic).
- `buildSessionsBySource` omits sessions with null/empty `source` (brief allows omit or label).
