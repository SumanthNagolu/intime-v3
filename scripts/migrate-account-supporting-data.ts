/**
 * Phase 4 (Part 2): Migrate Account Supporting Data to Company Tables
 *
 * This script migrates all supporting data from account_* tables to company_* tables:
 * - account_team → company_team
 * - account_notes → company_notes
 * - account_preferences → company_preferences
 * - account_contracts → company_contracts
 * - account_addresses → company_addresses
 * - account_metrics → company_metrics
 * - account_contacts → company_contacts
 *
 * IMPORTANT: Run migrate-accounts-to-companies.ts FIRST to create the company records.
 *
 * Usage: npx tsx scripts/migrate-account-supporting-data.ts
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

// Build mapping of legacy account IDs to new company IDs
async function buildAccountToCompanyMap(): Promise<Map<string, { id: string; org_id: string }>> {
  const { data: companies, error } = await supabase
    .from('companies')
    .select('id, org_id, legacy_account_id')
    .not('legacy_account_id', 'is', null)

  if (error) throw error

  const map = new Map<string, { id: string; org_id: string }>()
  for (const company of companies || []) {
    if (company.legacy_account_id) {
      map.set(company.legacy_account_id, { id: company.id, org_id: company.org_id })
    }
  }

  return map
}

// Migrate account_team → company_team
async function migrateAccountTeam(accountToCompany: Map<string, { id: string; org_id: string }>) {
  console.log('\n--- Migrating account_team → company_team ---')

  const { data: teams, error: fetchError } = await supabase
    .from('account_team')
    .select('*')
    .eq('is_active', true)

  if (fetchError) {
    console.error('Error fetching account_team:', fetchError)
    return { migrated: 0, errors: 1 }
  }

  if (!teams || teams.length === 0) {
    console.log('No account team records to migrate')
    return { migrated: 0, errors: 0 }
  }

  console.log(`Found ${teams.length} team records`)

  let migrated = 0
  let errors = 0

  for (const team of teams) {
    const company = accountToCompany.get(team.account_id)
    if (!company) {
      console.warn(`No company found for account ${team.account_id}`)
      errors++
      continue
    }

    // Map role
    const roleMap: Record<string, string> = {
      owner: 'owner',
      account_manager: 'account_manager',
      recruiter: 'recruiter',
      sales: 'sales',
      coordinator: 'coordinator',
      executive_sponsor: 'executive_sponsor',
    }
    const role = roleMap[team.role] || 'viewer'

    const { error: insertError } = await supabase.from('company_team').insert({
      org_id: company.org_id,
      company_id: company.id,
      user_id: team.user_id,
      role,
      is_primary: team.is_primary || false,
      assigned_at: team.assigned_at,
      assigned_by: team.created_by,
      removed_at: team.unassigned_at,
    })

    if (insertError) {
      // Check for duplicate
      if (insertError.code === '23505') {
        // Already migrated, skip
        continue
      }
      console.warn(`Failed to migrate team record: ${insertError.message}`)
      errors++
    } else {
      migrated++
    }
  }

  console.log(`Migrated ${migrated} team records (${errors} errors)`)
  return { migrated, errors }
}

// Migrate account_notes → company_notes
async function migrateAccountNotes(accountToCompany: Map<string, { id: string; org_id: string }>) {
  console.log('\n--- Migrating account_notes → company_notes ---')

  const { data: notes, error: fetchError } = await supabase
    .from('account_notes')
    .select('*')
    .is('deleted_at', null)

  if (fetchError) {
    console.error('Error fetching account_notes:', fetchError)
    return { migrated: 0, errors: 1 }
  }

  if (!notes || notes.length === 0) {
    console.log('No account notes to migrate')
    return { migrated: 0, errors: 0 }
  }

  console.log(`Found ${notes.length} notes`)

  let migrated = 0
  let errors = 0

  for (const note of notes) {
    const company = accountToCompany.get(note.account_id)
    if (!company) {
      console.warn(`No company found for account ${note.account_id}`)
      errors++
      continue
    }

    // Map note type
    const noteTypeMap: Record<string, string> = {
      general: 'general',
      meeting: 'meeting',
      call: 'call',
      strategy: 'strategy',
      warning: 'warning',
      opportunity: 'opportunity',
    }
    const noteType = noteTypeMap[note.note_type] || 'general'

    const { error: insertError } = await supabase.from('company_notes').insert({
      org_id: company.org_id,
      company_id: company.id,
      note_type: noteType,
      title: note.title,
      content: note.content,
      is_pinned: note.is_pinned || false,
      is_private: false,
      created_at: note.created_at,
      updated_at: note.updated_at,
      created_by: note.created_by,
    })

    if (insertError) {
      console.warn(`Failed to migrate note: ${insertError.message}`)
      errors++
    } else {
      migrated++
    }
  }

  console.log(`Migrated ${migrated} notes (${errors} errors)`)
  return { migrated, errors }
}

// Migrate account_preferences → company_preferences
async function migrateAccountPreferences(accountToCompany: Map<string, { id: string; org_id: string }>) {
  console.log('\n--- Migrating account_preferences → company_preferences ---')

  const { data: preferences, error: fetchError } = await supabase.from('account_preferences').select('*')

  if (fetchError) {
    console.error('Error fetching account_preferences:', fetchError)
    return { migrated: 0, errors: 1 }
  }

  if (!preferences || preferences.length === 0) {
    console.log('No account preferences to migrate')
    return { migrated: 0, errors: 0 }
  }

  console.log(`Found ${preferences.length} preference records`)

  let migrated = 0
  let errors = 0

  for (const pref of preferences) {
    const company = accountToCompany.get(pref.account_id)
    if (!company) {
      console.warn(`No company found for account ${pref.account_id}`)
      errors++
      continue
    }

    const { error: insertError } = await supabase.from('company_preferences').insert({
      company_id: company.id,
      org_id: company.org_id,
      preferred_skills: pref.preferred_skills || [],
      excluded_skills: pref.excluded_skills || [],
      visa_types_accepted: pref.preferred_visa_types || [],
      rate_range_min: pref.rate_range_min,
      rate_range_max: pref.rate_range_max,
      rate_type: pref.preferred_rate_type || 'hourly',
      work_mode_preference: pref.work_mode_preference,
      office_locations: pref.onsite_requirement ? [pref.onsite_requirement] : [],
      typical_start_timeline_days: pref.interview_turnaround_days,
      custom_preferences: {
        interview_process_notes: pref.interview_process_notes,
        typical_interview_rounds: pref.typical_interview_rounds,
        background_check_required: pref.background_check_required,
        drug_screen_required: pref.drug_screen_required,
        security_clearance_required: pref.security_clearance_required,
        legacy_notes: pref.notes,
      },
    })

    if (insertError) {
      // Check for duplicate
      if (insertError.code === '23505') {
        continue
      }
      console.warn(`Failed to migrate preference: ${insertError.message}`)
      errors++
    } else {
      migrated++
    }
  }

  console.log(`Migrated ${migrated} preferences (${errors} errors)`)
  return { migrated, errors }
}

// Migrate account_contracts → company_contracts
async function migrateAccountContracts(accountToCompany: Map<string, { id: string; org_id: string }>) {
  console.log('\n--- Migrating account_contracts → company_contracts ---')

  const { data: contracts, error: fetchError } = await supabase.from('account_contracts').select('*')

  if (fetchError) {
    console.error('Error fetching account_contracts:', fetchError)
    return { migrated: 0, errors: 1 }
  }

  if (!contracts || contracts.length === 0) {
    console.log('No account contracts to migrate')
    return { migrated: 0, errors: 0 }
  }

  console.log(`Found ${contracts.length} contracts`)

  let migrated = 0
  let errors = 0

  for (const contract of contracts) {
    const company = accountToCompany.get(contract.account_id)
    if (!company) {
      console.warn(`No company found for account ${contract.account_id}`)
      errors++
      continue
    }

    // Map contract type
    const typeMap: Record<string, string> = {
      msa: 'msa',
      sow: 'sow',
      nda: 'nda',
      amendment: 'amendment',
      addendum: 'addendum',
    }
    const contractType = typeMap[contract.contract_type?.toLowerCase()] || 'other'

    // Map status
    const statusMap: Record<string, string> = {
      draft: 'draft',
      in_review: 'in_review',
      pending: 'pending_signature',
      active: 'active',
      expired: 'expired',
      terminated: 'terminated',
    }
    const status = statusMap[contract.status?.toLowerCase()] || 'draft'

    const { error: insertError } = await supabase.from('company_contracts').insert({
      org_id: company.org_id,
      company_id: company.id,
      contract_type: contractType,
      name: contract.name || `${contractType.toUpperCase()} Contract`,
      status,
      effective_date: contract.start_date ? contract.start_date.split('T')[0] : null,
      expiration_date: contract.end_date ? contract.end_date.split('T')[0] : null,
      signed_date: contract.signed_date ? contract.signed_date.split('T')[0] : null,
      contract_value: contract.value,
      currency: contract.currency || 'USD',
      document_url: contract.document_url,
      terms: contract.terms || {},
      created_at: contract.created_at,
      created_by: contract.created_by,
    })

    if (insertError) {
      console.warn(`Failed to migrate contract: ${insertError.message}`)
      errors++
    } else {
      migrated++
    }
  }

  console.log(`Migrated ${migrated} contracts (${errors} errors)`)
  return { migrated, errors }
}

// Migrate account_addresses → company_addresses (via centralized addresses table)
async function migrateAccountAddresses(accountToCompany: Map<string, { id: string; org_id: string }>) {
  console.log('\n--- Migrating account_addresses → company_addresses ---')

  const { data: addresses, error: fetchError } = await supabase
    .from('account_addresses')
    .select('*')
    .eq('is_active', true)

  if (fetchError) {
    console.error('Error fetching account_addresses:', fetchError)
    return { migrated: 0, errors: 1 }
  }

  if (!addresses || addresses.length === 0) {
    console.log('No account addresses to migrate')
    return { migrated: 0, errors: 0 }
  }

  console.log(`Found ${addresses.length} addresses`)

  let migrated = 0
  let errors = 0

  for (const addr of addresses) {
    const company = accountToCompany.get(addr.account_id)
    if (!company) {
      console.warn(`No company found for account ${addr.account_id}`)
      errors++
      continue
    }

    // First, check if there's already an address in the centralized addresses table
    // If not, we'll create one, then link it
    const { data: existingAddress } = await supabase
      .from('addresses')
      .select('id')
      .eq('address_line_1', addr.street || '')
      .eq('city', addr.city || '')
      .eq('state_province', addr.state || '')
      .eq('postal_code', addr.postal_code || '')
      .single()

    let addressId: string

    if (existingAddress) {
      addressId = existingAddress.id
    } else {
      // Map address type to standard values
      const addressTypeMap: Record<string, string> = {
        office: 'work',
        headquarters: 'headquarters',
        billing: 'billing',
        shipping: 'shipping',
        mailing: 'mailing',
      }

      // Create new address in centralized table
      const { data: newAddress, error: createError } = await supabase
        .from('addresses')
        .insert({
          org_id: company.org_id,
          address_line_1: addr.street,
          address_line_2: addr.street2,
          city: addr.city,
          state_province: addr.state,
          country_code: addr.country === 'USA' ? 'US' : addr.country || 'US',
          postal_code: addr.postal_code,
          // Set entity type for the polymorphic pattern
          entity_type: 'company',
          entity_id: company.id,
          address_type: addressTypeMap[addr.address_type] || 'work',
          is_primary: addr.is_primary || false,
        })
        .select('id')
        .single()

      if (createError) {
        console.warn(`Failed to create address: ${createError.message}`)
        errors++
        continue
      }
      addressId = newAddress.id
    }

    // Create company_addresses junction record
    const { error: linkError } = await supabase.from('company_addresses').insert({
      org_id: company.org_id,
      company_id: company.id,
      address_id: addressId,
      address_type: addr.address_type || 'office',
      is_primary: addr.is_primary || false,
      label: addr.address_type === 'headquarters' ? 'Headquarters' : addr.address_type,
    })

    if (linkError) {
      // Skip duplicates
      if (linkError.code === '23505') {
        continue
      }
      console.warn(`Failed to link address: ${linkError.message}`)
      errors++
    } else {
      migrated++
    }
  }

  console.log(`Migrated ${migrated} addresses (${errors} errors)`)
  return { migrated, errors }
}

// Migrate account_metrics → company_metrics
async function migrateAccountMetrics(accountToCompany: Map<string, { id: string; org_id: string }>) {
  console.log('\n--- Migrating account_metrics → company_metrics ---')

  const { data: metrics, error: fetchError } = await supabase.from('account_metrics').select('*')

  if (fetchError) {
    console.error('Error fetching account_metrics:', fetchError)
    return { migrated: 0, errors: 1 }
  }

  if (!metrics || metrics.length === 0) {
    console.log('No account metrics to migrate')
    return { migrated: 0, errors: 0 }
  }

  console.log(`Found ${metrics.length} metrics records`)

  let migrated = 0
  let errors = 0

  for (const metric of metrics) {
    const company = accountToCompany.get(metric.account_id)
    if (!company) {
      console.warn(`No company found for account ${metric.account_id}`)
      errors++
      continue
    }

    // Map period type
    const periodMap: Record<string, string> = {
      daily: 'daily',
      weekly: 'weekly',
      monthly: 'monthly',
      quarterly: 'quarterly',
      yearly: 'yearly',
    }
    const periodType = periodMap[metric.period?.toLowerCase()] || 'monthly'

    const { error: insertError } = await supabase.from('company_metrics').insert({
      org_id: company.org_id,
      company_id: company.id,
      period_type: periodType,
      period_start: metric.period_start.split('T')[0],
      period_end: metric.period_end.split('T')[0],
      placements_started: metric.total_placements,
      placements_active_eop: metric.active_placements,
      placements_ended: metric.ended_placements,
      gross_revenue: metric.total_revenue,
      gross_margin: metric.total_margin,
      avg_time_to_fill_days: metric.avg_ttf_days ? Math.round(metric.avg_ttf_days) : null,
      submission_to_interview_rate: metric.submission_to_interview_rate,
      interview_to_offer_rate: metric.interview_to_offer_rate,
      submissions_sent: metric.total_submissions,
      submissions_accepted: metric.accepted_submissions,
    })

    if (insertError) {
      // Skip duplicates
      if (insertError.code === '23505') {
        continue
      }
      console.warn(`Failed to migrate metric: ${insertError.message}`)
      errors++
    } else {
      migrated++
    }
  }

  console.log(`Migrated ${migrated} metrics (${errors} errors)`)
  return { migrated, errors }
}

// Migrate account_contacts → company_contacts
async function migrateAccountContacts(accountToCompany: Map<string, { id: string; org_id: string }>) {
  console.log('\n--- Migrating account_contacts → company_contacts ---')

  const { data: contacts, error: fetchError } = await supabase
    .from('account_contacts')
    .select('*')
    .eq('is_active', true)
    .is('deleted_at', null)

  if (fetchError) {
    console.error('Error fetching account_contacts:', fetchError)
    return { migrated: 0, errors: 1 }
  }

  if (!contacts || contacts.length === 0) {
    console.log('No account contacts to migrate')
    return { migrated: 0, errors: 0 }
  }

  console.log(`Found ${contacts.length} contact records`)

  let migrated = 0
  let errors = 0

  for (const contact of contacts) {
    const company = accountToCompany.get(contact.account_id)
    if (!company) {
      console.warn(`No company found for account ${contact.account_id}`)
      errors++
      continue
    }

    // Map decision authority
    const authorityMap: Record<string, string> = {
      decision_maker: 'decision_maker',
      influencer: 'influencer',
      gatekeeper: 'gatekeeper',
      end_user: 'end_user',
      champion: 'champion',
    }
    const decisionAuthority = contact.decision_authority
      ? authorityMap[contact.decision_authority] || null
      : null

    const { error: insertError } = await supabase.from('company_contacts').insert({
      org_id: company.org_id,
      company_id: company.id,
      contact_id: contact.contact_id,
      role_description: contact.role,
      decision_authority: decisionAuthority,
      is_primary: contact.is_primary || false,
      is_active: true,
      started_at: contact.relationship_started_at ? contact.relationship_started_at.split('T')[0] : null,
      notes: contact.relationship_notes,
      created_at: contact.created_at,
      created_by: contact.created_by,
    })

    if (insertError) {
      // Skip duplicates
      if (insertError.code === '23505') {
        continue
      }
      console.warn(`Failed to migrate contact: ${insertError.message}`)
      errors++
    } else {
      migrated++
    }
  }

  console.log(`Migrated ${migrated} contacts (${errors} errors)`)
  return { migrated, errors }
}

// Main execution
async function main() {
  console.log('='.repeat(60))
  console.log('Migrating Account Supporting Data to Company Tables')
  console.log('='.repeat(60))

  // Build the mapping
  console.log('\nBuilding account → company mapping...')
  const accountToCompany = await buildAccountToCompanyMap()
  console.log(`Found ${accountToCompany.size} migrated accounts`)

  if (accountToCompany.size === 0) {
    console.error('\nNo migrated accounts found!')
    console.error('Please run migrate-accounts-to-companies.ts first.')
    process.exit(1)
  }

  // Run all migrations
  const results: Record<string, { migrated: number; errors: number }> = {}

  results.team = await migrateAccountTeam(accountToCompany)
  results.notes = await migrateAccountNotes(accountToCompany)
  results.preferences = await migrateAccountPreferences(accountToCompany)
  results.contracts = await migrateAccountContracts(accountToCompany)
  results.addresses = await migrateAccountAddresses(accountToCompany)
  results.metrics = await migrateAccountMetrics(accountToCompany)
  results.contacts = await migrateAccountContacts(accountToCompany)

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('Migration Complete!')
  console.log('='.repeat(60))

  let totalMigrated = 0
  let totalErrors = 0

  for (const [table, result] of Object.entries(results)) {
    console.log(`${table.padEnd(15)} - Migrated: ${result.migrated}, Errors: ${result.errors}`)
    totalMigrated += result.migrated
    totalErrors += result.errors
  }

  console.log('-'.repeat(40))
  console.log(`${'TOTAL'.padEnd(15)} - Migrated: ${totalMigrated}, Errors: ${totalErrors}`)

  process.exit(totalErrors > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
