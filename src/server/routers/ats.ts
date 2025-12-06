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
// ATS ROUTER - Jobs, Submissions, Interviews, Placements, Candidates
// ============================================

export const atsRouter = router({
  // ============================================
  // JOBS
  // ============================================
  jobs: router({
    // List jobs with filtering
    list: orgProtectedProcedure
      .input(z.object({
        search: z.string().optional(),
        status: z.enum(['draft', 'active', 'on_hold', 'filled', 'cancelled', 'all']).default('all'),
        accountId: z.string().uuid().optional(),
        recruiterId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('jobs')
          .select(`
            *,
            account:accounts(id, name),
            recruiter:user_profiles!recruiter_id(id, full_name),
            submissions(id, status)
          `, { count: 'exact' })
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })

        if (input.search) {
          query = query.or(`title.ilike.%${input.search}%,description.ilike.%${input.search}%`)
        }
        if (input.status && input.status !== 'all') {
          query = query.eq('status', input.status)
        }
        if (input.accountId) {
          query = query.eq('account_id', input.accountId)
        }
        if (input.recruiterId) {
          query = query.eq('recruiter_id', input.recruiterId)
        }

        query = query.range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data?.map(j => ({
            id: j.id,
            title: j.title,
            status: j.status,
            jobType: j.job_type,
            location: j.location,
            billingRate: j.billing_rate,
            account: j.account,
            recruiter: j.recruiter,
            submissionCount: (j.submissions as Array<{ status: string }> | null)?.length ?? 0,
            createdAt: j.created_at,
          })) ?? [],
          total: count ?? 0,
        }
      }),

    // Get job by ID
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('jobs')
          .select(`
            *,
            account:accounts(id, name, industry),
            recruiter:user_profiles!recruiter_id(id, full_name, avatar_url),
            submissions(id, status, candidate:candidates(id, first_name, last_name))
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (error) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' })
        }

        return data
      }),

    // Get job pipeline stats
    getStats: orgProtectedProcedure
      .input(z.object({
        recruiterId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const recruiterId = input.recruiterId || user?.id

        // Count jobs by status
        const { data: jobs } = await adminClient
          .from('jobs')
          .select('id, status, created_at')
          .eq('org_id', orgId)
          .eq('recruiter_id', recruiterId)
          .is('deleted_at', null)

        const byStatus: Record<string, number> = {}
        jobs?.forEach(j => {
          byStatus[j.status] = (byStatus[j.status] || 0) + 1
        })

        // Count urgent jobs (active and > 14 days old)
        const twoWeeksAgo = new Date()
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
        const urgentJobs = jobs?.filter(j =>
          j.status === 'active' &&
          new Date(j.created_at) < twoWeeksAgo
        ).length ?? 0

        return {
          total: jobs?.length ?? 0,
          active: byStatus['active'] ?? 0,
          onHold: byStatus['on_hold'] ?? 0,
          filled: byStatus['filled'] ?? 0,
          cancelled: byStatus['cancelled'] ?? 0,
          urgentJobs,
        }
      }),

    // Get my active jobs (for recruiter)
    getMy: orgProtectedProcedure
      .input(z.object({
        status: z.enum(['active', 'on_hold', 'all']).default('active'),
        limit: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('jobs')
          .select(`
            id, title, status, job_type, location, billing_rate, created_at,
            account:accounts(id, name),
            submissions(id, status)
          `)
          .eq('org_id', orgId)
          .eq('recruiter_id', user?.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(input.limit)

        if (input.status !== 'all') {
          query = query.eq('status', input.status)
        } else {
          query = query.in('status', ['active', 'on_hold'])
        }

        const { data, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data?.map(j => ({
          id: j.id,
          title: j.title,
          status: j.status,
          jobType: j.job_type,
          location: j.location,
          billingRate: j.billing_rate,
          account: j.account,
          submissionCount: (j.submissions as Array<{ status: string }> | null)?.length ?? 0,
          activeSubmissions: (j.submissions as Array<{ status: string }> | null)?.filter(s =>
            ['submitted', 'interviewing', 'offered'].includes(s.status)
          ).length ?? 0,
          createdAt: j.created_at,
        })) ?? []
      }),
  }),

  // ============================================
  // SUBMISSIONS
  // ============================================
  submissions: router({
    // List submissions with filtering
    list: orgProtectedProcedure
      .input(z.object({
        jobId: z.string().uuid().optional(),
        candidateId: z.string().uuid().optional(),
        status: z.string().optional(),
        recruiterId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('submissions')
          .select(`
            *,
            job:jobs(id, title, account:accounts(id, name)),
            candidate:candidates(id, first_name, last_name, email),
            submitted_by:user_profiles!submitted_by(id, full_name)
          `, { count: 'exact' })
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .order('submitted_at', { ascending: false })

        if (input.jobId) {
          query = query.eq('job_id', input.jobId)
        }
        if (input.candidateId) {
          query = query.eq('candidate_id', input.candidateId)
        }
        if (input.status) {
          query = query.eq('status', input.status)
        }
        if (input.recruiterId) {
          query = query.eq('submitted_by', input.recruiterId)
        }

        query = query.range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data ?? [],
          total: count ?? 0,
        }
      }),

    // Get submission by ID
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('submissions')
          .select(`
            *,
            job:jobs(*),
            candidate:candidates(*),
            interviews(*)
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (error) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Submission not found' })
        }

        return data
      }),

    // Get submission stats
    getStats: orgProtectedProcedure
      .input(z.object({
        recruiterId: z.string().uuid().optional(),
        period: z.enum(['week', 'month', 'sprint', 'all']).default('month'),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const recruiterId = input.recruiterId || user?.id

        let startDate: Date | null = null
        const now = new Date()

        if (input.period === 'week') {
          startDate = new Date(now)
          startDate.setDate(startDate.getDate() - 7)
        } else if (input.period === 'month') {
          startDate = new Date(now)
          startDate.setMonth(startDate.getMonth() - 1)
        } else if (input.period === 'sprint') {
          startDate = new Date(now)
          startDate.setDate(startDate.getDate() - 14)
        }

        let query = adminClient
          .from('submissions')
          .select('id, status, submitted_at')
          .eq('org_id', orgId)
          .eq('submitted_by', recruiterId)
          .is('deleted_at', null)

        if (startDate) {
          query = query.gte('submitted_at', startDate.toISOString())
        }

        const { data: submissions } = await query

        const byStatus: Record<string, number> = {}
        submissions?.forEach(s => {
          byStatus[s.status] = (byStatus[s.status] || 0) + 1
        })

        return {
          total: submissions?.length ?? 0,
          byStatus,
          pending: byStatus['submitted'] ?? 0,
          interviewing: byStatus['interviewing'] ?? 0,
          offered: byStatus['offered'] ?? 0,
          placed: byStatus['placed'] ?? 0,
          rejected: byStatus['rejected'] ?? 0,
        }
      }),

    // Get pending submissions (awaiting feedback)
    getPending: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('submissions')
          .select(`
            id, status, submitted_at, submission_rate,
            job:jobs(id, title, account:accounts(id, name)),
            candidate:candidates(id, first_name, last_name)
          `)
          .eq('org_id', orgId)
          .eq('submitted_by', user?.id)
          .eq('status', 'submitted')
          .is('deleted_at', null)
          .order('submitted_at', { ascending: true })
          .limit(input.limit)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data?.map(s => {
          const submittedAt = new Date(s.submitted_at)
          const now = new Date()
          const daysPending = Math.floor((now.getTime() - submittedAt.getTime()) / (1000 * 60 * 60 * 24))

          return {
            ...s,
            daysPending,
            isStale: daysPending > 3,
          }
        }) ?? []
      }),
  }),

  // ============================================
  // INTERVIEWS
  // ============================================
  interviews: router({
    // List interviews
    list: orgProtectedProcedure
      .input(z.object({
        submissionId: z.string().uuid().optional(),
        status: z.string().optional(),
        scheduledAfter: z.coerce.date().optional(),
        scheduledBefore: z.coerce.date().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('interviews')
          .select(`
            *,
            submission:submissions(
              id,
              job:jobs(id, title, account:accounts(id, name)),
              candidate:candidates(id, first_name, last_name)
            )
          `, { count: 'exact' })
          .eq('org_id', orgId)
          .order('scheduled_at', { ascending: true })

        if (input.submissionId) {
          query = query.eq('submission_id', input.submissionId)
        }
        if (input.status) {
          query = query.eq('status', input.status)
        }
        if (input.scheduledAfter) {
          query = query.gte('scheduled_at', input.scheduledAfter.toISOString())
        }
        if (input.scheduledBefore) {
          query = query.lt('scheduled_at', input.scheduledBefore.toISOString())
        }

        query = query.range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data ?? [],
          total: count ?? 0,
        }
      }),

    // Get upcoming interviews (for recruiter)
    getUpcoming: orgProtectedProcedure
      .input(z.object({
        days: z.number().min(1).max(30).default(7),
        limit: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const now = new Date()
        const endDate = new Date(now)
        endDate.setDate(endDate.getDate() + input.days)

        const { data, error } = await adminClient
          .from('interviews')
          .select(`
            id, scheduled_at, interview_type, duration_minutes, status, location,
            submission:submissions!inner(
              id, submitted_by,
              job:jobs(id, title, account:accounts(id, name)),
              candidate:candidates(id, first_name, last_name, phone, email)
            )
          `)
          .eq('org_id', orgId)
          .gte('scheduled_at', now.toISOString())
          .lt('scheduled_at', endDate.toISOString())
          .in('status', ['scheduled', 'confirmed'])
          .order('scheduled_at', { ascending: true })
          .limit(input.limit)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Filter for this recruiter's submissions
        const filteredData = data?.filter(i => {
          const submission = i.submission as { submitted_by: string } | null
          return submission?.submitted_by === user?.id
        }) ?? []

        return filteredData.map(i => ({
          id: i.id,
          scheduledAt: i.scheduled_at,
          interviewType: i.interview_type,
          durationMinutes: i.duration_minutes,
          status: i.status,
          location: i.location,
          submission: i.submission,
        }))
      }),

    // Get this week's interviews count
    getThisWeekCount: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const now = new Date()
        const startOfWeek = new Date(now)
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
        startOfWeek.setHours(0, 0, 0, 0)
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(endOfWeek.getDate() + 7)

        // First get submissions for this recruiter
        const { data: submissions } = await adminClient
          .from('submissions')
          .select('id')
          .eq('org_id', orgId)
          .eq('submitted_by', user?.id)

        const submissionIds = submissions?.map(s => s.id) ?? []

        if (submissionIds.length === 0) {
          return { total: 0, scheduled: 0, completed: 0 }
        }

        const { data: interviews } = await adminClient
          .from('interviews')
          .select('id, status')
          .eq('org_id', orgId)
          .in('submission_id', submissionIds)
          .gte('scheduled_at', startOfWeek.toISOString())
          .lt('scheduled_at', endOfWeek.toISOString())

        return {
          total: interviews?.length ?? 0,
          scheduled: interviews?.filter(i => i.status === 'scheduled' || i.status === 'confirmed').length ?? 0,
          completed: interviews?.filter(i => i.status === 'completed').length ?? 0,
        }
      }),
  }),

  // ============================================
  // PLACEMENTS
  // ============================================
  placements: router({
    // List placements
    list: orgProtectedProcedure
      .input(z.object({
        status: z.enum(['active', 'completed', 'terminated', 'all']).default('all'),
        recruiterId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('placements')
          .select(`
            *,
            submission:submissions(
              id,
              job:jobs(id, title, account:accounts(id, name)),
              candidate:candidates(id, first_name, last_name),
              submitted_by
            )
          `, { count: 'exact' })
          .eq('org_id', orgId)
          .order('start_date', { ascending: false })

        if (input.status !== 'all') {
          query = query.eq('status', input.status)
        }

        query = query.range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Filter by recruiter if specified
        let filteredData = data ?? []
        if (input.recruiterId) {
          filteredData = filteredData.filter(p => {
            const submission = p.submission as { submitted_by: string } | null
            return submission?.submitted_by === input.recruiterId
          })
        }

        return {
          items: filteredData,
          total: input.recruiterId ? filteredData.length : (count ?? 0),
        }
      }),

    // Get placement stats
    getStats: orgProtectedProcedure
      .input(z.object({
        recruiterId: z.string().uuid().optional(),
        period: z.enum(['week', 'month', 'sprint', 'quarter', 'year', 'all']).default('month'),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const recruiterId = input.recruiterId || user?.id

        let startDate: Date | null = null
        const now = new Date()

        if (input.period === 'week') {
          startDate = new Date(now)
          startDate.setDate(startDate.getDate() - 7)
        } else if (input.period === 'month') {
          startDate = new Date(now)
          startDate.setMonth(startDate.getMonth() - 1)
        } else if (input.period === 'sprint') {
          startDate = new Date(now)
          startDate.setDate(startDate.getDate() - 14)
        } else if (input.period === 'quarter') {
          startDate = new Date(now)
          startDate.setMonth(startDate.getMonth() - 3)
        } else if (input.period === 'year') {
          startDate = new Date(now.getFullYear(), 0, 1)
        }

        // Get submissions for this recruiter
        const { data: submissions } = await adminClient
          .from('submissions')
          .select('id')
          .eq('org_id', orgId)
          .eq('submitted_by', recruiterId)

        const submissionIds = submissions?.map(s => s.id) ?? []

        if (submissionIds.length === 0) {
          return { total: 0, active: 0, revenue: 0, avgBillingRate: 0 }
        }

        let query = adminClient
          .from('placements')
          .select('id, status, billing_rate, hours_billed, start_date')
          .eq('org_id', orgId)
          .in('submission_id', submissionIds)

        if (startDate) {
          query = query.gte('start_date', startDate.toISOString())
        }

        const { data: placements } = await query

        const total = placements?.length ?? 0
        const active = placements?.filter(p => p.status === 'active').length ?? 0
        const revenue = placements?.reduce((sum, p) =>
          sum + ((p.billing_rate || 0) * (p.hours_billed || 0)), 0) ?? 0
        const avgBillingRate = total > 0
          ? placements!.reduce((sum, p) => sum + (p.billing_rate || 0), 0) / total
          : 0

        return {
          total,
          active,
          completed: placements?.filter(p => p.status === 'completed').length ?? 0,
          revenue,
          avgBillingRate: Math.round(avgBillingRate * 100) / 100,
        }
      }),

    // Get active placements needing check-in
    getNeedingCheckIn: orgProtectedProcedure
      .input(z.object({
        daysSinceLastCheckIn: z.number().default(30),
        limit: z.number().min(1).max(20).default(10),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - input.daysSinceLastCheckIn)

        // Get submissions for this recruiter
        const { data: submissions } = await adminClient
          .from('submissions')
          .select('id')
          .eq('org_id', orgId)
          .eq('submitted_by', user?.id)

        const submissionIds = submissions?.map(s => s.id) ?? []

        if (submissionIds.length === 0) {
          return []
        }

        const { data, error } = await adminClient
          .from('placements')
          .select(`
            id, start_date, last_check_in_date, status,
            submission:submissions(
              id,
              job:jobs(id, title, account:accounts(id, name)),
              candidate:candidates(id, first_name, last_name)
            )
          `)
          .eq('org_id', orgId)
          .eq('status', 'active')
          .in('submission_id', submissionIds)
          .or(`last_check_in_date.is.null,last_check_in_date.lt.${cutoffDate.toISOString()}`)
          .order('last_check_in_date', { ascending: true, nullsFirst: true })
          .limit(input.limit)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),
  }),

  // ============================================
  // CANDIDATES
  // ============================================
  candidates: router({
    // Search candidates
    search: orgProtectedProcedure
      .input(z.object({
        query: z.string().min(1),
        status: z.string().optional(),
        skills: z.array(z.string()).optional(),
        limit: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('candidates')
          .select('id, first_name, last_name, email, phone, status, skills, title, location')
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .or(`first_name.ilike.%${input.query}%,last_name.ilike.%${input.query}%,email.ilike.%${input.query}%,skills.ilike.%${input.query}%`)
          .limit(input.limit)

        if (input.status) {
          query = query.eq('status', input.status)
        }

        const { data, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data?.map(c => ({
          id: c.id,
          name: `${c.first_name} ${c.last_name}`,
          email: c.email,
          phone: c.phone,
          status: c.status,
          skills: c.skills,
          title: c.title,
          location: c.location,
        })) ?? []
      }),

    // Get candidate by ID
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('candidates')
          .select('*, submissions(id, status, job:jobs(id, title))')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (error) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Candidate not found' })
        }

        return data
      }),

    // Get sourcing stats
    getSourcingStats: orgProtectedProcedure
      .input(z.object({
        period: z.enum(['week', 'month', 'sprint']).default('week'),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const now = new Date()
        let startDate: Date

        if (input.period === 'week') {
          startDate = new Date(now)
          startDate.setDate(startDate.getDate() - 7)
        } else if (input.period === 'month') {
          startDate = new Date(now)
          startDate.setMonth(startDate.getMonth() - 1)
        } else {
          startDate = new Date(now)
          startDate.setDate(startDate.getDate() - 14)
        }

        const { count } = await adminClient
          .from('candidates')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('sourced_by', user?.id)
          .gte('created_at', startDate.toISOString())

        return {
          count: count ?? 0,
          period: input.period,
        }
      }),
  }),
})
