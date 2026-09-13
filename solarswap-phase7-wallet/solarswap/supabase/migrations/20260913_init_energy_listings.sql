-- SolarSwap Migration: public.profiles prerequisite & public.energy_listings
-- Applied: 2026-09-13

-- 1. Ensure public.profiles exists (foreign key target for seller_id & profiles(full_name))
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null check (role in ('prosumer', 'consumer', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Read policies for profiles (so seller names show on marketplace cards)
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Authenticated users can view all profiles" on public.profiles;
create policy "Authenticated users can view all profiles"
  on public.profiles for select
  to authenticated, anon
  using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auth signup trigger for new profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'consumer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Create public.energy_listings table
create table if not exists public.energy_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  energy_amount numeric not null check (energy_amount > 0),
  remaining_energy numeric not null check (remaining_energy >= 0),
  price_per_kwh numeric not null check (price_per_kwh > 0),
  location text not null,
  availability_date date not null,
  status text not null default 'available' check (status in ('available', 'sold', 'cancelled')),
  created_at timestamptz not null default now()
);

-- Performance Indexes
create index if not exists energy_listings_status_idx on public.energy_listings (status);
create index if not exists energy_listings_seller_idx on public.energy_listings (seller_id);
create index if not exists energy_listings_available_idx on public.energy_listings (status, created_at desc)
  where status = 'available' and remaining_energy > 0;

-- Row Level Security
alter table public.energy_listings enable row level security;

-- Select policy (Marketplace browsing)
drop policy if exists "View available or own listings" on public.energy_listings;
create policy "View available or own listings"
  on public.energy_listings for select
  to authenticated, anon
  using (status = 'available' or seller_id = (select auth.uid()));

-- Insert policy (Prosumers only)
drop policy if exists "Prosumers create their own listings" on public.energy_listings;
create policy "Prosumers create their own listings"
  on public.energy_listings for insert
  to authenticated
  with check (
    seller_id = (select auth.uid())
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'prosumer'
    )
  );

-- Update policy (Listing owners only)
drop policy if exists "Owners update their own listings" on public.energy_listings;
create policy "Owners update their own listings"
  on public.energy_listings for update
  to authenticated
  using (seller_id = (select auth.uid()))
  with check (seller_id = (select auth.uid()));

-- Delete policy (Listing owners only)
drop policy if exists "Owners delete their own listings" on public.energy_listings;
create policy "Owners delete their own listings"
  on public.energy_listings for delete
  to authenticated
  using (seller_id = (select auth.uid()));
