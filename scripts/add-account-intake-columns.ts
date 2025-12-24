/**
 * Add Account Intake Columns Migration
 * 
 * Adds:
 * 1. industries text[] to companies table (for storing multiple industries)
 * 2. billing_frequency to company_client_details table
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

const MIGRATION_SQL = `
-- Add industries array column to companies table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'companies'
        AND column_name = 'industries'
    ) THEN
        ALTER TABLE companies
        ADD COLUMN industries text[];
        
        COMMENT ON COLUMN companies.industries IS 'Array of industries the company operates in (for multi-select)';
        
        -- Backfill from existing industry column where available
        UPDATE companies 
        SET industries = ARRAY[industry]
        WHERE industry IS NOT NULL AND industries IS NULL;
        
        RAISE NOTICE 'Added industries column to companies table';
    ELSE
        RAISE NOTICE 'industries column already exists on companies table';
    END IF;
END $$;

-- Add billing_frequency column to company_client_details table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'company_client_details'
        AND column_name = 'billing_frequency'
    ) THEN
        ALTER TABLE company_client_details
        ADD COLUMN billing_frequency VARCHAR(20) DEFAULT 'monthly';
        
        -- Add check constraint
        ALTER TABLE company_client_details
        ADD CONSTRAINT company_client_details_billing_frequency_check 
        CHECK (billing_frequency IN ('weekly', 'biweekly', 'monthly'));
        
        COMMENT ON COLUMN company_client_details.billing_frequency IS 'How often invoices are generated: weekly, biweekly, or monthly';
        
        RAISE NOTICE 'Added billing_frequency column to company_client_details table';
    ELSE
        RAISE NOTICE 'billing_frequency column already exists on company_client_details table';
    END IF;
END $$;
`;

async function runMigration() {
  console.log('Running account intake columns migration...\n');
  
  // Use the execute-sql edge function
  const response = await fetch(`${supabaseUrl}/functions/v1/execute-sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`,
    },
    body: JSON.stringify({ sql: MIGRATION_SQL }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Migration failed:', response.status, errorText);
    
    // Fallback: Print SQL for manual execution
    console.log('\n--- Manual Migration Required ---');
    console.log('Please run this SQL in Supabase Dashboard > SQL Editor:\n');
    console.log(MIGRATION_SQL);
    process.exit(1);
  }

  const result = await response.json();
  console.log('Migration result:', result);
  
  // Verify the columns were added
  console.log('\nVerifying columns...');
  
  // Check industries column
  const { data: companiesData, error: companiesError } = await supabase
    .from('companies')
    .select('id, industries')
    .limit(1);
    
  if (companiesError && companiesError.message.includes('industries')) {
    console.error('❌ industries column was not added to companies table');
  } else {
    console.log('✅ industries column exists on companies table');
  }
  
  // Check billing_frequency column
  const { data: clientDetailsData, error: clientDetailsError } = await supabase
    .from('company_client_details')
    .select('company_id, billing_frequency')
    .limit(1);
    
  if (clientDetailsError && clientDetailsError.message.includes('billing_frequency')) {
    console.error('❌ billing_frequency column was not added to company_client_details table');
  } else {
    console.log('✅ billing_frequency column exists on company_client_details table');
  }
  
  console.log('\nMigration complete!');
}

runMigration()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });

