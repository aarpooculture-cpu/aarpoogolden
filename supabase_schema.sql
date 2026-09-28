-- =========================================================================
-- Supabase SQL Schema for Aarpoo Irroo Platform (4 Core Tables)
-- =========================================================================
-- Run this script in your Supabase SQL Editor:
-- 1. Go to https://app.supabase.com/ project dashboard
-- 2. Click "SQL Editor" in the left navigation
-- 3. Paste this script and click "Run"

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Events Table (PK: event_id)
CREATE TABLE IF NOT EXISTS public.events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    venue VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    price_in_paise INT NOT NULL DEFAULT 59900, -- ₹599.00
    total_capacity INT NOT NULL DEFAULT 350,
    available_capacity INT NOT NULL DEFAULT 350,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tickets Table (PK: ticket_id, Serial: ticket_number, Invoicing & Email Hooks)
CREATE TABLE IF NOT EXISTS public.tickets (
    ticket_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(50) NOT NULL UNIQUE, -- Human-readable serial (e.g. ARPOO-VOL2-1001)
    event_id UUID REFERENCES public.events(event_id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    seats INT NOT NULL DEFAULT 1,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed', -- 'confirmed', 'cancelled', 'refunded'
    
    -- Invoicing & Email Delivery Placeholder Columns (Future Stubs)
    invoice_id VARCHAR(100),
    invoice_url TEXT,
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Payment Transactions Table (PK: transaction_id, FK: ticket_id)
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES public.tickets(ticket_id) ON DELETE SET NULL,
    razorpay_order_id VARCHAR(100) NOT NULL,
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) NOT NULL DEFAULT 'created', -- 'created', 'paid', 'signature_mismatch', 'failed'
    raw_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Inquiries Table (PK: inquiry_id, Handles Contact & Partner Submissions)
CREATE TABLE IF NOT EXISTS public.inquiries (
    inquiry_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inquiry_type VARCHAR(50) NOT NULL DEFAULT 'contact', -- 'contact' or 'partner'
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    brand_name VARCHAR(255),
    partner_type VARCHAR(100),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Flagship Event (Aarpoo Vol. 02 Thane)
INSERT INTO public.events (slug, title, description, date, venue, location, price_in_paise, total_capacity, available_capacity, status)
VALUES (
    'aarpoo-vol-02',
    'Aarpoo Vol. 02 — Thane',
    'A full-throttle Malayali night — standup comedy, live flute, vocals, and DJ afterparty.',
    '2026-08-09 19:30:00+05:30',
    'De Aura — Global Dining & Bar',
    'Majiwada, Thane West, Mumbai',
    59900,
    350,
    350,
    'active'
)
ON CONFLICT (slug) DO UPDATE SET
    price_in_paise = EXCLUDED.price_in_paise,
    total_capacity = EXCLUDED.total_capacity;

-- Enable Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active events
CREATE POLICY "Allow public read access to events" ON public.events FOR SELECT USING (true);

-- Allow service_role full access to all tables
CREATE POLICY "Allow service_role full access to events" ON public.events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow service_role full access to tickets" ON public.tickets FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow service_role full access to payment_transactions" ON public.payment_transactions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow service_role full access to inquiries" ON public.inquiries FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Fast Query Indexes
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events (slug);
CREATE INDEX IF NOT EXISTS idx_tickets_number ON public.tickets (ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_email ON public.tickets (customer_email);
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON public.payment_transactions (razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON public.inquiries (email);
