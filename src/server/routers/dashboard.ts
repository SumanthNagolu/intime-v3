import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'


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

  // ============================================
  // REVENUE OPERATIONS WIDGETS (WAVE 5)
  // ============================================

  // Timesheets Summary Widget
  getTimesheetsStats: orgProtectedProcedure.query(async ({ ctx }) => {
    const adminClient = getAdminClient()
    const { orgId } = ctx

    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 7)

    // Get timesheets pending approval
    const { count: pendingApproval } = await adminClient
      .from('timesheets')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'submitted')
      .is('deleted_at', null)

    // Get timesheets that are drafts (need to be submitted)
    const { count: drafts } = await adminClient
      .from('timesheets')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'draft')
      .is('deleted_at', null)

    // Get approved timesheets ready for invoicing
    const { count: readyToInvoice } = await adminClient
      .from('timesheets')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'approved')
      .is('invoice_id', null)
      .is('deleted_at', null)

    // Get approved timesheets ready for payroll
    const { count: readyForPayroll } = await adminClient
      .from('timesheets')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'approved')
      .is('payroll_run_id', null)
      .is('deleted_at', null)

    // Get total hours this week
    const { data: weekTimesheets } = await adminClient
      .from('timesheets')
      .select('total_regular_hours, total_overtime_hours, total_double_time_hours')
      .eq('org_id', orgId)
      .gte('period_start', startOfWeek.toISOString().split('T')[0])
      .lte('period_end', endOfWeek.toISOString().split('T')[0])
      .is('deleted_at', null)

    let hoursThisWeek = 0
    let overtimeHoursThisWeek = 0
    weekTimesheets?.forEach(ts => {
      hoursThisWeek += Number(ts.total_regular_hours || 0) +
        Number(ts.total_overtime_hours || 0) +
        Number(ts.total_double_time_hours || 0)
      overtimeHoursThisWeek += Number(ts.total_overtime_hours || 0) +
        Number(ts.total_double_time_hours || 0)
    })

    // Get billable and payable amounts ready
    const { data: readyTs } = await adminClient
      .from('timesheets')
      .select('total_billable_amount, total_payable_amount')
      .eq('org_id', orgId)
      .eq('status', 'approved')
      .is('deleted_at', null)

    let pendingBillableAmount = 0
    let pendingPayableAmount = 0
    readyTs?.forEach(ts => {
      pendingBillableAmount += Number(ts.total_billable_amount || 0)
      pendingPayableAmount += Number(ts.total_payable_amount || 0)
    })

    return {
      pendingApproval: pendingApproval ?? 0,
      drafts: drafts ?? 0,
      readyToInvoice: readyToInvoice ?? 0,
      readyForPayroll: readyForPayroll ?? 0,
      hoursThisWeek: Math.round(hoursThisWeek * 10) / 10,
      overtimeHoursThisWeek: Math.round(overtimeHoursThisWeek * 10) / 10,
      pendingBillableAmount,
      pendingPayableAmount,
    }
  }),

  // Invoices Summary Widget
  getInvoicesStats: orgProtectedProcedure.query(async ({ ctx }) => {
    const adminClient = getAdminClient()
    const { orgId } = ctx
    const today = new Date().toISOString().split('T')[0]

    // Get invoice counts by status
    const { data: invoices } = await adminClient
      .from('invoices')
      .select('status, balance_due, due_date, total_amount')
      .eq('org_id', orgId)
      .is('deleted_at', null)

    let draftCount = 0
    let pendingCount = 0
    let sentCount = 0
    let overdueCount = 0
    let paidCount = 0
    let outstandingBalance = 0
    let overdueAmount = 0
    let paidThisMonth = 0

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    invoices?.forEach(inv => {
      const balance = Number(inv.balance_due || 0)

      switch (inv.status) {
        case 'draft':
          draftCount++
          break
        case 'pending':
          pendingCount++
          outstandingBalance += balance
          break
        case 'sent':
          sentCount++
          outstandingBalance += balance
          if (inv.due_date && inv.due_date < today) {
            overdueCount++
            overdueAmount += balance
          }
          break
        case 'paid':
          paidCount++
          paidThisMonth += Number(inv.total_amount || 0)
          break
      }
    })

    // Get total revenue (paid invoices) this year
    const startOfYear = `${new Date().getFullYear()}-01-01`
    const { data: paidInvoices } = await adminClient
      .from('invoices')
      .select('total_amount, paid_date')
      .eq('org_id', orgId)
      .eq('status', 'paid')
      .gte('paid_date', startOfYear)
      .is('deleted_at', null)

    const ytdRevenue = paidInvoices?.reduce(
      (sum, inv) => sum + Number(inv.total_amount || 0),
      0
    ) ?? 0

    // Average days to pay
    const { data: recentPaid } = await adminClient
      .from('invoices')
      .select('invoice_date, paid_date')
      .eq('org_id', orgId)
      .eq('status', 'paid')
      .not('paid_date', 'is', null)
      .order('paid_date', { ascending: false })
      .limit(20)

    let avgDaysToPay = 0
    if (recentPaid && recentPaid.length > 0) {
      const daysToPay = recentPaid.map(inv => {
        const invoiceDate = new Date(inv.invoice_date)
        const paidDate = new Date(inv.paid_date!)
        return Math.max(0, Math.floor((paidDate.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24)))
      })
      avgDaysToPay = Math.round(daysToPay.reduce((a, b) => a + b, 0) / daysToPay.length)
    }

    return {
      draftCount,
      pendingCount,
      sentCount,
      overdueCount,
      paidCount,
      outstandingBalance,
      overdueAmount,
      paidThisMonth,
      ytdRevenue,
      avgDaysToPay,
    }
  }),

  // ============================================
  // DESKTOP DATA - CONSOLIDATED (ONE DB CALL)
  // ============================================
  getDesktopData: orgProtectedProcedure
    .input(z.object({
      activityFilters: z.object({
        activityType: z.enum(['email', 'call', 'meeting', 'note', 'linkedin_message', 'task', 'follow_up']).optional(),
        status: z.enum(['scheduled', 'open', 'in_progress', 'completed', 'skipped', 'canceled']).optional(),
        filterOverdue: z.boolean().optional(),
        filterDueToday: z.boolean().optional(),
      }).optional(),
      accountFilters: z.object({
        search: z.string().optional(),
        status: z.enum(['active', 'inactive', 'prospect', 'all']).optional(),
      }).optional(),
      jobFilters: z.object({
        search: z.string().optional(),
        status: z.enum(['draft', 'open', 'active', 'on_hold', 'filled', 'cancelled', 'all']).optional(),
      }).optional(),
      submissionFilters: z.object({
        search: z.string().optional(),
        status: z.enum(['active', 'all', 'submitted', 'reviewing', 'interviewing', 'offered', 'placed', 'rejected']).optional(),
      }).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()
      const userId = user?.id

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const startOfWeek = new Date(now)
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(endOfWeek.getDate() + 7)

      // Build activity query with filters
      let activitiesQuery = adminClient
        .from('activities')
        .select(`
          id, subject, description, activity_type, status, priority, due_date,
          entity_type, entity_id, created_at, completed_at,
          poc:contacts!poc_id(id, first_name, last_name),
          company:companies!entity_id(id, name)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .eq('assigned_to', userId)
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('priority', { ascending: false })
        .limit(50)

      // Apply activity filters
      if (input?.activityFilters?.activityType) {
        activitiesQuery = activitiesQuery.eq('activity_type', input.activityFilters.activityType)
      }
      if (input?.activityFilters?.status) {
        activitiesQuery = activitiesQuery.eq('status', input.activityFilters.status)
      } else {
        activitiesQuery = activitiesQuery.in('status', ['scheduled', 'open', 'in_progress'])
      }
      if (input?.activityFilters?.filterOverdue) {
        activitiesQuery = activitiesQuery.lt('due_date', today.toISOString())
      }
      if (input?.activityFilters?.filterDueToday) {
        activitiesQuery = activitiesQuery.gte('due_date', today.toISOString()).lt('due_date', tomorrow.toISOString())
      }

      // Build accounts query with filters
      let accountsQuery = adminClient
        .from('companies')
        .select('id, name, industry, segment, status, city, state, last_contacted_date', { count: 'exact' })
        .eq('org_id', orgId)
        .in('category', ['client', 'prospect'])
        .eq('owner_id', userId)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(50)

      if (input?.accountFilters?.search) {
        accountsQuery = accountsQuery.ilike('name', `%${input.accountFilters.search}%`)
      }
      if (input?.accountFilters?.status && input.accountFilters.status !== 'all') {
        accountsQuery = accountsQuery.eq('status', input.accountFilters.status)
      }

      // Build jobs query with filters
      let jobsQuery = adminClient
        .from('jobs')
        .select(`
          id, title, location, job_type, status, created_at,
          company:companies!company_id(id, name),
          submissions:submissions(id)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .eq('recruiter_id', userId)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(50)

      if (input?.jobFilters?.search) {
        jobsQuery = jobsQuery.ilike('title', `%${input.jobFilters.search}%`)
      }
      if (input?.jobFilters?.status && input.jobFilters.status !== 'all') {
        jobsQuery = jobsQuery.eq('status', input.jobFilters.status)
      } else {
        jobsQuery = jobsQuery.eq('status', 'active')
      }

      // Build submissions query with filters
      const activeStatuses = ['submitted', 'reviewing', 'shortlisted', 'interviewing', 'offered']
      let submissionsQuery = adminClient
        .from('submissions')
        .select(`
          id, status, submitted_at, updated_at,
          candidate:candidates!candidate_id(id, first_name, last_name, title),
          job:jobs!job_id(id, title, company:companies!company_id(id, name))
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .eq('submitted_by', userId)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(100)

      if (input?.submissionFilters?.status === 'active') {
        submissionsQuery = submissionsQuery.in('status', activeStatuses)
      } else if (input?.submissionFilters?.status && input.submissionFilters.status !== 'all') {
        submissionsQuery = submissionsQuery.eq('status', input.submissionFilters.status)
      }

      // Execute all queries in parallel (this is ONE database call via Promise.all)
      const [
        prioritiesResult,
        pipelineResult,
        activitiesResult,
        accountsResult,
        accountHealthResult,
        jobsResult,
        submissionsResult,
      ] = await Promise.all([
        // Today's priorities (for MySummary)
        adminClient
          .from('activities')
          .select('id, subject, activity_type, status, priority, due_date, entity_type, entity_id')
          .eq('org_id', orgId)
          .eq('assigned_to', userId)
          .in('status', ['scheduled', 'open', 'in_progress'])
          .order('due_date', { ascending: true })
          .limit(100),

        // Pipeline health (for MySummary)
        (async () => {
          const [activeJobsResult, urgentJobsResult, pendingSubsResult, interviewsResult, offersResult, placementsResult] = await Promise.all([
            adminClient.from('jobs').select('id', { count: 'exact', head: true }).eq('org_id', orgId).eq('recruiter_id', userId).eq('status', 'active'),
            adminClient.from('jobs').select('id', { count: 'exact', head: true }).eq('org_id', orgId).eq('recruiter_id', userId).eq('status', 'active').in('priority', ['urgent', 'high']),
            adminClient.from('submissions').select('id', { count: 'exact', head: true }).eq('org_id', orgId).eq('submitted_by', userId).eq('status', 'submitted'),
            adminClient.from('interviews').select('id, submission:submissions!submission_id(submitted_by)', { count: 'exact' }).eq('org_id', orgId).gte('scheduled_at', startOfWeek.toISOString()).lt('scheduled_at', endOfWeek.toISOString()),
            adminClient.from('submissions').select('id', { count: 'exact', head: true }).eq('org_id', orgId).eq('submitted_by', userId).eq('status', 'offered'),
            adminClient.from('placements').select('id, submission:submissions!submission_id(submitted_by)', { count: 'exact' }).eq('org_id', orgId).eq('status', 'active'),
          ])

          // Filter interviews and placements by user
          const userInterviews = interviewsResult.data?.filter(i => {
            const sub = i.submission as Array<{ submitted_by: string }> | null
            return sub?.[0]?.submitted_by === userId
          }).length ?? 0

          return {
            activeJobs: activeJobsResult.count ?? 0,
            urgentJobs: urgentJobsResult.count ?? 0,
            pendingSubmissions: pendingSubsResult.count ?? 0,
            interviewsThisWeek: userInterviews,
            outstandingOffers: offersResult.count ?? 0,
            activePlacements: placementsResult.count ?? 0,
          }
        })(),

        // Activities table data
        activitiesQuery,

        // Accounts table data
        accountsQuery,

        // Account health data
        adminClient
          .from('companies')
          .select('id, status, last_contacted_date')
          .eq('org_id', orgId)
          .in('category', ['client', 'prospect'])
          .eq('owner_id', userId)
          .is('deleted_at', null),

        // Jobs table data
        jobsQuery,

        // Submissions table data
        submissionsQuery,
      ])

      // Process priorities for MySummary
      const overdue: typeof prioritiesResult.data = []
      const dueToday: typeof prioritiesResult.data = []

      prioritiesResult.data?.forEach(task => {
        const dueDate = task.due_date ? new Date(task.due_date) : null
        if (dueDate && dueDate < today) {
          overdue.push(task)
        } else if (dueDate && dueDate >= today && dueDate < tomorrow) {
          dueToday.push(task)
        }
      })

      // Calculate account health scores
      const accountHealthMap = new Map<string, { healthStatus: string; healthScore: number; activeJobs: number }>()
      accountHealthResult.data?.forEach(acc => {
        const daysSinceContact = acc.last_contacted_date
          ? Math.floor((now.getTime() - new Date(acc.last_contacted_date).getTime()) / (1000 * 60 * 60 * 24))
          : 999

        let healthStatus = 'healthy'
        let healthScore = 100
        if (daysSinceContact > 30) {
          healthStatus = 'at_risk'
          healthScore = Math.max(0, 100 - Math.min(50, daysSinceContact - 30))
        } else if (daysSinceContact > 14) {
          healthStatus = 'attention'
          healthScore = 80
        }

        accountHealthMap.set(acc.id, { healthStatus, healthScore, activeJobs: 0 })
      })

      // Count active jobs per account
      jobsResult.data?.forEach(job => {
        const company = job.company as Array<{ id: string }> | null
        const companyId = company?.[0]?.id
        if (companyId && accountHealthMap.has(companyId)) {
          const health = accountHealthMap.get(companyId)!
          health.activeJobs++
        }
      })

      // Transform activities for the table
      const activitiesData = activitiesResult.data?.map(a => {
        const dueDate = a.due_date ? new Date(a.due_date) : null
        let accountName: string | null = null
        if ((a.entity_type === 'account' || a.entity_type === 'company') && a.company) {
          const companyArray = a.company as Array<{ id: string; name: string }> | null
          accountName = companyArray?.[0]?.name ?? null
        }

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
          accountName,
          contact: (() => {
            const pocArray = a.poc as Array<{ id: string; first_name: string; last_name: string }> | null
            const poc = pocArray?.[0]
            return poc ? { id: poc.id, name: `${poc.first_name} ${poc.last_name}` } : null
          })(),
          isOverdue: dueDate ? dueDate < today : false,
          isDueToday: dueDate ? dueDate >= today && dueDate < tomorrow : false,
          createdAt: a.created_at,
          completedAt: a.completed_at,
        }
      }) ?? []

      // Transform accounts for the table
      const accountsData = accountsResult.data?.map(acc => ({
        id: acc.id,
        name: acc.name,
        industry: acc.industry,
        status: acc.status || 'prospect',
        city: acc.city,
        state: acc.state,
        lastContactDate: acc.last_contacted_date,
        health: accountHealthMap.get(acc.id),
      })) ?? []

      // Transform jobs for the table
      const jobsData = jobsResult.data?.map(job => {
        const company = job.company as Array<{ id: string; name: string }> | null
        const submissions = job.submissions as Array<{ id: string }> | null
        return {
          id: job.id,
          title: job.title,
          location: job.location,
          job_type: job.job_type,
          status: job.status,
          createdAt: job.created_at,
          account: company?.[0] ? { id: company[0].id, name: company[0].name } : null,
          submissions_count: submissions?.length ?? 0,
        }
      }) ?? []

      // Transform submissions for the table
      const submissionsData = submissionsResult.data?.map(sub => {
        const candidate = sub.candidate as Array<{ id: string; first_name: string; last_name: string; title: string | null }> | null
        const job = sub.job as Array<{ id: string; title: string; company: Array<{ id: string; name: string }> | null }> | null
        return {
          id: sub.id,
          status: sub.status,
          submitted_at: sub.submitted_at,
          updated_at: sub.updated_at,
          candidate: candidate?.[0] ? {
            id: candidate[0].id,
            first_name: candidate[0].first_name,
            last_name: candidate[0].last_name,
            title: candidate[0].title,
          } : null,
          job: job?.[0] ? {
            id: job[0].id,
            title: job[0].title,
            company: job[0].company?.[0] ?? null,
          } : null,
        }
      }) ?? []

      return {
        summary: {
          priorities: {
            counts: {
              overdue: overdue.length,
              dueToday: dueToday.length,
              total: prioritiesResult.data?.length ?? 0,
            },
          },
          pipeline: pipelineResult,
        },
        tables: {
          activities: {
            items: activitiesData,
            total: activitiesResult.count ?? 0,
          },
          accounts: {
            items: accountsData,
            total: accountsResult.count ?? 0,
          },
          jobs: {
            items: jobsData,
            total: jobsResult.count ?? 0,
          },
          submissions: {
            items: submissionsData,
            total: submissionsResult.count ?? 0,
          },
        },
      }
    }),

  // ============================================
  // TODAY DATA - CONSOLIDATED (ONE DB CALL)
  // Returns all tasks with counts, client filters locally
  // ============================================
  getTodayData: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()
      const userId = user?.id

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const endOfWeek = new Date(today)
      endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()))

      // Fetch all tasks and count queries in parallel
      const [allResult, overdueCount, todayCount, weekCount] = await Promise.all([
        // Get all pending tasks (with all data for client-side filtering)
        adminClient
          .from('activities')
          .select('id, subject, description, activity_type, status, priority, due_date, entity_type, entity_id', { count: 'exact' })
          .eq('org_id', orgId)
          .eq('assigned_to', userId)
          .in('status', ['scheduled', 'open', 'in_progress'])
          .order('due_date', { ascending: true })
          .order('priority', { ascending: false })
          .limit(200),

        // Count overdue tasks
        adminClient
          .from('activities')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('assigned_to', userId)
          .in('status', ['scheduled', 'open', 'in_progress'])
          .lt('due_date', today.toISOString()),

        // Count today's tasks
        adminClient
          .from('activities')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('assigned_to', userId)
          .in('status', ['scheduled', 'open', 'in_progress'])
          .gte('due_date', today.toISOString())
          .lt('due_date', tomorrow.toISOString()),

        // Count this week's tasks
        adminClient
          .from('activities')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('assigned_to', userId)
          .in('status', ['scheduled', 'open', 'in_progress'])
          .gte('due_date', today.toISOString())
          .lt('due_date', endOfWeek.toISOString()),
      ])

      // Transform tasks with computed flags for client-side filtering
      const tasks = allResult.data?.map(task => ({
        id: task.id,
        subject: task.subject,
        activityType: task.activity_type,
        entityType: task.entity_type,
        entityId: task.entity_id,
        status: task.status,
        priority: task.priority,
        dueDate: task.due_date,
        isOverdue: task.due_date ? new Date(task.due_date) < today : false,
        isDueToday: task.due_date ? new Date(task.due_date) >= today && new Date(task.due_date) < tomorrow : false,
        isThisWeek: task.due_date ? new Date(task.due_date) >= today && new Date(task.due_date) < endOfWeek : false,
      })) ?? []

      return {
        counts: {
          overdue: overdueCount.count ?? 0,
          today: todayCount.count ?? 0,
          thisWeek: weekCount.count ?? 0,
          all: allResult.count ?? 0,
        },
        tasks,
      }
    }),

  // Payroll Summary Widget
  getPayrollStats: orgProtectedProcedure.query(async ({ ctx }) => {
    const adminClient = getAdminClient()
    const { orgId } = ctx
    const today = new Date().toISOString().split('T')[0]

    // Get pay run counts by status
    const { data: payRuns } = await adminClient
      .from('pay_runs')
      .select('status, total_gross, total_net, check_date')
      .eq('org_id', orgId)
      .is('deleted_at', null)

    let draftCount = 0
    let pendingApprovalCount = 0
    let approvedCount = 0
    let completedCount = 0
    let pendingAmount = 0

    payRuns?.forEach(run => {
      switch (run.status) {
        case 'draft':
        case 'calculating':
          draftCount++
          pendingAmount += Number(run.total_gross || 0)
          break
        case 'pending_approval':
          pendingApprovalCount++
          pendingAmount += Number(run.total_gross || 0)
          break
        case 'approved':
          approvedCount++
          pendingAmount += Number(run.total_gross || 0)
          break
        case 'completed':
          completedCount++
          break
      }
    })

    // Get current pay period
    const { data: currentPeriod } = await adminClient
      .from('pay_periods')
      .select('id, period_start, period_end, pay_date, period_type')
      .eq('org_id', orgId)
      .lte('period_start', today)
      .gte('period_end', today)
      .single()

    // Get next pay date
    const { data: nextPeriod } = await adminClient
      .from('pay_periods')
      .select('pay_date')
      .eq('org_id', orgId)
      .gt('pay_date', today)
      .order('pay_date', { ascending: true })
      .limit(1)
      .single()

    // Get YTD totals
    const startOfYear = `${new Date().getFullYear()}-01-01`
    const { data: completedRuns } = await adminClient
      .from('pay_runs')
      .select('total_gross, total_net, total_employee_taxes, total_employer_taxes')
      .eq('org_id', orgId)
      .eq('status', 'completed')
      .gte('check_date', startOfYear)
      .is('deleted_at', null)

    let ytdGross = 0
    let ytdNet = 0
    let ytdTaxes = 0
    completedRuns?.forEach(run => {
      ytdGross += Number(run.total_gross || 0)
      ytdNet += Number(run.total_net || 0)
      ytdTaxes += Number(run.total_employee_taxes || 0) + Number(run.total_employer_taxes || 0)
    })

    // Get timesheets ready for payroll
    const { count: timesheetsReady } = await adminClient
      .from('timesheets')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'approved')
      .is('payroll_run_id', null)
      .is('deleted_at', null)

    return {
      draftCount,
      pendingApprovalCount,
      approvedCount,
      completedCount,
      pendingAmount,
      currentPeriod: currentPeriod ? {
        id: currentPeriod.id,
        periodStart: currentPeriod.period_start,
        periodEnd: currentPeriod.period_end,
        payDate: currentPeriod.pay_date,
        periodType: currentPeriod.period_type,
      } : null,
      nextPayDate: nextPeriod?.pay_date || null,
      ytdGross,
      ytdNet,
      ytdTaxes,
      timesheetsReady: timesheetsReady ?? 0,
    }
  }),
})
