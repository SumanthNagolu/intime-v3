-- Lead Wizard Columns Migration
-- Adds all columns needed for the 7-section Lead Wizard
-- Sections: Identity, Classification, Requirements, Qualification, Client Profile, Source, Team

-- ==================== IDENTITY SECTION ====================
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS country text DEFAULT 'US',
ADD COLUMN IF NOT EXISTS company_size text,
ADD COLUMN IF NOT EXISTS industry text;

-- ==================== CLASSIFICATION SECTION ====================
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS lead_type text,
ADD COLUMN IF NOT EXISTS lead_category text,
ADD COLUMN IF NOT EXISTS lead_opportunity_type text,
ADD COLUMN IF NOT EXISTS lead_business_model text,
ADD COLUMN IF NOT EXISTS lead_engagement_type text,
ADD COLUMN IF NOT EXISTS lead_relationship_type text,
ADD COLUMN IF NOT EXISTS lead_existing_relationship boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS lead_previous_engagement_notes text,
ADD COLUMN IF NOT EXISTS lead_priority text,
ADD COLUMN IF NOT EXISTS lead_temperature text;

-- ==================== REQUIREMENTS SECTION ====================
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS lead_primary_contract_type text,
ADD COLUMN IF NOT EXISTS lead_bill_rate_min numeric(10,2),
ADD COLUMN IF NOT EXISTS lead_bill_rate_max numeric(10,2),
ADD COLUMN IF NOT EXISTS lead_bill_rate_currency text DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS lead_target_markup numeric(5,2),
ADD COLUMN IF NOT EXISTS lead_positions_urgency text,
ADD COLUMN IF NOT EXISTS lead_estimated_duration text,
ADD COLUMN IF NOT EXISTS lead_remote_policy text,
ADD COLUMN IF NOT EXISTS lead_secondary_skills text[],
ADD COLUMN IF NOT EXISTS lead_required_certifications text[],
ADD COLUMN IF NOT EXISTS lead_experience_level text,
ADD COLUMN IF NOT EXISTS lead_years_experience_min integer,
ADD COLUMN IF NOT EXISTS lead_years_experience_max integer,
ADD COLUMN IF NOT EXISTS lead_security_clearance_required boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS lead_security_clearance_level text,
ADD COLUMN IF NOT EXISTS lead_background_check_required boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS lead_drug_test_required boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS lead_technical_notes text,
ADD COLUMN IF NOT EXISTS lead_hiring_manager_preferences text;

-- ==================== QUALIFICATION SECTION ====================
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS lead_budget_confirmed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS lead_budget_range text,
ADD COLUMN IF NOT EXISTS lead_decision_maker_identified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS lead_decision_maker_title text,
ADD COLUMN IF NOT EXISTS lead_decision_maker_name text,
ADD COLUMN IF NOT EXISTS lead_competitor_involved boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS lead_competitor_names text,
ADD COLUMN IF NOT EXISTS lead_estimated_placements integer,
ADD COLUMN IF NOT EXISTS lead_volume_potential text,
ADD COLUMN IF NOT EXISTS lead_disqualification_reason text,
ADD COLUMN IF NOT EXISTS lead_probability integer,
ADD COLUMN IF NOT EXISTS lead_estimated_close_date date,
ADD COLUMN IF NOT EXISTS lead_next_steps text,
ADD COLUMN IF NOT EXISTS lead_next_step_date date;

-- ==================== CLIENT PROFILE SECTION ====================
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS lead_uses_vms boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS lead_vms_platform text,
ADD COLUMN IF NOT EXISTS lead_vms_other text,
ADD COLUMN IF NOT EXISTS lead_vms_access_status text,
ADD COLUMN IF NOT EXISTS lead_has_msp boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS lead_msp_name text,
ADD COLUMN IF NOT EXISTS lead_program_type text,
ADD COLUMN IF NOT EXISTS lead_msa_status text,
ADD COLUMN IF NOT EXISTS lead_msa_expiration_date date,
ADD COLUMN IF NOT EXISTS lead_nda_required boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS lead_nda_status text,
ADD COLUMN IF NOT EXISTS lead_payment_terms text,
ADD COLUMN IF NOT EXISTS lead_po_required boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS lead_invoice_format text,
ADD COLUMN IF NOT EXISTS lead_billing_cycle text,
ADD COLUMN IF NOT EXISTS lead_insurance_required boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS lead_insurance_types text[],
ADD COLUMN IF NOT EXISTS lead_minimum_insurance_coverage text,
ADD COLUMN IF NOT EXISTS lead_account_tier text,
ADD COLUMN IF NOT EXISTS lead_industry_vertical text,
ADD COLUMN IF NOT EXISTS lead_company_revenue text;

-- ==================== SOURCE SECTION ====================
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS lead_campaign_name text,
ADD COLUMN IF NOT EXISTS lead_referred_by text,
ADD COLUMN IF NOT EXISTS lead_referral_type text,
ADD COLUMN IF NOT EXISTS lead_referral_contact_id uuid,
ADD COLUMN IF NOT EXISTS lead_utm_source text,
ADD COLUMN IF NOT EXISTS lead_utm_medium text,
ADD COLUMN IF NOT EXISTS lead_utm_campaign text,
ADD COLUMN IF NOT EXISTS lead_utm_content text,
ADD COLUMN IF NOT EXISTS lead_utm_term text,
ADD COLUMN IF NOT EXISTS lead_landing_page text,
ADD COLUMN IF NOT EXISTS lead_first_contact_method text,
ADD COLUMN IF NOT EXISTS lead_source_details text;

-- ==================== TEAM SECTION ====================
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS lead_sales_rep_id uuid,
ADD COLUMN IF NOT EXISTS lead_account_manager_id uuid,
ADD COLUMN IF NOT EXISTS lead_recruiter_id uuid,
ADD COLUMN IF NOT EXISTS lead_territory text,
ADD COLUMN IF NOT EXISTS lead_region text,
ADD COLUMN IF NOT EXISTS lead_business_unit text,
ADD COLUMN IF NOT EXISTS lead_do_not_contact_reason text,
ADD COLUMN IF NOT EXISTS lead_strategy_notes text;

-- ==================== INDEXES ====================
CREATE INDEX IF NOT EXISTS idx_contacts_city ON public.contacts(city) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_state ON public.contacts(state) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_country ON public.contacts(country) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_lead_type ON public.contacts(lead_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_lead_priority ON public.contacts(lead_priority) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_lead_temperature ON public.contacts(lead_temperature) WHERE deleted_at IS NULL;
