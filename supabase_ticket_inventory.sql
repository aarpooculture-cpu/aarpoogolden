-- Ticket inventory controls. Run this in Supabase after the base schema.
ALTER TABLE public.ticket_types
  ADD COLUMN IF NOT EXISTS inventory_total INTEGER,
  ADD COLUMN IF NOT EXISTS inventory_booked INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS inventory_left INTEGER;

UPDATE public.ticket_types
SET inventory_total = COALESCE(inventory_total, 0),
    inventory_booked = COALESCE(inventory_booked, 0);

ALTER TABLE public.ticket_types
  ALTER COLUMN inventory_total SET DEFAULT 0,
  ALTER COLUMN inventory_left SET DEFAULT 0;

CREATE OR REPLACE FUNCTION public.sync_ticket_inventory_status()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.inventory_total := COALESCE(NEW.inventory_total, 0);
  NEW.inventory_booked := GREATEST(0, COALESCE(NEW.inventory_booked, 0));
  NEW.inventory_left := GREATEST(0, NEW.inventory_total - NEW.inventory_booked);
  IF NEW.inventory_left = 0 THEN NEW.status := 'disabled';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ticket_inventory_status_trigger ON public.ticket_types;
CREATE TRIGGER ticket_inventory_status_trigger
BEFORE INSERT OR UPDATE OF inventory_total, inventory_booked, inventory_left, status
ON public.ticket_types FOR EACH ROW EXECUTE FUNCTION public.sync_ticket_inventory_status();

-- Recalculate derived inventory fields and sold-out status for existing rows.
UPDATE public.ticket_types
SET inventory_booked = inventory_booked;

CREATE OR REPLACE FUNCTION public.reserve_ticket_inventory(p_ticket_type_id uuid, p_requested integer)
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE updated_row public.ticket_types;
BEGIN
  IF p_requested < 1 OR p_requested > 10 THEN
    RETURN jsonb_build_object('success', false, 'message', 'You can select between 1 and 10 tickets.');
  END IF;
  UPDATE public.ticket_types
  SET inventory_booked = inventory_booked + p_requested
  WHERE ticket_type_id = p_ticket_type_id
    AND status = 'active'
    AND inventory_left >= p_requested
  RETURNING * INTO updated_row;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Selected ticket type has been sold out.');
  END IF;
  RETURN jsonb_build_object('success', true, 'inventory_left', updated_row.inventory_left, 'status', updated_row.status);
END;
$$;
