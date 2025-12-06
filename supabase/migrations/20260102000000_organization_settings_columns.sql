-- ============================================================================
-- ORGANIZATION SETTINGS COLUMNS MIGRATION
-- Add comprehensive organization settings columns to organizations table
-- ============================================================================

-- ============================================================================
-- COMPANY INFORMATION COLUMNS
-- ============================================================================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS company_size TEXT,
  ADD COLUMN IF NOT EXISTS founded_year INTEGER;

COMMENT ON COLUMN organizations.industry IS 'Industry classification: IT Staffing, Healthcare, Finance, etc.';
COMMENT ON COLUMN organizations.company_size IS 'Company size range: 1-10, 11-50, 51-200, etc.';
COMMENT ON COLUMN organizations.founded_year IS 'Year the company was founded';

-- ============================================================================
-- BRANDING COLUMNS
-- ============================================================================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS favicon_url TEXT,
  ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#000000',
  ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#B76E79',
  ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#FDFBF7',
  ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT '#171717';

COMMENT ON COLUMN organizations.logo_url IS 'URL to organization logo image';
COMMENT ON COLUMN organizations.favicon_url IS 'URL to organization favicon';
COMMENT ON COLUMN organizations.primary_color IS 'Primary brand color (hex)';
COMMENT ON COLUMN organizations.secondary_color IS 'Secondary/accent brand color (hex)';
COMMENT ON COLUMN organizations.background_color IS 'Background color for branded pages';
COMMENT ON COLUMN organizations.text_color IS 'Primary text color';

-- ============================================================================
-- REGIONAL SETTINGS COLUMNS
-- ============================================================================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York',
  ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en-US',
  ADD COLUMN IF NOT EXISTS date_format TEXT DEFAULT 'MM/DD/YYYY',
  ADD COLUMN IF NOT EXISTS time_format TEXT DEFAULT '12h',
  ADD COLUMN IF NOT EXISTS week_start TEXT DEFAULT 'sunday',
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS number_format TEXT DEFAULT '1,234.56';

COMMENT ON COLUMN organizations.timezone IS 'Default timezone (IANA identifier)';
COMMENT ON COLUMN organizations.locale IS 'Default locale for formatting';
COMMENT ON COLUMN organizations.date_format IS 'Date format pattern: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD';
COMMENT ON COLUMN organizations.time_format IS 'Time format: 12h or 24h';
COMMENT ON COLUMN organizations.week_start IS 'Week start day: sunday or monday';
COMMENT ON COLUMN organizations.currency IS 'Default currency code (ISO 4217)';
COMMENT ON COLUMN organizations.number_format IS 'Number format pattern: 1,234.56 or 1.234,56';

-- ============================================================================
-- FISCAL YEAR COLUMNS
-- ============================================================================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS fiscal_year_start INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS reporting_period TEXT DEFAULT 'quarterly',
  ADD COLUMN IF NOT EXISTS sprint_alignment BOOLEAN DEFAULT true;

COMMENT ON COLUMN organizations.fiscal_year_start IS 'Fiscal year start month (1=January, 12=December)';
COMMENT ON COLUMN organizations.reporting_period IS 'Reporting period type: monthly, quarterly, semi-annual';
COMMENT ON COLUMN organizations.sprint_alignment IS 'Whether sprints align with fiscal periods';

-- ============================================================================
-- BUSINESS HOURS COLUMNS
-- ============================================================================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '{
    "monday": {"open": true, "start": "09:00", "end": "17:00", "break_minutes": 60},
    "tuesday": {"open": true, "start": "09:00", "end": "17:00", "break_minutes": 60},
    "wednesday": {"open": true, "start": "09:00", "end": "17:00", "break_minutes": 60},
    "thursday": {"open": true, "start": "09:00", "end": "17:00", "break_minutes": 60},
    "friday": {"open": true, "start": "09:00", "end": "17:00", "break_minutes": 60},
    "saturday": {"open": false},
    "sunday": {"open": false}
  }'::JSONB,
  ADD COLUMN IF NOT EXISTS holiday_calendar TEXT DEFAULT 'us_federal',
  ADD COLUMN IF NOT EXISTS custom_holidays JSONB DEFAULT '[]'::JSONB;

COMMENT ON COLUMN organizations.business_hours IS 'Business hours per day with start, end, and break times';
COMMENT ON COLUMN organizations.holiday_calendar IS 'Holiday calendar preset: us_federal, us_federal_common, custom';
COMMENT ON COLUMN organizations.custom_holidays IS 'Array of custom holidays [{date, name}]';

-- ============================================================================
-- DEFAULT VALUES COLUMN
-- ============================================================================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS default_values JSONB DEFAULT '{
    "job_status": "draft",
    "job_type": "contract",
    "work_location": "hybrid",
    "candidate_source": "direct_application",
    "candidate_availability": "2_weeks",
    "auto_parse_resume": true,
    "submission_status": "pending_review",
    "auto_send_client_email": false,
    "follow_up_days": 3,
    "auto_create_followup": true,
    "email_signature_location": "below",
    "include_company_disclaimer": true
  }'::JSONB;

COMMENT ON COLUMN organizations.default_values IS 'Default values for new records (jobs, candidates, submissions)';

-- ============================================================================
-- CONTACT INFO COLUMN (EXTENDED)
-- ============================================================================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS contact_info JSONB DEFAULT '{
    "main_phone": null,
    "fax": null,
    "general_email": null,
    "support_email": null,
    "hr_email": null,
    "billing_email": null,
    "linkedin_url": null,
    "twitter_handle": null
  }'::JSONB;

COMMENT ON COLUMN organizations.contact_info IS 'Extended contact information including social media';

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_organizations_timezone ON organizations(timezone);
CREATE INDEX IF NOT EXISTS idx_organizations_industry ON organizations(industry);

-- ============================================================================
-- VALIDATION CONSTRAINTS
-- We use DO block with exception handling for idempotent constraint creation
-- ============================================================================

DO $$
BEGIN
  ALTER TABLE organizations
    ADD CONSTRAINT chk_fiscal_year_start CHECK (fiscal_year_start >= 1 AND fiscal_year_start <= 12);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE organizations
    ADD CONSTRAINT chk_primary_color CHECK (primary_color IS NULL OR primary_color ~ '^#[0-9A-Fa-f]{6}$');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE organizations
    ADD CONSTRAINT chk_secondary_color CHECK (secondary_color IS NULL OR secondary_color ~ '^#[0-9A-Fa-f]{6}$');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE organizations
    ADD CONSTRAINT chk_background_color CHECK (background_color IS NULL OR background_color ~ '^#[0-9A-Fa-f]{6}$');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE organizations
    ADD CONSTRAINT chk_text_color CHECK (text_color IS NULL OR text_color ~ '^#[0-9A-Fa-f]{6}$');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
