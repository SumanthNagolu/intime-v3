'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Plus, Activity, Phone, Mail, Calendar, CheckSquare, Clock, 
  MessageSquare, Linkedin, Check, AlertTriangle, ChevronDown, ChevronUp,
  Sparkles, X
} from 'lucide-react'
import type { AccountActivity } from '@/types/workspace'
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek, startOfDay, isBefore } from 'date-fns'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { useAccountWorkspace } from '../AccountWorkspaceProvider'
import { ActivityDetailPanel } from '@/components/activities/ActivityDetailPanel'
import { PatternPickerDialog } from '@/components/activities/PatternPickerDialog'

interface AccountActivitiesSectionProps {
  activities: AccountActivity[]
  accountId: string
}

type TypeFilter = 'all' | 'call' | 'email' | 'meeting' | 'task' | 'note'
type StatusFilter = 'all' | 'pending' | 'completed'

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  task: CheckSquare,
  note: MessageSquare,
  linkedin_message: Linkedin,
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  scheduled: 'bg-blue-100 text-blue-700',
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-success-100 text-success-700',
  cancelled: 'bg-charcoal-100 text-charcoal-600',
  skipped: 'bg-charcoal-100 text-charcoal-600',
}

// Group activities by date
function groupActivitiesByDate(activities: AccountActivity[]): Map<string, AccountActivity[]> {
  const groups = new Map<string, AccountActivity[]>()
  
  activities.forEach(activity => {
    const date = new Date(activity.createdAt)
    let groupKey: string
    
    if (isToday(date)) {
      groupKey = 'Today'
    } else if (isYesterday(date)) {
      groupKey = 'Yesterday'
    } else if (isThisWeek(date)) {
      groupKey = 'This Week'
    } else {
      groupKey = format(date, 'MMMM yyyy')
    }
    
    if (!groups.has(groupKey)) {
      groups.set(groupKey, [])
    }
    groups.get(groupKey)!.push(activity)
  })
  
  return groups
}

/**
 * AccountActivitiesSection - Activity log for this account
 * Enhanced with filtering, date grouping, and quick complete actions (Bullhorn-inspired)
 */
export function AccountActivitiesSection({ activities, accountId }: AccountActivitiesSectionProps) {
  const { toast } = useToast()
  const { refreshData } = useAccountWorkspace()
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>('all')
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all')
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set(['Today', 'Yesterday']))
  
  // Guidewire-style detail panel
  const [selectedActivityId, setSelectedActivityId] = React.useState<string | null>(null)
  const [patternPickerOpen, setPatternPickerOpen] = React.useState(false)

  // Complete activity mutation
  const completeMutation = trpc.activities.complete.useMutation({
    onSuccess: () => {
      toast({ title: 'Activity marked complete' })
      refreshData()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  // Calculate type counts
  const typeCounts = React.useMemo(() => {
    const counts: Record<TypeFilter, number> = { all: activities.length, call: 0, email: 0, meeting: 0, task: 0, note: 0 }
    activities.forEach(a => {
      const type = a.type as TypeFilter
      if (type in counts) counts[type]++
    })
    return counts
  }, [activities])

  // Filter activities
  const filteredActivities = React.useMemo(() => {
    return activities.filter(a => {
      if (typeFilter !== 'all' && a.type !== typeFilter) return false
      if (statusFilter === 'pending' && a.status === 'completed') return false
      if (statusFilter === 'completed' && a.status !== 'completed') return false
      return true
    })
  }, [activities, typeFilter, statusFilter])

  // Group by date
  const groupedActivities = React.useMemo(() => {
    return groupActivitiesByDate(filteredActivities)
  }, [filteredActivities])

  // Get overdue activities
  const overdueCount = activities.filter(a => {
    if (a.status === 'completed' || a.status === 'cancelled') return false
    if (!a.dueDate) return false
    return isBefore(new Date(a.dueDate), startOfDay(new Date()))
  }).length

  const toggleGroup = (group: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(group)) {
      newExpanded.delete(group)
    } else {
      newExpanded.add(group)
    }
    setExpandedGroups(newExpanded)
  }

  const handleComplete = (activityId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    completeMutation.mutate({ id: activityId })
  }

  return (
    <div className="flex gap-6">
      {/* Main list */}
      <div className={cn("flex-1 space-y-4", selectedActivityId && "w-3/5")}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-charcoal-900">
              Activities ({activities.length})
            </h2>
            {overdueCount > 0 && (
              <p className="text-sm text-error-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {overdueCount} overdue
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm"
              variant="outline"
              onClick={() => setPatternPickerOpen(true)}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              From Pattern
            </Button>
            <Button 
              size="sm"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('openAccountDialog', { 
                  detail: { dialogId: 'logActivity', accountId } 
                }))
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Log Activity
            </Button>
          </div>
        </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        {/* Type Filter */}
        <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
          <TabsList className="bg-charcoal-100 p-1 h-auto">
            <TabsTrigger value="all" className="text-xs px-2 py-1">
              All
            </TabsTrigger>
            {Object.entries(TYPE_ICONS).slice(0, 5).map(([type, Icon]) => (
              typeCounts[type as TypeFilter] > 0 && (
                <TabsTrigger key={type} value={type} className="text-xs px-2 py-1">
                  <Icon className="h-3 w-3 mr-1" />
                  {typeCounts[type as TypeFilter]}
                </TabsTrigger>
              )
            ))}
          </TabsList>
        </Tabs>

        {/* Status Filter */}
        <div className="flex items-center gap-2 border-l border-charcoal-200 pl-4">
          <Button 
            variant={statusFilter === 'all' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="h-7 text-xs"
            onClick={() => setStatusFilter('all')}
          >
            All Status
          </Button>
          <Button 
            variant={statusFilter === 'pending' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="h-7 text-xs"
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </Button>
          <Button 
            variant={statusFilter === 'completed' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="h-7 text-xs"
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </Button>
        </div>
      </div>

      {/* Grouped List */}
      {filteredActivities.length > 0 ? (
        <div className="space-y-4">
          {Array.from(groupedActivities.entries()).map(([groupName, groupActivities]) => (
            <Card key={groupName}>
              <button
                onClick={() => toggleGroup(groupName)}
                className="w-full flex items-center justify-between p-3 bg-charcoal-50 hover:bg-charcoal-100 transition-colors"
              >
                <span className="text-sm font-medium text-charcoal-700">{groupName}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {groupActivities.length}
                  </Badge>
                  {expandedGroups.has(groupName) ? (
                    <ChevronUp className="h-4 w-4 text-charcoal-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-charcoal-400" />
                  )}
                </div>
              </button>
              
              {expandedGroups.has(groupName) && (
                <CardContent className="p-0">
                  <div className="divide-y divide-charcoal-100">
                    {groupActivities.map((activity) => {
                      const Icon = TYPE_ICONS[activity.type] || Activity
                      const isOverdue = activity.dueDate && 
                        activity.status !== 'completed' && 
                        isBefore(new Date(activity.dueDate), startOfDay(new Date()))
                      const isPending = activity.status !== 'completed' && activity.status !== 'cancelled'

                      return (
                        <div
                          key={activity.id}
                          onClick={() => setSelectedActivityId(activity.id)}
                          className={cn(
                            "flex items-center gap-4 p-4 hover:bg-charcoal-50 transition-colors cursor-pointer",
                            isOverdue && "bg-error-50",
                            selectedActivityId === activity.id && "bg-primary-50 border-l-2 border-primary-500"
                          )}
                        >
                          {/* Quick Complete Checkbox */}
                          {isPending && (
                            <div onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={false}
                                onCheckedChange={() => handleComplete(activity.id, {} as React.MouseEvent)}
                                className="border-charcoal-300"
                              />
                            </div>
                          )}
                          
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                            activity.status === 'completed' ? 'bg-success-100' : 'bg-charcoal-100'
                          )}>
                            {activity.status === 'completed' ? (
                              <Check className="h-5 w-5 text-success-600" />
                            ) : (
                              <Icon className="h-5 w-5 text-charcoal-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={cn(
                                "text-sm font-medium truncate",
                                activity.status === 'completed' ? 'text-charcoal-500 line-through' : 'text-charcoal-900'
                              )}>
                                {activity.subject}
                              </p>
                              <Badge className={cn('capitalize text-xs', STATUS_STYLES[activity.status] || STATUS_STYLES.pending)}>
                                {activity.status}
                              </Badge>
                              {isOverdue && (
                                <Badge variant="outline" className="text-xs text-error-600 border-error-300">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Overdue
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-charcoal-500">
                              <span className="capitalize">{activity.type}</span>
                              <span>{activity.assignedTo}</span>
                              {activity.dueDate && (
                                <span className={cn("flex items-center gap-1", isOverdue && "text-error-600")}>
                                  <Clock className="h-3 w-3" />
                                  Due {format(new Date(activity.dueDate), 'MMM d')}
                                </span>
                              )}
                              <span>
                                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-sm text-charcoal-500">
              {typeFilter !== 'all' || statusFilter !== 'all' 
                ? 'No matching activities' 
                : 'No activities logged'}
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPatternPickerOpen(true)}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                From Pattern
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openAccountDialog', { 
                    detail: { dialogId: 'logActivity', accountId } 
                  }))
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Log First Activity
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      </div>

      {/* Detail Panel (Guidewire-style inline panel) */}
      {selectedActivityId && (
        <div className="w-2/5 flex-shrink-0">
          <ActivityDetailPanel
            activityId={selectedActivityId}
            onClose={() => setSelectedActivityId(null)}
            onComplete={() => {
              setSelectedActivityId(null)
              refreshData()
            }}
          />
        </div>
      )}

      {/* Pattern Picker Dialog */}
      <PatternPickerDialog
        open={patternPickerOpen}
        onOpenChange={setPatternPickerOpen}
        entityType="company"
        entityId={accountId}
        onPatternSelected={(activityId) => {
          setSelectedActivityId(activityId)
          refreshData()
        }}
      />
    </div>
  )
}

export default AccountActivitiesSection
