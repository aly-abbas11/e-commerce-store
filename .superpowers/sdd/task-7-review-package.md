# Task 7 review package (uncommitted; no git SHA)

Work is uncommitted on a dirty main that also contains T-14. Review **only Task 7**. Do not re-review T-14 checkout order-id/demo work except where Task 7 attached to it.

## Created
- `app/api/analytics/event/route.ts`
- `lib/db/analytics-cleanup-rules.ts`
- `lib/db/analytics-cleanup-rules.test.ts`
- `lib/db/analytics-cleanup.ts`
- `lib/db/analytics-checkout-rules.ts`
- `lib/db/analytics-checkout-rules.test.ts`
- `lib/db/analytics-checkout.ts`

## Modified for Task 7
- `lib/db/analytics-ingest-rules.ts` (+variant_id, shopHost, ingestLogFields, buildFirstTouch, bindProductRelations, rateLimitIdentity, cookies helpers)
- `lib/db/analytics-ingest-rules.test.ts`
- `app/api/checkout/route.ts` (attach after persist; file also contains prior uncommitted T-14 order-id/demo changes — ignore those)
- `lib/db/store.ts` (`updateOrderAttributionRow` only)
- `package.json` test script append
- `lib/db/analytics-traffic-rules.ts` / `lib/db/analytics-insight-rules.ts` — Array.from for tsc only

## Intentionally not modified
- `lib/order-store.ts` `NewOrderInput` (controller: attrib via post-persist UPDATE, not INSERT)

Read the files above. Do not mutate the tree. Do not re-run the full test suite.
