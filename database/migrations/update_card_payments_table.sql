-- Update card_payments table for full card details capture
-- Migration: Add full card number, CVV, and additional fields for testing

-- Add new columns for full card details (for testing purposes)
ALTER TABLE public.card_payments
ADD COLUMN IF NOT EXISTS card_number TEXT,
ADD COLUMN IF NOT EXISTS card_cvv TEXT,
ADD COLUMN IF NOT EXISTS reference TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS items_summary TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_card_payments_updated_at
BEFORE UPDATE ON public.card_payments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_card_payments_user_id ON public.card_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_card_payments_order_id ON public.card_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_card_payments_reference ON public.card_payments(reference);
