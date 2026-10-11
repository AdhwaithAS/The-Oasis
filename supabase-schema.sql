-- ==============================================================================
-- HOTEL RESERVATION SYSTEM - COMPLETE SUPABASE POSTGRESQL SCHEMA
-- ==============================================================================
-- Description:
--   Complete database schema for Supabase:
--   - PostgreSQL Tables (rooms, customers, reservations, user_profiles, audit_logs)
--   - Supabase Auth Integration (automatic user profile creation trigger)
--   - Role-Based Access Control (RBAC) via Row-Level Security (RLS) policies
--   - Initial seed data matching the Hotel Reservation System inventory
--
-- Instructions:
--   1. Open your Supabase Dashboard: https://supabase.com/dashboard
--   2. Navigate to: SQL Editor (left sidebar) -> New Query
--   3. Paste this entire script and click "RUN"
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CORE DOMAIN TABLES
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 2.1 ROOMS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rooms (
    room_number VARCHAR(20) PRIMARY KEY,
    room_type VARCHAR(50) NOT NULL CHECK (room_type IN ('Standard', 'Suite')),
    base_price_per_night NUMERIC(10, 2) NOT NULL CHECK (base_price_per_night >= 0),
    capacity INT NOT NULL DEFAULT 2 CHECK (capacity > 0),
    is_available BOOLEAN NOT NULL DEFAULT true,
    description TEXT DEFAULT '',
    tax_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.10,
    luxury_service_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2.2 CUSTOMERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2.3 RESERVATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reservations (
    reservation_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) REFERENCES public.customers(id) ON DELETE SET NULL,
    room_number VARCHAR(20) REFERENCES public.rooms(room_number) ON DELETE RESTRICT,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL CHECK (check_out_date > check_in_date),
    status VARCHAR(30) NOT NULL DEFAULT 'BOOKED' CHECK (status IN ('BOOKED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED')),
    number_of_nights INT NOT NULL DEFAULT 1 CHECK (number_of_nights > 0),
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    special_requests TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2.4 USER PROFILES TABLE (Supabase Auth Integration & RBAC)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(150) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) DEFAULT '',
    role VARCHAR(20) NOT NULL DEFAULT 'GUEST' CHECK (role IN ('ADMIN', 'STAFF', 'GUEST')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2.5 AUDIT LOGS TABLE (Security & Action Tracking)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    action VARCHAR(100) NOT NULL,
    actor_email VARCHAR(150) DEFAULT 'anonymous',
    actor_role VARCHAR(20) DEFAULT 'ANON',
    target_resource VARCHAR(100) DEFAULT '',
    details TEXT DEFAULT '',
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS'
);

-- ==============================================================================
-- 3. INDEXES FOR HIGH QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_rooms_is_available ON public.rooms(is_available);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON public.rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON public.reservations(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_customer ON public.reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_room ON public.reservations(room_number);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- ==============================================================================
-- 4. AUTOMATED TRIGGERS
-- ==============================================================================

-- 4.1 Update timestamp auto-handler
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_rooms_updated_at ON public.rooms;
CREATE TRIGGER trg_rooms_updated_at
    BEFORE UPDATE ON public.rooms
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_customers_updated_at ON public.customers;
CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_reservations_updated_at ON public.reservations;
CREATE TRIGGER trg_reservations_updated_at
    BEFORE UPDATE ON public.reservations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4.2 Auto-create user profile from Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_auth_user_signup()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, name, phone, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(UPPER(NEW.raw_user_meta_data->>'role'), 'GUEST')
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_signup();

-- ==============================================================================
-- 5. ROW-LEVEL SECURITY (RLS) & RBAC POLICIES
-- ==============================================================================
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 5.1 Service Role: Full access for server-side backend operations
CREATE POLICY "Service role full access on rooms"
    ON public.rooms FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on customers"
    ON public.customers FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on reservations"
    ON public.reservations FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on user_profiles"
    ON public.user_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on audit_logs"
    ON public.audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 5.2 Public / Authenticated read access on Rooms
CREATE POLICY "Public read access on rooms"
    ON public.rooms FOR SELECT TO anon, authenticated USING (true);

-- 5.3 Customers: Authenticated users can view customer profiles
CREATE POLICY "Authenticated users view customers"
    ON public.customers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow public customer creation"
    ON public.customers FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 5.4 Reservations: Users can view their own reservations; Admins/Staff view all
CREATE POLICY "Users read reservations"
    ON public.reservations FOR SELECT TO authenticated
    USING (
        customer_id IN (SELECT id FROM public.customers WHERE email = auth.jwt()->>'email')
        OR (auth.jwt()->>'role' IN ('ADMIN', 'STAFF'))
    );

CREATE POLICY "Users insert reservations"
    ON public.reservations FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 5.5 User Profiles: Users can view and update their own profile; Admins view all
CREATE POLICY "Users view own profile"
    ON public.user_profiles FOR SELECT TO authenticated
    USING (id = auth.uid() OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'ADMIN');

CREATE POLICY "Users update own profile"
    ON public.user_profiles FOR UPDATE TO authenticated
    USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- 5.6 Audit Logs: Read restricted to Admins
CREATE POLICY "Admins view audit logs"
    ON public.audit_logs FOR SELECT TO authenticated
    USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'ADMIN');

-- ==============================================================================
-- 6. INITIAL SYSTEM CONFIGURATION (NO DUMMY DATA)
-- ==============================================================================
-- Physical room inventory definition (Standard & Suite models)
INSERT INTO public.rooms (room_number, room_type, base_price_per_night, capacity, is_available, description, tax_rate, luxury_service_fee, amenities)
VALUES
('101', 'Standard', 110.00, 2, true, 'Comfort Queen Room on 1st Floor overlooking courtyard garden.', 0.10, 0.00, ARRAY['Wi-Fi', 'Courtyard View', 'Queen Bed', 'Smart TV']),
('102', 'Standard', 110.00, 2, true, 'Deluxe Twin Queen Beds with ergonomic workspace and coffee bar.', 0.10, 0.00, ARRAY['Wi-Fi', 'Ergonomic Desk', 'Coffee Bar', 'Air Conditioning']),
('103', 'Standard', 115.00, 2, true, 'Quiet Standard Corner Room with extra natural sunlight and desk.', 0.10, 0.00, ARRAY['Wi-Fi', 'Corner View', 'Desk', 'Mini Bar']),
('104', 'Standard', 120.00, 2, true, 'Accessible Ground Floor Standard Room with walk-in shower.', 0.10, 0.00, ARRAY['Wi-Fi', 'Accessible Bathroom', 'Ground Floor', 'Smart TV']),
('201', 'Suite', 240.00, 4, true, 'Executive Presidential Suite with private jacuzzi and skyline terrace.', 0.14, 25.00, ARRAY['King Bed', 'Private Jacuzzi', 'Skyline Terrace', 'Butler Service', 'Complimentary Champagne']),
('202', 'Suite', 230.00, 4, true, 'Royal Penthouse Suite with master king bed, lounge bar, and butler access.', 0.14, 25.00, ARRAY['King Bed', 'Lounge Bar', 'Panoramic Balcony', 'Jacuzzi Tub', 'VIP Concierge']),
('203', 'Suite', 220.00, 3, true, 'Family Grand Suite with dual balconies, jacuzzi tub, and kid''s lounge.', 0.14, 25.00, ARRAY['King Bed', 'Twin Beds', 'Dual Balconies', 'Jacuzzi Tub', 'Gaming Console'])
ON CONFLICT (room_number) DO UPDATE
SET base_price_per_night = EXCLUDED.base_price_per_night,
    capacity = EXCLUDED.capacity,
    description = EXCLUDED.description,
    amenities = EXCLUDED.amenities;

-- System Audit Initialization
INSERT INTO public.audit_logs (action, actor_email, actor_role, target_resource, details, status)
VALUES
('SYSTEM_INITIALIZE', 'system', 'ADMIN', 'DATABASE', 'Supabase PostgreSQL Schema initialized successfully. Zero dummy reservations/customers.', 'SUCCESS');

-- Note: All customer profiles, reservations, and user accounts are created solely via live API requests.
-- If you need to clear previously inserted test records, run:
--   TRUNCATE TABLE public.reservations CASCADE;
--   TRUNCATE TABLE public.customers CASCADE;

SELECT 'Clean Supabase Schema Applied Successfully - Ready for Live API Data!' AS status;
