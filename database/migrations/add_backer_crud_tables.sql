-- Migration: Add Backer CRUD Tables
-- Description: Create tables for backer deals, partners, investment tiers, and project updates
-- Created: July 13, 2026

-- ============================================
-- DEALS TABLE
-- ============================================

-- Create deals table if it doesn't exist
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backer_id UUID NOT NULL REFERENCES backers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(15, 2) NOT NULL,
    counterparty VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    document_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add signature_status column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deals' AND column_name = 'signature_status'
    ) THEN
        ALTER TABLE deals ADD COLUMN signature_status VARCHAR(50) DEFAULT 'unsigned' CHECK (signature_status IN ('unsigned', 'signed', 'rejected'));
    END IF;
END $$;

-- Add signed_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deals' AND column_name = 'signed_at'
    ) THEN
        ALTER TABLE deals ADD COLUMN signed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_deals_backer_id ON deals(backer_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);

-- Create index on signature_status only if column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deals' AND column_name = 'signature_status'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_deals_signature_status ON deals(signature_status);
    END IF;
END $$;

-- ============================================
-- PARTNERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backer_id UUID NOT NULL REFERENCES backers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    email VARCHAR(255),
    role VARCHAR(100),
    notes TEXT,
    partnership_type VARCHAR(50) DEFAULT 'strategic' CHECK (partnership_type IN ('strategic', 'investment', 'collaboration')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_partners_backer_id ON partners(backer_id);
CREATE INDEX IF NOT EXISTS idx_partners_partnership_type ON partners(partnership_type);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);

-- ============================================
-- INVESTMENT TIERS TABLE
-- ============================================

-- Create investment_tiers table if it doesn't exist
CREATE TABLE IF NOT EXISTS investment_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backer_id UUID NOT NULL REFERENCES backers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    min_investment DECIMAL(15, 2) NOT NULL,
    max_investment DECIMAL(15, 2),
    roi_percentage DECIMAL(5, 2) NOT NULL,
    benefits TEXT[] DEFAULT ARRAY[]::TEXT[],
    color VARCHAR(50) DEFAULT 'bg-blue-100 text-blue-700',
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add is_active column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'investment_tiers' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE investment_tiers ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_investment_tiers_backer_id ON investment_tiers(backer_id);

-- Create index on is_active only if column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'investment_tiers' AND column_name = 'is_active'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_investment_tiers_is_active ON investment_tiers(is_active);
    END IF;
END $$;

-- ============================================
-- PROJECT UPDATES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS project_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backer_id UUID NOT NULL REFERENCES backers(id) ON DELETE CASCADE,
    backed_project_id UUID NOT NULL REFERENCES backed_projects(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    project_title VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    update_type VARCHAR(50) DEFAULT 'progress' CHECK (update_type IN ('progress', 'milestone', 'announcement')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_updates_backer_id ON project_updates(backer_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_project_id ON project_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_update_type ON project_updates(update_type);

-- ============================================
-- BACKER BANK ACCOUNTS (add to existing backers table or create separate)
-- ============================================

-- Add bank_accounts column to backers table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'backers' AND column_name = 'bank_accounts'
    ) THEN
        ALTER TABLE backers ADD COLUMN bank_accounts JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Add contact_email column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'backers' AND column_name = 'contact_email'
    ) THEN
        ALTER TABLE backers ADD COLUMN contact_email VARCHAR(255);
    END IF;
END $$;

-- Add city column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'backers' AND column_name = 'city'
    ) THEN
        ALTER TABLE backers ADD COLUMN city VARCHAR(100);
    END IF;
END $$;

-- Add country column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'backers' AND column_name = 'country'
    ) THEN
        ALTER TABLE backers ADD COLUMN country VARCHAR(100);
    END IF;
END $$;

-- Add linkedin column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'backers' AND column_name = 'linkedin'
    ) THEN
        ALTER TABLE backers ADD COLUMN linkedin TEXT;
    END IF;
END $$;

-- Add instagram column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'backers' AND column_name = 'instagram'
    ) THEN
        ALTER TABLE backers ADD COLUMN instagram TEXT;
    END IF;
END $$;

-- Add twitter column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'backers' AND column_name = 'twitter'
    ) THEN
        ALTER TABLE backers ADD COLUMN twitter TEXT;
    END IF;
END $$;

-- Add youtube column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'backers' AND column_name = 'youtube'
    ) THEN
        ALTER TABLE backers ADD COLUMN youtube TEXT;
    END IF;
END $$;

-- Add email_notifications column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'backers' AND column_name = 'email_notifications'
    ) THEN
        ALTER TABLE backers ADD COLUMN email_notifications BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Add deal_alerts column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'backers' AND column_name = 'deal_alerts'
    ) THEN
        ALTER TABLE backers ADD COLUMN deal_alerts BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Add profile_public column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'backers' AND column_name = 'profile_public'
    ) THEN
        ALTER TABLE backers ADD COLUMN profile_public BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Add logo_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'backers' AND column_name = 'logo_url'
    ) THEN
        ALTER TABLE backers ADD COLUMN logo_url TEXT;
    END IF;
END $$;

-- Create index on contact_email only if column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'backers' AND column_name = 'contact_email'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_backers_contact_email ON backers(contact_email);
    END IF;
END $$;

-- ============================================
-- TRIGGER FOR UPDATED_AT
-- ============================================

-- Create or replace trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all new tables
DROP TRIGGER IF EXISTS update_deals_updated_at ON deals;
CREATE TRIGGER update_deals_updated_at
    BEFORE UPDATE ON deals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_partners_updated_at ON partners;
CREATE TRIGGER update_partners_updated_at
    BEFORE UPDATE ON partners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_investment_tiers_updated_at ON investment_tiers;
CREATE TRIGGER update_investment_tiers_updated_at
    BEFORE UPDATE ON investment_tiers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_updates_updated_at ON project_updates;
CREATE TRIGGER update_project_updates_updated_at
    BEFORE UPDATE ON project_updates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
