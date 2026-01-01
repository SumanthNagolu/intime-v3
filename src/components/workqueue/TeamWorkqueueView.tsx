'use client'

import * as React from 'react'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Play,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Users,
  CheckCircle2,
  Filter,
  Inbox,
  User,
} from 'lucide-react'
import { format, formatDistanceToNow, isToday, isBefore, startOfDay } from 'date-fns'
import { cn } from '@/lib/utils'
import { ActivityDetailPanel } from '@/components/activities/ActivityDetailPanel'

interface TeamWorkqueueViewProps {
  queueId?: string
}

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-charcoal-100 text-charcoal-600',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
}

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-purple-100 text-purple-700',
  scheduled: 'bg-blue-100 text-blue-700',
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
 * TeamWorkqueueView - Guidewire-inspired team workqueue
 * Shows activities in queues with claim/release functionality
 */
export function TeamWorkqueueView({ queueId }: TeamWorkqueueViewProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()
  
  const [selectedActivityId, setSelectedActivityId] = React.useState<string | null>(null)
  const [selectedQueueId, setSelectedQueueId] = React.useState<string | undefined>(queueId)
  const [activeTab, setActiveTab] = React.useState<'all' | 'my' | 'unassigned'>('all')
  const [priorityFilter, setPriorityFilter] = React.useState<string>('all')

  // Fetch queues user has access to
  const { data: memberships, isLoading: membershipsLoading } = trpc.workqueue.getMyMemberships.useQuery()

  // Fetch queue stats
  const { data: stats, isLoading: statsLoading } = trpc.workqueue.getStats.useQuery(
    { queueId: selectedQueueId },
    { enabled: !!selectedQueueId || !queueId }
  )

  // Fetch activities
  const { data: activities, isLoading: activitiesLoading } = trpc.workqueue.getMyTeamActivities.useQuery({
    includeAssigned: activeTab !== 'unassigned',
    includeUnassigned: activeTab !== 'my',
    limit: 50,
  })

  // Claim mutation
  const claimMutation = trpc.activities.claimFromQueue.useMutation({
    onSuccess: () => {
      toast({ title: 'Activity claimed' })
      utils.workqueue.getMyTeamActivities.invalidate()
      utils.workqueue.getStats.invalidate()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const handleClaim = (activityId: string) => {
    claimMutation.mutate({ activityId })
  }

  // Filter activities
  const filteredActivities = React.useMemo(() => {
    let items = activities?.items ?? []
    
    if (priorityFilter !== 'all') {
      items = items.filter(a => a.priority === priorityFilter)
    }
    
    return items
  }, [activities?.items, priorityFilter])

  // Loading state
  if (membershipsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  // No queue memberships
  if (!memberships || memberships.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Inbox className="h-16 w-16 text-charcoal-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Work Queues</h3>
          <p className="text-charcoal-500">
            You are not a member of any work queues.
            Ask your administrator to add you to a queue.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Main content */}
      <div className={cn(
        "flex-1 space-y-6",
        selectedActivityId && "w-3/5"
      )}>
        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4">
          <StatCard
            icon={<Inbox className="h-5 w-5" />}
            label="Total"
            value={stats?.total ?? 0}
            isLoading={statsLoading}
          />
          <StatCard
            icon={<User className="h-5 w-5" />}
            label="My Activities"
            value={stats?.myActivities ?? 0}
            isLoading={statsLoading}
            highlight
          />
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Unassigned"
            value={stats?.unassigned ?? 0}
            isLoading={statsLoading}
          />
          <StatCard
            icon={<AlertTriangle className="h-5 w-5" />}
            label="Overdue"
            value={stats?.overdue ?? 0}
            isLoading={statsLoading}
            variant="danger"
          />
          <StatCard
            icon={<ArrowUpRight className="h-5 w-5" />}
            label="Escalated"
            value={stats?.escalated ?? 0}
            isLoading={statsLoading}
            variant="warning"
          />
        </div>

        {/* Queue selector and filters */}
        <div className="flex items-center justify-between gap-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList>
              <TabsTrigger value="all" className="gap-1">
                <Inbox className="h-4 w-4" />
                All Activities
              </TabsTrigger>
              <TabsTrigger value="my" className="gap-1">
                <User className="h-4 w-4" />
                My Activities
              </TabsTrigger>
              <TabsTrigger value="unassigned" className="gap-1">
                <Users className="h-4 w-4" />
                Unassigned
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={selectedQueueId || 'all'} 
              onValueChange={(v) => setSelectedQueueId(v === 'all' ? undefined : v)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Queues" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All My Queues</SelectItem>
                {memberships.map(m => {
                  // Handle both array and object formats for queue
                  const queue = Array.isArray(m.queue) ? m.queue[0] : m.queue
                  if (!queue) return null
                  return (
                    <SelectItem key={queue.id} value={queue.id}>
                      {queue.name}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Activities Table */}
        <Card>
          <CardContent className="p-0">
            {activitiesLoading ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-success-300 mx-auto mb-4" />
                <p className="text-charcoal-500">No activities in queue</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Queue</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map((activity) => (
                    <ActivityRow
                      key={activity.id}
                      activity={activity}
                      isSelected={selectedActivityId === activity.id}
                      onSelect={() => setSelectedActivityId(activity.id)}
                      onClaim={() => handleClaim(activity.id)}
                      isClaimLoading={claimMutation.isPending}
                    />
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Panel */}
      {selectedActivityId && (
        <div className="w-2/5 flex-shrink-0">
          <ActivityDetailPanel
            activityId={selectedActivityId}
            onClose={() => setSelectedActivityId(null)}
            onComplete={() => {
              setSelectedActivityId(null)
              utils.workqueue.getMyTeamActivities.invalidate()
              utils.workqueue.getStats.invalidate()
            }}
          />
        </div>
      )}
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  isLoading?: boolean
  variant?: 'default' | 'danger' | 'warning' | 'success'
  highlight?: boolean
}

function StatCard({ icon, label, value, isLoading, variant = 'default', highlight }: StatCardProps) {
  const variantStyles = {
    default: 'text-charcoal-600',
    danger: 'text-red-600',
    warning: 'text-amber-600',
    success: 'text-success-600',
  }

  return (
    <Card className={cn(highlight && 'border-primary-300 bg-primary-50')}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg bg-charcoal-100', variantStyles[variant])}>
            {icon}
          </div>
          <div>
            {isLoading ? (
              <Skeleton className="h-6 w-8" />
            ) : (
              <p className={cn('text-2xl font-bold', variantStyles[variant])}>
                {value}
              </p>
            )}
            <p className="text-xs text-charcoal-500">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ActivityRowProps {
  activity: {
    id: string
    subject: string | null
    activityType: string
    status: string
    priority: string
    dueDate: string | null
    entityType: string
    isOverdue: boolean
    isUnassigned: boolean
    assignedTo: { id: string; full_name: string; avatar_url?: string } | Array<{ id: string; full_name: string; avatar_url?: string }> | null
    queue: { id: string; name: string } | Array<{ id: string; name: string }> | null
    escalationCount: number | null
  }
  isSelected: boolean
  onSelect: () => void
  onClaim: () => void
  isClaimLoading: boolean
}

function ActivityRow({ activity, isSelected, onSelect, onClaim, isClaimLoading }: ActivityRowProps) {
  const today = startOfDay(new Date())
  const dueDate = activity.dueDate ? new Date(activity.dueDate) : null
  const isOverdue = dueDate && isBefore(dueDate, today)
  const isDueToday = dueDate && isToday(dueDate)

  // Handle both array and object formats
  const assignedUser = Array.isArray(activity.assignedTo) ? activity.assignedTo[0] : activity.assignedTo
  const queueData = Array.isArray(activity.queue) ? activity.queue[0] : activity.queue

  return (
    <TableRow
      className={cn(
        'cursor-pointer',
        isSelected && 'bg-primary-50',
        isOverdue && 'bg-red-50'
      )}
      onClick={onSelect}
    >
      <TableCell>
        <span className="text-lg">{ACTIVITY_TYPE_ICONS[activity.activityType] || '📋'}</span>
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium">{activity.subject || 'Activity'}</p>
          <p className="text-xs text-charcoal-500 capitalize">{activity.entityType}</p>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {queueData?.name || 'Unassigned'}
        </Badge>
      </TableCell>
      <TableCell>
        {dueDate ? (
          <div className={cn(
            'text-sm',
            isOverdue && 'text-red-600 font-medium',
            isDueToday && !isOverdue && 'text-amber-600 font-medium'
          )}>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(dueDate, 'MMM d')}
            </div>
            <p className="text-xs text-charcoal-400">
              {formatDistanceToNow(dueDate, { addSuffix: true })}
            </p>
          </div>
        ) : (
          <span className="text-charcoal-400">—</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge className={cn('capitalize', PRIORITY_STYLES[activity.priority])}>
            {activity.priority}
          </Badge>
          {(activity.escalationCount ?? 0) > 0 && (
            <Badge variant="outline" className="text-red-600 border-red-300">
              <ArrowUpRight className="h-3 w-3 mr-0.5" />
              {activity.escalationCount}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        {assignedUser ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={assignedUser.avatar_url} />
              <AvatarFallback className="text-xs">
                {assignedUser.full_name[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{assignedUser.full_name}</span>
          </div>
        ) : (
          <span className="text-charcoal-400 text-sm">Unassigned</span>
        )}
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        {activity.isUnassigned && (
          <Button
            size="sm"
            variant="outline"
            onClick={onClaim}
            disabled={isClaimLoading}
          >
            <Play className="h-3 w-3 mr-1" />
            Claim
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}

export default TeamWorkqueueView

