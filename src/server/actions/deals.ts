'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { getServerCaller } from '@/server/trpc/server-caller'
import type {
  FullDealData,
  DealData,
  DealAccountInfo,
  DealLeadInfo,
  DealStakeholder,
  DealStageHistoryEntry,
  DealActivity,
  DealNote,
  DealDocument,
  DealStage,
} from '@/types/deal'
import type { HistoryEntry, WorkspaceWarning } from '@/types/workspace'

// Stage probabilities for fallback
const STAGE_PROBABILITIES: Record<string, number> = {
  discovery: 20,
  qualification: 40,
  proposal: 60,
  negotiation: 70,
  verbal_commit: 90,
  closed_won: 100,
  closed_lost: 0,
}

/**
 * Fetches all deal data in ONE database round-trip.
 * Follows the ONE DB CALL pattern established by Lead workspace.
 */
export async function getFullDeal(id: string): Promise<FullDealData | null> {
  const caller = await getServerCaller()
  const adminClient = getAdminClient()

  // Verify access and get deal via tRPC (respects org_id filtering)
  let dealRecord: Record<string, unknown>
  try {
    const result = await caller.crm.deals.getById({ id })
    if (!result) return null
    dealRecord = result as Record<string, unknown>
  } catch {
    return null
  }

  // Fetch all related data in parallel
  const [
    stakeholdersResult,
    stageHistoryResult,
    activitiesResult,
    notesResult,
    documentsResult,
    historyResult,
    accountResult,
    leadResult,
  ] = await Promise.all([
    // Stakeholders (deal contacts via junction table)
    adminClient
      .from('deal_stakeholders')
      .select(`
        id, name, title, email, role, influence_level, sentiment,
        engagement_notes, is_primary, is_active,
        contact_id,
        contact:contacts!deal_stakeholders_contact_id_fkey(id, phone, email)
      `)
      .eq('deal_id', id)
      .eq('is_active', true)
      .order('is_primary', { ascending: false })
      .limit(50),

    // Stage history
    adminClient
      .from('deal_stages_history')
      .select(`
        id, stage, entered_at, exited_at,
        changed_by:user_profiles!deal_stages_history_changed_by_fkey(full_name)
      `)
      .eq('deal_id', id)
      .order('entered_at', { ascending: false })
      .limit(20),

    // Activities
    adminClient
      .from('activities')
      .select(`
        id, activity_type, subject, description, due_date, status, created_at,
        assigned_to:user_profiles!activities_assigned_to_fkey(id, full_name),
        creator:user_profiles!activities_created_by_fkey(id, full_name)
      `)
      .eq('entity_type', 'deal')
      .eq('entity_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100),

    // Notes
    adminClient
      .from('notes')
      .select(`
        id, title, content, is_pinned, created_at,
        creator:user_profiles!notes_created_by_fkey(id, full_name)
      `)
      .eq('entity_type', 'deal')
      .eq('entity_id', id)
      .is('deleted_at', null)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50),

    // Documents
    adminClient
      .from('documents')
      .select(`
        id, name, document_type, file_size, file_url, created_at,
        uploader:user_profiles!documents_uploaded_by_fkey(id, full_name)
      `)
      .eq('entity_type', 'deal')
      .eq('entity_id', id)
      .is('deleted_at', null)
      .eq('is_latest_version', true)
      .order('created_at', { ascending: false })
      .limit(50),

    // History/Audit trail
    adminClient
      .from('audit_logs')
      .select(`
        id, action, field_name, old_value, new_value, created_at,
        user:user_profiles!audit_logs_user_id_fkey(id, full_name)
      `)
      .eq('entity_type', 'deal')
      .eq('entity_id', id)
      .order('created_at', { ascending: false })
      .limit(100),

    // Account (via company_id)
    dealRecord.company_id
      ? adminClient
          .from('companies')
          .select(`
            id, name, industry, employee_count, revenue, website,
            headquarters_city, headquarters_state, category
          `)
          .eq('id', dealRecord.company_id as string)
          .is('deleted_at', null)
          .single()
      : Promise.resolve({ data: null, error: null }),

    // Source lead (if converted from lead)
    dealRecord.lead_id
      ? adminClient
          .from('contacts')
          .select(`
            id, first_name, last_name, email, lead_status, lead_source, lead_converted_at
          `)
          .eq('id', dealRecord.lead_id as string)
          .is('deleted_at', null)
          .single()
      : Promise.resolve({ data: null, error: null }),
  ])

  return {
    deal: transformDeal(dealRecord),
    account: accountResult.data ? transformAccount(accountResult.data) : null,
    lead: leadResult.data ? transformLead(leadResult.data) : null,
    stakeholders: transformStakeholders(stakeholdersResult.data || []),
    stageHistory: transformStageHistory(stageHistoryResult.data || []),
    activities: transformActivities(activitiesResult.data || []),
    notes: transformNotes(notesResult.data || []),
    documents: transformDocuments(documentsResult.data || []),
    history: transformHistory(historyResult.data || []),
    warnings: computeWarnings(dealRecord, stakeholdersResult.data || []),
  }
}

// Transform functions

function transformDeal(data: Record<string, unknown>): DealData {
  const owner = data.owner as { id?: string; full_name?: string; avatar_url?: string } | null
  const stage = (data.stage as string) || 'discovery'
  const value = (data.value as number) || 0
  const probability = (data.probability as number) ?? STAGE_PROBABILITIES[stage] ?? 50

  // Calculate days in stage
  const stageEnteredAt = data.stage_entered_at as string | null
  const daysInStage = stageEnteredAt
    ? Math.floor((Date.now() - new Date(stageEnteredAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return {
    id: data.id as string,
    title: (data.title as string) || (data.name as string) || 'Untitled Deal',
    description: data.description as string | null,
    // Value & Revenue
    value,
    probability,
    weightedValue: (data.weighted_value as number) || (value * probability) / 100,
    valueBasis: data.value_basis as string | null,
    currency: (data.currency as string) || 'USD',
    // Pipeline
    stage: stage as DealStage,
    expectedCloseDate: data.expected_close_date as string | null,
    actualCloseDate: data.actual_close_date as string | null,
    // Additional value fields
    estimatedPlacements: data.estimated_placements as number | null,
    avgBillRate: data.avg_bill_rate as number | null,
    contractLengthMonths: data.contract_length_months as number | null,
    // Next steps
    nextStep: data.next_step as string | null,
    nextStepDate: data.next_step_date as string | null,
    // Health
    healthStatus: data.health_status as string | null,
    daysInStage,
    // Related IDs
    companyId: data.company_id as string | null,
    leadId: data.lead_id as string | null,
    leadContactId: data.lead_contact_id as string | null,
    // Owner
    owner: owner ? {
      id: owner.id || '',
      fullName: owner.full_name || 'Unknown',
      avatarUrl: owner.avatar_url || null
    } : null,
    // Timestamps
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string | null,
    lastActivityAt: data.last_activity_at as string | null,
  }
}

function transformAccount(data: Record<string, unknown>): DealAccountInfo {
  const city = data.headquarters_city as string | null
  const state = data.headquarters_state as string | null
  const location = [city, state].filter(Boolean).join(', ') || null

  return {
    id: data.id as string,
    name: (data.name as string) || 'Unknown Account',
    industry: data.industry as string | null,
    employeeCount: data.employee_count as number | null,
    revenue: data.revenue as string | null,
    website: data.website as string | null,
    location,
    category: data.category as string | null,
  }
}

function transformLead(data: Record<string, unknown>): DealLeadInfo {
  return {
    id: data.id as string,
    fullName: [data.first_name, data.last_name].filter(Boolean).join(' ') || 'Unknown',
    email: data.email as string | null,
    status: (data.lead_status as string) || 'converted',
    source: data.lead_source as string | null,
    convertedAt: data.lead_converted_at as string | null,
  }
}

function transformStakeholders(data: Record<string, unknown>[]): DealStakeholder[] {
  return data.map((s) => {
    const contact = s.contact as { id?: string; phone?: string; email?: string } | null
    return {
      id: s.id as string,
      contactId: s.contact_id as string | null,
      name: (s.name as string) || 'Unknown',
      title: s.title as string | null,
      email: (s.email as string) || contact?.email || null,
      phone: contact?.phone || null,
      role: s.role as string | null,
      influenceLevel: s.influence_level as string | null,
      sentiment: s.sentiment as string | null,
      engagementNotes: s.engagement_notes as string | null,
      isPrimary: (s.is_primary as boolean) || false,
      isActive: (s.is_active as boolean) || true,
    }
  })
}

function transformStageHistory(data: Record<string, unknown>[]): DealStageHistoryEntry[] {
  return data.map((h) => {
    const enteredAt = h.entered_at as string
    const exitedAt = h.exited_at as string | null
    const changedBy = h.changed_by as { full_name?: string } | null

    // Calculate duration
    let durationDays: number | null = null
    if (enteredAt && exitedAt) {
      durationDays = Math.floor(
        (new Date(exitedAt).getTime() - new Date(enteredAt).getTime()) / (1000 * 60 * 60 * 24)
      )
    }

    return {
      id: h.id as string,
      stage: (h.stage as DealStage) || 'discovery',
      enteredAt,
      exitedAt,
      durationDays,
      changedBy: changedBy?.full_name || null,
    }
  })
}

function transformActivities(data: Record<string, unknown>[]): DealActivity[] {
  return data.map((a) => {
    const assignee = a.assigned_to as { full_name?: string } | null
    return {
      id: a.id as string,
      type: (a.activity_type as string) || 'task',
      subject: (a.subject as string) || 'No Subject',
      description: a.description as string | null,
      dueDate: a.due_date as string | null,
      status: (a.status as string) || 'pending',
      assignedTo: assignee?.full_name || null,
      createdAt: a.created_at as string,
    }
  })
}

function transformNotes(data: Record<string, unknown>[]): DealNote[] {
  return data.map((n) => {
    const creator = n.creator as { full_name?: string } | null
    return {
      id: n.id as string,
      title: n.title as string | null,
      content: (n.content as string) || '',
      createdAt: n.created_at as string,
      createdBy: creator?.full_name || 'Unknown',
      isPinned: (n.is_pinned as boolean) || false,
    }
  })
}

function transformDocuments(data: Record<string, unknown>[]): DealDocument[] {
  return data.map((d) => {
    const uploader = d.uploader as { full_name?: string } | null
    return {
      id: d.id as string,
      name: (d.name as string) || 'Untitled',
      type: (d.document_type as string) || 'other',
      size: (d.file_size as number) || 0,
      uploadedAt: d.created_at as string,
      uploadedBy: uploader?.full_name || 'Unknown',
      url: (d.file_url as string) || '',
    }
  })
}

function transformHistory(data: Record<string, unknown>[]): HistoryEntry[] {
  return data.map((h) => {
    const changedByUser = h.changed_by_user as { id?: string; full_name?: string; avatar_url?: string } | null
    const changeType = (h.change_type as string) || 'custom'
    const metadata = h.metadata as Record<string, unknown> | null

    return {
      id: h.id as string,
      changeType,
      field: h.field_name as string | null,
      oldValue: h.old_value as string | null,
      newValue: h.new_value as string | null,
      oldValueLabel: h.old_value_label as string | null,
      newValueLabel: h.new_value_label as string | null,
      reason: h.reason as string | null,
      comment: h.comment as string | null,
      isAutomated: (h.is_automated as boolean) || false,
      timeInPreviousState: h.time_in_previous_state as string | null,
      metadata,
      changedAt: h.changed_at as string,
      changedBy: changedByUser?.id ? {
        id: changedByUser.id,
        name: changedByUser.full_name || 'Unknown',
        avatarUrl: changedByUser.avatar_url || null,
      } : null,
      action: changeType === 'status_change' ? 'status_updated'
        : changeType === 'owner_change' ? 'owner_changed'
        : (metadata?.action as string) || 'update',
    }
  })
}

function computeWarnings(
  deal: Record<string, unknown>,
  stakeholders: Record<string, unknown>[]
): WorkspaceWarning[] {
  const warnings: WorkspaceWarning[] = []
  const stage = deal.stage as string

  // No champion identified
  const hasChampion = stakeholders.some((s) => s.role === 'champion')
  if (!hasChampion && !['closed_won', 'closed_lost'].includes(stage)) {
    warnings.push({
      id: 'no-champion',
      message: 'No champion identified for this deal.',
      severity: 'warning',
      section: 'contacts',
    })
  }

  // No decision maker
  const hasDecisionMaker = stakeholders.some((s) => s.role === 'decision_maker')
  if (!hasDecisionMaker && !['discovery', 'closed_won', 'closed_lost'].includes(stage)) {
    warnings.push({
      id: 'no-decision-maker',
      message: 'No decision maker identified.',
      severity: 'info',
      section: 'contacts',
    })
  }

  // Stale deal (no activity in 14+ days)
  const lastActivity = deal.last_activity_at as string | null
  if (lastActivity && !['closed_won', 'closed_lost'].includes(stage)) {
    const daysSinceActivity = Math.floor(
      (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceActivity > 14) {
      warnings.push({
        id: 'stale-deal',
        message: `No activity in ${daysSinceActivity} days.`,
        severity: 'warning',
        section: 'summary',
      })
    }
  }

  // Past expected close date
  const expectedClose = deal.expected_close_date as string | null
  if (expectedClose && !['closed_won', 'closed_lost'].includes(stage)) {
    const isPast = new Date(expectedClose) < new Date()
    if (isPast) {
      warnings.push({
        id: 'past-due',
        message: 'Expected close date has passed.',
        severity: 'error',
        section: 'summary',
      })
    }
  }

  return warnings
}
