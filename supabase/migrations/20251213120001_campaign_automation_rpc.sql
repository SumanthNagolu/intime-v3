-- ============================================
-- WAVE 6 PHASE 4: CAMPAIGN AUTOMATION RPC FUNCTIONS
-- Issue: CAMPAIGNS-01
-- Purpose: Add RPC functions for atomic stat increments
-- ============================================

-- ============================================
-- RPC: INCREMENT ENROLLMENT EMAILS SENT
-- ============================================

CREATE OR REPLACE FUNCTION increment_enrollment_emails_sent(
  p_enrollment_id UUID,
  p_first_contact BOOLEAN DEFAULT FALSE
)
RETURNS void AS $$
BEGIN
  UPDATE campaign_enrollments
  SET
    emails_sent = COALESCE(emails_sent, 0) + 1,
    last_step_at = now(),
    last_contacted_at = now(),
    first_contacted_at = CASE
      WHEN p_first_contact AND first_contacted_at IS NULL THEN now()
      ELSE first_contacted_at
    END,
    status = CASE
      WHEN status = 'enrolled' THEN 'contacted'
      ELSE status
    END
  WHERE id = p_enrollment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_enrollment_emails_sent IS 'Atomically increments emails_sent counter and updates contact timestamps';


-- ============================================
-- RPC: INCREMENT CAMPAIGN EMAILS SENT
-- ============================================

CREATE OR REPLACE FUNCTION increment_campaign_emails_sent(
  p_campaign_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE campaigns
  SET
    emails_sent = COALESCE(emails_sent, 0) + 1,
    total_sent = COALESCE(total_sent, 0) + 1,
    updated_at = now()
  WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_campaign_emails_sent IS 'Atomically increments campaign email and total sent counters';


-- ============================================
-- RPC: INCREMENT ENROLLMENT LINKEDIN SENT
-- ============================================

CREATE OR REPLACE FUNCTION increment_enrollment_linkedin_sent(
  p_enrollment_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE campaign_enrollments
  SET
    linkedin_sent = COALESCE(linkedin_sent, 0) + 1,
    last_step_at = now()
  WHERE id = p_enrollment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- RPC: INCREMENT ENROLLMENT CALLS MADE
-- ============================================

CREATE OR REPLACE FUNCTION increment_enrollment_calls_made(
  p_enrollment_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE campaign_enrollments
  SET
    calls_made = COALESCE(calls_made, 0) + 1,
    last_step_at = now()
  WHERE id = p_enrollment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- RPC: INCREMENT ENROLLMENT SMS SENT
-- ============================================

CREATE OR REPLACE FUNCTION increment_enrollment_sms_sent(
  p_enrollment_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE campaign_enrollments
  SET
    sms_sent = COALESCE(sms_sent, 0) + 1,
    last_step_at = now()
  WHERE id = p_enrollment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
