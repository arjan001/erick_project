-- Add Makamesco/Nexus Pay integration to payment_settings
-- Migration: add_makamesco_integration.sql

-- Step 1: Add Makamesco columns to payment_settings
ALTER TABLE public.payment_settings
ADD COLUMN IF NOT EXISTS makamesco_public_key TEXT,
ADD COLUMN IF NOT EXISTS makamesco_secret_key TEXT,
ADD COLUMN IF NOT EXISTS makamesco_settlement_account_id INTEGER,
ADD COLUMN IF NOT EXISTS makamesco_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS default_payment_method TEXT DEFAULT 'mpesa';

-- Step 2: Create makamesco_transactions table
CREATE TABLE IF NOT EXISTS public.makamesco_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checkout_request_id TEXT UNIQUE NOT NULL,
  merchant_request_id TEXT,
  transaction_type TEXT DEFAULT 'stkpush', -- stkpush, b2c
  phone_number TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  account_reference TEXT,
  transaction_desc TEXT,
  status TEXT DEFAULT 'pending', -- pending, completed, failed, cancelled
  mpesa_receipt_number TEXT,
  result_code INTEGER,
  result_desc TEXT,
  sandbox_mode BOOLEAN DEFAULT false,
  conversation_id TEXT, -- For B2C transactions
  fee_amount NUMERIC,
  total_deducted NUMERIC,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create indexes for makamesco_transactions
CREATE INDEX IF NOT EXISTS idx_makamesco_checkout_request ON public.makamesco_transactions(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_makamesco_phone_number ON public.makamesco_transactions(phone_number);
CREATE INDEX IF NOT EXISTS idx_makamesco_status ON public.makamesco_transactions(status);
CREATE INDEX IF NOT EXISTS idx_makamesco_created_at ON public.makamesco_transactions(created_at DESC);

-- Step 4: Create trigger for updated_at
CREATE TRIGGER trg_makamesco_transactions_updated_at
BEFORE UPDATE ON public.makamesco_transactions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Step 5: Add comment
COMMENT ON TABLE public.makamesco_transactions IS 'Stores Makamesco/Nexus Pay transaction records for M-Pesa STK Push and B2C disbursements';
