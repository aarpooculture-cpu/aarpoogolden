-- Run after supabase_ticket_inventory.sql. Keeps the live sold counts intact.
CREATE OR REPLACE FUNCTION public.sync_ticket_inventory_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.inventory_total := COALESCE(NEW.inventory_total, 0);
  NEW.inventory_booked := GREATEST(0, COALESCE(NEW.inventory_booked, 0));
  NEW.inventory_left := GREATEST(0, NEW.inventory_total - NEW.inventory_booked);
  IF NEW.inventory_left = 0 THEN
    NEW.status := 'disabled';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ticket_inventory_status_trigger ON public.ticket_types;
CREATE TRIGGER ticket_inventory_status_trigger
BEFORE INSERT OR UPDATE OF inventory_total, inventory_booked, inventory_left, status
ON public.ticket_types FOR EACH ROW EXECUTE FUNCTION public.sync_ticket_inventory_status();

-- The inventory update and ticket insert share one transaction. An insert error
-- rolls back the reservation automatically.
CREATE OR REPLACE FUNCTION public.create_ticket_with_inventory(
  p_event_id uuid,
  p_ticket_type_id uuid,
  p_requested integer,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_catalog
AS $$
DECLARE
  selected_type public.ticket_types%ROWTYPE;
  inserted_ticket public.tickets%ROWTYPE;
BEGIN
  IF p_requested IS NULL OR p_requested < 1 OR p_requested > 10 THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_QUANTITY', 'message', 'Select between 1 and 10 tickets.');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.events
    WHERE event_id = p_event_id AND status IN ('active', 'ongoing')
  ) THEN
    RETURN jsonb_build_object('success', false, 'code', 'EVENT_UNAVAILABLE', 'message', 'This event is not accepting bookings.');
  END IF;

  UPDATE public.ticket_types
  SET inventory_booked = inventory_booked + p_requested
  WHERE ticket_type_id = p_ticket_type_id
    AND event_id = p_event_id
    AND status = 'active'
    AND inventory_left >= p_requested
  RETURNING * INTO selected_type;

  IF NOT FOUND THEN
    SELECT * INTO selected_type FROM public.ticket_types
    WHERE ticket_type_id = p_ticket_type_id AND event_id = p_event_id;
    IF FOUND AND selected_type.status = 'active' AND selected_type.inventory_left > 0 THEN
      RETURN jsonb_build_object('success', false, 'code', 'INVENTORY_CHANGED', 'message', 'Only ' || selected_type.inventory_left || ' tickets remain. Please reduce your quantity.', 'inventory_left', selected_type.inventory_left);
    END IF;
    RETURN jsonb_build_object('success', false, 'code', 'TICKET_SOLD_OUT', 'message', 'Selected ticket type has been sold out.');
  END IF;

  INSERT INTO public.tickets (
    ticket_number, event_id, ticket_type_id, ticket_type_name,
    unit_price_in_paise, customer_name, customer_email, customer_phone,
    seats, amount, status, invoice_id, invoice_url, email_sent, email_sent_at
  ) VALUES (
    'ARPOO-' || upper(replace(uuid_generate_v4()::text, '-', '')),
    p_event_id, p_ticket_type_id, selected_type.name,
    selected_type.price_in_paise, trim(p_customer_name), trim(p_customer_email), trim(p_customer_phone),
    p_requested, p_requested * selected_type.price_in_paise / 100.0,
    'payment_pending', null, null, false, null
  ) RETURNING * INTO inserted_ticket;

  RETURN jsonb_build_object(
    'success', true,
    'ticket_number', inserted_ticket.ticket_number,
    'ticket_type', selected_type.name,
    'amount', inserted_ticket.amount,
    'inventory_left', selected_type.inventory_left
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_ticket_with_inventory(uuid, uuid, integer, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_ticket_with_inventory(uuid, uuid, integer, text, text, text) TO service_role;
