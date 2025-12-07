-- Migration: Placement Check-ins and Offer/Placement Enhancements for G01-G04
-- Date: 2025-12-06
-- Purpose: Add placement_checkins table and enhance offers/placements for full workflow

-- =====================================================
-- 1. ENHANCE OFFERS TABLE
-- =====================================================

-- Add pay_rate and bill_rate (separate from single 'rate' column)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'pay_rate') THEN
        ALTER TABLE offers ADD COLUMN pay_rate NUMERIC(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'bill_rate') THEN
        ALTER TABLE offers ADD COLUMN bill_rate NUMERIC(10,2);
    END IF;
END $$;

-- Migrate existing 'rate' data to pay_rate (if applicable)
UPDATE offers SET pay_rate = rate WHERE pay_rate IS NULL AND rate IS NOT NULL;

-- Add additional offer columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'overtime_rate') THEN
        ALTER TABLE offers ADD COLUMN overtime_rate NUMERIC(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'duration_months') THEN
        ALTER TABLE offers ADD COLUMN duration_months INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'employment_type') THEN
        ALTER TABLE offers ADD COLUMN employment_type VARCHAR(20) DEFAULT 'w2' CHECK (employment_type IN ('w2', 'c2c', '1099'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'pto_days') THEN
        ALTER TABLE offers ADD COLUMN pto_days INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'sick_days') THEN
        ALTER TABLE offers ADD COLUMN sick_days INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'health_insurance') THEN
        ALTER TABLE offers ADD COLUMN health_insurance BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'has_401k') THEN
        ALTER TABLE offers ADD COLUMN has_401k BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'work_location') THEN
        ALTER TABLE offers ADD COLUMN work_location VARCHAR(20) DEFAULT 'remote' CHECK (work_location IN ('remote', 'onsite', 'hybrid'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'standard_hours_per_week') THEN
        ALTER TABLE offers ADD COLUMN standard_hours_per_week INTEGER DEFAULT 40;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'internal_notes') THEN
        ALTER TABLE offers ADD COLUMN internal_notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'sent_by') THEN
        ALTER TABLE offers ADD COLUMN sent_by UUID REFERENCES user_profiles(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'accepted_by') THEN
        ALTER TABLE offers ADD COLUMN accepted_by UUID REFERENCES user_profiles(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'withdrawn_at') THEN
        ALTER TABLE offers ADD COLUMN withdrawn_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'withdrawal_reason') THEN
        ALTER TABLE offers ADD COLUMN withdrawal_reason TEXT;
    END IF;
END $$;

-- =====================================================
-- 2. ENHANCE OFFER_NEGOTIATIONS TABLE
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offer_negotiations' AND column_name = 'initiated_by') THEN
        ALTER TABLE offer_negotiations ADD COLUMN initiated_by VARCHAR(20) CHECK (initiated_by IN ('candidate', 'client', 'recruiter'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offer_negotiations' AND column_name = 'original_terms') THEN
        ALTER TABLE offer_negotiations ADD COLUMN original_terms JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offer_negotiations' AND column_name = 'proposed_terms') THEN
        ALTER TABLE offer_negotiations ADD COLUMN proposed_terms JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offer_negotiations' AND column_name = 'counter_message') THEN
        ALTER TABLE offer_negotiations ADD COLUMN counter_message TEXT;
    END IF;
END $$;

-- =====================================================
-- 3. ENHANCE OFFER_APPROVALS TABLE
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offer_approvals' AND column_name = 'approval_type') THEN
        ALTER TABLE offer_approvals ADD COLUMN approval_type VARCHAR(30) CHECK (approval_type IN ('rate_change', 'terms_change', 'low_margin', 'extension'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offer_approvals' AND column_name = 'requested_by') THEN
        ALTER TABLE offer_approvals ADD COLUMN requested_by UUID REFERENCES user_profiles(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offer_approvals' AND column_name = 'request_notes') THEN
        ALTER TABLE offer_approvals ADD COLUMN request_notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offer_approvals' AND column_name = 'proposed_changes') THEN
        ALTER TABLE offer_approvals ADD COLUMN proposed_changes JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offer_approvals' AND column_name = 'responded_at') THEN
        ALTER TABLE offer_approvals ADD COLUMN responded_at TIMESTAMPTZ;
    END IF;
END $$;

-- =====================================================
-- 4. ENHANCE PLACEMENTS TABLE
-- =====================================================

DO $$
BEGIN
    -- Health tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placements' AND column_name = 'health_status') THEN
        ALTER TABLE placements ADD COLUMN health_status VARCHAR(20) DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'at_risk', 'critical'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placements' AND column_name = 'next_check_in_date') THEN
        ALTER TABLE placements ADD COLUMN next_check_in_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placements' AND column_name = 'last_check_in_date') THEN
        ALTER TABLE placements ADD COLUMN last_check_in_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placements' AND column_name = 'last_check_in_by') THEN
        ALTER TABLE placements ADD COLUMN last_check_in_by UUID REFERENCES user_profiles(id);
    END IF;

    -- Rate type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placements' AND column_name = 'rate_type') THEN
        ALTER TABLE placements ADD COLUMN rate_type VARCHAR(20) DEFAULT 'hourly';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placements' AND column_name = 'employment_type') THEN
        ALTER TABLE placements ADD COLUMN employment_type VARCHAR(20) DEFAULT 'w2';
    END IF;

    -- Work details
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placements' AND column_name = 'work_location') THEN
        ALTER TABLE placements ADD COLUMN work_location VARCHAR(20) DEFAULT 'remote';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placements' AND column_name = 'work_schedule') THEN
        ALTER TABLE placements ADD COLUMN work_schedule VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placements' AND column_name = 'timezone') THEN
        ALTER TABLE placements ADD COLUMN timezone VARCHAR(50) DEFAULT 'America/New_York';
    END IF;

    -- Onboarding
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placements' AND column_name = 'onboarding_format') THEN
        ALTER TABLE placements ADD COLUMN onboarding_format VARCHAR(20) DEFAULT 'virtual' CHECK (onboarding_format IN ('virtual', 'in_person', 'hybrid'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placements' AND column_name = 'first_day_meeting_link') THEN
        ALTER TABLE placements ADD COLUMN first_day_meeting_link TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placements' AND column_name = 'first_day_location') THEN
        ALTER TABLE placements ADD COLUMN first_day_location TEXT;
    END IF;

    -- Contacts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placements' AND column_name = 'hiring_manager_name') THEN
        ALTER TABLE placements ADD COLUMN hiring_manager_name VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placements' AND column_name = 'hiring_manager_email') THEN
        ALTER TABLE placements ADD COLUMN hiring_manager_email VARCHAR(200);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placements' AND column_name = 'hiring_manager_phone') THEN
        ALTER TABLE placements ADD COLUMN hiring_manager_phone VARCHAR(30);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placements' AND column_name = 'hr_contact_name') THEN
        ALTER TABLE placements ADD COLUMN hr_contact_name VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placements' AND column_name = 'hr_contact_email') THEN
        ALTER TABLE placements ADD COLUMN hr_contact_email VARCHAR(200);
    END IF;

    -- Paperwork
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placements' AND column_name = 'paperwork_complete') THEN
        ALTER TABLE placements ADD COLUMN paperwork_complete BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placements' AND column_name = 'background_check_status') THEN
        ALTER TABLE placements ADD COLUMN background_check_status VARCHAR(20) CHECK (background_check_status IN ('pending', 'passed', 'failed', 'waived'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placements' AND column_name = 'i9_complete') THEN
        ALTER TABLE placements ADD COLUMN i9_complete BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placements' AND column_name = 'nda_signed') THEN
        ALTER TABLE placements ADD COLUMN nda_signed BOOLEAN DEFAULT false;
    END IF;

    -- Equipment
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placements' AND column_name = 'equipment_ordered') THEN
        ALTER TABLE placements ADD COLUMN equipment_ordered BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placements' AND column_name = 'equipment_notes') THEN
        ALTER TABLE placements ADD COLUMN equipment_notes TEXT;
    END IF;

    -- Notes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placements' AND column_name = 'internal_notes') THEN
        ALTER TABLE placements ADD COLUMN internal_notes TEXT;
    END IF;

    -- Soft delete
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placements' AND column_name = 'deleted_at') THEN
        ALTER TABLE placements ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
END $$;

-- =====================================================
-- 5. ENHANCE PLACEMENT_MILESTONES TABLE
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placement_milestones' AND column_name = 'status') THEN
        ALTER TABLE placement_milestones ADD COLUMN status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placement_milestones' AND column_name = 'completed_date') THEN
        ALTER TABLE placement_milestones ADD COLUMN completed_date DATE;
    END IF;
END $$;

-- =====================================================
-- 6. ENHANCE PLACEMENT_EXTENSIONS TABLE
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placement_extensions' AND column_name = 'original_end_date') THEN
        ALTER TABLE placement_extensions ADD COLUMN original_end_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placement_extensions' AND column_name = 'extension_months') THEN
        ALTER TABLE placement_extensions ADD COLUMN extension_months INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placement_extensions' AND column_name = 'new_pay_rate') THEN
        ALTER TABLE placement_extensions ADD COLUMN new_pay_rate NUMERIC(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placement_extensions' AND column_name = 'new_bill_rate') THEN
        ALTER TABLE placement_extensions ADD COLUMN new_bill_rate NUMERIC(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placement_extensions' AND column_name = 'notes') THEN
        ALTER TABLE placement_extensions ADD COLUMN notes TEXT;
    END IF;
END $$;

-- =====================================================
-- 7. ENHANCE PLACEMENT_RATES TABLE
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placement_rates' AND column_name = 'rate_type') THEN
        ALTER TABLE placement_rates ADD COLUMN rate_type VARCHAR(20) DEFAULT 'regular' CHECK (rate_type IN ('regular', 'overtime', 'holiday'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'placement_rates' AND column_name = 'effective_date') THEN
        ALTER TABLE placement_rates ADD COLUMN effective_date DATE;
    END IF;
END $$;

-- =====================================================
-- 8. ADD OFFER_ID AND PLACEMENT_ID TO SUBMISSIONS
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'offer_id') THEN
        ALTER TABLE submissions ADD COLUMN offer_id UUID REFERENCES offers(id);
        CREATE INDEX IF NOT EXISTS idx_submissions_offer_id ON submissions(offer_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'placement_id') THEN
        ALTER TABLE submissions ADD COLUMN placement_id UUID REFERENCES placements(id);
        CREATE INDEX IF NOT EXISTS idx_submissions_placement_id ON submissions(placement_id);
    END IF;
END $$;

-- =====================================================
-- 9. CREATE PLACEMENT_CHECKINS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS placement_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    placement_id UUID NOT NULL REFERENCES placements(id) ON DELETE CASCADE,

    -- Check-in Type
    checkin_type VARCHAR(20) NOT NULL CHECK (checkin_type IN ('7_day', '30_day', '60_day', '90_day', 'ad_hoc')),
    checkin_date DATE NOT NULL,

    -- Candidate Feedback
    candidate_contact_method VARCHAR(20) CHECK (candidate_contact_method IN ('phone', 'video', 'in_person', 'email')),
    candidate_response_status VARCHAR(20) CHECK (candidate_response_status IN ('completed', 'scheduled', 'left_message', 'no_response')),
    candidate_overall_satisfaction VARCHAR(20) CHECK (candidate_overall_satisfaction IN ('excellent', 'good', 'fair', 'poor')),
    candidate_role_satisfaction VARCHAR(20) CHECK (candidate_role_satisfaction IN ('very_satisfied', 'satisfied', 'neutral', 'unsatisfied')),
    candidate_team_relationship VARCHAR(20) CHECK (candidate_team_relationship IN ('excellent', 'good', 'fair', 'poor')),
    candidate_workload VARCHAR(20) CHECK (candidate_workload IN ('just_right', 'a_bit_much', 'too_much', 'too_little')),
    candidate_payment_status VARCHAR(20) CHECK (candidate_payment_status IN ('no_issues', 'minor_delay', 'major_issue')),
    candidate_extension_interest VARCHAR(30) CHECK (candidate_extension_interest IN ('definitely_interested', 'probably_interested', 'unsure', 'not_interested', 'too_early')),
    candidate_sentiment VARCHAR(20) CHECK (candidate_sentiment IN ('very_positive', 'positive', 'neutral', 'negative')),
    candidate_concerns TEXT,
    candidate_notes TEXT,

    -- Client Feedback
    client_contact_method VARCHAR(20) CHECK (client_contact_method IN ('phone', 'video', 'in_person', 'email')),
    client_contact_id UUID REFERENCES user_profiles(id),
    client_performance_rating VARCHAR(20) CHECK (client_performance_rating IN ('exceeds', 'meets', 'below', 'not_meeting')),
    client_team_integration VARCHAR(20) CHECK (client_team_integration IN ('excellent', 'good', 'fair', 'poor')),
    client_work_quality VARCHAR(20) CHECK (client_work_quality IN ('excellent', 'good', 'fair', 'poor')),
    client_communication VARCHAR(20) CHECK (client_communication IN ('excellent', 'good', 'fair', 'poor')),
    client_extension_interest VARCHAR(20) CHECK (client_extension_interest IN ('definitely', 'probably', 'unsure', 'probably_not')),
    client_satisfaction VARCHAR(20) CHECK (client_satisfaction IN ('very_satisfied', 'satisfied', 'neutral', 'unsatisfied')),
    client_concerns TEXT,
    client_notes TEXT,

    -- Overall Assessment
    overall_health VARCHAR(20) NOT NULL CHECK (overall_health IN ('excellent', 'good', 'at_risk', 'critical')),
    risk_factors TEXT[], -- Array of identified risk factors
    action_items JSONB DEFAULT '[]', -- Array of {title, due_date, assigned_to, status}

    -- Follow-up
    next_checkin_date DATE,
    follow_up_required VARCHAR(20) CHECK (follow_up_required IN ('none', 'scheduled', 'escalate')),
    escalated_to UUID REFERENCES user_profiles(id),

    -- Audit
    conducted_by UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_placement_checkins_org ON placement_checkins(org_id);
CREATE INDEX IF NOT EXISTS idx_placement_checkins_placement ON placement_checkins(placement_id);
CREATE INDEX IF NOT EXISTS idx_placement_checkins_type ON placement_checkins(checkin_type);
CREATE INDEX IF NOT EXISTS idx_placement_checkins_date ON placement_checkins(checkin_date);
CREATE INDEX IF NOT EXISTS idx_placement_checkins_health ON placement_checkins(overall_health);

-- RLS Policies
ALTER TABLE placement_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their org's placement checkins" ON placement_checkins;
CREATE POLICY "Users can view their org's placement checkins"
    ON placement_checkins FOR SELECT
    USING (org_id IN (
        SELECT org_id FROM user_profiles WHERE id = auth.uid() OR auth_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can insert placement checkins for their org" ON placement_checkins;
CREATE POLICY "Users can insert placement checkins for their org"
    ON placement_checkins FOR INSERT
    WITH CHECK (org_id IN (
        SELECT org_id FROM user_profiles WHERE id = auth.uid() OR auth_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can update their org's placement checkins" ON placement_checkins;
CREATE POLICY "Users can update their org's placement checkins"
    ON placement_checkins FOR UPDATE
    USING (org_id IN (
        SELECT org_id FROM user_profiles WHERE id = auth.uid() OR auth_id = auth.uid()
    ));

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_placement_checkins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_placement_checkins_updated_at ON placement_checkins;
CREATE TRIGGER update_placement_checkins_updated_at
    BEFORE UPDATE ON placement_checkins
    FOR EACH ROW
    EXECUTE FUNCTION update_placement_checkins_updated_at();

-- =====================================================
-- 10. ADD INDEXES FOR NEW COLUMNS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_placements_health_status ON placements(health_status);
CREATE INDEX IF NOT EXISTS idx_placements_next_check_in ON placements(next_check_in_date);
CREATE INDEX IF NOT EXISTS idx_offers_pay_rate ON offers(pay_rate);
CREATE INDEX IF NOT EXISTS idx_offers_bill_rate ON offers(bill_rate);
CREATE INDEX IF NOT EXISTS idx_offers_employment_type ON offers(employment_type);
