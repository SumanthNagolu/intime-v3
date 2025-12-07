import { Suspense } from 'react'
import { getServerCaller } from '@/server/trpc/server-caller'
import { RecruiterDashboard, RecruiterDashboardSkeleton, type DashboardInitialData } from '@/components/recruiter-workspace'

export const dynamic = 'force-dynamic'

async function DashboardServer() {
  const caller = await getServerCaller()

  // Fetch all dashboard data in parallel on the server
  const [
    sprintProgress,
    todaysPriorities,
    pipelineHealth,
    activitySummary,
    qualityMetrics,
    recentWins,
    accountHealth,
    upcomingInterviews,
  ] = await Promise.all([
    caller.dashboard.getSprintProgress({}).catch(() => undefined),
    caller.dashboard.getTodaysPriorities({}).catch(() => undefined),
    caller.dashboard.getPipelineHealth().catch(() => undefined),
    caller.dashboard.getActivitySummary({ days: 7 }).catch(() => undefined),
    caller.dashboard.getQualityMetrics({ days: 30 }).catch(() => undefined),
    caller.dashboard.getRecentWins({ limit: 5 }).catch(() => undefined),
    caller.crm.accounts.getHealth({}).catch(() => undefined),
    caller.ats.interviews.getUpcoming({ days: 7 }).catch(() => undefined),
  ])

  const initialData: DashboardInitialData = {
    sprintProgress,
    todaysPriorities,
    pipelineHealth,
    activitySummary,
    qualityMetrics,
    recentWins,
    accountHealth,
    upcomingInterviews,
  }

  return <RecruiterDashboard initialData={initialData} />
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<RecruiterDashboardSkeleton />}>
      <DashboardServer />
    </Suspense>
  )
}
