import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

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

// ============================================
// HELPER: Calculate date range from period
// ============================================
function getDateRange(period: z.infer<typeof ReportPeriodSchema>, customRange?: { startDate: Date; endDate: Date }) {
  const now = new Date()
  let startDate: Date
  let endDate: Date = now

  switch (period) {
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
      if (!customRange) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Custom date range required' })
      }
      startDate = customRange.startDate
      endDate = customRange.endDate
      break
    default:
      startDate = new Date(now)
      startDate.setMonth(startDate.getMonth() - 1)
  }

  return { startDate, endDate }
}

// ============================================
// HELPER: Get previous period dates
// ============================================
function getPreviousPeriodDates(startDate: Date, endDate: Date) {
  const periodLength = endDate.getTime() - startDate.getTime()
  const prevEndDate = new Date(startDate.getTime() - 1)
  const prevStartDate = new Date(prevEndDate.getTime() - periodLength)
  return { prevStartDate, prevEndDate }
}

// ============================================
// HELPER: Calculate percentage change
// ============================================
function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

// ============================================
// HELPER: Group data by day for charts
// ============================================
function groupByDay(
  items: Array<{ [key: string]: unknown }>,
  dateField: string,
  startDate: Date,
  endDate: Date
) {
  const days: Record<string, number> = {}

  const current = new Date(startDate)
  while (current <= endDate) {
    const key = current.toISOString().split('T')[0]
    days[key] = 0
    current.setDate(current.getDate() + 1)
  }

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

// ============================================
// HELPER: Group data by week
// ============================================
function groupByWeek(
  items: Array<{ [key: string]: unknown }>,
  dateField: string,
  startDate: Date,
  endDate: Date
) {
  const weeks: Record<string, number> = {}

  const current = new Date(startDate)
  current.setDate(current.getDate() - current.getDay()) // Start of week

  while (current <= endDate) {
    const weekStart = current.toISOString().split('T')[0]
    weeks[weekStart] = 0
    current.setDate(current.getDate() + 7)
  }

  items.forEach(item => {
    const date = item[dateField] as string
    if (date) {
      const itemDate = new Date(date)
      itemDate.setDate(itemDate.getDate() - itemDate.getDay())
      const key = itemDate.toISOString().split('T')[0]
      if (weeks[key] !== undefined) {
        weeks[key]++
      }
    }
  })

  return Object.entries(weeks).map(([weekStart, count]) => ({
    week: weekStart,
    count,
    label: `Week of ${new Date(weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
  }))
}

export const reportsRouter = router({
  // ============================================
  // GENERATE REPORT (saves to database)
  // ============================================
  generate: orgProtectedProcedure
    .input(z.object({
      reportType: ReportTypeSchema,
      period: ReportPeriodSchema,
      customDateRange: z.object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
      }).optional(),
      compareToPreviousPeriod: z.boolean().default(false),
      includeCharts: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { startDate, endDate } = getDateRange(input.period, input.customDateRange)

      // Get report data based on type
      let reportData: Record<string, unknown>

      switch (input.reportType) {
        case 'performance_summary':
          reportData = await generatePerformanceSummary(adminClient, orgId, user?.id, startDate, endDate, input.compareToPreviousPeriod, input.includeCharts)
          break
        case 'revenue_commission':
          reportData = await generateRevenueCommission(adminClient, orgId, user?.id, startDate, endDate, input.compareToPreviousPeriod)
          break
        case 'activity_report':
          reportData = await generateActivityReport(adminClient, orgId, user?.id, startDate, endDate, input.compareToPreviousPeriod, input.includeCharts)
          break
        case 'quality_metrics':
          reportData = await generateQualityMetrics(adminClient, orgId, user?.id, startDate, endDate, input.compareToPreviousPeriod)
          break
        case 'account_portfolio':
          reportData = await generateAccountPortfolio(adminClient, orgId, user?.id, startDate, endDate)
          break
        case 'pipeline_analysis':
          reportData = await generatePipelineAnalysis(adminClient, orgId, user?.id, startDate, endDate, input.includeCharts)
          break
        default:
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid report type' })
      }

      const report = {
        report_type: input.reportType,
        period: input.period,
        period_label: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        generated_at: new Date().toISOString(),
        generated_by: user?.id,
        data: reportData,
      }

      // Save report to database
      const { data: savedReport, error } = await adminClient
        .from('saved_reports')
        .insert({
          org_id: orgId,
          user_id: user?.id,
          report_type: input.reportType,
          period: input.period,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          report_data: report,
        })
        .select('id')
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Audit log
      await adminClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        action: 'report_generated',
        table_name: 'saved_reports',
        new_values: { report_type: input.reportType, period: input.period },
      })

      return { ...report, id: savedReport.id }
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
  // LIVE DASHBOARD DATA (real-time, not saved)
  // ============================================
  getLiveDashboard: orgProtectedProcedure
    .input(z.object({
      period: ReportPeriodSchema.default('this_month'),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { startDate, endDate } = getDateRange(input.period)
      const { prevStartDate, prevEndDate } = getPreviousPeriodDates(startDate, endDate)

      // Fetch all data in parallel for performance
      const [
        currentMetrics,
        previousMetrics,
        teamMetrics,
        alerts,
      ] = await Promise.all([
        getRecruiterMetrics(adminClient, orgId, user?.id, startDate, endDate),
        getRecruiterMetrics(adminClient, orgId, user?.id, prevStartDate, prevEndDate),
        getTeamAverageMetrics(adminClient, orgId, startDate, endDate),
        getAlerts(adminClient, orgId, user?.id),
      ])

      // Calculate changes vs previous period
      const changes = {
        placements: calculateChange(currentMetrics.placements, previousMetrics.placements),
        revenue: calculateChange(currentMetrics.revenue, previousMetrics.revenue),
        submissions: calculateChange(currentMetrics.submissions, previousMetrics.submissions),
        interviews: calculateChange(currentMetrics.interviews, previousMetrics.interviews),
        candidatesSourced: calculateChange(currentMetrics.candidatesSourced, previousMetrics.candidatesSourced),
      }

      // Calculate vs team average
      const vsTeam = {
        placements: calculateChange(currentMetrics.placements, teamMetrics.placements),
        revenue: calculateChange(currentMetrics.revenue, teamMetrics.revenue),
        submissions: calculateChange(currentMetrics.submissions, teamMetrics.submissions),
        interviews: calculateChange(currentMetrics.interviews, teamMetrics.interviews),
      }

      return {
        current: currentMetrics,
        previous: previousMetrics,
        changes,
        vsTeam,
        teamAverage: teamMetrics,
        alerts,
        period: {
          label: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      }
    }),

  // ============================================
  // GET PERFORMANCE TRENDS (for charts)
  // ============================================
  getPerformanceTrends: orgProtectedProcedure
    .input(z.object({
      period: ReportPeriodSchema.default('this_month'),
      granularity: z.enum(['day', 'week']).default('day'),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { startDate, endDate } = getDateRange(input.period)

      // Get submissions with dates
      const { data: submissions } = await adminClient
        .from('submissions')
        .select('id, status, submitted_at')
        .eq('org_id', orgId)
        .eq('submitted_by', user?.id)
        .gte('submitted_at', startDate.toISOString())
        .lte('submitted_at', endDate.toISOString())
        .not('submitted_at', 'is', null)

      const submissionIds = submissions?.map(s => s.id) ?? []

      // Get interviews
      const { data: interviews } = await adminClient
        .from('interviews')
        .select('id, scheduled_at')
        .eq('org_id', orgId)
        .in('submission_id', submissionIds.length > 0 ? submissionIds : ['00000000-0000-0000-0000-000000000000'])
        .gte('scheduled_at', startDate.toISOString())
        .lte('scheduled_at', endDate.toISOString())

      // Get placements
      const { data: placements } = await adminClient
        .from('placements')
        .select('id, start_date, total_revenue')
        .eq('org_id', orgId)
        .in('submission_id', submissionIds.length > 0 ? submissionIds : ['00000000-0000-0000-0000-000000000000'])
        .gte('start_date', startDate.toISOString())
        .lte('start_date', endDate.toISOString())

      // Get activities
      const { data: activities } = await adminClient
        .from('activities')
        .select('id, activity_type, completed_at')
        .eq('org_id', orgId)
        .eq('assigned_to', user?.id)
        .eq('status', 'completed')
        .gte('completed_at', startDate.toISOString())
        .lte('completed_at', endDate.toISOString())

      const groupFn = input.granularity === 'week' ? groupByWeek : groupByDay

      return {
        submissions: groupFn(submissions ?? [], 'submitted_at', startDate, endDate),
        interviews: groupFn(interviews ?? [], 'scheduled_at', startDate, endDate),
        placements: groupFn(placements ?? [], 'start_date', startDate, endDate),
        activities: groupFn(activities ?? [], 'completed_at', startDate, endDate),
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      }
    }),

  // ============================================
  // GET PIPELINE FUNNEL DATA
  // ============================================
  getPipelineFunnel: orgProtectedProcedure
    .input(z.object({
      period: ReportPeriodSchema.default('this_month'),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { startDate, endDate } = getDateRange(input.period)

      // Get all submissions in period
      const { data: submissions } = await adminClient
        .from('submissions')
        .select('id, status')
        .eq('org_id', orgId)
        .eq('submitted_by', user?.id)
        .gte('submitted_at', startDate.toISOString())
        .lte('submitted_at', endDate.toISOString())

      // Get candidates sourced
      const { count: candidatesSourced } = await adminClient
        .from('candidates')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('sourced_by', user?.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      // Calculate funnel stages
      const total = submissions?.length ?? 0
      const interviewing = submissions?.filter(s =>
        ['interviewing', 'offered', 'placed'].includes(s.status)
      ).length ?? 0
      const offered = submissions?.filter(s =>
        ['offered', 'placed'].includes(s.status)
      ).length ?? 0
      const placed = submissions?.filter(s => s.status === 'placed').length ?? 0

      // Calculate conversion rates
      const submissionRate = (candidatesSourced ?? 0) > 0
        ? Math.round((total / (candidatesSourced ?? 1)) * 100)
        : 0
      const interviewRate = total > 0 ? Math.round((interviewing / total) * 100) : 0
      const offerRate = interviewing > 0 ? Math.round((offered / interviewing) * 100) : 0
      const placementRate = offered > 0 ? Math.round((placed / offered) * 100) : 0
      const overallConversion = (candidatesSourced ?? 0) > 0
        ? Math.round((placed / (candidatesSourced ?? 1)) * 100)
        : 0

      return {
        stages: [
          { name: 'Candidates Sourced', count: candidatesSourced ?? 0, color: '#6B7280' },
          { name: 'Submissions', count: total, color: '#3B82F6' },
          { name: 'Interviews', count: interviewing, color: '#8B5CF6' },
          { name: 'Offers', count: offered, color: '#F59E0B' },
          { name: 'Placements', count: placed, color: '#10B981' },
        ],
        conversionRates: {
          submissionRate,
          interviewRate,
          offerRate,
          placementRate,
          overallConversion,
        },
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      }
    }),

  // ============================================
  // GET ACTIVITY BREAKDOWN
  // ============================================
  getActivityBreakdown: orgProtectedProcedure
    .input(z.object({
      period: ReportPeriodSchema.default('this_month'),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { startDate, endDate } = getDateRange(input.period)

      // Get all activities
      const { data: activities } = await adminClient
        .from('activities')
        .select('id, activity_type, status, entity_type, created_at, completed_at, due_date')
        .eq('org_id', orgId)
        .eq('assigned_to', user?.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      // Group by type
      const byType: Record<string, { total: number; completed: number; avgDays: number }> = {}

      activities?.forEach(a => {
        if (!byType[a.activity_type]) {
          byType[a.activity_type] = { total: 0, completed: 0, avgDays: 0 }
        }
        byType[a.activity_type].total++
        if (a.status === 'completed') {
          byType[a.activity_type].completed++
        }
      })

      // Calculate completion rates
      const breakdown = Object.entries(byType).map(([type, data]) => ({
        type,
        total: data.total,
        completed: data.completed,
        completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      }))

      // Sort by total count
      breakdown.sort((a, b) => b.total - a.total)

      // Get totals
      const totalActivities = activities?.length ?? 0
      const completedActivities = activities?.filter(a => a.status === 'completed').length ?? 0
      const overallCompletionRate = totalActivities > 0
        ? Math.round((completedActivities / totalActivities) * 100)
        : 0

      return {
        breakdown,
        totals: {
          total: totalActivities,
          completed: completedActivities,
          completionRate: overallCompletionRate,
        },
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
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
          metrics: ['placements', 'revenue', 'submissions', 'interviews', 'fill_rate'],
        },
        {
          id: 'revenue_commission',
          name: 'Revenue & Commission',
          description: 'Detailed revenue breakdown and commission calculations',
          icon: '💰',
          metrics: ['total_revenue', 'commission', 'by_account', 'by_placement_type'],
        },
        {
          id: 'activity_report',
          name: 'Activity Report',
          description: 'Calls, emails, meetings, and sourcing activity breakdown',
          icon: '📋',
          metrics: ['calls', 'emails', 'meetings', 'completion_rate'],
        },
        {
          id: 'quality_metrics',
          name: 'Quality Metrics',
          description: 'Time-to-fill, submission quality, and retention metrics',
          icon: '🎯',
          metrics: ['time_to_fill', 'submission_quality', 'retention', 'quality_score'],
        },
        {
          id: 'account_portfolio',
          name: 'Account Portfolio',
          description: 'Account health, revenue by account, and NPS scores',
          icon: '🏢',
          metrics: ['accounts', 'revenue_by_account', 'nps_scores', 'activity'],
        },
        {
          id: 'pipeline_analysis',
          name: 'Pipeline Analysis',
          description: 'Jobs, candidates, and submissions funnel analysis',
          icon: '📊',
          metrics: ['funnel', 'conversion_rates', 'bottlenecks', 'velocity'],
        },
      ]
    }),

  // ============================================
  // DELETE SAVED REPORT
  // ============================================
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
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
// REPORT GENERATION FUNCTIONS
// ============================================

async function generatePerformanceSummary(
  adminClient: ReturnType<typeof getAdminClient>,
  orgId: string,
  userId: string | undefined,
  startDate: Date,
  endDate: Date,
  compareToPrevious: boolean,
  includeCharts: boolean
) {
  const current = await getRecruiterMetrics(adminClient, orgId, userId, startDate, endDate)

  let comparison = null
  if (compareToPrevious) {
    const { prevStartDate, prevEndDate } = getPreviousPeriodDates(startDate, endDate)
    const previous = await getRecruiterMetrics(adminClient, orgId, userId, prevStartDate, prevEndDate)
    comparison = {
      placements_change: calculateChange(current.placements, previous.placements),
      revenue_change: calculateChange(current.revenue, previous.revenue),
      submissions_change: calculateChange(current.submissions, previous.submissions),
      interviews_change: calculateChange(current.interviews, previous.interviews),
    }
  }

  // Get by-account breakdown
  const { data: submissionsByAccount } = await adminClient
    .from('submissions')
    .select(`
      id, status,
      job:jobs(company:companies!jobs_company_id_fkey(id, name))
    `)
    .eq('org_id', orgId)
    .eq('submitted_by', userId)
    .gte('submitted_at', startDate.toISOString())
    .lte('submitted_at', endDate.toISOString())

  const accountMap = new Map<string, { name: string; submissions: number; interviews: number; placements: number }>()

  submissionsByAccount?.forEach(s => {
    const jobArray = s.job as Array<{ company: Array<{ id: string; name: string }> | null }> | null
    const company = jobArray?.[0]?.company?.[0]
    if (company) {
      const existing = accountMap.get(company.id) || { name: company.name, submissions: 0, interviews: 0, placements: 0 }
      existing.submissions++
      if (['interviewing', 'offered', 'placed'].includes(s.status)) existing.interviews++
      if (s.status === 'placed') existing.placements++
      accountMap.set(company.id, existing)
    }
  })

  const byAccount = Array.from(accountMap.values())
    .sort((a, b) => b.submissions - a.submissions)
    .slice(0, 10)

  // Get chart data
  let chartData = null
  if (includeCharts) {
    const { data: submissions } = await adminClient
      .from('submissions')
      .select('id, submitted_at')
      .eq('org_id', orgId)
      .eq('submitted_by', userId)
      .gte('submitted_at', startDate.toISOString())
      .lte('submitted_at', endDate.toISOString())

    chartData = {
      submissionsByDay: groupByDay(submissions ?? [], 'submitted_at', startDate, endDate),
      submissionsByWeek: groupByWeek(submissions ?? [], 'submitted_at', startDate, endDate),
    }
  }

  return {
    summary: {
      placements: current.placements,
      revenue: current.revenue,
      submissions: current.submissions,
      interviews: current.interviews,
      candidatesSourced: current.candidatesSourced,
      activitiesCompleted: current.activitiesCompleted,
    },
    qualityMetrics: {
      submissionToInterviewRate: current.submissionToInterviewRate,
      interviewToOfferRate: current.interviewToOfferRate,
      offerAcceptanceRate: current.offerAcceptanceRate,
      fillRate: current.fillRate,
    },
    byAccount,
    comparison,
    chartData,
  }
}

async function generateRevenueCommission(
  adminClient: ReturnType<typeof getAdminClient>,
  orgId: string,
  userId: string | undefined,
  startDate: Date,
  endDate: Date,
  compareToPrevious: boolean
) {
  // Get user's submissions
  const { data: submissions } = await adminClient
    .from('submissions')
    .select('id')
    .eq('org_id', orgId)
    .eq('submitted_by', userId)

  const submissionIds = submissions?.map(s => s.id) ?? []

  // Get placements with revenue data
  const { data: placements } = await adminClient
    .from('placements')
    .select(`
      id, placement_type, bill_rate, pay_rate, total_revenue, start_date, status,
      submission:submissions(
        job:jobs(title, company:companies!jobs_company_id_fkey(id, name))
      )
    `)
    .eq('org_id', orgId)
    .in('submission_id', submissionIds.length > 0 ? submissionIds : ['00000000-0000-0000-0000-000000000000'])
    .gte('start_date', startDate.toISOString())
    .lte('start_date', endDate.toISOString())

  // Calculate totals
  const totalRevenue = placements?.reduce((sum, p) => sum + (p.total_revenue || 0), 0) ?? 0
  const totalGrossProfit = placements?.reduce((sum, p) => {
    const billRate = p.bill_rate || 0
    const payRate = p.pay_rate || 0
    return sum + (billRate - payRate) * 160 // Assuming 160 hours/month
  }, 0) ?? 0

  // Commission calculation (simplified - 10% of gross profit)
  const commissionRate = 0.10
  const totalCommission = totalGrossProfit * commissionRate

  // Group by placement type
  const byType: Record<string, { count: number; revenue: number; commission: number }> = {}
  placements?.forEach(p => {
    const type = p.placement_type || 'other'
    if (!byType[type]) byType[type] = { count: 0, revenue: 0, commission: 0 }
    byType[type].count++
    byType[type].revenue += p.total_revenue || 0
    byType[type].commission += ((p.bill_rate || 0) - (p.pay_rate || 0)) * 160 * commissionRate
  })

  // Group by account
  const byAccount: Record<string, { name: string; placements: number; revenue: number; commission: number }> = {}
  placements?.forEach(p => {
    const subArray = p.submission as Array<{ job: Array<{ company: Array<{ id: string; name: string }> | null }> | null }> | null
    const company = subArray?.[0]?.job?.[0]?.company?.[0]
    if (company) {
      if (!byAccount[company.id]) byAccount[company.id] = { name: company.name, placements: 0, revenue: 0, commission: 0 }
      byAccount[company.id].placements++
      byAccount[company.id].revenue += p.total_revenue || 0
      byAccount[company.id].commission += ((p.bill_rate || 0) - (p.pay_rate || 0)) * 160 * commissionRate
    }
  })

  let comparison = null
  if (compareToPrevious) {
    const { prevStartDate, prevEndDate } = getPreviousPeriodDates(startDate, endDate)
    const { data: prevPlacements } = await adminClient
      .from('placements')
      .select('total_revenue, bill_rate, pay_rate')
      .eq('org_id', orgId)
      .in('submission_id', submissionIds.length > 0 ? submissionIds : ['00000000-0000-0000-0000-000000000000'])
      .gte('start_date', prevStartDate.toISOString())
      .lte('start_date', prevEndDate.toISOString())

    const prevRevenue = prevPlacements?.reduce((sum, p) => sum + (p.total_revenue || 0), 0) ?? 0
    const prevGrossProfit = prevPlacements?.reduce((sum, p) => {
      return sum + ((p.bill_rate || 0) - (p.pay_rate || 0)) * 160
    }, 0) ?? 0

    comparison = {
      revenue_change: calculateChange(totalRevenue, prevRevenue),
      commission_change: calculateChange(totalCommission, prevGrossProfit * commissionRate),
    }
  }

  return {
    summary: {
      totalRevenue,
      totalGrossProfit,
      totalCommission,
      commissionRate: commissionRate * 100,
      placementCount: placements?.length ?? 0,
      averageRevenue: placements?.length ? Math.round(totalRevenue / placements.length) : 0,
    },
    byPlacementType: Object.entries(byType).map(([type, data]) => ({
      type,
      ...data,
    })),
    byAccount: Object.entries(byAccount)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10),
    placements: placements?.map(p => {
      const subArray = p.submission as Array<{ job: Array<{ title: string; company: Array<{ name: string }> | null }> | null }> | null
      return {
        id: p.id,
        jobTitle: subArray?.[0]?.job?.[0]?.title ?? 'Unknown',
        accountName: subArray?.[0]?.job?.[0]?.company?.[0]?.name ?? 'Unknown',
        type: p.placement_type,
        billRate: p.bill_rate,
        payRate: p.pay_rate,
        revenue: p.total_revenue,
        margin: p.bill_rate && p.pay_rate ? Math.round(((p.bill_rate - p.pay_rate) / p.bill_rate) * 100) : 0,
        startDate: p.start_date,
        status: p.status,
      }
    }) ?? [],
    comparison,
  }
}

async function generateActivityReport(
  adminClient: ReturnType<typeof getAdminClient>,
  orgId: string,
  userId: string | undefined,
  startDate: Date,
  endDate: Date,
  compareToPrevious: boolean,
  includeCharts: boolean
) {
  // Get all activities
  const { data: activities } = await adminClient
    .from('activities')
    .select('id, activity_type, status, entity_type, created_at, completed_at, due_date')
    .eq('org_id', orgId)
    .eq('assigned_to', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // Group by type
  const byType: Record<string, { total: number; completed: number }> = {
    call: { total: 0, completed: 0 },
    email: { total: 0, completed: 0 },
    meeting: { total: 0, completed: 0 },
    linkedin_message: { total: 0, completed: 0 },
    note: { total: 0, completed: 0 },
    task: { total: 0, completed: 0 },
    follow_up: { total: 0, completed: 0 },
  }

  activities?.forEach(a => {
    if (byType[a.activity_type]) {
      byType[a.activity_type].total++
      if (a.status === 'completed') {
        byType[a.activity_type].completed++
      }
    }
  })

  // Group by entity type
  const byEntity: Record<string, number> = {}
  activities?.forEach(a => {
    byEntity[a.entity_type] = (byEntity[a.entity_type] || 0) + 1
  })

  // Calculate totals
  const totalActivities = activities?.length ?? 0
  const completedActivities = activities?.filter(a => a.status === 'completed').length ?? 0
  const completionRate = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0

  // Daily average
  const daysInPeriod = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
  const dailyAverage = Math.round((totalActivities / daysInPeriod) * 10) / 10

  let comparison = null
  if (compareToPrevious) {
    const { prevStartDate, prevEndDate } = getPreviousPeriodDates(startDate, endDate)
    const { count: prevCount } = await adminClient
      .from('activities')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('assigned_to', userId)
      .gte('created_at', prevStartDate.toISOString())
      .lte('created_at', prevEndDate.toISOString())

    comparison = {
      total_change: calculateChange(totalActivities, prevCount ?? 0),
    }
  }

  let chartData = null
  if (includeCharts) {
    chartData = {
      byDay: groupByDay(activities ?? [], 'created_at', startDate, endDate),
      byWeek: groupByWeek(activities ?? [], 'created_at', startDate, endDate),
    }
  }

  return {
    summary: {
      total: totalActivities,
      completed: completedActivities,
      completionRate,
      dailyAverage,
      calls: byType.call.total,
      emails: byType.email.total,
      meetings: byType.meeting.total,
    },
    byType: Object.entries(byType).map(([type, data]) => ({
      type,
      total: data.total,
      completed: data.completed,
      completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
    })),
    byEntityType: Object.entries(byEntity)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count),
    comparison,
    chartData,
  }
}

async function generateQualityMetrics(
  adminClient: ReturnType<typeof getAdminClient>,
  orgId: string,
  userId: string | undefined,
  startDate: Date,
  endDate: Date,
  compareToPrevious: boolean
) {
  // Get submissions with job data
  const { data: submissions } = await adminClient
    .from('submissions')
    .select('id, status, submitted_at, job:jobs(id, created_at)')
    .eq('org_id', orgId)
    .eq('submitted_by', userId)
    .gte('submitted_at', startDate.toISOString())
    .lte('submitted_at', endDate.toISOString())

  const submissionIds = submissions?.map(s => s.id) ?? []

  // Calculate time-to-submit
  const timeToSubmitHours: number[] = []
  submissions?.forEach(s => {
    const jobArray = s.job as Array<{ id: string; created_at: string }> | null
    const job = jobArray?.[0]
    if (job?.created_at && s.submitted_at) {
      const hours = (new Date(s.submitted_at).getTime() - new Date(job.created_at).getTime()) / (1000 * 60 * 60)
      if (hours > 0 && hours < 720) {
        timeToSubmitHours.push(hours)
      }
    }
  })
  const avgTimeToSubmit = timeToSubmitHours.length > 0
    ? Math.round(timeToSubmitHours.reduce((a, b) => a + b, 0) / timeToSubmitHours.length)
    : 0

  // Calculate conversion rates
  const totalSubmissions = submissions?.length ?? 0
  const interviewedSubmissions = submissions?.filter(s =>
    ['interviewing', 'offered', 'placed'].includes(s.status)
  ).length ?? 0
  const offeredSubmissions = submissions?.filter(s =>
    ['offered', 'placed'].includes(s.status)
  ).length ?? 0
  const placedSubmissions = submissions?.filter(s => s.status === 'placed').length ?? 0

  const submissionToInterviewRate = totalSubmissions > 0
    ? Math.round((interviewedSubmissions / totalSubmissions) * 100)
    : 0
  const interviewToOfferRate = interviewedSubmissions > 0
    ? Math.round((offeredSubmissions / interviewedSubmissions) * 100)
    : 0
  const offerAcceptanceRate = offeredSubmissions > 0
    ? Math.round((placedSubmissions / offeredSubmissions) * 100)
    : 0

  // Get placements for time-to-fill and retention
  const { data: placements } = await adminClient
    .from('placements')
    .select('id, status, start_date, submission:submissions(job:jobs(created_at))')
    .eq('org_id', orgId)
    .in('submission_id', submissionIds.length > 0 ? submissionIds : ['00000000-0000-0000-0000-000000000000'])
    .gte('start_date', startDate.toISOString())
    .lte('start_date', endDate.toISOString())

  // Time to fill
  const timeToFillDays: number[] = []
  placements?.forEach(p => {
    const subArray = p.submission as Array<{ job: Array<{ created_at: string }> | null }> | null
    const job = subArray?.[0]?.job?.[0]
    if (job?.created_at && p.start_date) {
      const days = (new Date(p.start_date).getTime() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24)
      if (days > 0 && days < 180) {
        timeToFillDays.push(days)
      }
    }
  })
  const avgTimeToFill = timeToFillDays.length > 0
    ? Math.round(timeToFillDays.reduce((a, b) => a + b, 0) / timeToFillDays.length)
    : 0

  // 30-day retention
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const oldPlacements = placements?.filter(p => new Date(p.start_date) < thirtyDaysAgo) ?? []
  const retainedPlacements = oldPlacements.filter(p => p.status === 'active' || p.status === 'completed')
  const retentionRate = oldPlacements.length > 0
    ? Math.round((retainedPlacements.length / oldPlacements.length) * 100)
    : 100

  // Overall quality score
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

  // Status helper
  const getStatus = (value: number, target: number, inverse: boolean): 'good' | 'warning' | 'poor' => {
    if (inverse) {
      if (value <= target) return 'good'
      if (value <= target * 1.5) return 'warning'
      return 'poor'
    }
    if (value >= target) return 'good'
    if (value >= target * 0.7) return 'warning'
    return 'poor'
  }

  let comparison = null
  if (compareToPrevious) {
    const { prevStartDate, prevEndDate } = getPreviousPeriodDates(startDate, endDate)
    const prevMetrics = await generateQualityMetrics(adminClient, orgId, userId, prevStartDate, prevEndDate, false)
    comparison = {
      qualityScore_change: calculateChange(qualityScore, prevMetrics.summary.qualityScore),
      submissionQuality_change: calculateChange(submissionToInterviewRate, prevMetrics.summary.submissionToInterviewRate),
    }
  }

  return {
    summary: {
      qualityScore,
      timeToSubmit: avgTimeToSubmit,
      timeToFill: avgTimeToFill,
      submissionToInterviewRate,
      interviewToOfferRate,
      offerAcceptanceRate,
      retentionRate,
    },
    metrics: [
      {
        name: 'Time to Submit',
        value: avgTimeToSubmit,
        target: 48,
        unit: 'hours',
        status: getStatus(avgTimeToSubmit, 48, true),
        description: 'Average time from job open to first submission',
      },
      {
        name: 'Time to Fill',
        value: avgTimeToFill,
        target: 21,
        unit: 'days',
        status: getStatus(avgTimeToFill, 21, true),
        description: 'Average time from job open to placement start',
      },
      {
        name: 'Submission Quality',
        value: submissionToInterviewRate,
        target: 70,
        unit: '%',
        status: getStatus(submissionToInterviewRate, 70, false),
        description: 'Percentage of submissions reaching interview',
      },
      {
        name: 'Interview to Offer',
        value: interviewToOfferRate,
        target: 40,
        unit: '%',
        status: getStatus(interviewToOfferRate, 40, false),
        description: 'Percentage of interviews resulting in offer',
      },
      {
        name: 'Offer Acceptance',
        value: offerAcceptanceRate,
        target: 85,
        unit: '%',
        status: getStatus(offerAcceptanceRate, 85, false),
        description: 'Percentage of offers accepted',
      },
      {
        name: '30-Day Retention',
        value: retentionRate,
        target: 95,
        unit: '%',
        status: getStatus(retentionRate, 95, false),
        description: 'Percentage of placements active after 30 days',
      },
    ],
    comparison,
  }
}

async function generateAccountPortfolio(
  adminClient: ReturnType<typeof getAdminClient>,
  orgId: string,
  userId: string | undefined,
  startDate: Date,
  endDate: Date
) {
  const { data: companies } = await adminClient
    .from('companies')
    .select(`
      id, name, segment, status, last_contacted_date, nps_score,
      jobs!company_id(id, status, recruiter_id, created_at),
      placements!company_id(id, total_revenue, start_date, status)
    `)
    .eq('org_id', orgId)
    .in('category', ['client', 'prospect'])
    .is('deleted_at', null)

  // Filter accounts where user has jobs
  const recruiterAccounts = companies?.filter(c => {
    const jobs = c.jobs as Array<{ recruiter_id: string }> | null
    return jobs?.some(j => j.recruiter_id === userId)
  }).map(company => {
    const jobs = company.jobs as Array<{ id: string; status: string; created_at: string }> | null ?? []
    const placements = company.placements as Array<{ id: string; total_revenue: number; start_date: string; status: string }> | null ?? []

    // Filter placements in date range
    const periodPlacements = placements.filter(p =>
      new Date(p.start_date) >= startDate &&
      new Date(p.start_date) <= endDate
    )
    const periodRevenue = periodPlacements.reduce((sum, p) => sum + (p.total_revenue || 0), 0)

    // YTD revenue
    const ytdStart = new Date(new Date().getFullYear(), 0, 1)
    const ytdPlacements = placements.filter(p => new Date(p.start_date) >= ytdStart)
    const ytdRevenue = ytdPlacements.reduce((sum, p) => sum + (p.total_revenue || 0), 0)

    // Active placements
    const activePlacements = placements.filter(p => p.status === 'active').length

    // Calculate health score
    const daysSinceContact = company.last_contacted_date
      ? Math.floor((Date.now() - new Date(company.last_contacted_date).getTime()) / (1000 * 60 * 60 * 24))
      : 999
    const activeJobs = jobs.filter(j => j.status === 'active').length

    let healthScore = 100
    if (daysSinceContact > 30) healthScore -= 20
    if (daysSinceContact > 60) healthScore -= 20
    if (activeJobs === 0) healthScore -= 15
    if (periodRevenue === 0 && ytdRevenue > 0) healthScore -= 10
    if (company.nps_score && company.nps_score < 7) healthScore -= 15
    healthScore = Math.max(0, healthScore)

    return {
      id: company.id,
      name: company.name,
      industry: company.segment,
      status: company.status,
      activeJobs,
      totalJobs: jobs.length,
      periodRevenue,
      ytdRevenue,
      activePlacements,
      npsScore: company.nps_score,
      lastContactDate: company.last_contacted_date,
      daysSinceContact,
      healthScore,
      healthStatus: healthScore >= 80 ? 'healthy' : healthScore >= 50 ? 'at_risk' : 'critical',
    }
  }) ?? []

  // Calculate totals
  const summary = {
    totalAccounts: recruiterAccounts.length,
    healthyAccounts: recruiterAccounts.filter(a => a.healthStatus === 'healthy').length,
    atRiskAccounts: recruiterAccounts.filter(a => a.healthStatus === 'at_risk').length,
    criticalAccounts: recruiterAccounts.filter(a => a.healthStatus === 'critical').length,
    totalPeriodRevenue: recruiterAccounts.reduce((sum, a) => sum + a.periodRevenue, 0),
    totalYtdRevenue: recruiterAccounts.reduce((sum, a) => sum + a.ytdRevenue, 0),
    averageNps: recruiterAccounts.filter(a => a.npsScore).length > 0
      ? Math.round(recruiterAccounts.reduce((sum, a) => sum + (a.npsScore || 0), 0) / recruiterAccounts.filter(a => a.npsScore).length)
      : null,
    totalActiveJobs: recruiterAccounts.reduce((sum, a) => sum + a.activeJobs, 0),
    totalActivePlacements: recruiterAccounts.reduce((sum, a) => sum + a.activePlacements, 0),
  }

  return {
    accounts: recruiterAccounts.sort((a, b) => b.periodRevenue - a.periodRevenue),
    summary,
    alerts: recruiterAccounts
      .filter(a => a.healthStatus !== 'healthy')
      .map(a => ({
        accountId: a.id,
        accountName: a.name,
        status: a.healthStatus,
        issues: [
          ...(a.daysSinceContact > 30 ? [`No contact in ${a.daysSinceContact} days`] : []),
          ...(a.activeJobs === 0 ? ['No active jobs'] : []),
          ...(a.npsScore && a.npsScore < 7 ? [`Low NPS score (${a.npsScore})`] : []),
        ],
      })),
  }
}

async function generatePipelineAnalysis(
  adminClient: ReturnType<typeof getAdminClient>,
  orgId: string,
  userId: string | undefined,
  startDate: Date,
  endDate: Date,
  includeCharts: boolean
) {
  // Get jobs
  const { data: jobs } = await adminClient
    .from('jobs')
    .select('id, title, status, priority, created_at, company:companies!jobs_company_id_fkey(name)')
    .eq('org_id', orgId)
    .eq('recruiter_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // Get candidates sourced
  const { data: candidates } = await adminClient
    .from('candidates')
    .select('id, status, created_at')
    .eq('org_id', orgId)
    .eq('sourced_by', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // Get submissions
  const { data: submissions } = await adminClient
    .from('submissions')
    .select('id, status, submitted_at, job_id')
    .eq('org_id', orgId)
    .eq('submitted_by', userId)
    .gte('submitted_at', startDate.toISOString())
    .lte('submitted_at', endDate.toISOString())

  const submissionIds = submissions?.map(s => s.id) ?? []

  // Get interviews
  const { data: interviews } = await adminClient
    .from('interviews')
    .select('id, status, scheduled_at')
    .eq('org_id', orgId)
    .in('submission_id', submissionIds.length > 0 ? submissionIds : ['00000000-0000-0000-0000-000000000000'])

  // Get placements
  const { data: placements } = await adminClient
    .from('placements')
    .select('id, status, start_date')
    .eq('org_id', orgId)
    .in('submission_id', submissionIds.length > 0 ? submissionIds : ['00000000-0000-0000-0000-000000000000'])
    .gte('start_date', startDate.toISOString())
    .lte('start_date', endDate.toISOString())

  // Calculate funnel
  const candidatesSourced = candidates?.length ?? 0
  const totalSubmissions = submissions?.length ?? 0
  const interviewingCount = submissions?.filter(s =>
    ['interviewing', 'offered', 'placed'].includes(s.status)
  ).length ?? 0
  const offeredCount = submissions?.filter(s =>
    ['offered', 'placed'].includes(s.status)
  ).length ?? 0
  const placedCount = submissions?.filter(s => s.status === 'placed').length ?? 0

  // Conversion rates
  const submissionRate = candidatesSourced > 0 ? Math.round((totalSubmissions / candidatesSourced) * 100) : 0
  const interviewRate = totalSubmissions > 0 ? Math.round((interviewingCount / totalSubmissions) * 100) : 0
  const offerRate = interviewingCount > 0 ? Math.round((offeredCount / interviewingCount) * 100) : 0
  const placementRate = offeredCount > 0 ? Math.round((placedCount / offeredCount) * 100) : 0
  const overallConversion = candidatesSourced > 0 ? Math.round((placedCount / candidatesSourced) * 100) : 0

  // Calculate velocity (avg days at each stage)
  const daysInPeriod = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
  const velocity = {
    candidatesPerDay: Math.round((candidatesSourced / daysInPeriod) * 10) / 10,
    submissionsPerDay: Math.round((totalSubmissions / daysInPeriod) * 10) / 10,
    interviewsPerWeek: Math.round((interviews?.length ?? 0) / (daysInPeriod / 7) * 10) / 10,
    placementsPerMonth: Math.round((placedCount / (daysInPeriod / 30)) * 10) / 10,
  }

  // Job analysis
  const jobAnalysis = jobs?.map(job => {
    const companyArray = job.company as Array<{ name: string }> | null
    const jobSubmissions = submissions?.filter(s => s.job_id === job.id) ?? []
    const jobInterviews = jobSubmissions.filter(s =>
      ['interviewing', 'offered', 'placed'].includes(s.status)
    ).length
    const jobPlacements = jobSubmissions.filter(s => s.status === 'placed').length

    return {
      id: job.id,
      title: job.title,
      account: companyArray?.[0]?.name ?? 'Unknown',
      status: job.status,
      priority: job.priority,
      submissions: jobSubmissions.length,
      interviews: jobInterviews,
      placements: jobPlacements,
      daysOpen: Math.floor((Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24)),
    }
  }).sort((a, b) => b.submissions - a.submissions) ?? []

  // Identify bottlenecks
  const bottlenecks: Array<{ stage: string; issue: string; severity: 'high' | 'medium' | 'low' }> = []

  if (submissionRate < 20) {
    bottlenecks.push({
      stage: 'Sourcing to Submission',
      issue: `Only ${submissionRate}% of candidates are being submitted`,
      severity: submissionRate < 10 ? 'high' : 'medium',
    })
  }
  if (interviewRate < 40) {
    bottlenecks.push({
      stage: 'Submission to Interview',
      issue: `Only ${interviewRate}% of submissions reach interview`,
      severity: interviewRate < 25 ? 'high' : 'medium',
    })
  }
  if (offerRate < 30) {
    bottlenecks.push({
      stage: 'Interview to Offer',
      issue: `Only ${offerRate}% of interviews result in offers`,
      severity: offerRate < 15 ? 'high' : 'medium',
    })
  }
  if (placementRate < 70) {
    bottlenecks.push({
      stage: 'Offer to Placement',
      issue: `Only ${placementRate}% of offers are accepted`,
      severity: placementRate < 50 ? 'high' : 'medium',
    })
  }

  let chartData = null
  if (includeCharts) {
    chartData = {
      candidatesByDay: groupByDay(candidates ?? [], 'created_at', startDate, endDate),
      submissionsByDay: groupByDay(submissions ?? [], 'submitted_at', startDate, endDate),
      submissionsByWeek: groupByWeek(submissions ?? [], 'submitted_at', startDate, endDate),
    }
  }

  return {
    funnel: {
      stages: [
        { name: 'Candidates Sourced', count: candidatesSourced, color: '#6B7280' },
        { name: 'Submissions', count: totalSubmissions, color: '#3B82F6' },
        { name: 'Interviews', count: interviewingCount, color: '#8B5CF6' },
        { name: 'Offers', count: offeredCount, color: '#F59E0B' },
        { name: 'Placements', count: placedCount, color: '#10B981' },
      ],
      conversionRates: {
        submissionRate,
        interviewRate,
        offerRate,
        placementRate,
        overallConversion,
      },
    },
    velocity,
    jobs: {
      total: jobs?.length ?? 0,
      active: jobs?.filter(j => j.status === 'active').length ?? 0,
      filled: jobs?.filter(j => j.status === 'filled').length ?? 0,
      details: jobAnalysis.slice(0, 20),
    },
    bottlenecks,
    chartData,
  }
}

// ============================================
// HELPER: Get recruiter metrics
// ============================================
async function getRecruiterMetrics(
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
    .select('id, total_revenue, start_date')
    .eq('org_id', orgId)
    .in('submission_id', submissionIds.length > 0 ? submissionIds : ['00000000-0000-0000-0000-000000000000'])
    .gte('start_date', startDate.toISOString())
    .lte('start_date', endDate.toISOString())

  // Get interviews
  const { count: interviewCount } = await adminClient
    .from('interviews')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .in('submission_id', submissionIds.length > 0 ? submissionIds : ['00000000-0000-0000-0000-000000000000'])
    .gte('scheduled_at', startDate.toISOString())
    .lte('scheduled_at', endDate.toISOString())

  // Get candidates sourced
  const { count: candidateCount } = await adminClient
    .from('candidates')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .eq('sourced_by', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // Get completed activities
  const { count: activityCount } = await adminClient
    .from('activities')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .eq('assigned_to', userId)
    .eq('status', 'completed')
    .gte('completed_at', startDate.toISOString())
    .lte('completed_at', endDate.toISOString())

  // Calculate metrics
  const totalSubmissions = submissions?.length ?? 0
  const interviewedSubmissions = submissions?.filter(s =>
    ['interviewing', 'offered', 'placed'].includes(s.status)
  ).length ?? 0
  const offeredSubmissions = submissions?.filter(s =>
    ['offered', 'placed'].includes(s.status)
  ).length ?? 0
  const placedSubmissions = submissions?.filter(s => s.status === 'placed').length ?? 0

  const totalRevenue = placements?.reduce((sum, p) => sum + (p.total_revenue || 0), 0) ?? 0

  return {
    placements: placements?.length ?? 0,
    revenue: totalRevenue,
    submissions: totalSubmissions,
    interviews: interviewCount ?? 0,
    candidatesSourced: candidateCount ?? 0,
    activitiesCompleted: activityCount ?? 0,
    submissionToInterviewRate: totalSubmissions > 0 ? Math.round((interviewedSubmissions / totalSubmissions) * 100) : 0,
    interviewToOfferRate: interviewedSubmissions > 0 ? Math.round((offeredSubmissions / interviewedSubmissions) * 100) : 0,
    offerAcceptanceRate: offeredSubmissions > 0 ? Math.round((placedSubmissions / offeredSubmissions) * 100) : 0,
    fillRate: totalSubmissions > 0 ? Math.round((placedSubmissions / totalSubmissions) * 100) : 0,
  }
}

// ============================================
// HELPER: Get team average metrics
// ============================================
async function getTeamAverageMetrics(
  adminClient: ReturnType<typeof getAdminClient>,
  orgId: string,
  startDate: Date,
  endDate: Date
) {
  // Get all recruiters in org
  const { data: orgUsers } = await adminClient
    .from('organization_users')
    .select('user_id')
    .eq('org_id', orgId)
    .eq('status', 'active')

  const userCount = orgUsers?.length ?? 1

  // Get total org submissions
  const { count: totalSubmissions } = await adminClient
    .from('submissions')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .gte('submitted_at', startDate.toISOString())
    .lte('submitted_at', endDate.toISOString())

  // Get total org placements
  const { data: allPlacements } = await adminClient
    .from('placements')
    .select('id, total_revenue')
    .eq('org_id', orgId)
    .gte('start_date', startDate.toISOString())
    .lte('start_date', endDate.toISOString())

  // Get total org interviews
  const { count: totalInterviews } = await adminClient
    .from('interviews')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .gte('scheduled_at', startDate.toISOString())
    .lte('scheduled_at', endDate.toISOString())

  const totalRevenue = allPlacements?.reduce((sum, p) => sum + (p.total_revenue || 0), 0) ?? 0

  return {
    placements: Math.round((allPlacements?.length ?? 0) / userCount),
    revenue: Math.round(totalRevenue / userCount),
    submissions: Math.round((totalSubmissions ?? 0) / userCount),
    interviews: Math.round((totalInterviews ?? 0) / userCount),
  }
}

// ============================================
// HELPER: Get alerts
// ============================================
async function getAlerts(
  adminClient: ReturnType<typeof getAdminClient>,
  orgId: string,
  userId: string | undefined
) {
  const alerts: Array<{
    type: 'warning' | 'error' | 'info'
    title: string
    description: string
    action?: string
    entityType?: string
    entityId?: string
  }> = []

  const now = new Date()
  const threeDaysAgo = new Date(now)
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  const fourteenDaysAgo = new Date(now)
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  // Check for stale submissions
  const { data: staleSubmissions } = await adminClient
    .from('submissions')
    .select('id')
    .eq('org_id', orgId)
    .eq('submitted_by', userId)
    .eq('status', 'submitted')
    .lt('submitted_at', threeDaysAgo.toISOString())
    .limit(5)

  if (staleSubmissions && staleSubmissions.length > 0) {
    alerts.push({
      type: 'warning',
      title: 'Stale Submissions',
      description: `${staleSubmissions.length} submission(s) awaiting client feedback for 3+ days`,
      action: 'Follow up with clients',
    })
  }

  // Check for old jobs with weak pipeline
  const { data: oldJobs } = await adminClient
    .from('jobs')
    .select('id, title, submissions(id)')
    .eq('org_id', orgId)
    .eq('recruiter_id', userId)
    .eq('status', 'active')
    .lt('created_at', fourteenDaysAgo.toISOString())

  const weakPipelineJobs = oldJobs?.filter(j => {
    const subs = j.submissions as Array<{ id: string }> | null
    return (subs?.length ?? 0) < 5
  }) ?? []

  if (weakPipelineJobs.length > 0) {
    alerts.push({
      type: 'error',
      title: 'Jobs Need Attention',
      description: `${weakPipelineJobs.length} job(s) open 14+ days with weak pipeline`,
      action: 'Increase sourcing efforts',
      entityType: 'job',
      entityId: weakPipelineJobs[0].id,
    })
  }

  // Check for overdue activities
  const { count: overdueCount } = await adminClient
    .from('activities')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .eq('assigned_to', userId)
    .in('status', ['scheduled', 'open', 'in_progress'])
    .lt('due_date', now.toISOString())

  if (overdueCount && overdueCount > 0) {
    alerts.push({
      type: 'warning',
      title: 'Overdue Tasks',
      description: `${overdueCount} task(s) past due date`,
      action: 'Review and complete tasks',
    })
  }

  // Check for accounts not contacted recently
  const { data: accounts } = await adminClient
    .from('companies')
    .select('id, name, last_contacted_date')
    .eq('org_id', orgId)
    .in('category', ['client'])
    .is('deleted_at', null)

  const staleAccounts = accounts?.filter(a => {
    if (!a.last_contacted_date) return true
    const daysSince = Math.floor((now.getTime() - new Date(a.last_contacted_date).getTime()) / (1000 * 60 * 60 * 24))
    return daysSince > 30
  }) ?? []

  if (staleAccounts.length > 0) {
    alerts.push({
      type: 'info',
      title: 'Accounts Need Contact',
      description: `${staleAccounts.length} account(s) not contacted in 30+ days`,
      action: 'Schedule check-in calls',
    })
  }

  return alerts
}
