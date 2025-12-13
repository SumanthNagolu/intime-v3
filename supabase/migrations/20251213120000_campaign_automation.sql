-- ============================================
-- WAVE 6 PHASE 4: CAMPAIGN AUTOMATION
-- Issue: CAMPAIGNS-01
-- Purpose: Add columns for campaign automation engine
-- ============================================

-- ============================================
-- CAMPAIGN TABLE ENHANCEMENTS
-- ============================================

-- Add send window configuration columns to campaigns table
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS send_window_start TIME DEFAULT '09:00',
  ADD COLUMN IF NOT EXISTS send_window_end TIME DEFAULT '17:00',
  ADD COLUMN IF NOT EXISTS send_days TEXT[] DEFAULT ARRAY['mon', 'tue', 'wed', 'thu', 'fri'],
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York',
  ADD COLUMN IF NOT EXISTS total_sent INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_completed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_active INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_bounced INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_unsubscribed INTEGER DEFAULT 0;

-- Add comments
COMMENT ON COLUMN campaigns.send_window_start IS 'Start time for sending campaign messages (in campaign timezone)';
COMMENT ON COLUMN campaigns.send_window_end IS 'End time for sending campaign messages (in campaign timezone)';
COMMENT ON COLUMN campaigns.send_days IS 'Days of week to send messages (mon, tue, wed, thu, fri, sat, sun)';
COMMENT ON COLUMN campaigns.timezone IS 'IANA timezone identifier for send window calculations';
COMMENT ON COLUMN campaigns.total_sent IS 'Total number of sequence steps sent across all enrollments';
COMMENT ON COLUMN campaigns.total_completed IS 'Total number of enrollments that completed all sequence steps';
COMMENT ON COLUMN campaigns.total_active IS 'Total number of currently active enrollments';


-- ============================================
-- CAMPAIGN ENROLLMENTS TABLE ENHANCEMENTS
-- ============================================

-- Add automation tracking columns to campaign_enrollments table
ALTER TABLE campaign_enrollments
  ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_step_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS steps_completed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_step_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ab_variant TEXT,
  ADD COLUMN IF NOT EXISTS emails_sent INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS linkedin_sent INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS calls_made INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sms_sent INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS error_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_error TEXT,
  ADD COLUMN IF NOT EXISTS last_error_at TIMESTAMPTZ;

-- Add comments
COMMENT ON COLUMN campaign_enrollments.current_step IS 'Current step number in the sequence (0 = not started)';
COMMENT ON COLUMN campaign_enrollments.next_step_at IS 'When the next sequence step should be executed';
COMMENT ON COLUMN campaign_enrollments.steps_completed IS 'Number of sequence steps successfully completed';
COMMENT ON COLUMN campaign_enrollments.last_step_at IS 'Timestamp of last step execution';
COMMENT ON COLUMN campaign_enrollments.ab_variant IS 'Assigned A/B test variant identifier';
COMMENT ON COLUMN campaign_enrollments.emails_sent IS 'Count of emails sent to this enrollment';
COMMENT ON COLUMN campaign_enrollments.linkedin_sent IS 'Count of LinkedIn messages/tasks created';
COMMENT ON COLUMN campaign_enrollments.calls_made IS 'Count of call tasks created';
COMMENT ON COLUMN campaign_enrollments.sms_sent IS 'Count of SMS messages sent';
COMMENT ON COLUMN campaign_enrollments.error_count IS 'Number of consecutive errors encountered';
COMMENT ON COLUMN campaign_enrollments.last_error IS 'Last error message encountered';
COMMENT ON COLUMN campaign_enrollments.last_error_at IS 'Timestamp of last error';


-- ============================================
-- CAMPAIGN SEQUENCE LOGS ENHANCEMENTS
-- ============================================

-- Add additional tracking columns to campaign_sequence_logs
ALTER TABLE campaign_sequence_logs
  ADD COLUMN IF NOT EXISTS sequence_id UUID,
  ADD COLUMN IF NOT EXISTS ab_variant TEXT,
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS template_id UUID,
  ADD COLUMN IF NOT EXISTS variables_used JSONB,
  ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Update status check constraint
DO $$
BEGIN
  -- Drop old constraint if exists
  ALTER TABLE campaign_sequence_logs DROP CONSTRAINT IF EXISTS campaign_sequence_logs_status_check;
  -- Add column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaign_sequence_logs' AND column_name = 'status'
  ) THEN
    ALTER TABLE campaign_sequence_logs ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;
  -- Add new constraint
  ALTER TABLE campaign_sequence_logs ADD CONSTRAINT campaign_sequence_logs_status_check
    CHECK (status IS NULL OR status IN ('pending', 'sent', 'skipped', 'failed', 'bounced', 'opened', 'clicked', 'replied'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;


-- ============================================
-- INDEXES FOR AUTOMATION ENGINE QUERIES
-- ============================================

-- Index for finding due enrollments efficiently
CREATE INDEX IF NOT EXISTS idx_campaign_enrollments_next_step
  ON campaign_enrollments(next_step_at)
  WHERE status = 'enrolled' AND next_step_at IS NOT NULL;

-- Index for active campaign enrollments by status
CREATE INDEX IF NOT EXISTS idx_campaign_enrollments_active
  ON campaign_enrollments(campaign_id, status, next_step_at)
  WHERE status IN ('enrolled', 'contacted', 'engaged');

-- Index for sequence logs by enrollment
CREATE INDEX IF NOT EXISTS idx_campaign_sequence_logs_enrollment
  ON campaign_sequence_logs(enrollment_id, step_number);


-- ============================================
-- SEQUENCE TEMPLATES STEP STRUCTURE VALIDATION
-- ============================================

-- Add comment documenting the expected JSONB structure for steps
COMMENT ON COLUMN sequence_templates.steps IS 'Array of sequence step objects. Each step: { "day": number, "channel": "email"|"linkedin"|"phone"|"sms"|"wait"|"task", "subject": string, "body": string, "action": string, "delay_hours": number, "delay_minutes": number, "ab_variants": [{ "id": string, "subject": string, "body": string, "weight": number }], "skip_conditions": [{ "field": string, "operator": string, "value": any }], "stop_on_reply": boolean, "task_config": { "title": string, "description": string, "priority": string } }';


-- ============================================
-- FUNCTION: SCHEDULE INITIAL ENROLLMENT STEP
-- ============================================

CREATE OR REPLACE FUNCTION schedule_enrollment_first_step()
RETURNS TRIGGER AS $$
DECLARE
  v_template_id UUID;
  v_first_step JSONB;
  v_delay_minutes INTEGER;
BEGIN
  -- Only process new enrollments with enrolled status
  IF NEW.status != 'enrolled' THEN
    RETURN NEW;
  END IF;

  -- Get the first sequence template for this campaign
  SELECT st.id, st.steps->0
  INTO v_template_id, v_first_step
  FROM campaign_sequences cs
  JOIN sequence_templates st ON st.id = cs.sequence_template_id
  WHERE cs.campaign_id = NEW.campaign_id
    AND cs.is_active = true
    AND st.is_active = true
  ORDER BY st.created_at
  LIMIT 1;

  -- If no template found, don't schedule
  IF v_first_step IS NULL THEN
    RETURN NEW;
  END IF;

  -- Calculate delay from first step
  v_delay_minutes := COALESCE((v_first_step->>'delay_minutes')::INTEGER, 0)
    + COALESCE((v_first_step->>'delay_hours')::INTEGER, 0) * 60
    + COALESCE((v_first_step->>'day')::INTEGER, 0) * 24 * 60;

  -- Schedule the first step
  NEW.next_step_at := now() + (v_delay_minutes || ' minutes')::INTERVAL;
  NEW.current_step := 0;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new enrollments
DROP TRIGGER IF EXISTS trigger_schedule_enrollment ON campaign_enrollments;
CREATE TRIGGER trigger_schedule_enrollment
  BEFORE INSERT ON campaign_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION schedule_enrollment_first_step();


-- ============================================
-- FUNCTION: UPDATE CAMPAIGN STATS
-- ============================================

CREATE OR REPLACE FUNCTION update_campaign_enrollment_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- On insert, increment total_active
  IF TG_OP = 'INSERT' THEN
    UPDATE campaigns
    SET total_active = total_active + 1,
        updated_at = now()
    WHERE id = NEW.campaign_id;
    RETURN NEW;
  END IF;

  -- On status change
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Decrement active count if moving out of active status
    IF OLD.status IN ('enrolled', 'contacted', 'engaged') AND NEW.status NOT IN ('enrolled', 'contacted', 'engaged') THEN
      UPDATE campaigns
      SET total_active = GREATEST(0, total_active - 1),
          updated_at = now()
      WHERE id = NEW.campaign_id;
    END IF;

    -- Increment completed if status changed to converted or completed
    IF NEW.status = 'converted' OR NEW.sequence_status = 'completed' THEN
      UPDATE campaigns
      SET total_completed = total_completed + 1,
          updated_at = now()
      WHERE id = NEW.campaign_id;
    END IF;

    -- Increment bounced count
    IF NEW.status = 'bounced' THEN
      UPDATE campaigns
      SET total_bounced = COALESCE(total_bounced, 0) + 1,
          updated_at = now()
      WHERE id = NEW.campaign_id;
    END IF;

    -- Increment unsubscribed count
    IF NEW.status = 'unsubscribed' THEN
      UPDATE campaigns
      SET total_unsubscribed = COALESCE(total_unsubscribed, 0) + 1,
          updated_at = now()
      WHERE id = NEW.campaign_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for enrollment stat updates
DROP TRIGGER IF EXISTS trigger_campaign_enrollment_stats ON campaign_enrollments;
CREATE TRIGGER trigger_campaign_enrollment_stats
  AFTER INSERT OR UPDATE OF status, sequence_status ON campaign_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_enrollment_stats();


-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION schedule_enrollment_first_step IS 'Automatically schedules the first sequence step when a new enrollment is created';
COMMENT ON FUNCTION update_campaign_enrollment_stats IS 'Maintains campaign-level statistics based on enrollment status changes';
