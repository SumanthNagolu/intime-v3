-- =====================================================
-- Migration: Account Management Tables
-- Date: 2025-12-06
-- Description: Tables for C01-C07 Account Management use cases
--              (meeting notes, escalations, account enhancements)
-- =====================================================

-- =====================================================
-- 1. ACCOUNTS ENHANCEMENTS
-- Add additional fields needed for account management
-- =====================================================

-- Add billing and onboarding fields to accounts
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'pending'; -- pending, in_progress, completed
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS onboarding_completed_by UUID REFERENCES user_profiles(id);

ALTER TABLE accounts ADD COLUMN IF NOT EXISTS nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10);
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMPTZ;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS next_contact_date TIMESTAMPTZ;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS relationship_health TEXT DEFAULT 'healthy'; -- healthy, attention, at_risk

-- Billing info
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS billing_entity_name TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS billing_email TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS billing_phone TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS billing_address TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS billing_city TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS billing_state TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS billing_postal_code TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS billing_country TEXT DEFAULT 'USA';
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS billing_currency TEXT DEFAULT 'USD';
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS billing_frequency TEXT DEFAULT 'monthly'; -- weekly, biweekly, monthly
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS po_required BOOLEAN DEFAULT FALSE;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS current_po_number TEXT;

-- Communication preferences
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT DEFAULT 'email';
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS meeting_cadence TEXT DEFAULT 'weekly';
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS communication_channel TEXT; -- email, phone, slack, teams

-- Company details
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS tax_id TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS funding_stage TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS company_size TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Owner and management
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES user_profiles(id);

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_accounts_onboarding_status ON accounts(onboarding_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_accounts_relationship_health ON accounts(relationship_health) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_accounts_last_contact ON accounts(last_contact_date);
CREATE INDEX IF NOT EXISTS idx_accounts_owner_id ON accounts(owner_id);

-- =====================================================
-- 2. MEETING NOTES TABLE
-- Tracks scheduled and completed meetings (C05)
-- =====================================================

CREATE TABLE IF NOT EXISTS meeting_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Association
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  contact_ids UUID[], -- Array of contact IDs who attended

  -- Meeting details
  meeting_type TEXT NOT NULL DEFAULT 'check_in', -- kickoff, check_in, qbr, intake, escalation, other
  title TEXT NOT NULL,
  description TEXT,

  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,

  -- Location
  location_type TEXT DEFAULT 'video', -- video, phone, in_person
  location_details TEXT, -- zoom link, address, etc.

  -- Status
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled, no_show

  -- Content (structured notes)
  agenda TEXT, -- Pre-meeting agenda
  discussion_notes TEXT, -- Main meeting notes
  key_takeaways TEXT[], -- Array of key points

  -- Action items stored as JSONB for flexibility
  action_items JSONB DEFAULT '[]'::JSONB,
  -- Format: [{ "description": "...", "assignee_id": "uuid", "due_date": "...", "completed": false }]

  -- Follow-up
  next_meeting_scheduled TIMESTAMPTZ,
  follow_up_notes TEXT,

  -- Client feedback
  client_satisfaction TEXT, -- very_satisfied, satisfied, neutral, unsatisfied
  client_feedback TEXT,

  -- Related entities
  related_job_ids UUID[], -- Jobs discussed
  related_candidate_ids UUID[], -- Candidates discussed
  related_escalation_id UUID, -- If meeting is about an escalation

  -- Metadata
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ
);

-- Indexes for meeting_notes
CREATE INDEX IF NOT EXISTS idx_meeting_notes_org ON meeting_notes(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_meeting_notes_account ON meeting_notes(account_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_meeting_notes_scheduled ON meeting_notes(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_status ON meeting_notes(status);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_type ON meeting_notes(meeting_type);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_created_by ON meeting_notes(created_by);

-- Auto-update updated_at
CREATE TRIGGER trigger_meeting_notes_updated_at
  BEFORE UPDATE ON meeting_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. ESCALATIONS TABLE
-- Tracks client escalations and issues (C06)
-- =====================================================

CREATE TABLE IF NOT EXISTS escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Human-readable ID
  escalation_number TEXT NOT NULL UNIQUE,

  -- Association
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

  -- Escalation type and severity
  escalation_type TEXT NOT NULL, -- quality_concern, candidate_issue, billing_dispute, sla_violation, contract_dispute, communication, compliance, relationship, other
  severity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical

  -- Issue details
  issue_summary TEXT NOT NULL, -- 50-200 chars
  detailed_description TEXT NOT NULL,

  -- Related entities
  related_entities JSONB DEFAULT '[]'::JSONB, -- [{type: "job", id: "uuid", title: "..."}, ...]

  -- Impact assessment
  client_impact TEXT[], -- revenue_at_risk, relationship_damage, legal_compliance, timeline_impact, reputation_damage
  root_cause TEXT,

  -- Response
  immediate_actions TEXT,
  resolution_plan TEXT,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'open', -- open, in_progress, resolved, escalated, closed

  -- SLA tracking
  sla_response_due TIMESTAMPTZ, -- Based on severity
  sla_resolution_due TIMESTAMPTZ,
  sla_response_met BOOLEAN,
  sla_resolution_met BOOLEAN,

  -- Assignment
  created_by UUID REFERENCES user_profiles(id) NOT NULL,
  assigned_to UUID REFERENCES user_profiles(id),
  escalated_to UUID REFERENCES user_profiles(id), -- Manager or director

  -- Resolution
  resolved_by UUID REFERENCES user_profiles(id),
  resolved_at TIMESTAMPTZ,
  resolution_summary TEXT,
  resolution_actions TEXT,
  time_to_resolve INTERVAL,

  -- Client satisfaction post-resolution
  client_satisfaction TEXT, -- very_satisfied, satisfied, neutral, unsatisfied

  -- Lessons learned
  lessons_learned TEXT,
  preventive_measures TEXT,

  -- Notification tracking
  manager_notification_type TEXT, -- immediate, daily_summary
  manager_notified_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Indexes for client escalations (named to avoid conflict with ai_mentor_escalations)
CREATE INDEX IF NOT EXISTS idx_client_escalations_org ON escalations(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_client_escalations_account ON escalations(account_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_client_escalations_status ON escalations(status);
CREATE INDEX IF NOT EXISTS idx_client_escalations_severity ON escalations(severity);
CREATE INDEX IF NOT EXISTS idx_client_escalations_type ON escalations(escalation_type);
CREATE INDEX IF NOT EXISTS idx_client_escalations_assigned ON escalations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_client_escalations_created_by ON escalations(created_by);
CREATE INDEX IF NOT EXISTS idx_client_escalations_sla_response ON escalations(sla_response_due) WHERE status IN ('open', 'in_progress');
CREATE INDEX IF NOT EXISTS idx_client_escalations_number ON escalations(escalation_number);

-- Auto-update updated_at
CREATE TRIGGER trigger_escalations_updated_at
  BEFORE UPDATE ON escalations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. ESCALATION UPDATES TABLE
-- Tracks updates to escalations (timeline)
-- =====================================================

CREATE TABLE IF NOT EXISTS escalation_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escalation_id UUID NOT NULL REFERENCES escalations(id) ON DELETE CASCADE,

  -- Update type
  update_type TEXT NOT NULL, -- note, status_change, assignment_change, resolution_update, escalated, customer_response

  -- Content
  content TEXT NOT NULL,

  -- Status tracking
  old_status TEXT,
  new_status TEXT,

  -- Assignment tracking
  old_assignee_id UUID REFERENCES user_profiles(id),
  new_assignee_id UUID REFERENCES user_profiles(id),

  -- Author
  created_by UUID REFERENCES user_profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Visibility
  is_internal BOOLEAN DEFAULT TRUE -- If false, visible to client
);

-- Indexes for escalation_updates
CREATE INDEX IF NOT EXISTS idx_escalation_updates_escalation ON escalation_updates(escalation_id);
CREATE INDEX IF NOT EXISTS idx_escalation_updates_type ON escalation_updates(update_type);
CREATE INDEX IF NOT EXISTS idx_escalation_updates_created_at ON escalation_updates(created_at);

-- =====================================================
-- 5. ACCOUNT NOTES TABLE
-- General notes for accounts (separate from activities)
-- =====================================================

CREATE TABLE IF NOT EXISTS account_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

  -- Note content
  title TEXT,
  content TEXT NOT NULL,
  note_type TEXT DEFAULT 'general', -- general, internal, important, reminder

  -- Visibility
  is_pinned BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_by UUID REFERENCES user_profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ
);

-- Indexes for account_notes
CREATE INDEX IF NOT EXISTS idx_account_notes_org ON account_notes(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_account_notes_account ON account_notes(account_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_account_notes_created_by ON account_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_account_notes_pinned ON account_notes(account_id, is_pinned) WHERE is_pinned = TRUE AND deleted_at IS NULL;

-- Auto-update updated_at
CREATE TRIGGER trigger_account_notes_updated_at
  BEFORE UPDATE ON account_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. CONTACT ENHANCEMENTS
-- Add additional fields to contacts table
-- =====================================================

-- Add relationship and contact fields to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS relationship_notes TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE;

-- Create index for primary contacts by company
CREATE INDEX IF NOT EXISTS idx_contacts_primary_company ON contacts(company_id, is_primary) WHERE is_primary = TRUE AND deleted_at IS NULL;

-- =====================================================
-- 7. SEQUENCE FOR ESCALATION NUMBERS
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS escalation_number_seq START WITH 1000;

-- Function to generate escalation number
CREATE OR REPLACE FUNCTION generate_escalation_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ESC-' || nextval('escalation_number_seq');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-set escalation number
CREATE OR REPLACE FUNCTION set_escalation_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.escalation_number IS NULL THEN
    NEW.escalation_number := generate_escalation_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_escalation_number
  BEFORE INSERT ON escalations
  FOR EACH ROW EXECUTE FUNCTION set_escalation_number();

-- =====================================================
-- 8. FUNCTION TO CALCULATE SLA DUE DATES
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_escalation_sla(p_severity TEXT, p_created_at TIMESTAMPTZ)
RETURNS TABLE (response_due TIMESTAMPTZ, resolution_due TIMESTAMPTZ) AS $$
BEGIN
  -- SLA based on severity:
  -- Critical: Response 1 hour, Resolution 24 hours
  -- High: Response 2 hours, Resolution 48 hours
  -- Medium: Response 4 hours, Resolution 5 days
  -- Low: Response 24 hours, Resolution 10 days

  CASE p_severity
    WHEN 'critical' THEN
      response_due := p_created_at + INTERVAL '1 hour';
      resolution_due := p_created_at + INTERVAL '24 hours';
    WHEN 'high' THEN
      response_due := p_created_at + INTERVAL '2 hours';
      resolution_due := p_created_at + INTERVAL '48 hours';
    WHEN 'medium' THEN
      response_due := p_created_at + INTERVAL '4 hours';
      resolution_due := p_created_at + INTERVAL '5 days';
    WHEN 'low' THEN
      response_due := p_created_at + INTERVAL '24 hours';
      resolution_due := p_created_at + INTERVAL '10 days';
    ELSE
      response_due := p_created_at + INTERVAL '4 hours';
      resolution_due := p_created_at + INTERVAL '5 days';
  END CASE;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 9. ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS
ALTER TABLE meeting_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_notes ENABLE ROW LEVEL SECURITY;

-- Meeting Notes Policies
DROP POLICY IF EXISTS meeting_notes_org_isolation ON meeting_notes;
CREATE POLICY meeting_notes_org_isolation ON meeting_notes
  FOR ALL
  USING (org_id = auth_org_id());

DROP POLICY IF EXISTS meeting_notes_employee_access ON meeting_notes;
CREATE POLICY meeting_notes_employee_access ON meeting_notes
  FOR ALL
  USING (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('recruiter')
  );

-- Escalations Policies
DROP POLICY IF EXISTS escalations_org_isolation ON escalations;
CREATE POLICY escalations_org_isolation ON escalations
  FOR ALL
  USING (org_id = auth_org_id());

DROP POLICY IF EXISTS escalations_employee_access ON escalations;
CREATE POLICY escalations_employee_access ON escalations
  FOR ALL
  USING (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('recruiter')
  );

-- Escalation Updates Policies
DROP POLICY IF EXISTS escalation_updates_access ON escalation_updates;
CREATE POLICY escalation_updates_access ON escalation_updates
  FOR ALL
  USING (
    escalation_id IN (
      SELECT id FROM escalations WHERE org_id = auth_org_id()
    )
  );

-- Account Notes Policies
DROP POLICY IF EXISTS account_notes_org_isolation ON account_notes;
CREATE POLICY account_notes_org_isolation ON account_notes
  FOR ALL
  USING (org_id = auth_org_id());

DROP POLICY IF EXISTS account_notes_employee_access ON account_notes;
CREATE POLICY account_notes_employee_access ON account_notes
  FOR ALL
  USING (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('recruiter')
  );

-- =====================================================
-- 10. COMMENTS
-- =====================================================

COMMENT ON TABLE meeting_notes IS 'Tracks scheduled and completed client meetings (C05)';
COMMENT ON TABLE escalations IS 'Tracks client escalations and issues (C06)';
COMMENT ON TABLE escalation_updates IS 'Timeline of updates for escalations';
COMMENT ON TABLE account_notes IS 'General notes attached to accounts';

COMMENT ON COLUMN accounts.onboarding_status IS 'Account onboarding status: pending, in_progress, completed';
COMMENT ON COLUMN accounts.relationship_health IS 'Overall account health: healthy, attention, at_risk';
COMMENT ON COLUMN escalations.escalation_number IS 'Human-readable ID like ESC-1001';
COMMENT ON COLUMN escalations.severity IS 'Severity level affecting SLA: low, medium, high, critical';
