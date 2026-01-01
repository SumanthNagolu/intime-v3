'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FilterDropdown, type FilterOption } from '@/components/ui/filter-dropdown'
import {
  Clock,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { MyWorkspaceActivity, ActivityFilterCounts } from '@/types/workspace'

const activityTypeIcons: Record<string, React.ReactNode> = {
  call: <Phone className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  meeting: <Calendar className="w-4 h-4" />,
  note: <MessageSquare className="w-4 h-4" />,
  task: <CheckCircle2 className="w-4 h-4" />,
  follow_up: <Clock className="w-4 h-4" />,
}

interface WorkspaceActivitiesTableProps {
  activities: MyWorkspaceActivity[]
  filterCounts: ActivityFilterCounts
  onRefresh?: () => void
}

export function WorkspaceActivitiesTable({
  activities,
  filterCounts,
  onRefresh,
}: WorkspaceActivitiesTableProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<string>('all_open')

  const completeMutation = trpc.activities.complete.useMutation({
    onSuccess: () => {
      toast.success('Activity completed')
      onRefresh?.()
      router.refresh()
    },
    onError: (error) => {
      toast.error(`Failed to complete: ${error.message}`)
    },
  })

  // Build filter options with counts
  const filterOptions: FilterOption[] = useMemo(() => [
    { value: 'all_open', label: 'All open activities', count: filterCounts.all_open },
    { value: 'overdue', label: 'Overdue activities', count: filterCounts.overdue, countColor: 'red' as const },
    { value: 'due_today', label: 'Due today', count: filterCounts.due_today },
    { value: 'due_week', label: 'Due this week', count: filterCounts.due_week },
    { value: 'completed_today', label: 'Completed today', count: filterCounts.completed_today },
    { value: 'all', label: 'All activities', count: filterCounts.all, separator: true },
  ], [filterCounts])

  // Client-side filtering
  const filteredActivities = useMemo(() => {
    let items = activities

    switch (filter) {
      case 'all_open':
        items = items.filter((a) => ['scheduled', 'open', 'in_progress'].includes(a.status))
        break
      case 'overdue':
        items = items.filter((a) => a.isOverdue)
        break
      case 'due_today':
        items = items.filter((a) => a.isDueToday && ['scheduled', 'open', 'in_progress'].includes(a.status))
        break
      case 'due_week':
        items = items.filter((a) => a.isDueThisWeek && ['scheduled', 'open', 'in_progress'].includes(a.status))
        break
      case 'completed_today':
        items = items.filter((a) => a.completedToday)
        break
      // 'all' shows everything
    }

    return items.slice(0, 10) // Limit to 10 for dashboard view
  }, [activities, filter])

  const getEntityLink = (activity: MyWorkspaceActivity) => {
    switch (activity.entityType) {
      case 'account':
      case 'company':
        return `/employee/recruiting/accounts/${activity.entityId}`
      case 'job':
        return `/employee/recruiting/jobs/${activity.entityId}`
      case 'candidate':
        return `/employee/recruiting/candidates/${activity.entityId}`
      default:
        return '#'
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">My Activities</CardTitle>
          <div className="flex items-center gap-3">
            <FilterDropdown
              options={filterOptions}
              value={filter}
              onChange={setFilter}
              label="Filter"
              storageKey="my-workspace-activities-filter"
            />
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Log Activity
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-success-500 mx-auto mb-3" />
            <p className="text-charcoal-500">
              {filter === 'overdue' ? 'No overdue activities!' : 'No activities found'}
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Due Date</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="w-20">Type</TableHead>
                  <TableHead className="w-32">Related</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.map((activity) => (
                  <TableRow
                    key={activity.id}
                    className={cn(activity.isOverdue && 'bg-error-50/50')}
                  >
                    <TableCell>
                      <div
                        className={cn(
                          'text-sm',
                          activity.isOverdue && 'text-error-600 font-medium',
                          activity.isDueToday && !activity.isOverdue && 'text-warning-600 font-medium'
                        )}
                      >
                        {activity.isOverdue && <AlertCircle className="w-3 h-3 inline mr-1" />}
                        {activity.dueDate
                          ? new Date(activity.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={getEntityLink(activity)}
                        className="font-medium hover:text-gold-600 transition-colors"
                      >
                        {activity.subject || 'No subject'}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-charcoal-500">
                        {activityTypeIcons[activity.activityType] || <Clock className="w-4 h-4" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-charcoal-600">
                      {activity.accountName || '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => completeMutation.mutate({ id: activity.id })}
                        disabled={completeMutation.isPending || activity.status === 'completed'}
                        className="h-7 px-2 text-xs"
                      >
                        Complete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-end">
              <Link
                href="/employee/workspace/desktop?tab=activities"
                className="text-sm text-gold-600 hover:text-gold-700 flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
