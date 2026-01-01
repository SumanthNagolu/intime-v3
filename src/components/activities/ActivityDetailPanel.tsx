'use client'

import * as React from 'react'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  X,
  Check,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  User,
  Building2,
  Calendar,
  MessageSquare,
  History,
  CheckSquare,
  Bell,
  ArrowUpRight,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react'
import { format, formatDistanceToNow, isToday, isBefore, startOfDay } from 'date-fns'
import { cn } from '@/lib/utils'
import { ActivityChecklist } from './ActivityChecklist'
import { ActivityNotesThread } from './ActivityNotesThread'
import { ActivityHistoryTimeline } from './ActivityHistoryTimeline'

interface ActivityDetailPanelProps {
  activityId: string
  onClose: () => void
  onComplete?: () => void
}

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-charcoal-100 text-charcoal-600',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
}

const STATUS_STYLES: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  open: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-success-100 text-success-700',
  skipped: 'bg-charcoal-100 text-charcoal-600',
  canceled: 'bg-red-100 text-red-700',
}

const ACTIVITY_TYPE_ICONS: Record<string, string> = {
  call: '📞',
  email: '📧',
  meeting: '📅',
  task: '✅',
  note: '📝',
  follow_up: '🔔',
  linkedin_message: '💼',
}

/**
 * ActivityDetailPanel - Guidewire-inspired activity detail view
 * Shows full activity details with tabs for notes, history, and checklist
 */
export function ActivityDetailPanel({
  activityId,
  onClose,
  onComplete,
}: ActivityDetailPanelProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // Fetch activity detail
  const { data: activity, isLoading, error } = trpc.activities.getDetail.useQuery(
    { id: activityId },
    { enabled: !!activityId }
  )

  // Mutations
  const completeMutation = trpc.activities.complete.useMutation({
    onSuccess: () => {
      toast({ title: 'Activity completed' })
      utils.activities.getDetail.invalidate({ id: activityId })
      onComplete?.()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const skipMutation = trpc.activities.skip.useMutation({
    onSuccess: () => {
      toast({ title: 'Activity skipped' })
      utils.activities.getDetail.invalidate({ id: activityId })
      onComplete?.()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const snoozeMutation = trpc.activities.snooze.useMutation({
    onSuccess: () => {
      toast({ title: 'Activity snoozed' })
      utils.activities.getDetail.invalidate({ id: activityId })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const claimMutation = trpc.activities.claimFromQueue.useMutation({
    onSuccess: () => {
      toast({ title: 'Activity claimed' })
      utils.activities.getDetail.invalidate({ id: activityId })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const releaseMutation = trpc.activities.releaseToQueue.useMutation({
    onSuccess: () => {
      toast({ title: 'Activity released to queue' })
      utils.activities.getDetail.invalidate({ id: activityId })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const handleSnooze = (hours: number) => {
    const snoozeUntil = new Date(Date.now() + hours * 60 * 60 * 1000)
    snoozeMutation.mutate({ activityId, snoozeUntil })
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error || !activity) {
    return (
      <Card className="h-full">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-charcoal-300 mx-auto mb-4" />
          <p className="text-charcoal-500">Activity not found</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={onClose}>
            Close
          </Button>
        </CardContent>
      </Card>
    )
  }

  const isOverdue = activity.dueDate && isBefore(new Date(activity.dueDate), startOfDay(new Date()))
  const isDueToday = activity.dueDate && isToday(new Date(activity.dueDate))
  const isPending = ['open', 'in_progress', 'scheduled'].includes(activity.status)
  const isSnoozed = activity.snoozedUntil && new Date(activity.snoozedUntil) > new Date()

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="pb-3 border-b flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{ACTIVITY_TYPE_ICONS[activity.activityType] || '📋'}</span>
              <h2 className="text-lg font-semibold truncate">
                {activity.subject || 'Activity'}
              </h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn('capitalize', STATUS_STYLES[activity.status])}>
                {activity.status.replace('_', ' ')}
              </Badge>
              <Badge className={cn('capitalize', PRIORITY_STYLES[activity.priority])}>
                {activity.priority}
              </Badge>
              {isOverdue && isPending && (
                <Badge variant="outline" className="text-red-600 border-red-300">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}
              {isDueToday && isPending && !isOverdue && (
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  <Clock className="h-3 w-3 mr-1" />
                  Due Today
                </Badge>
              )}
              {isSnoozed && (
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  <Pause className="h-3 w-3 mr-1" />
                  Snoozed
                </Badge>
              )}
              {activity.escalationCount > 0 && (
                <Badge variant="outline" className="text-red-600 border-red-300">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  Level {activity.escalationCount}
                </Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Content with Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="details" className="h-full flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4">
            <TabsTrigger value="details" className="gap-1">
              <User className="h-3 w-3" />
              Details
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-1">
              <MessageSquare className="h-3 w-3" />
              Notes
              {activity.notes.length > 0 && (
                <span className="ml-1 text-xs bg-charcoal-200 px-1.5 rounded-full">
                  {activity.notes.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1">
              <History className="h-3 w-3" />
              History
            </TabsTrigger>
            {activity.checklist && (activity.checklist as unknown[]).length > 0 && (
              <TabsTrigger value="checklist" className="gap-1">
                <CheckSquare className="h-3 w-3" />
                Checklist
              </TabsTrigger>
            )}
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            {/* Details Tab */}
            <TabsContent value="details" className="m-0 p-4 space-y-6">
              {/* Description */}
              {activity.description && (
                <div>
                  <h4 className="text-sm font-medium text-charcoal-700 mb-2">Description</h4>
                  <p className="text-sm text-charcoal-600 whitespace-pre-wrap">
                    {activity.description}
                  </p>
                </div>
              )}

              {/* Instructions */}
              {activity.instructions && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Instructions</h4>
                  <p className="text-sm text-blue-700 whitespace-pre-wrap">
                    {activity.instructions}
                  </p>
                </div>
              )}

              {/* Key Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Due Date */}
                <div>
                  <h4 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-1">
                    Due Date
                  </h4>
                  {activity.dueDate ? (
                    <p className={cn(
                      "text-sm font-medium",
                      isOverdue && isPending && "text-red-600",
                      isDueToday && isPending && !isOverdue && "text-amber-600"
                    )}>
                      {format(new Date(activity.dueDate), 'PPp')}
                      <span className="text-charcoal-500 font-normal ml-2">
                        ({formatDistanceToNow(new Date(activity.dueDate), { addSuffix: true })})
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-charcoal-400">No due date</p>
                  )}
                </div>

                {/* Assigned To */}
                <div>
                  <h4 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-1">
                    Assigned To
                  </h4>
                  {activity.assignedTo ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={activity.assignedTo.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {activity.assignedTo.full_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{activity.assignedTo.full_name}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-charcoal-400">Unassigned</p>
                  )}
                </div>

                {/* Entity */}
                <div>
                  <h4 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-1">
                    Related To
                  </h4>
                  {activity.entityInfo ? (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-charcoal-400" />
                      <span className="text-sm">
                        {(activity.entityInfo as { name?: string }).name || activity.entityType}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-charcoal-400 capitalize">{activity.entityType}</p>
                  )}
                </div>

                {/* Pattern */}
                {activity.patternCode && (
                  <div>
                    <h4 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-1">
                      Pattern
                    </h4>
                    <p className="text-sm text-charcoal-600">
                      {activity.pattern?.name || activity.patternCode}
                    </p>
                  </div>
                )}

                {/* Queue */}
                {activity.queue && (
                  <div>
                    <h4 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-1">
                      Queue
                    </h4>
                    <p className="text-sm text-charcoal-600">
                      {(activity.queue as { name: string }).name}
                    </p>
                  </div>
                )}

                {/* Created */}
                <div>
                  <h4 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-1">
                    Created
                  </h4>
                  <p className="text-sm text-charcoal-600">
                    {format(new Date(activity.createdAt), 'PP')}
                  </p>
                </div>
              </div>

              {/* Outcome (if completed) */}
              {activity.status === 'completed' && (
                <div className="bg-success-50 border border-success-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-success-800 mb-1">Outcome</h4>
                  <p className="text-sm text-success-700">
                    {activity.outcome || 'Completed'}
                    {activity.outcomeNotes && ` - ${activity.outcomeNotes}`}
                  </p>
                  {activity.completedAt && (
                    <p className="text-xs text-success-600 mt-1">
                      Completed {formatDistanceToNow(new Date(activity.completedAt), { addSuffix: true })}
                    </p>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="m-0 h-full">
              <ActivityNotesThread
                activityId={activityId}
                notes={activity.notes}
              />
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="m-0 p-4">
              <ActivityHistoryTimeline
                history={activity.history}
                escalations={activity.escalations}
              />
            </TabsContent>

            {/* Checklist Tab */}
            {activity.checklist && (activity.checklist as unknown[]).length > 0 && (
              <TabsContent value="checklist" className="m-0 p-4">
                <ActivityChecklist
                  activityId={activityId}
                  checklist={activity.checklist as Array<{ id: string; text: string }>}
                  progress={activity.checklistProgress as Record<string, boolean> | null}
                />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>

      {/* Footer Actions */}
      {isPending && (
        <div className="border-t p-4 flex items-center justify-between bg-charcoal-50">
          <div className="flex items-center gap-2">
            {/* Claim/Release button */}
            {activity.queue && !activity.assignedTo && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => claimMutation.mutate({ activityId })}
                disabled={claimMutation.isPending}
              >
                <Play className="h-4 w-4 mr-1" />
                Claim
              </Button>
            )}
            {activity.queue && activity.assignedTo && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => releaseMutation.mutate({ activityId })}
                disabled={releaseMutation.isPending}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Release
              </Button>
            )}

            {/* Snooze dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" disabled={snoozeMutation.isPending}>
                  <Bell className="h-4 w-4 mr-1" />
                  Snooze
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => handleSnooze(1)}>
                  1 hour
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSnooze(4)}>
                  4 hours
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSnooze(24)}>
                  Tomorrow
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSnooze(72)}>
                  3 days
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => skipMutation.mutate({ id: activityId })}
              disabled={skipMutation.isPending}
            >
              Skip
            </Button>
            <Button
              size="sm"
              onClick={() => completeMutation.mutate({ id: activityId })}
              disabled={completeMutation.isPending}
              className="bg-success-600 hover:bg-success-700"
            >
              <Check className="h-4 w-4 mr-1" />
              Complete
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

export default ActivityDetailPanel

