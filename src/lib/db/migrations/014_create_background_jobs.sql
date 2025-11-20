-- Migration 014: Background Jobs System
-- Sprint 3: Workflow Engine & Core Services
-- Created: 2025-11-19
-- Purpose: Create PostgreSQL-based background job queue

-- ========================================
-- 1. BACKGROUND_JOBS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS background_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL, -- 'generate_document', 'send_bulk_email', 'import_data', 'export_data'
  payload JSONB NOT NULL, -- Job-specific data
  status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
  attempts INTEGER DEFAULT 0 NOT NULL,
  max_attempts INTEGER DEFAULT 3 NOT NULL,
  error_message TEXT,
  result JSONB, -- Job result (e.g., {documentId: '123', fileUrl: 'https://...'})
  priority INTEGER DEFAULT 5 NOT NULL, -- 1 (highest) to 10 (lowest)
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT valid_job_status CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  CONSTRAINT valid_priority CHECK (priority BETWEEN 1 AND 10),
  CONSTRAINT valid_job_type CHECK (job_type IN ('generate_document', 'send_email', 'send_bulk_email', 'import_data', 'export_data'))
);

CREATE INDEX idx_background_jobs_org_id ON background_jobs(org_id);
CREATE INDEX idx_background_jobs_job_type ON background_jobs(job_type);
CREATE INDEX idx_background_jobs_status ON background_jobs(status);
-- Partial index for pending jobs (most queried)
CREATE INDEX idx_background_jobs_pending ON background_jobs(priority ASC, created_at ASC)
  WHERE status = 'pending';
-- Failed jobs for retry
CREATE INDEX idx_background_jobs_failed ON background_jobs(attempts, created_at DESC)
  WHERE status = 'failed' AND attempts < max_attempts;

COMMENT ON TABLE background_jobs IS 'PostgreSQL-based background job queue';
COMMENT ON COLUMN background_jobs.priority IS '1 = highest priority, 10 = lowest';

-- ========================================
-- FUNCTIONS
-- ========================================

-- Dequeue next pending job (atomic operation)
CREATE OR REPLACE FUNCTION dequeue_next_job()
RETURNS TABLE (
  job_id UUID,
  job_type TEXT,
  payload JSONB,
  org_id UUID
) AS $$
BEGIN
  RETURN QUERY
  UPDATE background_jobs
  SET
    status = 'processing',
    started_at = NOW(),
    attempts = attempts + 1,
    updated_at = NOW()
  WHERE id = (
    SELECT id FROM background_jobs
    WHERE status = 'pending'
    ORDER BY priority ASC, created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  )
  RETURNING
    background_jobs.id,
    background_jobs.job_type,
    background_jobs.payload,
    background_jobs.org_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION dequeue_next_job IS 'Atomically dequeue next pending job (uses SKIP LOCKED for concurrency)';

-- Mark job completed
CREATE OR REPLACE FUNCTION mark_job_completed(
  p_job_id UUID,
  p_result JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE background_jobs
  SET
    status = 'completed',
    completed_at = NOW(),
    result = p_result,
    updated_at = NOW()
  WHERE id = p_job_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION mark_job_completed IS 'Mark a job as completed with optional result';

-- Mark job failed
CREATE OR REPLACE FUNCTION mark_job_failed(
  p_job_id UUID,
  p_error_message TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_attempts INTEGER;
  v_max_attempts INTEGER;
BEGIN
  SELECT attempts, max_attempts
  INTO v_attempts, v_max_attempts
  FROM background_jobs
  WHERE id = p_job_id;

  UPDATE background_jobs
  SET
    status = CASE
      WHEN v_attempts >= v_max_attempts THEN 'failed' -- Permanently failed
      ELSE 'pending' -- Retry
    END,
    error_message = p_error_message,
    updated_at = NOW()
  WHERE id = p_job_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION mark_job_failed IS 'Mark a job as failed (will retry if attempts < max_attempts)';

-- Get job queue stats
CREATE OR REPLACE FUNCTION get_job_queue_stats()
RETURNS TABLE (
  job_type TEXT,
  pending_count BIGINT,
  processing_count BIGINT,
  completed_count BIGINT,
  failed_count BIGINT,
  avg_processing_seconds NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bj.job_type,
    COUNT(*) FILTER (WHERE bj.status = 'pending') AS pending_count,
    COUNT(*) FILTER (WHERE bj.status = 'processing') AS processing_count,
    COUNT(*) FILTER (WHERE bj.status = 'completed') AS completed_count,
    COUNT(*) FILTER (WHERE bj.status = 'failed') AS failed_count,
    ROUND(AVG(EXTRACT(EPOCH FROM (bj.completed_at - bj.started_at)))::NUMERIC, 2) AS avg_processing_seconds
  FROM background_jobs bj
  WHERE bj.org_id = auth_user_org_id() OR user_is_admin()
  GROUP BY bj.job_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_job_queue_stats IS 'Get job queue statistics by job type';

-- ========================================
-- RLS POLICIES
-- ========================================

ALTER TABLE background_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view jobs in their org"
  ON background_jobs FOR SELECT
  USING (org_id = auth_user_org_id() OR user_is_admin());

CREATE POLICY "Users can create jobs in their org"
  ON background_jobs FOR INSERT
  WITH CHECK (org_id = auth_user_org_id());

CREATE POLICY "Service role can update jobs"
  ON background_jobs FOR UPDATE
  USING (TRUE); -- Needed for job processor

-- ========================================
-- TRIGGERS
-- ========================================

CREATE TRIGGER trigger_background_jobs_updated_at
  BEFORE UPDATE ON background_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
