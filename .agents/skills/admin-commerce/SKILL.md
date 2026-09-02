---
name: admin-commerce
description: Builds reliable VoltGear admin functionality for products, categories, homepage merchandising, orders and operations with structured forms, validation and merchant-safe behavior.
---

# Admin Commerce

Admin is an operations tool, not a showcase.

## Rules

- Reuse existing admin shell/forms/media/data adapters.
- Validate all mutation payloads server-side.
- Make visibility/status/order consequences explicit.
- Preserve deterministic ordering.
- Use search for large product/customer selectors.
- Never delete core records through relationship removal.
- Prefer Move Up/Down over adding a drag/drop dependency unless existing infrastructure already supports it.
- Keep public and draft/published states consistent with current architecture.
- Empty/broken related records must fail safely.

## Acceptance

Test create, edit, validation failure, visibility, ordering, reload persistence, public consequence and authorization where relevant.
