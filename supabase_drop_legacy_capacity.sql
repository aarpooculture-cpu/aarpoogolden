-- Pending explicit approval: irreversible removal of obsolete live columns.
-- Apply only after the Cloudflare booking code has been deployed and verified.
ALTER TABLE public.ticket_types DROP COLUMN IF EXISTS capacity;
ALTER TABLE public.events DROP COLUMN IF EXISTS available_capacity;
