# Task 6 Report — First-party analytics migration

## Status: COMPLETE

## Files

| Action | Path |
|--------|------|
| Created | `supabase/migrations/20260828010000_first_party_analytics.sql` |

## Schema

- `analytics_visitors` — id, first_seen_at, last_seen_at
- `analytics_sessions` — client-provided `id` (no default); attribution + device columns; indexes on `started_at`, `is_demo`
- `analytics_events` — `event_id` unique; `session_id` ON DELETE CASCADE; product/variant FKs ON DELETE SET NULL; composite index `(session_id, name, occurred_at)`
- `orders` additive — `analytics_session_id`, `analytics_visitor_id` (ON DELETE SET NULL); seven `attrib_*` snapshot columns

## RLS

Enabled on all three analytics tables. No anon/authenticated policies (service role bypasses RLS).

## `supabase db push`

**Not run** (per instructions).

## Concerns

- `analytics_sessions.id` has no default (client `vg_sid` must be supplied on insert).
- `event_id` uniqueness is a named unique index only (`analytics_events_event_id_idx`), not an inline `UNIQUE` constraint.
- `visitor_id` FKs use default RESTRICT — visitor cleanup must delete sessions (and cascading events) first.

## Commits

None (per instructions).
