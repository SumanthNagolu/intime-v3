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
  SkipForward, UserPlus, AlertTriangle,
  FileText, CheckCircle2, Loader2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ContactActivity } from '@/types/workspace'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow, differenceInDays, isBefore, startOfDay } from 'date-fns'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { useContactWorkspace } from '../ContactWorkspaceProvider'

// Constants
const ITEMS_PER_PAGE = 10

interface ContactActivitiesSectionProps {
  activities: ContactActivity[]
  contactId: string
}

type StatusFilter = 'all' | 'pending' | 'overdue' | 'in_progress' | 'completed'

// Activity type configuration with icons and gradients
const ACTIVITY_TYPE_CONFIG: Record<string, {
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  label: string
}> = {
  call: { icon: Phone, gradient: 'from-blue-400 to-blue-600', label: 'Call' },
  email: { icon: Mail, gradient: 'from-violet-400 to-violet-600', label: 'Email' },
  meeting: { icon: Calendar, gradient: 'from-amber-400 to-amber-600', label: 'Meeting' },
  task: { icon: CheckSquare, gradient: 'from-emerald-400 to-emerald-600', label: 'Task' },
  follow_up: { icon: Bell, gradient: 'from-orange-400 to-orange-600', label: 'Follow-up' },
  linkedin: { icon: Linkedin, gradient: 'from-sky-400 to-sky-600', label: 'LinkedIn' },
  note: { icon: MessageSquare, gradient: 'from-rose-400 to-rose-600', label: 'Note' },
  reminder: { icon: Clock, gradient: 'from-indigo-400 to-indigo-600', label: 'Reminder' },
  outreach: { icon: Target, gradient: 'from-teal-400 to-teal-600', label: 'Outreach' },
}

// Status configuration
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  open: { label: 'Open', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  scheduled: { label: 'Scheduled', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  in_progress: { label: 'In Progress', bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  completed: { label: 'Completed', bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
  skipped: { label: 'Skipped', bg: 'bg-charcoal-100', text: 'text-charcoal-600', dot: 'bg-charcoal-400' },
  cancelled: { label: 'Cancelled', bg: 'bg-charcoal-100', text: 'text-charcoal-500', dot: 'bg-charcoal-400' },
}

// Helper function to get time remaining indicator
function getTimeRemainingIndicator(dueDate: string | null, status: string): {
  label: string
  color: string
  bgColor: string
  isOverdue: boolean
} {
  if (!dueDate || status === 'completed' || status === 'skipped' || status === 'cancelled') {
    return { label: '—', color: 'text-charcoal-400', bgColor: '', isOverdue: false }
  }

  const now = startOfDay(new Date())
  const due = startOfDay(new Date(dueDate))
  const diff = differenceInDays(due, now)

  if (diff < 0) {
    return {
      label: `${Math.abs(diff)}d overdue`,
      color: 'text-error-600',
      bgColor: 'bg-error-500',
      isOverdue: true
    }
  }
  if (diff === 0) {
    return {
      label: 'Due today',
      color: 'text-amber-600',
      bgColor: 'bg-amber-500',
      isOverdue: false
    }
  }
  if (diff <= 3) {
    return {
      label: `${diff}d left`,
      color: 'text-amber-600',
      bgColor: 'bg-amber-500',
      isOverdue: false
    }
  }
  return {
    label: `${diff}d left`,
    color: 'text-charcoal-500',
    bgColor: 'bg-charcoal-400',
    isOverdue: false
  }
}

// Helper function to calculate days open
function getDaysOpen(createdAt: string): number {
  return differenceInDays(new Date(), new Date(createdAt))
}

/**
 * ContactActivitiesSection - Premium SaaS-level activity management
 * Features: Table list view with headers, status filters, pagination, bottom detail panel
 */
export function ContactActivitiesSection({ activities, contactId }: ContactActivitiesSectionProps) {
  const { toast } = useToast()
  const { refreshData } = useContactWorkspace()

  const [selectedActivity, setSelectedActivity] = React.useState<ContactActivity | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all')
  const [currentPage, setCurrentPage] = React.useState(1)

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

  const handleRowClick = (activity: ContactActivity) => {
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

  const handleSkip = (activityId: string, reason: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    skipMutation.mutate({ id: activityId, reason })
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
                  {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'} for this contact
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
                className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-charcoal-900 shadow-sm font-medium"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openContactDialog', {
                    detail: { dialogId: 'createActivity', contactId }
                  }))
                }}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Log Activity
              </Button>
            </div>
          </div>

          {/* Filter Pills */}
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
        <div className="grid grid-cols-[40px_1fr_110px_110px_80px_80px_60px] gap-2 px-4 py-2.5 bg-charcoal-50/80 border-b border-charcoal-200/60 text-[10px] font-bold text-charcoal-400 uppercase tracking-[0.1em]">
          <div className="text-center">#</div>
          <div>Activity</div>
          <div>Assignee</div>
          <div className="text-center">Due</div>
          <div className="text-center">Status</div>
          <div className="text-center">Priority</div>
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
              const timeRemaining = getTimeRemainingIndicator(activity.dueDate, activity.status)

              return (
                <div
                  key={activity.id}
                  onClick={() => handleRowClick(activity)}
                  className={cn(
                    'group grid grid-cols-[40px_1fr_110px_110px_80px_80px_60px] gap-2 px-4 py-3 cursor-pointer transition-all duration-150 items-center',
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
                        <span className="font-semibold text-sm truncate text-charcoal-900">
                          {activity.subject}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-charcoal-500">
                        <span className="capitalize">{typeConfig.label}</span>
                        <span className="text-charcoal-400">•</span>
                        <span>{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Assignee */}
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-charcoal-100 text-charcoal-600 text-[10px] font-semibold">
                        {activity.assignedTo?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-charcoal-600 truncate">{activity.assignedTo?.split(' ')[0] || '—'}</span>
                  </div>

                  {/* Due Date */}
                  <div className="text-center">
                    {activity.dueDate ? (
                      <div className={cn("text-xs", timeRemaining.color)}>
                        <div className="font-semibold tabular-nums">{format(new Date(activity.dueDate), 'MMM d')}</div>
                        <div className="text-[10px]">{timeRemaining.label}</div>
                      </div>
                    ) : (
                      <span className="text-charcoal-300 text-xs">—</span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold px-1.5 py-0 border-0",
                        statusConfig.bg,
                        statusConfig.text
                      )}
                    >
                      <span className={cn("w-1 h-1 rounded-full mr-1", statusConfig.dot)} />
                      {statusConfig.label}
                    </Badge>
                  </div>

                  {/* Priority */}
                  <div className="text-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold px-1.5 py-0 border-0",
                        activity.priority === 'high' ? 'bg-error-50 text-error-600' :
                        activity.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                        'bg-charcoal-50 text-charcoal-500'
                      )}
                    >
                      {activity.priority || 'normal'}
                    </Badge>
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
                        {activity.status !== 'completed' && activity.status !== 'skipped' && (
                          <>
                            <DropdownMenuItem onClick={(e) => handleComplete(activity.id, e as unknown as React.MouseEvent)}>
                              <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-success-500" />
                              Mark Complete
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handleSkip(activity.id, 'User skipped', e as unknown as React.MouseEvent)}>
                              <SkipForward className="h-3.5 w-3.5 mr-2 text-charcoal-500" />
                              Skip
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <UserPlus className="h-3.5 w-3.5 mr-2 text-charcoal-500" />
                          Reassign
                        </DropdownMenuItem>
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
              {searchQuery || statusFilter !== 'all' ? 'Try different search terms or filters' : 'Log a call, email, or meeting to track engagement'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-charcoal-900"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('openContactDialog', {
                      detail: { dialogId: 'createActivity', contactId }
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
          contactId={contactId}
          isCompleting={completeMutation.isPending}
          isSkipping={skipMutation.isPending}
        />
      )}
    </div>
  )
}

// ============================================
// Activity Detail Bottom Panel
// ============================================
interface ActivityDetailBottomPanelProps {
  activity: ContactActivity
  activityDetail: unknown
  isLoading: boolean
  onClose: () => void
  onComplete: (id: string, e?: React.MouseEvent) => void
  onSkip: (id: string, reason: string, e?: React.MouseEvent) => void
  refreshData: () => void
  contactId: string
  isCompleting: boolean
  isSkipping: boolean
}

function ActivityDetailBottomPanel({
  activity,
  activityDetail,
  isLoading,
  onClose,
  onComplete,
  onSkip,
  isCompleting,
  isSkipping,
}: ActivityDetailBottomPanelProps) {
  const typeConfig = ACTIVITY_TYPE_CONFIG[activity.type] || { icon: Activity, gradient: 'from-charcoal-400 to-charcoal-500', label: activity.type }
  const TypeIcon = typeConfig.icon
  const statusConfig = STATUS_CONFIG[activity.status] || STATUS_CONFIG.open
  const timeRemaining = getTimeRemainingIndicator(activity.dueDate, activity.status)
  const daysOpen = getDaysOpen(activity.createdAt)

  const detail = activityDetail as {
    id: string
    subject: string
    type: string
    status: string
    priority: string
    dueDate: string | null
    description: string | null
    instructions: string | null
    checklist: Array<{ label: string; completed: boolean }> | null
    assignedTo: string | null
    createdBy: string | null
    completedAt: string | null
    completedBy: string | null
    createdAt: string
    updatedAt: string | null
  } | null

  const isActionable = activity.status !== 'completed' && activity.status !== 'skipped' && activity.status !== 'cancelled'

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
              timeRemaining.isOverdue ? 'bg-error-400' : 'bg-gold-400'
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
                  <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", statusConfig.dot)} />
                  {statusConfig.label}
                </Badge>
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
                <TypeIcon className="h-3.5 w-3.5" />
                {typeConfig.label}
              </span>
              {activity.assignedTo && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                  {activity.assignedTo}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </span>
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
              className="grid grid-cols-3 gap-4 mb-8"
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
                  {activity.dueDate ? (
                    Math.abs(differenceInDays(new Date(activity.dueDate), new Date()))
                  ) : '—'}
                </p>
                <p className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-[0.15em] mt-2 relative">
                  {timeRemaining.isOverdue ? 'Days Overdue' : activity.dueDate ? 'Days Remaining' : 'No Due Date'}
                </p>
                {timeRemaining.isOverdue && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-error-500 animate-pulse" />}
              </div>

              {/* Days Open */}
              <div className="group relative rounded-2xl bg-white border border-charcoal-100/60 p-5 text-center overflow-hidden hover:shadow-lg hover:border-charcoal-200/60 transition-all duration-300">
                <div className="absolute inset-0 bg-charcoal-500 opacity-[0.02]" />
                <p className="text-3xl font-black tracking-tight text-charcoal-500 relative">
                  {daysOpen}
                </p>
                <p className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-[0.15em] mt-2 relative">Days Open</p>
              </div>

              {/* Priority */}
              <div className="group relative rounded-2xl bg-white border border-charcoal-100/60 p-5 text-center overflow-hidden hover:shadow-lg hover:border-charcoal-200/60 transition-all duration-300">
                <div className={cn(
                  "absolute inset-0 opacity-[0.03]",
                  activity.priority === 'high' ? 'bg-error-500' :
                  activity.priority === 'medium' ? 'bg-amber-500' :
                  'bg-charcoal-400'
                )} />
                <p className={cn(
                  "text-lg font-black tracking-tight uppercase relative",
                  activity.priority === 'high' ? 'text-error-600' :
                  activity.priority === 'medium' ? 'text-amber-600' :
                  'text-charcoal-500'
                )}>
                  {activity.priority || 'Normal'}
                </p>
                <p className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-[0.15em] mt-2 relative">Priority</p>
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
                  <Activity className="h-4 w-4 text-gold-500" />
                  <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Activity Details</h4>
                </div>
                <div className="space-y-0 rounded-2xl border border-charcoal-100/50 overflow-hidden">
                  <DetailRowEnhanced label="Type" value={typeConfig.label} />
                  <DetailRowEnhanced label="Status" value={statusConfig.label} />
                  <DetailRowEnhanced label="Priority" value={activity.priority || 'Normal'} highlight={activity.priority === 'high'} isLast />
                </div>
              </div>

              {/* Column 2 - Assignment */}
              <div
                className="space-y-4"
                style={{ animation: 'fadeInUp 0.5s ease-out 0.2s forwards', opacity: 0 }}
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-500" />
                  <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Assignment</h4>
                </div>
                <div className="space-y-0 rounded-2xl border border-charcoal-100/50 overflow-hidden">
                  <DetailRowEnhanced label="Assigned To" value={activity.assignedTo} />
                  <DetailRowEnhanced label="Created By" value={detail?.createdBy} isLast />
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
                  <DetailRowEnhanced label="Due Date" value={activity.dueDate ? format(new Date(activity.dueDate), 'MMM d, yyyy') : null} highlight={timeRemaining.isOverdue} />
                  <DetailRowEnhanced label="Created" value={format(new Date(activity.createdAt), 'MMM d, yyyy')} />
                  {detail?.completedAt && (
                    <DetailRowEnhanced label="Completed" value={format(new Date(detail.completedAt), 'MMM d, yyyy')} />
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {detail?.description && (
              <div
                className="mb-8"
                style={{ animation: 'fadeInUp 0.5s ease-out 0.3s forwards', opacity: 0 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-charcoal-400" />
                  <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Description</h4>
                </div>
                <div className="rounded-2xl border border-charcoal-100/50 bg-charcoal-50/50 p-4">
                  <p className="text-sm text-charcoal-700 whitespace-pre-wrap">{detail.description}</p>
                </div>
              </div>
            )}

            {/* Checklist */}
            {detail?.checklist && detail.checklist.length > 0 && (
              <div
                className="mb-8"
                style={{ animation: 'fadeInUp 0.5s ease-out 0.35s forwards', opacity: 0 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <CheckSquare className="h-4 w-4 text-emerald-500" />
                  <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Checklist</h4>
                </div>
                <div className="space-y-2">
                  {detail.checklist.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-charcoal-100/50">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center",
                        item.completed ? "bg-success-500" : "border-2 border-charcoal-200"
                      )}>
                        {item.completed && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                      <span className={cn(
                        "text-sm",
                        item.completed ? "text-charcoal-500 line-through" : "text-charcoal-700"
                      )}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Footer */}
            {isActionable && (
              <div
                className="flex items-center justify-center gap-3 pt-6 border-t border-charcoal-100/40"
                style={{ animation: 'fadeInUp 0.5s ease-out 0.4s forwards', opacity: 0 }}
              >
                <Button
                  onClick={() => onComplete(activity.id)}
                  disabled={isCompleting}
                  className="bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white shadow-sm"
                >
                  {isCompleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark Complete
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onSkip(activity.id, 'Skipped by user')}
                  disabled={isSkipping}
                >
                  {isSkipping ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Skipping...
                    </>
                  ) : (
                    <>
                      <SkipForward className="h-4 w-4 mr-2" />
                      Skip
                    </>
                  )}
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
        <span className={cn("text-sm font-semibold", highlight ? "text-error-600" : "text-charcoal-800")}>
          {value}
        </span>
      ) : (
        <span className="text-[11px] text-charcoal-300 font-medium">—</span>
      )}
    </div>
  )
}

export default ContactActivitiesSection
