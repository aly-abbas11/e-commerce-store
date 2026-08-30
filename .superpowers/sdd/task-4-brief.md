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

`relativeDrop(prior, current)`: if `prior === 0` return `null`; else `(prior - current) / prior`.

Rules 1â€“9 exactly as spec. One card per id (worst candidate). No LOW cards. Max 8. Shop floors on **transition** rates. `landing_low_pdp` skip paths that are `/checkout` or start with `/checkout/`. Fulfillment rules filter `createdAt <= now - 24h` for current and prior.

- [ ] **Step 1: Failing tests** for: prior_rate 0 does not fire relative; two sources only emit one `source_underperforms`; fresh orders do not trigger processing-gap; checkout landing does not trigger `landing_low_pdp`; below 30 sessions emits no shop cards; T-15 does not emit `confidence: "LOW"`.

- [ ] **Step 2â€“4:** RED â†’ implement â†’ PASS + `npm test`

---
