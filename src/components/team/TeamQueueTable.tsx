'use client'

import { useState, useMemo } from 'react'
import { trpc } from '@/lib/trpc/client'
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
  Inbox,
  Clock,
  Briefcase,
  Building2,
  AlertCircle,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { AssignDropdown } from './AssignDropdown'
import type { TeamWorkspaceQueueItem, TeamMember } from '@/types/workspace'

const typeIcons: Record<string, React.ReactNode> = {
  activity: <Clock className="w-4 h-4" />,
  submission: <Inbox className="w-4 h-4" />,
  job: <Briefcase className="w-4 h-4" />,
}

const typeColors: Record<string, string> = {
  activity: 'bg-blue-100 text-blue-800',
  submission: 'bg-purple-100 text-purple-800',
  job: 'bg-green-100 text-green-800',
}

const priorityColors: Record<string, string> = {
  low: 'bg-charcoal-100 text-charcoal-600',
  normal: 'bg-charcoal-100 text-charcoal-600',
  high: 'bg-amber-100 text-amber-800',
  urgent: 'bg-red-100 text-red-800',
}

interface TeamQueueTableProps {
  queue: TeamWorkspaceQueueItem[]
  members: TeamMember[]
  onRefresh?: () => void
}

export function TeamQueueTable({
  queue,
  members,
  onRefresh,
}: TeamQueueTableProps) {
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const reassignActivityMutation = trpc.activities.reassign.useMutation({
    onSuccess: () => {
      toast.success('Activity assigned successfully')
      onRefresh?.()
    },
    onError: (error) => {
      toast.error(`Failed to assign: ${error.message}`)
    },
  })

  // Filter queue items client-side
  const filteredQueue = useMemo(() => {
    if (typeFilter === 'all') return queue
    return queue.filter((item) => item.type === typeFilter)
  }, [queue, typeFilter])

  // Stats
  const activityCount = queue.filter((q) => q.type === 'activity').length
  const jobCount = queue.filter((q) => q.type === 'job').length
  const submissionCount = queue.filter((q) => q.type === 'submission').length

  const handleAssign = (item: TeamWorkspaceQueueItem, memberId: string) => {
    if (item.type === 'activity') {
      reassignActivityMutation.mutate({ id: item.id, assignedTo: memberId })
    } else {
      // For jobs and submissions, we would need additional mutations
      // For now, show a message
      toast.info(`Assignment for ${item.type}s coming soon`)
    }
  }

  return (
    <Card className="bg-white shadow-elevation-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-heading">
            In Queue (Unassigned)
            {filteredQueue.length > 0 && (
              <span className="ml-2 text-sm font-normal text-charcoal-500">
                ({filteredQueue.length})
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-charcoal-500">
            {activityCount > 0 && <span>{activityCount} activities</span>}
            {jobCount > 0 && <span>{jobCount} jobs</span>}
            {submissionCount > 0 && <span>{submissionCount} submissions</span>}
          </div>
        </div>
        {queue.length > 0 && (
          <div className="mt-3 p-3 bg-warning-50 border border-warning-200 rounded-lg text-warning-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>
              {queue.length} {queue.length === 1 ? 'item' : 'items'} need to be assigned to team members
            </span>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types ({queue.length})</SelectItem>
              <SelectItem value="activity">Activities ({activityCount})</SelectItem>
              <SelectItem value="job">Jobs ({jobCount})</SelectItem>
              <SelectItem value="submission">Submissions ({submissionCount})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {filteredQueue.length === 0 ? (
          <div className="text-center py-8">
            <Inbox className="w-12 h-12 text-success-300 mx-auto mb-3" />
            <p className="text-success-600 font-medium">Queue is empty!</p>
            <p className="text-sm text-charcoal-400">
              All items have been assigned to team members.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Assign To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQueue.map((item) => (
                <TableRow key={`${item.type}-${item.id}`} className="group">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          typeColors[item.type] || typeColors.activity
                        )}
                      >
                        <span className="mr-1">{typeIcons[item.type]}</span>
                        {item.type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-charcoal-900">
                      {item.title}
                    </span>
                  </TableCell>
                  <TableCell>
                    {item.accountName ? (
                      <div className="flex items-center gap-1 text-charcoal-600">
                        <Building2 className="w-3 h-3" />
                        {item.accountName}
                      </div>
                    ) : (
                      <span className="text-charcoal-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.priority ? (
                      <Badge
                        className={cn(
                          priorityColors[item.priority] || priorityColors.normal
                        )}
                      >
                        {item.priority}
                      </Badge>
                    ) : (
                      <span className="text-charcoal-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-charcoal-600 text-sm">
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <AssignDropdown
                      members={members}
                      currentAssigneeId={null}
                      onAssign={(memberId) => handleAssign(item, memberId)}
                      disabled={reassignActivityMutation.isPending}
                      placeholder="Assign..."
                      className="w-40"
                    />
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
