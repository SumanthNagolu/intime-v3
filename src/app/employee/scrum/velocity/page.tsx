'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import { useTeamSpace } from '@/components/team-space'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { trpc } from '@/lib/trpc/client'
import {
  TrendingUp,
  Target,
  Zap,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  Loader2,
  CheckCircle2,
  Clock,
  ListTodo,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function VelocityPage() {
  const { sprints, activeSprint } = useTeamSpace()

  // Fetch velocity data
  const { data: velocityData, isLoading } = trpc.sprints.getVelocity.useQuery(
    { limit: 10 },
    { refetchOnWindowFocus: false }
  )

  // Calculate stats
  const stats = useMemo(() => {
    if (!velocityData || velocityData.length === 0) {
      return {
        averageVelocity: 0,
        averageCommitment: 0,
        avgCompletionRate: 0,
        trend: 'stable' as const,
        trendValue: 0,
      }
    }

    const completedSprints = velocityData.filter((s) => s.completedPoints > 0)
    const averageVelocity = completedSprints.length > 0
      ? Math.round(completedSprints.reduce((sum, s) => sum + s.completedPoints, 0) / completedSprints.length)
      : 0

    const averageCommitment = completedSprints.length > 0
      ? Math.round(completedSprints.reduce((sum, s) => sum + s.plannedPoints, 0) / completedSprints.length)
      : 0

    const avgCompletionRate = completedSprints.length > 0
      ? Math.round(
          completedSprints.reduce((sum, s) => {
            return sum + (s.plannedPoints > 0 ? (s.completedPoints / s.plannedPoints) * 100 : 0)
          }, 0) / completedSprints.length
        )
      : 0

    // Calculate trend (comparing last 3 vs previous 3)
    let trend: 'up' | 'down' | 'stable' = 'stable'
    let trendValue = 0

    if (completedSprints.length >= 6) {
      const recent3 = completedSprints.slice(0, 3)
      const previous3 = completedSprints.slice(3, 6)
      const recentAvg = recent3.reduce((sum, s) => sum + s.completedPoints, 0) / 3
      const previousAvg = previous3.reduce((sum, s) => sum + s.completedPoints, 0) / 3

      trendValue = Math.round(((recentAvg - previousAvg) / previousAvg) * 100)
      trend = trendValue > 5 ? 'up' : trendValue < -5 ? 'down' : 'stable'
    }

    return { averageVelocity, averageCommitment, avgCompletionRate, trend, trendValue }
  }, [velocityData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-charcoal-900">Velocity & Analytics</h1>
        <p className="text-sm text-charcoal-500 mt-1">
          Track team performance and sprint metrics over time
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white shadow-elevation-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                  Average Velocity
                </p>
                <p className="text-3xl font-bold text-charcoal-900 mt-1">
                  {stats.averageVelocity}
                </p>
                <p className="text-sm text-charcoal-500 mt-1">points per sprint</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gold-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-gold-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-elevation-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                  Avg Commitment
                </p>
                <p className="text-3xl font-bold text-charcoal-900 mt-1">
                  {stats.averageCommitment}
                </p>
                <p className="text-sm text-charcoal-500 mt-1">points planned</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-elevation-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                  Completion Rate
                </p>
                <p className="text-3xl font-bold text-charcoal-900 mt-1">
                  {stats.avgCompletionRate}%
                </p>
                <p className="text-sm text-charcoal-500 mt-1">of committed work</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-elevation-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                  Velocity Trend
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl font-bold text-charcoal-900">
                    {Math.abs(stats.trendValue)}%
                  </p>
                  {stats.trend === 'up' && <ArrowUp className="w-5 h-5 text-green-500" />}
                  {stats.trend === 'down' && <ArrowDown className="w-5 h-5 text-red-500" />}
                  {stats.trend === 'stable' && <Minus className="w-5 h-5 text-charcoal-400" />}
                </div>
                <p className="text-sm text-charcoal-500 mt-1">
                  {stats.trend === 'up' && 'improving'}
                  {stats.trend === 'down' && 'declining'}
                  {stats.trend === 'stable' && 'stable'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-charcoal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Velocity Chart (Simple Bar Representation) */}
      <Card className="bg-white shadow-elevation-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-charcoal-600" />
            Sprint Velocity History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {velocityData && velocityData.length > 0 ? (
            <div className="space-y-4">
              {/* Legend */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  <span className="text-charcoal-600">Planned</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span className="text-charcoal-600">Completed</span>
                </div>
              </div>

              {/* Bars */}
              <div className="space-y-3">
                {velocityData.slice().reverse().map((sprint) => {
                  const maxPoints = Math.max(...velocityData.map((s) => Math.max(s.plannedPoints, s.completedPoints)), 1)
                  const plannedWidth = (sprint.plannedPoints / maxPoints) * 100
                  const completedWidth = (sprint.completedPoints / maxPoints) * 100
                  const completionRate = sprint.plannedPoints > 0
                    ? Math.round((sprint.completedPoints / sprint.plannedPoints) * 100)
                    : 0

                  return (
                    <div key={sprint.sprintId} className="group">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-charcoal-700">
                          {sprint.sprintName}
                        </span>
                        <div className="flex items-center gap-4 text-xs text-charcoal-500">
                          <span>Planned: {sprint.plannedPoints}</span>
                          <span>Completed: {sprint.completedPoints}</span>
                          <span className={cn(
                            'font-medium',
                            completionRate >= 90 && 'text-green-600',
                            completionRate >= 70 && completionRate < 90 && 'text-amber-600',
                            completionRate < 70 && 'text-red-600'
                          )}>
                            {completionRate}%
                          </span>
                        </div>
                      </div>
                      <div className="h-6 bg-charcoal-100 rounded-lg overflow-hidden relative">
                        <div
                          className="absolute top-0 left-0 h-full bg-blue-200 rounded-lg transition-all duration-300"
                          style={{ width: `${plannedWidth}%` }}
                        />
                        <div
                          className="absolute top-0 left-0 h-full bg-green-500 rounded-lg transition-all duration-300"
                          style={{ width: `${completedWidth}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
              <h3 className="text-lg font-medium text-charcoal-600 mb-2">No Data Yet</h3>
              <p className="text-sm text-charcoal-400">
                Complete sprints to see velocity data here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Sprint Stats */}
      {activeSprint && (
        <Card className="bg-white shadow-elevation-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-charcoal-600" />
              Current Sprint: {activeSprint.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-1">
                  Total Items
                </p>
                <p className="text-2xl font-bold text-charcoal-900">
                  {activeSprint.totalItems}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-1">
                  Completed
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {activeSprint.completedItems}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-1">
                  Total Points
                </p>
                <p className="text-2xl font-bold text-charcoal-900">
                  {activeSprint.totalPoints}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-1">
                  Progress
                </p>
                <p className="text-2xl font-bold text-gold-600">
                  {activeSprint.totalItems > 0
                    ? Math.round((activeSprint.completedItems / activeSprint.totalItems) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
