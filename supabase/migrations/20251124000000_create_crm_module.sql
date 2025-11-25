-- =====================================================
-- Migration: CRM Module (Accounts, Leads, Deals)
-- Date: 2024-11-24
-- Description: Core CRM tables for client relationship management
-- =====================================================

-- =====================================================
-- 1. ACCOUNTS (Client Companies)
-- =====================================================

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Core fields
  name TEXT NOT NULL,
  industry TEXT,
  company_type TEXT DEFAULT 'direct_client', -- 'direct_client', 'implementation_partner', 'staffing_vendor'
  status TEXT NOT NULL DEFAULT 'prospect', -- 'prospect', 'active', 'inactive', 'churned'
  tier TEXT, -- 'preferred', 'strategic', 'exclusive'

  -- Account management
  account_manager_id UUID REFERENCES user_profiles(id),
  responsiveness TEXT, -- 'high', 'medium', 'low'
  preferred_quality TEXT, -- 'quality', 'quantity', 'speed'
  description TEXT,

  -- Business terms
  contract_start_date TIMESTAMPTZ,
  contract_end_date TIMESTAMPTZ,
  payment_terms_days INTEGER DEFAULT 30,
  markup_percentage NUMERIC(5,2), -- 20.00 = 20%
  annual_revenue_target NUMERIC(12,2),

  -- Contact info
  website TEXT,
  headquarters_location TEXT,
  phone TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,

  -- Search (auto-maintained by trigger)
  search_vector TSVECTOR
);

-- Indexes
CREATE INDEX idx_accounts_org ON accounts(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_manager ON accounts(account_manager_id);
CREATE INDEX idx_accounts_status ON accounts(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_search ON accounts USING GIN(search_vector);
CREATE INDEX idx_accounts_name ON accounts(name) WHERE deleted_at IS NULL;

-- Auto-update search vector
CREATE OR REPLACE FUNCTION update_accounts_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.industry, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_accounts_search_vector
  BEFORE INSERT OR UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_accounts_search_vector();

-- Auto-update updated_at
CREATE TRIGGER trigger_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. POINT_OF_CONTACTS (Decision Makers)
-- =====================================================

CREATE TABLE point_of_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

  -- Core fields
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  title TEXT,
  role TEXT, -- 'VP Engineering', 'TA Lead', 'Hiring Manager'

  -- Contact
  email TEXT NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  preferred_contact_method TEXT DEFAULT 'email', -- 'email', 'phone', 'linkedin'

  -- Influence
  decision_authority TEXT, -- 'decision_maker', 'influencer', 'gatekeeper'
  notes TEXT,

  -- Status
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_pocs_account ON point_of_contacts(account_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_pocs_email ON point_of_contacts(email);
CREATE INDEX idx_pocs_active ON point_of_contacts(is_active) WHERE is_active = true;

-- Auto-update updated_at
CREATE TRIGGER trigger_pocs_updated_at
  BEFORE UPDATE ON point_of_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. ACTIVITY_LOG (Communication History)
-- =====================================================

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Association (polymorphic)
  entity_type TEXT NOT NULL, -- 'account', 'lead', 'candidate', 'deal', 'job'
  entity_id UUID NOT NULL,

  -- Activity details
  activity_type TEXT NOT NULL, -- 'email', 'call', 'meeting', 'note', 'linkedin_message'
  subject TEXT,
  body TEXT,
  direction TEXT, -- 'inbound', 'outbound'

  -- Participants
  performed_by UUID REFERENCES user_profiles(id),
  poc_id UUID REFERENCES point_of_contacts(id),

  -- Metadata
  activity_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  duration_minutes INTEGER,
  outcome TEXT, -- 'positive', 'neutral', 'negative', 'no_response'
  next_action TEXT,
  next_action_date TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_date ON activity_log(activity_date DESC);
CREATE INDEX idx_activity_owner ON activity_log(performed_by);
CREATE INDEX idx_activity_org ON activity_log(org_id);
CREATE INDEX idx_activity_poc ON activity_log(poc_id);

-- =====================================================
-- 4. LEADS (Sales Pipeline)
-- =====================================================

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Lead type
  lead_type TEXT NOT NULL DEFAULT 'company', -- 'company', 'individual'

  -- Company fields
  company_name TEXT,
  industry TEXT,
  company_size TEXT, -- 'small', 'medium', 'large', 'enterprise'

  -- Contact fields
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (
    CASE
      WHEN first_name IS NOT NULL AND last_name IS NOT NULL
      THEN first_name || ' ' || last_name
      ELSE company_name
    END
  ) STORED,
  title TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,

  -- Lead status
  status TEXT NOT NULL DEFAULT 'new', -- 'new', 'warm', 'hot', 'cold', 'converted', 'lost'
  estimated_value NUMERIC(12,2),

  -- Source tracking
  source TEXT, -- 'linkedin', 'referral', 'cold_outreach', 'inbound', 'event'
  source_campaign_id UUID, -- FK to campaigns (will create later)

  -- Assignment
  owner_id UUID REFERENCES user_profiles(id),

  -- Engagement
  last_contacted_at TIMESTAMPTZ,
  last_response_at TIMESTAMPTZ,
  engagement_score INTEGER CHECK (engagement_score >= 0 AND engagement_score <= 100),

  -- Conversion
  converted_to_deal_id UUID, -- FK to deals (self-reference, set below)
  converted_to_account_id UUID REFERENCES accounts(id),
  converted_at TIMESTAMPTZ,
  lost_reason TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,

  -- Search
  search_vector TSVECTOR
);

-- Indexes
CREATE INDEX idx_leads_org ON leads(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_status ON leads(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_owner ON leads(owner_id);
CREATE INDEX idx_leads_source ON leads(source_campaign_id);
CREATE INDEX idx_leads_search ON leads USING GIN(search_vector);
CREATE INDEX idx_leads_email ON leads(email);

-- Auto-update search vector
CREATE OR REPLACE FUNCTION update_leads_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.company_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.first_name || ' ' || NEW.last_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.email, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.industry, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_leads_search_vector
  BEFORE INSERT OR UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_leads_search_vector();

-- Auto-update updated_at
CREATE TRIGGER trigger_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. DEALS (Revenue Opportunities)
-- =====================================================

CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Association
  lead_id UUID REFERENCES leads(id),
  account_id UUID REFERENCES accounts(id),

  -- Deal details
  title TEXT NOT NULL,
  description TEXT,
  value NUMERIC(12,2) NOT NULL,

  -- Pipeline stage
  stage TEXT NOT NULL DEFAULT 'discovery', -- 'discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost'
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,

  -- Assignment
  owner_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Outcome
  close_reason TEXT,

  -- Linked jobs (one deal → multiple jobs, will update when jobs table created)
  linked_job_ids UUID[],

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_deals_org ON deals(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_owner ON deals(owner_id);
CREATE INDEX idx_deals_account ON deals(account_id);
CREATE INDEX idx_deals_lead ON deals(lead_id);
CREATE INDEX idx_deals_expected_close ON deals(expected_close_date);

-- Auto-update updated_at
CREATE TRIGGER trigger_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraint from leads to deals (circular reference)
ALTER TABLE leads
  ADD CONSTRAINT fk_leads_converted_to_deal
  FOREIGN KEY (converted_to_deal_id)
  REFERENCES deals(id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_of_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Note: Helper functions auth_org_id() and auth_has_role() are created in
-- migration 20251123000000_create_helper_functions.sql

-- =====================================================
-- RLS POLICIES: ACCOUNTS
-- =====================================================

-- 1. Organization isolation (multi-tenancy)
CREATE POLICY "accounts_org_isolation"
  ON accounts
  FOR ALL
  USING (org_id = auth_org_id());

-- 2. Employees can view all accounts in their org
CREATE POLICY "accounts_employee_select"
  ON accounts
  FOR SELECT
  USING (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('recruiter')
  );

-- 3. Account managers and recruiters can update their accounts
CREATE POLICY "accounts_employee_update"
  ON accounts
  FOR UPDATE
  USING (
    auth_has_role('admin') OR
    account_manager_id = auth.uid() OR
    created_by = auth.uid()
  );

-- 4. Admins and recruiters can create accounts
CREATE POLICY "accounts_employee_insert"
  ON accounts
  FOR INSERT
  WITH CHECK (
    auth_has_role('admin') OR
    auth_has_role('recruiter')
  );

-- 5. Only admins can delete (soft delete)
CREATE POLICY "accounts_admin_delete"
  ON accounts
  FOR DELETE
  USING (auth_has_role('admin'));

-- =====================================================
-- RLS POLICIES: POINT_OF_CONTACTS
-- =====================================================

CREATE POLICY "pocs_org_isolation"
  ON point_of_contacts
  FOR ALL
  USING (
    account_id IN (
      SELECT id FROM accounts WHERE org_id = auth_org_id()
    )
  );

CREATE POLICY "pocs_employee_all"
  ON point_of_contacts
  FOR ALL
  USING (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('recruiter')
  );

-- =====================================================
-- RLS POLICIES: ACTIVITY_LOG
-- =====================================================

CREATE POLICY "activity_org_isolation"
  ON activity_log
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "activity_employee_select"
  ON activity_log
  FOR SELECT
  USING (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('recruiter')
  );

CREATE POLICY "activity_employee_insert"
  ON activity_log
  FOR INSERT
  WITH CHECK (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('recruiter')
  );

-- =====================================================
-- RLS POLICIES: LEADS
-- =====================================================

CREATE POLICY "leads_org_isolation"
  ON leads
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "leads_employee_select"
  ON leads
  FOR SELECT
  USING (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('ta_specialist')
  );

CREATE POLICY "leads_owner_update"
  ON leads
  FOR UPDATE
  USING (
    auth_has_role('admin') OR
    owner_id = auth.uid() OR
    created_by = auth.uid()
  );

CREATE POLICY "leads_employee_insert"
  ON leads
  FOR INSERT
  WITH CHECK (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('ta_specialist')
  );

-- =====================================================
-- RLS POLICIES: DEALS
-- =====================================================

CREATE POLICY "deals_org_isolation"
  ON deals
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "deals_employee_select"
  ON deals
  FOR SELECT
  USING (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('recruiter')
  );

CREATE POLICY "deals_owner_update"
  ON deals
  FOR UPDATE
  USING (
    auth_has_role('admin') OR
    owner_id = auth.uid() OR
    created_by = auth.uid()
  );

CREATE POLICY "deals_employee_insert"
  ON deals
  FOR INSERT
  WITH CHECK (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('recruiter')
  );

-- =====================================================
-- FUNCTIONS: Business Logic
-- =====================================================

-- Function to convert lead to deal
CREATE OR REPLACE FUNCTION convert_lead_to_deal(
  p_lead_id UUID,
  p_deal_title TEXT,
  p_deal_value NUMERIC,
  p_deal_stage TEXT DEFAULT 'discovery'
)
RETURNS UUID AS $$
DECLARE
  v_lead leads;
  v_account_id UUID;
  v_deal_id UUID;
BEGIN
  -- Get lead details
  SELECT * INTO v_lead FROM leads WHERE id = p_lead_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found';
  END IF;

  -- Create account if company lead and not already converted
  IF v_lead.lead_type = 'company' AND v_lead.converted_to_account_id IS NULL THEN
    INSERT INTO accounts (
      org_id,
      name,
      industry,
      status,
      created_by
    ) VALUES (
      v_lead.org_id,
      v_lead.company_name,
      v_lead.industry,
      'prospect',
      auth.uid()
    ) RETURNING id INTO v_account_id;

    -- Update lead with account reference
    UPDATE leads SET converted_to_account_id = v_account_id WHERE id = p_lead_id;
  ELSE
    v_account_id := v_lead.converted_to_account_id;
  END IF;

  -- Create deal
  INSERT INTO deals (
    org_id,
    lead_id,
    account_id,
    title,
    value,
    stage,
    owner_id,
    created_by
  ) VALUES (
    v_lead.org_id,
    p_lead_id,
    v_account_id,
    p_deal_title,
    p_deal_value,
    p_deal_stage,
    v_lead.owner_id,
    auth.uid()
  ) RETURNING id INTO v_deal_id;

  -- Update lead status
  UPDATE leads SET
    status = 'converted',
    converted_to_deal_id = v_deal_id,
    converted_at = NOW()
  WHERE id = p_lead_id;

  -- Log activity
  INSERT INTO activity_log (
    org_id,
    entity_type,
    entity_id,
    activity_type,
    subject,
    body,
    performed_by,
    activity_date
  ) VALUES (
    v_lead.org_id,
    'lead',
    p_lead_id,
    'note',
    'Lead converted to deal',
    format('Lead converted to deal: %s', p_deal_title),
    auth.uid(),
    NOW()
  );

  RETURN v_deal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SEED DATA (Development/Testing)
-- =====================================================

-- Note: Seed data will be added after user_profiles and organizations are populated
-- This migration focuses on schema creation only

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE accounts IS 'Client companies and prospects';
COMMENT ON TABLE point_of_contacts IS 'Decision makers at client companies';
COMMENT ON TABLE activity_log IS 'Communication history and interactions';
COMMENT ON TABLE leads IS 'Sales pipeline for new business and talent sourcing';
COMMENT ON TABLE deals IS 'Revenue opportunities and closed business';

COMMENT ON FUNCTION convert_lead_to_deal IS 'Converts a lead to a deal, optionally creating an account';
COMMENT ON FUNCTION auth_org_id IS 'Gets current user organization ID from JWT or user_profiles';
COMMENT ON FUNCTION auth_has_role IS 'Checks if current user has specified role';
