# T-15 SDD progress

Started: 2026-08-28
Plan: docs/plans/2026-08-28-t15-first-party-traffic-plan.md
Spec: docs/superpowers/specs/2026-08-27-t15-first-party-traffic-design.md
Branch: main (work in place; no commits unless user asks)

## Tasks

- Task 1: complete (uncommitted, review approved). Follow-ups for Task 7: apply campaign/click-id caps; parse variant_id; pass shop host so same-origin referrer is not referral.
- Task 2: complete (uncommitted, review approved). Minors: exact 30m boundary and session-id mismatch untested.
- Task 3: complete (uncommitted, review approved). Minors: demo-order converted reach untested; null session source omitted from by-source.
- Task 4: complete (uncommitted, review approved after cancel-rate relativeRise). Minors: unused `now` on input; max-8 test weak.
- Task 5: complete (uncommitted, review approved after first-send attribution fix).
- Task 6: complete (uncommitted, review approved). `supabase db push` not run — waiting for user approval.
- Task 7: complete (uncommitted, review approved after visitor-orphan fail-open). `supabase db push` still waiting for user approval.
- Task 8: complete (uncommitted, review approved).
- Task 9: complete (uncommitted, review approved after pagination `.order()`).
- Task 10: tests previously green. `supabase db push` applied `20260828010000` (tables exist). Production aliased 2026-08-28. Live JS includes `/api/analytics/event`. Row counts still 0 until a real shop visit.
