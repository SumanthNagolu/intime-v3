-- ============================================================================
-- WAVE 4: JOBS-01 - Add unified company/contact references and enhanced fields
-- ============================================================================
-- This migration adds:
-- 1. Client/end client/vendor company references
-- 2. Hiring manager and HR contact references
-- 3. External job ID and priority/SLA tracking
-- 4. Fee structure fields
-- ============================================================================

-- Step 1: Add company references
-- Note: jobs already has company_id, we add client_company_id as an alias/backup
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS client_company_id UUID REFERENCES companies(id);

ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS end_client_company_id UUID REFERENCES companies(id);

ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS vendor_company_id UUID REFERENCES companies(id);

-- Step 2: Add contact references for hiring manager and HR contact
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS hiring_manager_contact_id UUID REFERENCES contacts(id);

ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS hr_contact_id UUID REFERENCES contacts(id);

-- Step 3: Add enhanced tracking fields
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS external_job_id VARCHAR(100);

ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS priority_rank INTEGER DEFAULT 0;

ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS sla_days INTEGER DEFAULT 30;

ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS intake_completed_at TIMESTAMPTZ;

ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS intake_completed_by UUID REFERENCES user_profiles(id);

-- Step 4: Add fee structure fields
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS fee_type VARCHAR(50) DEFAULT 'percentage'
  CHECK (fee_type IS NULL OR fee_type IN ('percentage', 'flat', 'hourly_spread'));

ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS fee_percentage NUMERIC(5,2);

ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS fee_flat_amount NUMERIC(10,2);

-- Step 5: Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_jobs_client_company ON jobs(client_company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_end_client ON jobs(end_client_company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_vendor ON jobs(vendor_company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_hiring_manager ON jobs(hiring_manager_contact_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_external_id ON jobs(org_id, external_job_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_priority_rank ON jobs(org_id, priority_rank DESC) WHERE status IN ('open', 'active') AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_sla ON jobs(org_id, sla_days) WHERE status IN ('open', 'active') AND deleted_at IS NULL;

-- Step 6: Data migration - Copy company_id to client_company_id for existing records
UPDATE jobs
SET client_company_id = company_id
WHERE client_company_id IS NULL AND company_id IS NOT NULL;

-- Step 7: Map existing priority to priority_rank
UPDATE jobs SET priority_rank =
  CASE priority
    WHEN 'urgent' THEN 1
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'normal' THEN 3
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
    ELSE 0
  END
WHERE priority_rank = 0 OR priority_rank IS NULL;

-- Step 8: Add comments for documentation
COMMENT ON COLUMN jobs.client_company_id IS 'Direct client company (unified companies table)';
COMMENT ON COLUMN jobs.end_client_company_id IS 'End client if different from direct client';
COMMENT ON COLUMN jobs.vendor_company_id IS 'Vendor company if job is through vendor';
COMMENT ON COLUMN jobs.hiring_manager_contact_id IS 'Hiring manager contact for this job';
COMMENT ON COLUMN jobs.hr_contact_id IS 'HR contact for this job';
COMMENT ON COLUMN jobs.external_job_id IS 'Client internal job ID for reference';
COMMENT ON COLUMN jobs.priority_rank IS 'Priority ranking: 1=Critical/Urgent, 2=High, 3=Normal, 4=Low';
COMMENT ON COLUMN jobs.sla_days IS 'SLA for time-to-fill in days';
COMMENT ON COLUMN jobs.intake_completed_at IS 'Timestamp when job intake was completed';
COMMENT ON COLUMN jobs.intake_completed_by IS 'User who completed the job intake';
COMMENT ON COLUMN jobs.fee_type IS 'Fee type: percentage, flat, or hourly_spread';
COMMENT ON COLUMN jobs.fee_percentage IS 'Fee percentage (e.g., 20.00 for 20%)';
COMMENT ON COLUMN jobs.fee_flat_amount IS 'Flat fee amount if fee_type is flat';
