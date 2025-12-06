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
// REPORTS ROUTER - Recruiter Reports (H04)
// ============================================

const ReportPeriodSchema = z.enum([
  'this_sprint',
  'last_sprint',
  'this_month',
  'last_month',
  'this_quarter',
  'last_quarter',
  'ytd',
  'custom',
])

const ReportTypeSchema = z.enum([
  'performance_summary',
  'revenue_commission',
  'activity_report',
  'quality_metrics',
  'account_portfolio',
  'pipeline_analysis',
])

export const reportsRouter = router({
  // ============================================
  // GENERATE REPORT
  // ============================================
  generate: orgProtectedProcedure
    .input(z.object({
      reportType: ReportTypeSchema,
      period: ReportPeriodSchema,
      customDateRange: z.object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
      }).optional(),
      compareToPrevoiusPeriod: z.boolean().default(false),
      includeCharts: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Calculate date range
      const now = new Date()
      let startDate: Date
      let endDate: Date = now

      switch (input.period) {
        case 'this_sprint':
          startDate = new Date(now)
          startDate.setDate(startDate.getDate() - (now.getDay() + 7) % 14)
          startDate.setHours(0, 0, 0, 0)
          endDate = new Date(startDate)
          endDate.setDate(endDate.getDate() + 14)
          break
        case 'last_sprint':
          endDate = new Date(now)
          endDate.setDate(endDate.getDate() - (now.getDay() + 7) % 14)
          endDate.setHours(0, 0, 0, 0)
          startDate = new Date(endDate)
          startDate.setDate(startDate.getDate() - 14)
          break
        case 'this_month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          break
        case 'last_month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          endDate = new Date(now.getFullYear(), now.getMonth(), 0)
          break
        case 'this_quarter':
          const currentQuarter = Math.floor(now.getMonth() / 3)
          startDate = new Date(now.getFullYear(), currentQuarter * 3, 1)
          endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0)
          break
        case 'last_quarter':
          const lastQuarter = Math.floor(now.getMonth() / 3) - 1
          const year = lastQuarter < 0 ? now.getFullYear() - 1 : now.getFullYear()
          const adjustedQuarter = lastQuarter < 0 ? 3 : lastQuarter
          startDate = new Date(year, adjustedQuarter * 3, 1)
          endDate = new Date(year, (adjustedQuarter + 1) * 3, 0)
          break
        case 'ytd':
          startDate = new Date(now.getFullYear(), 0, 1)
          break
        case 'custom':
          if (!input.customDateRange) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Custom date range required' })
          }
          startDate = input.customDateRange.startDate
          endDate = input.customDateRange.endDate
          break
        default:
          startDate = new Date(now)
          startDate.setMonth(startDate.getMonth() - 1)
      }

      // Get submissions for this recruiter
      const { data: submissions } = await adminClient
        .from('submissions')
        .select('id, status, submitted_at, job:jobs(id, title, created_at, account:accounts(id, name))')
        .eq('org_id', orgId)
        .eq('submitted_by', user?.id)
        .gte('submitted_at', startDate.toISOString())
        .lte('submitted_at', endDate.toISOString())

      const submissionIds = submissions?.map(s => s.id) ?? []

      // Get placements
      const { data: placements } = await adminClient
        .from('placements')
        .select('id, status, billing_rate, hours_billed, start_date, submission_id')
        .eq('org_id', orgId)
        .in('submission_id', submissionIds.length > 0 ? submissionIds : ['00000000-0000-0000-0000-000000000000'])

      // Get activities
      const { data: activities } = await adminClient
        .from('activities')
        .select('id, activity_type, status, entity_type, created_at, completed_at')
        .eq('org_id', orgId)
        .eq('assigned_to', user?.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      // Get candidates sourced
      const { data: candidates } = await adminClient
        .from('candidates')
        .select('id, status, created_at')
        .eq('org_id', orgId)
        .eq('sourced_by', user?.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      // Get interviews
      const { data: interviews } = await adminClient
        .from('interviews')
        .select('id, status, scheduled_at')
        .eq('org_id', orgId)
        .in('submission_id', submissionIds.length > 0 ? submissionIds : ['00000000-0000-0000-0000-000000000000'])

      // Calculate metrics
      const totalSubmissions = submissions?.length ?? 0
      const totalPlacements = placements?.filter(p =>
        new Date(p.start_date) >= startDate && new Date(p.start_date) <= endDate
      ).length ?? 0
      const totalRevenue = placements
        ?.filter(p => new Date(p.start_date) >= startDate && new Date(p.start_date) <= endDate)
        .reduce((sum, p) => sum + ((p.billing_rate || 0) * (p.hours_billed || 0)), 0) ?? 0

      // Activity breakdown
      const activityBreakdown = activities?.reduce((acc, a) => {
        acc[a.activity_type] = (acc[a.activity_type] || 0) + 1
        return acc
      }, {} as Record<string, number>) ?? {}

      // Submission status breakdown
      const submissionBreakdown = submissions?.reduce((acc, s) => {
        acc[s.status] = (acc[s.status] || 0) + 1
        return acc
      }, {} as Record<string, number>) ?? {}

      // Quality metrics
      const interviewedSubmissions = submissions?.filter(s =>
        ['interviewing', 'offered', 'placed'].includes(s.status)
      ).length ?? 0
      const submissionToInterviewRate = totalSubmissions > 0
        ? Math.round((interviewedSubmissions / totalSubmissions) * 100)
        : 0

      // Period label
      const periodLabel = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`

      // Build report
      const report = {
        id: crypto.randomUUID(),
        reportType: input.reportType,
        period: input.period,
        periodLabel,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        generatedAt: new Date().toISOString(),
        generatedBy: user?.id,

        // Summary metrics
        summary: {
          placements: totalPlacements,
          revenue: totalRevenue,
          submissions: totalSubmissions,
          interviews: interviews?.length ?? 0,
          candidatesSourced: candidates?.length ?? 0,
          activitiesLogged: activities?.length ?? 0,
        },

        // Detailed breakdowns
        activityBreakdown,
        submissionBreakdown,

        // Quality
        qualityMetrics: {
          submissionToInterviewRate,
          interviewedSubmissions,
        },

        // Raw data for charts
        chartData: input.includeCharts ? {
          submissionsByDay: groupByDay(submissions ?? [], 'submitted_at', startDate, endDate),
          activitiesByDay: groupByDay(activities ?? [], 'created_at', startDate, endDate),
        } : undefined,
      }

      // Save report to database
      await adminClient.from('saved_reports').insert({
        org_id: orgId,
        user_id: user?.id,
        report_type: input.reportType,
        period: input.period,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        report_data: report,
      })

      // Audit log
      await adminClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        action: 'report_generated',
        table_name: 'saved_reports',
        new_values: { report_type: input.reportType, period: input.period },
      })

      return report
    }),

  // ============================================
  // GET SAVED REPORTS
  // ============================================
  getSaved: orgProtectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('saved_reports')
        .select('id, report_type, period, start_date, end_date, created_at')
        .eq('org_id', orgId)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(input.limit)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data ?? []
    }),

  // ============================================
  // GET REPORT BY ID
  // ============================================
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('saved_reports')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .eq('user_id', user?.id)
        .single()

      if (error) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Report not found' })
      }

      return data
    }),

  // ============================================
  // PERFORMANCE SUMMARY REPORT
  // ============================================
  getPerformanceSummary: orgProtectedProcedure
    .input(z.object({
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
      compareToPrevoius: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { startDate, endDate } = input

      // Current period data
      const current = await getPerformanceData(adminClient, orgId, user?.id, startDate, endDate)

      // Previous period data (for comparison)
      let previous = null
      if (input.compareToPrevoius) {
        const periodLength = endDate.getTime() - startDate.getTime()
        const prevEndDate = new Date(startDate.getTime() - 1)
        const prevStartDate = new Date(prevEndDate.getTime() - periodLength)
        previous = await getPerformanceData(adminClient, orgId, user?.id, prevStartDate, prevEndDate)
      }

      return {
        current,
        previous,
        periodLabel: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      }
    }),

  // ============================================
  // ACCOUNT PORTFOLIO REPORT
  // ============================================
  getAccountPortfolio: orgProtectedProcedure
    .input(z.object({
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { data: accounts } = await adminClient
        .from('accounts')
        .select(`
          id, name, industry, status, last_contact_date, nps_score,
          jobs(id, status, recruiter_id),
          placements(id, billing_rate, hours_billed, start_date)
        `)
        .eq('org_id', orgId)
        .is('deleted_at', null)

      // Filter and enrich accounts for this recruiter
      const recruiterAccounts = accounts?.filter(a => {
        const jobs = a.jobs as Array<{ recruiter_id: string }> | null
        return jobs?.some(j => j.recruiter_id === user?.id)
      }).map(account => {
        const jobs = account.jobs as Array<{ id: string; status: string }> | null ?? []
        const placements = account.placements as Array<{ id: string; billing_rate: number; hours_billed: number; start_date: string }> | null ?? []

        // Filter placements in date range
        const periodPlacements = placements.filter(p =>
          new Date(p.start_date) >= input.startDate &&
          new Date(p.start_date) <= input.endDate
        )
        const periodRevenue = periodPlacements.reduce((sum, p) =>
          sum + ((p.billing_rate || 0) * (p.hours_billed || 0)), 0)

        // YTD revenue
        const ytdStart = new Date(new Date().getFullYear(), 0, 1)
        const ytdPlacements = placements.filter(p => new Date(p.start_date) >= ytdStart)
        const ytdRevenue = ytdPlacements.reduce((sum, p) =>
          sum + ((p.billing_rate || 0) * (p.hours_billed || 0)), 0)

        return {
          id: account.id,
          name: account.name,
          industry: account.industry,
          status: account.status,
          activeJobs: jobs.filter(j => j.status === 'active').length,
          totalJobs: jobs.length,
          periodRevenue,
          ytdRevenue,
          npsScore: account.nps_score,
          lastContactDate: account.last_contact_date,
        }
      }) ?? []

      // Calculate totals
      const summary = {
        totalAccounts: recruiterAccounts.length,
        totalRevenue: recruiterAccounts.reduce((sum, a) => sum + a.periodRevenue, 0),
        totalYtdRevenue: recruiterAccounts.reduce((sum, a) => sum + a.ytdRevenue, 0),
        averageNps: recruiterAccounts.length > 0
          ? recruiterAccounts.reduce((sum, a) => sum + (a.npsScore || 0), 0) / recruiterAccounts.length
          : 0,
      }

      return {
        accounts: recruiterAccounts.sort((a, b) => b.periodRevenue - a.periodRevenue),
        summary,
      }
    }),

  // ============================================
  // REPORT TEMPLATES
  // ============================================
  getTemplates: orgProtectedProcedure
    .query(() => {
      return [
        {
          id: 'performance_summary',
          name: 'Performance Summary',
          description: 'Complete overview of placements, revenue, and quality metrics',
          icon: '📈',
        },
        {
          id: 'revenue_commission',
          name: 'Revenue & Commission',
          description: 'Detailed revenue breakdown and commission calculations',
          icon: '💰',
        },
        {
          id: 'activity_report',
          name: 'Activity Report',
          description: 'Calls, emails, meetings, and sourcing activity breakdown',
          icon: '📋',
        },
        {
          id: 'quality_metrics',
          name: 'Quality Metrics',
          description: 'Time-to-fill, submission quality, and retention metrics',
          icon: '🎯',
        },
        {
          id: 'account_portfolio',
          name: 'Account Portfolio',
          description: 'Account health, revenue by account, and NPS scores',
          icon: '🏢',
        },
        {
          id: 'pipeline_analysis',
          name: 'Pipeline Analysis',
          description: 'Jobs, candidates, and submissions funnel analysis',
          icon: '📊',
        },
      ]
    }),

  // ============================================
  // DELETE SAVED REPORT
  // ============================================
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const { error } = await supabase
        .from('saved_reports')
        .delete()
        .eq('id', input.id)
        .eq('org_id', orgId)
        .eq('user_id', user?.id)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),
})

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getPerformanceData(
  adminClient: ReturnType<typeof getAdminClient>,
  orgId: string,
  userId: string | undefined,
  startDate: Date,
  endDate: Date
) {
  // Get submissions
  const { data: submissions } = await adminClient
    .from('submissions')
    .select('id, status, submitted_at')
    .eq('org_id', orgId)
    .eq('submitted_by', userId)
    .gte('submitted_at', startDate.toISOString())
    .lte('submitted_at', endDate.toISOString())

  const submissionIds = submissions?.map(s => s.id) ?? []

  // Get placements
  const { data: placements } = await adminClient
    .from('placements')
    .select('id, status, billing_rate, hours_billed, start_date')
    .eq('org_id', orgId)
    .in('submission_id', submissionIds.length > 0 ? submissionIds : ['00000000-0000-0000-0000-000000000000'])
    .gte('start_date', startDate.toISOString())
    .lte('start_date', endDate.toISOString())

  // Get activities
  const { data: activities } = await adminClient
    .from('activities')
    .select('id, activity_type, status')
    .eq('org_id', orgId)
    .eq('assigned_to', userId)
    .eq('status', 'completed')
    .gte('completed_at', startDate.toISOString())
    .lte('completed_at', endDate.toISOString())

  // Get candidates
  const { count: candidateCount } = await adminClient
    .from('candidates')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .eq('sourced_by', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // Get interviews
  const { count: interviewCount } = await adminClient
    .from('interviews')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .in('submission_id', submissionIds.length > 0 ? submissionIds : ['00000000-0000-0000-0000-000000000000'])
    .gte('scheduled_at', startDate.toISOString())
    .lte('scheduled_at', endDate.toISOString())

  const totalRevenue = placements?.reduce((sum, p) =>
    sum + ((p.billing_rate || 0) * (p.hours_billed || 0)), 0) ?? 0

  const activityBreakdown = activities?.reduce((acc, a) => {
    acc[a.activity_type] = (acc[a.activity_type] || 0) + 1
    return acc
  }, {} as Record<string, number>) ?? {}

  return {
    placements: placements?.length ?? 0,
    revenue: totalRevenue,
    submissions: submissions?.length ?? 0,
    interviews: interviewCount ?? 0,
    candidatesSourced: candidateCount ?? 0,
    activities: activities?.length ?? 0,
    activityBreakdown,
  }
}

function groupByDay(
  items: Array<{ [key: string]: unknown }>,
  dateField: string,
  startDate: Date,
  endDate: Date
) {
  const days: Record<string, number> = {}

  // Initialize all days in range
  const current = new Date(startDate)
  while (current <= endDate) {
    const key = current.toISOString().split('T')[0]
    days[key] = 0
    current.setDate(current.getDate() + 1)
  }

  // Count items per day
  items.forEach(item => {
    const date = item[dateField] as string
    if (date) {
      const key = new Date(date).toISOString().split('T')[0]
      if (days[key] !== undefined) {
        days[key]++
      }
    }
  })

  return Object.entries(days).map(([date, count]) => ({ date, count }))
}
