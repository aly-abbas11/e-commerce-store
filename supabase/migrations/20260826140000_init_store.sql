-- T-01: store schema. RLS on; shoppers never write via anon. Service role bypasses RLS.

create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sanity_id text unique,
  name text not null,
  slug text not null unique,
  brand text,
  sku text,
  category text not null,
  price numeric not null default 0,
  compare_at_price numeric,
  short_description text,
  description jsonb,
  features jsonb,
  specifications jsonb,
  compatibility jsonb,
  in_the_box jsonb,
  product_video jsonb,
  product_faq jsonb,
  stock_status text not null default 'in-stock',
  rating numeric,
  review_count integer,
  featured boolean not null default false,
  badge text,
  cloudinary_images jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_price_idx on public.products (price);
create index if not exists products_featured_idx on public.products (featured);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  sort_order integer not null default 0,
  source text not null default 'cloudinary'
);

create index if not exists product_images_product_idx on public.product_images (product_id, sort_order);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  key text,
  name text not null,
  sku text,
  price numeric,
  compare_at_price numeric,
  stock_status text not null default 'in-stock',
  image_url text,
  is_default boolean not null default false
);

create index if not exists product_variants_product_idx on public.product_variants (product_id);

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text,
  rating numeric,
  review_date text,
  comment text,
  verified boolean,
  image text,
  is_demo boolean
);

create table if not exists public.review_submissions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text,
  email text,
  rating numeric not null,
  comment text,
  image text,
  category text,
  product_name text,
  verified boolean not null default false,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists review_submissions_product_idx on public.review_submissions (product_id, status);

create table if not exists public.site_settings (
  id integer primary key default 1,
  brand_name text not null default 'Store',
  tagline text,
  logo_url text,
  primary_color text,
  secondary_color text,
  theme text,
  heading_font text,
  body_font text,
  currency text,
  email text,
  phone text,
  address text,
  social_links jsonb,
  free_shipping_threshold numeric,
  shipping_fee numeric,
  return_policy text,
  warranty_info text,
  cod_enabled boolean,
  whatsapp_number text,
  warranty_months integer,
  return_window_days integer,
  announcement jsonb,
  seo jsonb,
  constraint site_settings_singleton check (id = 1)
);

create table if not exists public.hero_sections (
  id integer primary key default 1,
  headline text,
  subheadline text,
  background_image_url text,
  background_video text,
  primary_cta jsonb,
  secondary_cta jsonb,
  stats jsonb,
  featured_product_id uuid references public.products (id) on delete set null,
  constraint hero_sections_singleton check (id = 1)
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  sanity_id text unique,
  title text not null,
  slug text not null unique,
  page_type text not null default 'static',
  excerpt text,
  cover_image_url text,
  published_at timestamptz,
  author text,
  sections jsonb,
  keywords jsonb,
  seo jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  sanity_id text unique,
  customer_name text not null,
  review_text text not null,
  rating numeric not null default 5,
  product text,
  verified boolean,
  is_demo boolean,
  sort_order integer,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  sanity_id text unique,
  order_id text not null unique,
  customer jsonb not null default '{}'::jsonb,
  payment text not null default 'cod',
  subtotal numeric not null default 0,
  shipping numeric not null default 0,
  total numeric not null default 0,
  status text not null default 'new',
  status_updated_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists orders_email_idx on public.orders ((customer->>'email'));

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  slug text,
  name text,
  price numeric,
  quantity integer,
  variant_key text,
  variant_name text,
  variant_sku text,
  line_total numeric
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  status text not null,
  note text,
  at timestamptz not null default now()
);

create table if not exists public.email_events (
  id uuid primary key default gen_random_uuid(),
  sanity_id text unique,
  kind text not null,
  email text not null,
  data jsonb,
  due_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists email_events_due_idx on public.email_events (due_at) where sent_at is null;

create table if not exists public.message_campaigns (
  id uuid primary key default gen_random_uuid(),
  sanity_id text unique,
  name text,
  text text not null default '',
  sent integer not null default 0,
  failed integer not null default 0,
  queued integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.message_recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.message_campaigns (id) on delete cascade,
  phone text,
  name text,
  status text not null default 'queued',
  message_id text,
  sent_at timestamptz,
  error text
);

create table if not exists public.broadcast_contacts (
  id text primary key,
  phone text not null,
  name text,
  city text,
  note text
);

create table if not exists public.broadcast_suppressed (
  phone text primary key
);

alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_reviews enable row level security;
alter table public.review_submissions enable row level security;
alter table public.site_settings enable row level security;
alter table public.hero_sections enable row level security;
alter table public.pages enable row level security;
alter table public.testimonials enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.email_events enable row level security;
alter table public.message_campaigns enable row level security;
alter table public.message_recipients enable row level security;
alter table public.broadcast_contacts enable row level security;
alter table public.broadcast_suppressed enable row level security;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public read product-images"
on storage.objects for select
to public
using (bucket_id = 'product-images');
