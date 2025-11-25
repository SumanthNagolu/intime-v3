-- =====================================================
-- Migration: TA (Talent Acquisition) + HR Modules
-- Date: 2024-11-24
-- Description: Outreach campaigns, HR workflows, payroll, performance management
-- =====================================================

-- =====================================================
-- TALENT ACQUISITION MODULE
-- =====================================================

-- =====================================================
-- 1. CAMPAIGNS (Outreach Campaigns)
-- =====================================================

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Campaign details
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL DEFAULT 'talent_sourcing', -- 'talent_sourcing', 'business_development', 'mixed'

  -- Channel
  channel TEXT NOT NULL DEFAULT 'email', -- 'linkedin', 'email', 'combined'

  -- Status
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed', 'archived'

  -- Targeting
  target_audience TEXT,
  target_locations TEXT[],
  target_skills TEXT[],
  target_company_sizes TEXT[],

  -- A/B Testing
  is_ab_test BOOLEAN DEFAULT false,
  variant_a_template_id UUID, -- FK to email_templates (existing table!)
  variant_b_template_id UUID,
  ab_split_percentage INTEGER DEFAULT 50,

  -- Goals
  target_contacts_count INTEGER,
  target_response_rate NUMERIC(5,2),
  target_conversion_count INTEGER,

  -- Real-time metrics (aggregated from campaign_contacts)
  contacts_reached INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  linkedin_messages_sent INTEGER DEFAULT 0,
  responses_received INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  response_rate NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN emails_sent > 0
      THEN ROUND((responses_received::numeric / emails_sent * 100), 2)
      ELSE 0
    END
  ) STORED,

  -- Dates
  start_date DATE,
  end_date DATE,

  -- Assignment
  owner_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id)
);

-- Indexes
CREATE INDEX idx_campaigns_org ON campaigns(org_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_owner ON campaigns(owner_id);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);

-- Auto-update updated_at
CREATE TRIGGER trigger_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. CAMPAIGN_CONTACTS (Target List)
-- =====================================================

CREATE TABLE campaign_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Contact type
  contact_type TEXT NOT NULL DEFAULT 'candidate', -- 'candidate', 'business_lead'

  -- Existing entity (if already in system)
  user_id UUID REFERENCES user_profiles(id),
  lead_id UUID REFERENCES leads(id),

  -- Contact info (if not in system yet)
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  linkedin_url TEXT,
  company_name TEXT,
  title TEXT,

  -- Outreach status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'opened', 'responded', 'converted', 'bounced', 'unsubscribed'

  -- A/B Test variant
  ab_variant TEXT, -- 'A', 'B', null
  template_used_id UUID, -- FK to email_templates (existing!)

  -- Engagement
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  response_text TEXT,

  -- Conversion
  converted_at TIMESTAMPTZ,
  conversion_type TEXT, -- 'applied_to_job', 'scheduled_call', 'became_deal', 'became_candidate'
  conversion_entity_id UUID, -- ID of resulting submission, lead, deal, etc.

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_campaign_contacts_campaign ON campaign_contacts(campaign_id);
CREATE INDEX idx_campaign_contacts_status ON campaign_contacts(status);
CREATE INDEX idx_campaign_contacts_email ON campaign_contacts(email);
CREATE INDEX idx_campaign_contacts_user ON campaign_contacts(user_id);
CREATE INDEX idx_campaign_contacts_lead ON campaign_contacts(lead_id);

-- Auto-update campaign metrics
CREATE OR REPLACE FUNCTION update_campaign_metrics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE campaigns SET
    contacts_reached = (SELECT COUNT(*) FROM campaign_contacts WHERE campaign_id = NEW.campaign_id),
    emails_sent = (SELECT COUNT(*) FROM campaign_contacts WHERE campaign_id = NEW.campaign_id AND status NOT IN ('pending', 'bounced')),
    responses_received = (SELECT COUNT(*) FROM campaign_contacts WHERE campaign_id = NEW.campaign_id AND status = 'responded'),
    conversions = (SELECT COUNT(*) FROM campaign_contacts WHERE campaign_id = NEW.campaign_id AND status = 'converted')
  WHERE id = NEW.campaign_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_campaign_metrics
  AFTER INSERT OR UPDATE OF status ON campaign_contacts
  FOR EACH ROW EXECUTE FUNCTION update_campaign_metrics();

-- Auto-update updated_at
CREATE TRIGGER trigger_campaign_contacts_updated_at
  BEFORE UPDATE ON campaign_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. ENGAGEMENT_TRACKING (Email Opens/Clicks)
-- =====================================================

CREATE TABLE engagement_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_contact_id UUID NOT NULL REFERENCES campaign_contacts(id) ON DELETE CASCADE,

  -- Event details
  event_type TEXT NOT NULL, -- 'email_sent', 'email_opened', 'link_clicked', 'email_bounced', 'unsubscribed'
  event_data JSONB,

  -- Timestamp
  event_timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Tracking
  tracking_id TEXT, -- External tracking ID (SendGrid, etc.)
  user_agent TEXT,
  ip_address INET,
  clicked_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_engagement_contact ON engagement_tracking(campaign_contact_id);
CREATE INDEX idx_engagement_type ON engagement_tracking(event_type);
CREATE INDEX idx_engagement_timestamp ON engagement_tracking(event_timestamp DESC);

-- Auto-update campaign_contact status based on engagement
CREATE OR REPLACE FUNCTION update_contact_from_engagement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.event_type = 'email_opened' THEN
    UPDATE campaign_contacts SET
      status = 'opened',
      opened_at = NEW.event_timestamp
    WHERE id = NEW.campaign_contact_id AND status = 'sent';
  ELSIF NEW.event_type = 'link_clicked' THEN
    UPDATE campaign_contacts SET
      clicked_at = NEW.event_timestamp
    WHERE id = NEW.campaign_contact_id;
  ELSIF NEW.event_type = 'email_bounced' THEN
    UPDATE campaign_contacts SET
      status = 'bounced'
    WHERE id = NEW.campaign_contact_id;
  ELSIF NEW.event_type = 'unsubscribed' THEN
    UPDATE campaign_contacts SET
      status = 'unsubscribed'
    WHERE id = NEW.campaign_contact_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contact_engagement
  AFTER INSERT ON engagement_tracking
  FOR EACH ROW EXECUTE FUNCTION update_contact_from_engagement();

-- =====================================================
-- HR MODULE
-- =====================================================

-- =====================================================
-- 4. EMPLOYEE_METADATA (Extends user_profiles)
-- =====================================================

CREATE TABLE employee_metadata (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Employment details
  employment_type TEXT DEFAULT 'full_time', -- 'full_time', 'part_time', 'contractor', 'intern'
  employee_id_number TEXT UNIQUE, -- Company employee ID

  -- Compensation
  bonus_target NUMERIC(12,2),
  commission_plan TEXT,
  equity_shares INTEGER,

  -- Pod assignment
  pod_id UUID, -- FK to pods (set below)
  pod_role TEXT, -- 'senior', 'junior'

  -- Performance
  kpi_targets JSONB,
  monthly_placement_target INTEGER,

  -- Work schedule
  work_schedule TEXT DEFAULT 'standard', -- 'standard', 'flexible', 'remote'
  weekly_hours INTEGER DEFAULT 40,

  -- Benefits
  benefits_eligible BOOLEAN DEFAULT true,
  benefits_start_date DATE,

  -- Emergency contact
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_employee_metadata_pod ON employee_metadata(pod_id);
CREATE INDEX idx_employee_id_number ON employee_metadata(employee_id_number) WHERE employee_id_number IS NOT NULL;

-- Auto-update updated_at
CREATE TRIGGER trigger_employee_metadata_updated_at
  BEFORE UPDATE ON employee_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. PODS (2-Person Team Structure)
-- =====================================================

CREATE TABLE pods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Pod details
  name TEXT NOT NULL,
  pod_type TEXT NOT NULL, -- 'recruiting', 'bench_sales', 'ta'

  -- Members (2-person structure)
  senior_member_id UUID REFERENCES user_profiles(id),
  junior_member_id UUID REFERENCES user_profiles(id),

  -- Goals
  sprint_duration_weeks INTEGER DEFAULT 2,
  placements_per_sprint_target INTEGER DEFAULT 2,

  -- Performance (computed from placements table)
  total_placements INTEGER DEFAULT 0,
  current_sprint_placements INTEGER DEFAULT 0,
  current_sprint_start_date DATE,
  average_placements_per_sprint NUMERIC(5,2),

  -- Status
  is_active BOOLEAN DEFAULT true,
  formed_date DATE,
  dissolved_date DATE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id)
);

-- Indexes
CREATE INDEX idx_pods_org ON pods(org_id);
CREATE INDEX idx_pods_type ON pods(pod_type);
CREATE INDEX idx_pods_members ON pods(senior_member_id, junior_member_id);
CREATE INDEX idx_pods_active ON pods(is_active) WHERE is_active = true;

-- Add FK from employee_metadata to pods
ALTER TABLE employee_metadata
  ADD CONSTRAINT fk_employee_pod
  FOREIGN KEY (pod_id)
  REFERENCES pods(id);

-- Auto-update updated_at
CREATE TRIGGER trigger_pods_updated_at
  BEFORE UPDATE ON pods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. PAYROLL_RUNS (Bi-Weekly Payroll Cycles)
-- =====================================================

CREATE TABLE payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Pay period
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,
  pay_date DATE NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'ready_for_approval', 'approved', 'processing', 'completed', 'failed'

  -- Totals (computed from payroll_items)
  employee_count INTEGER NOT NULL DEFAULT 0,
  total_gross_pay NUMERIC(12,2) DEFAULT 0,
  total_taxes NUMERIC(12,2) DEFAULT 0,
  total_net_pay NUMERIC(12,2) DEFAULT 0,

  -- Integration
  gusto_payroll_id TEXT, -- External payroll system ID
  processed_at TIMESTAMPTZ,
  processing_error TEXT,

  -- Approval
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id)
);

-- Indexes
CREATE INDEX idx_payroll_runs_org ON payroll_runs(org_id);
CREATE INDEX idx_payroll_runs_period ON payroll_runs(period_start_date, period_end_date);
CREATE INDEX idx_payroll_runs_status ON payroll_runs(status);
CREATE INDEX idx_payroll_runs_pay_date ON payroll_runs(pay_date DESC);

-- Auto-update updated_at
CREATE TRIGGER trigger_payroll_runs_updated_at
  BEFORE UPDATE ON payroll_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. PAYROLL_ITEMS (Individual Payroll Line Items)
-- =====================================================

CREATE TABLE payroll_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Compensation components
  base_salary NUMERIC(10,2),
  commission NUMERIC(10,2),
  bonus NUMERIC(10,2),
  overtime_hours NUMERIC(5,2),
  overtime_pay NUMERIC(10,2),
  other_earnings NUMERIC(10,2),

  -- Totals
  gross_pay NUMERIC(10,2) NOT NULL,
  taxes_withheld NUMERIC(10,2),
  benefits_deductions NUMERIC(10,2),
  other_deductions NUMERIC(10,2),
  net_pay NUMERIC(10,2) NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(payroll_run_id, employee_id)
);

-- Indexes
CREATE INDEX idx_payroll_items_run ON payroll_items(payroll_run_id);
CREATE INDEX idx_payroll_items_employee ON payroll_items(employee_id);

-- Auto-update payroll_run totals
CREATE OR REPLACE FUNCTION update_payroll_run_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE payroll_runs SET
    employee_count = (SELECT COUNT(*) FROM payroll_items WHERE payroll_run_id = NEW.payroll_run_id),
    total_gross_pay = (SELECT COALESCE(SUM(gross_pay), 0) FROM payroll_items WHERE payroll_run_id = NEW.payroll_run_id),
    total_taxes = (SELECT COALESCE(SUM(taxes_withheld), 0) FROM payroll_items WHERE payroll_run_id = NEW.payroll_run_id),
    total_net_pay = (SELECT COALESCE(SUM(net_pay), 0) FROM payroll_items WHERE payroll_run_id = NEW.payroll_run_id)
  WHERE id = NEW.payroll_run_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_payroll_totals
  AFTER INSERT OR UPDATE ON payroll_items
  FOR EACH ROW EXECUTE FUNCTION update_payroll_run_totals();

-- =====================================================
-- 8. PERFORMANCE_REVIEWS (Annual/Mid-Year Reviews)
-- =====================================================

CREATE TABLE performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Review details
  employee_id UUID NOT NULL REFERENCES user_profiles(id),
  reviewer_id UUID NOT NULL REFERENCES user_profiles(id),
  review_cycle TEXT NOT NULL, -- '2025_q2', '2025_annual'
  review_type TEXT DEFAULT 'annual', -- 'annual', 'mid_year', 'probation', '90_day'

  -- Review period
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,

  -- Ratings (1-5 scale)
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  quality_of_work INTEGER CHECK (quality_of_work >= 1 AND quality_of_work <= 5),
  communication INTEGER CHECK (communication >= 1 AND communication <= 5),
  teamwork INTEGER CHECK (teamwork >= 1 AND teamwork <= 5),
  initiative INTEGER CHECK (initiative >= 1 AND initiative <= 5),
  reliability INTEGER CHECK (reliability >= 1 AND reliability <= 5),

  -- Goals
  goals_achieved JSONB,
  goals_next_period JSONB,

  -- Feedback
  strengths TEXT,
  areas_for_improvement TEXT,
  manager_comments TEXT,
  employee_self_assessment TEXT,
  employee_comments TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'pending_employee_review', 'completed', 'acknowledged'

  -- Dates
  scheduled_date DATE,
  completed_at TIMESTAMPTZ,
  employee_acknowledged_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_reviews_org ON performance_reviews(org_id);
CREATE INDEX idx_reviews_employee ON performance_reviews(employee_id);
CREATE INDEX idx_reviews_reviewer ON performance_reviews(reviewer_id);
CREATE INDEX idx_reviews_cycle ON performance_reviews(review_cycle);
CREATE INDEX idx_reviews_status ON performance_reviews(status);

-- Auto-update user_profiles.employee_performance_rating
CREATE OR REPLACE FUNCTION update_employee_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.overall_rating IS NOT NULL THEN
    UPDATE user_profiles SET
      employee_performance_rating = NEW.overall_rating
    WHERE id = NEW.employee_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_employee_rating
  AFTER UPDATE OF status ON performance_reviews
  FOR EACH ROW EXECUTE FUNCTION update_employee_rating();

-- =====================================================
-- 9. TIME_ATTENDANCE (Timesheet Tracking)
-- =====================================================

CREATE TABLE time_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Date
  date DATE NOT NULL,

  -- Hours
  regular_hours NUMERIC(5,2) DEFAULT 0,
  overtime_hours NUMERIC(5,2) DEFAULT 0,
  pto_hours NUMERIC(5,2) DEFAULT 0,
  sick_hours NUMERIC(5,2) DEFAULT 0,
  holiday_hours NUMERIC(5,2) DEFAULT 0,
  total_hours NUMERIC(5,2) GENERATED ALWAYS AS (
    regular_hours + overtime_hours + pto_hours + sick_hours + holiday_hours
  ) STORED,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'submitted', 'approved', 'rejected'

  -- Approval
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(employee_id, date)
);

-- Indexes
CREATE INDEX idx_time_attendance_employee ON time_attendance(employee_id);
CREATE INDEX idx_time_attendance_date ON time_attendance(date DESC);
CREATE INDEX idx_time_attendance_status ON time_attendance(status);

-- =====================================================
-- 10. PTO_BALANCES (PTO Accrual Tracking)
-- =====================================================

CREATE TABLE pto_balances (
  employee_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,

  -- Accrual
  annual_accrual_days NUMERIC(5,2) DEFAULT 15.0,
  accrual_rate_per_pay_period NUMERIC(5,2),

  -- Current balance
  total_accrued NUMERIC(5,2) DEFAULT 0,
  total_used NUMERIC(5,2) DEFAULT 0,
  total_pending NUMERIC(5,2) DEFAULT 0,
  current_balance NUMERIC(5,2) GENERATED ALWAYS AS (
    total_accrued - total_used - total_pending
  ) STORED,

  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  PRIMARY KEY (employee_id, year)
);

-- Indexes
CREATE INDEX idx_pto_balances_year ON pto_balances(year);
CREATE INDEX idx_pto_balances_employee ON pto_balances(employee_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE pto_balances ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS: CAMPAIGNS
-- =====================================================

CREATE POLICY "campaigns_org_isolation"
  ON campaigns
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "campaigns_employee_all"
  ON campaigns
  FOR ALL
  USING (
    auth_has_role('employee') OR
    auth_has_role('ta_specialist') OR
    auth_has_role('admin')
  );

-- =====================================================
-- RLS: HR TABLES (Basic Policies)
-- =====================================================

-- Employee metadata
CREATE POLICY "employee_metadata_employee_own"
  ON employee_metadata
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "employee_metadata_hr_all"
  ON employee_metadata
  FOR ALL
  USING (auth_has_role('hr') OR auth_has_role('admin'));

-- Pods
CREATE POLICY "pods_org_isolation"
  ON pods
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "pods_employee_read"
  ON pods
  FOR SELECT
  USING (
    auth_has_role('employee') OR
    auth_has_role('admin')
  );

CREATE POLICY "pods_admin_write"
  ON pods
  FOR ALL
  USING (auth_has_role('admin') OR auth_has_role('hr'));

-- Payroll (Sensitive!)
CREATE POLICY "payroll_runs_org_isolation"
  ON payroll_runs
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "payroll_runs_hr_admin_only"
  ON payroll_runs
  FOR ALL
  USING (auth_has_role('admin') OR auth_has_role('hr'));

CREATE POLICY "payroll_items_hr_admin_only"
  ON payroll_items
  FOR ALL
  USING (auth_has_role('admin') OR auth_has_role('hr'));

CREATE POLICY "payroll_items_employee_own"
  ON payroll_items
  FOR SELECT
  USING (employee_id = auth.uid());

-- Performance reviews
CREATE POLICY "reviews_org_isolation"
  ON performance_reviews
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "reviews_employee_own"
  ON performance_reviews
  FOR SELECT
  USING (employee_id = auth.uid() OR reviewer_id = auth.uid());

CREATE POLICY "reviews_hr_all"
  ON performance_reviews
  FOR ALL
  USING (auth_has_role('hr') OR auth_has_role('admin'));

-- Time attendance
CREATE POLICY "time_attendance_employee_own"
  ON time_attendance
  FOR ALL
  USING (employee_id = auth.uid());

CREATE POLICY "time_attendance_hr_read"
  ON time_attendance
  FOR SELECT
  USING (auth_has_role('hr') OR auth_has_role('admin'));

CREATE POLICY "time_attendance_manager_approve"
  ON time_attendance
  FOR UPDATE
  USING (
    auth_has_role('hr') OR
    auth_has_role('admin') OR
    employee_id IN (
      SELECT id FROM user_profiles WHERE employee_manager_id = auth.uid()
    )
  );

-- PTO balances
CREATE POLICY "pto_balances_employee_own"
  ON pto_balances
  FOR SELECT
  USING (employee_id = auth.uid());

CREATE POLICY "pto_balances_hr_all"
  ON pto_balances
  FOR ALL
  USING (auth_has_role('hr') OR auth_has_role('admin'));

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE campaigns IS 'Outreach campaigns for talent sourcing and business development';
COMMENT ON TABLE campaign_contacts IS 'Target contacts for outreach campaigns with engagement tracking';
COMMENT ON TABLE engagement_tracking IS 'Email/LinkedIn engagement events (opens, clicks, responses)';
COMMENT ON TABLE employee_metadata IS 'Extended metadata for employees';
COMMENT ON TABLE pods IS '2-person team structure with sprint goals';
COMMENT ON TABLE payroll_runs IS 'Bi-weekly payroll cycles';
COMMENT ON TABLE payroll_items IS 'Individual employee payroll details';
COMMENT ON TABLE performance_reviews IS 'Annual and mid-year performance reviews';
COMMENT ON TABLE time_attendance IS 'Daily timesheet tracking';
COMMENT ON TABLE pto_balances IS 'PTO accrual and balance tracking by year';
