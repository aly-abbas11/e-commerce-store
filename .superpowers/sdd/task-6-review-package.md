# Task 6 review package (uncommitted; no git SHA)

## Files
- Created: supabase/migrations/20260828010000_first_party_analytics.sql
- Created: .superpowers/sdd/task-6-report.md

## Full migration
```sql
-- T-15: first-party traffic analytics. RLS on; no anon/authenticated policies (service role bypasses RLS).

create table if not exists public.analytics_visitors (
  id uuid primary key default gen_random_uuid(),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.analytics_sessions (
  id uuid primary key,
  visitor_id uuid not null references public.analytics_visitors (id),
  started_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  is_demo boolean not null default false,
  landing_path text,
  referrer text,
  source text,
  medium text,
  campaign text,
  campaign_id text,
  campaign_content text,
  campaign_term text,
  ttclid text,
  fbclid text,
  gclid text,
  device_type text
);

create index if not exists analytics_sessions_started_at_idx
  on public.analytics_sessions (started_at);
create index if not exists analytics_sessions_is_demo_idx
  on public.analytics_sessions (is_demo);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null,
  session_id uuid not null references public.analytics_sessions (id) on delete cascade,
  visitor_id uuid not null references public.analytics_visitors (id),
  is_demo boolean not null default false,
  name text not null,
  occurred_at timestamptz not null default now(),
  path text,
  page_type text,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  product_slug text,
  properties jsonb not null default '{}'::jsonb
);

create index if not exists analytics_events_session_name_occurred_at_idx
  on public.analytics_events (session_id, name, occurred_at);
create unique index if not exists analytics_events_event_id_idx
  on public.analytics_events (event_id);

alter table public.orders
  add column if not exists analytics_session_id uuid references public.analytics_sessions (id) on delete set null,
  add column if not exists analytics_visitor_id uuid references public.analytics_visitors (id) on delete set null,
  add column if not exists attrib_source text,
  add column if not exists attrib_medium text,
  add column if not exists attrib_campaign text,
  add column if not exists attrib_campaign_id text,
  add column if not exists attrib_ttclid text,
  add column if not exists attrib_fbclid text,
  add column if not exists attrib_gclid text;

alter table public.analytics_visitors enable row level security;
alter table public.analytics_sessions enable row level security;
alter table public.analytics_events enable row level security;
```
