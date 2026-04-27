-- =============================================================================
-- UrbanEase — Complete Database Seed
-- Paste this entire file into Supabase SQL Editor and click Run.
-- Password for all demo accounts: Demo@1234
-- =============================================================================

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================================
-- SECTION 1: TABLE DEFINITIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text NOT NULL DEFAULT '',
  email       text NOT NULL DEFAULT '',
  phone       text,
  avatar_url  text,
  role        text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'provider', 'admin')),
  created_at  timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.services (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  description      text NOT NULL DEFAULT '',
  category         text NOT NULL,
  base_price       numeric NOT NULL DEFAULT 0,
  duration_minutes integer NOT NULL DEFAULT 60,
  thumbnail_url    text NOT NULL DEFAULT '',
  is_active        boolean NOT NULL DEFAULT true,
  avg_rating       numeric,
  total_reviews    integer,
  badge            text CHECK (badge IN ('Top Rated', 'New', 'Popular'))
);

CREATE TABLE IF NOT EXISTS public.providers (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name             text NOT NULL,
  bio              text NOT NULL DEFAULT '',
  avatar_url       text NOT NULL DEFAULT '',
  experience_years integer NOT NULL DEFAULT 1,
  avg_rating       numeric NOT NULL DEFAULT 0,
  total_reviews    integer NOT NULL DEFAULT 0,
  skills           text[] NOT NULL DEFAULT '{}',
  is_verified      boolean NOT NULL DEFAULT false,
  lat              numeric,
  lng              numeric,
  city             text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS public.addresses (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label      text NOT NULL CHECK (label IN ('Home', 'Work', 'Other')),
  line1      text NOT NULL,
  city       text NOT NULL,
  pincode    text NOT NULL,
  lat        numeric,
  lng        numeric,
  is_default boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id  uuid REFERENCES public.providers(id) ON DELETE SET NULL,
  service_id   uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  address_id   uuid REFERENCES public.addresses(id) ON DELETE SET NULL,
  scheduled_at timestamptz NOT NULL,
  status       text NOT NULL DEFAULT 'Pending'
               CHECK (status IN ('Pending','Confirmed','Rejected','Pro Assigned',
                                 'On the Way','Arrived','In Progress','Completed','Cancelled')),
  total_price  numeric NOT NULL DEFAULT 0,
  otp          text,
  created_at   timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.provider_availability (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id  uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  day_of_week  integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  time_slot    text NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  UNIQUE (provider_id, day_of_week, time_slot)
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  rating      integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- SECTION 2: AUTO-PROFILE TRIGGER
-- Whenever a new auth user signs up, auto-create a profiles row.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, created_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.email, ''),
    COALESCE(new.raw_user_meta_data->>'role', 'customer'),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- SECTION 3: DEMO AUTH USERS
-- Uses a helper function (SECURITY DEFINER = runs as postgres superuser).
-- Password for all: Demo@1234
-- =============================================================================

CREATE OR REPLACE FUNCTION public._create_demo_user(
  _id        uuid,
  _email     text,
  _full_name text,
  _role      text,
  _days_ago  integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Skip if user already exists with this email
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = _email) THEN
    -- Update metadata so role is always correct
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_build_object('full_name', _full_name, 'role', _role),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE email = _email;
    RETURN;
  END IF;

  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id, id, aud, role, email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token,
    is_sso_user
  ) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    _id,
    'authenticated',
    'authenticated',
    _email,
    crypt('Demo@1234', gen_salt('bf')),
    NOW(),                                   -- email_confirmed_at = confirmed immediately
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', _full_name, 'role', _role),
    false,
    NOW() - (_days_ago || ' days')::interval,
    NOW(),
    '', '', '', '',
    false
  );

  -- Insert identity record (required for email/password login)
  INSERT INTO auth.identities (
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at,
    provider_id
  ) VALUES (
    _id,
    jsonb_build_object('sub', _id::text, 'email', _email),
    'email',
    NOW(),
    NOW(),
    NOW(),
    _email
  )
  ON CONFLICT DO NOTHING;
END;
$$;

-- Create 5 demo accounts
SELECT public._create_demo_user(
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'customer1@demo.urbanease.in', 'Priya Sharma', 'customer', 30);

SELECT public._create_demo_user(
  'a0000000-0000-0000-0000-000000000002'::uuid,
  'customer2@demo.urbanease.in', 'Rahul Desai', 'customer', 25);

SELECT public._create_demo_user(
  'a0000000-0000-0000-0000-000000000003'::uuid,
  'provider1@demo.urbanease.in', 'Meera Sharma', 'provider', 60);

SELECT public._create_demo_user(
  'a0000000-0000-0000-0000-000000000004'::uuid,
  'provider2@demo.urbanease.in', 'Rajan Mehta', 'provider', 55);

SELECT public._create_demo_user(
  'a0000000-0000-0000-0000-000000000005'::uuid,
  'admin@demo.urbanease.in', 'Admin User', 'admin', 90);

-- Clean up helper (optional — keeps schema clean)
DROP FUNCTION IF EXISTS public._create_demo_user;

-- =============================================================================
-- SECTION 4: PROFILES (explicit insert — trigger also handles future signups)
-- =============================================================================

INSERT INTO public.profiles (id, full_name, email, role, created_at) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Priya Sharma',  'customer1@demo.urbanease.in', 'customer', NOW() - interval '30 days'),
  ('a0000000-0000-0000-0000-000000000002', 'Rahul Desai',   'customer2@demo.urbanease.in', 'customer', NOW() - interval '25 days'),
  ('a0000000-0000-0000-0000-000000000003', 'Meera Sharma',  'provider1@demo.urbanease.in', 'provider', NOW() - interval '60 days'),
  ('a0000000-0000-0000-0000-000000000004', 'Rajan Mehta',   'provider2@demo.urbanease.in', 'provider', NOW() - interval '55 days'),
  ('a0000000-0000-0000-0000-000000000005', 'Admin User',    'admin@demo.urbanease.in',     'admin',    NOW() - interval '90 days')
ON CONFLICT (id) DO UPDATE SET
  full_name  = EXCLUDED.full_name,
  email      = EXCLUDED.email,
  role       = EXCLUDED.role;

-- =============================================================================
-- SECTION 5: SERVICES (9 services)
-- =============================================================================

INSERT INTO public.services (id, name, description, category, base_price, duration_minutes, thumbnail_url, is_active, avg_rating, total_reviews, badge) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Full Body Waxing',
   'Complete body waxing session by certified female beauty professionals at your home. Includes pre and post care.',
   'Beauty', 599, 90, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop',
   true, 4.8, 1240, 'Top Rated'),
  ('c0000000-0000-0000-0000-000000000002', 'Deep Home Cleaning',
   'Top-to-bottom professional home cleaning with eco-friendly products. Includes kitchen, bathrooms, bedrooms.',
   'Cleaning', 1199, 180, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
   true, 4.7, 3420, 'Popular'),
  ('c0000000-0000-0000-0000-000000000003', 'AC Service & Repair',
   'Comprehensive AC maintenance, gas recharge, filter cleaning, and repair by certified technicians.',
   'Appliance Repair', 799, 60, 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop',
   true, 4.6, 2180, 'Top Rated'),
  ('c0000000-0000-0000-0000-000000000004', 'Plumbing Repair',
   'Fix leaks, pipe blockages, tap repairs, and bathroom fittings by expert plumbers.',
   'Plumbing', 499, 60, 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=300&fit=crop',
   true, 4.5, 980, NULL),
  ('c0000000-0000-0000-0000-000000000005', 'Electrical Work',
   'Wiring, switchboard repair, fan installation, and electrical safety inspection by licensed electricians.',
   'Electrical', 399, 45, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
   true, 4.7, 1560, NULL),
  ('c0000000-0000-0000-0000-000000000006', 'Home Painting',
   'Interior and exterior painting with premium quality paints. Includes wall preparation and two coats.',
   'Painting', 3999, 480, 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop',
   true, 4.6, 720, 'New'),
  ('c0000000-0000-0000-0000-000000000007', 'Pest Control',
   'General pest control treatment covering cockroaches, ants, bed bugs, and rodents. Safe for kids and pets.',
   'Pest Control', 999, 120, 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
   true, 4.4, 1890, NULL),
  ('c0000000-0000-0000-0000-000000000008', 'Salon at Home',
   'Complete salon experience at your doorstep — haircut, styling, facial, and more by certified stylists.',
   'Beauty', 699, 120, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop',
   true, 4.9, 4230, 'Top Rated'),
  ('c0000000-0000-0000-0000-000000000009', 'Yoga & Wellness Session',
   'Personal yoga, meditation, and wellness coaching at your home by certified wellness experts.',
   'Wellness', 899, 60, 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=400&h=300&fit=crop',
   true, 4.8, 650, 'New')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- SECTION 6: PROVIDERS
-- =============================================================================

INSERT INTO public.providers (id, user_id, name, bio, avatar_url, experience_years, avg_rating, total_reviews, skills, is_verified, lat, lng, city) VALUES
  ('d0000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000003',
   'Meera Sharma',
   'Certified beauty professional with 6 years of experience. Specialized in bridal makeup and skin care treatments.',
   'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
   6, 4.9, 312,
   ARRAY['Waxing', 'Facial', 'Bridal Makeup', 'Hair Styling', 'Skin Care'],
   true, 23.0225, 72.5714, 'Ahmedabad'),
  ('d0000000-0000-0000-0000-000000000002',
   'a0000000-0000-0000-0000-000000000004',
   'Rajan Mehta',
   'Expert plumber with 8 years in residential and commercial plumbing. Handles all kinds of pipe work and sanitary fittings.',
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
   8, 4.6, 178,
   ARRAY['Pipe Repair', 'Tap Installation', 'Drainage', 'Water Heater', 'Bathroom Fittings'],
   true, 23.0350, 72.5800, 'Ahmedabad'),
  ('d0000000-0000-0000-0000-000000000003',
   NULL,
   'Sunil Patel',
   'Licensed electrician with 5 years of experience in residential wiring and electrical repairs.',
   'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
   5, 4.7, 234,
   ARRAY['Wiring', 'Fan Installation', 'Switchboard Repair', 'MCB/RCB', 'Safety Audit'],
   true, 23.0100, 72.5600, 'Ahmedabad'),
  ('d0000000-0000-0000-0000-000000000004',
   NULL,
   'Priya Joshi',
   'Professional house cleaner specializing in deep cleaning, kitchen sanitization, and post-renovation cleanup.',
   'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
   4, 4.8, 421,
   ARRAY['Deep Cleaning', 'Kitchen Cleaning', 'Bathroom Sanitization', 'Floor Polishing', 'Window Cleaning'],
   true, 23.0450, 72.5900, 'Ahmedabad')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- SECTION 7: ADDRESSES
-- =============================================================================

INSERT INTO public.addresses (id, user_id, label, line1, city, pincode, lat, lng, is_default) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'Home', '12, Shyamal Row Houses, Satellite', 'Ahmedabad', '380015', 23.0225, 72.5714, true),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   'Work', '3rd Floor, Pinnacle Business Park, SG Highway', 'Ahmedabad', '380060', 23.0580, 72.5150, false),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002',
   'Home', '7, Bodakdev Society, Near Judges Bungalow', 'Ahmedabad', '380054', 23.0445, 72.5160, true),
  ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002',
   'Work', 'GIFT City, Block 12, Sector 11', 'Gandhinagar', '382355', 23.1678, 72.6704, false)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- SECTION 8: BOOKINGS (8 bookings across every status)
-- =============================================================================

INSERT INTO public.bookings (id, customer_id, provider_id, service_id, address_id, scheduled_at, status, total_price, otp, created_at) VALUES
  -- Pending: no provider assigned
  ('f0000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000001', NULL,
   'c0000000-0000-0000-0000-000000000008',
   'e0000000-0000-0000-0000-000000000001',
   NOW() + interval '2 days', 'Pending', 748, NULL, NOW() - interval '1 hour'),
  -- Confirmed: provider1 accepted
  ('f0000000-0000-0000-0000-000000000002',
   'a0000000-0000-0000-0000-000000000001',
   'd0000000-0000-0000-0000-000000000001',
   'c0000000-0000-0000-0000-000000000001',
   'e0000000-0000-0000-0000-000000000001',
   NOW() + interval '3 days', 'Confirmed', 648, NULL, NOW() - interval '2 hours'),
  -- On the Way: provider2
  ('f0000000-0000-0000-0000-000000000003',
   'a0000000-0000-0000-0000-000000000001',
   'd0000000-0000-0000-0000-000000000002',
   'c0000000-0000-0000-0000-000000000004',
   'e0000000-0000-0000-0000-000000000002',
   NOW() + interval '1 hour', 'On the Way', 548, '7293', NOW() - interval '3 hours'),
  -- Completed + reviewed
  ('f0000000-0000-0000-0000-000000000004',
   'a0000000-0000-0000-0000-000000000001',
   'd0000000-0000-0000-0000-000000000001',
   'c0000000-0000-0000-0000-000000000002',
   'e0000000-0000-0000-0000-000000000001',
   NOW() - interval '5 days', 'Completed', 1248, NULL, NOW() - interval '7 days'),
  -- Cancelled
  ('f0000000-0000-0000-0000-000000000005',
   'a0000000-0000-0000-0000-000000000001', NULL,
   'c0000000-0000-0000-0000-000000000005',
   'e0000000-0000-0000-0000-000000000001',
   NOW() + interval '5 days', 'Cancelled', 448, NULL, NOW() - interval '4 hours'),
  -- Pending: customer2
  ('f0000000-0000-0000-0000-000000000006',
   'a0000000-0000-0000-0000-000000000002', NULL,
   'c0000000-0000-0000-0000-000000000007',
   'e0000000-0000-0000-0000-000000000003',
   NOW() + interval '4 days', 'Pending', 1048, NULL, NOW() - interval '30 minutes'),
  -- Completed: customer2
  ('f0000000-0000-0000-0000-000000000007',
   'a0000000-0000-0000-0000-000000000002',
   'd0000000-0000-0000-0000-000000000001',
   'c0000000-0000-0000-0000-000000000008',
   'e0000000-0000-0000-0000-000000000003',
   NOW() - interval '10 days', 'Completed', 748, NULL, NOW() - interval '12 days'),
  -- Rejected: customer2
  ('f0000000-0000-0000-0000-000000000008',
   'a0000000-0000-0000-0000-000000000002',
   'd0000000-0000-0000-0000-000000000002',
   'c0000000-0000-0000-0000-000000000009',
   'e0000000-0000-0000-0000-000000000004',
   NOW() + interval '6 days', 'Rejected', 948, NULL, NOW() - interval '6 hours')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- SECTION 9: REVIEWS
-- =============================================================================

INSERT INTO public.reviews (id, booking_id, customer_id, provider_id, rating, comment, created_at) VALUES
  ('g0000000-0000-0000-0000-000000000001',
   'f0000000-0000-0000-0000-000000000004',
   'a0000000-0000-0000-0000-000000000001',
   'd0000000-0000-0000-0000-000000000001',
   5,
   'Meera was absolutely professional! She was on time, used quality products, and the results were amazing. Highly recommended!',
   NOW() - interval '4 days'),
  ('g0000000-0000-0000-0000-000000000002',
   'f0000000-0000-0000-0000-000000000007',
   'a0000000-0000-0000-0000-000000000002',
   'd0000000-0000-0000-0000-000000000001',
   5,
   'Best salon at home experience. Loved every bit of it! Will definitely book again.',
   NOW() - interval '9 days')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- SECTION 10: PROVIDER AVAILABILITY (Mon–Fri, 9am–5pm)
-- =============================================================================

INSERT INTO public.provider_availability (provider_id, day_of_week, time_slot, is_available)
SELECT p.id, d.day, t.slot, true
FROM
  (VALUES ('d0000000-0000-0000-0000-000000000001'::uuid),
          ('d0000000-0000-0000-0000-000000000002'::uuid)) AS p(id),
  (VALUES (1),(2),(3),(4),(5))                           AS d(day),
  (VALUES ('09:00'),('10:00'),('11:00'),('12:00'),('13:00'),
          ('14:00'),('15:00'),('16:00'),('17:00'))        AS t(slot)
ON CONFLICT (provider_id, day_of_week, time_slot) DO NOTHING;

-- =============================================================================
-- DONE — Verify:
--   SELECT email, email_confirmed_at IS NOT NULL as confirmed FROM auth.users WHERE email LIKE '%@demo.urbanease.in';
--   SELECT COUNT(*) FROM public.profiles;   -- 5
--   SELECT COUNT(*) FROM public.services;   -- 9
--   SELECT COUNT(*) FROM public.providers;  -- 4
--   SELECT COUNT(*) FROM public.bookings;   -- 8
-- =============================================================================
