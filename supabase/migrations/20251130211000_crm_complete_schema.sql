-- CRM Complete Schema Migration
-- Created: 2025-11-30
-- Description: Comprehensive CRM schema including accounts, contacts, leads, deals, campaigns

-- =====================================================
-- ACCOUNTS ENHANCEMENTS
-- =====================================================

-- Add new columns to accounts table
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS legal_name TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS founded_year INTEGER;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS employee_count INTEGER;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS annual_revenue NUMERIC(15, 2);
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS health_score INTEGER;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS primary_contact_id UUID;

-- Create indexes for accounts
CREATE INDEX IF NOT EXISTS idx_accounts_org_id ON accounts(org_id);
CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);
CREATE INDEX IF NOT EXISTS idx_accounts_tier ON accounts(tier);
CREATE INDEX IF NOT EXISTS idx_accounts_account_manager_id ON accounts(account_manager_id);
CREATE INDEX IF NOT EXISTS idx_accounts_health_score ON accounts(health_score);

-- =====================================================
-- ACCOUNT ADDRESSES
-- =====================================================

CREATE TABLE IF NOT EXISTS account_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

  address_type TEXT NOT NULL DEFAULT 'office', -- hq, billing, office, shipping
  street TEXT,
  street2 TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'USA',
  postal_code TEXT,

  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_account_addresses_account_id ON account_addresses(account_id);
CREATE INDEX IF NOT EXISTS idx_account_addresses_type ON account_addresses(address_type);

-- =====================================================
-- ACCOUNT CONTRACTS
-- =====================================================

CREATE TABLE IF NOT EXISTS account_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

  contract_type TEXT NOT NULL, -- msa, sow, nda, amendment, addendum
  status TEXT NOT NULL DEFAULT 'draft', -- draft, pending_review, active, expired, terminated
  name TEXT,

  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  signed_date TIMESTAMPTZ,

  value NUMERIC(12, 2),
  currency TEXT DEFAULT 'USD',

  terms JSONB,
  payment_terms_days INTEGER,

  document_url TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_account_contracts_account_id ON account_contracts(account_id);
CREATE INDEX IF NOT EXISTS idx_account_contracts_type ON account_contracts(contract_type);
CREATE INDEX IF NOT EXISTS idx_account_contracts_status ON account_contracts(status);

-- =====================================================
-- ACCOUNT PREFERENCES
-- =====================================================

CREATE TABLE IF NOT EXISTS account_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

  preferred_skills TEXT[],
  excluded_skills TEXT[],

  preferred_visa_types TEXT[],
  excluded_visa_types TEXT[],

  rate_range_min NUMERIC(10, 2),
  rate_range_max NUMERIC(10, 2),
  preferred_rate_type TEXT DEFAULT 'hourly',

  work_mode_preference TEXT,
  onsite_requirement TEXT,

  interview_process_notes TEXT,
  typical_interview_rounds INTEGER,
  interview_turnaround_days INTEGER,

  background_check_required BOOLEAN DEFAULT FALSE,
  drug_screen_required BOOLEAN DEFAULT FALSE,
  security_clearance_required TEXT,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_account_preferences_account_id ON account_preferences(account_id);

-- =====================================================
-- ACCOUNT METRICS
-- =====================================================

CREATE TABLE IF NOT EXISTS account_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

  period TEXT NOT NULL, -- YYYY-MM format
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  total_placements INTEGER DEFAULT 0,
  active_placements INTEGER DEFAULT 0,
  ended_placements INTEGER DEFAULT 0,

  total_revenue NUMERIC(12, 2) DEFAULT 0,
  total_margin NUMERIC(12, 2) DEFAULT 0,

  avg_ttf_days NUMERIC(5, 1),
  submission_to_interview_rate NUMERIC(5, 2),
  interview_to_offer_rate NUMERIC(5, 2),
  offer_acceptance_rate NUMERIC(5, 2),

  total_submissions INTEGER DEFAULT 0,
  total_interviews INTEGER DEFAULT 0,
  total_offers INTEGER DEFAULT 0,

  health_score INTEGER,

  calculated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_account_metrics_account_id ON account_metrics(account_id);
CREATE INDEX IF NOT EXISTS idx_account_metrics_period ON account_metrics(period);
CREATE INDEX IF NOT EXISTS idx_account_metrics_account_period ON account_metrics(account_id, period);

-- =====================================================
-- ACCOUNT TEAM
-- =====================================================

CREATE TABLE IF NOT EXISTS account_team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  role TEXT NOT NULL, -- owner, secondary, support, recruiter, account_manager

  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  unassigned_at TIMESTAMPTZ,

  is_active BOOLEAN DEFAULT TRUE,
  is_primary BOOLEAN DEFAULT FALSE,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_account_team_account_id ON account_team(account_id);
CREATE INDEX IF NOT EXISTS idx_account_team_user_id ON account_team(user_id);
CREATE INDEX IF NOT EXISTS idx_account_team_role ON account_team(role);

-- =====================================================
-- CRM CONTACTS
-- =====================================================

CREATE TABLE IF NOT EXISTS crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  contact_type TEXT NOT NULL DEFAULT 'general', -- client_poc, candidate, vendor, partner, internal, general

  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  linkedin_url TEXT,

  avatar_url TEXT,

  title TEXT,
  company_name TEXT,
  company_id UUID REFERENCES accounts(id),
  department TEXT,

  work_location TEXT,
  timezone TEXT DEFAULT 'America/New_York',

  preferred_contact_method TEXT DEFAULT 'email',
  best_time_to_contact TEXT,
  do_not_call_before TEXT,
  do_not_call_after TEXT,

  status TEXT NOT NULL DEFAULT 'active', -- active, inactive, do_not_contact, bounced, unsubscribed

  source TEXT,
  source_detail TEXT,
  source_campaign_id UUID,

  user_profile_id UUID REFERENCES user_profiles(id),

  last_contacted_at TIMESTAMPTZ,
  last_response_at TIMESTAMPTZ,
  total_interactions INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,

  twitter_url TEXT,
  github_url TEXT,

  decision_authority TEXT,
  buying_role TEXT,
  influence_level TEXT,

  tags TEXT[],
  notes TEXT,
  internal_notes TEXT,

  owner_id UUID REFERENCES user_profiles(id),

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_org_id ON crm_contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_contact_type ON crm_contacts(contact_type);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON crm_contacts(email);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_company_id ON crm_contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_owner_id ON crm_contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_status ON crm_contacts(status);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_engagement ON crm_contacts(engagement_score);

-- =====================================================
-- CRM CONTACT PREFERENCES
-- =====================================================

CREATE TABLE IF NOT EXISTS crm_contact_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,

  preferred_contact_method TEXT DEFAULT 'email',
  best_time_to_call TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  communication_frequency TEXT,

  marketing_emails_opt_in BOOLEAN DEFAULT TRUE,
  newsletter_opt_in BOOLEAN DEFAULT TRUE,
  product_updates_opt_in BOOLEAN DEFAULT TRUE,

  do_not_call BOOLEAN DEFAULT FALSE,
  do_not_call_before TEXT,
  do_not_call_after TEXT,

  preferred_meeting_platform TEXT,
  meeting_duration INTEGER DEFAULT 30,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_crm_contact_preferences_contact_id ON crm_contact_preferences(contact_id);

-- =====================================================
-- LEADS ENHANCEMENTS
-- =====================================================

-- Add column for linking POCs to contacts (if not exists)
ALTER TABLE point_of_contacts ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES crm_contacts(id);

-- Add indexes for leads
CREATE INDEX IF NOT EXISTS idx_leads_org_id ON leads(org_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_owner_id ON leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_account_id ON leads(account_id);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);

-- =====================================================
-- LEAD SCORES
-- =====================================================

CREATE TABLE IF NOT EXISTS lead_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,

  score INTEGER NOT NULL DEFAULT 0,

  factors JSONB,

  budget_score INTEGER DEFAULT 0,
  authority_score INTEGER DEFAULT 0,
  need_score INTEGER DEFAULT 0,
  timeline_score INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  fit_score INTEGER DEFAULT 0,

  calculated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  calculated_by TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lead_scores_lead_id ON lead_scores(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_scores_score ON lead_scores(score);

-- =====================================================
-- LEAD QUALIFICATION
-- =====================================================

CREATE TABLE IF NOT EXISTS lead_qualification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,

  has_budget BOOLEAN,
  budget_amount NUMERIC(12, 2),
  budget_timeframe TEXT,
  budget_notes TEXT,

  decision_maker TEXT,
  decision_process TEXT,
  other_stakeholders TEXT,
  authority_notes TEXT,

  need_identified BOOLEAN,
  need_urgency TEXT,
  pain_points TEXT[],
  current_solution TEXT,
  need_notes TEXT,

  timeline TEXT,
  decision_date TIMESTAMPTZ,
  project_start_date TIMESTAMPTZ,
  timeline_notes TEXT,

  qualified_by UUID REFERENCES user_profiles(id),
  qualified_at TIMESTAMPTZ,
  qualification_status TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lead_qualification_lead_id ON lead_qualification(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_qualification_status ON lead_qualification(qualification_status);

-- =====================================================
-- LEAD TOUCHPOINTS
-- =====================================================

CREATE TABLE IF NOT EXISTS lead_touchpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,

  touchpoint_type TEXT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'outbound',

  subject TEXT,
  notes TEXT,

  outcome TEXT,
  next_steps TEXT,
  next_follow_up_date TIMESTAMPTZ,

  duration_minutes INTEGER,

  campaign_id UUID,
  template_used TEXT,

  created_by UUID REFERENCES user_profiles(id),

  touchpoint_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lead_touchpoints_lead_id ON lead_touchpoints(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_touchpoints_type ON lead_touchpoints(touchpoint_type);
CREATE INDEX IF NOT EXISTS idx_lead_touchpoints_date ON lead_touchpoints(touchpoint_date);

-- =====================================================
-- DEALS ENHANCEMENTS
-- =====================================================

-- Add new columns to deals table
ALTER TABLE deals ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS deal_type TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE deals ADD COLUMN IF NOT EXISTS loss_reason TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS competitor_won TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create indexes for deals
CREATE INDEX IF NOT EXISTS idx_deals_org_id ON deals(org_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_owner_id ON deals(owner_id);
CREATE INDEX IF NOT EXISTS idx_deals_account_id ON deals(account_id);
CREATE INDEX IF NOT EXISTS idx_deals_lead_id ON deals(lead_id);
CREATE INDEX IF NOT EXISTS idx_deals_expected_close ON deals(expected_close_date);

-- =====================================================
-- DEAL STAGES HISTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS deal_stages_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,

  stage TEXT NOT NULL,
  previous_stage TEXT,

  entered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  exited_at TIMESTAMPTZ,
  duration_days INTEGER,

  notes TEXT,
  reason TEXT,

  changed_by UUID REFERENCES user_profiles(id),

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_deal_stages_history_deal_id ON deal_stages_history(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_stages_history_stage ON deal_stages_history(stage);
CREATE INDEX IF NOT EXISTS idx_deal_stages_history_entered_at ON deal_stages_history(entered_at);

-- =====================================================
-- DEAL STAKEHOLDERS
-- =====================================================

CREATE TABLE IF NOT EXISTS deal_stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES crm_contacts(id),

  name TEXT,
  title TEXT,
  email TEXT,

  role TEXT NOT NULL,
  influence_level TEXT,

  sentiment TEXT,
  engagement_notes TEXT,

  is_active BOOLEAN DEFAULT TRUE,
  is_primary BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_deal_stakeholders_deal_id ON deal_stakeholders(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_stakeholders_contact_id ON deal_stakeholders(contact_id);
CREATE INDEX IF NOT EXISTS idx_deal_stakeholders_role ON deal_stakeholders(role);

-- =====================================================
-- DEAL COMPETITORS
-- =====================================================

CREATE TABLE IF NOT EXISTS deal_competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,

  competitor_name TEXT NOT NULL,
  competitor_website TEXT,

  strengths TEXT,
  weaknesses TEXT,
  our_differentiators TEXT,
  pricing TEXT,

  status TEXT DEFAULT 'active',
  threat_level TEXT,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_deal_competitors_deal_id ON deal_competitors(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_competitors_name ON deal_competitors(competitor_name);
CREATE INDEX IF NOT EXISTS idx_deal_competitors_status ON deal_competitors(status);

-- =====================================================
-- DEAL PRODUCTS
-- =====================================================

CREATE TABLE IF NOT EXISTS deal_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,

  product_type TEXT NOT NULL,
  product_name TEXT,
  description TEXT,

  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(12, 2),
  total_value NUMERIC(12, 2),
  discount NUMERIC(5, 2),
  currency TEXT DEFAULT 'USD',

  duration_months INTEGER,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_deal_products_deal_id ON deal_products(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_products_type ON deal_products(product_type);

-- =====================================================
-- CRM CAMPAIGNS
-- =====================================================

CREATE TABLE IF NOT EXISTS crm_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'draft',

  target_audience TEXT,
  target_industries TEXT[],
  target_titles TEXT[],
  target_company_sizes TEXT[],

  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,

  budget NUMERIC(12, 2),
  currency TEXT DEFAULT 'USD',

  goal_leads INTEGER,
  goal_responses INTEGER,
  goal_meetings INTEGER,

  owner_id UUID REFERENCES user_profiles(id),

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_crm_campaigns_org_id ON crm_campaigns(org_id);
CREATE INDEX IF NOT EXISTS idx_crm_campaigns_type ON crm_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_crm_campaigns_status ON crm_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_crm_campaigns_owner_id ON crm_campaigns(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_campaigns_start_date ON crm_campaigns(start_date);

-- =====================================================
-- CRM CAMPAIGN TARGETS
-- =====================================================

CREATE TABLE IF NOT EXISTS crm_campaign_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES crm_campaigns(id) ON DELETE CASCADE,

  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending',

  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,

  result_notes TEXT,
  converted_to_lead_id UUID REFERENCES leads(id),

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_crm_campaign_targets_campaign_id ON crm_campaign_targets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_crm_campaign_targets_target ON crm_campaign_targets(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_crm_campaign_targets_status ON crm_campaign_targets(status);

-- =====================================================
-- CRM CAMPAIGN CONTENT
-- =====================================================

CREATE TABLE IF NOT EXISTS crm_campaign_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES crm_campaigns(id) ON DELETE CASCADE,

  content_type TEXT NOT NULL,

  name TEXT,
  subject TEXT,
  body TEXT,
  html_body TEXT,

  asset_url TEXT,
  thumbnail_url TEXT,

  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,

  variant TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_crm_campaign_content_campaign_id ON crm_campaign_content(campaign_id);
CREATE INDEX IF NOT EXISTS idx_crm_campaign_content_type ON crm_campaign_content(content_type);
CREATE INDEX IF NOT EXISTS idx_crm_campaign_content_variant ON crm_campaign_content(variant);

-- =====================================================
-- CRM CAMPAIGN METRICS
-- =====================================================

CREATE TABLE IF NOT EXISTS crm_campaign_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES crm_campaigns(id) ON DELETE CASCADE,

  period TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,

  total_targets INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,

  total_opens INTEGER DEFAULT 0,
  unique_opens INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  total_responses INTEGER DEFAULT 0,

  total_conversions INTEGER DEFAULT 0,
  total_leads_generated INTEGER DEFAULT 0,
  total_meetings_booked INTEGER DEFAULT 0,

  open_rate NUMERIC(5, 2),
  click_rate NUMERIC(5, 2),
  response_rate NUMERIC(5, 2),
  conversion_rate NUMERIC(5, 2),
  bounce_rate NUMERIC(5, 2),

  total_spend NUMERIC(12, 2),
  cost_per_send NUMERIC(10, 4),
  cost_per_open NUMERIC(10, 4),
  cost_per_click NUMERIC(10, 4),
  cost_per_conversion NUMERIC(10, 2),
  roi NUMERIC(10, 2),

  attributed_revenue NUMERIC(12, 2),

  calculated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_crm_campaign_metrics_campaign_id ON crm_campaign_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_crm_campaign_metrics_period ON crm_campaign_metrics(period);

-- =====================================================
-- CRM ACTIVITIES
-- =====================================================

CREATE TABLE IF NOT EXISTS crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,

  activity_type TEXT NOT NULL,
  subject TEXT,
  description TEXT,
  outcome TEXT,

  direction TEXT,

  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER,

  next_steps TEXT,
  next_follow_up_date TIMESTAMPTZ,

  priority TEXT DEFAULT 'normal',

  assigned_to UUID REFERENCES user_profiles(id),

  created_by UUID REFERENCES user_profiles(id),

  related_contact_id UUID REFERENCES crm_contacts(id),
  related_deal_id UUID REFERENCES deals(id),
  related_campaign_id UUID REFERENCES crm_campaigns(id),

  status TEXT DEFAULT 'completed',

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_crm_activities_org_id ON crm_activities(org_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_entity ON crm_activities(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_type ON crm_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_crm_activities_assigned_to ON crm_activities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_activities_created_by ON crm_activities(created_by);
CREATE INDEX IF NOT EXISTS idx_crm_activities_scheduled_at ON crm_activities(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_crm_activities_status ON crm_activities(status);

-- =====================================================
-- ACTIVITY LOG INDEXES (Legacy table)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_activity_log_org_id ON activity_log(org_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_performed_by ON activity_log(performed_by);
CREATE INDEX IF NOT EXISTS idx_activity_log_activity_date ON activity_log(activity_date);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE account_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contact_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_qualification ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_touchpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_stages_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_campaign_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_campaign_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for org isolation (crm_contacts as example, apply similar to all tables)
CREATE POLICY IF NOT EXISTS crm_contacts_org_isolation ON crm_contacts
  FOR ALL
  USING (org_id = (SELECT current_setting('app.org_id')::uuid));

CREATE POLICY IF NOT EXISTS crm_campaigns_org_isolation ON crm_campaigns
  FOR ALL
  USING (org_id = (SELECT current_setting('app.org_id')::uuid));

CREATE POLICY IF NOT EXISTS crm_activities_org_isolation ON crm_activities
  FOR ALL
  USING (org_id = (SELECT current_setting('app.org_id')::uuid));

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE account_addresses IS 'Multiple addresses per account (HQ, billing, offices)';
COMMENT ON TABLE account_contracts IS 'MSA, SOW, NDA and other contract documents';
COMMENT ON TABLE account_preferences IS 'Hiring/staffing preferences for accounts';
COMMENT ON TABLE account_metrics IS 'Monthly performance metrics per account';
COMMENT ON TABLE account_team IS 'RCAI team assignments for accounts';
COMMENT ON TABLE crm_contacts IS 'Universal CRM contacts for sales/marketing';
COMMENT ON TABLE crm_contact_preferences IS 'Communication preferences for contacts';
COMMENT ON TABLE lead_scores IS 'Lead scoring with BANT factors';
COMMENT ON TABLE lead_qualification IS 'Detailed BANT qualification data';
COMMENT ON TABLE lead_touchpoints IS 'All outreach/contact history for leads';
COMMENT ON TABLE deal_stages_history IS 'Historical stage transitions for deals';
COMMENT ON TABLE deal_stakeholders IS 'Decision makers and influencers on deals';
COMMENT ON TABLE deal_competitors IS 'Competitive intelligence per deal';
COMMENT ON TABLE deal_products IS 'Products/services included in deals';
COMMENT ON TABLE crm_campaigns IS 'Marketing/outreach campaigns';
COMMENT ON TABLE crm_campaign_targets IS 'Campaign recipients and their status';
COMMENT ON TABLE crm_campaign_content IS 'Email templates and assets for campaigns';
COMMENT ON TABLE crm_campaign_metrics IS 'Campaign performance metrics';
COMMENT ON TABLE crm_activities IS 'Unified activity log for CRM entities';
