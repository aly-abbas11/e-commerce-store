-- Create homepage_sections table for admin homepage collection builder
create table if not exists public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  slug text not null unique,
  source_type text not null default 'manual',
  category_id text,
  product_limit integer not null default 8,
  layout text not null default 'grid',
  show_view_all boolean not null default true,
  view_all_href text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists homepage_sections_active_sort_idx on public.homepage_sections (is_active, sort_order);

-- Create homepage_section_products junction table for manual product ordering
create table if not exists public.homepage_section_products (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.homepage_sections (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  sort_order integer not null default 0,
  constraint homepage_section_products_unique unique (section_id, product_id)
);

create index if not exists homepage_section_products_section_idx on public.homepage_section_products (section_id, sort_order);
