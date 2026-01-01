/**
 * Migration: Add target_end_date column to jobs table
 * 
 * This adds the target_end_date column to track when a job/contract is expected to end.
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function addTargetEndDateColumn() {
  console.log('Adding target_end_date column to jobs table...')

  // Add the target_end_date column
  const { error } = await adminClient.rpc('exec_sql', {
    sql: `
      ALTER TABLE jobs
      ADD COLUMN IF NOT EXISTS target_end_date date;

      COMMENT ON COLUMN jobs.target_end_date IS 'Expected end date for the job/contract';
    `
  })

  if (error) {
    // Try direct SQL if RPC doesn't exist
    console.log('RPC method not available, trying via edge function...')
    
    const response = await fetch(`${supabaseUrl}/functions/v1/execute-sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        sql: `
          ALTER TABLE jobs
          ADD COLUMN IF NOT EXISTS target_end_date date;

          COMMENT ON COLUMN jobs.target_end_date IS 'Expected end date for the job/contract';
        `
      })
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('Failed to add column:', text)
      process.exit(1)
    }

    const result = await response.json()
    console.log('Migration result:', result)
  }

  console.log('✅ target_end_date column added successfully!')
}

addTargetEndDateColumn().catch(console.error)


