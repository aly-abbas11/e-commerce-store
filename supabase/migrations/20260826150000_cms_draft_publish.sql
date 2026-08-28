-- T-02: draft/publish columns. Existing rows become published.

alter table public.products
  add column if not exists status text not null default 'published',
  add column if not exists draft jsonb;

alter table public.pages
  add column if not exists status text not null default 'published',
  add column if not exists draft jsonb;

alter table public.testimonials
  add column if not exists status text not null default 'published',
  add column if not exists draft jsonb;

alter table public.hero_sections
  add column if not exists status text not null default 'published',
  add column if not exists draft jsonb;

alter table public.site_settings
  add column if not exists status text not null default 'published',
  add column if not exists draft jsonb;

update public.products set status = 'published' where status is null;
update public.pages set status = 'published' where status is null;
update public.testimonials set status = 'published' where status is null;
update public.hero_sections set status = 'published' where status is null;
update public.site_settings set status = 'published' where status is null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_status_check'
  ) then
    alter table public.products
      add constraint products_status_check
      check (status in ('draft', 'published', 'unpublished'));
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'pages_status_check'
  ) then
    alter table public.pages
      add constraint pages_status_check
      check (status in ('draft', 'published', 'unpublished'));
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'testimonials_status_check'
  ) then
    alter table public.testimonials
      add constraint testimonials_status_check
      check (status in ('draft', 'published', 'unpublished'));
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'hero_sections_status_check'
  ) then
    alter table public.hero_sections
      add constraint hero_sections_status_check
      check (status in ('draft', 'published', 'unpublished'));
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'site_settings_status_check'
  ) then
    alter table public.site_settings
      add constraint site_settings_status_check
      check (status in ('draft', 'published', 'unpublished'));
  end if;
end $$;

create index if not exists products_status_idx on public.products (status);
create index if not exists pages_status_idx on public.pages (status);
create index if not exists testimonials_status_idx on public.testimonials (status);
