---
name: analytics-commerce
description: Works with VoltGear first-party commerce analytics and funnels while preserving event truth, delivered-revenue semantics, privacy, retention and admin reporting integrity.
---

# Analytics Commerce

Analytics should answer merchant decisions, not inflate vanity metrics.

Preserve the existing first-party event/session architecture and demo-data separation.

Distinguish:
- visitors;
- sessions;
- product-view sessions;
- add-to-cart;
- checkout starts;
- orders placed;
- shipped;
- delivered;
- cancelled;
- delivered revenue.

Do not redefine events casually or mix incompatible units. Avoid double-counting and browser-authoritative purchase truth when the server already links orders.

Insights must use sufficient sample floors and explain the evidence. Do not invent significance from tiny samples.
