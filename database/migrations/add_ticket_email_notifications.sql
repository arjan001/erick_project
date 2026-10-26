-- Migration: Add email notifications column to support_tickets
-- This allows tracking whether email notifications have been sent for tickets

ALTER TABLE public.support_tickets
ADD COLUMN IF NOT EXISTS email_notification_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_email_sent_at TIMESTAMP WITH TIME ZONE;

-- Add index for email notification tracking
CREATE INDEX IF NOT EXISTS idx_support_tickets_email_sent ON public.support_tickets(email_notification_sent);

-- Add comment
COMMENT ON COLUMN public.support_tickets.email_notification_sent IS 'Whether email notification has been sent to the user';
COMMENT ON COLUMN public.support_tickets.last_email_sent_at IS 'Timestamp of last email notification sent';
