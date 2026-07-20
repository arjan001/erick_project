-- Update notifications table schema
-- This migration ensures the notifications table has the correct structure

-- Ensure columns exist (add if missing)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'recipient_email') THEN
        ALTER TABLE notifications ADD COLUMN recipient_email VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'metadata') THEN
        ALTER TABLE notifications ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'link') THEN
        ALTER TABLE notifications ADD COLUMN link TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'message') THEN
        ALTER TABLE notifications ADD COLUMN message TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'read') THEN
        ALTER TABLE notifications ADD COLUMN read BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Update the type check constraint to include new notification types
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
CHECK (type IN ('job_application', 'job_invitation', 'connection_request', 'message', 'endorsement', 'testimonial', 'project_update', 'system', 'subscription', 'payment', 'connects', 'ticket_response', 'job_status'));

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_email ON notifications(recipient_email);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Add comments for documentation
COMMENT ON COLUMN notifications.recipient_email IS 'Email address of the notification recipient';
COMMENT ON COLUMN notifications.type IS 'Type of notification: job_application, job_invitation, connection_request, message, endorsement, testimonial, project_update, system, subscription, payment, connects, ticket_response, job_status';
COMMENT ON COLUMN notifications.metadata IS 'Additional notification data in JSON format';
