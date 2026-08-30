### Task 6: Migration

**Files:**
- Create: `supabase/migrations/20260828010000_first_party_analytics.sql`

**Interfaces:** none (SQL)

- [ ] **Step 1: Write migration** (no unit test file)

Requirements:

- Tables as spec; RLS enabled; **no** anon insert/select policies.
- `analytics_events.event_id` unique.
- `analytics_events.session_id` references `analytics_sessions(id) ON DELETE CASCADE`.
- `analytics_events.visitor_id` references `analytics_visitors(id)` (restrict or cascade visitors only after sessions gone).
- `analytics_events.product_id` â†’ `products(id) ON DELETE SET NULL`
- `analytics_events.variant_id` â†’ `product_variants(id) ON DELETE SET NULL`
- `orders.analytics_session_id` â†’ `analytics_sessions(id) ON DELETE SET NULL`
- `orders.analytics_visitor_id` â†’ `analytics_visitors(id) ON DELETE SET NULL`
- Snapshot columns on orders: `attrib_source`, `attrib_medium`, `attrib_campaign`, `attrib_campaign_id`, `attrib_ttclid`, `attrib_fbclid`, `attrib_gclid` (text, nullable)
- Indexes: `analytics_sessions(started_at)`, `analytics_sessions(is_demo)`, `analytics_events(session_id, name, occurred_at)`, `analytics_events(event_id)`

- [ ] **Step 2: Stop and ask the user before `supabase db push`**

Do not push in this task unless they already said to push.

