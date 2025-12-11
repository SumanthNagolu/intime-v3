/**
 * CONTACTS-01: Enterprise Contact System - Phase 5: Data Migration
 *
 * This script performs the following migrations:
 * 1. Ensures all contacts have valid category and subtype values
 * 2. Creates company contacts from accounts that have person contacts linked
 * 3. Creates contact_roles for each existing contact based on their subtype
 * 4. Links contacts to their primary addresses (if addresses exist)
 * 5. Creates contact_relationships for person-company employment links
 *
 * Run with: pnpm tsx scripts/migrate-contacts-to-new-schema.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

// Map subtype to role_type for contact_roles
const subtypeToRoleType: Record<string, string> = {
  person_candidate: 'candidate',
  person_employee: 'employee',
  person_client_contact: 'client_contact',
  person_hiring_manager: 'hiring_manager',
  person_hr_contact: 'hr_contact',
  person_vendor_contact: 'vendor_contact',
  person_bench_internal: 'bench_internal',
  person_bench_vendor: 'bench_vendor',
  person_placed: 'placed',
  person_referral_source: 'referral_source',
  person_alumni: 'alumni',
  person_prospect: 'candidate',
  person_lead: 'candidate',
}

interface MigrationResult {
  step: string
  success: boolean
  count: number
  error?: string
}

interface Account {
  id: string
  org_id: string
  name: string
  website: string | null
  industry: string | null
  employee_count: number | null
  annual_revenue: number | null
  description: string | null
  phone: string | null
  company_type: string | null
  status: string | null
}

async function runMigration(): Promise<void> {
  console.log('═'.repeat(60))
  console.log('CONTACTS-01: Phase 5 Data Migration')
  console.log('═'.repeat(60))
  console.log()

  const results: MigrationResult[] = []

  // Step 1: Verify all contacts have valid category and subtype
  console.log('Step 1: Verifying contacts have valid category and subtype...')
  const { data: invalidContacts, error: invalidError } = await supabase
    .from('contacts')
    .select('id, category, subtype')
    .is('deleted_at', null)
    .or('category.is.null,subtype.is.null')

  if (invalidError) {
    results.push({
      step: 'Verify category/subtype',
      success: false,
      count: 0,
      error: invalidError.message,
    })
  } else if (invalidContacts && invalidContacts.length > 0) {
    console.log(`  Found ${invalidContacts.length} contacts with missing category/subtype`)

    for (const contact of invalidContacts) {
      const updates: Record<string, string> = {}
      if (!contact.category) updates.category = 'person'
      if (!contact.subtype) updates.subtype = 'person_prospect'

      const { error: updateError } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', contact.id)

      if (updateError) {
        console.error(`  Failed to update contact ${contact.id}: ${updateError.message}`)
      }
    }
    results.push({
      step: 'Verify category/subtype',
      success: true,
      count: invalidContacts.length,
    })
  } else {
    console.log('  All contacts have valid category and subtype')
    results.push({
      step: 'Verify category/subtype',
      success: true,
      count: 0,
    })
  }

  // Step 2: Create company contacts from accounts that have linked person contacts
  console.log('\nStep 2: Creating company contacts from linked accounts...')

  // Get all accounts that have contacts linked via company_id
  const { data: linkedAccounts, error: accountsError } = await supabase
    .from('accounts')
    .select('id, org_id, name, website, industry, employee_count, annual_revenue, description, phone, company_type, status')
    .is('deleted_at', null)

  if (accountsError) {
    results.push({
      step: 'Create company contacts from accounts',
      success: false,
      count: 0,
      error: accountsError.message,
    })
  } else if (linkedAccounts && linkedAccounts.length > 0) {
    // Get contacts with company_id to find which accounts need company contacts
    const { data: contactsWithCompany } = await supabase
      .from('contacts')
      .select('company_id')
      .not('company_id', 'is', null)
      .is('deleted_at', null)

    const accountIdsWithContacts = new Set(
      contactsWithCompany?.map((c) => c.company_id).filter(Boolean) || []
    )

    // Check which accounts already have corresponding company contacts
    const { data: existingCompanyContacts } = await supabase
      .from('contacts')
      .select('id, company_name_legal')
      .eq('category', 'company')
      .is('deleted_at', null)

    const existingCompanyNames = new Set(
      existingCompanyContacts?.map((c) => c.company_name_legal?.toLowerCase()) || []
    )

    // Filter accounts that need company contacts created
    const accountsNeedingContacts = linkedAccounts.filter(
      (a) =>
        accountIdsWithContacts.has(a.id) &&
        !existingCompanyNames.has(a.name?.toLowerCase())
    )

    if (accountsNeedingContacts.length > 0) {
      // Map to store account_id -> company_contact_id
      const accountToCompanyContact: Map<string, string> = new Map()

      for (const account of accountsNeedingContacts) {
        // Determine the company subtype based on account company_type
        let companySubtype = 'company_client' // default
        if (account.company_type === 'vendor') companySubtype = 'company_vendor'
        else if (account.company_type === 'prospect') companySubtype = 'company_prospect'
        else if (account.company_type === 'lead') companySubtype = 'company_lead'

        // Map account status to valid company contact_status
        // Valid values: 'active', 'inactive', 'pending', 'dormant', 'former', 'blacklisted', 'suspended'
        let contactStatus = 'active'
        if (account.status === 'prospect') contactStatus = 'pending'
        else if (account.status === 'inactive') contactStatus = 'inactive'
        else if (account.status === 'churned' || account.status === 'lost') contactStatus = 'former'
        else if (account.status === 'dormant') contactStatus = 'dormant'
        else if (account.status === 'blacklisted') contactStatus = 'blacklisted'

        const companyContact = {
          org_id: account.org_id,
          category: 'company',
          subtype: companySubtype,
          contact_status: contactStatus,
          // Use first_name for company name (display name)
          first_name: account.name,
          // Company-specific fields
          company_name_legal: account.name,
          website_url: account.website,
          company_description: account.description,
          employee_count: account.employee_count,
          annual_revenue: account.annual_revenue,
          phone: account.phone,
          // Link back to original account
          account_id: account.id,
        }

        const { data: newContact, error: insertError } = await supabase
          .from('contacts')
          .insert(companyContact)
          .select('id')
          .single()

        if (insertError) {
          console.error(`  Failed to create company contact for ${account.name}: ${insertError.message}`)
        } else if (newContact) {
          accountToCompanyContact.set(account.id, newContact.id)
        }
      }

      console.log(`  Created ${accountToCompanyContact.size} company contacts from accounts`)

      // Now update person contacts to link to company contacts
      if (accountToCompanyContact.size > 0) {
        let updatedCount = 0
        for (const [accountId, companyContactId] of accountToCompanyContact) {
          const { error: updateError } = await supabase
            .from('contacts')
            .update({ current_company_id: companyContactId })
            .eq('company_id', accountId)
            .eq('category', 'person')
            .is('deleted_at', null)

          if (!updateError) updatedCount++
        }
        console.log(`  Linked ${updatedCount} person contacts to company contacts`)
      }

      results.push({
        step: 'Create company contacts from accounts',
        success: true,
        count: accountToCompanyContact.size,
      })
    } else {
      console.log('  No accounts need company contacts created')
      results.push({
        step: 'Create company contacts from accounts',
        success: true,
        count: 0,
      })
    }
  } else {
    console.log('  No accounts found')
    results.push({
      step: 'Create company contacts from accounts',
      success: true,
      count: 0,
    })
  }

  // Step 3: Create contact_roles for existing contacts
  console.log('\nStep 3: Creating contact_roles for existing contacts...')

  const { data: allContacts, error: contactsError } = await supabase
    .from('contacts')
    .select('id, org_id, subtype, company_id')
    .is('deleted_at', null)

  if (contactsError) {
    results.push({
      step: 'Create contact_roles',
      success: false,
      count: 0,
      error: contactsError.message,
    })
  } else if (allContacts) {
    const { data: existingRoles } = await supabase
      .from('contact_roles')
      .select('contact_id')
      .is('deleted_at', null)

    const existingRoleContactIds = new Set(existingRoles?.map((r) => r.contact_id) || [])
    const contactsNeedingRoles = allContacts.filter(
      (c) => !existingRoleContactIds.has(c.id)
    )

    if (contactsNeedingRoles.length > 0) {
      const rolesToInsert = contactsNeedingRoles
        .filter((c) => c.subtype && subtypeToRoleType[c.subtype])
        .map((contact) => ({
          org_id: contact.org_id,
          contact_id: contact.id,
          role_type: subtypeToRoleType[contact.subtype!],
          role_status: 'active',
          role_started_at: new Date().toISOString(),
        }))

      if (rolesToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('contact_roles')
          .insert(rolesToInsert)

        if (insertError) {
          results.push({
            step: 'Create contact_roles',
            success: false,
            count: 0,
            error: insertError.message,
          })
        } else {
          console.log(`  Created ${rolesToInsert.length} contact_roles`)
          results.push({
            step: 'Create contact_roles',
            success: true,
            count: rolesToInsert.length,
          })
        }
      } else {
        console.log('  No contacts need roles (no valid subtypes)')
        results.push({
          step: 'Create contact_roles',
          success: true,
          count: 0,
        })
      }
    } else {
      console.log('  All contacts already have roles')
      results.push({
        step: 'Create contact_roles',
        success: true,
        count: 0,
      })
    }
  }

  // Step 4: Link contacts to primary addresses
  console.log('\nStep 4: Linking contacts to primary addresses...')

  const { data: addressesForContacts, error: addressError } = await supabase
    .from('addresses')
    .select('id, entity_id, is_primary')
    .eq('entity_type', 'contact')
    .eq('is_primary', true)

  if (addressError) {
    results.push({
      step: 'Link primary addresses',
      success: false,
      count: 0,
      error: addressError.message,
    })
  } else if (addressesForContacts && addressesForContacts.length > 0) {
    let linkedCount = 0
    for (const address of addressesForContacts) {
      const { error: updateError } = await supabase
        .from('contacts')
        .update({ primary_address_id: address.id })
        .eq('id', address.entity_id)
        .is('primary_address_id', null)

      if (!updateError) linkedCount++
    }
    console.log(`  Linked ${linkedCount} primary addresses`)
    results.push({
      step: 'Link primary addresses',
      success: true,
      count: linkedCount,
    })
  } else {
    console.log('  No addresses found for contacts')
    results.push({
      step: 'Link primary addresses',
      success: true,
      count: 0,
    })
  }

  // Step 5: Create contact_relationships for contacts with current_company_id
  console.log('\nStep 5: Creating contact_relationships for employment...')

  const { data: contactsWithCompanyId, error: companyError } = await supabase
    .from('contacts')
    .select('id, org_id, current_company_id, current_title, current_department')
    .not('current_company_id', 'is', null)
    .eq('category', 'person')
    .is('deleted_at', null)

  if (companyError) {
    results.push({
      step: 'Create employment relationships',
      success: false,
      count: 0,
      error: companyError.message,
    })
  } else if (contactsWithCompanyId && contactsWithCompanyId.length > 0) {
    // Verify target contacts exist (must be company contacts)
    const companyContactIds = [...new Set(contactsWithCompanyId.map((c) => c.current_company_id))]
    const { data: validCompanyContacts } = await supabase
      .from('contacts')
      .select('id')
      .in('id', companyContactIds)
      .eq('category', 'company')
      .is('deleted_at', null)

    const validCompanyContactIds = new Set(validCompanyContacts?.map((c) => c.id) || [])

    // Check for existing relationships
    const { data: existingRelationships } = await supabase
      .from('contact_relationships')
      .select('source_contact_id, target_contact_id')
      .eq('relationship_type', 'works_at')
      .is('deleted_at', null)

    const existingPairs = new Set(
      existingRelationships?.map(
        (r) => `${r.source_contact_id}:${r.target_contact_id}`
      ) || []
    )

    const relationshipsToInsert = contactsWithCompanyId
      .filter(
        (c) =>
          c.current_company_id &&
          validCompanyContactIds.has(c.current_company_id) &&
          !existingPairs.has(`${c.id}:${c.current_company_id}`)
      )
      .map((contact) => ({
        org_id: contact.org_id,
        source_contact_id: contact.id,
        target_contact_id: contact.current_company_id,
        relationship_type: 'works_at',
        title_at_company: contact.current_title,
        department_at_company: contact.current_department,
        is_current: true,
      }))

    if (relationshipsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('contact_relationships')
        .insert(relationshipsToInsert)

      if (insertError) {
        results.push({
          step: 'Create employment relationships',
          success: false,
          count: 0,
          error: insertError.message,
        })
      } else {
        console.log(`  Created ${relationshipsToInsert.length} employment relationships`)
        results.push({
          step: 'Create employment relationships',
          success: true,
          count: relationshipsToInsert.length,
        })
      }
    } else {
      console.log('  No new employment relationships needed')
      results.push({
        step: 'Create employment relationships',
        success: true,
        count: 0,
      })
    }
  } else {
    console.log('  No contacts have current_company_id set')
    results.push({
      step: 'Create employment relationships',
      success: true,
      count: 0,
    })
  }

  // Step 6: Populate contact_id in candidate_* tables
  console.log('\nStep 6: Populating contact_id in candidate_* tables...')

  // The candidate_* tables have both candidate_id and contact_id columns
  // We need to link them where contact_id is null but we can find a matching contact
  const candidateTables = [
    'candidate_skills',
    'candidate_work_history',
    'candidate_education',
    'candidate_certifications',
  ]

  const totalUpdated = 0
  for (const table of candidateTables) {
    // Check if any records need contact_id populated
    const { count, error: countError } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .is('contact_id', null)
      .not('candidate_id', 'is', null)

    if (countError) {
      console.log(`  Error checking ${table}: ${countError.message}`)
      continue
    }

    if (count && count > 0) {
      console.log(`  Found ${count} records in ${table} needing contact_id`)
      // Note: candidate_id in these tables doesn't directly reference contacts
      // This would require a mapping table or different approach
    }
  }

  console.log('  Candidate tables checked (no direct mapping available)')
  results.push({
    step: 'Populate candidate_* contact_id',
    success: true,
    count: totalUpdated,
  })

  // Summary
  console.log('\n' + '═'.repeat(60))
  console.log('Migration Summary')
  console.log('═'.repeat(60))

  let allSuccess = true
  for (const result of results) {
    const status = result.success ? '✓' : '✗'
    console.log(`${status} ${result.step}: ${result.count} records`)
    if (result.error) {
      console.log(`    Error: ${result.error}`)
      allSuccess = false
    }
  }

  console.log('\n' + '═'.repeat(60))
  if (allSuccess) {
    console.log('✓ Migration completed successfully!')
  } else {
    console.log('✗ Migration completed with errors')
    process.exit(1)
  }
}

// Run the migration
runMigration().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
