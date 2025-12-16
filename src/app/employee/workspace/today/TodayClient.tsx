'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { trpc } from '@/lib/trpc/client'
import { LogActivityModal } from '@/components/recruiter-workspace/LogActivityModal'
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Flag,
  Phone,
  Mail,
  FileText,
  MessageSquare,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Types for the consolidated data
export interface TodayTask {
  id: string
  subject: string | null
  activityType: string
  entityType: string
  entityId: string
  status: string
  priority: string | null
  dueDate: string | null
  isOverdue: boolean
  isDueToday: boolean
  isThisWeek: boolean
}

export interface TodayData {
  counts: {
    overdue: number
    today: number
    thisWeek: number
    all: number
  }
  tasks: TodayTask[]
}

interface TodayClientProps {
  initialData: TodayData
}

interface TaskItemProps {
  task: TodayTask
  onComplete: () => void
}

const activityIcons: Record<string, React.ElementType> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  linkedin_message: MessageSquare,
  task: CheckCircle2,
  follow_up: Clock,
}

function TaskItem({ task, onComplete }: TaskItemProps) {
  const utils = trpc.useUtils()
  const completeMutation = trpc.activities.complete.useMutation({
    onSuccess: () => {
      toast.success('Task completed')
      utils.dashboard.getTodayData.invalidate()
      onComplete()
    },
    onError: (error) => {
      toast.error('Failed to complete task', { description: error.message })
    },
  })

  const skipMutation = trpc.activities.skip.useMutation({
    onSuccess: () => {
      toast.success('Task skipped')
      utils.dashboard.getTodayData.invalidate()
    },
  })

  const Icon = activityIcons[task.activityType] || FileText

  const priorityStyles: Record<string, string> = {
    urgent: 'border-l-4 border-l-error-500',
    high: 'border-l-4 border-l-warning-500',
    normal: 'border-l-4 border-l-charcoal-300',
    low: 'border-l-4 border-l-charcoal-200',
  }

  return (
    <div className={cn(
      'flex items-center gap-4 p-4 bg-white rounded-lg border',
      priorityStyles[task.priority || 'normal'],
      task.isOverdue && 'bg-error-50/50',
      task.isDueToday && !task.isOverdue && 'bg-warning-50/30'
    )}>
      <button
        onClick={() => completeMutation.mutate({ id: task.id })}
        disabled={completeMutation.isPending}
        className={cn(
          'flex-shrink-0 w-6 h-6 rounded-full border-2 transition-colors',
          completeMutation.isPending
            ? 'bg-success-500 border-success-500'
            : 'border-charcoal-300 hover:border-success-500 hover:bg-success-50'
        )}
      >
        {completeMutation.isPending && (
          <CheckCircle2 className="w-5 h-5 text-white" />
        )}
      </button>

      <div className="flex-shrink-0 p-2 bg-charcoal-100 rounded-lg">
        <Icon className="w-4 h-4 text-charcoal-600" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-charcoal-900 truncate">{task.subject || 'No subject'}</p>
        <p className="text-sm text-charcoal-500 capitalize">
          {task.activityType.replace('_', ' ')} • {task.entityType}
        </p>
      </div>

      {task.dueDate && (
        <div className="flex-shrink-0 text-right">
          {task.isOverdue ? (
            <span className="text-sm text-error-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Overdue
            </span>
          ) : task.isDueToday ? (
            <span className="text-sm text-warning-600 font-medium">
              Due Today
            </span>
          ) : (
            <span className="text-sm text-charcoal-500">
              {new Date(task.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => skipMutation.mutate({ id: task.id })}
        disabled={skipMutation.isPending}
        className="text-charcoal-400 hover:text-charcoal-600"
      >
        Skip
      </Button>
    </div>
  )
}

export function TodayClient({ initialData }: TodayClientProps) {
  const router = useRouter()
  const [showLogActivity, setShowLogActivity] = useState(false)
  const [filter, setFilter] = useState<'all' | 'overdue' | 'today' | 'this_week'>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const utils = trpc.useUtils()

  // Use data from props (server component fetched it)
  const data = initialData

  // Filter tasks client-side based on filter state
  const filteredTasks = useMemo(() => {
    if (!data?.tasks) return []

    switch (filter) {
      case 'overdue':
        return data.tasks.filter(t => t.isOverdue)
      case 'today':
        return data.tasks.filter(t => t.isDueToday)
      case 'this_week':
        return data.tasks.filter(t => t.isThisWeek)
      default:
        return data.tasks
    }
  }, [data?.tasks, filter])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await utils.dashboard.getTodayData.invalidate()
      router.refresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <>
      <DashboardShell
        title="Today"
        description={
          <span>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn('w-4 h-4 mr-2', isRefreshing && 'animate-spin')} />
              Refresh
            </Button>
            <Button onClick={() => setShowLogActivity(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Log Activity
            </Button>
          </div>
        }
      >
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-error-50 border-error-200">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-error-600">Overdue</p>
                  <p className="text-2xl font-bold text-error-700">
                    {data.counts.overdue}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-error-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-warning-50 border-warning-200">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-warning-600">Due Today</p>
                  <p className="text-2xl font-bold text-warning-700">
                    {data.counts.today}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-warning-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-charcoal-50 border-charcoal-200">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-600">This Week</p>
                  <p className="text-2xl font-bold text-charcoal-700">
                    {data.counts.thisWeek}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-charcoal-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-charcoal-50 border-charcoal-200">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-600">Total Pending</p>
                  <p className="text-2xl font-bold text-charcoal-700">
                    {data.counts.all}
                  </p>
                </div>
                <Flag className="w-8 h-8 text-charcoal-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mb-4">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              All
              <span className="bg-charcoal-100 px-2 py-0.5 rounded-full text-xs">
                {data.counts.all}
              </span>
            </TabsTrigger>
            <TabsTrigger value="overdue" className="gap-2">
              Overdue
              {data.counts.overdue > 0 && (
                <span className="bg-error-100 text-error-700 px-2 py-0.5 rounded-full text-xs">
                  {data.counts.overdue}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="today" className="gap-2">
              Today
              {data.counts.today > 0 && (
                <span className="bg-warning-100 text-warning-700 px-2 py-0.5 rounded-full text-xs">
                  {data.counts.today}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="this_week" className="gap-2">
              This Week
              <span className="bg-charcoal-100 px-2 py-0.5 rounded-full text-xs">
                {data.counts.thisWeek}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Task List */}
        <Card>
          <CardContent className="pt-6">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 text-success-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-charcoal-900 mb-2">
                  {filter === 'all' ? 'All caught up!' : `No ${filter.replace('_', ' ')} tasks`}
                </p>
                <p className="text-charcoal-500 mb-4">
                  Great job! You have no pending tasks.
                </p>
                <Button onClick={() => setShowLogActivity(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Log an Activity
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={() => {}}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardShell>

      <LogActivityModal
        open={showLogActivity}
        onOpenChange={setShowLogActivity}
      />
    </>
  )
}
