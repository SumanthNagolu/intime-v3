'use client'

import { useState } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Clock,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Linkedin,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  AlertCircle,
  Building2,
  User,
} from 'lucide-react'
import { formatDistanceToNow, format, isToday, isPast } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const activityTypeIcons: Record<string, React.ReactNode> = {
  call: <Phone className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  meeting: <Calendar className="w-4 h-4" />,
  note: <MessageSquare className="w-4 h-4" />,
  linkedin_message: <Linkedin className="w-4 h-4" />,
  task: <CheckCircle2 className="w-4 h-4" />,
  follow_up: <Clock className="w-4 h-4" />,
}

const activityTypeLabels: Record<string, string> = {
  call: 'Call',
  email: 'Email',
  meeting: 'Meeting',
  note: 'Note',
  linkedin_message: 'LinkedIn',
  task: 'Task',
  follow_up: 'Follow-up',
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  open: 'bg-amber-100 text-amber-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  skipped: 'bg-charcoal-100 text-charcoal-600',
  canceled: 'bg-red-100 text-red-800',
}

const priorityColors: Record<string, string> = {
  low: 'text-charcoal-400',
  normal: 'text-charcoal-600',
  high: 'text-amber-600',
  urgent: 'text-red-600',
}

interface Activity {
  id: string
  subject: string | null
  description: string | null
  activityType: string
  status: string
  priority: string | null
  dueDate: string | null
  entityType: string
  entityId: string
  accountName: string | null
  contact: { id: string; name: string } | null
  isOverdue: boolean
  isDueToday: boolean
  createdAt: string
  completedAt: string | null
}

interface MyActivitiesTableProps {
  filterOverdue?: boolean
  filterDueToday?: boolean
}

export function MyActivitiesTable({
  filterOverdue,
  filterDueToday,
}: MyActivitiesTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('pending')

  const utils = trpc.useUtils()

  // Calculate date filters based on props
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const activitiesQuery = trpc.activities.getMyActivities.useQuery({
    activityType: typeFilter !== 'all' ? typeFilter as 'call' | 'email' | 'meeting' | 'note' | 'linkedin_message' | 'task' | 'follow_up' : undefined,
    status: statusFilter !== 'pending' ? statusFilter as 'scheduled' | 'open' | 'in_progress' | 'completed' | 'skipped' | 'canceled' : undefined,
    dueBefore: filterOverdue ? today : undefined,
    dueAfter: filterDueToday ? today : undefined,
    limit: 50,
  })

  const completeMutation = trpc.activities.complete.useMutation({
    onSuccess: () => {
      toast.success('Activity completed')
      utils.activities.getMyActivities.invalidate()
      utils.dashboard.getTodaysPriorities.invalidate()
    },
    onError: (error) => {
      toast.error(`Failed to complete activity: ${error.message}`)
    },
  })

  const skipMutation = trpc.activities.skip.useMutation({
    onSuccess: () => {
      toast.success('Activity skipped')
      utils.activities.getMyActivities.invalidate()
      utils.dashboard.getTodaysPriorities.invalidate()
    },
    onError: (error) => {
      toast.error(`Failed to skip activity: ${error.message}`)
    },
  })

  const activities = activitiesQuery.data?.items ?? []
  const total = activitiesQuery.data?.total ?? 0
  const isLoading = activitiesQuery.isLoading

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(activities.map((a) => a.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelect = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds)
    if (checked) {
      newSet.add(id)
    } else {
      newSet.delete(id)
    }
    setSelectedIds(newSet)
  }

  const handleBulkComplete = () => {
    selectedIds.forEach((id) => {
      completeMutation.mutate({ id })
    })
    setSelectedIds(new Set())
  }

  const handleBulkSkip = () => {
    selectedIds.forEach((id) => {
      skipMutation.mutate({ id })
    })
    setSelectedIds(new Set())
  }

  const getEntityLink = (activity: Activity) => {
    switch (activity.entityType) {
      case 'account':
        return `/employee/recruiting/accounts/${activity.entityId}`
      case 'job':
        return `/employee/recruiting/jobs/${activity.entityId}`
      case 'candidate':
        return `/employee/recruiting/candidates/${activity.entityId}`
      case 'lead':
        return `/employee/crm/leads/${activity.entityId}`
      default:
        return '#'
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">
            My Activities
            {total > 0 && (
              <span className="ml-2 text-sm font-normal text-charcoal-500">
                ({total})
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="call">Calls</SelectItem>
                <SelectItem value="email">Emails</SelectItem>
                <SelectItem value="meeting">Meetings</SelectItem>
                <SelectItem value="task">Tasks</SelectItem>
                <SelectItem value="follow_up">Follow-ups</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
            <span className="text-sm text-charcoal-600">
              {selectedIds.size} selected
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkComplete}
              disabled={completeMutation.isPending}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Complete
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkSkip}
              disabled={skipMutation.isPending}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Skip
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
            <p className="text-charcoal-500">No activities found</p>
            <p className="text-sm text-charcoal-400">
              {filterOverdue
                ? 'Great! You have no overdue activities.'
                : 'Create activities to track your tasks and follow-ups.'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedIds.size === activities.length &&
                      activities.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow
                  key={activity.id}
                  className={cn(
                    'group',
                    activity.isOverdue && 'bg-red-50/50'
                  )}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(activity.id)}
                      onCheckedChange={(checked) =>
                        handleSelect(activity.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={getEntityLink(activity)}
                      className="hover:text-hublot-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {activity.priority === 'urgent' && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span
                          className={cn(
                            'font-medium',
                            activity.isOverdue && 'text-red-700',
                            priorityColors[activity.priority || 'normal']
                          )}
                        >
                          {activity.subject || 'No subject'}
                        </span>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-charcoal-500 truncate max-w-xs">
                          {activity.description}
                        </p>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-charcoal-500">
                        {activityTypeIcons[activity.activityType]}
                      </span>
                      <span className="text-sm">
                        {activityTypeLabels[activity.activityType] ||
                          activity.activityType}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {activity.accountName ? (
                      <Link
                        href={getEntityLink(activity)}
                        className="flex items-center gap-1 text-charcoal-600 hover:text-hublot-700"
                      >
                        <Building2 className="w-3 h-3" />
                        {activity.accountName}
                      </Link>
                    ) : (
                      <span className="text-charcoal-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {activity.contact ? (
                      <div className="flex items-center gap-1 text-charcoal-600">
                        <User className="w-3 h-3" />
                        {activity.contact.name}
                      </div>
                    ) : (
                      <span className="text-charcoal-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {activity.dueDate ? (
                      <div
                        className={cn(
                          'text-sm',
                          activity.isOverdue && 'text-red-600 font-medium',
                          activity.isDueToday && 'text-amber-600 font-medium'
                        )}
                      >
                        {activity.isOverdue && (
                          <span className="block text-xs">Overdue</span>
                        )}
                        {activity.isDueToday ? (
                          'Today'
                        ) : (
                          formatDistanceToNow(new Date(activity.dueDate), {
                            addSuffix: true,
                          })
                        )}
                      </div>
                    ) : (
                      <span className="text-charcoal-400">No due date</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        statusColors[activity.status] ||
                          statusColors.scheduled
                      )}
                    >
                      {activity.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            completeMutation.mutate({ id: activity.id })
                          }
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Complete
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            skipMutation.mutate({ id: activity.id })
                          }
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Skip
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
