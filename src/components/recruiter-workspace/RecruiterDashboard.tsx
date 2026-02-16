'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DashboardShell, DashboardSection } from '@/components/dashboard/DashboardShell'
import {
  SprintProgressWidget,
  TodaysPrioritiesWidget,
  PipelineHealthWidget,
  AccountPortfolioWidget,
  ActivitySummaryWidget,
  QualityMetricsWidget,
  UpcomingCalendarWidget,
  RecentWinsWidget,
  AISuggestionsWidget,
} from './widgets'
import { RefreshCw, Settings, Plus } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'

// Types for initial data from server
export interface DashboardInitialData {
  sprintProgress?: unknown
  todaysPriorities?: unknown
  pipelineHealth?: unknown
  activitySummary?: unknown
  qualityMetrics?: unknown
  recentWins?: unknown
  accountHealth?: unknown
  upcomingInterviews?: unknown
}

interface RecruiterDashboardProps {
  userName?: string
  initialData?: DashboardInitialData
}

export function RecruiterDashboard({ userName = 'Recruiter', initialData }: RecruiterDashboardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const utils = trpc.useUtils()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([
      utils.dashboard.getSprintProgress.invalidate(),
      utils.dashboard.getTodaysPriorities.invalidate(),
      utils.dashboard.getPipelineHealth.invalidate(),
      utils.dashboard.getActivitySummary.invalidate(),
      utils.dashboard.getQualityMetrics.invalidate(),
      utils.dashboard.getRecentWins.invalidate(),
      utils.crm.accounts.getHealth.invalidate(),
      utils.ats.interviews.getUpcoming.invalidate(),
    ])
    setIsRefreshing(false)
  }

  return (
    <DashboardShell
      title={`My Dashboard`}
      description={
        <span className="flex items-center gap-2">
          Welcome back, {userName}
          <span className="text-charcoal-400">•</span>
          <span className="text-charcoal-500 text-sm">
            Last updated: {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </span>
        </span>
      }
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </>
      }
    >
      {/* Sprint Progress - Full Width */}
      <SprintProgressWidget initialData={initialData?.sprintProgress as Parameters<typeof SprintProgressWidget>[0]['initialData']} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <TodaysPrioritiesWidget initialData={initialData?.todaysPriorities as Parameters<typeof TodaysPrioritiesWidget>[0]['initialData']} />
          <PipelineHealthWidget initialData={initialData?.pipelineHealth as Parameters<typeof PipelineHealthWidget>[0]['initialData']} />
          <ActivitySummaryWidget initialData={initialData?.activitySummary as Parameters<typeof ActivitySummaryWidget>[0]['initialData']} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <AISuggestionsWidget />
          <AccountPortfolioWidget initialData={initialData?.accountHealth as Parameters<typeof AccountPortfolioWidget>[0]['initialData']} />
          <QualityMetricsWidget initialData={initialData?.qualityMetrics as Parameters<typeof QualityMetricsWidget>[0]['initialData']} />
          <UpcomingCalendarWidget initialData={initialData?.upcomingInterviews as Parameters<typeof UpcomingCalendarWidget>[0]['initialData']} />
          <RecentWinsWidget initialData={initialData?.recentWins as Parameters<typeof RecentWinsWidget>[0]['initialData']} />
        </div>
      </div>
    </DashboardShell>
  )
}
