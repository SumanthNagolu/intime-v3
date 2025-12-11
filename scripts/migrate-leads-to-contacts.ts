/**
 * LEADS TO UNIFIED CONTACTS MIGRATION
 *
 * Migrates data from the legacy `leads` table to the unified `contacts` table
 * with subtype = 'person_lead'.
 *
 * This script:
 * 1. Reads all leads from the legacy table
 * 2. Creates/updates corresponding contacts with proper subtype
 * 3. Maps all lead-specific columns to contact lead_* columns
 * 4. Records migration in _migration_lead_mapping table
 * 5. Migrates lead_tasks to the unified tasks table
 *
 * Run: npx tsx scripts/migrate-leads-to-contacts.ts
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

// Stats tracking
const stats = {
  leadsProcessed: 0,
  contactsCreated: 0,
  contactsUpdated: 0,
  tasksCreated: 0,
  errors: 0,
  skipped: 0,
}

interface Lead {
  id: string
  org_id: string
  lead_type: string
  company_name: string | null
  industry: string | null
  company_size: string | null
  first_name: string | null
  last_name: string | null
  title: string | null
  email: string | null
  phone: string | null
  linkedin_url: string | null
  status: string
  estimated_value: number | null
  source: string | null
  source_campaign_id: string | null
  owner_id: string | null
  last_contacted_at: string | null
  last_response_at: string | null
  engagement_score: number | null
  converted_to_deal_id: string | null
  converted_to_account_id: string | null
  converted_at: string | null
  lost_reason: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  deleted_at: string | null
  bant_budget: number | null
  bant_authority: number | null
  bant_need: number | null
  bant_timeline: number | null
  bant_budget_notes: string | null
  bant_authority_notes: string | null
  bant_need_notes: string | null
  bant_timeline_notes: string | null
  budget_status: string | null
  estimated_monthly_spend: number | null
  authority_level: string | null
  business_need: string | null
  urgency: string | null
  target_start_date: string | null
  positions_count: number | null
  skills_needed: string[] | null
  contract_types: string[] | null
  qualification_result: string | null
  qualification_notes: string | null
  qualified_at: string | null
  qualified_by: string | null
  campaign_id: string | null
  interest_level: string | null
  hiring_needs: string | null
  pain_points: string | null
  next_action: string | null
  next_action_date: string | null
  lead_score: number | null
  contact_id: string | null
}

async function migrateLead(lead: Lead): Promise<boolean> {
  try {
    // Check if already migrated
    const { data: existingMapping } = await supabase
      .from('_migration_lead_mapping')
      .select('contact_id')
      .eq('lead_id', lead.id)
      .single()

    if (existingMapping) {
      console.log(`  Skipping lead ${lead.id} - already migrated to contact ${existingMapping.contact_id}`)
      stats.skipped++
      return true
    }

    // Check if there's already a contact linked to this lead
    if (lead.contact_id) {
      // Update existing contact with lead data
      const { error: updateError } = await supabase
        .from('contacts')
        .update({
          subtype: 'person_lead',
          lead_status: lead.status,
          lead_score: lead.lead_score,
          lead_source: lead.source,
          lead_estimated_value: lead.estimated_value,
          lead_converted_to_deal_id: lead.converted_to_deal_id,
          lead_converted_to_account_id: lead.converted_to_account_id,
          lead_converted_at: lead.converted_at,
          lead_lost_reason: lead.lost_reason,
          lead_bant_budget: lead.bant_budget,
          lead_bant_authority: lead.bant_authority,
          lead_bant_need: lead.bant_need,
          lead_bant_timeline: lead.bant_timeline,
          lead_bant_budget_notes: lead.bant_budget_notes,
          lead_bant_authority_notes: lead.bant_authority_notes,
          lead_bant_need_notes: lead.bant_need_notes,
          lead_bant_timeline_notes: lead.bant_timeline_notes,
          lead_budget_status: lead.budget_status,
          lead_estimated_monthly_spend: lead.estimated_monthly_spend,
          lead_authority_level: lead.authority_level,
          lead_business_need: lead.business_need,
          lead_urgency: lead.urgency,
          lead_target_start_date: lead.target_start_date,
          lead_positions_count: lead.positions_count,
          lead_skills_needed: lead.skills_needed,
          lead_contract_types: lead.contract_types,
          lead_qualification_result: lead.qualification_result,
          lead_qualification_notes: lead.qualification_notes,
          lead_qualified_at: lead.qualified_at,
          lead_qualified_by: lead.qualified_by,
          lead_interest_level: lead.interest_level,
          lead_hiring_needs: lead.hiring_needs,
          lead_pain_points: lead.pain_points,
          lead_next_action: lead.next_action,
          lead_next_action_date: lead.next_action_date,
          source_campaign_id: lead.campaign_id || lead.source_campaign_id,
          engagement_score: lead.engagement_score,
          last_contacted_at: lead.last_contacted_at,
          last_response_at: lead.last_response_at,
        })
        .eq('id', lead.contact_id)

      if (updateError) {
        console.error(`  Error updating contact ${lead.contact_id}:`, updateError)
        stats.errors++
        return false
      }

      // Record migration mapping
      await supabase.from('_migration_lead_mapping').insert({
        lead_id: lead.id,
        contact_id: lead.contact_id,
      })

      stats.contactsUpdated++
      console.log(`  Updated contact ${lead.contact_id} with lead data`)
      return true
    }

    // Create new contact from lead
    const contactData = {
      org_id: lead.org_id,
      category: 'person',
      subtype: 'person_lead',
      first_name: lead.first_name || 'Unknown',
      last_name: lead.last_name || '',
      email: lead.email,
      phone: lead.phone,
      title: lead.title,
      linkedin_url: lead.linkedin_url,
      company_name: lead.company_name,
      industry: lead.industry,
      owner_id: lead.owner_id,
      status: 'active',
      created_at: lead.created_at,
      updated_at: lead.updated_at,
      created_by: lead.created_by,
      deleted_at: lead.deleted_at,
      // Lead-specific fields
      lead_status: lead.status,
      lead_score: lead.lead_score,
      lead_source: lead.source,
      lead_estimated_value: lead.estimated_value,
      lead_converted_to_deal_id: lead.converted_to_deal_id,
      lead_converted_to_account_id: lead.converted_to_account_id,
      lead_converted_at: lead.converted_at,
      lead_lost_reason: lead.lost_reason,
      lead_bant_budget: lead.bant_budget,
      lead_bant_authority: lead.bant_authority,
      lead_bant_need: lead.bant_need,
      lead_bant_timeline: lead.bant_timeline,
      lead_bant_budget_notes: lead.bant_budget_notes,
      lead_bant_authority_notes: lead.bant_authority_notes,
      lead_bant_need_notes: lead.bant_need_notes,
      lead_bant_timeline_notes: lead.bant_timeline_notes,
      lead_budget_status: lead.budget_status,
      lead_estimated_monthly_spend: lead.estimated_monthly_spend,
      lead_authority_level: lead.authority_level,
      lead_business_need: lead.business_need,
      lead_urgency: lead.urgency,
      lead_target_start_date: lead.target_start_date,
      lead_positions_count: lead.positions_count,
      lead_skills_needed: lead.skills_needed,
      lead_contract_types: lead.contract_types,
      lead_qualification_result: lead.qualification_result,
      lead_qualification_notes: lead.qualification_notes,
      lead_qualified_at: lead.qualified_at,
      lead_qualified_by: lead.qualified_by,
      lead_interest_level: lead.interest_level,
      lead_hiring_needs: lead.hiring_needs,
      lead_pain_points: lead.pain_points,
      lead_next_action: lead.next_action,
      lead_next_action_date: lead.next_action_date,
      source_campaign_id: lead.campaign_id || lead.source_campaign_id,
      engagement_score: lead.engagement_score,
      last_contacted_at: lead.last_contacted_at,
      last_response_at: lead.last_response_at,
    }

    const { data: newContact, error: insertError } = await supabase
      .from('contacts')
      .insert(contactData)
      .select('id')
      .single()

    if (insertError || !newContact) {
      console.error(`  Error creating contact for lead ${lead.id}:`, insertError)
      stats.errors++
      return false
    }

    // Record migration mapping
    await supabase.from('_migration_lead_mapping').insert({
      lead_id: lead.id,
      contact_id: newContact.id,
    })

    // Update original lead with contact_id reference
    await supabase
      .from('leads')
      .update({ contact_id: newContact.id })
      .eq('id', lead.id)

    stats.contactsCreated++
    console.log(`  Created contact ${newContact.id} from lead ${lead.id}`)
    return true
  } catch (err) {
    console.error(`  Exception processing lead ${lead.id}:`, err)
    stats.errors++
    return false
  }
}

async function migrateLeadTasks(lead: Lead, contactId: string): Promise<void> {
  // Fetch lead tasks
  const { data: tasks, error } = await supabase
    .from('lead_tasks')
    .select('*')
    .eq('lead_id', lead.id)
    .is('deleted_at', null)

  if (error || !tasks || tasks.length === 0) {
    return
  }

  for (const task of tasks) {
    // Check if task already exists in unified tasks table
    const { data: existingTask } = await supabase
      .from('tasks')
      .select('id')
      .eq('entity_type', 'contact')
      .eq('entity_id', contactId)
      .eq('title', task.title)
      .single()

    if (existingTask) {
      continue
    }

    // Create task in unified table
    const { error: taskError } = await supabase.from('tasks').insert({
      org_id: task.org_id,
      title: task.title,
      description: task.description,
      task_type: 'follow_up',
      status: task.completed ? 'completed' : 'pending',
      priority: task.priority || 'medium',
      due_date: task.due_date,
      assignee_id: task.assigned_to,
      entity_type: 'contact',
      entity_id: contactId,
      completed_at: task.completed_at,
      completed_by: task.completed_by,
      created_by: task.created_by,
      created_at: task.created_at,
    })

    if (!taskError) {
      stats.tasksCreated++
    }
  }
}

async function main() {
  console.log('='.repeat(60))
  console.log('LEADS TO CONTACTS MIGRATION')
  console.log('='.repeat(60))

  // Check if leads table exists
  const { error: leadsCheckError } = await supabase.from('leads').select('id').limit(1)
  if (leadsCheckError) {
    console.log('Leads table does not exist or is not accessible. Migration may already be complete.')
    console.log('Error:', leadsCheckError.message)
    return
  }

  // Count total leads
  const { count: totalCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })

  console.log(`\nTotal leads to process: ${totalCount}`)

  // Process in batches
  const batchSize = 50
  let offset = 0

  while (true) {
    const { data: leads, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: true })
      .range(offset, offset + batchSize - 1)

    if (fetchError) {
      console.error('Error fetching leads:', fetchError)
      break
    }

    if (!leads || leads.length === 0) {
      break
    }

    console.log(`\nProcessing batch ${Math.floor(offset / batchSize) + 1} (${leads.length} leads)...`)

    for (const lead of leads) {
      stats.leadsProcessed++
      const success = await migrateLead(lead as Lead)

      if (success && lead.contact_id) {
        // Migrate associated tasks
        const { data: mapping } = await supabase
          .from('_migration_lead_mapping')
          .select('contact_id')
          .eq('lead_id', lead.id)
          .single()

        if (mapping) {
          await migrateLeadTasks(lead as Lead, mapping.contact_id)
        }
      }
    }

    offset += batchSize
  }

  // Print final stats
  console.log('\n' + '='.repeat(60))
  console.log('MIGRATION COMPLETE')
  console.log('='.repeat(60))
  console.log(`Leads Processed: ${stats.leadsProcessed}`)
  console.log(`Contacts Created: ${stats.contactsCreated}`)
  console.log(`Contacts Updated: ${stats.contactsUpdated}`)
  console.log(`Tasks Created: ${stats.tasksCreated}`)
  console.log(`Skipped (already migrated): ${stats.skipped}`)
  console.log(`Errors: ${stats.errors}`)
}

main().catch(console.error)
