'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'
import {
  CheckCircle,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  User,
  Video,
  Linkedin,
  ClipboardList,
  MoreVertical,
  Activity,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InlinePanel, InlinePanelSection } from '@/components/ui/inline-panel'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { EmptyState } from '@/components/pcf/shared/EmptyState'
import { StatusBadge } from '@/components/pcf/shared/StatusBadge'
import {
  ACTIVITY_TYPE_CONFIG,
  ACTIVITY_STATUS_CONFIG,
  ACTIVITY_PRIORITY_CONFIG,
  ACTIVITIES_COLUMNS,
  ACTIVITIES_SORT_FIELD_MAP,
  type ActivityItem,
} from '@/configs/sections/activities.config'

interface ActivitiesSectionProps {
  entityType: string
  entityId: string
  onLogActivity?: () => void
  showStats?: boolean
  showInlineForm?: boolean
}

export function ActivitiesSection({
  entityType,
  entityId,
  onLogActivity,
  showStats = true,
  showInlineForm: _showInlineForm = true,
}: ActivitiesSectionProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null)

  // Get current sort state from URL
  const currentSortBy = searchParams.get('activitiesSortBy') || 'createdAt'
  const currentSortOrder = (searchParams.get('activitiesSortOrder') || 'desc') as 'asc' | 'desc'

  const utils = trpc.useUtils()

  // Fetch activities with sorting
  const activitiesQuery = trpc.activities.listByEntity.useQuery({
    entityType,
    entityId,
    limit: 50,
  })

  // Fetch stats
  const statsQuery = trpc.activities.statsByEntity.useQuery(
    { entityType, entityId },
    { enabled: showStats }
  )

  const completeActivity = trpc.activities.complete.useMutation({
    onSuccess: () => {
      utils.activities.listByEntity.invalidate({ entityType, entityId })
      utils.activities.statsByEntity.invalidate({ entityType, entityId })
    },
  })

  // Transform and sort activities
  const activities = useMemo(() => {
    const items = (activitiesQuery.data?.items || []) as unknown as ActivityItem[]

    // Client-side sorting (since the API doesn't support all sort fields)
    const sortField = ACTIVITIES_SORT_FIELD_MAP[currentSortBy] || 'created_at'
    const sorted = [...items].sort((a, b) => {
      let aVal: string | number | undefined
      let bVal: string | number | undefined

      // Map to the correct field
      switch (sortField) {
        case 'activity_type':
          aVal = a.activity_type || a.activityType
          bVal = b.activity_type || b.activityType
          break
        case 'subject':
          aVal = a.subject
          bVal = b.subject
          break
        case 'status':
          aVal = a.status
          bVal = b.status
          break
        case 'priority':
          aVal = a.priority
          bVal = b.priority
          break
        case 'due_date':
          aVal = a.due_date || a.dueDate
          bVal = b.due_date || b.dueDate
          break
        case 'completed_at':
          aVal = a.completed_at || a.completedAt
          bVal = b.completed_at || b.completedAt
          break
        case 'created_at':
        default:
          aVal = a.created_at || a.createdAt
          bVal = b.created_at || b.createdAt
          break
      }

      if (!aVal && !bVal) return 0
      if (!aVal) return 1
      if (!bVal) return -1

      const comparison = String(aVal).localeCompare(String(bVal))
      return currentSortOrder === 'asc' ? comparison : -comparison
    })

    // Normalize data for column rendering
    return sorted.map(item => ({
      ...item,
      activityType: item.activity_type || item.activityType,
      dueDate: item.due_date || item.dueDate,
      completedAt: item.completed_at || item.completedAt,
      createdAt: item.created_at || item.createdAt,
      performedBy: item.performed_by || item.performedBy,
      entityType: item.entity_type || item.entityType,
      entityId: item.entity_id || item.entityId,
    }))
  }, [activitiesQuery.data?.items, currentSortBy, currentSortOrder])

  const selectedActivity = activities.find((a) => a.id === selectedActivityId)
  const stats = statsQuery.data

  const handleSort = (columnKey: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const newOrder = currentSortBy === columnKey && currentSortOrder === 'desc' ? 'asc' : 'desc'
    params.set('activitiesSortBy', columnKey)
    params.set('activitiesSortOrder', newOrder)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const getSortIcon = (columnKey: string) => {
    if (currentSortBy !== columnKey) {
      return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-charcoal-400" />
    }
    return currentSortOrder === 'asc'
      ? <ArrowUp className="ml-1 h-3.5 w-3.5 text-gold-600" />
      : <ArrowDown className="ml-1 h-3.5 w-3.5 text-gold-600" />
  }

  const handleComplete = (activityId: string) => {
    completeActivity.mutate({ id: activityId })
  }

  const formatCellValue = (item: ActivityItem, column: typeof ACTIVITIES_COLUMNS[number]) => {
    const keys = column.key.split('.')
    let value: unknown = item
    for (const key of keys) {
      value = (value as Record<string, unknown>)?.[key]
    }

    // Custom render function takes priority
    if (column.render) {
      return column.render(value, item)
    }

    // Handle null/undefined
    if (value === null || value === undefined) {
      return <span className="text-charcoal-400">—</span>
    }

    // Format based on column type
    switch (column.format) {
      case 'date':
        try {
          return format(new Date(String(value)), 'MMM d, yyyy')
        } catch {
          return String(value)
        }

      case 'relative-date':
        try {
          return formatDistanceToNow(new Date(String(value)), { addSuffix: true })
        } catch {
          return String(value)
        }

      case 'status':
        return <StatusBadge status={String(value)} config={ACTIVITY_STATUS_CONFIG} size="sm" />

      default:
        return String(value)
    }
  }

  if (activitiesQuery.isLoading) {
    return (
      <div className="space-y-4">
        {showStats && (
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-white animate-pulse">
                <CardContent className="py-4">
                  <div className="h-16 bg-charcoal-100 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <Card className="bg-white animate-pulse">
          <CardContent className="py-4">
            <div className="h-64 bg-charcoal-100 rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <EmptyState
        config={{
          icon: Activity,
          title: 'No activities yet',
          description: 'Log your first activity to track interactions',
          action: onLogActivity
            ? { label: 'Log Activity', onClick: onLogActivity }
            : undefined,
        }}
        variant="inline"
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      {showStats && stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-charcoal-100 rounded-lg">
                  <Activity className="w-5 h-5 text-charcoal-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-charcoal-900">
                    {stats.total.toLocaleString()}
                  </p>
                  <p className="text-sm text-charcoal-500">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-charcoal-900">
                    {stats.completedToday.toLocaleString()}
                  </p>
                  <p className="text-sm text-charcoal-500">Completed Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-charcoal-900">
                    {stats.overdue.toLocaleString()}
                  </p>
                  <p className="text-sm text-charcoal-500">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-charcoal-900 mb-1">By Type</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(stats.byType).slice(0, 3).map(([type, count]) => {
                      const config = ACTIVITY_TYPE_CONFIG[type]
                      return (
                        <Badge key={type} className={cn('text-xs', config?.bgColor, config?.color)}>
                          {config?.label || type}: {count}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table and Inline Panel */}
      <div className="flex gap-4">
        {/* Activities Table */}
        <div
          className={cn(
            'flex-1 transition-all duration-300',
            selectedActivityId ? 'max-w-[calc(100%-400px)]' : 'max-w-full'
          )}
        >
          {/* Header with action */}
          {onLogActivity && (
            <div className="flex justify-end mb-4">
              <Button onClick={onLogActivity} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Log Activity
              </Button>
            </div>
          )}

          {/* Table */}
          <Card className="bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-charcoal-50 border-b border-charcoal-200">
                    {ACTIVITIES_COLUMNS.map((column) => (
                      <TableHead
                        key={column.key}
                        className={cn(
                          'font-semibold text-charcoal-700 text-xs uppercase tracking-wider',
                          column.width,
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right',
                          column.sortable && 'cursor-pointer select-none hover:bg-charcoal-100 transition-colors'
                        )}
                        onClick={column.sortable ? () => handleSort(column.key) : undefined}
                      >
                        <span className="flex items-center">
                          {column.header || column.label}
                          {column.sortable && getSortIcon(column.key)}
                        </span>
                      </TableHead>
                    ))}
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity) => (
                    <TableRow
                      key={activity.id}
                      className={cn(
                        'cursor-pointer transition-colors',
                        selectedActivityId === activity.id
                          ? 'bg-gold-50/50'
                          : 'hover:bg-charcoal-50'
                      )}
                      onClick={() => setSelectedActivityId(activity.id)}
                    >
                      {ACTIVITIES_COLUMNS.map((column) => (
                        <TableCell
                          key={column.key}
                          className={cn(
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right'
                          )}
                        >
                          {formatCellValue(activity, column)}
                        </TableCell>
                      ))}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {activity.status !== 'completed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleComplete(activity.id)
                              }}
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Reschedule</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Inline Panel */}
        <InlinePanel
          isOpen={!!selectedActivity}
          onClose={() => setSelectedActivityId(null)}
          title={selectedActivity?.subject || 'Activity'}
          description={ACTIVITY_TYPE_CONFIG[selectedActivity?.activityType as keyof typeof ACTIVITY_TYPE_CONFIG]?.label}
          width="md"
        >
          {selectedActivity && (
            <>
              <InlinePanelSection title="Details">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Status</span>
                    <StatusBadge
                      status={selectedActivity.status}
                      config={ACTIVITY_STATUS_CONFIG}
                      size="sm"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Type</span>
                    <span className="font-medium">
                      {ACTIVITY_TYPE_CONFIG[selectedActivity.activityType as keyof typeof ACTIVITY_TYPE_CONFIG]?.label}
                    </span>
                  </div>
                  {selectedActivity.priority && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Priority</span>
                      <Badge className={ACTIVITY_PRIORITY_CONFIG[selectedActivity.priority]?.color}>
                        {ACTIVITY_PRIORITY_CONFIG[selectedActivity.priority]?.label}
                      </Badge>
                    </div>
                  )}
                  {selectedActivity.dueDate && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Due Date</span>
                      <span className="font-medium">
                        {format(new Date(selectedActivity.dueDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  {selectedActivity.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Completed</span>
                      <span className="font-medium">
                        {format(new Date(selectedActivity.completedAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Created</span>
                    <span className="font-medium">
                      {selectedActivity.createdAt && format(new Date(selectedActivity.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </InlinePanelSection>

              {selectedActivity.description && (
                <InlinePanelSection title="Description">
                  <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
                    {selectedActivity.description}
                  </p>
                </InlinePanelSection>
              )}

              {selectedActivity.performedBy && (
                <InlinePanelSection title="Owner">
                  <div className="flex items-center gap-2">
                    {selectedActivity.performedBy.avatar_url ? (
                      <img
                        src={selectedActivity.performedBy.avatar_url}
                        alt={selectedActivity.performedBy.full_name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-charcoal-200 flex items-center justify-center">
                        <User className="w-4 h-4 text-charcoal-500" />
                      </div>
                    )}
                    <span className="text-sm font-medium">
                      {selectedActivity.performedBy.full_name}
                    </span>
                  </div>
                </InlinePanelSection>
              )}
            </>
          )}
        </InlinePanel>
      </div>
    </div>
  )
}
