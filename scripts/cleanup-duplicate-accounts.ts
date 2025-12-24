#!/usr/bin/env tsx
/**
 * Cleanup duplicate accounts by name + org_id
 * 
 * For each duplicate group:
 * - Keeps the oldest account (earliest created_at)
 * - Merges related data (addresses, contacts, activities) to the kept account
 * - Soft deletes duplicate accounts (sets deleted_at timestamp)
 * 
 * Usage: pnpm tsx scripts/cleanup-duplicate-accounts.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  console.error('Make sure .env.local file exists with these variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface DuplicateGroup {
  name: string
  org_id: string
  accounts: Array<{
    id: string
    name: string
    created_at: string
    org_id: string
  }>
}

async function findDuplicates() {
  console.log('='.repeat(60))
  console.log('Finding Duplicate Accounts')
  console.log('='.repeat(60))

  // Get all active companies grouped by name and org_id
  const { data: companies, error } = await supabase
    .from('companies')
    .select('id, name, org_id, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching companies:', error)
    process.exit(1)
  }

  if (!companies || companies.length === 0) {
    console.log('No companies found.')
    return []
  }

  // Group by name + org_id
  const groups = new Map<string, DuplicateGroup>()
  
  for (const company of companies) {
    const key = `${company.org_id}:${company.name.trim().toLowerCase()}`
    
    if (!groups.has(key)) {
      groups.set(key, {
        name: company.name,
        org_id: company.org_id,
        accounts: []
      })
    }
    
    groups.get(key)!.accounts.push({
      id: company.id,
      name: company.name,
      created_at: company.created_at,
      org_id: company.org_id
    })
  }

  // Filter to only groups with duplicates
  const duplicates: DuplicateGroup[] = []
  for (const group of groups.values()) {
    if (group.accounts.length > 1) {
      duplicates.push(group)
    }
  }

  console.log(`\nFound ${duplicates.length} duplicate groups`)
  duplicates.forEach((group, idx) => {
    console.log(`\n${idx + 1}. "${group.name}" (org: ${group.org_id})`)
    group.accounts.forEach((acc, i) => {
      console.log(`   ${i + 1}. ID: ${acc.id}, Created: ${new Date(acc.created_at).toLocaleString()}`)
    })
  })

  return duplicates
}

async function mergeDuplicates(duplicates: DuplicateGroup[]) {
  console.log('\n' + '='.repeat(60))
  console.log('Merging Duplicates')
  console.log('='.repeat(60))

  let totalMerged = 0
  let totalDeleted = 0

  for (const group of duplicates) {
    // Sort by created_at to get oldest first
    const sorted = [...group.accounts].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    
    const keepAccount = sorted[0]
    const deleteAccounts = sorted.slice(1)

    console.log(`\nProcessing "${group.name}":`)
    console.log(`  Keeping: ${keepAccount.id} (created ${new Date(keepAccount.created_at).toLocaleString()})`)
    console.log(`  Deleting: ${deleteAccounts.length} duplicate(s)`)

    // Merge addresses
    for (const dupAccount of deleteAccounts) {
      const { data: addresses } = await supabase
        .from('addresses')
        .select('*')
        .eq('entity_type', 'account')
        .eq('entity_id', dupAccount.id)

      if (addresses && addresses.length > 0) {
        // Update addresses to point to kept account
        for (const addr of addresses) {
          // Check if same address type already exists for kept account
          const { data: existing } = await supabase
            .from('addresses')
            .select('id')
            .eq('entity_type', 'account')
            .eq('entity_id', keepAccount.id)
            .eq('address_type', addr.address_type)
            .maybeSingle()

          if (!existing) {
            // Move address to kept account
            await supabase
              .from('addresses')
              .update({ entity_id: keepAccount.id })
              .eq('id', addr.id)
          } else {
            // Delete duplicate address
            await supabase
              .from('addresses')
              .delete()
              .eq('id', addr.id)
          }
        }
        console.log(`    Merged ${addresses.length} address(es)`)
      }
    }

    // Merge contacts
    for (const dupAccount of deleteAccounts) {
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id')
        .eq('company_id', dupAccount.id)

      if (contacts && contacts.length > 0) {
        await supabase
          .from('contacts')
          .update({ company_id: keepAccount.id })
          .eq('company_id', dupAccount.id)
        console.log(`    Merged ${contacts.length} contact(s)`)
      }
    }

    // Merge activities
    for (const dupAccount of deleteAccounts) {
      const { data: activities } = await supabase
        .from('activities')
        .select('id')
        .eq('entity_type', 'account')
        .eq('entity_id', dupAccount.id)

      if (activities && activities.length > 0) {
        await supabase
          .from('activities')
          .update({ entity_id: keepAccount.id })
          .eq('entity_type', 'account')
          .eq('entity_id', dupAccount.id)
        console.log(`    Merged ${activities.length} activit(ies)`)
      }
    }

    // Merge company_client_details
    for (const dupAccount of deleteAccounts) {
      const { data: details } = await supabase
        .from('company_client_details')
        .select('id')
        .eq('company_id', dupAccount.id)
        .maybeSingle()

      if (details) {
        // Check if kept account already has details
        const { data: keptDetails } = await supabase
          .from('company_client_details')
          .select('id')
          .eq('company_id', keepAccount.id)
          .maybeSingle()

        if (!keptDetails) {
          // Move details to kept account
          await supabase
            .from('company_client_details')
            .update({ company_id: keepAccount.id })
            .eq('company_id', dupAccount.id)
        } else {
          // Delete duplicate details
          await supabase
            .from('company_client_details')
            .delete()
            .eq('company_id', dupAccount.id)
        }
        console.log(`    Merged company_client_details`)
      }
    }

    // Soft delete duplicate accounts
    const deleteIds = deleteAccounts.map(a => a.id)
    const { error: deleteError } = await supabase
      .from('companies')
      .update({ deleted_at: new Date().toISOString() })
      .in('id', deleteIds)

    if (deleteError) {
      console.error(`    Error deleting duplicates:`, deleteError)
    } else {
      totalDeleted += deleteAccounts.length
      totalMerged++
      console.log(`    ✓ Soft deleted ${deleteAccounts.length} duplicate account(s)`)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('Cleanup Summary')
  console.log('='.repeat(60))
  console.log(`Groups processed: ${totalMerged}`)
  console.log(`Accounts deleted: ${totalDeleted}`)
}

async function main() {
  try {
    const duplicates = await findDuplicates()
    
    if (duplicates.length === 0) {
      console.log('\nNo duplicates found. Database is clean!')
      return
    }

    console.log(`\nFound ${duplicates.length} duplicate group(s) affecting ${duplicates.reduce((sum, g) => sum + g.accounts.length - 1, 0)} duplicate account(s)`)
    
    // Ask for confirmation (in a real script, you might want to use readline)
    console.log('\n⚠️  This will merge and soft-delete duplicate accounts.')
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to proceed...')
    
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    await mergeDuplicates(duplicates)
    
    console.log('\n✓ Cleanup completed successfully!')
  } catch (error) {
    console.error('Error during cleanup:', error)
    process.exit(1)
  }
}

main()

