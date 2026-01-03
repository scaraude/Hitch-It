create table if not exists public.spots (
  id text primary key,
  latitude double precision not null,
  longitude double precision not null,
  road_name text not null,
  appreciation text not null,
  direction text not null,
  destinations jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by text not null
);

create index if not exists spots_created_at_idx on public.spots (created_at desc);

alter table public.spots enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'spots'
      and policyname = 'Allow anon read/write'
  ) then
    create policy "Allow anon read/write" on public.spots
      for all
      using (true)
      with check (true);
  end if;
end $$;
