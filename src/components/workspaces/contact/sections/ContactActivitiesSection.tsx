'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Activity, Phone, Mail, Calendar, MessageSquare, CheckCircle2, Clock, Circle } from 'lucide-react'
import type { ContactActivity } from '@/types/workspace'
import { formatDistanceToNow, format } from 'date-fns'

interface ContactActivitiesSectionProps {
  activities: ContactActivity[]
  contactId: string
}

const ACTIVITY_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: MessageSquare,
  task: CheckCircle2,
}

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  completed: CheckCircle2,
  pending: Clock,
  scheduled: Calendar,
}

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-success-100 text-success-700',
  pending: 'bg-amber-100 text-amber-700',
  scheduled: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-charcoal-100 text-charcoal-600',
}

/**
 * ContactActivitiesSection - Shows activity log with filters
 */
export function ContactActivitiesSection({ activities, contactId }: ContactActivitiesSectionProps) {
  const [filter, setFilter] = React.useState<string>('all')

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter((a) => a.type === filter)

  const activityTypes = [...new Set(activities.map((a) => a.type))]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activities ({activities.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border border-charcoal-200 rounded px-2 py-1"
            >
              <option value="all">All Types</option>
              {activityTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Log Activity
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredActivities.length === 0 ? (
            <div className="py-8 text-center text-charcoal-500">
              <Activity className="h-8 w-8 mx-auto mb-2 text-charcoal-300" />
              <p>No activities yet</p>
              <p className="text-sm mt-1">Log a call, email, or meeting to track engagement.</p>
            </div>
          ) : (
            <div className="divide-y divide-charcoal-100">
              {filteredActivities.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ActivityRow({ activity }: { activity: ContactActivity }) {
  const TypeIcon = ACTIVITY_TYPE_ICONS[activity.type] || Circle
  const StatusIcon = STATUS_ICONS[activity.status] || Circle
  const statusStyle = STATUS_STYLES[activity.status] || 'bg-charcoal-100 text-charcoal-600'

  return (
    <div className="py-3 flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-charcoal-100 flex items-center justify-center flex-shrink-0">
        <TypeIcon className="h-4 w-4 text-charcoal-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="font-medium text-charcoal-900">{activity.subject}</div>
          <span className={`text-xs px-2 py-0.5 rounded capitalize flex items-center gap-1 ${statusStyle}`}>
            <StatusIcon className="h-3 w-3" />
            {activity.status}
          </span>
        </div>
        <div className="text-sm text-charcoal-500 mt-0.5">
          <span className="capitalize">{activity.type}</span>
          {' \u2022 '}{activity.assignedTo}
          {' \u2022 '}{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
        </div>
        {activity.dueDate && (
          <div className="text-xs text-charcoal-400 mt-1">
            Due: {format(new Date(activity.dueDate), 'MMM d, yyyy')}
          </div>
        )}
      </div>
    </div>
  )
}

export default ContactActivitiesSection
