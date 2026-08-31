-- T-16: multi-slide hero for /home2 preview. Live hero_sections singleton unchanged.
create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  image_url text not null,
  title text,
  subtitle text,
  sort_order integer not null default 0,
  status text not null default 'draft',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hero_slides_status_check check (status in ('draft', 'published'))
);

create index if not exists hero_slides_status_sort_idx
  on public.hero_slides (status, sort_order);

create index if not exists hero_slides_is_demo_idx
  on public.hero_slides (is_demo);

alter table public.hero_slides enable row level security;
-- no anon/authenticated policies; service role only (match other CMS tables)
