-- T-23: merchandising collections (manual picks + simple auto rules)

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  mode text not null default 'manual'
    check (mode in ('manual', 'auto')),
  auto_rule text
    check (auto_rule is null or auto_rule in ('featured', 'bestsellers')),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists collections_sort_idx
  on public.collections (sort_order, name);

create table if not exists public.collection_products (
  collection_id uuid not null references public.collections (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  sort_order integer not null default 0,
  primary key (collection_id, product_id)
);

create index if not exists collection_products_product_idx
  on public.collection_products (product_id);

alter table public.collections enable row level security;
alter table public.collection_products enable row level security;
