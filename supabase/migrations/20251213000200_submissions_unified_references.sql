-- ============================================================================
-- WAVE 4: SUBMISSIONS-01 - Unified contact references and enhanced tracking
-- ============================================================================
-- This migration adds:
-- 1. contact_id column (replacing candidate_id)
-- 2. Vendor submission tracking
-- 3. RTR (Right to Represent) tracking
-- 4. Rate card linkage
-- 5. Enhanced status and scoring
-- 6. submission_feedback and submission_rtr tables
-- ============================================================================

-- Step 1: Add contact_id column (parallel to candidate_id for transition)
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id);

-- Step 2: Vendor submission tracking
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS submitted_by_company_id UUID REFERENCES companies(id);

ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS submitted_by_contact_id UUID REFERENCES contacts(id);

ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS is_vendor_submission BOOLEAN DEFAULT false;

-- Step 3: RTR tracking on submission
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS rtr_obtained BOOLEAN DEFAULT false;

ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS rtr_obtained_at TIMESTAMPTZ;

ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS rtr_expires_at TIMESTAMPTZ;

ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS rtr_document_id UUID REFERENCES documents(id);

-- Step 4: Rate card linkage
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS rate_card_id UUID REFERENCES rate_cards(id);

ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS rate_card_item_id UUID REFERENCES rate_card_items(id);

ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS negotiated_bill_rate NUMERIC(10,2);

ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS negotiated_pay_rate NUMERIC(10,2);

ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS rate_negotiation_notes TEXT;

-- Step 5: Enhanced status tracking
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS status_entered_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS expected_decision_date DATE;

-- Step 6: Scoring enhancements
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS submission_score INTEGER CHECK (submission_score IS NULL OR submission_score BETWEEN 0 AND 100);

ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS score_breakdown JSONB;

ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS rank_among_submissions INTEGER;

-- Step 7: Duplicate detection
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS is_duplicate BOOLEAN DEFAULT false;

ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS duplicate_of_submission_id UUID REFERENCES submissions(id);

-- Step 8: Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_submissions_contact ON submissions(contact_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_submissions_vendor ON submissions(submitted_by_company_id) WHERE is_vendor_submission = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_submissions_rtr ON submissions(rtr_expires_at) WHERE rtr_obtained = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_submissions_score ON submissions(org_id, submission_score DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_submissions_status_entered ON submissions(status_entered_at) WHERE deleted_at IS NULL;

-- ============================================================================
-- Create submission_feedback table (unified feedback)
-- ============================================================================
CREATE TABLE IF NOT EXISTS submission_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,

  feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN (
    'screening', 'technical', 'client', 'reference', 'final'
  )),
  feedback_source VARCHAR(50) NOT NULL CHECK (feedback_source IN (
    'internal', 'client', 'vendor', 'reference'
  )),

  provided_by_user_id UUID REFERENCES user_profiles(id),
  provided_by_contact_id UUID REFERENCES contacts(id),

  overall_rating INTEGER CHECK (overall_rating IS NULL OR overall_rating BETWEEN 1 AND 5),
  recommendation VARCHAR(50) CHECK (recommendation IS NULL OR recommendation IN (
    'strong_hire', 'hire', 'neutral', 'no_hire', 'strong_no_hire'
  )),
  feedback_text TEXT,
  criteria_scores JSONB,  -- {technical: 4, communication: 5, ...}

  interview_id UUID REFERENCES interviews(id),
  interview_round INTEGER,

  is_visible_to_client BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_submission_feedback_submission ON submission_feedback(submission_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_submission_feedback_interview ON submission_feedback(interview_id) WHERE interview_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_submission_feedback_org ON submission_feedback(org_id) WHERE deleted_at IS NULL;

-- ============================================================================
-- Create submission_rtr table (RTR tracking history)
-- ============================================================================
CREATE TABLE IF NOT EXISTS submission_rtr (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id),

  rtr_type VARCHAR(50) DEFAULT 'standard' CHECK (rtr_type IN (
    'standard', 'exclusive', 'non_exclusive', 'verbal', 'written'
  )),
  obtained_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  validity_hours INTEGER DEFAULT 72,

  document_id UUID REFERENCES documents(id),

  status VARCHAR(50) DEFAULT 'active' CHECK (status IN (
    'active', 'expired', 'revoked', 'renewed'
  )),
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_submission_rtr_submission ON submission_rtr(submission_id);
CREATE INDEX IF NOT EXISTS idx_submission_rtr_contact ON submission_rtr(contact_id);
CREATE INDEX IF NOT EXISTS idx_submission_rtr_expiry ON submission_rtr(expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_submission_rtr_org ON submission_rtr(org_id);

-- ============================================================================
-- RLS Policies
-- ============================================================================
ALTER TABLE submission_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_rtr ENABLE ROW LEVEL SECURITY;

-- Submission feedback policies
DROP POLICY IF EXISTS submission_feedback_org_isolation ON submission_feedback;
CREATE POLICY submission_feedback_org_isolation ON submission_feedback
FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);

-- Submission RTR policies
DROP POLICY IF EXISTS submission_rtr_org_isolation ON submission_rtr;
CREATE POLICY submission_rtr_org_isolation ON submission_rtr
FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);

-- ============================================================================
-- Backward compatibility view
-- ============================================================================
CREATE OR REPLACE VIEW submissions_legacy_v AS
SELECT
  s.*,
  COALESCE(s.contact_id, s.candidate_id) as unified_contact_id,
  s.candidate_id as legacy_candidate_id
FROM submissions s;

COMMENT ON VIEW submissions_legacy_v IS 'Backward compatibility view - use contact_id instead of candidate_id';

-- ============================================================================
-- Add comments
-- ============================================================================
COMMENT ON COLUMN submissions.contact_id IS 'Unified contact reference (replacing candidate_id)';
COMMENT ON COLUMN submissions.submitted_by_company_id IS 'Vendor company that submitted this candidate';
COMMENT ON COLUMN submissions.submitted_by_contact_id IS 'Vendor contact who submitted this candidate';
COMMENT ON COLUMN submissions.is_vendor_submission IS 'Whether this was submitted by an external vendor';
COMMENT ON COLUMN submissions.rtr_obtained IS 'Whether Right to Represent has been obtained';
COMMENT ON COLUMN submissions.rtr_obtained_at IS 'When RTR was obtained';
COMMENT ON COLUMN submissions.rtr_expires_at IS 'When RTR expires';
COMMENT ON COLUMN submissions.rtr_document_id IS 'Document containing RTR agreement';
COMMENT ON COLUMN submissions.rate_card_id IS 'Rate card used for this submission';
COMMENT ON COLUMN submissions.negotiated_bill_rate IS 'Negotiated bill rate (may differ from rate card)';
COMMENT ON COLUMN submissions.negotiated_pay_rate IS 'Negotiated pay rate';
COMMENT ON COLUMN submissions.submission_score IS 'AI/manual score 0-100';
COMMENT ON COLUMN submissions.score_breakdown IS 'JSON breakdown of scoring factors';
COMMENT ON COLUMN submissions.is_duplicate IS 'Whether this is a duplicate submission';

COMMENT ON TABLE submission_feedback IS 'Unified feedback collection for submissions from all sources';
COMMENT ON TABLE submission_rtr IS 'Right to Represent tracking with history';
