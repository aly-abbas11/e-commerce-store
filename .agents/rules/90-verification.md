# Verification Rule

A task is not complete because code compiles.

Runtime bug: reproduce -> exact error/stack -> root cause -> smallest fix -> regression test -> route verification.

Frontend: browser inspect at desktop/mobile -> interactions -> console/runtime -> overflow -> accessibility basics.

Backend/data: validate contracts, error behavior, authorization and regression tests.

Final significant-task suite:

- `npm run test`
- `npx tsx --test lib/db/inventory-rpc.test.ts`
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- `git diff --check`

Never report PASS for a command that did not actually complete successfully.

## Proportionate Verification

Verification depth must match implementation risk.

### Tiny presentation-only change

Examples:

- spacing
- font size
- radius
- alignment
- responsive Tailwind utilities
- small visual corrections

Required:

1. inspect the exact affected component;
2. browser-verify the affected viewport;
3. check nearby responsive breakpoint if relevant;
4. run `npx tsc --noEmit` only if TypeScript/component structure changed;
5. run `npm run lint` only when relevant to changed source;
6. run `git diff --check`.

Do NOT automatically run the complete application test/build suite for every tiny CSS adjustment.

### Normal frontend feature

Required:

- targeted implementation checks;
- real browser QA at relevant desktop/mobile widths;
- TypeScript;
- lint;
- relevant tests;
- `git diff --check`.

Run full `npm run build` at closure when the feature materially changes routing, rendering architecture, server/client boundaries, data loading, shared components, or other build-sensitive behavior.

### Commerce/business-logic feature

Examples:

- cart
- checkout
- pricing
- variants
- inventory
- orders
- authentication
- analytics event semantics

Required:

- relevant focused tests;
- full main test suite;
- TypeScript;
- lint;
- build;
- `git diff --check`;
- runtime verification where applicable.

### Database / infrastructure / release gate

Use the complete verification suite appropriate to that domain.

### Core principle

Do not spend expensive verification cycles where they add negligible confidence.

Increase verification depth when blast radius, data risk, security risk, architectural impact, or production impact increases.
