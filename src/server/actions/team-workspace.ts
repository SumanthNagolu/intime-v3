'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { createContext } from '@/server/trpc/context'
import type {
  TeamWorkspaceData,
  TeamWorkspaceStats,
  TeamWorkspaceActivity,
  TeamWorkspaceSubmission,
  TeamWorkspaceJob,
  TeamWorkspacePlacement,
  TeamWorkspaceQueueItem,
  TeamMember,
  TeamMemberMetrics,
  TeamPerformanceMetrics,
  ActivityFilterCounts,
  SubmissionFilterCounts,
} from '@/types/workspace'

/**
 * Fetches all Team Workspace data in ONE database round-trip.
 * For managers: aggregates across all pods they manage.
 * For non-managers: shows the pod they belong to.
 */
export async function getTeamWorkspace(): Promise<TeamWorkspaceData | null> {
  const adminClient = getAdminClient()

  // Get current user context
  let userId: string // user_profiles.id (NOT auth.users.id)
  let orgId: string
  try {
    const ctx = await createContext()
    if (!ctx.user?.id || !ctx.orgId) return null
    orgId = ctx.orgId

    // Convert auth.users.id to user_profiles.id
    // pod_members.user_id references user_profiles.id, not auth.users.id
    const { data: profile } = await adminClient
      .from('user_profiles')
      .select('id')
      .eq('auth_id', ctx.user.id)
      .single()

    if (!profile?.id) return null
    userId = profile.id
  } catch {
    return null
  }

  // Date calculations
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayISO = today.toISOString().split('T')[0]
  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()))
  const thirtyDaysFromNow = new Date(today)
  thirtyDaysFromNow.setDate(today.getDate() + 30)

  // Step 1: Try to get managed pods first (for managers)
  let podsResult = await adminClient
    .from('pods')
    .select(`
      id, name, manager_id,
      manager:user_profiles!pods_manager_id_fkey(id, full_name, avatar_url),
      pod_members(
        user_id, role, is_active,
        user:user_profiles!pod_members_user_id_fkey(id, full_name, email, avatar_url)
      )
    `)
    .eq('org_id', orgId)
    .eq('manager_id', userId)
    .eq('is_active', true)
    .is('deleted_at', null)

  // Step 1b: If not a manager, check if user is a member of any pod
  if (!podsResult.data || podsResult.data.length === 0) {
    // Find pods where user is a member
    const membershipResult = await adminClient
      .from('pod_members')
      .select('pod_id')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (!membershipResult.data || membershipResult.data.length === 0) {
      return null // User is not in any pod
    }

    const podIds = membershipResult.data.map((m) => m.pod_id)

    // Get the pods user belongs to
    podsResult = await adminClient
      .from('pods')
      .select(`
        id, name, manager_id,
        manager:user_profiles!pods_manager_id_fkey(id, full_name, avatar_url),
        pod_members(
          user_id, role, is_active,
          user:user_profiles!pod_members_user_id_fkey(id, full_name, email, avatar_url)
        )
      `)
      .eq('org_id', orgId)
      .in('id', podIds)
      .eq('is_active', true)
      .is('deleted_at', null)

    if (!podsResult.data || podsResult.data.length === 0) {
      return null // No active pods found
    }
  }

  // Aggregate team members from all managed pods
  const memberIds: string[] = []
  const memberMap = new Map<string, TeamMember>()

  // Helper to extract data from Supabase relations (handles both object and array returns)
  function extractFirst<T>(data: T | T[] | null | undefined): T | null {
    if (!data) return null
    if (Array.isArray(data)) return data[0] || null
    return data
  }

  for (const pod of podsResult.data) {
    for (const pm of pod.pod_members || []) {
      // Supabase may return object or array for relations
      const user = extractFirst(pm.user as { id: string; full_name: string; email: string; avatar_url: string | null } | { id: string; full_name: string; email: string; avatar_url: string | null }[] | null)
      if (pm.is_active && user && !memberMap.has(pm.user_id)) {
        memberIds.push(pm.user_id)
        memberMap.set(pm.user_id, {
          id: user.id,
          name: user.full_name || 'Unknown',
          email: user.email || '',
          avatarUrl: user.avatar_url,
          role: pm.role as 'senior' | 'junior',
        })
      }
    }
  }

  // Add manager to members if not already included
  if (!memberMap.has(userId)) {
    memberIds.push(userId)
  }

  const members = Array.from(memberMap.values())
  const primaryPod = podsResult.data[0]
  const manager = extractFirst(primaryPod.manager as { id: string; full_name: string; avatar_url: string | null } | { id: string; full_name: string; avatar_url: string | null }[] | null)

  // Step 2: Fetch all team data in parallel
  const [
    activitiesResult,
    submissionsResult,
    jobsResult,
    placementsResult,
    queueActivitiesResult,
    queueJobsResult,
  ] = await Promise.all([
    // Team Activities (assigned to any team member)
    adminClient
      .from('activities')
      .select(`
        id, subject, activity_type, status, priority, due_date,
        entity_type, entity_id, created_at,
        poc:contacts!poc_id(id, first_name, last_name),
        account:companies!account_id(id, name),
        assignee:user_profiles!activities_assigned_to_fkey(id, full_name)
      `)
      .eq('org_id', orgId)
      .in('assigned_to', memberIds)
      .is('deleted_at', null)
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(300),

    // Team Submissions
    adminClient
      .from('submissions')
      .select(`
        id, status, stage, submitted_at, updated_at,
        candidate:contacts!submissions_candidate_id_fkey(id, first_name, last_name, title),
        job:jobs!submissions_job_id_fkey(
          id, title,
          company:companies!jobs_company_id_fkey(id, name)
        ),
        submitter:user_profiles!submissions_submitted_by_fkey(id, full_name),
        interviews:interviews(id, scheduled_at)
      `)
      .eq('org_id', orgId)
      .in('submitted_by', memberIds)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(300),

    // Team Jobs (owned by team members)
    adminClient
      .from('jobs')
      .select(`
        id, title, status, created_at,
        company:companies!jobs_company_id_fkey(id, name),
        owner:user_profiles!jobs_owner_id_fkey(id, full_name),
        submissions:submissions(id)
      `)
      .eq('org_id', orgId)
      .in('owner_id', memberIds)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(200),

    // Team Placements
    adminClient
      .from('placements')
      .select(`
        id, status, start_date, end_date,
        candidate:contacts!placements_candidate_id_fkey(id, first_name, last_name),
        job:jobs!placements_job_id_fkey(id, title),
        company:companies!placements_company_id_fkey(id, name),
        recruiter:user_profiles!placements_recruiter_id_fkey(id, full_name)
      `)
      .eq('org_id', orgId)
      .in('recruiter_id', memberIds)
      .is('deleted_at', null)
      .order('start_date', { ascending: false })
      .limit(200),

    // Queue: Unassigned activities for team's accounts
    adminClient
      .from('activities')
      .select(`
        id, subject, activity_type, priority, created_at,
        account:companies!account_id(id, name)
      `)
      .eq('org_id', orgId)
      .is('assigned_to', null)
      .is('deleted_at', null)
      .limit(100),

    // Queue: Unassigned jobs for team's accounts
    adminClient
      .from('jobs')
      .select(`
        id, title, created_at,
        company:companies!jobs_company_id_fkey(id, name)
      `)
      .eq('org_id', orgId)
      .is('owner_id', null)
      .is('deleted_at', null)
      .limit(100),
  ])

  // Transform activities
  const activities: TeamWorkspaceActivity[] = (activitiesResult.data || []).map((a) => {
    const dueDate = a.due_date ? new Date(a.due_date) : null
    const isOverdue = dueDate ? dueDate < today && !['completed', 'skipped', 'canceled'].includes(a.status) : false
    const isDueToday = dueDate ? dueDate.toISOString().split('T')[0] === todayISO : false

    const poc = extractFirst(a.poc as { id: string; first_name: string; last_name: string } | { id: string; first_name: string; last_name: string }[] | null)
    const account = extractFirst(a.account as { id: string; name: string } | { id: string; name: string }[] | null)
    const assignee = extractFirst(a.assignee as { id: string; full_name: string } | { id: string; full_name: string }[] | null)

    return {
      id: a.id,
      subject: a.subject,
      activityType: a.activity_type,
      status: a.status,
      priority: a.priority,
      dueDate: a.due_date,
      entityType: a.entity_type,
      entityId: a.entity_id,
      accountName: account?.name || null,
      contact: poc ? { id: poc.id, name: `${poc.first_name} ${poc.last_name}`.trim() } : null,
      assignedTo: assignee ? { id: assignee.id, name: assignee.full_name } : null,
      isOverdue,
      isDueToday,
      createdAt: a.created_at,
    }
  })

  // Transform submissions
  const submissions: TeamWorkspaceSubmission[] = (submissionsResult.data || []).map((s) => {
    const candidate = extractFirst(s.candidate as { id: string; first_name: string; last_name: string; title: string | null } | { id: string; first_name: string; last_name: string; title: string | null }[] | null)
    const jobRecord = extractFirst(s.job as { id: string; title: string; company: { id: string; name: string } | { id: string; name: string }[] | null } | { id: string; title: string; company: { id: string; name: string } | { id: string; name: string }[] | null }[] | null)
    const job = jobRecord ? {
      id: jobRecord.id,
      title: jobRecord.title,
      company: extractFirst(jobRecord.company),
    } : null
    const submitter = extractFirst(s.submitter as { id: string; full_name: string } | { id: string; full_name: string }[] | null)
    const interviews = (s.interviews || []) as { id: string; scheduled_at: string }[]
    const hasUpcomingInterview = interviews.some((i) => new Date(i.scheduled_at) > now)

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
      submittedBy: submitter ? { id: submitter.id, name: submitter.full_name } : null,
      hasUpcomingInterview,
    }
  })

  // Transform jobs
  const jobs: TeamWorkspaceJob[] = (jobsResult.data || []).map((j) => {
    const company = extractFirst(j.company as { id: string; name: string } | { id: string; name: string }[] | null)
    const owner = extractFirst(j.owner as { id: string; full_name: string } | { id: string; full_name: string }[] | null)
    const subs = (j.submissions || []) as { id: string }[]

    return {
      id: j.id,
      title: j.title,
      status: j.status,
      accountName: company?.name || null,
      submissionCount: subs.length,
      openDate: j.created_at,
      owner: owner ? { id: owner.id, name: owner.full_name } : null,
    }
  })

  // Transform placements
  const placements: TeamWorkspacePlacement[] = (placementsResult.data || []).map((p) => {
    const candidate = extractFirst(p.candidate as { id: string; first_name: string; last_name: string } | { id: string; first_name: string; last_name: string }[] | null)
    const job = extractFirst(p.job as { id: string; title: string } | { id: string; title: string }[] | null)
    const company = extractFirst(p.company as { id: string; name: string } | { id: string; name: string }[] | null)
    const recruiter = extractFirst(p.recruiter as { id: string; full_name: string } | { id: string; full_name: string }[] | null)

    const endDate = p.end_date ? new Date(p.end_date) : null
    const isEndingSoon = endDate ? endDate <= thirtyDaysFromNow && endDate > today : false

    return {
      id: p.id,
      candidateName: candidate ? `${candidate.first_name} ${candidate.last_name}`.trim() : 'Unknown',
      accountName: company?.name || null,
      jobTitle: job?.title || 'Unknown',
      startDate: p.start_date,
      endDate: p.end_date,
      status: p.status,
      recruiter: recruiter ? { id: recruiter.id, name: recruiter.full_name } : null,
      isEndingSoon,
    }
  })

  // Build queue items
  const queue: TeamWorkspaceQueueItem[] = [
    ...(queueActivitiesResult.data || []).map((a) => {
      const account = extractFirst(a.account as { id: string; name: string } | { id: string; name: string }[] | null)
      return {
        id: a.id,
        type: 'activity' as const,
        title: a.subject || `${a.activity_type} Activity`,
        accountName: account?.name || null,
        createdAt: a.created_at,
        priority: a.priority,
      }
    }),
    ...(queueJobsResult.data || []).map((j) => {
      const company = extractFirst(j.company as { id: string; name: string } | { id: string; name: string }[] | null)
      return {
        id: j.id,
        type: 'job' as const,
        title: j.title,
        accountName: company?.name || null,
        createdAt: j.created_at,
        priority: null,
      }
    }),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Compute member metrics for summary matrix
  const memberMetrics: TeamMemberMetrics[] = members.map((member) => {
    const memberActivities = activities.filter((a) => a.assignedTo?.id === member.id)
    const memberSubmissions = submissions.filter((s) => s.submittedBy?.id === member.id)
    const memberJobs = jobs.filter((j) => j.owner?.id === member.id)

    return {
      memberId: member.id,
      memberName: member.name,
      activities: {
        open: memberActivities.filter((a) => ['scheduled', 'open', 'in_progress'].includes(a.status)).length,
        priority: memberActivities.filter((a) => a.priority === 'high' || a.priority === 'urgent').length,
        overdue: memberActivities.filter((a) => a.isOverdue).length,
      },
      submissions: {
        open: memberSubmissions.filter((s) => !['placed', 'rejected', 'withdrawn'].includes(s.status)).length,
        priority: 0,
        overdue: 0,
      },
      jobs: {
        open: memberJobs.filter((j) => j.status === 'open').length,
        priority: 0,
      },
    }
  })

  // Compute performance metrics
  const performance: TeamPerformanceMetrics[] = members.map((member) => {
    const memberActivities = activities.filter((a) => a.assignedTo?.id === member.id)
    const memberSubmissions = submissions.filter((s) => s.submittedBy?.id === member.id)
    const memberPlacements = placements.filter((p) => p.recruiter?.id === member.id)

    return {
      memberId: member.id,
      memberName: member.name,
      activitiesCompleted: memberActivities.filter((a) => a.status === 'completed').length,
      submissionsMade: memberSubmissions.length,
      placementsClosed: memberPlacements.filter((p) => p.status === 'active').length,
      avgTimeToFill: null,
    }
  })

  // Compute stats
  const stats: TeamWorkspaceStats = {
    totalMembers: members.length,
    totalActivities: activities.filter((a) => ['scheduled', 'open', 'in_progress'].includes(a.status)).length,
    totalSubmissions: submissions.length,
    totalJobs: jobs.filter((j) => j.status === 'open').length,
    totalPlacements: placements.filter((p) => p.status === 'active').length,
    inQueue: queue.length,
  }

  // Compute filter counts
  const activityFilterCounts: ActivityFilterCounts = {
    all_open: activities.filter((a) => ['scheduled', 'open', 'in_progress'].includes(a.status)).length,
    my_open: activities.filter((a) => a.assignedTo?.id === userId && ['scheduled', 'open', 'in_progress'].includes(a.status)).length,
    overdue: activities.filter((a) => a.isOverdue).length,
    due_today: activities.filter((a) => a.isDueToday && ['scheduled', 'open', 'in_progress'].includes(a.status)).length,
    due_week: activities.filter((a) => {
      if (!a.dueDate) return false
      const d = new Date(a.dueDate)
      return d <= endOfWeek && d >= today && ['scheduled', 'open', 'in_progress'].includes(a.status)
    }).length,
    completed_today: 0,
    all: activities.length,
  }

  const submissionFilterCounts: SubmissionFilterCounts = {
    pending_action: submissions.filter((s) => ['submitted', 'screening', 'client_review'].includes(s.status)).length,
    client_review: submissions.filter((s) => s.status === 'client_review').length,
    interview_scheduled: submissions.filter((s) => s.hasUpcomingInterview).length,
    offer_stage: submissions.filter((s) => ['offer_extended', 'offer_accepted', 'offer_pending'].includes(s.status)).length,
    recent: submissions.length,
    all: submissions.length,
  }

  return {
    team: {
      id: primaryPod.id,
      name: primaryPod.name,
      memberCount: members.length,
      manager: manager ? { id: manager.id, name: manager.full_name } : { id: userId, name: 'Unknown' },
    },
    members,
    stats,
    memberMetrics,
    activities,
    submissions,
    jobs,
    placements,
    queue,
    performance,
    filterCounts: {
      activities: activityFilterCounts,
      submissions: submissionFilterCounts,
    },
  }
}
