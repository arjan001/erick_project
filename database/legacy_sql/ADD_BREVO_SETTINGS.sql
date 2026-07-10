-- Create settings table for Brevo integration
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default Brevo settings
INSERT INTO settings (key, value, description) VALUES
  ('brevo_api_key', '', 'Brevo API key for SMS and email integration'),
  ('brevo_sender_name', 'Studio22', 'Sender name for Brevo SMS and emails'),
  ('brevo_sender_email', 'noreply@studio22.com', 'Sender email for Brevo emails'),
  ('brevo_sms_enabled', 'false', 'Enable/disable Brevo SMS service'),
  ('brevo_email_enabled', 'false', 'Enable/disable Brevo email service')
ON CONFLICT (key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
