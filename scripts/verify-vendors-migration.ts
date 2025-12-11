/**
 * Verify vendors → companies migration
 *
 * Usage: npx tsx scripts/verify-vendors-migration.ts
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
  console.log('Vendors Migration Verification')
  console.log('='.repeat(60))

  // Count active vendors
  const { count: activeVendorCount } = await supabase
    .from('vendors')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  // Count all vendors (including deleted)
  const { count: totalVendorCount } = await supabase
    .from('vendors')
    .select('*', { count: 'exact', head: true })

  // Count companies with legacy_vendor_id (includes dual relationships)
  const { count: companiesWithVendorLegacy } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .not('legacy_vendor_id', 'is', null)
    .is('deleted_at', null)

  // Count all migrated vendor companies (including deleted)
  const { count: totalMigratedCount } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .not('legacy_vendor_id', 'is', null)

  // Count pure vendor companies (category = vendor)
  const { count: pureVendorCompanies } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .eq('category', 'vendor')
    .is('deleted_at', null)

  // Count vendor_details records
  const { count: vendorDetailsCount } = await supabase
    .from('company_vendor_details')
    .select('*', { count: 'exact', head: true })

  // Count dual relationships (has both legacy_account_id AND legacy_vendor_id)
  const { count: dualRelationships } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .not('legacy_account_id', 'is', null)
    .not('legacy_vendor_id', 'is', null)
    .is('deleted_at', null)

  // Vendor type breakdown
  const { data: typeBreakdown } = await supabase.from('company_vendor_details').select('vendor_type')

  const vendorTypes = typeBreakdown?.reduce(
    (acc, row) => {
      acc[row.vendor_type] = (acc[row.vendor_type] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Sample migrated vendors
  const { data: sample } = await supabase
    .from('companies')
    .select('id, name, category, status, tier, legacy_vendor_id')
    .not('legacy_vendor_id', 'is', null)
    .is('deleted_at', null)
    .limit(10)

  console.log('\n--- Vendor Counts ---')
  console.log(`Active vendors: ${activeVendorCount}`)
  console.log(`Total vendors (including deleted): ${totalVendorCount}`)

  console.log('\n--- Company Counts ---')
  console.log(`Active migrated companies (with vendor legacy): ${companiesWithVendorLegacy}`)
  console.log(`Total migrated companies (including deleted): ${totalMigratedCount}`)
  console.log(`Pure vendor companies: ${pureVendorCompanies}`)
  console.log(`Vendor details records: ${vendorDetailsCount}`)
  console.log(`Dual relationships (client + vendor): ${dualRelationships}`)

  console.log('\n--- Verification ---')
  // Vendor count should match vendor_details count
  const vendorDetailsMatch = activeVendorCount === vendorDetailsCount
  console.log(`Vendor details count match: ${vendorDetailsMatch ? 'PASSED ✓' : 'FAILED ✗'}`)

  // Companies with vendor legacy + dual relationships should account for all vendors
  const legacyMatch = activeVendorCount === companiesWithVendorLegacy
  console.log(`Legacy vendor ID count match: ${legacyMatch ? 'PASSED ✓' : 'FAILED ✗'}`)

  console.log('\n--- Vendor Type Distribution ---')
  console.log(vendorTypes)

  console.log('\n--- Sample Migrated Vendors ---')
  sample?.forEach((c) =>
    console.log(`  - ${c.name} (category=${c.category}, status=${c.status}, tier=${c.tier || 'standard'})`)
  )

  console.log('\n' + '='.repeat(60))
  console.log('Verification Complete!')
  console.log('='.repeat(60))

  const allPassed = vendorDetailsMatch && legacyMatch
  console.log(`\nOverall: ${allPassed ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED'}`)

  return allPassed
}

verify()
  .then((passed) => process.exit(passed ? 0 : 1))
  .catch((err) => {
    console.error('Verification failed:', err)
    process.exit(1)
  })
