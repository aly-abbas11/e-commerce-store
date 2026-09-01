-- T-23b: bind a collection to a home rail slot
alter table public.collections
  add column if not exists home_slot text
  check (
    home_slot is null
    or home_slot in ('bestsellers', 'featured', 'offers')
  );

create unique index if not exists collections_home_slot_unique
  on public.collections (home_slot)
  where home_slot is not null and active = true;
