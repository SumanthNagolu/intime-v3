-- Migration: Job Status History
-- Description: Track job status transitions for audit and analytics
-- Date: 2025-12-06

-- =====================================================
-- JOB STATUS HISTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS job_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  -- Status Change
  previous_status TEXT,
  new_status TEXT NOT NULL,

  -- Metadata
  changed_by UUID NOT NULL REFERENCES user_profiles(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT,
  notes TEXT,
  is_system_triggered BOOLEAN DEFAULT FALSE,

  -- On Hold Specific
  expected_reactivation_date DATE,
  actual_reactivation_date DATE,
  hold_duration_days INTEGER,

  -- Filled Specific
  days_to_fill INTEGER,
  positions_filled_count INTEGER,

  -- Cancelled/Closed Specific
  candidates_affected_count INTEGER,
  interviews_cancelled_count INTEGER,
  offers_withdrawn_count INTEGER,

  -- Reopen Specific
  reopen_approved_by UUID REFERENCES user_profiles(id),
  reopen_approval_date TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_job_status_history_job_id ON job_status_history(job_id);
CREATE INDEX IF NOT EXISTS idx_job_status_history_org_changed_at ON job_status_history(org_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_status_history_new_status ON job_status_history(new_status);

-- RLS Policies
ALTER TABLE job_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view job status history in their org"
  ON job_status_history FOR SELECT
  USING (org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert job status history in their org"
  ON job_status_history FOR INSERT
  WITH CHECK (org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()));

-- =====================================================
-- ADD MISSING COLUMNS TO JOBS TABLE
-- =====================================================

-- Add columns for close workflow
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS closed_by UUID REFERENCES user_profiles(id);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS closure_reason TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS closure_note TEXT;

-- Add columns for hold workflow
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS on_hold_reason TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS expected_reactivation_date DATE;

-- Add published tracking
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES user_profiles(id);

-- Add days_to_fill for analytics
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS days_to_fill INTEGER;
