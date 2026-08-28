-- T-09: shop types the owner can add, rename, and delete.

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists categories_sort_idx on public.categories (sort_order);

alter table public.categories enable row level security;

insert into public.categories (name, slug, description, sort_order)
values
  ('Smartwatches', 'smartwatch', 'Track your health, stay connected and look good doing it.', 1),
  ('Power Banks', 'power-bank', 'Portable power that keeps up with your busy day.', 2),
  ('Chargers & Adapters', 'charger', 'Fast, safe charging for every device you own.', 3),
  ('Earbuds & Handsfree', 'earbuds', 'Immersive sound with all-day comfort.', 4)
on conflict (slug) do nothing;
