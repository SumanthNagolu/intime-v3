-- Migration: Add org_id to offers table and create activities table
-- Date: 2024-11-28

-- =====================================================
-- 1. Add org_id to offers table
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'offers'
        AND column_name = 'org_id'
    ) THEN
        ALTER TABLE offers
        ADD COLUMN org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

        -- Update existing offers with org_id from their related submission
        UPDATE offers o
        SET org_id = s.org_id
        FROM submissions s
        WHERE o.submission_id = s.id
        AND o.org_id IS NULL;

        -- Make org_id NOT NULL after backfilling
        ALTER TABLE offers
        ALTER COLUMN org_id SET NOT NULL;

        -- Create index for org_id lookups
        CREATE INDEX IF NOT EXISTS idx_offers_org_id ON offers(org_id);
    END IF;
END $$;

-- Update RLS policy for offers
DROP POLICY IF EXISTS "Users can view offers in their organization" ON offers;
CREATE POLICY "Users can view offers in their organization" ON offers
    FOR SELECT
    USING (
        org_id IN (
            SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can manage offers in their organization" ON offers;
CREATE POLICY "Users can manage offers in their organization" ON offers
    FOR ALL
    USING (
        org_id IN (
            SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
        )
    );

-- =====================================================
-- 2. Create activities table for Daily Planner
-- =====================================================

CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

    -- Activity details
    title TEXT NOT NULL,
    description TEXT,
    activity_type TEXT NOT NULL, -- 'task', 'follow_up', 'call', 'meeting', 'reminder'
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'

    -- Dates
    start_date TIMESTAMPTZ NOT NULL,
    target_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Escalation tracking
    escalated_days INTEGER DEFAULT 0,
    is_escalated BOOLEAN DEFAULT FALSE,
    escalated_at TIMESTAMPTZ,

    -- Status
    status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'

    -- Optional entity links (polymorphic)
    entity_type TEXT, -- 'job', 'submission', 'candidate', 'account', 'lead', 'deal'
    entity_id UUID,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for activities (defensive - only if columns exist)
CREATE INDEX IF NOT EXISTS idx_activities_org_id ON activities(org_id);

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'start_date') THEN
        CREATE INDEX IF NOT EXISTS idx_activities_start_date ON activities(start_date);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'target_date') THEN
        CREATE INDEX IF NOT EXISTS idx_activities_target_date ON activities(target_date);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_activities_entity ON activities(entity_type, entity_id);

-- Enable RLS on activities
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- RLS policies for activities (defensive - only if user_id column exists)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'user_id') THEN
        DROP POLICY IF EXISTS "Users can view their own activities" ON activities;
        CREATE POLICY "Users can view their own activities" ON activities
            FOR SELECT
            USING (
                user_id IN (
                    SELECT id FROM user_profiles WHERE auth_id = auth.uid()
                )
            );

        DROP POLICY IF EXISTS "Users can manage their own activities" ON activities;
        CREATE POLICY "Users can manage their own activities" ON activities
            FOR ALL
            USING (
                user_id IN (
                    SELECT id FROM user_profiles WHERE auth_id = auth.uid()
                )
            );
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create activities user policies: %', SQLERRM;
END $$;

-- Trigger to update updated_at on activities (defensive)
DO $$ BEGIN
    CREATE OR REPLACE FUNCTION update_activities_updated_at()
    RETURNS TRIGGER AS $fn$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $fn$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS activities_updated_at_trigger ON activities;
    CREATE TRIGGER activities_updated_at_trigger
        BEFORE UPDATE ON activities
        FOR EACH ROW
        EXECUTE FUNCTION update_activities_updated_at();
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create activities_updated_at_trigger: %', SQLERRM;
END $$;

-- Trigger to calculate escalated_days (only if columns exist)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'target_date')
    AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'escalated_days') THEN
        CREATE OR REPLACE FUNCTION calculate_escalated_days()
        RETURNS TRIGGER AS $fn$
        BEGIN
            -- Calculate days past target_date if not completed
            IF NEW.target_date IS NOT NULL AND NEW.completed_at IS NULL THEN
                IF NOW() > NEW.target_date THEN
                    NEW.escalated_days := EXTRACT(DAY FROM (NOW() - NEW.target_date))::INTEGER;
                    IF NEW.escalated_days > 0 AND NOT NEW.is_escalated THEN
                        NEW.is_escalated := TRUE;
                        NEW.escalated_at := NOW();
                    END IF;
                ELSE
                    NEW.escalated_days := 0;
                    NEW.is_escalated := FALSE;
                    NEW.escalated_at := NULL;
                END IF;
            END IF;
            RETURN NEW;
        END;
        $fn$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS activities_escalation_trigger ON activities;
        CREATE TRIGGER activities_escalation_trigger
            BEFORE INSERT OR UPDATE ON activities
            FOR EACH ROW
            EXECUTE FUNCTION calculate_escalated_days();
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create activities_escalation_trigger: %', SQLERRM;
END $$;
