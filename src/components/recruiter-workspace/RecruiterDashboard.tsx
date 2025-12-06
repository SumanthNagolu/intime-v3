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
} from './widgets'
import { RefreshCw, Settings, Plus } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'

interface RecruiterDashboardProps {
  userName?: string
}

export function RecruiterDashboard({ userName = 'Recruiter' }: RecruiterDashboardProps) {
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
      <SprintProgressWidget />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <TodaysPrioritiesWidget />
          <PipelineHealthWidget />
          <ActivitySummaryWidget />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <AccountPortfolioWidget />
          <QualityMetricsWidget />
          <UpcomingCalendarWidget />
          <RecentWinsWidget />
        </div>
      </div>
    </DashboardShell>
  )
}
