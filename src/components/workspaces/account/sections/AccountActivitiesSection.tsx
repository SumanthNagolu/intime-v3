'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Activity, Phone, Mail, Calendar, CheckSquare, Clock,
  MessageSquare, Linkedin, AlertCircle, Bell, User,
  Plus, Search, MoreVertical, Target, Users as UsersIcon,
  ArrowRight, X, ChevronLeft, ChevronRight, Sparkles,
  PlayCircle, SkipForward, UserPlus, AlertTriangle,
  FileText, History, CheckCircle2, XCircle, Loader2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AccountActivity } from '@/types/workspace'
import { cn } from '@/lib/utils'
import { differenceInDays, format, formatDistanceToNow, isBefore, startOfDay } from 'date-fns'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { useAccountWorkspace } from '../AccountWorkspaceProvider'
import { PatternPickerDialog } from '@/components/activities/PatternPickerDialog'
import { ActivityChecklist } from '@/components/activities/ActivityChecklist'
import { ActivityNotesThread } from '@/components/activities/ActivityNotesThread'

// Constants
const ITEMS_PER_PAGE = 10

interface AccountActivitiesSectionProps {
  activities: AccountActivity[]
  accountId: string
}

type StatusFilter = 'all' | 'pending' | 'overdue' | 'in_progress' | 'completed'

// Activity type configuration
const ACTIVITY_TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; gradient: string; label: string }> = {
  call: { icon: Phone, gradient: 'from-blue-400 to-blue-600', label: 'Call' },
  email: { icon: Mail, gradient: 'from-violet-400 to-violet-600', label: 'Email' },
  meeting: { icon: Calendar, gradient: 'from-amber-400 to-amber-600', label: 'Meeting' },
  task: { icon: CheckSquare, gradient: 'from-forest-400 to-forest-600', label: 'Task' },
  note: { icon: MessageSquare, gradient: 'from-charcoal-400 to-charcoal-500', label: 'Note' },
  follow_up: { icon: Bell, gradient: 'from-gold-400 to-gold-600', label: 'Follow Up' },
  linkedin_message: { icon: Linkedin, gradient: 'from-sky-400 to-sky-600', label: 'LinkedIn' },
}

// Status configuration
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  open: { label: 'Open', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  scheduled: { label: 'Scheduled', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  in_progress: { label: 'In Progress', bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  completed: { label: 'Completed', bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
  skipped: { label: 'Skipped', bg: 'bg-charcoal-100', text: 'text-charcoal-600', dot: 'bg-charcoal-400' },
  canceled: { label: 'Canceled', bg: 'bg-charcoal-100', text: 'text-charcoal-600', dot: 'bg-charcoal-400' },
  cancelled: { label: 'Cancelled', bg: 'bg-charcoal-100', text: 'text-charcoal-600', dot: 'bg-charcoal-400' },
}

// Priority configuration
const PRIORITY_CONFIG: Record<string, { label: string; abbr: string; bg: string; text: string }> = {
  urgent: { label: 'Urgent', abbr: 'URG', bg: 'bg-error-50', text: 'text-error-700' },
  high: { label: 'High', abbr: 'HI', bg: 'bg-amber-50', text: 'text-amber-700' },
  normal: { label: 'Normal', abbr: 'MED', bg: 'bg-blue-50', text: 'text-blue-700' },
  low: { label: 'Low', abbr: 'LO', bg: 'bg-charcoal-100', text: 'text-charcoal-600' },
}

// Helper: Get time remaining indicator
function getTimeRemainingIndicator(dueDate: string | null, status: string): { label: string; color: string; bgColor: string; isOverdue: boolean } {
  if (!dueDate || status === 'completed' || status === 'skipped' || status === 'cancelled') {
    return { label: '—', color: 'text-charcoal-400', bgColor: '', isOverdue: false }
  }

  const now = startOfDay(new Date())
  const due = startOfDay(new Date(dueDate))
  const daysRemaining = differenceInDays(due, now)

  if (daysRemaining < 0) {
    return { label: `${Math.abs(daysRemaining)}d overdue`, color: 'text-error-600', bgColor: 'bg-error-500', isOverdue: true }
  }
  if (daysRemaining === 0) {
    return { label: 'Today', color: 'text-amber-600', bgColor: 'bg-amber-500', isOverdue: false }
  }
  if (daysRemaining === 1) {
    return { label: 'Tomorrow', color: 'text-amber-600', bgColor: 'bg-amber-500', isOverdue: false }
  }
  if (daysRemaining <= 3) {
    return { label: `${daysRemaining}d`, color: 'text-amber-600', bgColor: 'bg-amber-500', isOverdue: false }
  }
  return { label: `${daysRemaining}d`, color: 'text-success-600', bgColor: 'bg-success-500', isOverdue: false }
}

// Helper: Get days open
function getDaysOpen(createdAt: string): number {
  return differenceInDays(new Date(), new Date(createdAt))
}

// Helper: Get days open indicator
function getDaysOpenIndicator(daysOpen: number): { color: string; urgency: string } {
  if (daysOpen > 14) return { color: 'text-error-600', urgency: 'Stale' }
  if (daysOpen > 7) return { color: 'text-amber-600', urgency: 'Aging' }
  return { color: 'text-success-600', urgency: '' }
}

// Helper: Calculate checklist progress
function getChecklistProgress(checklist: unknown, checklistProgress: unknown): number | null {
  if (!checklist || !Array.isArray(checklist) || checklist.length === 0) return null
  if (!checklistProgress || typeof checklistProgress !== 'object') return 0

  const progress = checklistProgress as Record<string, boolean>
  const completed = Object.values(progress).filter(Boolean).length
  return Math.round((completed / checklist.length) * 100)
}

/**
 * AccountActivitiesSection - Premium SaaS-level activity workspace
 * Features: List view with info, bottom detail panel when selected, full activity management
 */
export function AccountActivitiesSection({ activities, accountId }: AccountActivitiesSectionProps) {
  const { toast } = useToast()
  const { refreshData } = useAccountWorkspace()

  const [selectedActivity, setSelectedActivity] = React.useState<AccountActivity | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [patternPickerOpen, setPatternPickerOpen] = React.useState(false)

  // Fetch full activity detail when selected
  const { data: activityDetail, isLoading: detailLoading } = trpc.activities.getDetail.useQuery(
    { id: selectedActivity?.id! },
    { enabled: !!selectedActivity }
  )

  // Mutations
  const completeMutation = trpc.activities.complete.useMutation({
    onSuccess: () => {
      toast({ title: 'Activity completed' })
      setSelectedActivity(null)
      refreshData()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const skipMutation = trpc.activities.skip.useMutation({
    onSuccess: () => {
      toast({ title: 'Activity skipped' })
      setSelectedActivity(null)
      refreshData()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  // Calculate status counts
  const statusCounts = React.useMemo(() => {
    return {
      all: activities.length,
      pending: activities.filter(a => ['open', 'scheduled'].includes(a.status)).length,
      overdue: activities.filter(a => {
        if (!a.dueDate || a.status === 'completed' || a.status === 'skipped') return false
        return isBefore(new Date(a.dueDate), startOfDay(new Date()))
      }).length,
      in_progress: activities.filter(a => a.status === 'in_progress').length,
      completed: activities.filter(a => a.status === 'completed').length,
    }
  }, [activities])

  // Filter activities
  const filteredActivities = React.useMemo(() => {
    let result = activities

    // Status filter
    if (statusFilter === 'pending') {
      result = result.filter(a => ['open', 'scheduled'].includes(a.status))
    } else if (statusFilter === 'overdue') {
      result = result.filter(a => {
        if (!a.dueDate || a.status === 'completed' || a.status === 'skipped') return false
        return isBefore(new Date(a.dueDate), startOfDay(new Date()))
      })
    } else if (statusFilter === 'in_progress') {
      result = result.filter(a => a.status === 'in_progress')
    } else if (statusFilter === 'completed') {
      result = result.filter(a => a.status === 'completed')
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(a =>
        a.subject.toLowerCase().includes(q) ||
        a.type?.toLowerCase().includes(q) ||
        a.assignedTo?.toLowerCase().includes(q)
      )
    }

    return result
  }, [activities, searchQuery, statusFilter])

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE)
  const paginatedActivities = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredActivities.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredActivities, currentPage])

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const handleRowClick = (activity: AccountActivity) => {
    if (selectedActivity?.id === activity.id) {
      setSelectedActivity(null)
    } else {
      setSelectedActivity(activity)
    }
  }

  const handleComplete = (activityId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    completeMutation.mutate({ id: activityId })
  }

  const handleSkip = (activityId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    skipMutation.mutate({ id: activityId, reason: 'Skipped by user' })
  }

  const getActivityTypeConfig = (type: string) => {
    return ACTIVITY_TYPE_CONFIG[type] || { icon: Activity, gradient: 'from-charcoal-400 to-charcoal-500', label: type }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Premium List Card */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
        {/* Header with gradient */}
        <div className="px-5 py-4 border-b border-charcoal-100 bg-gradient-to-r from-charcoal-50/80 via-white to-gold-50/30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-sm">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Activities</h3>
                <p className="text-xs text-charcoal-500">
                  {filteredActivities.length} activit{filteredActivities.length !== 1 ? 'ies' : 'y'} for this account
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-64 text-sm border-charcoal-200 focus:border-gold-400 focus:ring-gold-400/20"
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPatternPickerOpen(true)}
              >
                <Sparkles className="h-4 w-4 mr-1.5" />
                From Pattern
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-charcoal-900 shadow-sm font-medium"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openAccountDialog', {
                    detail: { dialogId: 'logActivity', accountId }
                  }))
                }}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Log Activity
              </Button>
            </div>
          </div>

          {/* Status Filter Pills */}
          {activities.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              {[
                { key: 'all', label: 'All', count: statusCounts.all },
                { key: 'pending', label: 'Pending', count: statusCounts.pending },
                { key: 'overdue', label: 'Overdue', count: statusCounts.overdue, highlight: true },
                { key: 'in_progress', label: 'In Progress', count: statusCounts.in_progress },
                { key: 'completed', label: 'Completed', count: statusCounts.completed },
              ].filter(f => f.count > 0 || f.key === 'all').map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setStatusFilter(filter.key as StatusFilter)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    statusFilter === filter.key
                      ? filter.highlight && filter.count > 0
                        ? "bg-error-600 text-white shadow-sm"
                        : "bg-charcoal-900 text-white shadow-sm"
                      : filter.highlight && filter.count > 0
                        ? "bg-error-50 text-error-700 hover:bg-error-100"
                        : "bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200"
                  )}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[40px_1fr_110px_110px_80px_70px_80px_60px] gap-2 px-4 py-2.5 bg-charcoal-50/80 border-b border-charcoal-200/60 text-[10px] font-bold text-charcoal-400 uppercase tracking-[0.1em]">
          <div className="text-center">#</div>
          <div>Activity</div>
          <div>Assignee</div>
          <div className="text-center">Due Date</div>
          <div className="text-center">Priority</div>
          <div className="text-center">Progress</div>
          <div className="text-center">Age</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Table Body */}
        {paginatedActivities.length > 0 ? (
          <div className="divide-y divide-charcoal-100/40">
            {paginatedActivities.map((activity, idx) => {
              const rowNumber = ((currentPage - 1) * ITEMS_PER_PAGE) + idx + 1
              const typeConfig = getActivityTypeConfig(activity.type)
              const TypeIcon = typeConfig.icon
              const statusConfig = STATUS_CONFIG[activity.status] || STATUS_CONFIG.open
              const priorityConfig = activity.priority ? PRIORITY_CONFIG[activity.priority] : null
              const timeRemaining = getTimeRemainingIndicator(activity.dueDate, activity.status)
              const daysOpen = getDaysOpen(activity.createdAt)
              const daysOpenIndicator = getDaysOpenIndicator(daysOpen)
              const checklistProgress = getChecklistProgress(activity.checklist, activity.checklistProgress)
              const isPending = !['completed', 'skipped', 'cancelled', 'canceled'].includes(activity.status)

              return (
                <div
                  key={activity.id}
                  onClick={() => handleRowClick(activity)}
                  className={cn(
                    'group grid grid-cols-[40px_1fr_110px_110px_80px_70px_80px_60px] gap-2 px-4 py-3 cursor-pointer transition-all duration-150 items-center',
                    selectedActivity?.id === activity.id
                      ? 'bg-gold-50/80 border-l-2 border-l-gold-500'
                      : 'hover:bg-charcoal-50/60 border-l-2 border-l-transparent',
                    timeRemaining.isOverdue && selectedActivity?.id !== activity.id && 'bg-error-50/30'
                  )}
                >
                  {/* Row Number */}
                  <div className="text-center">
                    <span className="text-sm font-bold text-charcoal-300 tabular-nums">
                      {rowNumber}
                    </span>
                  </div>

                  {/* Activity Info */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={cn(
                      "relative w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-sm",
                      typeConfig.gradient
                    )}>
                      <TypeIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-semibold text-sm truncate",
                          activity.status === 'completed' ? 'text-charcoal-500 line-through' : 'text-charcoal-900'
                        )}>{activity.subject}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-semibold px-1.5 py-0 border-0 flex-shrink-0",
                            statusConfig.bg,
                            statusConfig.text
                          )}
                        >
                          <span className={cn("w-1 h-1 rounded-full mr-1", statusConfig.dot)} />
                          {statusConfig.label}
                        </Badge>
                        {timeRemaining.isOverdue && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-error-300 text-error-600 flex-shrink-0">
                            <AlertTriangle className="h-3 w-3 mr-0.5" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-charcoal-500">
                        <span>{typeConfig.label}</span>
                        {activity.patternCode && (
                          <>
                            <span className="text-charcoal-300">•</span>
                            <span className="truncate text-charcoal-400">{activity.patternCode}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Assignee */}
                  <div className="flex items-center gap-2">
                    {activity.assignedTo ? (
                      <>
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-charcoal-100 text-charcoal-600 text-[10px] font-semibold">
                            {activity.assignedTo.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-charcoal-600 truncate">{activity.assignedTo.split(' ')[0]}</span>
                      </>
                    ) : (
                      <span className="text-xs text-charcoal-400">Unassigned</span>
                    )}
                  </div>

                  {/* Due Date */}
                  <div className="text-center">
                    {activity.dueDate ? (
                      <div className={cn("text-xs", timeRemaining.color)}>
                        <div className="font-semibold tabular-nums">{format(new Date(activity.dueDate), 'MMM d')}</div>
                        <div className="text-[10px] text-charcoal-400">{timeRemaining.label}</div>
                      </div>
                    ) : (
                      <span className="text-charcoal-300 text-xs">—</span>
                    )}
                  </div>

                  {/* Priority */}
                  <div className="text-center">
                    {priorityConfig ? (
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wide",
                        priorityConfig.text
                      )}>
                        {priorityConfig.abbr}
                      </span>
                    ) : (
                      <span className="text-charcoal-300 text-xs">—</span>
                    )}
                  </div>

                  {/* Progress (Checklist) */}
                  <div className="text-center">
                    {checklistProgress !== null ? (
                      <div className={cn(
                        "text-xs font-bold tabular-nums",
                        checklistProgress === 100 ? 'text-success-600' :
                        checklistProgress >= 50 ? 'text-amber-600' :
                        'text-charcoal-500'
                      )}>
                        {checklistProgress}%
                      </div>
                    ) : (
                      <span className="text-charcoal-300 text-xs">—</span>
                    )}
                  </div>

                  {/* Age (Days Open) */}
                  <div className="text-center">
                    <div className={cn(
                      "inline-flex items-center justify-center gap-0.5 text-sm font-bold tabular-nums",
                      daysOpenIndicator.color
                    )}>
                      {daysOpen}
                      <span className="text-[10px] font-medium">d</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4 text-charcoal-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {isPending && (
                          <>
                            <DropdownMenuItem onClick={(e) => handleComplete(activity.id, e as unknown as React.MouseEvent)}>
                              <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-success-500" />
                              Complete
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handleSkip(activity.id, e as unknown as React.MouseEvent)}>
                              <SkipForward className="h-3.5 w-3.5 mr-2 text-charcoal-500" />
                              Skip
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-charcoal-100 to-charcoal-50 flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-charcoal-400" />
            </div>
            <p className="text-base font-medium text-charcoal-700">
              {searchQuery || statusFilter !== 'all' ? 'No activities match your filters' : 'No activities yet'}
            </p>
            <p className="text-sm text-charcoal-500 mt-1">
              {searchQuery || statusFilter !== 'all' ? 'Try different search terms or filters' : 'Log your first activity or create one from a pattern'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPatternPickerOpen(true)}
                >
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  From Pattern
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-charcoal-900"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('openAccountDialog', {
                      detail: { dialogId: 'logActivity', accountId }
                    }))
                  }}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Log Activity
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-charcoal-100 bg-charcoal-50/30 flex items-center justify-between">
            <p className="text-sm text-charcoal-500">
              Showing <span className="font-medium text-charcoal-700">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> - <span className="font-medium text-charcoal-700">{Math.min(currentPage * ITEMS_PER_PAGE, filteredActivities.length)}</span> of <span className="font-medium text-charcoal-700">{filteredActivities.length}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-charcoal-600 min-w-[100px] text-center">
                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Premium Detail Panel - Slides up from bottom */}
      {selectedActivity && (
        <ActivityDetailBottomPanel
          activity={selectedActivity}
          activityDetail={activityDetail}
          isLoading={detailLoading}
          onClose={() => setSelectedActivity(null)}
          onComplete={handleComplete}
          onSkip={handleSkip}
          refreshData={refreshData}
        />
      )}

      {/* Pattern Picker Dialog */}
      <PatternPickerDialog
        open={patternPickerOpen}
        onOpenChange={setPatternPickerOpen}
        entityType="account"
        entityId={accountId}
        onPatternSelected={(activityId) => {
          // Find the created activity and select it
          refreshData()
        }}
      />
    </div>
  )
}

// ============================================
// Activity Detail Bottom Panel
// ============================================
interface ActivityDetailBottomPanelProps {
  activity: AccountActivity
  activityDetail: unknown
  isLoading: boolean
  onClose: () => void
  onComplete: (id: string, e?: React.MouseEvent) => void
  onSkip: (id: string, e?: React.MouseEvent) => void
  refreshData: () => void
}

function ActivityDetailBottomPanel({
  activity,
  activityDetail,
  isLoading,
  onClose,
  onComplete,
  onSkip,
  refreshData,
}: ActivityDetailBottomPanelProps) {
  const detail = activityDetail as {
    activity: {
      id: string
      subject: string
      description: string | null
      instructions: string | null
      checklist: Array<{ id: string; text: string }> | null
      checklistProgress: Record<string, boolean> | null
      status: string
      priority: string | null
      dueDate: string | null
      escalationDate: string | null
      completedAt: string | null
      createdAt: string
      patternCode: string | null
      category: string | null
      escalationCount: number
      entityType: string
      assignedTo: { id: string; firstName: string; lastName: string; avatarUrl: string | null } | null
      createdBy: { id: string; firstName: string; lastName: string } | null
      queue: { id: string; name: string } | null
    }
    notes: Array<{ id: string; content: string; isInternal: boolean; createdAt: string; createdBy: { id: string; firstName: string; lastName: string } | null }>
    history: Array<{ id: string; action: string; notes: string | null; createdAt: string; changedBy: { id: string; firstName: string; lastName: string } | null }>
    escalations: Array<{ id: string; level: number; reason: string; createdAt: string }>
  } | null

  const typeConfig = ACTIVITY_TYPE_CONFIG[activity.type] || { icon: Activity, gradient: 'from-charcoal-400 to-charcoal-500', label: activity.type }
  const TypeIcon = typeConfig.icon
  const statusConfig = STATUS_CONFIG[activity.status] || STATUS_CONFIG.open
  const priorityConfig = activity.priority ? PRIORITY_CONFIG[activity.priority] : null
  const isPending = !['completed', 'skipped', 'cancelled', 'canceled'].includes(activity.status)

  // Calculate KPIs
  const timeRemaining = getTimeRemainingIndicator(activity.dueDate, activity.status)
  const checklistProgress = detail?.activity?.checklist
    ? getChecklistProgress(detail.activity.checklist, detail.activity.checklistProgress)
    : null
  const escalationLevel = detail?.activity?.escalationCount || 0
  const daysOpen = getDaysOpen(activity.createdAt)

  return (
    <div
      className="relative rounded-2xl border border-charcoal-200/40 bg-gradient-to-br from-white via-white to-cream/30 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden"
      style={{
        animation: 'slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* Decorative top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-forest-500" />

      {/* Floating close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-charcoal-900/5 hover:bg-charcoal-900/10 backdrop-blur-sm border border-charcoal-200/50 text-charcoal-500 hover:text-charcoal-700 transition-all duration-200 group"
      >
        <span className="text-xs font-medium">Close</span>
        <X className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-200" />
      </button>

      {/* Header */}
      <div className="relative px-8 pt-6 pb-5 bg-gradient-to-br from-charcoal-50/80 via-transparent to-gold-50/20">
        <div className="flex items-start gap-5">
          {/* Activity icon with glow */}
          <div className="relative">
            <div className={cn(
              "absolute inset-0 rounded-2xl blur-xl opacity-40",
              activity.status === 'completed' ? 'bg-success-400' :
              timeRemaining.isOverdue ? 'bg-error-400' :
              'bg-gold-400'
            )} />
            <div className={cn(
              "relative w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg ring-4 ring-white/80",
              typeConfig.gradient
            )}>
              <TypeIcon className="h-8 w-8 text-white drop-shadow-sm" />
            </div>
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-bold text-charcoal-900 tracking-tight">{activity.subject}</h3>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-semibold border-0 shadow-sm",
                    statusConfig.bg,
                    statusConfig.text
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse", statusConfig.dot)} />
                  {statusConfig.label}
                </Badge>
                {priorityConfig && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-semibold border-0 shadow-sm",
                      priorityConfig.bg,
                      priorityConfig.text
                    )}
                  >
                    {priorityConfig.label}
                  </Badge>
                )}
                {timeRemaining.isOverdue && (
                  <Badge variant="outline" className="text-xs font-semibold border-0 shadow-sm bg-error-50 text-error-700">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-charcoal-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                {typeConfig.label}
              </span>
              {activity.patternCode && (
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-charcoal-400" />
                  {activity.patternCode}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div
              className="grid grid-cols-4 gap-4 mb-8"
              style={{ animation: 'fadeInUp 0.4s ease-out 0.1s forwards', opacity: 0 }}
            >
              {/* Time Remaining */}
              <div className="group relative rounded-2xl bg-white border border-charcoal-100/60 p-5 text-center overflow-hidden hover:shadow-lg hover:border-charcoal-200/60 transition-all duration-300">
                <div className={cn(
                  "absolute inset-0 opacity-[0.03]",
                  timeRemaining.bgColor
                )} />
                <p className={cn(
                  "text-3xl font-black tracking-tight relative",
                  timeRemaining.color
                )}>
                  {timeRemaining.label === '—' ? '—' : timeRemaining.label.replace(' overdue', '').replace('d', '')}
                </p>
                <p className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-[0.15em] mt-2 relative">
                  {timeRemaining.isOverdue ? 'Overdue' : activity.dueDate ? 'Days Left' : 'No Due Date'}
                </p>
                {timeRemaining.isOverdue && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-error-500 animate-pulse" />}
              </div>

              {/* Checklist Progress */}
              <div className="group relative rounded-2xl bg-white border border-charcoal-100/60 p-5 text-center overflow-hidden hover:shadow-lg hover:border-blue-200/60 transition-all duration-300">
                <div className="absolute inset-0 bg-blue-500 opacity-[0.02]" />
                <p className={cn(
                  "text-3xl font-black tracking-tight relative",
                  checklistProgress === null ? 'text-charcoal-400' :
                  checklistProgress === 100 ? 'text-success-500' :
                  checklistProgress >= 50 ? 'text-amber-500' :
                  'text-blue-500'
                )}>
                  {checklistProgress !== null ? `${checklistProgress}%` : 'N/A'}
                </p>
                <p className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-[0.15em] mt-2 relative">Checklist</p>
              </div>

              {/* Escalation Level */}
              <div className="group relative rounded-2xl bg-white border border-charcoal-100/60 p-5 text-center overflow-hidden hover:shadow-lg hover:border-purple-200/60 transition-all duration-300">
                <div className="absolute inset-0 bg-purple-500 opacity-[0.02]" />
                <p className={cn(
                  "text-3xl font-black tracking-tight relative",
                  escalationLevel > 0 ? 'text-error-500' : 'text-charcoal-400'
                )}>
                  {escalationLevel > 0 ? escalationLevel : '—'}
                </p>
                <p className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-[0.15em] mt-2 relative">Escalations</p>
                {escalationLevel > 0 && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-error-500 animate-pulse" />}
              </div>

              {/* Days Open */}
              <div className="group relative rounded-2xl bg-white border border-charcoal-100/60 p-5 text-center overflow-hidden hover:shadow-lg hover:border-gold-200/60 transition-all duration-300">
                <div className="absolute inset-0 bg-gold-500 opacity-[0.02]" />
                <p className={cn(
                  "text-3xl font-black tracking-tight relative",
                  daysOpen > 14 ? 'text-error-500' :
                  daysOpen > 7 ? 'text-amber-500' :
                  'text-gold-600'
                )}>
                  {daysOpen}
                </p>
                <p className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-[0.15em] mt-2 relative">Days Open</p>
              </div>
            </div>

            {/* 3-Column Info Grid */}
            <div className="grid grid-cols-3 gap-8 mb-8">
              {/* Column 1 - Activity Details */}
              <div
                className="space-y-4"
                style={{ animation: 'fadeInUp 0.5s ease-out 0.15s forwards', opacity: 0 }}
              >
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-gold-500" />
                  <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Activity Details</h4>
                </div>
                <div className="space-y-0 rounded-2xl border border-charcoal-100/50 overflow-hidden">
                  <DetailRowEnhanced label="Type" value={typeConfig.label} />
                  <DetailRowEnhanced label="Pattern" value={detail?.activity?.patternCode} />
                  <DetailRowEnhanced label="Category" value={detail?.activity?.category} />
                  <DetailRowEnhanced label="Status" value={statusConfig.label} isLast />
                </div>
              </div>

              {/* Column 2 - Assignment */}
              <div
                className="space-y-4"
                style={{ animation: 'fadeInUp 0.5s ease-out 0.2s forwards', opacity: 0 }}
              >
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4 text-emerald-500" />
                  <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Assignment</h4>
                </div>
                <div className="space-y-0 rounded-2xl border border-charcoal-100/50 overflow-hidden">
                  <DetailRowEnhanced
                    label="Assigned To"
                    value={detail?.activity?.assignedTo
                      ? `${detail.activity.assignedTo.firstName} ${detail.activity.assignedTo.lastName}`
                      : 'Unassigned'}
                  />
                  <DetailRowEnhanced label="Queue" value={detail?.activity?.queue?.name} />
                  <DetailRowEnhanced
                    label="Created By"
                    value={detail?.activity?.createdBy
                      ? `${detail.activity.createdBy.firstName} ${detail.activity.createdBy.lastName}`
                      : null}
                    isLast
                  />
                </div>
              </div>

              {/* Column 3 - Timeline */}
              <div
                className="space-y-4"
                style={{ animation: 'fadeInUp 0.5s ease-out 0.25s forwards', opacity: 0 }}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-500" />
                  <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Timeline</h4>
                </div>
                <div className="space-y-0 rounded-2xl border border-charcoal-100/50 overflow-hidden">
                  <DetailRowEnhanced label="Created" value={activity.createdAt ? format(new Date(activity.createdAt), 'MMM d, yyyy') : null} />
                  <DetailRowEnhanced label="Due Date" value={activity.dueDate ? format(new Date(activity.dueDate), 'MMM d, yyyy') : null} highlight={timeRemaining.isOverdue} />
                  <DetailRowEnhanced label="Escalation" value={detail?.activity?.escalationDate ? format(new Date(detail.activity.escalationDate), 'MMM d, yyyy') : null} />
                  <DetailRowEnhanced label="Completed" value={detail?.activity?.completedAt ? format(new Date(detail.activity.completedAt), 'MMM d, yyyy') : null} isLast />
                </div>
              </div>
            </div>

            {/* Instructions Section (if present) */}
            {detail?.activity?.instructions && (
              <div
                className="mb-8"
                style={{ animation: 'fadeInUp 0.5s ease-out 0.3s forwards', opacity: 0 }}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-sm ring-1 ring-blue-200/50">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <h4 className="text-sm font-bold text-charcoal-800 tracking-wide uppercase">Instructions</h4>
                </div>
                <div className="relative rounded-2xl border border-blue-100/50 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white to-transparent" />
                  <div className="relative p-6">
                    <p className="text-sm text-charcoal-600 whitespace-pre-wrap leading-[1.7]">
                      {detail.activity.instructions}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Checklist Section (if present) */}
            {detail?.activity?.checklist && detail.activity.checklist.length > 0 && (
              <div
                className="mb-8"
                style={{ animation: 'fadeInUp 0.5s ease-out 0.35s forwards', opacity: 0 }}
              >
                <ActivityChecklist
                  activityId={activity.id}
                  checklist={detail.activity.checklist}
                  progress={detail.activity.checklistProgress || {}}
                />
              </div>
            )}

            {/* Description Section */}
            {(activity.description || detail?.activity?.description) && (
              <div
                className="mb-8"
                style={{ animation: 'fadeInUp 0.5s ease-out 0.4s forwards', opacity: 0 }}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center shadow-sm ring-1 ring-violet-200/50">
                    <FileText className="h-4 w-4 text-violet-600" />
                  </div>
                  <h4 className="text-sm font-bold text-charcoal-800 tracking-wide uppercase">Description</h4>
                </div>
                <div className="relative rounded-2xl border border-charcoal-100/50 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-charcoal-50/40 via-white to-violet-50/10" />
                  <div className="relative p-6 max-h-[150px] overflow-y-auto">
                    <p className="text-sm text-charcoal-600 whitespace-pre-wrap leading-[1.7]">
                      {detail?.activity?.description || activity.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes Section */}
            {detail?.notes && detail.notes.length > 0 && (
              <div
                className="mb-8"
                style={{ animation: 'fadeInUp 0.5s ease-out 0.45s forwards', opacity: 0 }}
              >
                <ActivityNotesThread
                  activityId={activity.id}
                  notes={detail.notes.map(n => ({
                    id: n.id,
                    content: n.content,
                    isInternal: n.isInternal,
                    createdAt: n.createdAt,
                    createdBy: n.createdBy ? {
                      id: n.createdBy.id,
                      full_name: `${n.createdBy.firstName} ${n.createdBy.lastName}`,
                    } : null,
                  }))}
                />
              </div>
            )}

            {/* Reference Row */}
            <div
              className="flex items-center justify-center gap-6 mb-8 text-charcoal-400"
              style={{ animation: 'fadeInUp 0.5s ease-out 0.55s forwards', opacity: 0 }}
            >
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-medium">ID</span>
                <span className="text-charcoal-300">•</span>
                <code className="font-mono text-charcoal-500">{activity.id.slice(0, 8)}</code>
              </div>
              {activity.patternCode && (
                <>
                  <div className="w-1 h-1 rounded-full bg-charcoal-300" />
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-medium">Pattern</span>
                    <span className="text-charcoal-300">•</span>
                    <span className="font-semibold text-charcoal-500">{activity.patternCode}</span>
                  </div>
                </>
              )}
            </div>

            {/* Action Footer */}
            {isPending && (
              <div
                className="pt-6 border-t border-charcoal-100/40 flex items-center justify-center gap-3"
                style={{ animation: 'fadeInUp 0.5s ease-out 0.6s forwards', opacity: 0 }}
              >
                <Button
                  onClick={() => onComplete(activity.id)}
                  className="bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white shadow-sm font-medium"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Complete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onSkip(activity.id)}
                >
                  <SkipForward className="h-4 w-4 mr-1.5" />
                  Skip
                </Button>
                <Button variant="outline">
                  <UserPlus className="h-4 w-4 mr-1.5" />
                  Reassign
                </Button>
                <Button variant="outline" className="text-error-600 hover:text-error-700 hover:bg-error-50">
                  <AlertTriangle className="h-4 w-4 mr-1.5" />
                  Escalate
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

// ============================================
// Helper Components
// ============================================
function DetailRowEnhanced({
  label,
  value,
  highlight = false,
  isLast = false
}: {
  label: string
  value: string | null | undefined
  highlight?: boolean
  isLast?: boolean
}) {
  const hasValue = value && value !== '—'

  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-3 bg-white",
      !isLast && "border-b border-charcoal-50"
    )}>
      <span className="text-xs font-medium text-charcoal-400">{label}</span>
      {hasValue ? (
        <span className={cn(
          "text-sm font-semibold",
          highlight ? "text-error-600" : "text-charcoal-800"
        )}>
          {value}
        </span>
      ) : (
        <span className="text-[11px] text-charcoal-300 font-medium">
          —
        </span>
      )}
    </div>
  )
}

export default AccountActivitiesSection
