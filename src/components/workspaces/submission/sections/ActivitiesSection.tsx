'use client'

import { useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import {
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Video,
  MessageSquare,
  Linkedin,
  ClipboardList,
  User,
  Plus,
  Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { InlinePanel, InlinePanelSection } from '@/components/ui/inline-panel'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/pcf/shared/EmptyState'
import type { FullSubmission, Activity as ActivityType } from '@/types/submission'

const ACTIVITY_TYPE_ICONS: Record<string, React.ElementType> = {
  email: Mail,
  call: Phone,
  meeting: Video,
  note: MessageSquare,
  linkedin_message: Linkedin,
  task: ClipboardList,
  follow_up: Clock,
}

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  email: 'Email',
  call: 'Call',
  meeting: 'Meeting',
  note: 'Note',
  linkedin_message: 'LinkedIn',
  task: 'Task',
  follow_up: 'Follow Up',
}

const ACTIVITY_STATUS_STYLES: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  open: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  skipped: 'bg-charcoal-100 text-charcoal-600',
  canceled: 'bg-red-100 text-red-700',
}

interface ActivitiesSectionProps {
  submission: FullSubmission
}

export function ActivitiesSection({ submission }: ActivitiesSectionProps) {
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null)
  const activities = submission.sections?.activities?.items || []
  const selectedActivity = activities.find((a) => a.id === selectedActivityId)

  if (activities.length === 0) {
    return (
      <EmptyState
        config={{
          icon: Activity,
          title: 'No activities yet',
          description: 'Log your first activity to track interactions with this submission',
          action: { label: 'Log Activity', onClick: () => {} },
        }}
        variant="inline"
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Activity className="w-5 h-5 text-charcoal-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-charcoal-900">{activities.length}</p>
                <p className="text-sm text-charcoal-500">Total Activities</p>
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
                  {activities.filter((a) => a.status === 'completed').length}
                </p>
                <p className="text-sm text-charcoal-500">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-charcoal-900">
                  {activities.filter((a) => a.status === 'open' || a.status === 'scheduled').length}
                </p>
                <p className="text-sm text-charcoal-500">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activities List with Inline Panel */}
      <div className="flex gap-4">
        <div
          className={cn(
            'flex-1 transition-all duration-300',
            selectedActivityId ? 'max-w-[calc(100%-400px)]' : 'max-w-full'
          )}
        >
          {/* Header */}
          <div className="flex justify-end mb-4">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Log Activity
            </Button>
          </div>

          {/* Activity Cards */}
          <div className="space-y-2">
            {activities.map((activity) => {
              const Icon = ACTIVITY_TYPE_ICONS[activity.activity_type] || Activity
              return (
                <Card
                  key={activity.id}
                  className={cn(
                    'bg-white cursor-pointer transition-all duration-300',
                    selectedActivityId === activity.id
                      ? 'ring-2 ring-gold-500'
                      : 'hover:shadow-md'
                  )}
                  onClick={() => setSelectedActivityId(activity.id)}
                >
                  <CardContent className="py-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'p-2 rounded-lg',
                          activity.status === 'completed'
                            ? 'bg-green-100'
                            : 'bg-charcoal-100'
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-4 h-4',
                            activity.status === 'completed'
                              ? 'text-green-600'
                              : 'text-charcoal-600'
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-charcoal-900 truncate">
                            {activity.subject || ACTIVITY_TYPE_LABELS[activity.activity_type]}
                          </p>
                          <Badge className={ACTIVITY_STATUS_STYLES[activity.status || 'open'] || 'bg-charcoal-100'}>
                            {(activity.status || 'open').replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-charcoal-500 line-clamp-1 mt-0.5">
                          {activity.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-charcoal-400">
                          <span>
                            {activity.created_at
                              ? formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })
                              : '—'}
                          </span>
                          {activity.performedBy && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {activity.performedBy.full_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Inline Panel */}
        <InlinePanel
          isOpen={!!selectedActivity}
          onClose={() => setSelectedActivityId(null)}
          title={selectedActivity?.subject || 'Activity'}
          description={ACTIVITY_TYPE_LABELS[selectedActivity?.activity_type || ''] || 'Activity details'}
          width="md"
        >
          {selectedActivity && (
            <>
              <InlinePanelSection title="Details">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Status</span>
                    <Badge className={ACTIVITY_STATUS_STYLES[selectedActivity.status || 'open'] || 'bg-charcoal-100'}>
                      {(selectedActivity.status || 'open').replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Type</span>
                    <span className="font-medium">
                      {ACTIVITY_TYPE_LABELS[selectedActivity.activity_type] || selectedActivity.activity_type}
                    </span>
                  </div>
                  {selectedActivity.priority && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Priority</span>
                      <Badge
                        className={
                          selectedActivity.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : selectedActivity.priority === 'medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-charcoal-100 text-charcoal-600'
                        }
                      >
                        {selectedActivity.priority}
                      </Badge>
                    </div>
                  )}
                  {selectedActivity.due_date && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Due Date</span>
                      <span className="font-medium">
                        {format(new Date(selectedActivity.due_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  {selectedActivity.completed_at && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Completed</span>
                      <span className="font-medium">
                        {format(new Date(selectedActivity.completed_at), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Created</span>
                    <span className="font-medium">
                      {selectedActivity.created_at &&
                        format(new Date(selectedActivity.created_at), 'MMM d, yyyy')}
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
