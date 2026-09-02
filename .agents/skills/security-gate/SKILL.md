---
name: security-gate
description: Performs a structured VoltGear application and infrastructure security review covering authorization, data exposure, uploads, checkout/orders, web vulnerabilities, configuration and regression verification.
---

# Security Gate

Scope proportionally to the feature/system being reviewed.

## Review domains

- authentication/session/cookies;
- authorization, ownership and IDOR;
- RLS/server-only privileges;
- admin endpoints;
- uploads/file validation/storage exposure;
- checkout/order/payment mutation integrity;
- concurrency/idempotency;
- rate limiting/brute force;
- injection/XSS/CSRF/SSRF/open redirect/path traversal;
- CORS/CSP/security headers/TLS assumptions;
- secrets/env/config;
- dependency/vulnerability exposure;
- public error/log data leakage.

Do not run destructive or production-impacting tests without approval.

Rank findings: Critical / High / Medium / Low, with exploit condition, impact and smallest remediation. Verify fixes with focused regression tests.
