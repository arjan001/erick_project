-- Update audit_logs table to track all users with email-based identification
-- This improves tracking across all user types (artists, teams, clients, backers, admins)

DO $$
BEGIN
    -- Add new columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'actor_email') THEN
        ALTER TABLE audit_logs ADD COLUMN actor_email VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'actor_role') THEN
        ALTER TABLE audit_logs ADD COLUMN actor_role VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'actor_id') THEN
        ALTER TABLE audit_logs ADD COLUMN actor_id UUID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'metadata') THEN
        ALTER TABLE audit_logs ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Update indexes
DROP INDEX IF EXISTS idx_audit_logs_user_id;
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_email ON audit_logs(actor_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_role ON audit_logs(actor_role);

-- Add comments for documentation
COMMENT ON COLUMN audit_logs.actor_email IS 'Email address of the user who performed the action';
COMMENT ON COLUMN audit_logs.actor_role IS 'Role of the actor (admin, artist, team, client, backer)';
COMMENT ON COLUMN audit_logs.actor_id IS 'UUID of the user who performed the action';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context data in JSON format';
