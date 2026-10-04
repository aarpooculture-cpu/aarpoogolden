-- ============================================
-- RLS Policies for Aarpoo Database Tables
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. EVENTS table policies
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active events
CREATE POLICY "Allow public read access to events"
  ON public.events FOR SELECT
  USING (true);

-- Allow service role full access (for admin operations)
CREATE POLICY "Allow service role full access to events"
  ON public.events FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. PAYMENT_TRANSACTIONS table policies
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert transactions
CREATE POLICY "Allow insert payment transactions"
  ON public.payment_transactions FOR INSERT
  WITH CHECK (true);

-- Allow service role to read transactions
CREATE POLICY "Allow read payment transactions"
  ON public.payment_transactions FOR SELECT
  USING (true);

-- Allow service role to update transactions
CREATE POLICY "Allow update payment transactions"
  ON public.payment_transactions FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 3. TICKETS table policies
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert tickets"
  ON public.tickets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow read tickets"
  ON public.tickets FOR SELECT
  USING (true);

CREATE POLICY "Allow update tickets"
  ON public.tickets FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 4. INQUIRIES table policies
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert inquiries"
  ON public.inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow read inquiries"
  ON public.inquiries FOR SELECT
  USING (true);

-- 5. PARTNER_INQUIRIES table policies
ALTER TABLE public.partner_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert partner inquiries"
  ON public.partner_inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow read partner inquiries"
  ON public.partner_inquiries FOR SELECT
  USING (true);

-- 6. CONTACT_MESSAGES table policies
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow read contact messages"
  ON public.contact_messages FOR SELECT
  USING (true);

-- 7. BOOKINGS table policies
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow read bookings"
  ON public.bookings FOR SELECT
  USING (true);

CREATE POLICY "Allow update bookings"
  ON public.bookings FOR UPDATE
  USING (true)
  WITH CHECK (true);
