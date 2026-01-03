-- Create travels table
create table if not exists public.travels (
  id text primary key,
  user_id text not null,
  start_date timestamptz not null default now(),
  end_date timestamptz,
  origin text not null,
  destination text not null,
  status text not null check (status in ('InProgress', 'Completed', 'Abandoned')),
  total_distance double precision not null default 0,
  total_wait_time integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create travel_steps table
create table if not exists public.travel_steps (
  id text primary key,
  travel_id text not null references public.travels(id) on delete cascade,
  type text not null check (type in ('Waiting', 'InVehicle', 'Walking', 'Break')),
  spot_id text references public.spots(id) on delete set null,
  start_time timestamptz not null,
  end_time timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add indexes for better query performance
create index if not exists idx_travels_user_id on public.travels(user_id);
create index if not exists idx_travels_status on public.travels(status);
create index if not exists idx_travels_start_date on public.travels(start_date desc);
create index if not exists idx_travel_steps_travel_id on public.travel_steps(travel_id);
create index if not exists idx_travel_steps_spot_id on public.travel_steps(spot_id);

-- Enable Row Level Security
alter table public.travels enable row level security;
alter table public.travel_steps enable row level security;

-- RLS Policies for travels table
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'travels'
      and policyname = 'Allow anon read/write'
  ) then
    create policy "Allow anon read/write" on public.travels
      for all
      using (true)
      with check (true);
  end if;
end $$;

-- RLS Policies for travel_steps table
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'travel_steps'
      and policyname = 'Allow anon read/write'
  ) then
    create policy "Allow anon read/write" on public.travel_steps
      for all
      using (true)
      with check (true);
  end if;
end $$;

-- Create updated_at trigger function if it doesn't exist
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers
do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'update_travels_updated_at'
  ) then
    create trigger update_travels_updated_at
      before update on public.travels
      for each row
      execute function update_updated_at_column();
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'update_travel_steps_updated_at'
  ) then
    create trigger update_travel_steps_updated_at
      before update on public.travel_steps
      for each row
      execute function update_updated_at_column();
  end if;
end $$;
