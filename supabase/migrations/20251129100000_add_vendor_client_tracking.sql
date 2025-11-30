-- Add vendor and client tracking columns to submissions table
-- These columns support the full recruiter submission workflow

-- Vendor submission tracking (internal approval before client submission)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS vendor_submitted_at TIMESTAMPTZ;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS vendor_submitted_by UUID REFERENCES user_profiles(id);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS vendor_decision TEXT; -- 'pending' | 'accepted' | 'rejected'
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS vendor_decision_at TIMESTAMPTZ;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS vendor_decision_by UUID REFERENCES user_profiles(id);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS vendor_notes TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS vendor_screening_notes TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS vendor_screening_completed_at TIMESTAMPTZ;

-- Client decision tracking
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS client_decision TEXT; -- 'pending' | 'accepted' | 'rejected'
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS client_decision_at TIMESTAMPTZ;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS client_decision_notes TEXT;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_submissions_vendor_decision ON submissions(vendor_decision) WHERE vendor_decision IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_submissions_client_decision ON submissions(client_decision) WHERE client_decision IS NOT NULL;

COMMENT ON COLUMN submissions.vendor_decision IS 'Vendor approval status: pending, accepted, or rejected';
COMMENT ON COLUMN submissions.client_decision IS 'Client decision status: pending, accepted, or rejected';
