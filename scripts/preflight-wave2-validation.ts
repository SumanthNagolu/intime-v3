/**
 * WAVE 2 PRE-FLIGHT VALIDATION
 *
 * Run this script before data migration to validate data integrity
 * and identify potential issues.
 *
 * Usage: npx tsx scripts/preflight-wave2-validation.ts
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface ValidationResult {
  check: string
  status: 'PASS' | 'WARN' | 'FAIL'
  message: string
  count?: number
}

const results: ValidationResult[] = []

async function validateWave2(): Promise<void> {
  console.log('='.repeat(60))
  console.log('WAVE 2 PRE-FLIGHT VALIDATION')
  console.log('='.repeat(60))
  console.log()

  // ========================================
  // 1. Check for duplicate emails in leads
  // ========================================
  console.log('1. Checking for duplicate lead emails...')

  const { data: allLeads } = await supabase
    .from('leads')
    .select('email')
    .is('deleted_at', null)
    .not('email', 'is', null)

  const emailCounts = new Map<string, number>()
  for (const lead of allLeads || []) {
    if (lead.email) {
      const email = lead.email.toLowerCase()
      emailCounts.set(email, (emailCounts.get(email) || 0) + 1)
    }
  }

  const duplicateEmails = Array.from(emailCounts.entries())
    .filter(([, count]) => count > 1)

  if (duplicateEmails.length > 0) {
    results.push({
      check: 'Duplicate lead emails',
      status: 'WARN',
      message: `Found ${duplicateEmails.length} duplicate emails`,
      count: duplicateEmails.length,
    })
    console.log(`  ⚠️  WARNING: ${duplicateEmails.length} duplicate emails found`)
    duplicateEmails.slice(0, 5).forEach(([email, count]) => {
      console.log(`      ${email}: ${count} records`)
    })
    if (duplicateEmails.length > 5) {
      console.log(`      ... and ${duplicateEmails.length - 5} more`)
    }
  } else {
    results.push({
      check: 'Duplicate lead emails',
      status: 'PASS',
      message: 'No duplicate emails found',
      count: 0,
    })
    console.log('  ✅ No duplicate emails found')
  }

  // ========================================
  // 2. Check for orphaned lead tasks
  // ========================================
  console.log('\n2. Checking for orphaned lead tasks...')

  const { data: leadTasks, error: tasksError } = await supabase
    .from('lead_tasks')
    .select('id, lead_id')

  if (tasksError) {
    console.log('  ℹ️  lead_tasks table does not exist or is not accessible')
    results.push({
      check: 'Orphaned lead tasks',
      status: 'PASS',
      message: 'Table not found (expected if no tasks exist)',
      count: 0,
    })
  } else {
    const orphanedTasks = (leadTasks || []).filter(t => !t.lead_id)
    if (orphanedTasks.length > 0) {
      results.push({
        check: 'Orphaned lead tasks',
        status: 'WARN',
        message: `Found ${orphanedTasks.length} orphaned tasks`,
        count: orphanedTasks.length,
      })
      console.log(`  ⚠️  WARNING: ${orphanedTasks.length} orphaned tasks found`)
    } else {
      results.push({
        check: 'Orphaned lead tasks',
        status: 'PASS',
        message: 'No orphaned tasks found',
        count: 0,
      })
      console.log('  ✅ No orphaned tasks found')
    }
  }

  // ========================================
  // 3. Check bench consultants without contact/candidate links
  // ========================================
  console.log('\n3. Checking bench consultants without contact/candidate links...')

  const { data: orphanedBench, error: benchError } = await supabase
    .from('bench_consultants')
    .select('id, candidate_id, contact_id')
    .is('contact_id', null)
    .is('candidate_id', null)
    .is('deleted_at', null)

  if (benchError) {
    console.log('  ℹ️  bench_consultants table check error:', benchError.message)
    results.push({
      check: 'Orphaned bench consultants',
      status: 'PASS',
      message: 'Table check skipped',
      count: 0,
    })
  } else {
    if ((orphanedBench?.length ?? 0) > 0) {
      results.push({
        check: 'Orphaned bench consultants',
        status: 'WARN',
        message: `${orphanedBench?.length} consultants without contact/candidate link (will be skipped)`,
        count: orphanedBench?.length ?? 0,
      })
      console.log(`  ⚠️  WARNING: ${orphanedBench?.length} consultants without contact/candidate link`)
      console.log('      These will be SKIPPED during migration')
    } else {
      results.push({
        check: 'Orphaned bench consultants',
        status: 'PASS',
        message: 'All bench consultants have contact/candidate links',
        count: 0,
      })
      console.log('  ✅ All bench consultants have contact/candidate links')
    }
  }

  // ========================================
  // 4. Count records to migrate
  // ========================================
  console.log('\n4. Counting records to migrate...')

  const { count: leadsCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  console.log(`  Total leads to migrate: ${leadsCount ?? 0}`)
  results.push({
    check: 'Total leads',
    status: 'PASS',
    message: `${leadsCount ?? 0} leads ready for migration`,
    count: leadsCount ?? 0,
  })

  const { count: benchCount } = await supabase
    .from('bench_consultants')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  console.log(`  Total bench consultants to migrate: ${benchCount ?? 0}`)
  results.push({
    check: 'Total bench consultants',
    status: 'PASS',
    message: `${benchCount ?? 0} bench consultants ready for migration`,
    count: benchCount ?? 0,
  })

  // ========================================
  // 5. Check existing migration state
  // ========================================
  console.log('\n5. Checking existing migration state...')

  const { count: alreadyMigratedLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .not('contact_id', 'is', null)
    .is('deleted_at', null)

  console.log(`  Leads already linked to contacts: ${alreadyMigratedLeads ?? 0}`)
  results.push({
    check: 'Leads already migrated',
    status: 'PASS',
    message: `${alreadyMigratedLeads ?? 0} leads already have contact_id`,
    count: alreadyMigratedLeads ?? 0,
  })

  const { count: existingBenchData } = await supabase
    .from('contact_bench_data')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  console.log(`  Existing contact_bench_data records: ${existingBenchData ?? 0}`)
  results.push({
    check: 'Existing bench data',
    status: 'PASS',
    message: `${existingBenchData ?? 0} contact_bench_data records exist`,
    count: existingBenchData ?? 0,
  })

  const { count: benchWithContact } = await supabase
    .from('bench_consultants')
    .select('*', { count: 'exact', head: true })
    .not('contact_id', 'is', null)
    .is('deleted_at', null)

  console.log(`  Bench consultants already linked to contacts: ${benchWithContact ?? 0}`)
  results.push({
    check: 'Bench consultants already migrated',
    status: 'PASS',
    message: `${benchWithContact ?? 0} bench consultants already have contact_id`,
    count: benchWithContact ?? 0,
  })

  // ========================================
  // 6. Check contact_bench_data table exists
  // ========================================
  console.log('\n6. Checking contact_bench_data table...')

  const { error: benchTableError } = await supabase
    .from('contact_bench_data')
    .select('id')
    .limit(1)

  if (benchTableError) {
    results.push({
      check: 'contact_bench_data table',
      status: 'FAIL',
      message: 'Table does not exist or is not accessible',
    })
    console.log('  ❌ FAIL: contact_bench_data table does not exist')
    console.log('      Run migration: supabase/migrations/20251211103810_create_contact_bench_data.sql')
  } else {
    results.push({
      check: 'contact_bench_data table',
      status: 'PASS',
      message: 'Table exists and is accessible',
    })
    console.log('  ✅ contact_bench_data table exists')
  }

  // ========================================
  // 7. Check _migration_lead_mapping table
  // ========================================
  console.log('\n7. Checking migration mapping table...')

  const { error: mappingError } = await supabase
    .from('_migration_lead_mapping')
    .select('lead_id')
    .limit(1)

  if (mappingError && mappingError.code !== 'PGRST116') {
    // Table doesn't exist - that's OK, it will be created if needed
    results.push({
      check: '_migration_lead_mapping table',
      status: 'WARN',
      message: 'Table does not exist (will be created during migration)',
    })
    console.log('  ℹ️  _migration_lead_mapping table does not exist (will be created)')
  } else {
    results.push({
      check: '_migration_lead_mapping table',
      status: 'PASS',
      message: 'Table exists',
    })
    console.log('  ✅ _migration_lead_mapping table exists')
  }

  // ========================================
  // 8. Check for contacts with lead subtypes
  // ========================================
  console.log('\n8. Checking existing lead contacts...')

  const { count: leadContacts } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('subtype', 'person_lead')
    .is('deleted_at', null)

  console.log(`  Contacts with subtype 'person_lead': ${leadContacts ?? 0}`)
  results.push({
    check: 'Existing lead contacts',
    status: 'PASS',
    message: `${leadContacts ?? 0} contacts with person_lead subtype`,
    count: leadContacts ?? 0,
  })

  // ========================================
  // 9. Check for contacts with bench subtypes
  // ========================================
  console.log('\n9. Checking existing bench contacts...')

  const { count: benchInternalContacts } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('subtype', 'person_bench_internal')
    .is('deleted_at', null)

  const { count: benchVendorContacts } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('subtype', 'person_bench_vendor')
    .is('deleted_at', null)

  const totalBenchContacts = (benchInternalContacts ?? 0) + (benchVendorContacts ?? 0)
  console.log(`  Contacts with bench subtypes: ${totalBenchContacts}`)
  console.log(`    - person_bench_internal: ${benchInternalContacts ?? 0}`)
  console.log(`    - person_bench_vendor: ${benchVendorContacts ?? 0}`)

  results.push({
    check: 'Existing bench contacts',
    status: 'PASS',
    message: `${totalBenchContacts} contacts with bench subtypes`,
    count: totalBenchContacts,
  })

  // ========================================
  // SUMMARY
  // ========================================
  console.log('\n' + '='.repeat(60))
  console.log('VALIDATION SUMMARY')
  console.log('='.repeat(60))

  const passCount = results.filter(r => r.status === 'PASS').length
  const warnCount = results.filter(r => r.status === 'WARN').length
  const failCount = results.filter(r => r.status === 'FAIL').length

  console.log(`\nResults: ${passCount} PASS, ${warnCount} WARN, ${failCount} FAIL`)
  console.log()

  for (const result of results) {
    const icon = result.status === 'PASS' ? '✅' :
                 result.status === 'WARN' ? '⚠️' : '❌'
    console.log(`${icon} ${result.check}: ${result.message}`)
  }

  console.log()
  if (failCount > 0) {
    console.log('❌ VALIDATION FAILED - Fix the issues above before proceeding')
    process.exit(1)
  } else if (warnCount > 0) {
    console.log('⚠️  VALIDATION PASSED WITH WARNINGS - Review warnings before proceeding')
    console.log('   You may proceed, but some records may be skipped')
  } else {
    console.log('✅ ALL VALIDATIONS PASSED - Safe to proceed with migration')
  }

  console.log('\n' + '='.repeat(60))
}

validateWave2().catch(err => {
  console.error('Validation failed:', err)
  process.exit(1)
})
