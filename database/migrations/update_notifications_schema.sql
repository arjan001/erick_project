-- Update notifications table schema
-- This migration ensures the notifications table has the correct structure
-- MIGRATION NOTE: This table now uses user_id instead of recipient_email for foreign key relationships

-- Drop existing RLS policies that depend on recipient_email
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- Ensure columns exist (add if missing)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'user_id') THEN
        ALTER TABLE notifications ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'metadata') THEN
        ALTER TABLE notifications ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'link_url') THEN
        ALTER TABLE notifications ADD COLUMN link_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'content') THEN
        ALTER TABLE notifications ADD COLUMN content TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'is_read') THEN
        ALTER TABLE notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Drop deprecated column if it exists (now safe since policies are dropped)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'recipient_email') THEN
        ALTER TABLE notifications DROP COLUMN recipient_email;
    END IF;
END $$;

-- Update the type check constraint to include new notification types
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
CHECK (type IN ('job_application', 'job_invitation', 'connection_request', 'message', 'endorsement', 'testimonial', 'project_update', 'system', 'subscription', 'payment', 'connects', 'ticket_response', 'job_status'));

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Recreate RLS policies using user_id instead of recipient_email
CREATE POLICY "Users can view own notifications"
ON notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON COLUMN notifications.user_id IS 'User ID of the notification recipient';
COMMENT ON COLUMN notifications.type IS 'Type of notification: job_application, job_invitation, connection_request, message, endorsement, testimonial, project_update, system, subscription, payment, connects, ticket_response, job_status';
COMMENT ON COLUMN notifications.metadata IS 'Additional notification data in JSON format';
