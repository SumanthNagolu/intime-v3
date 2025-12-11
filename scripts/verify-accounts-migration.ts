/**
 * Verify accounts → companies migration
 *
 * Usage: npx tsx scripts/verify-accounts-migration.ts
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

async function verify() {
  console.log('='.repeat(60))
  console.log('Migration Verification')
  console.log('='.repeat(60))

  // Count active accounts
  const { count: accountCount } = await supabase
    .from('accounts')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  // Count all accounts (including deleted)
  const { count: totalAccountCount } = await supabase
    .from('accounts')
    .select('*', { count: 'exact', head: true })

  // Count companies with legacy_account_id
  const { count: migratedCompanyCount } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .not('legacy_account_id', 'is', null)
    .is('deleted_at', null)

  // Count all migrated companies (including deleted)
  const { count: totalMigratedCount } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .not('legacy_account_id', 'is', null)

  // Count company_client_details
  const { count: clientDetailsCount } = await supabase
    .from('company_client_details')
    .select('*', { count: 'exact', head: true })

  // Category breakdown
  const { data: categories } = await supabase
    .from('companies')
    .select('category')
    .not('legacy_account_id', 'is', null)

  const breakdown = categories?.reduce(
    (acc, row) => {
      acc[row.category] = (acc[row.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Sample migrated data
  const { data: sample } = await supabase
    .from('companies')
    .select('id, name, category, status, tier, legacy_account_id, health_score')
    .not('legacy_account_id', 'is', null)
    .is('deleted_at', null)
    .limit(10)

  console.log('\n--- Account Counts ---')
  console.log(`Active accounts: ${accountCount}`)
  console.log(`Total accounts (including deleted): ${totalAccountCount}`)

  console.log('\n--- Company Counts ---')
  console.log(`Active migrated companies: ${migratedCompanyCount}`)
  console.log(`Total migrated companies (including deleted): ${totalMigratedCount}`)
  console.log(`Client details records: ${clientDetailsCount}`)

  console.log('\n--- Verification ---')
  const activeMatch = accountCount === migratedCompanyCount
  const totalMatch = totalAccountCount === totalMigratedCount
  console.log(`Active count match: ${activeMatch ? 'PASSED ✓' : 'FAILED ✗'}`)
  console.log(`Total count match: ${totalMatch ? 'PASSED ✓' : 'FAILED ✗'}`)

  console.log('\n--- Category Breakdown ---')
  console.log(breakdown)

  console.log('\n--- Sample Migrated Companies ---')
  sample?.forEach((c) =>
    console.log(`  - ${c.name} (${c.category}, status=${c.status}, tier=${c.tier || 'standard'})`)
  )

  // Check supporting data
  const { count: notesCount } = await supabase
    .from('company_notes')
    .select('*', { count: 'exact', head: true })

  const { count: contractsCount } = await supabase
    .from('company_contracts')
    .select('*', { count: 'exact', head: true })

  console.log('\n--- Supporting Data ---')
  console.log(`Company notes: ${notesCount}`)
  console.log(`Company contracts: ${contractsCount}`)

  console.log('\n' + '='.repeat(60))
  console.log('Verification Complete!')
  console.log('='.repeat(60))

  return activeMatch && totalMatch
}

verify()
  .then((passed) => process.exit(passed ? 0 : 1))
  .catch((err) => {
    console.error('Verification failed:', err)
    process.exit(1)
  })
