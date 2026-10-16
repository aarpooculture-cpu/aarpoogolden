-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Events Table
CREATE TABLE public.events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    short_description TEXT,
    description TEXT,
    hero_image_url TEXT,
    hero_video_url TEXT,
    venue_name VARCHAR(255),
    venue_address TEXT,
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    lineup JSONB NOT NULL DEFAULT '[]'::jsonb,
    highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
    gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
    price_in_paise INTEGER NOT NULL DEFAULT 39900,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    is_published BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Event-specific Ticket Types
CREATE TABLE public.ticket_types (
    ticket_type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(event_id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_in_paise INTEGER NOT NULL CHECK (price_in_paise >= 0),
    inventory_total INTEGER NOT NULL DEFAULT 0 CHECK (inventory_total >= 0),
    inventory_booked INTEGER NOT NULL DEFAULT 0 CHECK (inventory_booked >= 0),
    inventory_left INTEGER NOT NULL DEFAULT 0 CHECK (inventory_left >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    sales_start TIMESTAMP WITH TIME ZONE,
    sales_end TIMESTAMP WITH TIME ZONE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (event_id, code)
);

CREATE INDEX ticket_types_event_status_sort_idx
    ON public.ticket_types (event_id, status, sort_order);

-- 3. Inquiries Table (for Partners and Contact forms)
CREATE TABLE public.inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inquiry_type VARCHAR(50) NOT NULL DEFAULT 'contact', -- 'contact', 'partner', etc.
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    brand_name VARCHAR(255),
    partner_type VARCHAR(100),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tickets Table
CREATE TABLE public.tickets (
    ticket_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(100) UNIQUE NOT NULL,
    event_id UUID REFERENCES public.events(event_id) ON DELETE CASCADE,
    ticket_type_id UUID REFERENCES public.ticket_types(ticket_type_id) ON DELETE SET NULL,
    ticket_type_name VARCHAR(255),
    unit_price_in_paise INTEGER CHECK (unit_price_in_paise IS NULL OR unit_price_in_paise >= 0),
    customer_name VARCHAR(255),
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    seats INTEGER NOT NULL DEFAULT 1,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
    invoice_id VARCHAR(255),
    invoice_url TEXT,
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Payment Transactions Table
CREATE TABLE public.payment_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    razorpay_order_id VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(50) NOT NULL DEFAULT 'created', -- 'created', 'paid', 'signature_mismatch', 'failed'
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(255),
    ticket_id UUID REFERENCES public.tickets(ticket_id) ON DELETE SET NULL,
    raw_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert dummy event to match fallback in code
INSERT INTO public.events (event_id, slug, title, price_in_paise, status)
VALUES (
    '00000000-0000-0000-0000-000000000003', 
    'aarpoo-vol-03', 
    'Aarpoo Vol. 03 — Mumbai',
    39900, 
    'active'
) ON CONFLICT (event_id) DO NOTHING;

INSERT INTO public.ticket_types (event_id, code, name, description, price_in_paise, inventory_total, inventory_booked, inventory_left, status, sort_order)
VALUES
    ('00000000-0000-0000-0000-000000000003', 'normal-early-bird', 'Normal — Early Bird', 'Get in early and secure your entry at the lowest price. Additional ₹500 venue cover charge per person, payable at the venue and 100% redeemable on food and beverages.', 39900, 50, 32, 18, 'disabled', 10),
    ('00000000-0000-0000-0000-000000000003', 'normal-phase-1', 'Normal — Phase 1', 'General entry at our first regular ticket phase. Additional ₹500 venue cover charge per person, payable at the venue and 100% redeemable on food and beverages.', 59900, 150, 20, 130, 'active', 20),
    ('00000000-0000-0000-0000-000000000003', 'normal-phase-2', 'Normal — Phase 2', 'Final phase of general entry tickets. Additional ₹500 venue cover charge per person, payable at the venue and 100% redeemable on food and beverages.', 79900, 250, 1, 249, 'active', 30)
ON CONFLICT (event_id, code) DO NOTHING;

-- Safe upgrades for an existing database created from the earlier schema.
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS hero_video_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS venue_name VARCHAR(255);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS venue_address TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS starts_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS ends_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS lineup JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS highlights JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS gallery JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS ticket_type_id UUID REFERENCES public.ticket_types(ticket_type_id) ON DELETE SET NULL;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS ticket_type_name VARCHAR(255);
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS unit_price_in_paise INTEGER CHECK (unit_price_in_paise IS NULL OR unit_price_in_paise >= 0);

UPDATE public.events
SET short_description = COALESCE(short_description, 'The ultimate Malayali cultural festival in Mumbai.'),
    description = COALESCE(description, 'Get ready for an electrifying evening packed with music, entertainment, energy, and unforgettable vibes at NAYRA Mumbai. AARPOO brings together the Malayali community across Mumbai for live performances, musical jamming and sing-along sessions, DJ sets and immersive festival experiences.'),
    venue_name = COALESCE(venue_name, 'Nayra'),
    venue_address = COALESCE(venue_address, 'Lower Parel, Mumbai'),
    starts_at = COALESCE(starts_at, '2026-11-07T15:00:00+05:30'::timestamptz),
    ends_at = COALESCE(ends_at, '2026-11-07T19:00:00+05:30'::timestamptz),
    lineup = CASE WHEN lineup = '[]'::jsonb THEN '["To be announced"]'::jsonb ELSE lineup END,
    hero_image_url = COALESCE(hero_image_url, '/aarpoo-irroo-theme/assets/images/gallery/aarpoo-vol-03.jpg')
WHERE slug = 'aarpoo-vol-03';

INSERT INTO public.events (event_id, slug, title, short_description, description, venue_name, venue_address, starts_at, status, is_published, sort_order, price_in_paise)
VALUES
('00000000-0000-0000-0000-000000000001', 'aarpoo-vol-01', 'Aarpoo Irroo Vol. 01', 'Our inaugural festival — a packed room of Mumbai Malayalis, live music, jamming, close-up magic and songs everyone knew by heart.', 'Sold out, high on energy, and the reason Aarpoo Vol. 02 exists.', 'De Aura — Global Dining & Bar', 'Majiwada, Thane', '2026-06-14T19:30:00+05:30', 'past', true, 3, 39900),
('00000000-0000-0000-0000-000000000002', 'aarpoo-vol-02', 'Aarpoo Vol. 02', 'A full-throttle Malayali night — comedy, flute, live vocals and DJ.', 'A sold-out Thane chapter with Vishnu Pai, James Thakara, Abhiram RJ, flute live and DJ Aarpoo.', 'De Aura — Global Dining & Bar', 'Majiwada, Thane', '2026-08-09T19:30:00+05:30', 'past', true, 2, 39900)
ON CONFLICT (event_id) DO UPDATE SET
  title = EXCLUDED.title, short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  venue_name = EXCLUDED.venue_name, venue_address = EXCLUDED.venue_address, starts_at = EXCLUDED.starts_at,
  status = EXCLUDED.status, is_published = EXCLUDED.is_published, sort_order = EXCLUDED.sort_order;

-- Vol. 03 production details (safe to run after the base schema).
UPDATE public.events
SET title = 'Aarpoo Vol. 03 — Mumbai',
    short_description = 'AARPOO – Mumbai''s Biggest Malayali Festival.',
    description = 'Get ready for an electrifying evening packed with music, entertainment, energy, and unforgettable vibes at NAYRA Mumbai. AARPOO brings together the Malayali community across Mumbai for live performances, musical jamming and sing-along sessions, DJ sets and immersive festival experiences.',
    hero_image_url = '/aarpoo-irroo-theme/assets/images/gallery/aarpoo-vol-03.jpg',
    venue_name = 'Nayra',
    venue_address = 'Lower Parel, Mumbai',
    starts_at = '2026-11-07T15:00:00+05:30',
    ends_at = '2026-11-07T19:00:00+05:30',
    lineup = '["To be announced"]'::jsonb,
    sort_order = 1,
    status = 'active',
    is_published = true
WHERE slug = 'aarpoo-vol-03';
