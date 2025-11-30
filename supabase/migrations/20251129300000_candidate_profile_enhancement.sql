-- ============================================================================
-- COMPREHENSIVE CANDIDATE PROFILE ENHANCEMENT
-- Enterprise ATS-grade candidate data model (Bullhorn/Ceipal compatible)
-- ============================================================================

-- ============================================================================
-- 1. ADDRESSES TABLE (Polymorphic, Multi-Country Support)
-- ============================================================================
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Polymorphic reference (can be used for candidates, accounts, contacts)
  entity_type TEXT NOT NULL CHECK (entity_type IN ('candidate', 'account', 'contact', 'vendor')),
  entity_id UUID NOT NULL,
  address_type TEXT NOT NULL CHECK (address_type IN ('current', 'permanent', 'mailing', 'work', 'billing', 'shipping')),

  -- International address fields
  address_line_1 TEXT,
  address_line_2 TEXT,
  address_line_3 TEXT, -- For international formats that need 3 lines
  city TEXT,
  state_province TEXT, -- State, Province, Prefecture, etc.
  postal_code TEXT,
  country_code TEXT NOT NULL DEFAULT 'US', -- ISO 3166-1 alpha-2
  county TEXT, -- For US/UK addresses

  -- Geo-location (for distance calculations, future use)
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),

  -- Validation
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verification_source TEXT CHECK (verification_source IN ('manual', 'google_maps', 'usps', 'loqate', 'smarty_streets', 'other')),

  -- Metadata
  is_primary BOOLEAN DEFAULT false,
  effective_from DATE,
  effective_to DATE,
  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  updated_by UUID,

  CONSTRAINT unique_address_per_entity_type UNIQUE (entity_type, entity_id, address_type)
);

-- Indexes for addresses
CREATE INDEX IF NOT EXISTS idx_addresses_entity ON addresses(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_addresses_org ON addresses(org_id);
CREATE INDEX IF NOT EXISTS idx_addresses_country ON addresses(country_code);

-- ============================================================================
-- 2. CANDIDATE WORK AUTHORIZATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS candidate_work_authorizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Work Authorization Type
  authorization_type TEXT NOT NULL CHECK (authorization_type IN (
    'citizen', 'permanent_resident', 'work_visa', 'student_visa',
    'ead', 'asylum', 'refugee', 'other'
  )),
  visa_type TEXT, -- H1B, L1, O1, TN, E2, F1_OPT, F1_CPT, J1, H4_EAD, etc.
  country_code TEXT NOT NULL, -- Country this authorization applies to

  -- Status & Validity
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'pending', 'revoked', 'denied')) DEFAULT 'active',
  issue_date DATE,
  expiry_date DATE,
  receipt_number TEXT, -- USCIS receipt number for pending cases

  -- Sponsorship
  requires_sponsorship BOOLEAN DEFAULT false,
  current_sponsor TEXT, -- Current employer sponsor name
  is_transferable BOOLEAN DEFAULT true,
  transfer_in_progress BOOLEAN DEFAULT false,

  -- Cap/Lottery Status (for H1B)
  cap_exempt BOOLEAN DEFAULT false,
  lottery_selected BOOLEAN,
  lottery_year INTEGER,

  -- EAD Specific
  ead_category TEXT, -- C09, C10, C17, C18, etc.
  ead_card_number TEXT,
  ead_expiry DATE,

  -- I-9 Compliance
  i9_completed BOOLEAN DEFAULT false,
  i9_completed_at TIMESTAMPTZ,
  i9_expiry_date DATE,
  i9_section_2_completed BOOLEAN DEFAULT false,
  i9_document_list TEXT CHECK (i9_document_list IN ('A', 'B+C', 'B', 'C')),
  i9_document_details JSONB, -- [{document_title, issuing_authority, document_number, expiry}]
  e_verify_status TEXT CHECK (e_verify_status IN ('not_started', 'pending', 'verified', 'tnc', 'fnc', 'failed', 'closed')),
  e_verify_case_number TEXT,
  e_verify_completion_date DATE,

  -- Passport Information
  passport_country TEXT,
  passport_number_encrypted TEXT, -- Store encrypted
  passport_issue_date DATE,
  passport_expiry_date DATE,
  has_valid_visa_stamp BOOLEAN DEFAULT false,
  visa_stamp_expiry DATE,

  -- Document Storage
  documents JSONB DEFAULT '[]', -- [{type, file_id, file_name, uploaded_at, verified}]

  -- Notes & Audit
  notes TEXT,
  is_primary BOOLEAN DEFAULT false, -- Primary work authorization for this country
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Indexes for work authorizations
CREATE INDEX IF NOT EXISTS idx_work_auth_candidate ON candidate_work_authorizations(candidate_id);
CREATE INDEX IF NOT EXISTS idx_work_auth_org ON candidate_work_authorizations(org_id);
CREATE INDEX IF NOT EXISTS idx_work_auth_country ON candidate_work_authorizations(country_code);
CREATE INDEX IF NOT EXISTS idx_work_auth_status ON candidate_work_authorizations(status);
CREATE INDEX IF NOT EXISTS idx_work_auth_expiry ON candidate_work_authorizations(expiry_date);
CREATE INDEX IF NOT EXISTS idx_work_auth_i9_expiry ON candidate_work_authorizations(i9_expiry_date);

-- ============================================================================
-- 3. CANDIDATE EDUCATION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS candidate_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Education Details
  degree_type TEXT CHECK (degree_type IN (
    'high_school', 'ged', 'vocational', 'associate', 'bachelor',
    'master', 'mba', 'doctorate', 'phd', 'postdoc',
    'certificate', 'diploma', 'professional_degree', 'other'
  )),
  degree_name TEXT, -- e.g., "Bachelor of Science", "Master of Business Administration"
  field_of_study TEXT, -- Major
  minor TEXT,
  concentration TEXT,

  -- Institution
  institution_name TEXT NOT NULL,
  institution_type TEXT CHECK (institution_type IN ('university', 'college', 'community_college', 'trade_school', 'online', 'high_school', 'other')),
  institution_city TEXT,
  institution_state TEXT,
  institution_country TEXT,
  country_code TEXT,

  -- Dates
  start_date DATE,
  end_date DATE,
  expected_graduation DATE, -- For current students
  is_current BOOLEAN DEFAULT false,

  -- Academic Performance
  gpa NUMERIC(4, 2),
  gpa_scale NUMERIC(3, 1) DEFAULT 4.0,
  class_rank TEXT, -- e.g., "Top 10%", "Valedictorian"
  honors TEXT, -- Summa Cum Laude, Magna Cum Laude, etc.
  thesis_title TEXT,
  dissertation_title TEXT,

  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  verification_method TEXT, -- 'nsc', 'direct', 'transcript', 'diploma', 'manual'
  verification_notes TEXT,
  transcript_file_id UUID,
  diploma_file_id UUID,

  -- Display
  display_order INTEGER DEFAULT 0,
  is_highest_degree BOOLEAN DEFAULT false,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Indexes for education
CREATE INDEX IF NOT EXISTS idx_education_candidate ON candidate_education(candidate_id);
CREATE INDEX IF NOT EXISTS idx_education_org ON candidate_education(org_id);
CREATE INDEX IF NOT EXISTS idx_education_degree ON candidate_education(degree_type);
CREATE INDEX IF NOT EXISTS idx_education_institution ON candidate_education(institution_name);

-- ============================================================================
-- 4. CANDIDATE WORK HISTORY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS candidate_work_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Company & Role
  company_name TEXT NOT NULL,
  company_industry TEXT,
  company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10000+')),
  job_title TEXT NOT NULL,
  department TEXT,

  -- Employment Details
  employment_type TEXT CHECK (employment_type IN (
    'full_time', 'part_time', 'contract', 'temp', 'freelance',
    'internship', 'apprenticeship', 'volunteer', 'self_employed'
  )),
  employment_basis TEXT CHECK (employment_basis IN ('w2', '1099', 'corp_to_corp', 'direct')),

  -- Location
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  country_code TEXT,
  is_remote BOOLEAN DEFAULT false,
  remote_type TEXT CHECK (remote_type IN ('fully_remote', 'hybrid', 'on_site')),

  -- Dates
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,

  -- Job Details
  description TEXT,
  responsibilities TEXT[],
  achievements TEXT[],
  skills_used TEXT[],
  tools_used TEXT[],
  projects TEXT[],

  -- Salary (optional, for internal reference)
  salary_amount NUMERIC(12, 2),
  salary_currency TEXT DEFAULT 'USD',
  salary_type TEXT CHECK (salary_type IN ('annual', 'monthly', 'hourly')),

  -- Verification
  supervisor_name TEXT,
  supervisor_title TEXT,
  supervisor_email TEXT,
  supervisor_phone TEXT,
  hr_contact_name TEXT,
  hr_contact_email TEXT,
  hr_contact_phone TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  verification_method TEXT, -- 'direct_call', 'email', 'third_party', 'linkedin', 'manual'
  verification_notes TEXT,

  -- Exit Details
  reason_for_leaving TEXT,
  is_rehire_eligible BOOLEAN,
  rehire_notes TEXT,

  -- Display
  display_order INTEGER DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Indexes for work history
CREATE INDEX IF NOT EXISTS idx_work_history_candidate ON candidate_work_history(candidate_id);
CREATE INDEX IF NOT EXISTS idx_work_history_org ON candidate_work_history(org_id);
CREATE INDEX IF NOT EXISTS idx_work_history_company ON candidate_work_history(company_name);
CREATE INDEX IF NOT EXISTS idx_work_history_current ON candidate_work_history(is_current) WHERE is_current = true;
CREATE INDEX IF NOT EXISTS idx_work_history_dates ON candidate_work_history(start_date, end_date);

-- ============================================================================
-- 5. CANDIDATE CERTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS candidate_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Certification Type
  certification_type TEXT NOT NULL CHECK (certification_type IN (
    'professional', 'technical', 'vendor', 'industry',
    'license', 'clearance', 'training', 'other'
  )),

  -- Certification Details
  name TEXT NOT NULL,
  acronym TEXT, -- e.g., PMP, AWS SAA, CISSP
  issuing_organization TEXT,
  credential_id TEXT,
  credential_url TEXT, -- URL to verify credential

  -- Validity
  issue_date DATE,
  expiry_date DATE,
  is_lifetime BOOLEAN DEFAULT false,
  requires_renewal BOOLEAN DEFAULT false,
  renewal_period_months INTEGER,
  cpe_credits_required INTEGER, -- Continuing education credits

  -- For Licenses
  license_type TEXT, -- 'professional', 'occupational', 'business'
  license_number TEXT,
  license_state TEXT,
  license_country TEXT,
  license_jurisdiction TEXT,

  -- For Security Clearances
  clearance_level TEXT CHECK (clearance_level IN (
    'public_trust', 'confidential', 'secret', 'top_secret',
    'top_secret_sci', 'q_clearance', 'l_clearance'
  )),
  clearance_status TEXT CHECK (clearance_status IN ('active', 'inactive', 'expired', 'pending', 'denied', 'revoked')),
  clearance_granted_date DATE,
  investigation_type TEXT, -- SSBI, NACLC, etc.
  polygraph_type TEXT CHECK (polygraph_type IN ('none', 'ci', 'full_scope', 'lifestyle')),
  polygraph_date DATE,
  sap_access BOOLEAN DEFAULT false, -- Special Access Programs
  sci_access BOOLEAN DEFAULT false, -- Sensitive Compartmented Information

  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  verification_method TEXT,
  verification_notes TEXT,
  document_file_id UUID,

  -- Display
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false, -- Show prominently on profile

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Indexes for certifications
CREATE INDEX IF NOT EXISTS idx_certifications_candidate ON candidate_certifications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_certifications_org ON candidate_certifications(org_id);
CREATE INDEX IF NOT EXISTS idx_certifications_type ON candidate_certifications(certification_type);
CREATE INDEX IF NOT EXISTS idx_certifications_expiry ON candidate_certifications(expiry_date);
CREATE INDEX IF NOT EXISTS idx_certifications_clearance ON candidate_certifications(clearance_level) WHERE clearance_level IS NOT NULL;

-- ============================================================================
-- 6. CANDIDATE REFERENCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS candidate_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Reference Person Info
  reference_name TEXT NOT NULL,
  reference_title TEXT,
  reference_company TEXT,
  relationship_type TEXT CHECK (relationship_type IN (
    'direct_supervisor', 'indirect_supervisor', 'colleague', 'direct_report',
    'client', 'vendor', 'professor', 'mentor', 'personal', 'other'
  )),
  relationship_description TEXT, -- Additional context
  years_known INTEGER,
  worked_together_from DATE,
  worked_together_to DATE,

  -- Contact Information
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  preferred_contact_method TEXT CHECK (preferred_contact_method IN ('email', 'phone', 'linkedin')),
  best_time_to_contact TEXT,

  -- Verification Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'contacted', 'scheduled', 'in_progress',
    'completed', 'unavailable', 'declined', 'no_response'
  )),
  contact_attempts INTEGER DEFAULT 0,
  last_contact_attempt TIMESTAMPTZ,
  contacted_at TIMESTAMPTZ,
  contacted_by UUID,
  completed_at TIMESTAMPTZ,

  -- Reference Feedback
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- 1-5 scale
  overall_impression TEXT CHECK (overall_impression IN ('excellent', 'good', 'satisfactory', 'mixed', 'poor')),
  would_rehire BOOLEAN,
  would_work_with_again BOOLEAN,

  -- Structured Feedback
  feedback_summary TEXT,
  strengths TEXT[],
  areas_for_improvement TEXT[],

  -- Detailed Questionnaire (stored as JSONB for flexibility)
  questionnaire_responses JSONB, -- [{question, response, rating}]

  -- Notes
  verification_notes TEXT,
  internal_notes TEXT, -- Not shared with candidate

  -- Consent
  reference_consent_given BOOLEAN DEFAULT false,
  consent_date TIMESTAMPTZ,

  -- Display
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Indexes for references
CREATE INDEX IF NOT EXISTS idx_references_candidate ON candidate_references(candidate_id);
CREATE INDEX IF NOT EXISTS idx_references_org ON candidate_references(org_id);
CREATE INDEX IF NOT EXISTS idx_references_status ON candidate_references(status);

-- ============================================================================
-- 7. CANDIDATE BACKGROUND CHECKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS candidate_background_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  placement_id UUID REFERENCES placements(id) ON DELETE SET NULL,

  -- Provider Information
  provider TEXT CHECK (provider IN (
    'sterling', 'hireright', 'checkr', 'accurate', 'goodhire',
    'first_advantage', 'fadv', 'orange_tree', 'info_cubic',
    'internal', 'client_conducted', 'other'
  )),
  provider_reference_id TEXT,
  provider_order_id TEXT,
  package_name TEXT,
  package_type TEXT CHECK (package_type IN ('basic', 'standard', 'comprehensive', 'executive', 'custom')),

  -- Overall Status
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN (
    'not_started', 'consent_pending', 'consent_received', 'initiated',
    'in_progress', 'completed', 'failed', 'cancelled', 'expired'
  )),
  overall_result TEXT CHECK (overall_result IN ('clear', 'consider', 'adverse', 'pending', 'incomplete')),

  -- Dates
  requested_at TIMESTAMPTZ,
  requested_by UUID,
  initiated_at TIMESTAMPTZ,
  estimated_completion DATE,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  valid_for_months INTEGER DEFAULT 12,

  -- Component Checks (JSONB for flexibility)
  checks JSONB DEFAULT '{}',
  /*
   Structure:
   {
     "criminal_national": { "status": "clear", "completed_at": "...", "details": {...} },
     "criminal_county": { "status": "clear", "counties_checked": [...], "completed_at": "..." },
     "criminal_federal": { "status": "clear", "completed_at": "..." },
     "sex_offender": { "status": "clear", "completed_at": "..." },
     "employment": { "status": "verified", "employers_checked": 3, "discrepancies": [], "completed_at": "..." },
     "education": { "status": "verified", "institutions_checked": 2, "completed_at": "..." },
     "professional_license": { "status": "verified", "licenses_checked": [...], "completed_at": "..." },
     "references": { "status": "completed", "references_contacted": 3, "completed_at": "..." },
     "drug_test": { "status": "negative", "test_date": "...", "panel": "10-panel", "lab": "..." },
     "credit": { "status": "satisfactory", "score_range": "good", "completed_at": "..." },
     "mvr": { "status": "clear", "license_valid": true, "violations": [], "completed_at": "..." },
     "ssn_trace": { "status": "verified", "addresses_found": 5, "aliases": [], "completed_at": "..." },
     "global_watchlist": { "status": "clear", "completed_at": "..." },
     "civil_court": { "status": "clear", "completed_at": "..." }
   }
  */

  -- Adjudication
  adjudication_status TEXT CHECK (adjudication_status IN ('not_needed', 'pending', 'approved', 'denied', 'escalated')),
  adjudication_notes TEXT,
  adjudicated_by UUID,
  adjudicated_at TIMESTAMPTZ,

  -- Adverse Action (if required)
  adverse_action_required BOOLEAN DEFAULT false,
  pre_adverse_sent_at TIMESTAMPTZ,
  pre_adverse_response_deadline DATE,
  final_adverse_sent_at TIMESTAMPTZ,
  adverse_action_notes TEXT,

  -- Consent & Documents
  consent_form_file_id UUID,
  consent_signed_at TIMESTAMPTZ,
  consent_ip_address TEXT,
  consent_user_agent TEXT,
  authorization_form_file_id UUID,
  report_file_id UUID,
  report_received_at TIMESTAMPTZ,

  -- Cost Tracking
  cost NUMERIC(10, 2),
  cost_currency TEXT DEFAULT 'USD',
  billed_to TEXT CHECK (billed_to IN ('company', 'client', 'candidate')),

  -- Notes
  notes TEXT,
  internal_notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Indexes for background checks
CREATE INDEX IF NOT EXISTS idx_bgc_candidate ON candidate_background_checks(candidate_id);
CREATE INDEX IF NOT EXISTS idx_bgc_org ON candidate_background_checks(org_id);
CREATE INDEX IF NOT EXISTS idx_bgc_submission ON candidate_background_checks(submission_id) WHERE submission_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bgc_placement ON candidate_background_checks(placement_id) WHERE placement_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bgc_status ON candidate_background_checks(status);
CREATE INDEX IF NOT EXISTS idx_bgc_result ON candidate_background_checks(overall_result);
CREATE INDEX IF NOT EXISTS idx_bgc_expiry ON candidate_background_checks(expires_at);

-- ============================================================================
-- 8. CANDIDATE COMPLIANCE DOCUMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS candidate_compliance_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  placement_id UUID REFERENCES placements(id) ON DELETE SET NULL,
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,

  -- Document Classification
  document_type TEXT NOT NULL CHECK (document_type IN (
    'i9', 'w4', 'w9', 'state_tax', 'direct_deposit',
    'offer_letter', 'employment_agreement', 'contractor_agreement',
    'nda', 'non_compete', 'non_solicitation', 'ip_assignment',
    'employee_handbook_ack', 'policy_acknowledgment', 'code_of_conduct',
    'benefits_enrollment', 'emergency_contact_form',
    'background_check_consent', 'drug_test_consent',
    'equipment_agreement', 'expense_policy',
    'client_specific', 'other'
  )),
  document_name TEXT NOT NULL,
  document_description TEXT,
  document_category TEXT CHECK (document_category IN ('tax', 'employment', 'legal', 'policy', 'benefits', 'client', 'other')),

  -- Status Tracking
  status TEXT NOT NULL DEFAULT 'required' CHECK (status IN (
    'not_required', 'required', 'pending', 'submitted',
    'under_review', 'approved', 'rejected', 'expired', 'superseded'
  )),

  -- Dates
  required_by DATE,
  requested_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  rejected_at TIMESTAMPTZ,
  rejected_by UUID,
  rejection_reason TEXT,
  effective_date DATE,
  expires_at DATE,

  -- File Storage
  file_id UUID,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_mime_type TEXT,

  -- E-Signature
  requires_signature BOOLEAN DEFAULT true,
  is_signed BOOLEAN DEFAULT false,
  signed_at TIMESTAMPTZ,
  signer_name TEXT,
  signer_email TEXT,
  signature_ip TEXT,
  signature_user_agent TEXT,
  signature_method TEXT CHECK (signature_method IN ('docusign', 'hellosign', 'adobe_sign', 'pandadoc', 'manual', 'wet_signature', 'other')),
  signature_envelope_id TEXT, -- External e-sign provider reference

  -- Version Control
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES candidate_compliance_documents(id),
  is_current_version BOOLEAN DEFAULT true,

  -- Client-Specific
  client_id UUID, -- If document is for specific client
  client_name TEXT,

  -- Notes
  notes TEXT,
  internal_notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Indexes for compliance documents
CREATE INDEX IF NOT EXISTS idx_compliance_docs_candidate ON candidate_compliance_documents(candidate_id);
CREATE INDEX IF NOT EXISTS idx_compliance_docs_org ON candidate_compliance_documents(org_id);
CREATE INDEX IF NOT EXISTS idx_compliance_docs_placement ON candidate_compliance_documents(placement_id) WHERE placement_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_compliance_docs_type ON candidate_compliance_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_compliance_docs_status ON candidate_compliance_documents(status);
CREATE INDEX IF NOT EXISTS idx_compliance_docs_expiry ON candidate_compliance_documents(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================================
-- 9. ENHANCE USER_PROFILES TABLE WITH NEW CANDIDATE COLUMNS
-- ============================================================================

-- Personal Details
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS middle_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferred_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS nationality TEXT;

-- Additional Contact
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email_secondary TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone_home TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone_work TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferred_call_time TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS do_not_contact BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS do_not_email BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS do_not_text BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS personal_website TEXT;

-- Emergency Contact
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS emergency_contact_email TEXT;

-- Source/Marketing
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS lead_source TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS lead_source_detail TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS marketing_status TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_on_hotlist BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS hotlist_added_at TIMESTAMPTZ;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS hotlist_added_by UUID;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS hotlist_notes TEXT;

-- Availability (enhanced)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS current_employment_status TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS notice_period_days INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS earliest_start_date DATE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferred_employment_type TEXT[];

-- Relocation (enhanced)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferred_locations TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS relocation_assistance_required BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS relocation_notes TEXT;

-- Compensation (enhanced)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS desired_salary_annual NUMERIC(12, 2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS desired_salary_currency TEXT DEFAULT 'USD';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS minimum_hourly_rate NUMERIC(10, 2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS minimum_annual_salary NUMERIC(12, 2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS benefits_required TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS compensation_notes TEXT;

-- Languages
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]';

-- Rating/Quality
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS recruiter_rating INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS recruiter_rating_notes TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_completeness_score INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_profile_update TIMESTAMPTZ;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_activity_date TIMESTAMPTZ;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_contacted_by UUID;

-- Professional Summary
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS professional_headline TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS professional_summary TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS career_objectives TEXT;

-- Tags/Categories
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS categories TEXT[];

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_user_profiles_lead_source ON user_profiles(lead_source) WHERE lead_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_hotlist ON user_profiles(is_on_hotlist) WHERE is_on_hotlist = true;
CREATE INDEX IF NOT EXISTS idx_user_profiles_employment_status ON user_profiles(current_employment_status) WHERE current_employment_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_recruiter_rating ON user_profiles(recruiter_rating) WHERE recruiter_rating IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_nationality ON user_profiles(nationality) WHERE nationality IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_activity ON user_profiles(last_activity_date);
CREATE INDEX IF NOT EXISTS idx_user_profiles_tags ON user_profiles USING gin(tags) WHERE tags IS NOT NULL;

-- ============================================================================
-- 10. ADD COMPENSATION FIELDS TO SUBMISSIONS TABLE
-- ============================================================================
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS pay_rate NUMERIC(10, 2);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS bill_rate NUMERIC(10, 2);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS markup_percentage NUMERIC(5, 2);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS overtime_pay_rate NUMERIC(10, 2);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS overtime_bill_rate NUMERIC(10, 2);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS double_time_pay_rate NUMERIC(10, 2);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS double_time_bill_rate NUMERIC(10, 2);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS per_diem NUMERIC(10, 2);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS travel_reimbursement BOOLEAN DEFAULT false;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS expenses_billable BOOLEAN DEFAULT false;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS rate_currency TEXT DEFAULT 'USD';

-- ============================================================================
-- 11. ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_work_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_work_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_background_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_compliance_documents ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 12. CREATE RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Addresses policies
CREATE POLICY "Users can view addresses in their org" ON addresses
  FOR SELECT USING (org_id IN (
    SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Users can manage addresses in their org" ON addresses
  FOR ALL USING (org_id IN (
    SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
  ));

-- Work Authorizations policies
CREATE POLICY "Users can view work authorizations in their org" ON candidate_work_authorizations
  FOR SELECT USING (org_id IN (
    SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Users can manage work authorizations in their org" ON candidate_work_authorizations
  FOR ALL USING (org_id IN (
    SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
  ));

-- Education policies
CREATE POLICY "Users can view education in their org" ON candidate_education
  FOR SELECT USING (org_id IN (
    SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Users can manage education in their org" ON candidate_education
  FOR ALL USING (org_id IN (
    SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
  ));

-- Work History policies
CREATE POLICY "Users can view work history in their org" ON candidate_work_history
  FOR SELECT USING (org_id IN (
    SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Users can manage work history in their org" ON candidate_work_history
  FOR ALL USING (org_id IN (
    SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
  ));

-- Certifications policies
CREATE POLICY "Users can view certifications in their org" ON candidate_certifications
  FOR SELECT USING (org_id IN (
    SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Users can manage certifications in their org" ON candidate_certifications
  FOR ALL USING (org_id IN (
    SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
  ));

-- References policies
CREATE POLICY "Users can view references in their org" ON candidate_references
  FOR SELECT USING (org_id IN (
    SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Users can manage references in their org" ON candidate_references
  FOR ALL USING (org_id IN (
    SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
  ));

-- Background Checks policies
CREATE POLICY "Users can view background checks in their org" ON candidate_background_checks
  FOR SELECT USING (org_id IN (
    SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Users can manage background checks in their org" ON candidate_background_checks
  FOR ALL USING (org_id IN (
    SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
  ));

-- Compliance Documents policies
CREATE POLICY "Users can view compliance documents in their org" ON candidate_compliance_documents
  FOR SELECT USING (org_id IN (
    SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Users can manage compliance documents in their org" ON candidate_compliance_documents
  FOR ALL USING (org_id IN (
    SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
  ));

-- ============================================================================
-- 13. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate profile completeness score
CREATE OR REPLACE FUNCTION calculate_profile_completeness(p_candidate_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  has_address BOOLEAN;
  has_work_auth BOOLEAN;
  has_education BOOLEAN;
  has_work_history BOOLEAN;
  has_skills BOOLEAN;
  has_references BOOLEAN;
  candidate RECORD;
BEGIN
  -- Get candidate basic info
  SELECT * INTO candidate FROM user_profiles WHERE id = p_candidate_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Personal Info (10%)
  IF candidate.first_name IS NOT NULL AND candidate.last_name IS NOT NULL THEN
    score := score + 10;
  END IF;

  -- Contact (10%)
  IF candidate.email IS NOT NULL AND candidate.phone IS NOT NULL THEN
    score := score + 10;
  END IF;

  -- Address (10%)
  SELECT EXISTS(SELECT 1 FROM addresses WHERE entity_type = 'candidate' AND entity_id = p_candidate_id) INTO has_address;
  IF has_address THEN
    score := score + 10;
  END IF;

  -- Work Authorization (15%)
  SELECT EXISTS(SELECT 1 FROM candidate_work_authorizations WHERE candidate_id = p_candidate_id AND status = 'active') INTO has_work_auth;
  IF has_work_auth THEN
    score := score + 15;
  END IF;

  -- Skills (10%)
  IF candidate.candidate_skills IS NOT NULL AND array_length(candidate.candidate_skills, 1) >= 3 THEN
    score := score + 10;
  END IF;

  -- Experience (10%)
  SELECT EXISTS(SELECT 1 FROM candidate_work_history WHERE candidate_id = p_candidate_id) INTO has_work_history;
  IF has_work_history THEN
    score := score + 10;
  END IF;

  -- Education (5%)
  SELECT EXISTS(SELECT 1 FROM candidate_education WHERE candidate_id = p_candidate_id) INTO has_education;
  IF has_education THEN
    score := score + 5;
  END IF;

  -- Availability (10%)
  IF candidate.candidate_availability IS NOT NULL THEN
    score := score + 10;
  END IF;

  -- Rates (10%)
  IF candidate.candidate_hourly_rate IS NOT NULL OR candidate.desired_salary_annual IS NOT NULL THEN
    score := score + 10;
  END IF;

  -- References (5%)
  SELECT EXISTS(SELECT 1 FROM candidate_references WHERE candidate_id = p_candidate_id LIMIT 2) INTO has_references;
  IF has_references THEN
    score := score + 5;
  END IF;

  -- Certifications bonus (5%) - optional
  IF EXISTS(SELECT 1 FROM candidate_certifications WHERE candidate_id = p_candidate_id) THEN
    score := LEAST(score + 5, 100);
  END IF;

  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update profile completeness
CREATE OR REPLACE FUNCTION update_profile_completeness()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles
  SET
    profile_completeness_score = calculate_profile_completeness(NEW.candidate_id),
    last_profile_update = now()
  WHERE id = NEW.candidate_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for profile completeness updates
DROP TRIGGER IF EXISTS trg_update_completeness_address ON addresses;
CREATE TRIGGER trg_update_completeness_address
  AFTER INSERT OR UPDATE OR DELETE ON addresses
  FOR EACH ROW
  WHEN (NEW.entity_type = 'candidate' OR OLD.entity_type = 'candidate')
  EXECUTE FUNCTION update_profile_completeness();

DROP TRIGGER IF EXISTS trg_update_completeness_work_auth ON candidate_work_authorizations;
CREATE TRIGGER trg_update_completeness_work_auth
  AFTER INSERT OR UPDATE OR DELETE ON candidate_work_authorizations
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completeness();

DROP TRIGGER IF EXISTS trg_update_completeness_education ON candidate_education;
CREATE TRIGGER trg_update_completeness_education
  AFTER INSERT OR UPDATE OR DELETE ON candidate_education
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completeness();

DROP TRIGGER IF EXISTS trg_update_completeness_work_history ON candidate_work_history;
CREATE TRIGGER trg_update_completeness_work_history
  AFTER INSERT OR UPDATE OR DELETE ON candidate_work_history
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completeness();

DROP TRIGGER IF EXISTS trg_update_completeness_certifications ON candidate_certifications;
CREATE TRIGGER trg_update_completeness_certifications
  AFTER INSERT OR UPDATE OR DELETE ON candidate_certifications
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completeness();

DROP TRIGGER IF EXISTS trg_update_completeness_references ON candidate_references;
CREATE TRIGGER trg_update_completeness_references
  AFTER INSERT OR UPDATE OR DELETE ON candidate_references
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completeness();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
