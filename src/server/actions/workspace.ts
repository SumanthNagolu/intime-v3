'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { createContext } from '@/server/trpc/context'
import type {
  MyWorkspaceData,
  MyWorkspaceStats,
  MyWorkspaceActivity,
  MyWorkspaceSubmission,
  ActivityFilterCounts,
  SubmissionFilterCounts,
} from '@/types/workspace'

/**
 * Fetches all My Workspace data in ONE database round-trip.
 * This is the server action for GW-010.
 *
 * All queries are executed in parallel using Promise.all.
 */
export async function getMyWorkspace(): Promise<MyWorkspaceData | null> {
  const adminClient = getAdminClient()

  // Get current user context
  let userId: string
  let orgId: string
  try {
    const ctx = await createContext()
    if (!ctx.user?.id || !ctx.orgId) return null
    userId = ctx.user.id
    orgId = ctx.orgId
  } catch {
    return null
  }

  // Date calculations
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayISO = today.toISOString().split('T')[0]
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()))
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 7)

  // Fetch all data in parallel
  const [
    activitiesResult,
    submissionsResult,
    jobsResult,
    placementsResult,
  ] = await Promise.all([
    // My Activities (assigned to me)
    adminClient
      .from('activities')
      .select(`
        id, subject, description, activity_type, status, priority, due_date,
        entity_type, entity_id, created_at, completed_at,
        poc:contacts!poc_id(id, first_name, last_name),
        account:companies!account_id(id, name)
      `)
      .eq('org_id', orgId)
      .eq('assigned_to', userId)
      .is('deleted_at', null)
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(200),  // Fetch more for filter counts

    // My Submissions (submitted by me or owned by me)
    adminClient
      .from('submissions')
      .select(`
        id, status, stage, submitted_at, updated_at,
        candidate:contacts!submissions_candidate_id_fkey(id, first_name, last_name, title),
        job:jobs!submissions_job_id_fkey(
          id, title,
          company:companies!jobs_company_id_fkey(id, name)
        ),
        interviews:interviews(id, scheduled_at)
      `)
      .eq('org_id', orgId)
      .or(`submitted_by.eq.${userId},owner_id.eq.${userId}`)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(200),

    // My Jobs (owner)
    adminClient
      .from('jobs')
      .select('id, status')
      .eq('org_id', orgId)
      .eq('owner_id', userId)
      .is('deleted_at', null),

    // My Placements
    adminClient
      .from('placements')
      .select('id, status')
      .eq('org_id', orgId)
      .eq('recruiter_id', userId)
      .is('deleted_at', null),
  ])

  // Transform activities
  const activities: MyWorkspaceActivity[] = (activitiesResult.data || []).map((a) => {
    const dueDate = a.due_date ? new Date(a.due_date) : null
    const completedAt = a.completed_at ? new Date(a.completed_at) : null
    const isOverdue = dueDate ? dueDate < today && !['completed', 'skipped', 'canceled'].includes(a.status) : false
    const isDueToday = dueDate ? dueDate.toISOString().split('T')[0] === todayISO : false
    const isDueThisWeek = dueDate ? dueDate <= endOfWeek && dueDate >= today : false
    const completedToday = completedAt ? completedAt.toISOString().split('T')[0] === todayISO : false

    // Supabase returns arrays for relations, extract first element
    const pocData = a.poc as { id: string; first_name: string; last_name: string }[] | null
    const poc = pocData?.[0] || null
    const accountData = a.account as { id: string; name: string }[] | null
    const account = accountData?.[0] || null

    return {
      id: a.id,
      subject: a.subject,
      description: a.description,
      activityType: a.activity_type,
      status: a.status,
      priority: a.priority,
      dueDate: a.due_date,
      entityType: a.entity_type,
      entityId: a.entity_id,
      accountName: account?.name || null,
      contact: poc ? { id: poc.id, name: `${poc.first_name} ${poc.last_name}`.trim() } : null,
      isOverdue,
      isDueToday,
      isDueThisWeek,
      createdAt: a.created_at,
      completedAt: a.completed_at,
      completedToday,
    }
  })

  // Transform submissions
  const submissions: MyWorkspaceSubmission[] = (submissionsResult.data || []).map((s) => {
    // Supabase returns arrays for relations, extract first element
    const candidateData = s.candidate as { id: string; first_name: string; last_name: string; title: string | null }[] | null
    const candidate = candidateData?.[0] || null
    const jobData = s.job as { id: string; title: string; company: { id: string; name: string }[] | null }[] | null
    const jobRecord = jobData?.[0] || null
    const job = jobRecord ? {
      id: jobRecord.id,
      title: jobRecord.title,
      company: jobRecord.company?.[0] || null,
    } : null
    const interviews = (s.interviews || []) as { id: string; scheduled_at: string }[]

    const hasUpcomingInterview = interviews.some((i) => new Date(i.scheduled_at) > now)
    const isRecentlySubmitted = s.submitted_at ? new Date(s.submitted_at) > sevenDaysAgo : false
    const needsAction = ['submitted', 'screening', 'client_review'].includes(s.status)

    return {
      id: s.id,
      status: s.status,
      stage: s.stage || s.status,
      submittedAt: s.submitted_at,
      updatedAt: s.updated_at,
      candidate: candidate ? {
        id: candidate.id,
        name: `${candidate.first_name} ${candidate.last_name}`.trim(),
        title: candidate.title,
      } : null,
      job,
      hasUpcomingInterview,
      isRecentlySubmitted,
      needsAction,
    }
  })

  // Compute stats
  const stats: MyWorkspaceStats = {
    activities: {
      total: activities.filter((a) => ['scheduled', 'open', 'in_progress'].includes(a.status)).length,
      overdue: activities.filter((a) => a.isOverdue).length,
      dueToday: activities.filter((a) => a.isDueToday && !a.isOverdue).length,
    },
    submissions: {
      total: submissions.length,
      pending: submissions.filter((s) => s.needsAction).length,
    },
    jobs: {
      total: (jobsResult.data || []).length,
      active: (jobsResult.data || []).filter((j) => j.status === 'open').length,
    },
    placements: {
      total: (placementsResult.data || []).length,
      active: (placementsResult.data || []).filter((p) => p.status === 'active').length,
    },
  }

  // Compute activity filter counts
  const activityFilterCounts: ActivityFilterCounts = {
    all_open: activities.filter((a) => ['scheduled', 'open', 'in_progress'].includes(a.status)).length,
    my_open: activities.filter((a) => ['scheduled', 'open', 'in_progress'].includes(a.status)).length, // Same as all_open for "my" workspace
    overdue: activities.filter((a) => a.isOverdue).length,
    due_today: activities.filter((a) => a.isDueToday && ['scheduled', 'open', 'in_progress'].includes(a.status)).length,
    due_week: activities.filter((a) => a.isDueThisWeek && ['scheduled', 'open', 'in_progress'].includes(a.status)).length,
    completed_today: activities.filter((a) => a.completedToday).length,
    all: activities.length,
  }

  // Compute submission filter counts
  const submissionFilterCounts: SubmissionFilterCounts = {
    pending_action: submissions.filter((s) => s.needsAction).length,
    client_review: submissions.filter((s) => s.status === 'client_review').length,
    interview_scheduled: submissions.filter((s) => s.hasUpcomingInterview).length,
    offer_stage: submissions.filter((s) => ['offer_extended', 'offer_accepted', 'offer_pending'].includes(s.status)).length,
    recent: submissions.filter((s) => s.isRecentlySubmitted).length,
    all: submissions.length,
  }

  return {
    stats,
    activities,
    submissions,
    filterCounts: {
      activities: activityFilterCounts,
      submissions: submissionFilterCounts,
    },
  }
}
