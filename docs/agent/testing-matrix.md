# VoltGear Testing Matrix

Use proportionally; do not run every possible check after every tiny edit.

## Targeted during work

- relevant unit/adapter test;
- TypeScript on changed contract when needed;
- one affected route/runtime interaction.

## Significant final verification

```text
npm run test
npx tsx --test lib/db/inventory-rpc.test.ts
npx tsc --noEmit
npm run lint
npm run build
git diff --check
```

## Storefront UI

Browser at ~1440 and ~390. Check layout, touch/keyboard, overflow, images, primary action, console/runtime.

## Runtime bug

Exact error + regression test + affected route + one adjacent critical route.

## Admin mutation

Unauthorized rejection, validation failure, success, persistence on reload, side effects/public consequence.

## Database migration

Target verification, migration list, additive SQL review, constraints/FKs/indexes, application compatibility, rollback concern, no secret output.

## Release

Build, deployment Ready, critical-route smoke tests, recent runtime logs.
