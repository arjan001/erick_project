-- Add bank details columns to artists table
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS account_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS routing_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS account_holder_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS iban VARCHAR(255),
ADD COLUMN IF NOT EXISTS swift_code VARCHAR(255);

-- Add comments for documentation
COMMENT ON COLUMN artists.bank_name IS 'Name of the bank where the artist has their account';
COMMENT ON COLUMN artists.account_number IS 'Bank account number for payments';
COMMENT ON COLUMN artists.routing_number IS 'Bank routing number (for US banks)';
COMMENT ON COLUMN artists.account_holder_name IS 'Name of the account holder';
COMMENT ON COLUMN artists.iban IS 'International Bank Account Number';
COMMENT ON COLUMN artists.swift_code IS 'SWIFT/BIC code for international transfers';
