-- RLS and grants for the Aarpoo public schema.
-- Public visitors may read published event inventory only. All customer,
-- inquiry, and payment writes happen through server-side functions.

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.events, public.ticket_types, public.tickets,
  public.inquiries, public.payment_transactions FROM anon, authenticated;

GRANT SELECT ON public.events, public.ticket_types TO anon, authenticated;
GRANT ALL ON public.events, public.ticket_types, public.tickets,
  public.inquiries, public.payment_transactions TO service_role;

DROP POLICY IF EXISTS "Allow public read access to events" ON public.events;
DROP POLICY IF EXISTS "Public can read published active events" ON public.events;
CREATE POLICY "Public can read published active events"
  ON public.events FOR SELECT TO anon, authenticated
  USING (is_published = true AND status = 'active');

DROP POLICY IF EXISTS "Public can read active ticket types" ON public.ticket_types;
CREATE POLICY "Public can read active ticket types"
  ON public.ticket_types FOR SELECT TO anon, authenticated
  USING (status = 'active');

-- No anon/authenticated policies are created for tickets, inquiries, or
-- payment_transactions. The service role is kept only in server-side env vars.
