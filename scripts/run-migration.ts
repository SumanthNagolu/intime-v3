/**
 * Run Migration Script
 *
 * Runs the interviews org_id migration directly using Supabase admin client
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('Running interviews org_id migration...');

  // Check if org_id column already exists
  const { data: _columns, error: _columnError } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'interviews'
      AND column_name = 'org_id'
    `
  });

  // If rpc doesn't work, try direct query approach
  // First check if interviews table exists
  const { data: _tableCheck, error: tableError } = await supabase
    .from('interviews')
    .select('id')
    .limit(1);

  if (tableError) {
    console.log('Interviews table check:', tableError.message);

    // Table might not exist or no access
    if (tableError.message.includes('does not exist')) {
      console.log('Interviews table does not exist. Skipping migration.');
      return;
    }
  }

  console.log('Interviews table exists. Checking org_id column...');

  // Try to select org_id to see if it exists
  const { data: _orgIdCheck, error: orgIdError } = await supabase
    .from('interviews')
    .select('org_id')
    .limit(1);

  if (!orgIdError) {
    console.log('org_id column already exists on interviews table!');
    return;
  }

  if (orgIdError.message.includes('org_id')) {
    console.log('org_id column does not exist. Need to run migration via Supabase dashboard SQL editor.');
    console.log('\nPlease run this SQL in Supabase Dashboard > SQL Editor:\n');
    console.log(`
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
DROP POLICY IF EXISTS "Users can view interviews in their organization" ON interviews;
CREATE POLICY "Users can view interviews in their organization" ON interviews
    FOR SELECT
    USING (
        org_id IN (
            SELECT org_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can manage interviews in their organization" ON interviews;
CREATE POLICY "Users can manage interviews in their organization" ON interviews
    FOR ALL
    USING (
        org_id IN (
            SELECT org_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );
    `);
    return;
  }

  console.log('Migration check complete.');
}

runMigration()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
