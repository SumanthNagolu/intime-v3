import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'

// Admin client for bypassing RLS
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ============================================
// DASHBOARD ROUTER - Recruiter Dashboard Data
// ============================================

export const dashboardRouter = router({
  // ============================================
  // SPRINT PROGRESS WIDGET (H03)
  // ============================================
  getSprintProgress: orgProtectedProcedure
    .input(z.object({
      sprintDays: z.number().default(14),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const now = new Date()
      const sprintStart = new Date(now)
      sprintStart.setDate(sprintStart.getDate() - (now.getDay() + 7) % 14) // Start of current 2-week sprint
      sprintStart.setHours(0, 0, 0, 0)

      const sprintEnd = new Date(sprintStart)
      sprintEnd.setDate(sprintEnd.getDate() + input.sprintDays)

      const daysRemaining = Math.max(0, Math.ceil((sprintEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      const daysElapsed = input.sprintDays - daysRemaining

      // Default targets (could be fetched from user_goals table)
      const targets = {
        placements: 2,
        revenue: 25000,
        submissions: 10,
        interviews: 3,
        candidates: 75,
        jobFill: 50, // percentage
      }

      // Get recruiter's submissions
      const { data: submissions } = await adminClient
        .from('submissions')
        .select('id')
        .eq('org_id', orgId)
        .eq('submitted_by', user?.id)

      const submissionIds = submissions?.map(s => s.id) ?? []

      // Placements this sprint
      const { count: placementCount } = await adminClient
        .from('placements')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .in('submission_id', submissionIds.length > 0 ? submissionIds : ['00000000-0000-0000-0000-000000000000'])
        .gte('start_date', sprintStart.toISOString())
        .lt('start_date', sprintEnd.toISOString())

      // Revenue this sprint
      const { data: revenueData } = await adminClient
        .from('placements')
        .select('billing_rate, hours_billed')
        .eq('org_id', orgId)
        .in('submission_id', submissionIds.length > 0 ? submissionIds : ['00000000-0000-0000-0000-000000000000'])
        .gte('start_date', sprintStart.toISOString())
        .lt('start_date', sprintEnd.toISOString())

      const revenue = revenueData?.reduce((sum, p) =>
        sum + ((p.billing_rate || 0) * (p.hours_billed || 0)), 0) ?? 0

      // Submissions this sprint
      const { count: submissionCount } = await adminClient
        .from('submissions')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('submitted_by', user?.id)
        .gte('submitted_at', sprintStart.toISOString())
        .lt('submitted_at', sprintEnd.toISOString())

      // Interviews this sprint
      const { count: interviewCount } = await adminClient
        .from('interviews')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .in('submission_id', submissionIds.length > 0 ? submissionIds : ['00000000-0000-0000-0000-000000000000'])
        .gte('scheduled_at', sprintStart.toISOString())
        .lt('scheduled_at', sprintEnd.toISOString())

      // Candidates sourced this sprint
      const { count: candidateCount } = await adminClient
        .from('candidates')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('sourced_by', user?.id)
        .gte('created_at', sprintStart.toISOString())
        .lt('created_at', sprintEnd.toISOString())

      // Job fill rate
      const { data: jobs } = await adminClient
        .from('jobs')
        .select('id, status')
        .eq('org_id', orgId)
        .eq('recruiter_id', user?.id)
        .in('status', ['active', 'filled'])

      const totalJobs = jobs?.length ?? 0
      const filledJobs = jobs?.filter(j => j.status === 'filled').length ?? 0
      const jobFillRate = totalJobs > 0 ? Math.round((filledJobs / totalJobs) * 100) : 0

      // Calculate percentages and status
      const calculateMetric = (actual: number, target: number) => {
        const percentage = target > 0 ? Math.round((actual / target) * 100) : 0
        let status: 'green' | 'yellow' | 'red'
        if (percentage >= 100) status = 'green'
        else if (percentage >= 67) status = 'yellow'
        else status = 'red'
        return { actual, target, percentage, status }
      }

      const metrics = {
        placements: calculateMetric(placementCount ?? 0, targets.placements),
        revenue: calculateMetric(revenue, targets.revenue),
        submissions: calculateMetric(submissionCount ?? 0, targets.submissions),
        interviews: calculateMetric(interviewCount ?? 0, targets.interviews),
        candidates: calculateMetric(candidateCount ?? 0, targets.candidates),
        jobFill: {
          actual: jobFillRate,
          target: targets.jobFill,
          percentage: jobFillRate,
          status: jobFillRate >= 50 ? 'green' as const : jobFillRate >= 30 ? 'yellow' as const : 'red' as const,
        },
      }

      // Count goals on track
      const onTrackCount = Object.values(metrics).filter(m => m.status === 'green').length

      return {
        sprintStart: sprintStart.toISOString(),
        sprintEnd: sprintEnd.toISOString(),
        daysRemaining,
        daysElapsed,
        metrics,
        onTrackCount,
        totalGoals: 6,
      }
    }),

  // ============================================
  // TODAY'S PRIORITIES WIDGET (H03)
  // ============================================
  getTodaysPriorities: orgProtectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Get all pending tasks
      const { data: tasks } = await adminClient
        .from('activities')
        .select(`
          id, subject, description, activity_type, status, priority, due_date,
          entity_type, entity_id
        `)
        .eq('org_id', orgId)
        .eq('assigned_to', user?.id)
        .in('status', ['scheduled', 'open', 'in_progress'])
        .order('due_date', { ascending: true })
        .limit(input.limit * 2) // Get more to group

      // Group by category
      const overdue: typeof tasks = []
      const dueToday: typeof tasks = []
      const highPriority: typeof tasks = []
      const upcoming: typeof tasks = []

      tasks?.forEach(task => {
        const dueDate = task.due_date ? new Date(task.due_date) : null

        if (dueDate && dueDate < today) {
          overdue.push(task)
        } else if (dueDate && dueDate >= today && dueDate < tomorrow) {
          dueToday.push(task)
        } else if (task.priority === 'high' || task.priority === 'urgent') {
          highPriority.push(task)
        } else {
          upcoming.push(task)
        }
      })

      return {
        overdue: overdue.map(t => ({
          id: t.id,
          subject: t.subject,
          activityType: t.activity_type,
          entityType: t.entity_type,
          entityId: t.entity_id,
          dueDate: t.due_date,
          daysOverdue: t.due_date
            ? Math.floor((today.getTime() - new Date(t.due_date).getTime()) / (1000 * 60 * 60 * 24))
            : 0,
        })),
        dueToday: dueToday.map(t => ({
          id: t.id,
          subject: t.subject,
          activityType: t.activity_type,
          entityType: t.entity_type,
          entityId: t.entity_id,
          dueDate: t.due_date,
        })),
        highPriority: highPriority.slice(0, 5).map(t => ({
          id: t.id,
          subject: t.subject,
          activityType: t.activity_type,
          priority: t.priority,
          entityType: t.entity_type,
          entityId: t.entity_id,
        })),
        upcoming: upcoming.slice(0, 5).map(t => ({
          id: t.id,
          subject: t.subject,
          activityType: t.activity_type,
          entityType: t.entity_type,
          entityId: t.entity_id,
          dueDate: t.due_date,
        })),
        counts: {
          overdue: overdue.length,
          dueToday: dueToday.length,
          highPriority: highPriority.length,
          total: tasks?.length ?? 0,
        },
      }
    }),

  // ============================================
  // PIPELINE HEALTH WIDGET (H03)
  // ============================================
  getPipelineHealth: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const now = new Date()
      const fourteenDaysAgo = new Date(now)
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
      const threeDaysAgo = new Date(now)
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

      // Active jobs count
      const { count: activeJobs } = await adminClient
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('recruiter_id', user?.id)
        .eq('status', 'active')

      // Jobs by priority
      const { data: jobData } = await adminClient
        .from('jobs')
        .select('id, priority, created_at')
        .eq('org_id', orgId)
        .eq('recruiter_id', user?.id)
        .eq('status', 'active')

      const urgentJobs = jobData?.filter(j => j.priority === 'urgent' || j.priority === 'high').length ?? 0

      // Get submissions
      const { data: submissions } = await adminClient
        .from('submissions')
        .select('id, status, submitted_at')
        .eq('org_id', orgId)
        .eq('submitted_by', user?.id)

      const submissionIds = submissions?.map(s => s.id) ?? []

      // Candidates in sourcing
      const { count: candidatesSourcing } = await adminClient
        .from('candidates')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('sourced_by', user?.id)
        .eq('status', 'sourcing')

      // Pending submissions
      const pendingSubmissions = submissions?.filter(s =>
        s.status === 'submitted' &&
        new Date(s.submitted_at) < threeDaysAgo
      ).length ?? 0

      // Interviews this week
      const startOfWeek = new Date(now)
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(endOfWeek.getDate() + 7)

      const { count: interviewsThisWeek } = await adminClient
        .from('interviews')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .in('submission_id', submissionIds.length > 0 ? submissionIds : ['00000000-0000-0000-0000-000000000000'])
        .gte('scheduled_at', startOfWeek.toISOString())
        .lt('scheduled_at', endOfWeek.toISOString())

      // Outstanding offers
      const { count: outstandingOffers } = await adminClient
        .from('submissions')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('submitted_by', user?.id)
        .eq('status', 'offered')

      // Active placements
      const { count: activePlacements } = await adminClient
        .from('placements')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .in('submission_id', submissionIds.length > 0 ? submissionIds : ['00000000-0000-0000-0000-000000000000'])
        .eq('status', 'active')

      // Urgent attention items
      const urgentItems: Array<{
        type: string
        description: string
        entityType: string
        entityId: string
      }> = []

      // Old jobs with weak pipeline (> 14 days, < 5 candidates)
      const { data: oldJobs } = await adminClient
        .from('jobs')
        .select('id, title, created_at, submissions(id)')
        .eq('org_id', orgId)
        .eq('recruiter_id', user?.id)
        .eq('status', 'active')
        .lt('created_at', fourteenDaysAgo.toISOString())

      oldJobs?.forEach(job => {
        const submissionCount = (job.submissions as Array<{ id: string }> | null)?.length ?? 0
        if (submissionCount < 5) {
          urgentItems.push({
            type: 'old_job_weak_pipeline',
            description: `${job.title} (${Math.floor((now.getTime() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24))} days old, weak pipeline)`,
            entityType: 'job',
            entityId: job.id,
          })
        }
      })

      // Stale submissions
      const staleSubmissions = submissions?.filter(s =>
        s.status === 'submitted' &&
        new Date(s.submitted_at) < threeDaysAgo
      ) ?? []

      if (staleSubmissions.length > 0) {
        urgentItems.push({
          type: 'stale_submissions',
          description: `${staleSubmissions.length} submission(s) awaiting feedback for 3+ days`,
          entityType: 'submission',
          entityId: staleSubmissions[0].id,
        })
      }

      return {
        activeJobs: activeJobs ?? 0,
        urgentJobs,
        candidatesSourcing: candidatesSourcing ?? 0,
        pendingSubmissions,
        interviewsThisWeek: interviewsThisWeek ?? 0,
        outstandingOffers: outstandingOffers ?? 0,
        activePlacements: activePlacements ?? 0,
        urgentItems,
      }
    }),

  // ============================================
  // ACTIVITY SUMMARY WIDGET (H03)
  // ============================================
  getActivitySummary: orgProtectedProcedure
    .input(z.object({
      days: z.number().default(7),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - input.days)

      const { data: activities } = await adminClient
        .from('activities')
        .select('activity_type, created_at')
        .eq('org_id', orgId)
        .eq('assigned_to', user?.id)
        .eq('status', 'completed')
        .gte('completed_at', startDate.toISOString())

      // Count by type
      const byType: Record<string, number> = {
        call: 0,
        email: 0,
        meeting: 0,
        note: 0,
        linkedin_message: 0,
      }

      activities?.forEach(a => {
        if (byType[a.activity_type] !== undefined) {
          byType[a.activity_type]++
        }
      })

      // Get sourcing stats
      const { count: candidatesSourced } = await adminClient
        .from('candidates')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('sourced_by', user?.id)
        .gte('created_at', startDate.toISOString())

      // Get phone screens (activities with type 'call' and entity_type 'candidate')
      const { count: phoneScreens } = await adminClient
        .from('activities')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('assigned_to', user?.id)
        .eq('activity_type', 'call')
        .eq('entity_type', 'candidate')
        .eq('status', 'completed')
        .gte('completed_at', startDate.toISOString())

      // Get submissions
      const { count: submissionsSent } = await adminClient
        .from('submissions')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('submitted_by', user?.id)
        .gte('submitted_at', startDate.toISOString())

      // Get interviews scheduled
      const { data: subs } = await adminClient
        .from('submissions')
        .select('id')
        .eq('org_id', orgId)
        .eq('submitted_by', user?.id)

      const subIds = subs?.map(s => s.id) ?? []

      const { count: interviewsScheduled } = await adminClient
        .from('interviews')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .in('submission_id', subIds.length > 0 ? subIds : ['00000000-0000-0000-0000-000000000000'])
        .gte('created_at', startDate.toISOString())

      // Calculate daily averages
      const dailyAvg = (count: number) => Math.round((count / input.days) * 10) / 10

      // Targets
      const targets = {
        calls: 3,
        emails: 5,
        meetings: 1,
        candidatesSourced: 15,
        phoneScreens: 5,
        submissions: 1,
      }

      return {
        calls: { count: byType.call, avg: dailyAvg(byType.call), target: targets.calls },
        emails: { count: byType.email, avg: dailyAvg(byType.email), target: targets.emails },
        meetings: { count: byType.meeting, avg: dailyAvg(byType.meeting), target: targets.meetings },
        candidatesSourced: { count: candidatesSourced ?? 0, avg: dailyAvg(candidatesSourced ?? 0), target: targets.candidatesSourced },
        phoneScreens: { count: phoneScreens ?? 0, avg: dailyAvg(phoneScreens ?? 0), target: targets.phoneScreens },
        submissions: { count: submissionsSent ?? 0, avg: dailyAvg(submissionsSent ?? 0), target: targets.submissions },
        interviewsScheduled: interviewsScheduled ?? 0,
        days: input.days,
      }
    }),

  // ============================================
  // QUALITY METRICS WIDGET (H03)
  // ============================================
  getQualityMetrics: orgProtectedProcedure
    .input(z.object({
      days: z.number().default(30),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - input.days)

      // Get all submissions
      const { data: submissions } = await adminClient
        .from('submissions')
        .select('id, status, submitted_at, job:jobs(id, created_at)')
        .eq('org_id', orgId)
        .eq('submitted_by', user?.id)
        .gte('submitted_at', startDate.toISOString())

      // Calculate time-to-submit (avg hours from job creation to submission)
      const timeToSubmitHours: number[] = []
      submissions?.forEach(s => {
        const jobArray = s.job as Array<{ id: string; created_at: string }> | null
        const job = jobArray?.[0]
        if (job?.created_at && s.submitted_at) {
          const hours = (new Date(s.submitted_at).getTime() - new Date(job.created_at).getTime()) / (1000 * 60 * 60)
          if (hours > 0 && hours < 720) { // Cap at 30 days
            timeToSubmitHours.push(hours)
          }
        }
      })
      const avgTimeToSubmit = timeToSubmitHours.length > 0
        ? Math.round(timeToSubmitHours.reduce((a, b) => a + b, 0) / timeToSubmitHours.length)
        : 0

      // Submission to interview rate
      const totalSubmissions = submissions?.length ?? 0
      const interviewedSubmissions = submissions?.filter(s =>
        ['interviewing', 'offered', 'placed'].includes(s.status)
      ).length ?? 0
      const submissionToInterviewRate = totalSubmissions > 0
        ? Math.round((interviewedSubmissions / totalSubmissions) * 100)
        : 0

      // Interview to offer rate
      const offeredSubmissions = submissions?.filter(s =>
        ['offered', 'placed'].includes(s.status)
      ).length ?? 0
      const interviewToOfferRate = interviewedSubmissions > 0
        ? Math.round((offeredSubmissions / interviewedSubmissions) * 100)
        : 0

      // Get placements
      const subIds = submissions?.map(s => s.id) ?? []
      const { data: placements } = await adminClient
        .from('placements')
        .select('id, status, start_date, submission:submissions(job:jobs(created_at))')
        .eq('org_id', orgId)
        .in('submission_id', subIds.length > 0 ? subIds : ['00000000-0000-0000-0000-000000000000'])
        .gte('start_date', startDate.toISOString())

      // Time to fill (avg days from job creation to placement)
      const timeToFillDays: number[] = []
      placements?.forEach(p => {
        const subArray = p.submission as Array<{ job: Array<{ created_at: string }> | null }> | null
        const sub = subArray?.[0]
        const job = sub?.job?.[0]
        if (job?.created_at && p.start_date) {
          const days = (new Date(p.start_date).getTime() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24)
          if (days > 0 && days < 180) { // Cap at 6 months
            timeToFillDays.push(days)
          }
        }
      })
      const avgTimeToFill = timeToFillDays.length > 0
        ? Math.round(timeToFillDays.reduce((a, b) => a + b, 0) / timeToFillDays.length)
        : 0

      // Offer acceptance rate
      const placedSubmissions = submissions?.filter(s => s.status === 'placed').length ?? 0
      const offerAcceptanceRate = offeredSubmissions > 0
        ? Math.round((placedSubmissions / offeredSubmissions) * 100)
        : 0

      // 30-day retention (placements still active after 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const oldPlacements = placements?.filter(p => new Date(p.start_date) < thirtyDaysAgo) ?? []
      const retainedPlacements = oldPlacements.filter(p => p.status === 'active' || p.status === 'completed')
      const retentionRate = oldPlacements.length > 0
        ? Math.round((retainedPlacements.length / oldPlacements.length) * 100)
        : 100

      // Calculate overall quality score
      const scoreComponents = [
        { value: avgTimeToSubmit, target: 48, weight: 15, inverse: true },
        { value: avgTimeToFill, target: 21, weight: 15, inverse: true },
        { value: submissionToInterviewRate, target: 70, weight: 25, inverse: false },
        { value: interviewToOfferRate, target: 40, weight: 20, inverse: false },
        { value: offerAcceptanceRate, target: 85, weight: 15, inverse: false },
        { value: retentionRate, target: 95, weight: 10, inverse: false },
      ]

      let qualityScore = 0
      scoreComponents.forEach(c => {
        let componentScore: number
        if (c.inverse) {
          componentScore = c.value <= c.target ? 100 : Math.max(0, 100 - ((c.value - c.target) / c.target) * 100)
        } else {
          componentScore = c.value >= c.target ? 100 : (c.value / c.target) * 100
        }
        qualityScore += (componentScore * c.weight) / 100
      })
      qualityScore = Math.round(qualityScore)

      return {
        timeToSubmit: {
          value: avgTimeToSubmit,
          target: 48,
          unit: 'hours',
          status: avgTimeToSubmit <= 48 ? 'good' : avgTimeToSubmit <= 72 ? 'warning' : 'poor',
        },
        timeToFill: {
          value: avgTimeToFill,
          target: 21,
          unit: 'days',
          status: avgTimeToFill <= 21 ? 'good' : avgTimeToFill <= 30 ? 'warning' : 'poor',
        },
        submissionQuality: {
          value: submissionToInterviewRate,
          target: 70,
          unit: '%',
          status: submissionToInterviewRate >= 70 ? 'good' : submissionToInterviewRate >= 50 ? 'warning' : 'poor',
        },
        interviewToOffer: {
          value: interviewToOfferRate,
          target: 40,
          unit: '%',
          status: interviewToOfferRate >= 40 ? 'good' : interviewToOfferRate >= 25 ? 'warning' : 'poor',
        },
        offerAcceptance: {
          value: offerAcceptanceRate,
          target: 85,
          unit: '%',
          status: offerAcceptanceRate >= 85 ? 'good' : offerAcceptanceRate >= 70 ? 'warning' : 'poor',
        },
        retention: {
          value: retentionRate,
          target: 95,
          unit: '%',
          status: retentionRate >= 95 ? 'good' : retentionRate >= 85 ? 'warning' : 'poor',
        },
        overallScore: qualityScore,
        days: input.days,
      }
    }),

  // ============================================
  // RECENT WINS WIDGET (H03)
  // ============================================
  getRecentWins: orgProtectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(10).default(5),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const wins: Array<{
        type: 'placement' | 'offer_accepted' | 'interview' | 'submission' | 'goal_achieved'
        description: string
        date: string
        entityType?: string
        entityId?: string
      }> = []

      // Get recent placements
      const { data: subs } = await adminClient
        .from('submissions')
        .select('id')
        .eq('org_id', orgId)
        .eq('submitted_by', user?.id)

      const subIds = subs?.map(s => s.id) ?? []

      if (subIds.length > 0) {
        const { data: placements } = await adminClient
          .from('placements')
          .select(`
            id, start_date,
            submission:submissions(
              candidate:candidates(first_name, last_name),
              job:jobs(title, company:companies!company_id(name))
            )
          `)
          .eq('org_id', orgId)
          .in('submission_id', subIds)
          .order('start_date', { ascending: false })
          .limit(3)

        placements?.forEach(p => {
          const subArray = p.submission as Array<{
            candidate: Array<{ first_name: string; last_name: string }> | null
            job: Array<{ title: string; company: Array<{ name: string }> | null }> | null
          }> | null
          const sub = subArray?.[0]
          const candidate = sub?.candidate?.[0]
          const job = sub?.job?.[0]
          const company = job?.company?.[0]
          if (candidate && job) {
            wins.push({
              type: 'placement',
              description: `Placed ${candidate.first_name} ${candidate.last_name} @ ${company?.name || 'Client'}`,
              date: p.start_date,
              entityType: 'placement',
              entityId: p.id,
            })
          }
        })
      }

      // Get recent offer acceptances
      const { data: offers } = await adminClient
        .from('submissions')
        .select(`
          id, updated_at,
          candidate:candidates(first_name, last_name),
          job:jobs(title, company:companies!company_id(name))
        `)
        .eq('org_id', orgId)
        .eq('submitted_by', user?.id)
        .eq('status', 'placed')
        .order('updated_at', { ascending: false })
        .limit(3)

      offers?.forEach(o => {
        const candidateArray = o.candidate as Array<{ first_name: string; last_name: string }> | null
        const candidate = candidateArray?.[0]
        const jobArray = o.job as Array<{ title: string; company: Array<{ name: string }> | null }> | null
        const job = jobArray?.[0]
        const company = job?.company?.[0]
        if (candidate && job) {
          wins.push({
            type: 'offer_accepted',
            description: `Offer accepted: ${candidate.first_name} ${candidate.last_name} @ ${company?.name || 'Client'}`,
            date: o.updated_at,
            entityType: 'submission',
            entityId: o.id,
          })
        }
      })

      // Sort by date and limit
      wins.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      return wins.slice(0, input.limit)
    }),

  // ============================================
  // DASHBOARD SETTINGS
  // ============================================
  getSettings: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { data } = await adminClient
        .from('user_dashboard_settings')
        .select('*')
        .eq('user_id', user?.id)
        .eq('org_id', orgId)
        .single()

      // Default settings if not found
      return data ?? {
        widgetOrder: [
          'sprint_progress',
          'todays_priorities',
          'pipeline_health',
          'account_portfolio',
          'activity_summary',
          'quality_metrics',
          'upcoming_calendar',
          'recent_wins',
        ],
        hiddenWidgets: [],
        refreshFrequency: 'every_5_min',
      }
    }),

  saveSettings: orgProtectedProcedure
    .input(z.object({
      widgetOrder: z.array(z.string()),
      hiddenWidgets: z.array(z.string()),
      refreshFrequency: z.enum(['real_time', 'every_5_min', 'every_15_min', 'manual']),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const { error } = await supabase
        .from('user_dashboard_settings')
        .upsert({
          user_id: user?.id,
          org_id: orgId,
          widget_order: input.widgetOrder,
          hidden_widgets: input.hiddenWidgets,
          refresh_frequency: input.refreshFrequency,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,org_id',
        })

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),
})
