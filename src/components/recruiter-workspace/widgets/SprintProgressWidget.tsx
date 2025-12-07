'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/lib/trpc/client'

interface MetricCardProps {
  label: string
  actual: number
  target: number
  percentage: number
  status: 'green' | 'yellow' | 'red'
  format?: 'number' | 'currency' | 'percent'
}

function MetricCard({ label, actual, target, percentage, status, format = 'number' }: MetricCardProps) {
  const formatValue = (value: number) => {
    if (format === 'currency') {
      return `$${(value / 1000).toFixed(0)}K`
    }
    if (format === 'percent') {
      return `${value}%`
    }
    return value.toString()
  }

  const statusColors = {
    green: 'bg-success-50 border-success-200 text-success-700',
    yellow: 'bg-warning-50 border-warning-200 text-warning-700',
    red: 'bg-error-50 border-error-200 text-error-700',
  }

  const statusIcons = {
    green: '🟢',
    yellow: '🟡',
    red: '🔴',
  }

  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-4 rounded-lg border',
      statusColors[status]
    )}>
      <span className="text-caption font-medium mb-1">{label}</span>
      <span className="text-h3 font-bold">
        {formatValue(actual)} / {formatValue(target)}
      </span>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-sm">{percentage}%</span>
        <span>{statusIcons[status]}</span>
      </div>
    </div>
  )
}

interface SprintProgressData {
  sprintStart: string
  sprintEnd: string
  daysElapsed: number
  daysRemaining: number
  onTrackCount: number
  totalGoals: number
  metrics: {
    placements: MetricCardProps
    revenue: MetricCardProps
    submissions: MetricCardProps
    interviews: MetricCardProps
    candidates: MetricCardProps
    jobFill: MetricCardProps
  }
}

interface SprintProgressWidgetProps {
  className?: string
  initialData?: SprintProgressData
}

export function SprintProgressWidget({ className, initialData }: SprintProgressWidgetProps) {
  const { data, isLoading } = trpc.dashboard.getSprintProgress.useQuery({}, {
    initialData,
    enabled: !initialData, // Only fetch if no initial data
  })

  if (isLoading) {
    return (
      <Card className={cn('bg-white', className)}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const startDate = new Date(data.sprintStart)
  const endDate = new Date(data.sprintEnd)
  const dateRange = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

  return (
    <Card className={cn('bg-white', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-h4">Sprint Progress</CardTitle>
          <span className="text-caption text-charcoal-500">
            Week {Math.ceil(data.daysElapsed / 7)} of 2: {dateRange}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <MetricCard
            label="Placements"
            {...data.metrics.placements}
          />
          <MetricCard
            label="Revenue"
            {...data.metrics.revenue}
            format="currency"
          />
          <MetricCard
            label="Submissions"
            {...data.metrics.submissions}
          />
          <MetricCard
            label="Interviews"
            {...data.metrics.interviews}
          />
          <MetricCard
            label="Candidates"
            {...data.metrics.candidates}
          />
          <MetricCard
            label="Job Fill Rate"
            {...data.metrics.jobFill}
            format="percent"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-charcoal-100">
          <span className="text-sm text-charcoal-600">
            Days remaining: <strong>{data.daysRemaining}</strong>
          </span>
          <span className="text-sm text-charcoal-600">
            On track to hit: <strong>{data.onTrackCount} of {data.totalGoals}</strong> goals
            {data.onTrackCount < data.totalGoals && ' ⚠'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
