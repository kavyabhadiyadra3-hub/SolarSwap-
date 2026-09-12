-- SolarSwap · Phase 5 · Marketplace database
-- Run this in Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Safe to re-run: every statement uses IF NOT EXISTS / DROP ... IF EXISTS,
-- and it does NOT recreate the "profiles" table from Phase 4.

-- 0. Widen profiles read-access.
--    Phase 4 only let a user read THEIR OWN profile. The Marketplace needs
--    to show seller names to other users, so add a second, broader SELECT
--    policy (Postgres OR's multiple policies together — this doesn't
--    remove the Phase 4 one, it just adds another allowed case).
drop policy if exists "Authenticated users can view all profiles" on public.profiles;
create policy "Authenticated users can view all profiles"
  on public.profiles for select
  to authenticated
  using (true);

-- 1. energy_listings ---------------------------------------------------
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

create index if not exists energy_listings_status_idx on public.energy_listings (status);
create index if not exists energy_listings_seller_idx on public.energy_listings (seller_id);

alter table public.energy_listings enable row level security;

-- Anyone logged in can see available listings; a seller can also see
-- their own listings even after they're sold/cancelled (for their dashboard).
drop policy if exists "View available or own listings" on public.energy_listings;
create policy "View available or own listings"
  on public.energy_listings for select
  to authenticated
  using (status = 'available' or seller_id = auth.uid());

-- Only a prosumer can create a listing, and only in their own name.
drop policy if exists "Prosumers create their own listings" on public.energy_listings;
create policy "Prosumers create their own listings"
  on public.energy_listings for insert
  to authenticated
  with check (
    seller_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'prosumer'
    )
  );

drop policy if exists "Owners update their own listings" on public.energy_listings;
create policy "Owners update their own listings"
  on public.energy_listings for update
  to authenticated
  using (seller_id = auth.uid())
  with check (seller_id = auth.uid());

drop policy if exists "Owners delete their own listings" on public.energy_listings;
create policy "Owners delete their own listings"
  on public.energy_listings for delete
  to authenticated
  using (seller_id = auth.uid());

-- 2. transactions ---------------------------------------------------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.energy_listings (id) on delete cascade,
  energy_amount numeric not null check (energy_amount > 0),
  price_per_kwh numeric not null check (price_per_kwh > 0),
  total_amount numeric not null check (total_amount >= 0),
  status text not null default 'completed' check (status in ('completed', 'pending', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists transactions_buyer_idx on public.transactions (buyer_id);
create index if not exists transactions_seller_idx on public.transactions (seller_id);

alter table public.transactions enable row level security;

drop policy if exists "View own transactions" on public.transactions;
create policy "View own transactions"
  on public.transactions for select
  to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid());

-- Deliberately NO insert/update/delete policy for regular users here.
-- All writes happen through purchase_energy() below, so nobody can
-- insert or edit a transaction by hand, even their own.

-- 3. purchase_energy() — the atomic "buy energy" operation -------------
-- Runs as SECURITY DEFINER because it needs to update a listing owned by
-- someone else (the seller) as part of one trusted, validated operation.
-- "select ... for update" locks the listing row until this transaction
-- finishes, so two purchases arriving at nearly the same moment can't
-- both succeed against energy that isn't there anymore.
create or replace function public.purchase_energy(p_listing_id uuid, p_amount numeric)
returns public.transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_listing public.energy_listings%rowtype;
  v_buyer_id uuid := auth.uid();
  v_total numeric;
  v_new_remaining numeric;
  v_transaction public.transactions%rowtype;
begin
  if v_buyer_id is null then
    raise exception 'You must be logged in to buy energy.';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Amount must be greater than 0.';
  end if;

  select * into v_listing
  from public.energy_listings
  where id = p_listing_id
  for update;

  if not found then
    raise exception 'This listing no longer exists.';
  end if;

  if v_listing.status <> 'available' then
    raise exception 'This listing is no longer available.';
  end if;

  if v_listing.seller_id = v_buyer_id then
    raise exception 'You cannot buy your own listing.';
  end if;

  if p_amount > v_listing.remaining_energy then
    raise exception 'Only % kWh remaining for this listing.', v_listing.remaining_energy;
  end if;

  v_total := p_amount * v_listing.price_per_kwh;
  v_new_remaining := v_listing.remaining_energy - p_amount;

  insert into public.transactions
    (buyer_id, seller_id, listing_id, energy_amount, price_per_kwh, total_amount, status)
  values
    (v_buyer_id, v_listing.seller_id, v_listing.id, p_amount, v_listing.price_per_kwh, v_total, 'completed')
  returning * into v_transaction;

  update public.energy_listings
  set remaining_energy = v_new_remaining,
      status = case when v_new_remaining <= 0 then 'sold' else 'available' end
  where id = v_listing.id;

  return v_transaction;
end;
$$;

grant execute on function public.purchase_energy(uuid, numeric) to authenticated;
