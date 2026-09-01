-- T-29: saved marketing email templates

create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null default '',
  body_text text not null default '',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists email_templates_updated_idx
  on public.email_templates (updated_at desc);

alter table public.email_templates enable row level security;
