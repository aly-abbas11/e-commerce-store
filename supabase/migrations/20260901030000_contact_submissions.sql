-- T-22: contact / complaint inbox for admin

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'contact'
    check (kind in ('contact', 'complaint')),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text not null default 'new'
    check (status in ('new', 'read', 'closed')),
  admin_note text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists contact_submissions_status_created_idx
  on public.contact_submissions (status, created_at desc);

create index if not exists contact_submissions_kind_created_idx
  on public.contact_submissions (kind, created_at desc);

create index if not exists contact_submissions_is_demo_idx
  on public.contact_submissions (is_demo);

alter table public.contact_submissions enable row level security;
