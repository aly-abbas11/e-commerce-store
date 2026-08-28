-- T-06: demo sandbox flags. Live rows stay is_demo = false.

alter table public.products
  add column if not exists is_demo boolean not null default false;

alter table public.pages
  add column if not exists is_demo boolean not null default false;

alter table public.orders
  add column if not exists is_demo boolean not null default false;

alter table public.review_submissions
  add column if not exists is_demo boolean not null default false;

create index if not exists products_is_demo_idx on public.products (is_demo);
create index if not exists pages_is_demo_idx on public.pages (is_demo);
create index if not exists orders_is_demo_idx on public.orders (is_demo);
create index if not exists review_submissions_is_demo_idx on public.review_submissions (is_demo);
