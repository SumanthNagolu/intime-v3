/**
 * Seed Test Candidates
 * 
 * This script creates test candidates in user_profiles for testing
 * the add-candidate functionality in the job pipeline.
 * 
 * Run: npx tsx scripts/seed-test-candidates.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Test candidates data
const testCandidates = [
  {
    first_name: 'Sarah',
    last_name: 'Chen',
    email: 'sarah.chen@example.com',
    phone: '+15551234567',
    candidate_status: 'active',
    candidate_availability: 'immediate',
    candidate_skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
    candidate_experience_years: 7,
    candidate_hourly_rate: 95,
  },
  {
    first_name: 'Marcus',
    last_name: 'Johnson',
    email: 'marcus.johnson@example.com',
    phone: '+15552345678',
    candidate_status: 'active',
    candidate_availability: 'immediate',
    candidate_skills: ['Python', 'Django', 'Machine Learning', 'TensorFlow', 'Docker'],
    candidate_experience_years: 5,
    candidate_hourly_rate: 110,
  },
  {
    first_name: 'Emily',
    last_name: 'Rodriguez',
    email: 'emily.rodriguez@example.com',
    phone: '+15553456789',
    candidate_status: 'active',
    candidate_availability: '2_weeks',
    candidate_skills: ['Java', 'Spring Boot', 'Kubernetes', 'Microservices', 'Azure'],
    candidate_experience_years: 4,
    candidate_hourly_rate: 85,
  },
  {
    first_name: 'David',
    last_name: 'Kim',
    email: 'david.kim@example.com',
    phone: '+15554567890',
    candidate_status: 'active',
    candidate_availability: 'immediate',
    candidate_skills: ['React Native', 'iOS', 'Android', 'Flutter', 'GraphQL'],
    candidate_experience_years: 6,
    candidate_hourly_rate: 90,
  },
  {
    first_name: 'Jennifer',
    last_name: 'Williams',
    email: 'jennifer.williams@example.com',
    phone: '+15555678901',
    candidate_status: 'active',
    candidate_availability: 'immediate',
    candidate_skills: ['Go', 'Rust', 'C++', 'Systems Programming', 'Linux'],
    candidate_experience_years: 8,
    candidate_hourly_rate: 120,
  },
  {
    first_name: 'Michael',
    last_name: 'Brown',
    email: 'michael.brown@example.com',
    phone: '+15556789012',
    candidate_status: 'active',
    candidate_availability: 'immediate',
    candidate_skills: ['Vue.js', 'Nuxt', 'JavaScript', 'CSS', 'Tailwind'],
    candidate_experience_years: 3,
    candidate_hourly_rate: 70,
  },
  {
    first_name: 'Alexandra',
    last_name: 'Davis',
    email: 'alexandra.davis@example.com',
    phone: '+15557890123',
    candidate_status: 'active',
    candidate_availability: 'immediate',
    candidate_skills: ['DevOps', 'Terraform', 'AWS', 'CI/CD', 'Jenkins'],
    candidate_experience_years: 5,
    candidate_hourly_rate: 100,
  },
  {
    first_name: 'James',
    last_name: 'Wilson',
    email: 'james.wilson@example.com',
    phone: '+15558901234',
    candidate_status: 'active',
    candidate_availability: '1_month',
    candidate_skills: ['Salesforce', 'Apex', 'Lightning', 'Integration', 'CRM'],
    candidate_experience_years: 6,
    candidate_hourly_rate: 95,
  },
  {
    first_name: 'Rachel',
    last_name: 'Martinez',
    email: 'rachel.martinez@example.com',
    phone: '+15559012345',
    candidate_status: 'active',
    candidate_availability: 'immediate',
    candidate_skills: ['Data Engineering', 'Spark', 'Airflow', 'SQL', 'Snowflake'],
    candidate_experience_years: 4,
    candidate_hourly_rate: 105,
  },
  {
    first_name: 'Christopher',
    last_name: 'Taylor',
    email: 'christopher.taylor@example.com',
    phone: '+15550123456',
    candidate_status: 'active',
    candidate_availability: 'immediate',
    candidate_skills: ['Angular', 'RxJS', '.NET', 'C#', 'Azure'],
    candidate_experience_years: 7,
    candidate_hourly_rate: 100,
  },
]

async function seedTestCandidates() {
  console.log('🚀 Starting test candidate seed...\n')

  // Get the first organization
  const { data: orgs, error: orgError } = await supabase
    .from('organizations')
    .select('id, name')
    .limit(1)
    .single()

  if (orgError || !orgs) {
    console.error('Failed to find organization:', orgError)
    process.exit(1)
  }

  const orgId = orgs.id
  console.log(`📦 Using organization: ${orgs.name} (${orgId})\n`)

  // Get a user to set as created_by
  const { data: user } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('org_id', orgId)
    .limit(1)
    .single()

  const createdBy = user?.id

  let created = 0
  let skipped = 0

  for (const candidate of testCandidates) {
    // Check if candidate already exists
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', candidate.email)
      .eq('org_id', orgId)
      .single()

    if (existing) {
      console.log(`⏭️  Skipped: ${candidate.first_name} ${candidate.last_name} (already exists)`)
      skipped++
      continue
    }

    // Create the candidate
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        org_id: orgId,
        first_name: candidate.first_name,
        last_name: candidate.last_name,
        full_name: `${candidate.first_name} ${candidate.last_name}`,
        email: candidate.email,
        phone: candidate.phone,
        status: 'active',
        is_active: true,
        candidate_status: candidate.candidate_status,
        candidate_availability: candidate.candidate_availability,
        candidate_skills: candidate.candidate_skills,
        candidate_experience_years: candidate.candidate_experience_years,
        candidate_hourly_rate: candidate.candidate_hourly_rate,
        created_by: createdBy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id, full_name')
      .single()

    if (error) {
      console.error(`❌ Failed to create ${candidate.first_name} ${candidate.last_name}:`, error.message)
    } else {
      console.log(`✅ Created: ${data.full_name}`)
      created++
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`   Created: ${created}`)
  console.log(`   Skipped: ${skipped}`)
  console.log(`   Total:   ${testCandidates.length}`)
  console.log('\n✨ Done!')
}

seedTestCandidates().catch(console.error)

