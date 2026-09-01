-- ============================================
-- Payment Gateway Settings & M-Pesa Transactions
-- Migration: create_payment_tables.sql
-- ============================================

-- Payment gateway settings (single-row config store)
CREATE TABLE IF NOT EXISTS payment_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mpesa_settings JSONB DEFAULT '{}'::jsonb,
    mollie_settings JSONB DEFAULT '{}'::jsonb,
    general_settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- M-Pesa transactions log
CREATE TABLE IF NOT EXISTS mpesa_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checkout_request_id VARCHAR(100) UNIQUE,
    merchant_request_id VARCHAR(100),
    phone_number VARCHAR(20),
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    account_reference VARCHAR(100),
    transaction_desc TEXT,
    mpesa_receipt VARCHAR(50),
    transaction_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'success', 'failed', 'cancelled', 'timeout')),
    result_code VARCHAR(10),
    result_desc TEXT,
    callback_payload JSONB,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    related_type VARCHAR(50),  -- 'job', 'project', 'subscription', 'shop_order'
    related_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mpesa_txn_checkout ON mpesa_transactions(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_txn_phone ON mpesa_transactions(phone_number);
CREATE INDEX IF NOT EXISTS idx_mpesa_txn_status ON mpesa_transactions(status);
CREATE INDEX IF NOT EXISTS idx_mpesa_txn_user ON mpesa_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_txn_related ON mpesa_transactions(related_type, related_id);

-- M-Pesa C2B confirmation & validation logs
CREATE TABLE IF NOT EXISTS mpesa_c2b_callbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_type VARCHAR(20),  -- 'confirmation' or 'validation'
    transaction_id VARCHAR(50),
    bill_ref_number VARCHAR(100),
    invoice_number VARCHAR(50),
    msisdn VARCHAR(20),
    amount DECIMAL(12, 2),
    org_account_balance DECIMAL(12, 2),
    third_party_trans_id VARCHAR(50),
    business_short_code VARCHAR(20),
    raw_payload JSONB,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_c2b_txn_id ON mpesa_c2b_callbacks(transaction_id);
CREATE INDEX IF NOT EXISTS idx_c2b_msisdn ON mpesa_c2b_callbacks(msisdn);

-- Mollie payment records
CREATE TABLE IF NOT EXISTS mollie_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mollie_payment_id VARCHAR(100) UNIQUE,
    checkout_url TEXT,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'EUR',
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'pending', 'paid', 'canceled', 'failed', 'expired', 'refunded')),
    method VARCHAR(50),
    profile_id VARCHAR(100),
    webhook_payload JSONB,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    related_type VARCHAR(50),
    related_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mollie_payment_id ON mollie_payments(mollie_payment_id);
CREATE INDEX IF NOT EXISTS idx_mollie_status ON mollie_payments(status);
CREATE INDEX IF NOT EXISTS idx_mollie_user ON mollie_payments(user_id);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_payment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payment_settings_updated ON payment_settings;
CREATE TRIGGER trg_payment_settings_updated BEFORE UPDATE ON payment_settings
    FOR EACH ROW EXECUTE FUNCTION update_payment_timestamp();

DROP TRIGGER IF EXISTS trg_mpesa_txn_updated ON mpesa_transactions;
CREATE TRIGGER trg_mpesa_txn_updated BEFORE UPDATE ON mpesa_transactions
    FOR EACH ROW EXECUTE FUNCTION update_payment_timestamp();

DROP TRIGGER IF EXISTS trg_mollie_payments_updated ON mollie_payments;
CREATE TRIGGER trg_mollie_payments_updated BEFORE UPDATE ON mollie_payments
    FOR EACH ROW EXECUTE FUNCTION update_payment_timestamp();
