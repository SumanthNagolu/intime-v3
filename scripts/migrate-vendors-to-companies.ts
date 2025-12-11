/**
 * Phase 5: Migrate Vendors to Companies
 *
 * This script migrates all vendors data to the unified companies table
 * with category='vendor' and creates company_vendor_details extension records.
 *
 * Key behaviors:
 * - If a company with the same name already exists (dual relationship client+vendor),
 *   only vendor_details is added and legacy_vendor_id is updated
 * - Vendor types map to relationship_type on companies table
 * - Vendor tiers map to company tier enum
 * - vendor_terms data is archived in legacy_terms_data JSONB
 *
 * Usage: npx tsx scripts/migrate-vendors-to-companies.ts
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

// Type definitions for vendors table
interface Vendor {
  id: string
  org_id: string
  name: string
  type: string // vendor_type enum
  status: string
  tier: string | null // vendor_tier enum
  website: string | null
  industry_focus: string[] | null
  geographic_focus: string[] | null
  notes: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  deleted_at: string | null
  vendor_terms?: VendorTerms[]
}

interface VendorTerms {
  id: string
  vendor_id: string
  payment_terms_days: number | null
  markup_min_percent: number | null
  markup_max_percent: number | null
  preferred_rate_range_min: number | null
  preferred_rate_range_max: number | null
  contract_type: string | null
  contract_expiry: string | null
  msa_on_file: boolean | null
  notes: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

// Helper functions for mapping enums
function mapVendorTypeToRelationshipType(
  type: string | null
): 'direct_client' | 'msp_client' | 'prime_vendor' | 'sub_vendor' | 'implementation_partner' | 'referral_partner' | 'competitor' {
  if (!type) return 'prime_vendor'
  const mapping: Record<
    string,
    'direct_client' | 'msp_client' | 'prime_vendor' | 'sub_vendor' | 'implementation_partner' | 'referral_partner' | 'competitor'
  > = {
    direct_client: 'direct_client',
    prime_vendor: 'prime_vendor',
    sub_vendor: 'sub_vendor',
    msp: 'msp_client',
    vms: 'direct_client', // VMS providers treated as direct
  }
  return mapping[type] || 'prime_vendor'
}

function mapVendorTypeToCompanyVendorType(
  type: string | null
): 'direct_client' | 'prime_vendor' | 'sub_vendor' | 'msp' | 'vms_provider' | 'talent_supplier' | 'referral_source' {
  if (!type) return 'prime_vendor'
  const mapping: Record<
    string,
    'direct_client' | 'prime_vendor' | 'sub_vendor' | 'msp' | 'vms_provider' | 'talent_supplier' | 'referral_source'
  > = {
    direct_client: 'direct_client',
    prime_vendor: 'prime_vendor',
    sub_vendor: 'sub_vendor',
    msp: 'msp',
    vms: 'vms_provider',
  }
  return mapping[type] || 'prime_vendor'
}

function mapVendorTierToCompanyTier(tier: string | null): 'strategic' | 'preferred' | 'standard' | 'transactional' {
  if (!tier) return 'standard'
  const mapping: Record<string, 'strategic' | 'preferred' | 'standard' | 'transactional'> = {
    preferred: 'preferred',
    standard: 'standard',
    new: 'transactional',
  }
  return mapping[tier] || 'standard'
}

function mapVendorStatus(
  status: string | null
): 'active' | 'inactive' | 'on_hold' | 'churned' | 'do_not_use' | 'pending_approval' {
  if (!status) return 'active'
  const mapping: Record<string, 'active' | 'inactive' | 'on_hold' | 'churned' | 'do_not_use' | 'pending_approval'> = {
    active: 'active',
    inactive: 'inactive',
    on_hold: 'on_hold',
    blacklisted: 'do_not_use',
    suspended: 'on_hold',
  }
  return mapping[status] || 'active'
}

async function migrateVendorsToCompanies() {
  console.log('='.repeat(60))
  console.log('Starting vendors → companies migration...')
  console.log('='.repeat(60))

  // Step 1: Get all vendors with their terms
  const { data: vendors, error: fetchError } = await supabase
    .from('vendors')
    .select(
      `
      *,
      vendor_terms (*)
    `
    )
    .order('created_at', { ascending: true })

  if (fetchError) {
    console.error('Error fetching vendors:', fetchError)
    throw fetchError
  }

  console.log(`Found ${vendors?.length || 0} total vendors`)

  if (!vendors || vendors.length === 0) {
    console.log('No vendors to migrate')
    return { migrated: 0, vendorDetails: 0, dualRelationships: 0 }
  }

  // Step 2: Check for existing migrations (idempotency)
  const { data: existingMigrations } = await supabase
    .from('companies')
    .select('legacy_vendor_id')
    .not('legacy_vendor_id', 'is', null)

  const alreadyMigrated = new Set(existingMigrations?.map(c => c.legacy_vendor_id) || [])
  const vendorsToMigrate = vendors.filter(v => !alreadyMigrated.has(v.id))

  console.log(`Already migrated: ${alreadyMigrated.size}`)
  console.log(`Vendors to migrate: ${vendorsToMigrate.length}`)

  if (vendorsToMigrate.length === 0) {
    console.log('All vendors already migrated')
    return { migrated: 0, vendorDetails: 0, dualRelationships: 0, skipped: alreadyMigrated.size }
  }

  // Step 3: Transform and insert/update
  let migratedCount = 0
  let vendorDetailsCount = 0
  let dualRelationshipCount = 0
  const errors: { vendorId: string; error: string }[] = []

  for (const vendor of vendorsToMigrate) {
    try {
      let companyId: string
      let isDualRelationship = false

      // Check if a company with the same name already exists (dual relationship)
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id, org_id')
        .eq('org_id', vendor.org_id)
        .ilike('name', vendor.name) // Case-insensitive match
        .is('deleted_at', null)
        .single()

      if (existingCompany) {
        // Dual relationship - company exists as client, now adding vendor relationship
        companyId = existingCompany.id
        isDualRelationship = true
        dualRelationshipCount++

        console.log(`Dual relationship found: "${vendor.name}" exists as client, adding vendor details`)

        // Update legacy_vendor_id on existing company
        const { error: updateError } = await supabase
          .from('companies')
          .update({ legacy_vendor_id: vendor.id })
          .eq('id', companyId)

        if (updateError) {
          errors.push({ vendorId: vendor.id, error: `Update legacy_vendor_id failed: ${updateError.message}` })
          continue
        }
      } else {
        // Create new company
        const companyData = {
          org_id: vendor.org_id,
          company_number: `CO-${vendor.id.substring(0, 8).toUpperCase()}`,

          // Classification
          category: 'vendor' as const,
          relationship_type: mapVendorTypeToRelationshipType(vendor.type),
          tier: mapVendorTierToCompanyTier(vendor.tier),
          status: mapVendorStatus(vendor.status),

          // Basic Info
          name: vendor.name,
          website: vendor.website,

          // Tags from industry_focus and geographic_focus
          tags: [...(vendor.industry_focus || []), ...(vendor.geographic_focus || [])],

          // Legacy Reference
          legacy_vendor_id: vendor.id,

          // Audit
          created_at: vendor.created_at,
          updated_at: vendor.updated_at,
          created_by: vendor.created_by,
          deleted_at: vendor.deleted_at,
        }

        const { data: newCompany, error: insertError } = await supabase
          .from('companies')
          .insert(companyData)
          .select('id, org_id')
          .single()

        if (insertError) {
          errors.push({ vendorId: vendor.id, error: `Insert failed: ${insertError.message}` })
          continue
        }

        companyId = newCompany.id
        migratedCount++
      }

      // Step 4: Create or update vendor_details record
      // Build legacy_terms_data from vendor_terms
      const vendorTermsData = vendor.vendor_terms?.[0]
      const legacyTermsData = vendorTermsData
        ? {
            payment_terms_days: vendorTermsData.payment_terms_days,
            markup_min_percent: vendorTermsData.markup_min_percent,
            markup_max_percent: vendorTermsData.markup_max_percent,
            preferred_rate_range_min: vendorTermsData.preferred_rate_range_min,
            preferred_rate_range_max: vendorTermsData.preferred_rate_range_max,
            contract_type: vendorTermsData.contract_type,
            contract_expiry: vendorTermsData.contract_expiry,
            msa_on_file: vendorTermsData.msa_on_file,
            terms_notes: vendorTermsData.notes,
          }
        : {}

      const vendorDetailsData = {
        company_id: companyId,
        org_id: vendor.org_id,

        // Vendor Classification
        vendor_type: mapVendorTypeToCompanyVendorType(vendor.type),

        // Focus Areas
        industry_focus: vendor.industry_focus || [],
        geographic_focus: vendor.geographic_focus || [],

        // Financial Terms (from vendor_terms)
        payment_terms_to_us: vendorTermsData?.payment_terms_days
          ? `Net ${vendorTermsData.payment_terms_days}`
          : 'Net 60',
        min_rate_hourly: vendorTermsData?.preferred_rate_range_min,
        max_rate_hourly: vendorTermsData?.preferred_rate_range_max,

        // Legacy Terms Archive
        legacy_terms_data: {
          ...legacyTermsData,
          original_notes: vendor.notes,
        },
      }

      // Upsert vendor_details (might already exist if somehow duplicated)
      const { error: vendorDetailsError } = await supabase
        .from('company_vendor_details')
        .upsert(vendorDetailsData, { onConflict: 'company_id' })

      if (vendorDetailsError) {
        console.warn(
          `Warning: Failed to create vendor_details for company ${companyId}: ${vendorDetailsError.message}`
        )
      } else {
        vendorDetailsCount++
      }

      // Progress logging
      const totalProcessed = migratedCount + dualRelationshipCount
      if (totalProcessed % 20 === 0 || totalProcessed === vendorsToMigrate.length) {
        console.log(
          `Progress: ${totalProcessed}/${vendorsToMigrate.length} (${migratedCount} new, ${dualRelationshipCount} dual)`
        )
      }
    } catch (err) {
      errors.push({ vendorId: vendor.id, error: err instanceof Error ? err.message : String(err) })
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(60))
  console.log('Migration Complete!')
  console.log('='.repeat(60))
  console.log(`Total vendors found: ${vendors.length}`)
  console.log(`Already migrated (skipped): ${alreadyMigrated.size}`)
  console.log(`New companies created: ${migratedCount}`)
  console.log(`Dual relationships (existing client + vendor): ${dualRelationshipCount}`)
  console.log(`Vendor details created: ${vendorDetailsCount}`)
  console.log(`Errors: ${errors.length}`)

  if (errors.length > 0) {
    console.log('\nErrors:')
    errors.forEach(e => console.log(`  - Vendor ${e.vendorId}: ${e.error}`))
  }

  return { migrated: migratedCount, vendorDetails: vendorDetailsCount, dualRelationships: dualRelationshipCount, errors: errors.length }
}

async function verifyMigration() {
  console.log('\n' + '='.repeat(60))
  console.log('Verifying Migration...')
  console.log('='.repeat(60))

  // Count active vendors
  const { count: vendorCount } = await supabase
    .from('vendors')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  // Count companies with legacy_vendor_id (includes dual relationships)
  const { count: companiesWithVendorLegacy } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .not('legacy_vendor_id', 'is', null)
    .is('deleted_at', null)

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

  console.log(`Active vendors: ${vendorCount}`)
  console.log(`Companies with vendor legacy ID: ${companiesWithVendorLegacy}`)
  console.log(`Pure vendor companies: ${pureVendorCompanies}`)
  console.log(`Vendor details records: ${vendorDetailsCount}`)
  console.log(`Dual relationships: ${dualRelationships}`)
  console.log(`Vendor type breakdown:`, vendorTypes)

  // Verify that all vendors have corresponding companies or vendor_details
  const match = vendorCount === vendorDetailsCount
  console.log(`\nVerification: ${match ? 'PASSED' : 'CHECK REQUIRED'}`)

  if (!match) {
    console.log(`  Expected vendor_details: ${vendorCount}`)
    console.log(`  Actual vendor_details: ${vendorDetailsCount}`)
    console.log('  Note: This may be expected if some vendors were soft-deleted')
  }

  return {
    vendorCount,
    companiesWithVendorLegacy,
    pureVendorCompanies,
    vendorDetailsCount,
    dualRelationships,
    vendorTypes,
    match,
  }
}

// Main execution
async function main() {
  try {
    const result = await migrateVendorsToCompanies()
    const verification = await verifyMigration()

    console.log('\n' + '='.repeat(60))
    console.log('Final Results')
    console.log('='.repeat(60))
    console.log(JSON.stringify({ migration: result, verification }, null, 2))

    process.exit(verification.match ? 0 : 1)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

main()
