'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Clock, Send, Briefcase, CheckCircle2, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TeamSummaryMatrix } from '@/components/team'
import type { TeamWorkspaceData, TeamSection } from '@/types/workspace'

interface TeamWorkspaceClientProps {
  data: TeamWorkspaceData
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  subValue?: { count: number; label: string; variant?: 'warning' | 'success' | 'info' }
}

function StatCard({ icon, label, value, subValue }: StatCardProps) {
  return (
    <Card className="bg-white shadow-elevation-sm hover:shadow-elevation-md transition-all duration-300">
      <CardContent className="p-4">
        <div className="w-8 h-8 rounded flex items-center justify-center mb-2 bg-charcoal-100 text-charcoal-600">
          {icon}
        </div>
        <p className="text-sm text-charcoal-500 font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-3xl font-bold text-charcoal-900">{value}</p>
        {subValue && subValue.count > 0 && (
          <p
            className={cn(
              'text-sm mt-1 flex items-center gap-1',
              subValue.variant === 'warning' && 'text-error-600',
              subValue.variant === 'success' && 'text-success-600',
              subValue.variant === 'info' && 'text-charcoal-500'
            )}
          >
            {subValue.variant === 'warning' && '!'}
            {subValue.variant === 'success' && '✓'}
            {subValue.variant === 'info' && '◐'}
            <span>{subValue.count} {subValue.label}</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// Team Stats Overview component
function TeamStatsOverview({ stats }: { stats: TeamWorkspaceData['stats'] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatCard
        icon={<Users className="w-4 h-4" />}
        label="Team Members"
        value={stats.totalMembers}
      />
      <StatCard
        icon={<Clock className="w-4 h-4" />}
        label="Activities"
        value={stats.totalActivities}
      />
      <StatCard
        icon={<Send className="w-4 h-4" />}
        label="Submissions"
        value={stats.totalSubmissions}
      />
      <StatCard
        icon={<Briefcase className="w-4 h-4" />}
        label="Open Jobs"
        value={stats.totalJobs}
      />
      <StatCard
        icon={<CheckCircle2 className="w-4 h-4" />}
        label="Placements"
        value={stats.totalPlacements}
      />
      <StatCard
        icon={<Building2 className="w-4 h-4" />}
        label="Accounts"
        value={stats.totalAccounts || 0}
      />
    </div>
  )
}

/**
 * Team Workspace Dashboard
 * Shows team summary stats and matrix overview
 * Individual sections (Jobs, Submissions, Accounts) are handled by their own pages
 */
export function TeamWorkspaceClient({ data }: TeamWorkspaceClientProps) {
  const router = useRouter()

  // Navigate to specific section pages when clicking matrix cells
  const handleCellClick = (section: TeamSection, memberId?: string, filter?: string) => {
    const sectionRoutes: Record<TeamSection, string> = {
      summary: '/employee/team',
      activities: '/employee/team/activities',
      submissions: '/employee/team/submissions',
      jobs: '/employee/team/jobs',
      placements: '/employee/team/placements',
      queue: '/employee/team/queue',
      performance: '/employee/team/performance',
    }

    const basePath = sectionRoutes[section] || '/employee/team'
    const params = new URLSearchParams()
    if (memberId) params.set('member', memberId)
    if (filter) params.set('filter', filter)

    const queryString = params.toString()
    router.push(queryString ? `${basePath}?${queryString}` : basePath)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Team Header */}
      <div>
        <h1 className="text-2xl font-heading font-semibold text-charcoal-900">
          Team Dashboard
        </h1>
        <p className="text-sm text-charcoal-500 mt-1">
          {data.team.name} • {data.team.memberCount} Members • Manager: {data.team.manager.name}
        </p>
      </div>

      {/* Stats Overview */}
      <TeamStatsOverview stats={data.stats} />

      {/* Team Summary Matrix */}
      <div className="max-w-7xl">
        <TeamSummaryMatrix data={data} onCellClick={handleCellClick} />
      </div>
    </div>
  )
}
