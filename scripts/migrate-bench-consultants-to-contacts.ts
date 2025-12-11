/**
 * Migration Script: Bench Consultants to Unified Contacts
 *
 * This script migrates data from the legacy bench_consultants table
 * to the unified contacts + contact_bench_data structure.
 *
 * Prerequisites:
 * - The contact_bench_data table must be created (run migration first)
 * - Environment variables must be set
 *
 * Usage:
 *   npx tsx scripts/migrate-bench-consultants-to-contacts.ts
 *
 * Options:
 *   --dry-run    Preview changes without committing
 *   --org-id=X   Migrate specific organization only
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

interface BenchConsultant {
  id: string
  org_id: string
  candidate_id: string | null
  contact_id: string | null
  bench_start_date: string
  bench_end_date: string | null
  visa_type: string | null
  visa_expiry_date: string | null
  work_auth_status: string | null
  min_acceptable_rate: number | null
  target_rate: number | null
  currency: string
  willing_relocate: boolean
  preferred_locations: string[]
  marketing_status: string
  bench_sales_rep_id: string | null
  consultant_type: string | null
  vendor_id: string | null
  created_at: string
  created_by: string | null
  deleted_at: string | null
}

interface MigrationStats {
  total: number
  migrated: number
  skipped: number
  errors: number
  alreadyMigrated: number
}

const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const orgIdArg = args.find((a) => a.startsWith('--org-id='))
const specificOrgId = orgIdArg?.split('=')[1]

async function migrateConsultant(
  consultant: BenchConsultant,
  stats: MigrationStats
): Promise<void> {
  const { id, org_id, candidate_id, contact_id } = consultant

  // If already has contact_id, check if bench_data exists
  if (contact_id) {
    const { data: existingBenchData } = await adminClient
      .from('contact_bench_data')
      .select('id')
      .eq('contact_id', contact_id)
      .is('deleted_at', null)
      .single()

    if (existingBenchData) {
      console.log(`  [SKIP] ${id}: Already has bench data for contact ${contact_id}`)
      stats.alreadyMigrated++
      return
    }
  }

  // Find or create contact for this consultant
  let targetContactId = contact_id

  if (!targetContactId && candidate_id) {
    // Try to find contact by candidate's email
    const { data: candidate } = await adminClient
      .from('user_profiles')
      .select('email, full_name')
      .eq('id', candidate_id)
      .single()

    if (candidate?.email) {
      const { data: existingContact } = await adminClient
        .from('contacts')
        .select('id')
        .eq('email', candidate.email)
        .eq('org_id', org_id)
        .is('deleted_at', null)
        .single()

      if (existingContact) {
        targetContactId = existingContact.id
        console.log(`  [FOUND] Contact found by email: ${targetContactId}`)
      } else if (!isDryRun) {
        // Create new contact
        const nameParts = (candidate.full_name || '').split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''

        const benchType = consultant.consultant_type || 'w2_internal'
        const subtype =
          benchType === 'w2_vendor' || benchType === 'c2c'
            ? 'person_bench_vendor'
            : 'person_bench_internal'

        const { data: newContact, error: createError } = await adminClient
          .from('contacts')
          .insert({
            org_id,
            category: 'person',
            subtype,
            first_name: firstName,
            last_name: lastName,
            email: candidate.email,
            bench_type: benchType,
            bench_status: consultant.marketing_status || 'available',
            bench_start_date: consultant.bench_start_date,
            created_by: consultant.created_by,
          })
          .select('id')
          .single()

        if (createError) {
          console.error(`  [ERROR] Failed to create contact: ${createError.message}`)
          stats.errors++
          return
        }

        targetContactId = newContact.id
        console.log(`  [CREATED] New contact: ${targetContactId}`)
      }
    }
  }

  if (!targetContactId) {
    console.log(`  [SKIP] ${id}: No contact or candidate found`)
    stats.skipped++
    return
  }

  // Create contact_bench_data record
  if (!isDryRun) {
    const { error: benchDataError } = await adminClient
      .from('contact_bench_data')
      .insert({
        org_id,
        contact_id: targetContactId,
        bench_start_date: consultant.bench_start_date,
        bench_type: consultant.consultant_type,
        bench_status: mapMarketingStatusToBenchStatus(consultant.marketing_status),
        visa_type: consultant.visa_type,
        visa_expiry_date: consultant.visa_expiry_date,
        work_auth_status: consultant.work_auth_status,
        min_acceptable_rate: consultant.min_acceptable_rate,
        target_rate: consultant.target_rate,
        currency: consultant.currency,
        willing_to_relocate: consultant.willing_relocate,
        preferred_locations: consultant.preferred_locations,
        marketing_status: mapToNewMarketingStatus(consultant.marketing_status),
        bench_sales_rep_id: consultant.bench_sales_rep_id,
        vendor_id: consultant.vendor_id,
        legacy_bench_consultant_id: consultant.id,
        created_by: consultant.created_by,
      })

    if (benchDataError) {
      console.error(`  [ERROR] Failed to create bench data: ${benchDataError.message}`)
      stats.errors++
      return
    }

    // Update bench_consultants with contact_id reference
    if (!contact_id) {
      await adminClient
        .from('bench_consultants')
        .update({ contact_id: targetContactId })
        .eq('id', id)
    }

    // Update contact with bench fields
    await adminClient
      .from('contacts')
      .update({
        subtype:
          consultant.consultant_type === 'w2_vendor' || consultant.consultant_type === 'c2c'
            ? 'person_bench_vendor'
            : 'person_bench_internal',
        bench_type: consultant.consultant_type,
        bench_status: mapMarketingStatusToBenchStatus(consultant.marketing_status),
        bench_start_date: consultant.bench_start_date,
      })
      .eq('id', targetContactId)
  }

  console.log(`  [MIGRATED] ${id} -> contact ${targetContactId}`)
  stats.migrated++
}

function mapMarketingStatusToBenchStatus(status: string | null): string {
  switch (status) {
    case 'draft':
      return 'onboarding'
    case 'active':
      return 'marketing'
    case 'paused':
      return 'available'
    case 'archived':
      return 'inactive'
    default:
      return 'available'
  }
}

function mapToNewMarketingStatus(status: string | null): string {
  if (!status) return 'draft'
  if (['draft', 'active', 'paused', 'archived'].includes(status)) {
    return status
  }
  return 'draft'
}

async function runMigration() {
  console.log('='.repeat(60))
  console.log('Bench Consultants to Contacts Migration')
  console.log('='.repeat(60))
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}`)
  if (specificOrgId) {
    console.log(`Organization: ${specificOrgId}`)
  }
  console.log()

  // Get all bench consultants
  let query = adminClient
    .from('bench_consultants')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (specificOrgId) {
    query = query.eq('org_id', specificOrgId)
  }

  const { data: consultants, error } = await query

  if (error) {
    console.error('Failed to fetch bench consultants:', error.message)
    process.exit(1)
  }

  if (!consultants || consultants.length === 0) {
    console.log('No bench consultants found to migrate.')
    return
  }

  console.log(`Found ${consultants.length} bench consultants to process\n`)

  const stats: MigrationStats = {
    total: consultants.length,
    migrated: 0,
    skipped: 0,
    errors: 0,
    alreadyMigrated: 0,
  }

  for (const consultant of consultants) {
    console.log(`Processing: ${consultant.id}`)
    await migrateConsultant(consultant, stats)
  }

  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('Migration Summary')
  console.log('='.repeat(60))
  console.log(`Total processed:    ${stats.total}`)
  console.log(`Migrated:           ${stats.migrated}`)
  console.log(`Already migrated:   ${stats.alreadyMigrated}`)
  console.log(`Skipped:            ${stats.skipped}`)
  console.log(`Errors:             ${stats.errors}`)

  if (isDryRun) {
    console.log('\n[DRY RUN] No changes were made to the database.')
  }

  // Verification
  if (!isDryRun && stats.migrated > 0) {
    console.log('\nVerification:')

    const { count: benchDataCount } = await adminClient
      .from('contact_bench_data')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)

    const { count: consultantsWithContact } = await adminClient
      .from('bench_consultants')
      .select('*', { count: 'exact', head: true })
      .not('contact_id', 'is', null)
      .is('deleted_at', null)

    console.log(`  contact_bench_data records: ${benchDataCount}`)
    console.log(`  bench_consultants with contact_id: ${consultantsWithContact}`)
  }
}

runMigration().catch(console.error)
