-- Replace legacy Razorpay-specific payment columns with provider-neutral fields.
-- Existing transaction data is preserved by renaming columns.
ALTER TABLE public.payment_transactions
  ADD COLUMN IF NOT EXISTS provider VARCHAR(50) NOT NULL DEFAULT 'payu',
  ADD COLUMN IF NOT EXISTS provider_order_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS provider_payment_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS provider_reference VARCHAR(255),
  ADD COLUMN IF NOT EXISTS provider_signature VARCHAR(255);

UPDATE public.payment_transactions
SET provider = 'razorpay',
    provider_order_id = COALESCE(provider_order_id, razorpay_order_id),
    provider_payment_id = COALESCE(provider_payment_id, razorpay_payment_id),
    provider_signature = COALESCE(provider_signature, razorpay_signature)
WHERE razorpay_order_id IS NOT NULL
   OR razorpay_payment_id IS NOT NULL
   OR razorpay_signature IS NOT NULL;

UPDATE public.payment_transactions
SET provider_reference = COALESCE(provider_reference, provider_payment_id, provider_order_id)
WHERE provider_reference IS NULL;

ALTER TABLE public.payment_transactions
  DROP COLUMN IF EXISTS razorpay_order_id,
  DROP COLUMN IF EXISTS razorpay_payment_id,
  DROP COLUMN IF EXISTS razorpay_signature;

CREATE UNIQUE INDEX IF NOT EXISTS payment_transactions_ticket_provider_reference_idx
  ON public.payment_transactions (ticket_id, provider, provider_reference);
