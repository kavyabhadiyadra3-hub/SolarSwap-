-- SolarSwap · Phase 4 · Supabase Auth setup
-- Run this once in your Supabase project's SQL editor (Dashboard -> SQL Editor -> New query).

-- 1. A small "profiles" table that stores app-specific info Supabase
--    Auth doesn't store itself: full name and role.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null check (role in ('prosumer', 'consumer', 'admin')),
  created_at timestamptz not null default now()
);

-- 2. Row Level Security: users may only read/update their own profile.
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 3. Auto-create a profile row whenever someone signs up, using the
--    full_name/role passed in from the Register page. This runs with
--    elevated privileges (security definer) so it works even though the
--    new user has no session yet at the moment their row is created.
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
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
