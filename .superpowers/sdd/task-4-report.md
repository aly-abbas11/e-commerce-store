# Task 4 Report — Insights catalog

## Status: COMPLETE

## Files

| Action | Path |
|--------|------|
| Created | `lib/db/analytics-insight-rules.ts` |
| Created | `lib/db/analytics-insight-rules.test.ts` |
| Modified | `package.json` — appended test file to `test` script |

## Exports

- `FULFILLMENT_MATURITY_HOURS = 24`
- `relativeDrop(prior, current)` — `null` when `prior === 0`, else `(prior - current) / prior`
- `buildInsights(input)` — pure function; no database access
- `InsightCard` type
- `BuildInsightsInput` type

## RED evidence

Before implementation existed, focused run failed as expected:

```
Error: Cannot find module './analytics-insight-rules'
```

Tests were authored first covering all brief must-include cases; implementation followed.

## GREEN evidence

### Focused

```
npx tsx --test lib/db/analytics-insight-rules.test.ts
ℹ tests 13
ℹ pass 13
ℹ fail 0
```

### Full suite

```
npm test
ℹ tests 137
ℹ pass 137
ℹ fail 0
```

## Must-include cases covered

| Case | Test |
|------|------|
| `prior_rate = 0` does not fire relative drop | `does not fire relative shop_drop_product_view when prior pv rate is 0` |
| Two sources → one `source_underperforms` (worst gap) | `emits only one source_underperforms card for the worst gap` |
| `maturePlaced < 10` skips processing-gap | `does not emit fulfillment_processing_gap when mature placed is below 10` |
| `/checkout` landing skipped for `landing_low_pdp` | `does not emit landing_low_pdp for checkout landing paths` |
| `< 30` sessions → no shop cards | `emits no shop insight cards when session count is below 30` |
| No `confidence: "LOW"` | `never emits confidence LOW` |
| Absolute floor MEDIUM (40 sessions, pvRate 0.10) | `fires shop_drop_product_view on absolute floor with MEDIUM when sessions are 40 and no prior` |
| Sort HIGH before MEDIUM, larger gap | `sorts HIGH before MEDIUM then by larger gap magnitude` |
| Max 8 cards | `caps output at 8 cards` |
| Traffic NA skips shop/source/landing/validation | `skips shop, source, landing, and validation cards when traffic is not available` |

## Commits

None (per instructions).

## Concerns

- Card copy (titles, causes, checks) is functional placeholder text aligned to rule semantics; UI polish can follow in Task 8.
- `analytics-rules.ts` untouched per instructions.

## Fix pass — cancel-rate direction

**Change:** Added `relativeRise(prior, current) = (current - prior) / prior` (null when `prior === 0`). `fulfillment_cancel_rate` now uses relative rise ≥ 25% instead of `relativeDrop`. Shop conversion and processing gap keep `relativeDrop`.

**Tests added (3 + 2 for `relativeRise` helper):**
- Worsening 10% → 20% emits `fulfillment_cancel_rate` via relative rise (100%)
- Improving 20% → 10% does not emit
- Prior cancel rate 0 does not emit on relative
- Existing `relativeDrop(0, …)` retained

**Results:**
- Focused: 18 pass / 0 fail
- Full suite: 142 pass / 0 fail
