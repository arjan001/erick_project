-- Add pending_approval status to jobs table
-- This allows jobs posted by non-logged-in users to require admin approval before going live

-- Step 1: Drop the existing CHECK constraint on status
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;

-- Step 2: Add the new CHECK constraint with pending_approval included
ALTER TABLE jobs 
ADD CONSTRAINT jobs_status_check 
CHECK (status IN ('draft', 'pending_approval', 'open', 'closed', 'filled'));

-- Step 3: Add contact fields for non-logged-in users
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);

-- Step 4: Add indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_jobs_contact_email ON jobs(contact_email) WHERE contact_email IS NOT NULL;
