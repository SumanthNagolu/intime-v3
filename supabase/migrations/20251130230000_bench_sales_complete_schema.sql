/**
 * Bench Sales Complete Schema Migration
 * Created: 2025-11-30
 *
 * Creates 27 tables across 5 modules:
 * - Bench Consultants (6 tables)
 * - Marketing (6 tables)
 * - Vendors (6 tables)
 * - Job Orders (5 tables)
 * - Immigration (5 tables)
 */

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE visa_type AS ENUM (
  -- US Visas
  'usc',
  'green_card',
  'gc_ead',
  'h1b',
  'h1b_transfer',
  'h4_ead',
  'l1a',
  'l1b',
  'l2_ead',
  'opt',
  'opt_stem',
  'cpt',
  'tn',
  'e3',
  'o1',
  -- Canada
  'canada_citizen',
  'canada_pr',
  'canada_owp',
  'canada_cwp',
  'canada_pgwp',
  'canada_lmia'
);

CREATE TYPE visa_alert_level AS ENUM (
  'green',   -- > 180 days
  'yellow',  -- 90-180 days
  'orange',  -- 30-90 days
  'red',     -- < 30 days
  'black'    -- Expired
);

CREATE TYPE bench_status AS ENUM (
  'onboarding',
  'available',
  'marketing',
  'interviewing',
  'placed',
  'inactive'
);

CREATE TYPE marketing_status AS ENUM (
  'draft',
  'active',
  'paused',
  'archived'
);

CREATE TYPE vendor_type AS ENUM (
  'direct_client',
  'prime_vendor',
  'sub_vendor',
  'msp',
  'vms'
);

CREATE TYPE vendor_tier AS ENUM (
  'preferred',
  'standard',
  'new'
);

CREATE TYPE job_order_status AS ENUM (
  'new',
  'working',
  'filled',
  'closed',
  'on_hold'
);

CREATE TYPE job_order_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

CREATE TYPE job_order_source AS ENUM (
  'email',
  'portal',
  'call',
  'referral'
);

CREATE TYPE immigration_case_type AS ENUM (
  'h1b_transfer',
  'h1b_extension',
  'h1b_amendment',
  'gc_perm',
  'gc_i140',
  'gc_i485',
  'opt_extension',
  'tn_renewal',
  'l1_extension'
);

CREATE TYPE immigration_case_status AS ENUM (
  'not_started',
  'in_progress',
  'rfe',
  'approved',
  'denied',
  'withdrawn'
);

-- =====================================================
-- MODULE 1: BENCH CONSULTANTS (6 tables)
-- =====================================================

/**
 * BENCH_CONSULTANTS
 * Main table for consultants on bench
 */
CREATE TABLE bench_consultants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Status
  status bench_status NOT NULL DEFAULT 'available',
  bench_start_date DATE NOT NULL,

  -- Work Authorization
  visa_type visa_type,
  visa_expiry_date DATE,
  work_auth_status TEXT,

  -- Rates
  min_acceptable_rate NUMERIC(10, 2),
  target_rate NUMERIC(10, 2),
  currency TEXT DEFAULT 'USD',

  -- Location Preferences
  willing_relocate BOOLEAN DEFAULT FALSE,
  preferred_locations TEXT[],

  -- Marketing
  marketing_status marketing_status DEFAULT 'draft',

  -- Assignment
  bench_sales_rep_id UUID REFERENCES user_profiles(id),

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,

  UNIQUE(candidate_id)
);

CREATE INDEX idx_bench_consultants_org_id ON bench_consultants(org_id);
CREATE INDEX idx_bench_consultants_candidate_id ON bench_consultants(candidate_id);
CREATE INDEX idx_bench_consultants_status ON bench_consultants(status);
CREATE INDEX idx_bench_consultants_bench_sales_rep_id ON bench_consultants(bench_sales_rep_id);

/**
 * CONSULTANT_VISA_DETAILS
 * Detailed visa information and tracking
 */
CREATE TABLE consultant_visa_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES bench_consultants(id) ON DELETE CASCADE,

  -- Visa Information
  visa_type visa_type NOT NULL,
  visa_start_date DATE,
  visa_expiry_date DATE,

  -- LCA (for H1B)
  lca_status TEXT,
  employer_of_record TEXT,

  -- Grace Period
  grace_period_ends DATE,

  -- Alert
  alert_level visa_alert_level DEFAULT 'green',

  -- Notes
  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consultant_visa_details_consultant_id ON consultant_visa_details(consultant_id);
CREATE INDEX idx_consultant_visa_details_alert_level ON consultant_visa_details(alert_level);

/**
 * CONSULTANT_WORK_AUTHORIZATION
 * Work authorization documents and verification
 */
CREATE TABLE consultant_work_authorization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES bench_consultants(id) ON DELETE CASCADE,

  -- Authorization
  auth_type TEXT NOT NULL,
  start_date DATE,
  end_date DATE,

  -- Document
  document_url TEXT,
  document_file_id UUID,

  -- Verification
  verified_by UUID REFERENCES user_profiles(id),
  verified_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consultant_work_auth_consultant_id ON consultant_work_authorization(consultant_id);

/**
 * CONSULTANT_AVAILABILITY
 * Availability and scheduling constraints
 */
CREATE TABLE consultant_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES bench_consultants(id) ON DELETE CASCADE,

  -- Availability
  available_from DATE NOT NULL,
  notice_period_days INTEGER DEFAULT 0,

  -- Blackout dates (JSONB array)
  blackout_dates JSONB,

  -- Restrictions
  travel_restrictions TEXT,
  relocation_assistance_needed BOOLEAN DEFAULT FALSE,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consultant_availability_consultant_id ON consultant_availability(consultant_id);

/**
 * CONSULTANT_RATES
 * Rate history and expectations
 */
CREATE TABLE consultant_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES bench_consultants(id) ON DELETE CASCADE,

  -- Rate
  rate_type TEXT NOT NULL DEFAULT 'hourly',
  min_rate NUMERIC(10, 2) NOT NULL,
  target_rate NUMERIC(10, 2) NOT NULL,
  max_rate NUMERIC(10, 2),
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Effective dates
  effective_from DATE NOT NULL,
  effective_to DATE,

  -- Notes
  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_consultant_rates_consultant_id ON consultant_rates(consultant_id);

/**
 * CONSULTANT_SKILLS_MATRIX
 * Skills with proficiency and experience tracking
 */
CREATE TABLE consultant_skills_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES bench_consultants(id) ON DELETE CASCADE,

  -- Skill
  skill_id UUID NOT NULL,
  skill_name TEXT NOT NULL,

  -- Proficiency
  proficiency_level INTEGER NOT NULL CHECK (proficiency_level BETWEEN 1 AND 5),
  years_experience NUMERIC(4, 1),
  last_used_date DATE,

  -- Certification
  is_certified BOOLEAN DEFAULT FALSE,
  certification_name TEXT,
  certification_expiry DATE,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(consultant_id, skill_id)
);

CREATE INDEX idx_consultant_skills_matrix_consultant_id ON consultant_skills_matrix(consultant_id);
CREATE INDEX idx_consultant_skills_matrix_skill_id ON consultant_skills_matrix(skill_id);

-- =====================================================
-- MODULE 2: MARKETING (6 tables)
-- =====================================================

/**
 * MARKETING_PROFILES
 * Consultant marketing profiles
 */
CREATE TABLE marketing_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES bench_consultants(id) ON DELETE CASCADE,

  -- Profile content
  headline TEXT NOT NULL,
  summary TEXT,
  highlights TEXT[],

  -- Targeting
  target_roles TEXT[],
  target_industries TEXT[],

  -- Version
  version INTEGER NOT NULL DEFAULT 1,
  status marketing_status NOT NULL DEFAULT 'draft',

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_marketing_profiles_consultant_id ON marketing_profiles(consultant_id);

/**
 * MARKETING_FORMATS
 * Different format versions of marketing profiles
 */
CREATE TABLE marketing_formats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES marketing_profiles(id) ON DELETE CASCADE,

  -- Format
  format_type TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  file_id UUID,

  -- Version
  version INTEGER NOT NULL DEFAULT 1,
  is_default BOOLEAN DEFAULT FALSE,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_marketing_formats_profile_id ON marketing_formats(profile_id);

/**
 * MARKETING_TEMPLATES
 * Reusable marketing templates
 */
CREATE TABLE marketing_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Template
  name TEXT NOT NULL,
  format_type TEXT NOT NULL,
  template_content TEXT NOT NULL,

  -- Placeholders
  placeholders JSONB,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_marketing_templates_org_id ON marketing_templates(org_id);

/**
 * HOTLISTS
 * Marketing hotlists
 */
CREATE TABLE hotlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Hotlist details
  name TEXT NOT NULL,
  description TEXT,

  -- Purpose
  purpose TEXT NOT NULL,
  client_id UUID REFERENCES accounts(id),

  -- Status
  status TEXT NOT NULL DEFAULT 'active',

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_hotlists_org_id ON hotlists(org_id);
CREATE INDEX idx_hotlists_client_id ON hotlists(client_id);

/**
 * HOTLIST_CONSULTANTS
 * Junction table for hotlists and consultants
 */
CREATE TABLE hotlist_consultants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotlist_id UUID NOT NULL REFERENCES hotlists(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL REFERENCES bench_consultants(id) ON DELETE CASCADE,

  -- Ordering
  position_order INTEGER,

  -- Notes
  notes TEXT,

  -- Audit
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  added_by UUID REFERENCES user_profiles(id),

  UNIQUE(hotlist_id, consultant_id)
);

CREATE INDEX idx_hotlist_consultants_hotlist_id ON hotlist_consultants(hotlist_id);
CREATE INDEX idx_hotlist_consultants_consultant_id ON hotlist_consultants(consultant_id);

/**
 * MARKETING_ACTIVITIES
 * Marketing activity tracking
 */
CREATE TABLE marketing_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES bench_consultants(id) ON DELETE CASCADE,

  -- Activity
  activity_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  target_name TEXT,

  -- Sent
  sent_at TIMESTAMPTZ NOT NULL,

  -- Response
  response_type TEXT,
  response_at TIMESTAMPTZ,

  -- Notes
  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_marketing_activities_consultant_id ON marketing_activities(consultant_id);

-- =====================================================
-- MODULE 3: VENDORS (6 tables)
-- =====================================================

/**
 * VENDORS
 * Vendor/partner companies
 */
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Basic info
  name TEXT NOT NULL,
  type vendor_type NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  tier vendor_tier DEFAULT 'standard',

  -- Details
  website TEXT,
  industry_focus TEXT[],
  geographic_focus TEXT[],

  -- Notes
  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_vendors_org_id ON vendors(org_id);
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_tier ON vendors(tier);

/**
 * VENDOR_CONTACTS
 * Points of contact at vendors
 */
CREATE TABLE vendor_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  -- Contact info
  name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  phone TEXT,

  -- Primary contact
  is_primary BOOLEAN DEFAULT FALSE,

  -- Department
  department TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vendor_contacts_vendor_id ON vendor_contacts(vendor_id);

/**
 * VENDOR_TERMS
 * Custom negotiated financial terms with vendors
 */
CREATE TABLE vendor_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  -- Payment
  payment_terms_days INTEGER DEFAULT 30,
  markup_min_percent NUMERIC(5, 2),
  markup_max_percent NUMERIC(5, 2),

  -- Rate range
  preferred_rate_range_min NUMERIC(10, 2),
  preferred_rate_range_max NUMERIC(10, 2),

  -- Contract
  contract_type TEXT,
  contract_expiry DATE,
  msa_on_file BOOLEAN DEFAULT FALSE,

  -- Notes
  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_vendor_terms_vendor_id ON vendor_terms(vendor_id);

/**
 * VENDOR_RELATIONSHIPS
 * Relationships between vendors and other entities
 */
CREATE TABLE vendor_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  -- Related entity (polymorphic)
  related_entity_type TEXT NOT NULL,
  related_entity_id UUID NOT NULL,

  -- Relationship
  relationship_type TEXT NOT NULL,
  strength TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_vendor_relationships_vendor_id ON vendor_relationships(vendor_id);
CREATE INDEX idx_vendor_relationships_related_entity ON vendor_relationships(related_entity_type, related_entity_id);

/**
 * VENDOR_PERFORMANCE
 * Monthly performance metrics for vendors
 */
CREATE TABLE vendor_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  -- Period
  period TEXT NOT NULL,

  -- Metrics
  submissions_count INTEGER DEFAULT 0,
  interviews_count INTEGER DEFAULT 0,
  placements_count INTEGER DEFAULT 0,
  avg_margin_percent NUMERIC(5, 2),

  -- Scores (1-5)
  payment_timeliness_score INTEGER CHECK (payment_timeliness_score BETWEEN 1 AND 5),
  responsiveness_score INTEGER CHECK (responsiveness_score BETWEEN 1 AND 5),

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(vendor_id, period)
);

CREATE INDEX idx_vendor_performance_vendor_id ON vendor_performance(vendor_id);

/**
 * VENDOR_BLACKLIST
 * Blacklisted vendors
 */
CREATE TABLE vendor_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  -- Blacklist reason
  reason TEXT NOT NULL,

  -- Review
  review_date DATE,

  -- Audit
  blacklisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  blacklisted_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_vendor_blacklist_vendor_id ON vendor_blacklist(vendor_id);

-- =====================================================
-- MODULE 4: JOB ORDERS (5 tables)
-- =====================================================

/**
 * JOB_ORDERS
 * Job requirements from vendors
 */
CREATE TABLE job_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Vendor
  vendor_id UUID REFERENCES vendors(id),
  client_name TEXT,

  -- Job details
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  work_mode TEXT,

  -- Rates
  rate_type TEXT DEFAULT 'hourly',
  bill_rate NUMERIC(10, 2),
  duration_months INTEGER,

  -- Positions
  positions INTEGER DEFAULT 1,

  -- Status
  status job_order_status NOT NULL DEFAULT 'new',
  priority job_order_priority DEFAULT 'medium',

  -- Source
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  response_due_at TIMESTAMPTZ,
  source job_order_source DEFAULT 'email',
  original_source_url TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_job_orders_org_id ON job_orders(org_id);
CREATE INDEX idx_job_orders_vendor_id ON job_orders(vendor_id);
CREATE INDEX idx_job_orders_status ON job_orders(status);
CREATE INDEX idx_job_orders_priority ON job_orders(priority);

/**
 * JOB_ORDER_REQUIREMENTS
 * Detailed requirements for job orders
 */
CREATE TABLE job_order_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES job_orders(id) ON DELETE CASCADE,

  -- Requirement
  requirement TEXT NOT NULL,
  type TEXT NOT NULL,
  priority INTEGER DEFAULT 1,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_order_requirements_order_id ON job_order_requirements(order_id);

/**
 * JOB_ORDER_SKILLS
 * Skills required for job orders
 */
CREATE TABLE job_order_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES job_orders(id) ON DELETE CASCADE,

  -- Skill
  skill_name TEXT NOT NULL,
  years_required NUMERIC(4, 1),
  proficiency_required INTEGER CHECK (proficiency_required BETWEEN 1 AND 5),

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_order_skills_order_id ON job_order_skills(order_id);

/**
 * JOB_ORDER_SUBMISSIONS
 * Submissions to job orders
 */
CREATE TABLE job_order_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES job_orders(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL REFERENCES bench_consultants(id) ON DELETE CASCADE,

  -- Submission
  status TEXT NOT NULL DEFAULT 'submitted',
  submitted_rate NUMERIC(10, 2),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Response
  client_response_at TIMESTAMPTZ,

  -- Notes
  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),

  UNIQUE(order_id, consultant_id)
);

CREATE INDEX idx_job_order_submissions_order_id ON job_order_submissions(order_id);
CREATE INDEX idx_job_order_submissions_consultant_id ON job_order_submissions(consultant_id);

/**
 * JOB_ORDER_NOTES
 * Notes on job orders
 */
CREATE TABLE job_order_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES job_orders(id) ON DELETE CASCADE,

  -- Note
  note TEXT NOT NULL,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_job_order_notes_order_id ON job_order_notes(order_id);

-- =====================================================
-- MODULE 5: IMMIGRATION (5 tables)
-- =====================================================

/**
 * IMMIGRATION_CASES
 * Immigration petitions and cases
 */
CREATE TABLE immigration_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL REFERENCES bench_consultants(id) ON DELETE CASCADE,

  -- Case
  case_type immigration_case_type NOT NULL,
  status immigration_case_status NOT NULL DEFAULT 'not_started',

  -- Priority date (for GC)
  priority_date DATE,

  -- Receipt
  receipt_number TEXT,

  -- Attorney
  attorney_id UUID,

  -- Employer
  employer_id UUID REFERENCES organizations(id),

  -- Dates
  start_date DATE,
  expected_completion DATE,
  actual_completion DATE,

  -- Notes
  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_immigration_cases_org_id ON immigration_cases(org_id);
CREATE INDEX idx_immigration_cases_consultant_id ON immigration_cases(consultant_id);
CREATE INDEX idx_immigration_cases_status ON immigration_cases(status);

/**
 * IMMIGRATION_ATTORNEYS
 * Immigration attorney directory
 */
CREATE TABLE immigration_attorneys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Attorney info
  name TEXT NOT NULL,
  firm TEXT,
  email TEXT,
  phone TEXT,

  -- Specialization
  specialization TEXT[],

  -- Rating
  rating NUMERIC(3, 1) CHECK (rating BETWEEN 1.0 AND 5.0),

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_immigration_attorneys_org_id ON immigration_attorneys(org_id);

-- Add foreign key for attorney_id in immigration_cases
ALTER TABLE immigration_cases
  ADD CONSTRAINT fk_immigration_cases_attorney
  FOREIGN KEY (attorney_id) REFERENCES immigration_attorneys(id);

/**
 * IMMIGRATION_DOCUMENTS
 * Immigration case documents
 */
CREATE TABLE immigration_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES immigration_cases(id) ON DELETE CASCADE,

  -- Document
  document_type TEXT NOT NULL,
  file_url TEXT,
  file_id UUID,
  file_name TEXT,

  -- Dates
  issue_date DATE,
  expiry_date DATE,

  -- Verification
  verified_by UUID REFERENCES user_profiles(id),
  verified_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_immigration_documents_case_id ON immigration_documents(case_id);

/**
 * IMMIGRATION_TIMELINES
 * Case milestone tracking
 */
CREATE TABLE immigration_timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES immigration_cases(id) ON DELETE CASCADE,

  -- Milestone
  milestone TEXT NOT NULL,
  target_date DATE,
  actual_date DATE,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending',

  -- Notes
  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_immigration_timelines_case_id ON immigration_timelines(case_id);

/**
 * IMMIGRATION_ALERTS
 * Automated alerts for visa expiry and deadlines
 */
CREATE TABLE immigration_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES bench_consultants(id) ON DELETE CASCADE,

  -- Alert
  alert_type TEXT NOT NULL,
  entity_id UUID,
  alert_date DATE NOT NULL,

  -- Severity
  severity TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Acknowledgment
  acknowledged_by UUID REFERENCES user_profiles(id),
  acknowledged_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_immigration_alerts_consultant_id ON immigration_alerts(consultant_id);
CREATE INDEX idx_immigration_alerts_severity ON immigration_alerts(severity);
CREATE INDEX idx_immigration_alerts_alert_date ON immigration_alerts(alert_date);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated at triggers for all tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bench Consultants
CREATE TRIGGER update_bench_consultants_updated_at
  BEFORE UPDATE ON bench_consultants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultant_visa_details_updated_at
  BEFORE UPDATE ON consultant_visa_details
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultant_work_authorization_updated_at
  BEFORE UPDATE ON consultant_work_authorization
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultant_availability_updated_at
  BEFORE UPDATE ON consultant_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultant_skills_matrix_updated_at
  BEFORE UPDATE ON consultant_skills_matrix
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Marketing
CREATE TRIGGER update_marketing_profiles_updated_at
  BEFORE UPDATE ON marketing_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_formats_updated_at
  BEFORE UPDATE ON marketing_formats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_templates_updated_at
  BEFORE UPDATE ON marketing_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotlists_updated_at
  BEFORE UPDATE ON hotlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vendors
CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_contacts_updated_at
  BEFORE UPDATE ON vendor_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_terms_updated_at
  BEFORE UPDATE ON vendor_terms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_performance_updated_at
  BEFORE UPDATE ON vendor_performance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Job Orders
CREATE TRIGGER update_job_orders_updated_at
  BEFORE UPDATE ON job_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Immigration
CREATE TRIGGER update_immigration_cases_updated_at
  BEFORE UPDATE ON immigration_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_immigration_attorneys_updated_at
  BEFORE UPDATE ON immigration_attorneys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_immigration_documents_updated_at
  BEFORE UPDATE ON immigration_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_immigration_timelines_updated_at
  BEFORE UPDATE ON immigration_timelines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE bench_consultants IS 'Main table for consultants on bench (extends user_profiles)';
COMMENT ON TABLE consultant_visa_details IS 'Detailed visa information and tracking';
COMMENT ON TABLE consultant_work_authorization IS 'Work authorization documents and verification';
COMMENT ON TABLE consultant_availability IS 'Availability and scheduling constraints';
COMMENT ON TABLE consultant_rates IS 'Rate history and expectations';
COMMENT ON TABLE consultant_skills_matrix IS 'Skills with proficiency and experience tracking';

COMMENT ON TABLE marketing_profiles IS 'Consultant marketing profiles (resumes, bios, highlights)';
COMMENT ON TABLE marketing_formats IS 'Different format versions of marketing profiles';
COMMENT ON TABLE marketing_templates IS 'Reusable marketing templates';
COMMENT ON TABLE hotlists IS 'Marketing hotlists';
COMMENT ON TABLE hotlist_consultants IS 'Junction table for hotlists and consultants';
COMMENT ON TABLE marketing_activities IS 'Marketing activity tracking (emails, calls, submissions)';

COMMENT ON TABLE vendors IS 'Vendor/partner companies';
COMMENT ON TABLE vendor_contacts IS 'Points of contact at vendors';
COMMENT ON TABLE vendor_terms IS 'Custom negotiated financial terms with vendors';
COMMENT ON TABLE vendor_relationships IS 'Relationships between vendors and other entities';
COMMENT ON TABLE vendor_performance IS 'Monthly performance metrics for vendors';
COMMENT ON TABLE vendor_blacklist IS 'Blacklisted vendors';

COMMENT ON TABLE job_orders IS 'Job requirements from vendors';
COMMENT ON TABLE job_order_requirements IS 'Detailed requirements for job orders';
COMMENT ON TABLE job_order_skills IS 'Skills required for job orders';
COMMENT ON TABLE job_order_submissions IS 'Submissions to job orders';
COMMENT ON TABLE job_order_notes IS 'Notes on job orders';

COMMENT ON TABLE immigration_cases IS 'Immigration petitions and cases (enhanced)';
COMMENT ON TABLE immigration_attorneys IS 'Immigration attorney directory';
COMMENT ON TABLE immigration_documents IS 'Immigration case documents';
COMMENT ON TABLE immigration_timelines IS 'Case milestone tracking';
COMMENT ON TABLE immigration_alerts IS 'Automated alerts for visa expiry and deadlines';
