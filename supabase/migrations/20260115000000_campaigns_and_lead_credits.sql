-- =====================================================
-- Migration: Campaigns & Lead Sourcing Credits
-- Date: 2026-01-15
-- Description: Campaign management for lead generation and cross-pillar lead tracking
-- Related Specs: A01-run-campaign, A02-track-campaign-metrics, A03-generate-lead-from-campaign, A04-create-lead
-- =====================================================

-- =====================================================
-- 1. CAMPAIGNS (Marketing/Outreach Campaigns)
-- =====================================================

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Core fields
  name TEXT NOT NULL,
  campaign_type TEXT NOT NULL DEFAULT 'lead_generation', -- 'lead_generation', 're_engagement', 'event_promotion', 'brand_awareness', 'candidate_sourcing'
  goal TEXT, -- 'generate_qualified_leads', 'book_discovery_meetings', 'drive_event_registrations', 'build_brand_awareness', 'expand_candidate_pool'
  description TEXT,

  -- Ownership
  owner_id UUID REFERENCES user_profiles(id),

  -- Schedule
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'scheduled', 'active', 'paused', 'completed'

  -- Target audience criteria (stored as JSONB)
  target_criteria JSONB DEFAULT '{}'::jsonb,
  -- Example: {
  --   "industries": ["fintech", "banking"],
  --   "companySizes": ["51-200", "201-500"],
  --   "regions": ["north_america_west", "north_america_east"],
  --   "fundingStages": ["series_a", "series_b"],
  --   "targetTitles": ["VP Engineering", "CTO", "Director of Engineering"],
  --   "exclusions": {
  --     "excludeExistingClients": true,
  --     "excludeRecentlyContacted": 90,
  --     "excludeCompetitors": true
  --   }
  -- }

  -- Channels
  channels TEXT[] DEFAULT '{}', -- 'linkedin', 'email', 'phone', 'event', 'direct_mail'

  -- Sequences (stored as JSONB)
  sequences JSONB DEFAULT '{}'::jsonb,
  -- Example: {
  --   "email": {
  --     "steps": [
  --       { "stepNumber": 1, "dayOffset": 0, "subject": "...", "templateId": "..." },
  --       { "stepNumber": 2, "dayOffset": 3, "subject": "...", "templateId": "..." }
  --     ],
  --     "stopConditions": ["reply", "booking", "unsubscribe", "click"],
  --     "sendTime": "business_hours",
  --     "respectTimezone": true,
  --     "dailyLimit": 100
  --   },
  --   "linkedin": { ... }
  -- }

  -- Budget
  budget_total NUMERIC(12,2) DEFAULT 0,
  budget_spent NUMERIC(12,2) DEFAULT 0,
  budget_currency TEXT DEFAULT 'USD',

  -- Targets
  target_leads INTEGER DEFAULT 0,
  target_meetings INTEGER DEFAULT 0,
  target_revenue NUMERIC(12,2) DEFAULT 0,

  -- Actual metrics (denormalized for quick access)
  audience_size INTEGER DEFAULT 0,
  prospects_contacted INTEGER DEFAULT 0,
  prospects_opened INTEGER DEFAULT 0,
  prospects_clicked INTEGER DEFAULT 0,
  prospects_responded INTEGER DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  meetings_booked INTEGER DEFAULT 0,
  revenue_generated NUMERIC(12,2) DEFAULT 0,

  -- Approval workflow
  approval_status TEXT DEFAULT 'not_required', -- 'not_required', 'pending', 'approved', 'rejected'
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- A/B Testing
  ab_test_config JSONB, -- { "enabled": true, "variants": [...], "winnerSelected": "variant_b" }

  -- Compliance
  compliance_settings JSONB DEFAULT '{"gdpr": true, "canSpam": true, "casl": true, "includeUnsubscribe": true}'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,

  -- Search
  search_vector TSVECTOR
);

-- Indexes for campaigns
CREATE INDEX idx_campaigns_org ON campaigns(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_owner ON campaigns(owner_id);
CREATE INDEX idx_campaigns_status ON campaigns(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_type ON campaigns(campaign_type);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX idx_campaigns_search ON campaigns USING GIN(search_vector);

-- Auto-update search vector for campaigns
CREATE OR REPLACE FUNCTION update_campaigns_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.goal, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_campaigns_search_vector
  BEFORE INSERT OR UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_campaigns_search_vector();

-- Auto-update updated_at for campaigns
CREATE TRIGGER trigger_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. CAMPAIGN_PROSPECTS (Enrolled Prospects)
-- =====================================================

CREATE TABLE campaign_prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Source: Can be a lead, prospect, or external
  lead_id UUID REFERENCES leads(id),

  -- Prospect info (denormalized for performance)
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  company_name TEXT,
  company_industry TEXT,
  company_size TEXT,
  title TEXT,
  location TEXT,
  timezone TEXT,

  -- Channel assignment
  primary_channel TEXT, -- 'email', 'linkedin', 'phone'

  -- Sequence tracking
  sequence_step INTEGER DEFAULT 0,
  sequence_status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'stopped', 'completed'
  stop_reason TEXT, -- 'reply', 'booking', 'unsubscribe', 'completed', 'manual'

  -- Engagement tracking
  first_contacted_at TIMESTAMPTZ,
  last_contacted_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  response_type TEXT, -- 'positive', 'neutral', 'negative', 'auto_reply', 'out_of_office'
  response_text TEXT,

  -- Conversion tracking
  converted_to_lead_at TIMESTAMPTZ,
  converted_lead_id UUID REFERENCES leads(id),
  meeting_booked_at TIMESTAMPTZ,
  meeting_scheduled_for TIMESTAMPTZ,

  -- Scoring
  engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),

  -- Status
  status TEXT DEFAULT 'enrolled', -- 'enrolled', 'contacted', 'engaged', 'responded', 'converted', 'unsubscribed', 'bounced'

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for campaign_prospects
CREATE INDEX idx_campaign_prospects_campaign ON campaign_prospects(campaign_id);
CREATE INDEX idx_campaign_prospects_org ON campaign_prospects(org_id);
CREATE INDEX idx_campaign_prospects_lead ON campaign_prospects(lead_id);
CREATE INDEX idx_campaign_prospects_status ON campaign_prospects(status);
CREATE INDEX idx_campaign_prospects_email ON campaign_prospects(email);
CREATE INDEX idx_campaign_prospects_converted ON campaign_prospects(converted_lead_id) WHERE converted_lead_id IS NOT NULL;

-- Unique constraint to prevent duplicate enrollments
CREATE UNIQUE INDEX idx_campaign_prospects_unique_email
  ON campaign_prospects(campaign_id, email)
  WHERE email IS NOT NULL;

-- Auto-update updated_at
CREATE TRIGGER trigger_campaign_prospects_updated_at
  BEFORE UPDATE ON campaign_prospects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. CAMPAIGN_SEQUENCE_LOGS (Send/Action History)
-- =====================================================

CREATE TABLE campaign_sequence_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  prospect_id UUID NOT NULL REFERENCES campaign_prospects(id) ON DELETE CASCADE,

  -- Sequence info
  channel TEXT NOT NULL, -- 'email', 'linkedin', 'phone'
  step_number INTEGER NOT NULL,

  -- Action
  action_type TEXT NOT NULL, -- 'sent', 'opened', 'clicked', 'replied', 'bounced', 'unsubscribed', 'call_made', 'call_connected', 'voicemail'
  action_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Details
  subject TEXT,
  content_preview TEXT,
  link_clicked TEXT,
  call_duration_seconds INTEGER,
  call_outcome TEXT, -- 'connected', 'voicemail', 'no_answer', 'busy', 'wrong_number'

  -- Response
  response_text TEXT,
  sentiment TEXT, -- 'positive', 'neutral', 'negative'

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for sequence logs
CREATE INDEX idx_campaign_sequence_logs_campaign ON campaign_sequence_logs(campaign_id);
CREATE INDEX idx_campaign_sequence_logs_prospect ON campaign_sequence_logs(prospect_id);
CREATE INDEX idx_campaign_sequence_logs_action_type ON campaign_sequence_logs(action_type);
CREATE INDEX idx_campaign_sequence_logs_action_at ON campaign_sequence_logs(action_at DESC);

-- =====================================================
-- 4. LEAD_SOURCING_CREDITS (Cross-Pillar Tracking)
-- =====================================================

CREATE TABLE lead_sourcing_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,

  -- Who sourced it
  sourced_by UUID NOT NULL REFERENCES user_profiles(id),
  source_pillar TEXT NOT NULL, -- 'recruiting', 'bench_sales', 'ta', 'sales', 'academy'

  -- Where it went
  target_pillar TEXT NOT NULL, -- 'recruiting', 'bench_sales', 'ta', 'sales', 'academy'
  assigned_to UUID REFERENCES user_profiles(id),

  -- Points and status
  credit_points INTEGER DEFAULT 10,
  bonus_points INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- 'pending', 'converted', 'lost'

  -- Conversion tracking
  converted_at TIMESTAMPTZ,
  conversion_value NUMERIC(12,2),
  commission_earned NUMERIC(12,2),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for lead sourcing credits
CREATE INDEX idx_lead_sourcing_credits_org ON lead_sourcing_credits(org_id);
CREATE INDEX idx_lead_sourcing_credits_lead ON lead_sourcing_credits(lead_id);
CREATE INDEX idx_lead_sourcing_credits_sourced_by ON lead_sourcing_credits(sourced_by);
CREATE INDEX idx_lead_sourcing_credits_target ON lead_sourcing_credits(target_pillar);
CREATE INDEX idx_lead_sourcing_credits_status ON lead_sourcing_credits(status);

-- Auto-update updated_at
CREATE TRIGGER trigger_lead_sourcing_credits_updated_at
  BEFORE UPDATE ON lead_sourcing_credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. ADD COLUMNS TO LEADS TABLE
-- =====================================================

-- Add campaign and cross-pillar tracking fields to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS campaign_prospect_id UUID REFERENCES campaign_prospects(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS cross_pillar_type TEXT; -- 'ta_lead', 'bench_lead', 'sales_lead', 'academy_lead'
ALTER TABLE leads ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'normal'; -- 'low', 'normal', 'high', 'urgent'
ALTER TABLE leads ADD COLUMN IF NOT EXISTS target_pillar TEXT; -- 'recruiting', 'bench_sales', 'ta', 'sales', 'academy'
ALTER TABLE leads ADD COLUMN IF NOT EXISTS handoff_notes TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS interest_level TEXT; -- 'hot', 'warm', 'cold'
ALTER TABLE leads ADD COLUMN IF NOT EXISTS hiring_needs TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS pain_points TEXT;

-- BANT Qualification fields
ALTER TABLE leads ADD COLUMN IF NOT EXISTS budget_status TEXT; -- 'unknown', 'limited', 'defined', 'approved'
ALTER TABLE leads ADD COLUMN IF NOT EXISTS budget_notes TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS authority_status TEXT; -- 'unknown', 'influencer', 'decision_maker', 'champion'
ALTER TABLE leads ADD COLUMN IF NOT EXISTS authority_notes TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS need_status TEXT; -- 'unknown', 'identified', 'defined', 'urgent'
ALTER TABLE leads ADD COLUMN IF NOT EXISTS need_notes TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS timeline_status TEXT; -- 'unknown', 'long', 'medium', 'short'
ALTER TABLE leads ADD COLUMN IF NOT EXISTS timeline_notes TEXT;

-- Next action tracking
ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_action TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_action_date DATE;

-- Lead scoring
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_score INTEGER CHECK (lead_score >= 0 AND lead_score <= 100);

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_leads_campaign ON leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_cross_pillar_type ON leads(cross_pillar_type) WHERE cross_pillar_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_urgency ON leads(urgency);
CREATE INDEX IF NOT EXISTS idx_leads_interest_level ON leads(interest_level);

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_sequence_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_sourcing_credits ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: CAMPAIGNS
-- =====================================================

-- Organization isolation
CREATE POLICY "campaigns_org_isolation"
  ON campaigns
  FOR ALL
  USING (org_id = auth_org_id());

-- Employees can view all campaigns in their org
CREATE POLICY "campaigns_employee_select"
  ON campaigns
  FOR SELECT
  USING (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('recruiter')
  );

-- Campaign owners and admins can update
CREATE POLICY "campaigns_owner_update"
  ON campaigns
  FOR UPDATE
  USING (
    auth_has_role('admin') OR
    owner_id = auth.uid() OR
    created_by = auth.uid()
  );

-- Recruiters and admins can create campaigns
CREATE POLICY "campaigns_create"
  ON campaigns
  FOR INSERT
  WITH CHECK (
    auth_has_role('admin') OR
    auth_has_role('recruiter')
  );

-- =====================================================
-- RLS POLICIES: CAMPAIGN_PROSPECTS
-- =====================================================

CREATE POLICY "campaign_prospects_org_isolation"
  ON campaign_prospects
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "campaign_prospects_select"
  ON campaign_prospects
  FOR SELECT
  USING (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('recruiter')
  );

-- =====================================================
-- RLS POLICIES: CAMPAIGN_SEQUENCE_LOGS
-- =====================================================

CREATE POLICY "campaign_sequence_logs_org_isolation"
  ON campaign_sequence_logs
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "campaign_sequence_logs_select"
  ON campaign_sequence_logs
  FOR SELECT
  USING (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('recruiter')
  );

-- =====================================================
-- RLS POLICIES: LEAD_SOURCING_CREDITS
-- =====================================================

CREATE POLICY "lead_sourcing_credits_org_isolation"
  ON lead_sourcing_credits
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "lead_sourcing_credits_select"
  ON lead_sourcing_credits
  FOR SELECT
  USING (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('recruiter')
  );

CREATE POLICY "lead_sourcing_credits_create"
  ON lead_sourcing_credits
  FOR INSERT
  WITH CHECK (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('recruiter')
  );

-- =====================================================
-- 7. HELPER FUNCTIONS FOR CAMPAIGN METRICS
-- =====================================================

-- Function to calculate campaign funnel metrics
CREATE OR REPLACE FUNCTION get_campaign_funnel(p_campaign_id UUID)
RETURNS TABLE (
  total_prospects BIGINT,
  contacted BIGINT,
  opened BIGINT,
  clicked BIGINT,
  responded BIGINT,
  leads BIGINT,
  meetings BIGINT,
  open_rate NUMERIC,
  response_rate NUMERIC,
  conversion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_prospects,
    COUNT(*) FILTER (WHERE first_contacted_at IS NOT NULL)::BIGINT AS contacted,
    COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::BIGINT AS opened,
    COUNT(*) FILTER (WHERE clicked_at IS NOT NULL)::BIGINT AS clicked,
    COUNT(*) FILTER (WHERE responded_at IS NOT NULL)::BIGINT AS responded,
    COUNT(*) FILTER (WHERE converted_to_lead_at IS NOT NULL)::BIGINT AS leads,
    COUNT(*) FILTER (WHERE meeting_booked_at IS NOT NULL)::BIGINT AS meetings,
    CASE WHEN COUNT(*) FILTER (WHERE first_contacted_at IS NOT NULL) > 0
      THEN ROUND(COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::NUMERIC / COUNT(*) FILTER (WHERE first_contacted_at IS NOT NULL)::NUMERIC * 100, 1)
      ELSE 0
    END AS open_rate,
    CASE WHEN COUNT(*) FILTER (WHERE first_contacted_at IS NOT NULL) > 0
      THEN ROUND(COUNT(*) FILTER (WHERE responded_at IS NOT NULL)::NUMERIC / COUNT(*) FILTER (WHERE first_contacted_at IS NOT NULL)::NUMERIC * 100, 1)
      ELSE 0
    END AS response_rate,
    CASE WHEN COUNT(*) > 0
      THEN ROUND(COUNT(*) FILTER (WHERE converted_to_lead_at IS NOT NULL)::NUMERIC / COUNT(*)::NUMERIC * 100, 1)
      ELSE 0
    END AS conversion_rate
  FROM campaign_prospects
  WHERE campaign_id = p_campaign_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get channel performance
CREATE OR REPLACE FUNCTION get_campaign_channel_performance(p_campaign_id UUID)
RETURNS TABLE (
  channel TEXT,
  sent BIGINT,
  open_rate NUMERIC,
  click_rate NUMERIC,
  response_rate NUMERIC,
  leads BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.primary_channel AS channel,
    COUNT(*) FILTER (WHERE cp.first_contacted_at IS NOT NULL)::BIGINT AS sent,
    CASE WHEN COUNT(*) FILTER (WHERE cp.first_contacted_at IS NOT NULL) > 0
      THEN ROUND(COUNT(*) FILTER (WHERE cp.opened_at IS NOT NULL)::NUMERIC / COUNT(*) FILTER (WHERE cp.first_contacted_at IS NOT NULL)::NUMERIC * 100, 1)
      ELSE 0
    END AS open_rate,
    CASE WHEN COUNT(*) FILTER (WHERE cp.opened_at IS NOT NULL) > 0
      THEN ROUND(COUNT(*) FILTER (WHERE cp.clicked_at IS NOT NULL)::NUMERIC / COUNT(*) FILTER (WHERE cp.opened_at IS NOT NULL)::NUMERIC * 100, 1)
      ELSE 0
    END AS click_rate,
    CASE WHEN COUNT(*) FILTER (WHERE cp.first_contacted_at IS NOT NULL) > 0
      THEN ROUND(COUNT(*) FILTER (WHERE cp.responded_at IS NOT NULL)::NUMERIC / COUNT(*) FILTER (WHERE cp.first_contacted_at IS NOT NULL)::NUMERIC * 100, 1)
      ELSE 0
    END AS response_rate,
    COUNT(*) FILTER (WHERE cp.converted_to_lead_at IS NOT NULL)::BIGINT AS leads
  FROM campaign_prospects cp
  WHERE cp.campaign_id = p_campaign_id
  GROUP BY cp.primary_channel;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate lead score based on engagement
CREATE OR REPLACE FUNCTION calculate_lead_score(
  p_email_opens INTEGER DEFAULT 0,
  p_link_clicks INTEGER DEFAULT 0,
  p_has_reply BOOLEAN DEFAULT FALSE,
  p_target_industry BOOLEAN DEFAULT FALSE,
  p_target_company_size BOOLEAN DEFAULT FALSE,
  p_target_funding_stage BOOLEAN DEFAULT FALSE,
  p_positive_sentiment BOOLEAN DEFAULT FALSE,
  p_mentions_hiring BOOLEAN DEFAULT FALSE,
  p_requests_meeting BOOLEAN DEFAULT FALSE
)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- Engagement signals (max 40 points)
  score := score + LEAST(p_email_opens * 3, 15);  -- 3 points per open, max 15
  score := score + LEAST(p_link_clicks * 5, 15);  -- 5 points per click, max 15
  IF p_has_reply THEN score := score + 10; END IF;  -- 10 points for reply

  -- Company fit (max 30 points)
  IF p_target_industry THEN score := score + 10; END IF;
  IF p_target_company_size THEN score := score + 10; END IF;
  IF p_target_funding_stage THEN score := score + 10; END IF;

  -- Response quality (max 30 points)
  IF p_positive_sentiment THEN score := score + 10; END IF;
  IF p_mentions_hiring THEN score := score + 10; END IF;
  IF p_requests_meeting THEN score := score + 10; END IF;

  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. TRIGGER TO UPDATE CAMPAIGN METRICS
-- =====================================================

CREATE OR REPLACE FUNCTION update_campaign_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update campaign metrics when prospects are updated
  UPDATE campaigns
  SET
    audience_size = (SELECT COUNT(*) FROM campaign_prospects WHERE campaign_id = NEW.campaign_id),
    prospects_contacted = (SELECT COUNT(*) FROM campaign_prospects WHERE campaign_id = NEW.campaign_id AND first_contacted_at IS NOT NULL),
    prospects_opened = (SELECT COUNT(*) FROM campaign_prospects WHERE campaign_id = NEW.campaign_id AND opened_at IS NOT NULL),
    prospects_clicked = (SELECT COUNT(*) FROM campaign_prospects WHERE campaign_id = NEW.campaign_id AND clicked_at IS NOT NULL),
    prospects_responded = (SELECT COUNT(*) FROM campaign_prospects WHERE campaign_id = NEW.campaign_id AND responded_at IS NOT NULL),
    leads_generated = (SELECT COUNT(*) FROM campaign_prospects WHERE campaign_id = NEW.campaign_id AND converted_to_lead_at IS NOT NULL),
    meetings_booked = (SELECT COUNT(*) FROM campaign_prospects WHERE campaign_id = NEW.campaign_id AND meeting_booked_at IS NOT NULL),
    updated_at = NOW()
  WHERE id = NEW.campaign_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_campaign_metrics
  AFTER INSERT OR UPDATE ON campaign_prospects
  FOR EACH ROW EXECUTE FUNCTION update_campaign_metrics();

-- =====================================================
-- DONE
-- =====================================================
