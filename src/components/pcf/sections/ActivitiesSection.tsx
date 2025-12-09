'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

// Activity type icons and colors
const ACTIVITY_TYPE_CONFIG = {
  email: { icon: Mail, color: 'bg-blue-100 text-blue-600', label: 'Email' },
  call: { icon: Phone, color: 'bg-green-100 text-green-600', label: 'Call' },
  meeting: { icon: Video, color: 'bg-purple-100 text-purple-600', label: 'Meeting' },
  note: { icon: MessageSquare, color: 'bg-amber-100 text-amber-600', label: 'Note' },
  linkedin_message: { icon: Linkedin, color: 'bg-sky-100 text-sky-600', label: 'LinkedIn' },
  task: { icon: ClipboardList, color: 'bg-orange-100 text-orange-600', label: 'Task' },
  follow_up: { icon: Clock, color: 'bg-rose-100 text-rose-600', label: 'Follow-up' },
} as const

const ACTIVITY_STATUS_CONFIG = {
  scheduled: { color: 'bg-blue-100 text-blue-700', label: 'Scheduled' },
  open: { color: 'bg-amber-100 text-amber-700', label: 'Open' },
  in_progress: { color: 'bg-purple-100 text-purple-700', label: 'In Progress' },
  completed: { color: 'bg-green-100 text-green-700', label: 'Completed' },
  skipped: { color: 'bg-charcoal-100 text-charcoal-600', label: 'Skipped' },
  canceled: { color: 'bg-red-100 text-red-700', label: 'Canceled' },
} as const

interface ActivityType {
  id: string
  subject: string
  description?: string
  activity_type: string
  status: string
  scheduled_at?: string
  created_at: string
  outcome?: string
  creator?: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

interface ActivitiesSectionProps {
  entityType: string
  entityId: string
  onLogActivity?: () => void
  showInlineForm?: boolean
}

export function ActivitiesSection({
  entityType,
  entityId,
  onLogActivity,
  showInlineForm: _showInlineForm = true,
}: ActivitiesSectionProps) {
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null)

  const utils = trpc.useUtils()

  const activitiesQuery = trpc.activities.listByEntity.useQuery({
    entityType,
    entityId,
    limit: 50,
  })

  const completeActivity = trpc.activities.complete.useMutation({
    onSuccess: () => {
      utils.activities.listByEntity.invalidate({ entityType, entityId })
    },
  })

  const activities = (activitiesQuery.data?.items || []) as unknown as ActivityType[]
  const selectedActivity = activities.find((a) => a.id === selectedActivityId)

  const handleComplete = (activityId: string) => {
    completeActivity.mutate({ id: activityId })
  }

  if (activitiesQuery.isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white animate-pulse">
            <CardContent className="py-4">
              <div className="h-16 bg-charcoal-100 rounded" />
            </CardContent>
          </Card>
        ))}
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
    <div className="flex gap-4">
      {/* Activity List */}
      <div
        className={cn(
          'flex-1 space-y-3 transition-all duration-300',
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

        {/* Activity cards */}
        {activities.map((activity) => {
          const typeConfig = ACTIVITY_TYPE_CONFIG[activity.activity_type as keyof typeof ACTIVITY_TYPE_CONFIG]
          const statusConfig = ACTIVITY_STATUS_CONFIG[activity.status as keyof typeof ACTIVITY_STATUS_CONFIG]
          const Icon = typeConfig?.icon || MessageSquare

          return (
            <Card
              key={activity.id}
              className={cn(
                'bg-white cursor-pointer transition-all duration-200',
                selectedActivityId === activity.id
                  ? 'ring-2 ring-gold-500 bg-gold-50/30'
                  : 'hover:shadow-sm'
              )}
              onClick={() => setSelectedActivityId(activity.id)}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={cn('p-2 rounded-lg', typeConfig?.color || 'bg-charcoal-100')}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-charcoal-900 line-clamp-1">
                          {activity.subject}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={cn('text-xs', statusConfig?.color)}>
                            {statusConfig?.label || activity.status}
                          </Badge>
                          <span className="text-xs text-charcoal-500">
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>

                      {/* Quick actions */}
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
                    </div>

                    {/* Description preview */}
                    {activity.description && (
                      <p className="text-sm text-charcoal-500 mt-2 line-clamp-2">
                        {activity.description}
                      </p>
                    )}

                    {/* Creator */}
                    {activity.creator && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-charcoal-400">
                        <User className="w-3 h-3" />
                        {activity.creator.full_name}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Inline Panel */}
      <InlinePanel
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivityId(null)}
        title={selectedActivity?.subject || 'Activity'}
        description={ACTIVITY_TYPE_CONFIG[selectedActivity?.activity_type as keyof typeof ACTIVITY_TYPE_CONFIG]?.label}
        width="md"
      >
        {selectedActivity && (
          <>
            <InlinePanelSection title="Details">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Status</span>
                  <Badge className={ACTIVITY_STATUS_CONFIG[selectedActivity.status as keyof typeof ACTIVITY_STATUS_CONFIG]?.color}>
                    {ACTIVITY_STATUS_CONFIG[selectedActivity.status as keyof typeof ACTIVITY_STATUS_CONFIG]?.label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Type</span>
                  <span className="font-medium">
                    {ACTIVITY_TYPE_CONFIG[selectedActivity.activity_type as keyof typeof ACTIVITY_TYPE_CONFIG]?.label}
                  </span>
                </div>
                {selectedActivity.scheduled_at && (
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Scheduled</span>
                    <span className="font-medium">
                      {format(new Date(selectedActivity.scheduled_at), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Created</span>
                  <span className="font-medium">
                    {format(new Date(selectedActivity.created_at), 'MMM d, yyyy')}
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

            {selectedActivity.outcome && (
              <InlinePanelSection title="Outcome">
                <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
                  {selectedActivity.outcome}
                </p>
              </InlinePanelSection>
            )}
          </>
        )}
      </InlinePanel>
    </div>
  )
}
