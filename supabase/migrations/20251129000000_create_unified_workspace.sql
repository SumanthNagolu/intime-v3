-- =====================================================
-- InTime v3 - Unified Workspace Architecture Migration
-- Creates: contacts, job_orders, object_owners tables
-- Adds: accountable_id to core tables
-- Creates: RCAI enforcement functions and triggers
-- =====================================================

-- =====================================================
-- 1. CONTACTS TABLE - Universal Contacts
-- =====================================================

CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Contact Type
    contact_type TEXT NOT NULL DEFAULT 'general'
        CHECK (contact_type IN ('client_poc', 'candidate', 'vendor', 'partner', 'internal', 'general')),

    -- Personal Information
    first_name TEXT,
    last_name TEXT,
    full_name TEXT GENERATED ALWAYS AS (
        COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')
    ) STORED,
    email TEXT,
    phone TEXT,
    mobile TEXT,
    linkedin_url TEXT,

    -- Avatar
    avatar_url TEXT,

    -- Professional Information
    title TEXT,
    company_name TEXT,
    company_id UUID REFERENCES accounts(id),
    department TEXT,

    -- Work Location
    work_location TEXT,
    timezone TEXT DEFAULT 'America/New_York',

    -- Communication Preferences
    preferred_contact_method TEXT DEFAULT 'email'
        CHECK (preferred_contact_method IN ('email', 'phone', 'linkedin', 'text', 'video_call')),
    best_time_to_contact TEXT,
    do_not_call_before TEXT,
    do_not_call_after TEXT,

    -- Status & Preferences
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'do_not_contact', 'bounced', 'unsubscribed')),

    -- Source Tracking
    source TEXT,
    source_detail TEXT,
    source_campaign_id UUID REFERENCES campaigns(id),

    -- For candidates: link to user_profile
    user_profile_id UUID REFERENCES user_profiles(id),

    -- Engagement Tracking
    last_contacted_at TIMESTAMPTZ,
    last_response_at TIMESTAMPTZ,
    total_interactions INTEGER DEFAULT 0,
    engagement_score INTEGER DEFAULT 0,

    -- Social Media
    twitter_url TEXT,
    github_url TEXT,

    -- Decision Making (for client POCs)
    decision_authority TEXT
        CHECK (decision_authority IS NULL OR decision_authority IN ('decision_maker', 'influencer', 'gatekeeper', 'end_user', 'champion')),
    buying_role TEXT,
    influence_level TEXT
        CHECK (influence_level IS NULL OR influence_level IN ('high', 'medium', 'low')),

    -- Tags & Notes
    tags TEXT[],
    notes TEXT,
    internal_notes TEXT,

    -- Assignment - Primary owner
    owner_id UUID REFERENCES user_profiles(id),

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id),
    updated_by UUID REFERENCES user_profiles(id),
    deleted_at TIMESTAMPTZ,

    -- Search
    search_vector TSVECTOR
);

-- Indexes for contacts
CREATE INDEX IF NOT EXISTS idx_contacts_org_id ON contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_profile_id ON contacts(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_contacts_type_status ON contacts(contact_type, status);
CREATE INDEX IF NOT EXISTS idx_contacts_owner_id ON contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_contacts_search ON contacts USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_contacts_deleted_at ON contacts(deleted_at) WHERE deleted_at IS NULL;

-- RLS for contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contacts_org_isolation" ON contacts;
CREATE POLICY "contacts_org_isolation" ON contacts
    FOR ALL
    USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- Trigger for search vector and updated_at
CREATE OR REPLACE FUNCTION contacts_search_trigger() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('english',
        COALESCE(NEW.first_name, '') || ' ' ||
        COALESCE(NEW.last_name, '') || ' ' ||
        COALESCE(NEW.email, '') || ' ' ||
        COALESCE(NEW.company_name, '') || ' ' ||
        COALESCE(NEW.title, '') || ' ' ||
        COALESCE(array_to_string(NEW.tags, ' '), '')
    );
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS contacts_search_update ON contacts;
CREATE TRIGGER contacts_search_update
    BEFORE INSERT OR UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION contacts_search_trigger();

-- =====================================================
-- 2. JOB_ORDERS TABLE - Confirmed Client Orders
-- =====================================================

CREATE TABLE IF NOT EXISTS job_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Order Identification (auto-generated: JO-2024-0001)
    order_number TEXT UNIQUE,

    -- Source (where this order came from)
    source_type TEXT NOT NULL DEFAULT 'direct'
        CHECK (source_type IN ('requisition', 'external_job', 'direct')),
    source_job_id UUID REFERENCES jobs(id),
    source_external_job_id UUID REFERENCES external_jobs(id),

    -- Client Association (REQUIRED - must have paying client)
    account_id UUID NOT NULL REFERENCES accounts(id),
    client_contact_id UUID REFERENCES contacts(id),

    -- Order Details
    title TEXT NOT NULL,
    description TEXT,
    requirements TEXT,
    responsibilities TEXT,

    -- Job Classification
    job_type TEXT DEFAULT 'contract'
        CHECK (job_type IN ('contract', 'permanent', 'contract_to_hire', 'temp', 'sow')),
    employment_type TEXT DEFAULT 'w2'
        CHECK (employment_type IN ('w2', '1099', 'corp_to_corp', 'direct_hire')),

    -- Team/Department
    hiring_manager_name TEXT,
    hiring_manager_email TEXT,
    department TEXT,

    -- Location
    location TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'USA',
    zip_code TEXT,
    is_remote BOOLEAN DEFAULT FALSE,
    remote_type TEXT CHECK (remote_type IS NULL OR remote_type IN ('fully_remote', 'hybrid', 'onsite')),
    hybrid_days INTEGER CHECK (hybrid_days IS NULL OR (hybrid_days >= 0 AND hybrid_days <= 5)),

    -- Rates & Financials
    bill_rate NUMERIC(10,2) NOT NULL,
    bill_rate_max NUMERIC(10,2),
    pay_rate_min NUMERIC(10,2),
    pay_rate_max NUMERIC(10,2),
    markup_percentage NUMERIC(5,2),
    currency TEXT DEFAULT 'USD',
    rate_type TEXT DEFAULT 'hourly'
        CHECK (rate_type IN ('hourly', 'daily', 'weekly', 'monthly', 'annual')),

    -- Overtime
    overtime_bill_rate NUMERIC(10,2),
    overtime_pay_rate NUMERIC(10,2),
    overtime_expected BOOLEAN DEFAULT FALSE,

    -- Fee Structure (for perm placements)
    placement_fee_percentage NUMERIC(5,2),
    placement_fee_flat NUMERIC(10,2),
    guarantee_period_days INTEGER,

    -- Positions
    positions_count INTEGER NOT NULL DEFAULT 1 CHECK (positions_count > 0),
    positions_filled INTEGER DEFAULT 0 CHECK (positions_filled >= 0),

    -- Timing
    start_date DATE,
    end_date DATE,
    duration_months INTEGER,
    extension_possible BOOLEAN DEFAULT TRUE,
    start_date_flexibility TEXT,

    -- Priority & Status
    priority TEXT NOT NULL DEFAULT 'normal'
        CHECK (priority IN ('low', 'normal', 'high', 'urgent', 'critical')),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'active', 'on_hold', 'fulfilled', 'cancelled', 'expired')),

    -- Qualification Requirements
    required_skills TEXT[],
    nice_to_have_skills TEXT[],
    min_experience_years INTEGER,
    max_experience_years INTEGER,
    education_requirement TEXT,
    certifications_required TEXT[],

    -- Work Authorization
    visa_requirements TEXT[],
    citizenship_required BOOLEAN DEFAULT FALSE,
    security_clearance_required TEXT,

    -- Background/Drug
    background_check_required BOOLEAN DEFAULT TRUE,
    drug_screen_required BOOLEAN DEFAULT FALSE,

    -- Interview Process
    interview_process TEXT,
    interview_rounds INTEGER,
    technical_assessment_required BOOLEAN DEFAULT FALSE,

    -- Submission Requirements
    submission_instructions TEXT,
    submission_format TEXT,
    max_submissions INTEGER,
    current_submissions INTEGER DEFAULT 0,

    -- Notes
    internal_notes TEXT,
    client_notes TEXT,

    -- VMS/MSP Information
    vms_job_id TEXT,
    vms_name TEXT,
    msp_name TEXT,
    vendor_tier TEXT,

    -- RCAI Primary Owner
    accountable_id UUID NOT NULL REFERENCES user_profiles(id),

    -- Dates
    received_date TIMESTAMPTZ DEFAULT NOW(),
    target_fill_date DATE,
    filled_date DATE,
    closed_date DATE,
    closed_reason TEXT,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id),
    updated_by UUID REFERENCES user_profiles(id),
    deleted_at TIMESTAMPTZ,

    -- Search
    search_vector TSVECTOR
);

-- Indexes for job_orders
CREATE INDEX IF NOT EXISTS idx_job_orders_org_id ON job_orders(org_id);
CREATE INDEX IF NOT EXISTS idx_job_orders_account_id ON job_orders(account_id);
CREATE INDEX IF NOT EXISTS idx_job_orders_status ON job_orders(status);
CREATE INDEX IF NOT EXISTS idx_job_orders_priority ON job_orders(priority);
CREATE INDEX IF NOT EXISTS idx_job_orders_accountable_id ON job_orders(accountable_id);
CREATE INDEX IF NOT EXISTS idx_job_orders_source ON job_orders(source_type, source_job_id);
CREATE INDEX IF NOT EXISTS idx_job_orders_search ON job_orders USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_job_orders_deleted_at ON job_orders(deleted_at) WHERE deleted_at IS NULL;

-- RLS for job_orders
ALTER TABLE job_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "job_orders_org_isolation" ON job_orders;
CREATE POLICY "job_orders_org_isolation" ON job_orders
    FOR ALL
    USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- Auto-generate order number
CREATE OR REPLACE FUNCTION generate_job_order_number() RETURNS trigger AS $$
DECLARE
    year_part TEXT;
    seq_num INTEGER;
BEGIN
    year_part := TO_CHAR(NOW(), 'YYYY');
    SELECT COALESCE(MAX(
        CAST(SPLIT_PART(order_number, '-', 3) AS INTEGER)
    ), 0) + 1 INTO seq_num
    FROM job_orders
    WHERE order_number LIKE 'JO-' || year_part || '-%'
    AND org_id = NEW.org_id;

    NEW.order_number := 'JO-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS job_orders_auto_number ON job_orders;
CREATE TRIGGER job_orders_auto_number
    BEFORE INSERT ON job_orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL)
    EXECUTE FUNCTION generate_job_order_number();

-- Search vector trigger for job_orders
CREATE OR REPLACE FUNCTION job_orders_search_trigger() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('english',
        COALESCE(NEW.title, '') || ' ' ||
        COALESCE(NEW.description, '') || ' ' ||
        COALESCE(NEW.requirements, '') || ' ' ||
        COALESCE(NEW.location, '') || ' ' ||
        COALESCE(array_to_string(NEW.required_skills, ' '), '')
    );
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS job_orders_search_update ON job_orders;
CREATE TRIGGER job_orders_search_update
    BEFORE INSERT OR UPDATE ON job_orders
    FOR EACH ROW EXECUTE FUNCTION job_orders_search_trigger();

-- =====================================================
-- 3. OBJECT_OWNERS TABLE - RCAI Assignments
-- =====================================================

CREATE TABLE IF NOT EXISTS object_owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Polymorphic Association
    entity_type TEXT NOT NULL
        CHECK (entity_type IN ('campaign', 'lead', 'deal', 'account', 'job', 'job_order',
                               'submission', 'contact', 'external_job')),
    entity_id UUID NOT NULL,

    -- Owner
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

    -- RCAI Role
    role TEXT NOT NULL
        CHECK (role IN ('responsible', 'accountable', 'consulted', 'informed')),

    -- Permission (derived from role, but can be overridden)
    permission TEXT NOT NULL DEFAULT 'view'
        CHECK (permission IN ('edit', 'view')),

    -- Is this the primary owner (Accountable)?
    is_primary BOOLEAN DEFAULT FALSE,

    -- Assignment metadata
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by UUID REFERENCES user_profiles(id),

    -- Auto-assigned or manual?
    assignment_type TEXT DEFAULT 'auto'
        CHECK (assignment_type IN ('auto', 'manual')),

    -- Notes
    notes TEXT,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    UNIQUE(entity_type, entity_id, user_id)
);

-- Indexes for object_owners
CREATE INDEX IF NOT EXISTS idx_object_owners_entity ON object_owners(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_object_owners_user ON object_owners(user_id);
CREATE INDEX IF NOT EXISTS idx_object_owners_org ON object_owners(org_id);
CREATE INDEX IF NOT EXISTS idx_object_owners_role ON object_owners(role);
CREATE INDEX IF NOT EXISTS idx_object_owners_permission ON object_owners(permission);
CREATE INDEX IF NOT EXISTS idx_object_owners_primary ON object_owners(entity_type, entity_id) WHERE is_primary = TRUE;

-- RLS for object_owners
ALTER TABLE object_owners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "object_owners_org_isolation" ON object_owners;
CREATE POLICY "object_owners_org_isolation" ON object_owners
    FOR ALL
    USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- Ensure exactly one Accountable per object & set permissions based on role
CREATE OR REPLACE FUNCTION check_single_accountable() RETURNS trigger AS $$
BEGIN
    IF NEW.role = 'accountable' THEN
        -- Set is_primary for accountable
        NEW.is_primary := TRUE;
        NEW.permission := 'edit';

        -- Remove existing accountable if any (demote to consulted)
        UPDATE object_owners
        SET role = 'consulted',
            is_primary = FALSE,
            permission = 'view',
            updated_at = NOW()
        WHERE entity_type = NEW.entity_type
        AND entity_id = NEW.entity_id
        AND role = 'accountable'
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
    END IF;

    -- Responsible gets edit by default
    IF NEW.role = 'responsible' THEN
        NEW.permission := COALESCE(NEW.permission, 'edit');
    END IF;

    -- Consulted and Informed get view by default
    IF NEW.role IN ('consulted', 'informed') AND NEW.permission IS NULL THEN
        NEW.permission := 'view';
    END IF;

    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS object_owners_check_accountable ON object_owners;
CREATE TRIGGER object_owners_check_accountable
    BEFORE INSERT OR UPDATE ON object_owners
    FOR EACH ROW EXECUTE FUNCTION check_single_accountable();

-- Function to check if user can access object
CREATE OR REPLACE FUNCTION can_access_object(
    p_user_id UUID,
    p_entity_type TEXT,
    p_entity_id UUID,
    p_required_permission TEXT DEFAULT 'view'
) RETURNS BOOLEAN AS $$
DECLARE
    v_has_access BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM object_owners
        WHERE user_id = p_user_id
        AND entity_type = p_entity_type
        AND entity_id = p_entity_id
        AND (
            p_required_permission = 'view'
            OR permission = 'edit'
        )
    ) INTO v_has_access;

    RETURN v_has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all RCAI owners for an object
CREATE OR REPLACE FUNCTION get_object_owners(
    p_entity_type TEXT,
    p_entity_id UUID
) RETURNS TABLE (
    user_id UUID,
    role TEXT,
    permission TEXT,
    is_primary BOOLEAN,
    assigned_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        oo.user_id,
        oo.role,
        oo.permission,
        oo.is_primary,
        oo.assigned_at
    FROM object_owners oo
    WHERE oo.entity_type = p_entity_type
    AND oo.entity_id = p_entity_id
    ORDER BY
        CASE oo.role
            WHEN 'accountable' THEN 1
            WHEN 'responsible' THEN 2
            WHEN 'consulted' THEN 3
            WHEN 'informed' THEN 4
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. ADD accountable_id TO CORE TABLES
-- =====================================================

-- Add accountable_id to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS accountable_id UUID REFERENCES user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_leads_accountable_id ON leads(accountable_id);

-- Add accountable_id to deals
ALTER TABLE deals ADD COLUMN IF NOT EXISTS accountable_id UUID REFERENCES user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_deals_accountable_id ON deals(accountable_id);

-- Add accountable_id to accounts
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS accountable_id UUID REFERENCES user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_accounts_accountable_id ON accounts(accountable_id);

-- Add accountable_id to jobs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS accountable_id UUID REFERENCES user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_jobs_accountable_id ON jobs(accountable_id);

-- Add accountable_id to submissions
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS accountable_id UUID REFERENCES user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_submissions_accountable_id ON submissions(accountable_id);

-- Add accountable_id to campaigns
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS accountable_id UUID REFERENCES user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_campaigns_accountable_id ON campaigns(accountable_id);

-- Add accountable_id to external_jobs
ALTER TABLE external_jobs ADD COLUMN IF NOT EXISTS accountable_id UUID REFERENCES user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_external_jobs_accountable_id ON external_jobs(accountable_id);

-- Add accountable_id to contacts
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS accountable_id UUID REFERENCES user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_contacts_accountable_id ON contacts(accountable_id);

-- =====================================================
-- 5. UPDATE EXISTING RECORDS - Set accountable_id from owner_id
-- =====================================================

-- Update leads: set accountable_id = owner_id where not set
UPDATE leads SET accountable_id = owner_id WHERE accountable_id IS NULL AND owner_id IS NOT NULL;

-- Update deals: set accountable_id = owner_id where not set
UPDATE deals SET accountable_id = owner_id WHERE accountable_id IS NULL AND owner_id IS NOT NULL;

-- Update accounts: set accountable_id = account_manager_id where not set
UPDATE accounts SET accountable_id = account_manager_id WHERE accountable_id IS NULL AND account_manager_id IS NOT NULL;

-- Update jobs: set accountable_id = owner_id where not set
UPDATE jobs SET accountable_id = owner_id WHERE accountable_id IS NULL AND owner_id IS NOT NULL;

-- Update submissions: set accountable_id = owner_id where not set
UPDATE submissions SET accountable_id = owner_id WHERE accountable_id IS NULL AND owner_id IS NOT NULL;

-- Update campaigns: set accountable_id = owner_id where not set
UPDATE campaigns SET accountable_id = owner_id WHERE accountable_id IS NULL AND owner_id IS NOT NULL;

-- Update contacts: set accountable_id = owner_id where not set
UPDATE contacts SET accountable_id = owner_id WHERE accountable_id IS NULL AND owner_id IS NOT NULL;

-- =====================================================
-- 6. ADD action_code AND action_metadata TO ACTIVITIES
-- =====================================================

ALTER TABLE activities ADD COLUMN IF NOT EXISTS action_code TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS action_metadata JSONB DEFAULT '{}';

-- Index for action queries
CREATE INDEX IF NOT EXISTS idx_activities_action_code ON activities(action_code);
CREATE INDEX IF NOT EXISTS idx_activities_entity_action ON activities(entity_type, action_code);

-- =====================================================
-- 7. EVENT TRIGGERS FOR CORE TABLES
-- =====================================================

-- Generic event publishing function (if not exists)
CREATE OR REPLACE FUNCTION publish_entity_event() RETURNS trigger AS $$
DECLARE
    v_event_type TEXT;
    v_payload JSONB;
    v_changed_fields JSONB;
    v_user_id UUID;
BEGIN
    -- Get current user ID from session or record
    v_user_id := COALESCE(
        current_setting('app.current_user_id', TRUE)::UUID,
        CASE TG_OP
            WHEN 'DELETE' THEN OLD.updated_by
            ELSE COALESCE(NEW.updated_by, NEW.created_by)
        END
    );

    -- Determine event type
    IF TG_OP = 'INSERT' THEN
        v_event_type := TG_TABLE_NAME || '.created';
        v_payload := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        -- Check for status change
        IF NEW.status IS DISTINCT FROM OLD.status THEN
            v_event_type := TG_TABLE_NAME || '.status_changed';
        ELSE
            v_event_type := TG_TABLE_NAME || '.updated';
        END IF;

        -- Capture changed fields (limit to avoid massive payloads)
        SELECT jsonb_object_agg(key, value) INTO v_changed_fields
        FROM (
            SELECT key, value
            FROM jsonb_each(to_jsonb(NEW))
            WHERE to_jsonb(NEW) -> key IS DISTINCT FROM to_jsonb(OLD) -> key
            LIMIT 20
        ) changed;

        v_payload := jsonb_build_object(
            'id', NEW.id,
            'changed_fields', v_changed_fields,
            'old_status', OLD.status,
            'new_status', NEW.status
        );
    ELSIF TG_OP = 'DELETE' THEN
        v_event_type := TG_TABLE_NAME || '.deleted';
        v_payload := jsonb_build_object('id', OLD.id);
    END IF;

    -- Insert event (use events table if exists)
    BEGIN
        INSERT INTO events (
            org_id,
            event_type,
            event_category,
            aggregate_id,
            payload,
            user_id,
            status
        ) VALUES (
            COALESCE(NEW.org_id, OLD.org_id),
            v_event_type,
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            v_payload,
            v_user_id,
            'completed'
        );
    EXCEPTION WHEN OTHERS THEN
        -- Silently fail if events table doesn't exist or has issues
        NULL;
    END;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to core tables (only create if not exists pattern)
DO $$
BEGIN
    -- contacts
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'contacts_event_trigger') THEN
        CREATE TRIGGER contacts_event_trigger
            AFTER INSERT OR UPDATE OR DELETE ON contacts
            FOR EACH ROW EXECUTE FUNCTION publish_entity_event();
    END IF;

    -- job_orders
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'job_orders_event_trigger') THEN
        CREATE TRIGGER job_orders_event_trigger
            AFTER INSERT OR UPDATE OR DELETE ON job_orders
            FOR EACH ROW EXECUTE FUNCTION publish_entity_event();
    END IF;

    -- leads (check if trigger exists first)
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'leads_event_trigger') THEN
        CREATE TRIGGER leads_event_trigger
            AFTER INSERT OR UPDATE OR DELETE ON leads
            FOR EACH ROW EXECUTE FUNCTION publish_entity_event();
    END IF;

    -- deals
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'deals_event_trigger') THEN
        CREATE TRIGGER deals_event_trigger
            AFTER INSERT OR UPDATE OR DELETE ON deals
            FOR EACH ROW EXECUTE FUNCTION publish_entity_event();
    END IF;

    -- accounts
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'accounts_event_trigger') THEN
        CREATE TRIGGER accounts_event_trigger
            AFTER INSERT OR UPDATE OR DELETE ON accounts
            FOR EACH ROW EXECUTE FUNCTION publish_entity_event();
    END IF;

    -- jobs
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'jobs_event_trigger') THEN
        CREATE TRIGGER jobs_event_trigger
            AFTER INSERT OR UPDATE OR DELETE ON jobs
            FOR EACH ROW EXECUTE FUNCTION publish_entity_event();
    END IF;

    -- submissions
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'submissions_event_trigger') THEN
        CREATE TRIGGER submissions_event_trigger
            AFTER INSERT OR UPDATE OR DELETE ON submissions
            FOR EACH ROW EXECUTE FUNCTION publish_entity_event();
    END IF;

    -- campaigns
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'campaigns_event_trigger') THEN
        CREATE TRIGGER campaigns_event_trigger
            AFTER INSERT OR UPDATE OR DELETE ON campaigns
            FOR EACH ROW EXECUTE FUNCTION publish_entity_event();
    END IF;
END $$;

-- =====================================================
-- 8. AUTO-ASSIGN RCAI ON RECORD CREATION
-- =====================================================

-- Function to auto-assign RCAI when a record is created
CREATE OR REPLACE FUNCTION auto_assign_rcai() RETURNS trigger AS $$
DECLARE
    v_creator_id UUID;
    v_manager_id UUID;
BEGIN
    -- Get creator ID
    v_creator_id := COALESCE(NEW.created_by, NEW.owner_id, NEW.accountable_id);

    IF v_creator_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Try to get creator's manager (if user_profiles has manager_id)
    BEGIN
        SELECT manager_id INTO v_manager_id
        FROM user_profiles
        WHERE id = v_creator_id;
    EXCEPTION WHEN OTHERS THEN
        v_manager_id := NULL;
    END;

    -- Assign creator as Accountable (if not already in RCAI)
    INSERT INTO object_owners (org_id, entity_type, entity_id, user_id, role, permission, assignment_type)
    VALUES (
        NEW.org_id,
        TG_TABLE_NAME,
        NEW.id,
        v_creator_id,
        'accountable',
        'edit',
        'auto'
    )
    ON CONFLICT (entity_type, entity_id, user_id) DO NOTHING;

    -- Assign creator as Responsible too (they do the work)
    INSERT INTO object_owners (org_id, entity_type, entity_id, user_id, role, permission, assignment_type)
    VALUES (
        NEW.org_id,
        TG_TABLE_NAME,
        NEW.id,
        v_creator_id,
        'responsible',
        'edit',
        'auto'
    )
    ON CONFLICT (entity_type, entity_id, user_id) DO UPDATE
    SET role = 'responsible', permission = 'edit';

    -- Assign manager as Informed (if exists)
    IF v_manager_id IS NOT NULL AND v_manager_id != v_creator_id THEN
        INSERT INTO object_owners (org_id, entity_type, entity_id, user_id, role, permission, assignment_type)
        VALUES (
            NEW.org_id,
            TG_TABLE_NAME,
            NEW.id,
            v_manager_id,
            'informed',
            'view',
            'auto'
        )
        ON CONFLICT (entity_type, entity_id, user_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply auto-assign RCAI triggers to core tables
DO $$
BEGIN
    -- contacts
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'contacts_auto_rcai') THEN
        CREATE TRIGGER contacts_auto_rcai
            AFTER INSERT ON contacts
            FOR EACH ROW EXECUTE FUNCTION auto_assign_rcai();
    END IF;

    -- job_orders
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'job_orders_auto_rcai') THEN
        CREATE TRIGGER job_orders_auto_rcai
            AFTER INSERT ON job_orders
            FOR EACH ROW EXECUTE FUNCTION auto_assign_rcai();
    END IF;

    -- leads
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'leads_auto_rcai') THEN
        CREATE TRIGGER leads_auto_rcai
            AFTER INSERT ON leads
            FOR EACH ROW EXECUTE FUNCTION auto_assign_rcai();
    END IF;

    -- deals
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'deals_auto_rcai') THEN
        CREATE TRIGGER deals_auto_rcai
            AFTER INSERT ON deals
            FOR EACH ROW EXECUTE FUNCTION auto_assign_rcai();
    END IF;

    -- jobs
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'jobs_auto_rcai') THEN
        CREATE TRIGGER jobs_auto_rcai
            AFTER INSERT ON jobs
            FOR EACH ROW EXECUTE FUNCTION auto_assign_rcai();
    END IF;

    -- submissions
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'submissions_auto_rcai') THEN
        CREATE TRIGGER submissions_auto_rcai
            AFTER INSERT ON submissions
            FOR EACH ROW EXECUTE FUNCTION auto_assign_rcai();
    END IF;

    -- campaigns
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'campaigns_auto_rcai') THEN
        CREATE TRIGGER campaigns_auto_rcai
            AFTER INSERT ON campaigns
            FOR EACH ROW EXECUTE FUNCTION auto_assign_rcai();
    END IF;
END $$;

-- =====================================================
-- 9. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE contacts IS 'Universal contacts table - POCs, candidates, vendors, partners, all people';
COMMENT ON TABLE job_orders IS 'Confirmed client orders - represents billable work with a paying client';
COMMENT ON TABLE object_owners IS 'RCAI ownership assignments for all business objects';

COMMENT ON FUNCTION can_access_object IS 'Check if a user has required permission on an object via RCAI';
COMMENT ON FUNCTION get_object_owners IS 'Get all RCAI owners for a specific object';
COMMENT ON FUNCTION auto_assign_rcai IS 'Auto-assign RCAI roles when a new record is created';
