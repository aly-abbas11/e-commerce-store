# Security Rule

Treat security as a gate, not a cosmetic checklist.

For relevant work consider: authentication, authorization/IDOR, RLS, admin boundaries, uploads, payment/order endpoints, concurrency, brute-force/rate limiting, secrets/config, CORS/CSP/security headers, sessions/cookies, CSRF, XSS, injection, SSRF, open redirects, path traversal and dependency exposure.

Service-role access must remain server-only. Never log secrets. Never weaken authorization to make tests pass.

Production mutations and destructive security testing require explicit operator approval.
