'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Clock,
  AlertCircle,
  Briefcase,
  Send,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Data shape from the consolidated query
export interface SummaryData {
  priorities: {
    counts: {
      overdue: number
      dueToday: number
      total: number
    }
  }
  pipeline: {
    activeJobs: number
    urgentJobs: number
    pendingSubmissions: number
    interviewsThisWeek: number
    outstandingOffers: number
    activePlacements: number
  }
}

interface MySummaryProps {
  onMetricClick?: (metricType: string) => void
  activeMetric?: string | null
  data?: SummaryData
  isLoading?: boolean
}

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: number
  variant?: 'default' | 'warning' | 'success'
  isActive?: boolean
  onClick?: () => void
  isLoading?: boolean
}

function MetricCard({
  icon,
  label,
  value,
  variant = 'default',
  isActive,
  onClick,
  isLoading,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-300 hover:shadow-elevation-md',
        isActive && 'ring-2 ring-gold-500 shadow-elevation-md',
        variant === 'warning' && value > 0 && 'border-amber-200 bg-amber-50/50',
        variant === 'success' && 'border-green-200 bg-green-50/50'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-12" />
          </div>
        ) : (
          <>
            <div
              className={cn(
                'w-8 h-8 rounded flex items-center justify-center mb-2',
                variant === 'warning' && value > 0
                  ? 'bg-amber-100 text-amber-600'
                  : variant === 'success'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-charcoal-100 text-charcoal-600'
              )}
            >
              {icon}
            </div>
            <p className="text-sm text-charcoal-500 font-medium">{label}</p>
            <p
              className={cn(
                'text-2xl font-bold',
                variant === 'warning' && value > 0
                  ? 'text-amber-600'
                  : variant === 'success'
                  ? 'text-green-600'
                  : 'text-charcoal-900'
              )}
            >
              {value}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function MySummary({ onMetricClick, activeMetric, data, isLoading = false }: MySummaryProps) {
  // Use props data - no more client-side fetching
  const priorities = data?.priorities
  const pipeline = data?.pipeline

  // Calculate metrics
  const activitiesDueToday = priorities?.counts.dueToday ?? 0
  const overdueActivities = priorities?.counts.overdue ?? 0
  const activeJobs = pipeline?.activeJobs ?? 0
  const pendingSubmissions = pipeline?.pendingSubmissions ?? 0
  const interviewsThisWeek = pipeline?.interviewsThisWeek ?? 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <MetricCard
        icon={<Clock className="w-4 h-4" />}
        label="Due Today"
        value={activitiesDueToday}
        variant="default"
        isActive={activeMetric === 'dueToday'}
        onClick={() => onMetricClick?.('dueToday')}
        isLoading={isLoading}
      />
      <MetricCard
        icon={<AlertCircle className="w-4 h-4" />}
        label="Overdue"
        value={overdueActivities}
        variant="warning"
        isActive={activeMetric === 'overdue'}
        onClick={() => onMetricClick?.('overdue')}
        isLoading={isLoading}
      />
      <MetricCard
        icon={<Briefcase className="w-4 h-4" />}
        label="Active Jobs"
        value={activeJobs}
        isActive={activeMetric === 'jobs'}
        onClick={() => onMetricClick?.('jobs')}
        isLoading={isLoading}
      />
      <MetricCard
        icon={<Send className="w-4 h-4" />}
        label="Pending Submissions"
        value={pendingSubmissions}
        variant={pendingSubmissions > 0 ? 'warning' : 'default'}
        isActive={activeMetric === 'submissions'}
        onClick={() => onMetricClick?.('submissions')}
        isLoading={isLoading}
      />
      <MetricCard
        icon={<Calendar className="w-4 h-4" />}
        label="Interviews This Week"
        value={interviewsThisWeek}
        variant="success"
        isActive={activeMetric === 'interviews'}
        onClick={() => onMetricClick?.('interviews')}
        isLoading={isLoading}
      />
    </div>
  )
}
