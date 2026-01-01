'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Clock, Send, Briefcase, CheckCircle2, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  TeamSummaryMatrix,
  TeamActivitiesTable,
  TeamSubmissionsTable,
  TeamJobsTable,
  TeamPlacementsTable,
  TeamQueueTable,
  TeamPerformanceDashboard,
} from '@/components/team'
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
        icon={<Inbox className="w-4 h-4" />}
        label="In Queue"
        value={stats.inQueue}
        subValue={stats.inQueue > 0 ? { count: stats.inQueue, label: 'unassigned', variant: 'warning' } : undefined}
      />
    </div>
  )
}

// Summary Section - Uses TeamSummaryMatrix component
function SummarySection({
  data,
  onSectionChange,
}: {
  data: TeamWorkspaceData
  onSectionChange: (section: TeamSection, memberId?: string, filter?: string) => void
}) {
  const handleCellClick = (section: TeamSection, memberId?: string, filter?: string) => {
    onSectionChange(section, memberId, filter)
  }

  return (
    <div className="space-y-6">
      <TeamStatsOverview stats={data.stats} />
      <TeamSummaryMatrix data={data} onCellClick={handleCellClick} />
    </div>
  )
}

// Activities Section
function ActivitiesSection({
  data,
  memberId,
  filter,
}: {
  data: TeamWorkspaceData
  memberId?: string
  filter?: string
}) {
  return (
    <TeamActivitiesTable
      activities={data.activities}
      members={data.members}
      filterCounts={data.filterCounts.activities}
      initialMemberId={memberId}
      initialFilter={filter}
    />
  )
}

// Submissions Section
function SubmissionsSection({
  data,
  memberId,
  filter,
}: {
  data: TeamWorkspaceData
  memberId?: string
  filter?: string
}) {
  return (
    <TeamSubmissionsTable
      submissions={data.submissions}
      members={data.members}
      filterCounts={data.filterCounts.submissions}
      initialMemberId={memberId}
      initialFilter={filter}
    />
  )
}

// Jobs Section
function JobsSection({
  data,
  memberId,
  filter,
}: {
  data: TeamWorkspaceData
  memberId?: string
  filter?: string
}) {
  return (
    <TeamJobsTable
      jobs={data.jobs}
      members={data.members}
      initialMemberId={memberId}
      initialFilter={filter}
    />
  )
}

// Placements Section
function PlacementsSection({
  data,
  memberId,
  filter,
}: {
  data: TeamWorkspaceData
  memberId?: string
  filter?: string
}) {
  return (
    <TeamPlacementsTable
      placements={data.placements}
      members={data.members}
      initialMemberId={memberId}
      initialFilter={filter}
    />
  )
}

// Queue Section
function QueueSection({ data }: { data: TeamWorkspaceData }) {
  return (
    <TeamQueueTable
      queue={data.queue}
      members={data.members}
    />
  )
}

// Performance Section
function PerformanceSection({ data }: { data: TeamWorkspaceData }) {
  return (
    <TeamPerformanceDashboard
      performance={data.performance}
      members={data.members}
      stats={data.stats}
    />
  )
}

// Section sidebar for team workspace
function TeamSidebarNav({ currentSection, onSectionChange, data }: {
  currentSection: TeamSection
  onSectionChange: (section: TeamSection, memberId?: string, filter?: string) => void
  data: TeamWorkspaceData
}) {
  const sections: { id: TeamSection; label: string; count?: number }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'activities', label: 'Activities', count: data.stats.totalActivities },
    { id: 'submissions', label: 'Submissions', count: data.stats.totalSubmissions },
    { id: 'jobs', label: 'Jobs', count: data.stats.totalJobs },
    { id: 'placements', label: 'Placements', count: data.stats.totalPlacements },
    { id: 'queue', label: 'In Queue', count: data.stats.inQueue },
    { id: 'performance', label: 'Performance' },
  ]

  return (
    <nav className="w-56 flex-shrink-0 space-y-1">
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider px-3">
          Queue Status
        </h3>
        <button
          onClick={() => onSectionChange('queue')}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors mt-1',
            currentSection === 'queue'
              ? 'bg-gold-50 text-gold-700 border-l-2 border-gold-500'
              : 'text-charcoal-600 hover:bg-charcoal-50'
          )}
        >
          <span>In Queue</span>
          {data.stats.inQueue > 0 && (
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              data.stats.inQueue > 0 ? 'bg-warning-100 text-warning-700' : 'bg-charcoal-100 text-charcoal-600'
            )}>
              {data.stats.inQueue}
            </span>
          )}
        </button>
      </div>

      <div className="mb-4">
        <h3 className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider px-3">
          Views
        </h3>
        {sections.filter(s => s.id !== 'queue' && s.id !== 'performance').map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors',
              currentSection === section.id
                ? 'bg-gold-50 text-gold-700 border-l-2 border-gold-500'
                : 'text-charcoal-600 hover:bg-charcoal-50'
            )}
          >
            <span>{section.label}</span>
            {section.count !== undefined && section.count > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-charcoal-100 text-charcoal-600">
                {section.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div>
        <h3 className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider px-3">
          Tools
        </h3>
        <button
          onClick={() => onSectionChange('performance')}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors mt-1',
            currentSection === 'performance'
              ? 'bg-gold-50 text-gold-700 border-l-2 border-gold-500'
              : 'text-charcoal-600 hover:bg-charcoal-50'
          )}
        >
          <span>Performance</span>
        </button>
      </div>
    </nav>
  )
}

export function TeamWorkspaceClient({ data }: TeamWorkspaceClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSection = (searchParams.get('section') as TeamSection) || 'summary'

  const handleSectionChange = (section: TeamSection, memberId?: string, filter?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (section === 'summary') {
      params.delete('section')
    } else {
      params.set('section', section)
    }
    // Add optional filters
    if (memberId) {
      params.set('member', memberId)
    } else {
      params.delete('member')
    }
    if (filter) {
      params.set('filter', filter)
    } else {
      params.delete('filter')
    }
    const newUrl = params.toString() ? `?${params.toString()}` : ''
    router.push(`/employee/team${newUrl}`, { scroll: false })
  }

  // Get filter params from URL
  const memberId = searchParams.get('member') || undefined
  const filter = searchParams.get('filter') || undefined

  const renderSection = () => {
    switch (currentSection) {
      case 'summary':
        return <SummarySection data={data} onSectionChange={handleSectionChange} />
      case 'activities':
        return <ActivitiesSection data={data} memberId={memberId} filter={filter} />
      case 'submissions':
        return <SubmissionsSection data={data} memberId={memberId} filter={filter} />
      case 'jobs':
        return <JobsSection data={data} memberId={memberId} filter={filter} />
      case 'placements':
        return <PlacementsSection data={data} memberId={memberId} filter={filter} />
      case 'queue':
        return <QueueSection data={data} />
      case 'performance':
        return <PerformanceSection data={data} />
      default:
        return <SummarySection data={data} onSectionChange={handleSectionChange} />
    }
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-charcoal-100 p-4">
        <div className="mb-6">
          <h2 className="text-lg font-heading font-semibold text-charcoal-900">
            {data.team.name}
          </h2>
          <p className="text-sm text-charcoal-500 mt-1">
            {data.team.memberCount} Members • Manager: {data.team.manager.name}
          </p>
        </div>
        <TeamSidebarNav
          currentSection={currentSection}
          onSectionChange={handleSectionChange}
          data={data}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto bg-cream">
        <div className="max-w-7xl mx-auto">
          {renderSection()}
        </div>
      </div>
    </div>
  )
}
