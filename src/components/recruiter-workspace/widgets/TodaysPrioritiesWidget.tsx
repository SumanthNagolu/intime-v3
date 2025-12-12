'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/lib/trpc/client'
import { AlertCircle, Clock, Flag, Calendar, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface TaskItemProps {
  id: string
  subject: string
  activityType: string
  entityType: string
  entityId: string
  dueDate?: string
  daysOverdue?: number
  priority?: string
  variant: 'overdue' | 'today' | 'high_priority' | 'upcoming'
  onComplete?: () => void
}

function TaskItem({ id, subject, activityType, entityType, dueDate, daysOverdue, priority, variant, onComplete }: TaskItemProps) {
  const utils = trpc.useUtils()
  const completeMutation = trpc.activities.complete.useMutation({
    onSuccess: () => {
      utils.dashboard.getTodaysPriorities.invalidate()
      utils.activities.getMyTasks.invalidate()
    },
  })

  const variantStyles = {
    overdue: 'border-l-4 border-l-error-500 bg-error-50/50',
    today: 'border-l-4 border-l-warning-500 bg-warning-50/50',
    high_priority: 'border-l-4 border-l-gold-500 bg-gold-50/50',
    upcoming: 'border-l-4 border-l-charcoal-200',
  }

  const handleComplete = () => {
    completeMutation.mutate({ id })
    onComplete?.()
  }

  return (
    <div className={cn('flex items-center justify-between p-3 rounded-lg', variantStyles[variant])}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={handleComplete}
          disabled={completeMutation.isPending}
          className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-charcoal-300 hover:border-success-500 hover:bg-success-50 transition-colors"
        >
          {completeMutation.isPending && (
            <CheckCircle2 className="w-4 h-4 text-success-500" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-charcoal-900 truncate">{subject}</p>
          <p className="text-xs text-charcoal-500 capitalize">
            {activityType.replace('_', ' ')} • {entityType}
          </p>
        </div>
      </div>
      {variant === 'overdue' && daysOverdue && (
        <span className="text-xs text-error-600 font-medium">
          {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
        </span>
      )}
      {variant === 'today' && dueDate && (
        <span className="text-xs text-warning-600 font-medium">
          {new Date(dueDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </span>
      )}
    </div>
  )
}

interface TodaysPrioritiesData {
  overdue: TaskItemProps[]
  dueToday: TaskItemProps[]
  highPriority: TaskItemProps[]
  counts: { total: number }
}

interface TodaysPrioritiesWidgetProps {
  className?: string
  initialData?: TodaysPrioritiesData
}

export function TodaysPrioritiesWidget({ className }: TodaysPrioritiesWidgetProps) {
  const { data, isLoading } = trpc.dashboard.getTodaysPriorities.useQuery({})

  if (isLoading) {
    return (
      <Card className={cn('bg-white', className)}>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <Card className={cn('bg-white', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-h4">Today&apos;s Priorities</CardTitle>
          <Link href="/employee/workspace/today">
            <Button variant="ghost" size="sm">View All Tasks</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overdue */}
        {data.overdue.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-error-500" />
              <span className="text-sm font-medium text-error-600">
                OVERDUE ({data.overdue.length})
              </span>
            </div>
            <div className="space-y-2">
              {data.overdue.slice(0, 3).map(task => (
                <TaskItem key={task.id} {...task} variant="overdue" />
              ))}
            </div>
          </div>
        )}

        {/* Due Today */}
        {data.dueToday.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-warning-500" />
              <span className="text-sm font-medium text-warning-600">
                DUE TODAY ({data.dueToday.length})
              </span>
            </div>
            <div className="space-y-2">
              {data.dueToday.slice(0, 4).map(task => (
                <TaskItem key={task.id} {...task} variant="today" />
              ))}
            </div>
          </div>
        )}

        {/* High Priority */}
        {data.highPriority.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flag className="w-4 h-4 text-gold-500" />
              <span className="text-sm font-medium text-gold-600">
                HIGH PRIORITY ({data.highPriority.length})
              </span>
            </div>
            <div className="space-y-2">
              {data.highPriority.slice(0, 3).map(task => (
                <TaskItem key={task.id} {...task} variant="high_priority" />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {data.counts.total === 0 && (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-success-500 mx-auto mb-2" />
            <p className="text-charcoal-600">All caught up! No pending tasks.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
