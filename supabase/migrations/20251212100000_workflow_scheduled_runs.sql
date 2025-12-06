-- Migration: Workflow Scheduled Runs Support
-- Adds table for tracking scheduled workflow runs and enhances execution logs

-- ============================================
-- WORKFLOW SCHEDULED RUNS (Track last run times)
-- ============================================
CREATE TABLE workflow_scheduled_runs (
  workflow_id UUID PRIMARY KEY REFERENCES workflows(id) ON DELETE CASCADE,
  last_run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  run_count INTEGER DEFAULT 0,
  last_records_processed INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE workflow_scheduled_runs IS 'Tracks last run time for scheduled workflows to prevent duplicate executions';
COMMENT ON COLUMN workflow_scheduled_runs.run_count IS 'Total number of times this scheduled workflow has been triggered';
COMMENT ON COLUMN workflow_scheduled_runs.last_records_processed IS 'Number of records processed in the last run';

-- Add additional columns to execution logs for better tracking
ALTER TABLE workflow_execution_logs
  ADD COLUMN IF NOT EXISTS log_type TEXT,
  ADD COLUMN IF NOT EXISTS message TEXT,
  ADD COLUMN IF NOT EXISTS step_order INTEGER,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Index for scheduled runs
CREATE INDEX idx_workflow_scheduled_runs_last_run ON workflow_scheduled_runs(last_run_at);

-- RLS for scheduled runs
ALTER TABLE workflow_scheduled_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY workflow_scheduled_runs_via_workflow ON workflow_scheduled_runs
  FOR ALL USING (
    workflow_id IN (SELECT id FROM workflows WHERE org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()))
  );

-- Service role can always access for edge functions
CREATE POLICY workflow_scheduled_runs_service_role ON workflow_scheduled_runs
  FOR ALL TO service_role USING (true);

-- Also add service role policies for edge functions to access other tables
CREATE POLICY workflows_service_role ON workflows
  FOR ALL TO service_role USING (true);

CREATE POLICY workflow_executions_service_role ON workflow_executions
  FOR ALL TO service_role USING (true);

CREATE POLICY workflow_approvals_service_role ON workflow_approvals
  FOR ALL TO service_role USING (true);

CREATE POLICY workflow_steps_service_role ON workflow_steps
  FOR ALL TO service_role USING (true);

CREATE POLICY workflow_actions_service_role ON workflow_actions
  FOR ALL TO service_role USING (true);

CREATE POLICY workflow_execution_logs_service_role ON workflow_execution_logs
  FOR ALL TO service_role USING (true);

-- Grant access
GRANT SELECT, INSERT, UPDATE, DELETE ON workflow_scheduled_runs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON workflow_scheduled_runs TO service_role;

-- ============================================
-- TRIGGER TO UPDATE updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_workflow_scheduled_runs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.run_count = COALESCE(OLD.run_count, 0) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workflow_scheduled_runs_updated_at
  BEFORE UPDATE ON workflow_scheduled_runs
  FOR EACH ROW
  EXECUTE FUNCTION update_workflow_scheduled_runs_updated_at();
