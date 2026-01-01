'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CheckCircle2,
  Send,
  Trophy,
  TrendingUp,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TeamPerformanceMetrics, TeamMember, TeamWorkspaceData } from '@/types/workspace'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  subtext?: string
  variant?: 'default' | 'success' | 'warning'
}

function StatCard({ icon, label, value, subtext, variant = 'default' }: StatCardProps) {
  return (
    <Card className="bg-white shadow-elevation-sm">
      <CardContent className="p-4">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
            variant === 'success' && 'bg-success-100 text-success-600',
            variant === 'warning' && 'bg-warning-100 text-warning-600',
            variant === 'default' && 'bg-charcoal-100 text-charcoal-600'
          )}
        >
          {icon}
        </div>
        <p className="text-sm text-charcoal-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-charcoal-900 mt-1">{value}</p>
        {subtext && <p className="text-xs text-charcoal-400 mt-1">{subtext}</p>}
      </CardContent>
    </Card>
  )
}

interface TopPerformerCardProps {
  member: TeamMember
  metric: string
  value: number
  rank: number
}

function TopPerformerCard({ member, metric, value, rank }: TopPerformerCardProps) {
  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gold-50 to-transparent border border-gold-100">
      <div className="relative">
        {member.avatarUrl ? (
          <img
            src={member.avatarUrl}
            alt={member.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center text-sm font-medium text-charcoal-600">
            {initials}
          </div>
        )}
        {rank === 1 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center">
            <Trophy className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <p className="font-medium text-charcoal-900">{member.name}</p>
        <p className="text-sm text-charcoal-500">{metric}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-charcoal-900">{value}</p>
        <p className="text-xs text-charcoal-400">#{rank}</p>
      </div>
    </div>
  )
}

interface TeamPerformanceDashboardProps {
  performance: TeamPerformanceMetrics[]
  members: TeamMember[]
  stats: TeamWorkspaceData['stats']
}

export function TeamPerformanceDashboard({
  performance,
  members,
  stats,
}: TeamPerformanceDashboardProps) {
  // Calculate team totals
  const totals = useMemo(() => {
    return performance.reduce(
      (acc, p) => ({
        activitiesCompleted: acc.activitiesCompleted + p.activitiesCompleted,
        submissionsMade: acc.submissionsMade + p.submissionsMade,
        placementsClosed: acc.placementsClosed + p.placementsClosed,
      }),
      { activitiesCompleted: 0, submissionsMade: 0, placementsClosed: 0 }
    )
  }, [performance])

  // Get top performers
  const topByActivities = useMemo(() => {
    return [...performance]
      .sort((a, b) => b.activitiesCompleted - a.activitiesCompleted)
      .slice(0, 3)
  }, [performance])

  const topBySubmissions = useMemo(() => {
    return [...performance]
      .sort((a, b) => b.submissionsMade - a.submissionsMade)
      .slice(0, 3)
  }, [performance])

  const topByPlacements = useMemo(() => {
    return [...performance]
      .sort((a, b) => b.placementsClosed - a.placementsClosed)
      .slice(0, 3)
  }, [performance])

  // Member lookup
  const memberLookup = new Map(members.map((m) => [m.id, m]))

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Activities Completed"
          value={totals.activitiesCompleted}
          subtext="All time"
          variant="success"
        />
        <StatCard
          icon={<Send className="w-5 h-5" />}
          label="Submissions Made"
          value={totals.submissionsMade}
          subtext="All time"
        />
        <StatCard
          icon={<Trophy className="w-5 h-5" />}
          label="Placements Closed"
          value={totals.placementsClosed}
          subtext="All time"
          variant="success"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Active Workload"
          value={stats.totalActivities + stats.totalSubmissions}
          subtext="Open items"
        />
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white shadow-elevation-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-charcoal-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Top by Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topByActivities.map((p, index) => {
              const member = memberLookup.get(p.memberId)
              if (!member) return null
              return (
                <TopPerformerCard
                  key={p.memberId}
                  member={member}
                  metric="activities completed"
                  value={p.activitiesCompleted}
                  rank={index + 1}
                />
              )
            })}
            {topByActivities.length === 0 && (
              <p className="text-sm text-charcoal-400 text-center py-4">No data yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-elevation-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-charcoal-600 flex items-center gap-2">
              <Send className="w-4 h-4" />
              Top by Submissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topBySubmissions.map((p, index) => {
              const member = memberLookup.get(p.memberId)
              if (!member) return null
              return (
                <TopPerformerCard
                  key={p.memberId}
                  member={member}
                  metric="submissions made"
                  value={p.submissionsMade}
                  rank={index + 1}
                />
              )
            })}
            {topBySubmissions.length === 0 && (
              <p className="text-sm text-charcoal-400 text-center py-4">No data yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-elevation-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-charcoal-600 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Top by Placements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topByPlacements.map((p, index) => {
              const member = memberLookup.get(p.memberId)
              if (!member) return null
              return (
                <TopPerformerCard
                  key={p.memberId}
                  member={member}
                  metric="placements closed"
                  value={p.placementsClosed}
                  rank={index + 1}
                />
              )
            })}
            {topByPlacements.length === 0 && (
              <p className="text-sm text-charcoal-400 text-center py-4">No data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      <Card className="bg-white shadow-elevation-sm">
        <CardHeader>
          <CardTitle className="text-lg font-heading flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Individual Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Member</TableHead>
                <TableHead className="text-right">Activities Completed</TableHead>
                <TableHead className="text-right">Submissions Made</TableHead>
                <TableHead className="text-right">Placements Closed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performance.map((p) => {
                const member = memberLookup.get(p.memberId)
                const initials = p.memberName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)

                return (
                  <TableRow key={p.memberId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {member?.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={p.memberName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-charcoal-100 flex items-center justify-center text-xs font-medium text-charcoal-600">
                            {initials}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-charcoal-900">{p.memberName}</p>
                          <p className="text-xs text-charcoal-500 capitalize">
                            {member?.role || 'Team Member'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          'font-medium',
                          p.activitiesCompleted > 0 ? 'text-success-600' : 'text-charcoal-400'
                        )}
                      >
                        {p.activitiesCompleted}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          'font-medium',
                          p.submissionsMade > 0 ? 'text-charcoal-900' : 'text-charcoal-400'
                        )}
                      >
                        {p.submissionsMade}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          'font-medium',
                          p.placementsClosed > 0 ? 'text-success-600' : 'text-charcoal-400'
                        )}
                      >
                        {p.placementsClosed}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
