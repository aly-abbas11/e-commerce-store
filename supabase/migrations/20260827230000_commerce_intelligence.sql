-- T-14: internal product cost (never public) + saved analytics reports.

alter table public.products
  add column if not exists cost_price numeric;

create index if not exists orders_created_at_idx on public.orders (created_at);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists order_status_history_order_at_idx
  on public.order_status_history (order_id, at);

create table if not exists public.analytics_saved_reports (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  query jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.analytics_saved_reports enable row level security;
