/**
 * Migration: Add intake_data JSONB column to jobs table
 * This stores all the extended intake wizard data that doesn't have dedicated columns
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const EXECUTE_SQL_URL = `${SUPABASE_URL}/functions/v1/execute-sql`

async function runMigration() {
  const sql = `
    -- Add intake_data JSONB column to jobs table for storing extended intake wizard data
    ALTER TABLE public.jobs 
    ADD COLUMN IF NOT EXISTS intake_data jsonb DEFAULT '{}'::jsonb;

    -- Add comment explaining the column
    COMMENT ON COLUMN public.jobs.intake_data IS 'Extended intake wizard data including: intakeMethod, experienceLevel, requiredSkillsDetailed, education, certifications, industries, roleOpenReason, roleSummary, responsibilities, teamName, teamSize, reportsTo, directReports, keyProjects, successMetrics, workArrangement, locationRestrictions, workAuthorizations, payRateMin, payRateMax, conversionSalaryMin, conversionSalaryMax, conversionFee, benefits, weeklyHours, overtimeExpected, onCallRequired, onCallSchedule, interviewRounds, decisionDays, submissionRequirements, submissionFormat, submissionNotes, candidatesPerWeek, feedbackTurnaround, screeningQuestions';

    -- Create index on intake_data for common queries
    CREATE INDEX IF NOT EXISTS idx_jobs_intake_data ON public.jobs USING gin (intake_data);
  `

  console.log('Running migration to add intake_data column to jobs table...')
  
  try {
    const response = await fetch(EXECUTE_SQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql }),
    })

    const result = await response.json()
    
    if (!response.ok) {
      console.error('Migration failed:', result)
      process.exit(1)
    }

    console.log('✅ Migration successful!')
    console.log('Result:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.error('Migration error:', error)
    process.exit(1)
  }
}

runMigration()


