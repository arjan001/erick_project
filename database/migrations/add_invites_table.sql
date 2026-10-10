-- Add invites table for referral/invite code system
-- This table tracks invite codes, who generated them, and who used them

-- Run this in Supabase SQL Editor

-- Create invites table
CREATE TABLE IF NOT EXISTS public.invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    inviter_email VARCHAR(255) NOT NULL,
    inviter_name VARCHAR(255),
    inviter_role VARCHAR(50),
    inviter_entity_id UUID,
    applicant_email VARCHAR(255),
    applicant_name VARCHAR(255),
    applicant_type VARCHAR(50),
    tracking_code VARCHAR(20),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'revoked')),
    used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invites_code ON public.invites(code);
CREATE INDEX IF NOT EXISTS idx_invites_inviter_email ON public.invites(inviter_email);
CREATE INDEX IF NOT EXISTS idx_invites_applicant_email ON public.invites(applicant_email);
CREATE INDEX IF NOT EXISTS idx_invites_status ON public.invites(status);

-- Add trigger for updated_at (check if function exists first)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'trg_invites_updated_at'
        AND tgrelid = 'public.invites'::regclass
    ) THEN
        CREATE TRIGGER trg_invites_updated_at
            BEFORE UPDATE ON public.invites
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own invites
CREATE POLICY "Users can view own invites"
    ON public.invites FOR SELECT
    USING (inviter_email = auth.email());

-- Users can create invites for themselves
CREATE POLICY "Users can create invites"
    ON public.invites FOR INSERT
    WITH CHECK (inviter_email = auth.email());

-- Users can update their own invites
CREATE POLICY "Users can update own invites"
    ON public.invites FOR UPDATE
    USING (inviter_email = auth.email());

-- Add comments
COMMENT ON TABLE public.invites IS 'Invite/referral code tracking system';
COMMENT ON COLUMN public.invites.code IS 'Unique invite code (e.g., SG-ABC123)';
COMMENT ON COLUMN public.invites.inviter_email IS 'Email of the user who generated the invite';
COMMENT ON COLUMN public.invites.inviter_name IS 'Name of the inviter';
COMMENT ON COLUMN public.invites.inviter_role IS 'Role of the inviter (artist, team, client, backer)';
COMMENT ON COLUMN public.invites.inviter_entity_id IS 'Entity ID (artist_id, team_id, etc.)';
COMMENT ON COLUMN public.invites.applicant_email IS 'Email of the person who used the invite';
COMMENT ON COLUMN public.invites.applicant_name IS 'Name of the applicant';
COMMENT ON COLUMN public.invites.applicant_type IS 'Type of applicant (artist, team, client, backer)';
COMMENT ON COLUMN public.invites.tracking_code IS 'Unique tracking code for analytics';
COMMENT ON COLUMN public.invites.status IS 'Status: active, used, expired, revoked';
COMMENT ON COLUMN public.invites.used_at IS 'Timestamp when the invite was used';
COMMENT ON COLUMN public.invites.expires_at IS 'Expiration date for the invite code';
