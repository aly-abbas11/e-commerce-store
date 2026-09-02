---
name: voltgear-feature
description: Implements one focused VoltGear feature with minimal repository exploration, architecture reuse, safe behavior changes, targeted tests and concise closure.
---

# VoltGear Feature

## Execute

1. Restate the exact feature boundary internally.
2. Inspect only directly relevant routes/components/store functions/tests.
3. Identify reuse opportunities before adding abstractions.
4. Implement the smallest coherent version that satisfies the request.
5. Preserve unrelated business logic.
6. Add focused tests for changed behavior.
7. Browser-QA if customer-facing.
8. Run final verification once.
9. Stop.

Frontend-only means no schema/order/inventory/analytics/auth changes. Database-backed work must use the Supabase safety skill. Never invent missing commerce data.

## Report

What changed / Files / Verification / Blocker / FEATURE COMPLETE — YES|NO.
