-- T-31: promo / discount codes

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  type text not null check (type in ('percent', 'fixed', 'free_shipping')),
  value numeric not null default 0,
  first_order_only boolean not null default false,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  usage_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint promo_codes_code_unique unique (code)
);

create index if not exists promo_codes_active_idx on public.promo_codes (active);

alter table public.promo_codes enable row level security;

alter table public.orders
  add column if not exists promo_code text,
  add column if not exists discount numeric not null default 0;
