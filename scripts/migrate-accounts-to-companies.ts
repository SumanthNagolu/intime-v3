/**
 * Phase 4: Migrate Accounts to Companies
 *
 * This script migrates all accounts data to the unified companies table
 * with proper category assignment:
 * - accounts with status='prospect' → category='prospect'
 * - all other accounts → category='client'
 *
 * Also creates company_client_details extension records for each migrated company.
 *
 * Usage: npx tsx scripts/migrate-accounts-to-companies.ts
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

// Type definitions for accounts table
interface Account {
  id: string
  org_id: string
  name: string
  industry: string | null
  company_type: string | null
  status: string
  tier: string | null
  account_manager_id: string | null
  responsiveness: string | null
  preferred_quality: string | null
  description: string | null
  contract_start_date: string | null
  contract_end_date: string | null
  payment_terms_days: number | null
  markup_percentage: number | null
  annual_revenue_target: number | null
  website: string | null
  headquarters_location: string | null
  phone: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
  deleted_at: string | null
  legal_name: string | null
  founded_year: number | null
  employee_count: number | null
  annual_revenue: number | null
  health_score: number | null
  primary_contact_id: string | null
  onboarding_status: string | null
  onboarding_completed_at: string | null
  onboarding_completed_by: string | null
  nps_score: number | null
  last_contact_date: string | null
  next_contact_date: string | null
  relationship_health: string | null
  billing_entity_name: string | null
  billing_email: string | null
  billing_phone: string | null
  billing_address: string | null
  billing_city: string | null
  billing_state: string | null
  billing_postal_code: string | null
  billing_country: string | null
  billing_currency: string | null
  billing_frequency: string | null
  po_required: boolean | null
  current_po_number: string | null
  preferred_contact_method: string | null
  meeting_cadence: string | null
  communication_channel: string | null
  tax_id: string | null
  funding_stage: string | null
  company_size: string | null
  linkedin_url: string | null
  owner_id: string | null
}

// Helper functions
function mapCompanySize(size: string | null): 'enterprise' | 'mid_market' | 'smb' | 'startup' | null {
  if (!size) return null
  const mapping: Record<string, 'enterprise' | 'mid_market' | 'smb' | 'startup'> = {
    '1-50': 'startup',
    '51-200': 'smb',
    '201-500': 'smb',
    '501-1000': 'mid_market',
    '1001-5000': 'mid_market',
    '5000+': 'enterprise',
    'enterprise': 'enterprise',
    'mid_market': 'mid_market',
    'smb': 'smb',
    'startup': 'startup',
  }
  return mapping[size] || null
}

function mapTier(tier: string | null): 'strategic' | 'preferred' | 'standard' | 'transactional' {
  if (!tier) return 'standard'
  const mapping: Record<string, 'strategic' | 'preferred' | 'standard' | 'transactional'> = {
    strategic: 'strategic',
    preferred: 'preferred',
    standard: 'standard',
    new: 'transactional',
    transactional: 'transactional',
  }
  return mapping[tier] || 'standard'
}

function mapStatus(status: string | null): 'active' | 'inactive' | 'on_hold' | 'churned' | 'do_not_use' | 'pending_approval' {
  if (!status) return 'active'
  const mapping: Record<string, 'active' | 'inactive' | 'on_hold' | 'churned' | 'do_not_use' | 'pending_approval'> = {
    active: 'active',
    inactive: 'inactive',
    prospect: 'active', // Prospects are active status, just different category
    on_hold: 'on_hold',
    churned: 'churned',
    do_not_use: 'do_not_use',
  }
  return mapping[status] || 'active'
}

function mapRelationshipType(companyType: string | null): 'direct_client' | 'msp_client' | 'prime_vendor' | 'sub_vendor' | 'implementation_partner' | 'referral_partner' | 'competitor' {
  if (companyType === 'msp_client') return 'msp_client'
  return 'direct_client'
}

function extractCity(location: string | null): string | null {
  if (!location) return null
  const parts = location.split(',')
  return parts[0]?.trim() || null
}

function extractState(location: string | null): string | null {
  if (!location) return null
  const parts = location.split(',')
  if (parts.length >= 2) {
    return parts[1]?.trim() || null
  }
  return null
}

async function migrateAccountsToCompanies() {
  console.log('='.repeat(60))
  console.log('Starting accounts → companies migration...')
  console.log('='.repeat(60))

  // Step 1: Get all accounts (including soft-deleted for complete migration)
  const { data: accounts, error: fetchError } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: true })

  if (fetchError) {
    console.error('Error fetching accounts:', fetchError)
    throw fetchError
  }

  console.log(`Found ${accounts?.length || 0} total accounts`)

  if (!accounts || accounts.length === 0) {
    console.log('No accounts to migrate')
    return { migrated: 0, clientDetails: 0 }
  }

  // Step 2: Check for existing migrations (idempotency)
  const { data: existingMigrations } = await supabase
    .from('companies')
    .select('legacy_account_id')
    .not('legacy_account_id', 'is', null)

  const alreadyMigrated = new Set(existingMigrations?.map(c => c.legacy_account_id) || [])
  const accountsToMigrate = accounts.filter(a => !alreadyMigrated.has(a.id))

  console.log(`Already migrated: ${alreadyMigrated.size}`)
  console.log(`Accounts to migrate: ${accountsToMigrate.length}`)

  if (accountsToMigrate.length === 0) {
    console.log('All accounts already migrated')
    return { migrated: 0, clientDetails: 0, skipped: alreadyMigrated.size }
  }

  // Step 3: Transform and insert companies
  let migratedCount = 0
  let clientDetailsCount = 0
  const errors: { accountId: string; error: string }[] = []

  for (const account of accountsToMigrate) {
    try {
      // Determine category based on status
      const category: 'client' | 'prospect' = account.status === 'prospect' ? 'prospect' : 'client'

      // Build company record
      const companyData = {
        org_id: account.org_id,
        company_number: `CO-${account.id.substring(0, 8).toUpperCase()}`,

        // Classification
        category,
        relationship_type: mapRelationshipType(account.company_type),
        segment: mapCompanySize(account.company_size),
        tier: mapTier(account.tier),
        status: mapStatus(account.status),

        // Basic Info
        name: account.name,
        legal_name: account.legal_name,
        industry: account.industry,

        // Firmographics
        employee_count: account.employee_count,
        employee_range: account.company_size,
        annual_revenue: account.annual_revenue,
        founded_year: account.founded_year,

        // Contact Info
        website: account.website,
        phone: account.phone,
        linkedin_url: account.linkedin_url,

        // Location
        headquarters_city: extractCity(account.headquarters_location),
        headquarters_state: extractState(account.headquarters_location),

        // Ownership
        owner_id: account.owner_id,
        account_manager_id: account.account_manager_id,
        primary_contact_id: account.primary_contact_id,

        // Financial
        default_payment_terms: account.payment_terms_days ? `Net ${account.payment_terms_days}` : 'Net 30',
        default_markup_percentage: account.markup_percentage,

        // Health
        health_score: account.health_score,
        health_status: account.relationship_health || 'healthy',
        nps_score: account.nps_score,

        // Activity Tracking
        last_contacted_date: account.last_contact_date,
        next_scheduled_contact: account.next_contact_date ? account.next_contact_date.split('T')[0] : null,

        // Onboarding
        onboarding_status: account.onboarding_status,
        onboarding_completed_at: account.onboarding_completed_at,
        onboarding_completed_by: account.onboarding_completed_by,

        // Communication
        preferred_contact_method: account.preferred_contact_method,
        meeting_cadence: account.meeting_cadence,

        // Flags
        requires_po: account.po_required || false,

        // Legacy Reference
        legacy_account_id: account.id,

        // Audit
        created_at: account.created_at,
        updated_at: account.updated_at,
        created_by: account.created_by,
        updated_by: account.updated_by,
        deleted_at: account.deleted_at,
      }

      // Insert company
      const { data: newCompany, error: insertError } = await supabase
        .from('companies')
        .insert(companyData)
        .select('id, org_id')
        .single()

      if (insertError) {
        errors.push({ accountId: account.id, error: `Insert failed: ${insertError.message}` })
        continue
      }

      migratedCount++

      // Step 4: Create client_details record
      const clientDetailsData = {
        company_id: newCompany.id,
        org_id: newCompany.org_id,

        // Billing
        billing_entity_name: account.billing_entity_name,
        billing_email: account.billing_email,
        billing_phone: account.billing_phone,
        po_required: account.po_required || false,
        current_po_number: account.current_po_number,

        // Billing Address
        billing_address_line_1: account.billing_address,
        billing_city: account.billing_city,
        billing_state: account.billing_state,
        billing_postal_code: account.billing_postal_code,
        billing_country: account.billing_country || 'USA',

        // Quality Preferences (from accounts)
        responsiveness_rating: account.responsiveness,
        feedback_quality_rating: account.preferred_quality,

        // Archive additional billing fields
        legacy_billing_data: {
          billing_frequency: account.billing_frequency,
          billing_currency: account.billing_currency,
          annual_revenue_target: account.annual_revenue_target,
          contract_start_date: account.contract_start_date,
          contract_end_date: account.contract_end_date,
          description: account.description,
          tax_id: account.tax_id,
          funding_stage: account.funding_stage,
          communication_channel: account.communication_channel,
        },
      }

      const { error: clientDetailsError } = await supabase
        .from('company_client_details')
        .insert(clientDetailsData)

      if (clientDetailsError) {
        console.warn(`Warning: Failed to create client_details for company ${newCompany.id}: ${clientDetailsError.message}`)
      } else {
        clientDetailsCount++
      }

      // Progress logging
      if (migratedCount % 50 === 0) {
        console.log(`Progress: ${migratedCount}/${accountsToMigrate.length} accounts migrated`)
      }
    } catch (err) {
      errors.push({ accountId: account.id, error: err instanceof Error ? err.message : String(err) })
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(60))
  console.log('Migration Complete!')
  console.log('='.repeat(60))
  console.log(`Total accounts found: ${accounts.length}`)
  console.log(`Already migrated (skipped): ${alreadyMigrated.size}`)
  console.log(`Successfully migrated: ${migratedCount}`)
  console.log(`Client details created: ${clientDetailsCount}`)
  console.log(`Errors: ${errors.length}`)

  if (errors.length > 0) {
    console.log('\nErrors:')
    errors.forEach(e => console.log(`  - Account ${e.accountId}: ${e.error}`))
  }

  return { migrated: migratedCount, clientDetails: clientDetailsCount, errors: errors.length }
}

async function verifyMigration() {
  console.log('\n' + '='.repeat(60))
  console.log('Verifying Migration...')
  console.log('='.repeat(60))

  // Count accounts
  const { count: accountCount } = await supabase
    .from('accounts')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  // Count migrated companies
  const { count: companyCount } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .not('legacy_account_id', 'is', null)
    .is('deleted_at', null)

  // Count client details
  const { count: clientDetailsCount } = await supabase
    .from('company_client_details')
    .select('*', { count: 'exact', head: true })

  // Category breakdown
  const { data: categoryBreakdown } = await supabase
    .from('companies')
    .select('category')
    .not('legacy_account_id', 'is', null)
    .is('deleted_at', null)

  const categories = categoryBreakdown?.reduce(
    (acc, row) => {
      acc[row.category] = (acc[row.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  console.log(`Active accounts: ${accountCount}`)
  console.log(`Migrated companies: ${companyCount}`)
  console.log(`Client details records: ${clientDetailsCount}`)
  console.log(`Category breakdown:`, categories)

  // Verify counts match
  const match = accountCount === companyCount
  console.log(`\nVerification: ${match ? 'PASSED' : 'FAILED'}`)

  if (!match) {
    console.log(`  Expected: ${accountCount} companies`)
    console.log(`  Actual: ${companyCount} companies`)
  }

  return { accountCount, companyCount, clientDetailsCount, categories, match }
}

// Main execution
async function main() {
  try {
    const result = await migrateAccountsToCompanies()
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
