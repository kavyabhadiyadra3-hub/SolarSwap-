-- SolarSwap · Phase 7 · Virtual wallet + transaction enhancement
-- Run this in Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Safe to re-run: it does NOT drop or recreate profiles/energy_listings/
-- transactions, does NOT delete any rows, and does NOT disable RLS.
--
-- The wallet is a SIMULATED "Demo Wallet". No real money is involved.

-- 0. INSPECTION NOTE (why two extra hardening steps are included below)
-- --------------------------------------------------------------------
-- Phase 4's "profiles" UPDATE policy is:
--     using (auth.uid() = id)
-- with no column restriction and no WITH CHECK. Once wallet_balance is a
-- column on this same table, that existing policy would let a user PATCH
-- their OWN wallet_balance to any value via a raw API call (bypassing the
-- UI entirely) — which directly violates the "no arbitrary wallet edits"
-- requirement. RLS is row-level, not column-level, so the fix is a
-- column-level GRANT, done in step 3 below. This is additive and does not
-- touch any existing row, table, or policy.

-- 1. Add the wallet_balance column ---------------------------------------
-- Added as nullable first (no default) so that, immediately after this
-- statement, every EXISTING row is null and every column value is a
-- deliberate row this migration is about to fill in — see step 2.
alter table public.profiles
  add column if not exists wallet_balance numeric check (wallet_balance >= 0);

-- 2. One-time backfill for existing users ---------------------------------
-- Only fills rows that are still null. A user's balance is never null once
-- set (by this backfill, or by handle_new_user() for anyone who signs up
-- after this migration runs), so re-running this file is a no-op here and
-- can never reset a balance a purchase has already changed.
update public.profiles
set wallet_balance = case role
  when 'consumer' then 2500
  when 'prosumer' then 1000
  else 0
end
where wallet_balance is null;

alter table public.profiles
  alter column wallet_balance set not null,
  alter column wallet_balance set default 0; -- safety net only; handle_new_user() below always sets an explicit starting balance

-- 3. Lock down direct client access to wallet_balance ----------------------
-- Column-level grants apply on top of (not instead of) the row-level RLS
-- policies already in place. Narrowing them here means: even a row a user
-- is allowed to see/update under existing RLS, they still cannot read or
-- write wallet_balance directly — only the SECURITY DEFINER functions
-- below (which run with elevated privileges) can touch it.
--
-- Existing frontend queries only ever select "full_name"/"role"/"id", and
-- the only existing UPDATE target was never wired up in the UI, so this is
-- non-breaking for anything already built.
revoke select on public.profiles from authenticated;
grant select (id, full_name, email, role, created_at) on public.profiles to authenticated;

revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

-- 4. handle_new_user() — give every new signup a starting wallet ----------
-- CREATE OR REPLACE on the existing Phase 4 function/trigger; the trigger
-- itself (on_auth_user_created) is untouched.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := coalesce(new.raw_user_meta_data->>'role', 'consumer');
begin
  insert into public.profiles (id, full_name, email, role, wallet_balance)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    v_role,
    case v_role
      when 'consumer' then 2500
      when 'prosumer' then 1000
      else 0
    end
  );
  return new;
end;
$$;

-- 5. get_wallet_balance() — the only way a client reads a wallet ----------
-- Returns the CALLER's own balance only. SECURITY DEFINER lets it read the
-- wallet_balance column even though step 3 revoked direct SELECT on it.
create or replace function public.get_wallet_balance()
returns numeric
language sql
security definer
set search_path = public
stable
as $$
  select wallet_balance from public.profiles where id = auth.uid();
$$;

grant execute on function public.get_wallet_balance() to authenticated;

-- 6. purchase_energy() — extended to move wallet balances atomically ------
-- Same signature and same up-front validation as Phase 5. The purchase
-- price is still the seller's stored price_per_kwh (Phase 6's dynamic
-- market price is informational only and was never used here — unchanged).
-- New: buyer/seller wallet rows are locked (in a fixed id order, so two
-- purchases between the same two users can never deadlock each other),
-- the buyer's balance is checked, and both balances move in the SAME
-- transaction as the listing/transaction updates. Any failure anywhere in
-- this function rolls back everything in it — there is no path that debits
-- a buyer without crediting a seller, or that touches balances without
-- also recording the transaction.
create or replace function public.purchase_energy(p_listing_id uuid, p_amount numeric)
returns public.transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_listing public.energy_listings%rowtype;
  v_buyer_id uuid := auth.uid();
  v_seller_id uuid;
  v_total numeric;
  v_new_remaining numeric;
  v_transaction public.transactions%rowtype;
  v_buyer_balance numeric;
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

  v_seller_id := v_listing.seller_id;
  v_total := p_amount * v_listing.price_per_kwh;

  -- Lock both wallets in a fixed order (lowest id first) to avoid deadlocks
  -- against a concurrent purchase running the other direction between the
  -- same two users.
  if v_buyer_id < v_seller_id then
    perform 1 from public.profiles where id = v_buyer_id for update;
    perform 1 from public.profiles where id = v_seller_id for update;
  else
    perform 1 from public.profiles where id = v_seller_id for update;
    perform 1 from public.profiles where id = v_buyer_id for update;
  end if;

  select wallet_balance into v_buyer_balance
  from public.profiles
  where id = v_buyer_id;

  if v_buyer_balance is null then
    raise exception 'Wallet not found for buyer.';
  end if;

  if v_buyer_balance < v_total then
    raise exception 'Insufficient demo wallet balance.';
  end if;

  v_new_remaining := v_listing.remaining_energy - p_amount;

  update public.profiles set wallet_balance = wallet_balance - v_total where id = v_buyer_id;
  update public.profiles set wallet_balance = wallet_balance + v_total where id = v_seller_id;

  insert into public.transactions
    (buyer_id, seller_id, listing_id, energy_amount, price_per_kwh, total_amount, status)
  values
    (v_buyer_id, v_seller_id, v_listing.id, p_amount, v_listing.price_per_kwh, v_total, 'completed')
  returning * into v_transaction;

  update public.energy_listings
  set remaining_energy = v_new_remaining,
      status = case when v_new_remaining <= 0 then 'sold' else 'available' end
  where id = v_listing.id;

  return v_transaction;
end;
$$;

grant execute on function public.purchase_energy(uuid, numeric) to authenticated;
