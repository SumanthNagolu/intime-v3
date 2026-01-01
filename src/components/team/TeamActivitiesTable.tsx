'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Clock,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Linkedin,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { AssignDropdown } from './AssignDropdown'
import type {
  TeamWorkspaceActivity,
  TeamMember,
  ActivityFilterCounts,
} from '@/types/workspace'

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

interface TeamActivitiesTableProps {
  activities: TeamWorkspaceActivity[]
  members: TeamMember[]
  filterCounts: ActivityFilterCounts
  initialMemberId?: string
  initialFilter?: string
  onRefresh?: () => void
}

export function TeamActivitiesTable({
  activities,
  members,
  filterCounts,
  initialMemberId,
  initialFilter,
  onRefresh,
}: TeamActivitiesTableProps) {
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter === 'overdue' ? 'overdue' : 'pending')
  const [memberFilter, setMemberFilter] = useState<string>(initialMemberId || 'all')

  const reassignMutation = trpc.activities.reassign.useMutation({
    onSuccess: () => {
      toast.success('Activity reassigned successfully')
      onRefresh?.()
    },
    onError: (error) => {
      toast.error(`Failed to reassign: ${error.message}`)
    },
  })

  // Filter activities client-side
  const filteredActivities = useMemo(() => {
    let items = [...activities]

    // Apply member filter
    if (memberFilter !== 'all') {
      items = items.filter((a) => a.assignedTo?.id === memberFilter)
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      items = items.filter((a) => a.activityType === typeFilter)
    }

    // Apply status filter
    if (statusFilter === 'pending') {
      items = items.filter((a) => ['scheduled', 'open', 'in_progress'].includes(a.status))
    } else if (statusFilter === 'overdue') {
      items = items.filter((a) => a.isOverdue)
    } else if (statusFilter !== 'all') {
      items = items.filter((a) => a.status === statusFilter)
    }

    return items
  }, [activities, typeFilter, statusFilter, memberFilter])

  const handleReassign = (activityId: string, newAssigneeId: string) => {
    reassignMutation.mutate({ id: activityId, assignedTo: newAssigneeId })
  }

  const getEntityLink = (activity: TeamWorkspaceActivity) => {
    switch (activity.entityType) {
      case 'account':
      case 'company':
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
    <Card className="bg-white shadow-elevation-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-heading">
            Team Activities
            {filteredActivities.length > 0 && (
              <span className="ml-2 text-sm font-normal text-charcoal-500">
                ({filteredActivities.length})
              </span>
            )}
          </CardTitle>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Select value={memberFilter} onValueChange={setMemberFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Members" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              <SelectItem value="pending">Pending ({filterCounts.all_open})</SelectItem>
              <SelectItem value="overdue">Overdue ({filterCounts.overdue})</SelectItem>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {filterCounts.overdue > 0 && statusFilter !== 'overdue' && (
          <div className="mt-3 p-3 bg-error-50 border border-error-200 rounded-lg text-error-700 text-sm">
            <AlertCircle className="w-4 h-4 inline mr-2" />
            {filterCounts.overdue} overdue {filterCounts.overdue === 1 ? 'activity' : 'activities'} across the team
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 text-error-700 underline"
              onClick={() => setStatusFilter('overdue')}
            >
              View overdue
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
            <p className="text-charcoal-500">No activities found</p>
            <p className="text-sm text-charcoal-400">
              Try adjusting the filters to see more activities.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.map((activity) => (
                <TableRow
                  key={activity.id}
                  className={cn(
                    'group',
                    activity.isOverdue && 'bg-red-50/50'
                  )}
                >
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
                    <AssignDropdown
                      members={members}
                      currentAssigneeId={activity.assignedTo?.id}
                      onAssign={(memberId) => handleReassign(activity.id, memberId)}
                      disabled={reassignMutation.isPending}
                      className="w-40"
                    />
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
                        statusColors[activity.status] || statusColors.scheduled
                      )}
                    >
                      {activity.status.replace('_', ' ')}
                    </Badge>
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
