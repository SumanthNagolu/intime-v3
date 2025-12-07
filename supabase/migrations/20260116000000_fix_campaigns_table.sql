-- =====================================================
-- Migration: Fix Campaigns Table
-- Date: 2026-01-16
-- Description: Add missing columns to campaigns table for A01-A04 specs
-- =====================================================

-- Add deleted_at column if it doesn't exist
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add goal column for campaign objectives
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS goal TEXT;

-- Add target_criteria JSONB for flexible audience targeting
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS target_criteria JSONB DEFAULT '{}'::jsonb;

-- Add channels array for multi-channel support (replacing single 'channel' column)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS channels TEXT[] DEFAULT '{}'::text[];

-- Add sequences JSONB for email/linkedin sequence configuration
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS sequences JSONB DEFAULT '{}'::jsonb;

-- Add budget fields
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS budget_total NUMERIC(12,2) DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS budget_currency TEXT DEFAULT 'USD';

-- Add target metrics
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS target_leads INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS target_meetings INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS target_revenue NUMERIC(12,2) DEFAULT 0;

-- Add compliance settings JSONB
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS compliance_settings JSONB DEFAULT '{"gdpr": true, "canSpam": true, "casl": true, "includeUnsubscribe": true}'::jsonb;

-- Add approval workflow columns
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'not_required';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES user_profiles(id);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add A/B testing config
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS ab_test_config JSONB;

-- Add search vector for full-text search
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

-- Add campaign metrics columns
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS budget_spent NUMERIC(12,2) DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS leads_generated INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS meetings_booked INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS revenue_generated NUMERIC(12,2) DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS audience_size INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS prospects_contacted INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS prospects_opened INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS prospects_clicked INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS prospects_responded INTEGER DEFAULT 0;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_deleted_at ON campaigns(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_campaigns_goal ON campaigns(goal);
CREATE INDEX IF NOT EXISTS idx_campaigns_channels ON campaigns USING GIN(channels);
CREATE INDEX IF NOT EXISTS idx_campaigns_approval_status ON campaigns(approval_status);

-- =====================================================
-- CAMPAIGN_PROSPECTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS campaign_prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id),
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
  primary_channel TEXT,
  sequence_step INTEGER DEFAULT 0,
  sequence_status TEXT DEFAULT 'pending',
  stop_reason TEXT,
  first_contacted_at TIMESTAMPTZ,
  last_contacted_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  response_type TEXT,
  response_text TEXT,
  converted_to_lead_at TIMESTAMPTZ,
  converted_lead_id UUID REFERENCES leads(id),
  meeting_booked_at TIMESTAMPTZ,
  meeting_scheduled_for TIMESTAMPTZ,
  engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  status TEXT DEFAULT 'enrolled',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_campaign_prospects_campaign ON campaign_prospects(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_prospects_org ON campaign_prospects(org_id);
CREATE INDEX IF NOT EXISTS idx_campaign_prospects_status ON campaign_prospects(status);

-- =====================================================
-- CAMPAIGN_SEQUENCE_LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS campaign_sequence_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  prospect_id UUID NOT NULL REFERENCES campaign_prospects(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  action_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  subject TEXT,
  content_preview TEXT,
  link_clicked TEXT,
  call_duration_seconds INTEGER,
  call_outcome TEXT,
  response_text TEXT,
  sentiment TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_campaign_sequence_logs_campaign ON campaign_sequence_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sequence_logs_prospect ON campaign_sequence_logs(prospect_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sequence_logs_action_at ON campaign_sequence_logs(action_at DESC);

-- =====================================================
-- HELPER FUNCTIONS
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

