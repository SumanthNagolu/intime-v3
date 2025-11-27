-- Migration: Add org_id to interviews table
-- This ensures interviews have proper multi-tenancy support

-- Add org_id column to interviews if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'interviews'
        AND column_name = 'org_id'
    ) THEN
        ALTER TABLE interviews
        ADD COLUMN org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

        -- Update existing interviews with org_id from their related submission
        UPDATE interviews i
        SET org_id = s.org_id
        FROM submissions s
        WHERE i.submission_id = s.id
        AND i.org_id IS NULL;

        -- Make org_id NOT NULL after backfilling
        ALTER TABLE interviews
        ALTER COLUMN org_id SET NOT NULL;

        -- Create index for org_id lookups
        CREATE INDEX IF NOT EXISTS idx_interviews_org_id ON interviews(org_id);
    END IF;
END $$;

-- Update RLS policy to include org_id check
-- Note: user_profiles uses auth_id column to link to auth.uid()
DROP POLICY IF EXISTS "Users can view interviews in their organization" ON interviews;
CREATE POLICY "Users can view interviews in their organization" ON interviews
    FOR SELECT
    USING (
        org_id IN (
            SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can manage interviews in their organization" ON interviews;
CREATE POLICY "Users can manage interviews in their organization" ON interviews
    FOR ALL
    USING (
        org_id IN (
            SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
        )
    );
