# Demo sandbox — release notes

## 2026-08-26 — Same-database demo account (T-06)

- Sign in at `/demo/login` with username `demo` and password `demo`. A shop banner shows while that session is on. Guests never see `is_demo` catalog; demo checkout and reviews are tagged and can be wiped from `/admin/orders` without touching live rows, hero, or settings.
- Schema applied (`supabase/migrations/20260826180000_demo_sandbox.sql`).
