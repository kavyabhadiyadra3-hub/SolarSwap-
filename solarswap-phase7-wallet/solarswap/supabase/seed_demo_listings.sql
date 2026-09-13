-- SolarSwap Demo Seed: Fictional Prosumers & Energy Listings
-- Idempotent: Uses ON CONFLICT (id) DO NOTHING so it can be re-run safely.

-- 1. Create fictional demo prosumers in auth.users
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    'a1111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'demo.aarav@solarswap.local',
    '',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Aarav Patel (Rooftop Solar)","role":"prosumer"}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a2222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'demo.diya@solarswap.local',
    '',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Diya Sharma (Solar Haven)","role":"prosumer"}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a3333333-3333-3333-3333-333333333333',
    'authenticated',
    'authenticated',
    'demo.rohan@solarswap.local',
    '',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Rohan Mehta (CleanGrid Micro)","role":"prosumer"}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a4444444-4444-4444-4444-444444444444',
    'authenticated',
    'authenticated',
    'demo.ananya@solarswap.local',
    '',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Ananya Desai (EcoSun Villa)","role":"prosumer"}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a5555555-5555-5555-5555-555555555555',
    'authenticated',
    'authenticated',
    'demo.vikram@solarswap.local',
    '',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Vikram Joshi (SunPower Coop)","role":"prosumer"}',
    now(),
    now()
  )
on conflict (id) do nothing;

-- 2. Ensure corresponding profiles exist in public.profiles
insert into public.profiles (id, full_name, email, role)
values
  ('a1111111-1111-1111-1111-111111111111', 'Aarav Patel (Rooftop Solar)', 'demo.aarav@solarswap.local', 'prosumer'),
  ('a2222222-2222-2222-2222-222222222222', 'Diya Sharma (Solar Haven)', 'demo.diya@solarswap.local', 'prosumer'),
  ('a3333333-3333-3333-3333-333333333333', 'Rohan Mehta (CleanGrid Micro)', 'demo.rohan@solarswap.local', 'prosumer'),
  ('a4444444-4444-4444-4444-444444444444', 'Ananya Desai (EcoSun Villa)', 'demo.ananya@solarswap.local', 'prosumer'),
  ('a5555555-5555-5555-5555-555555555555', 'Vikram Joshi (SunPower Coop)', 'demo.vikram@solarswap.local', 'prosumer')
on conflict (id) do nothing;

-- 3. Insert 8 realistic fictional demo energy listings
insert into public.energy_listings (
  id, seller_id, energy_amount, remaining_energy, price_per_kwh,
  location, availability_date, status, created_at
)
values
  (
    'd1111111-0000-0000-0000-000000000001',
    'a1111111-1111-1111-1111-111111111111',
    45.0,
    45.0,
    5.60,
    'Ahmedabad (Bopal Solar Hub)',
    current_date,
    'available',
    now() - interval '2 hours'
  ),
  (
    'd1111111-0000-0000-0000-000000000002',
    'a1111111-1111-1111-1111-111111111111',
    80.0,
    65.0,
    5.80,
    'Ahmedabad (SG Highway)',
    current_date,
    'available',
    now() - interval '5 hours'
  ),
  (
    'd1111111-0000-0000-0000-000000000003',
    'a2222222-2222-2222-2222-222222222222',
    60.0,
    60.0,
    5.40,
    'Gandhinagar (Infocity Greens)',
    current_date,
    'available',
    now() - interval '8 hours'
  ),
  (
    'd1111111-0000-0000-0000-000000000004',
    'a2222222-2222-2222-2222-222222222222',
    35.0,
    25.0,
    6.20,
    'Gandhinagar (Sector 14)',
    current_date + 1,
    'available',
    now() - interval '12 hours'
  ),
  (
    'd1111111-0000-0000-0000-000000000005',
    'a3333333-3333-3333-3333-333333333333',
    100.0,
    100.0,
    6.00,
    'Vadodara (Alkapuri Solar)',
    current_date,
    'available',
    now() - interval '1 day'
  ),
  (
    'd1111111-0000-0000-0000-000000000006',
    'a4444444-4444-4444-4444-444444444444',
    50.0,
    35.0,
    5.75,
    'Surat (Adajan Rooftop)',
    current_date,
    'available',
    now() - interval '1 day 4 hours'
  ),
  (
    'd1111111-0000-0000-0000-000000000007',
    'a4444444-4444-4444-4444-444444444444',
    120.0,
    120.0,
    6.50,
    'Surat (Vesu Eco-Residences)',
    current_date + 2,
    'available',
    now() - interval '1 day 10 hours'
  ),
  (
    'd1111111-0000-0000-0000-000000000008',
    'a5555555-5555-5555-5555-555555555555',
    75.0,
    75.0,
    6.10,
    'Ahmedabad (Satellite West)',
    current_date,
    'available',
    now() - interval '2 days'
  )
on conflict (id) do nothing;
