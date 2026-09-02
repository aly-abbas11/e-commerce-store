# VoltGear Security Model

## Security boundaries

Public customer, authenticated/admin operations, server-only service-role access, database/RLS and external deployment/configuration are distinct trust boundaries.

## Mandatory habits

- Verify authorization server-side for mutations.
- Treat IDs from clients as untrusted.
- Keep service-role secrets server-only.
- Validate payload type/range/shape server-side.
- Use safe URL/path validation.
- Preserve idempotency and transactional integrity where order/inventory state changes.
- Avoid broad catches that hide unexpected DB failures.
- Never log credentials or sensitive customer data unnecessarily.

## Security gate domains

Auth/session/cookies; IDOR/ownership; RLS; admin routes; checkout/orders; uploads; concurrency; rate limits; injection; XSS; CSRF; SSRF; redirects; traversal; CORS/CSP/headers; dependencies; secrets; exposed services/config.

## Severity

Critical: direct compromise/data loss/payment/order integrity break.
High: exploitable unauthorized access or significant customer/business impact.
Medium: meaningful defense weakness requiring conditions.
Low: hardening/limited-impact issue.
