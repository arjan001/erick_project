-- Migration: Enhance Applications Table for Better Status Tracking
-- Created: July 15, 2026
-- Purpose: Add fields for viewed status, rejection reasons, and client feedback

-- Add viewed tracking
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS viewed_by_client BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMP WITH TIME ZONE;

-- Add rejection feedback
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS client_feedback TEXT;

-- Add client response timestamp
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS client_responded_at TIMESTAMP WITH TIME ZONE;

-- Add index for viewed status
CREATE INDEX IF NOT EXISTS idx_applications_viewed ON applications(viewed_by_client);

-- Update status check constraint to include more statuses
ALTER TABLE applications 
DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE applications 
ADD CONSTRAINT applications_status_check 
CHECK (status IN ('pending', 'viewed', 'shortlisted', 'interview_scheduled', 'accepted', 'rejected', 'withdrawn', 'expired'));

-- Add comment for documentation
COMMENT ON COLUMN applications.viewed_by_client IS 'Whether the client has viewed this application';
COMMENT ON COLUMN applications.viewed_at IS 'Timestamp when client viewed the application';
COMMENT ON COLUMN applications.rejection_reason IS 'Reason provided by client for rejection';
COMMENT ON COLUMN applications.client_feedback IS 'Additional feedback from client';
COMMENT ON COLUMN applications.client_responded_at IS 'Timestamp when client responded to application';
