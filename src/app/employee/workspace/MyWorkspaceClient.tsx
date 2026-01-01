'use client'

import { useRouter } from 'next/navigation'
import {
  StatsOverview,
  WorkspaceActivitiesTable,
  WorkspaceSubmissionsTable,
} from '@/components/workspace'
import type { MyWorkspaceData } from '@/types/workspace'

interface MyWorkspaceClientProps {
  data: MyWorkspaceData
}

export function MyWorkspaceClient({ data }: MyWorkspaceClientProps) {
  const router = useRouter()

  const handleRefresh = () => {
    router.refresh()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-heading font-semibold text-charcoal-900">
          My Workspace
        </h1>
        <p className="text-sm text-charcoal-500 mt-1">
          Your personal dashboard for activities, submissions, and pipeline
        </p>
      </div>

      {/* Stats Overview */}
      <StatsOverview stats={data.stats} />

      {/* Activities and Submissions Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkspaceActivitiesTable
          activities={data.activities}
          filterCounts={data.filterCounts.activities}
          onRefresh={handleRefresh}
        />
        <WorkspaceSubmissionsTable
          submissions={data.submissions}
          filterCounts={data.filterCounts.submissions}
        />
      </div>
    </div>
  )
}
