'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Activity, Phone, Mail, Calendar, CheckSquare, Clock } from 'lucide-react'
import type { DealActivity } from '@/types/deal'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'

interface DealActivitiesSectionProps {
  activities: DealActivity[]
  dealId: string
  onRefresh?: () => void
  onLogActivity?: () => void
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  task: CheckSquare,
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-success-100 text-success-700',
  cancelled: 'bg-charcoal-100 text-charcoal-600',
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  skipped: 'bg-charcoal-100 text-charcoal-500',
}

export function DealActivitiesSection({
  activities,
  dealId,
  onRefresh,
  onLogActivity,
}: DealActivitiesSectionProps) {
  const pendingActivities = activities.filter(
    (a) => a.status === 'pending' || a.status === 'scheduled' || a.status === 'open'
  )

  const handleLogActivity = () => {
    if (onLogActivity) {
      onLogActivity()
    } else {
      // Dispatch event for sidebar/dialog handling
      window.dispatchEvent(
        new CustomEvent('openDealDialog', {
          detail: { dialogId: 'logActivity', dealId },
        })
      )
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-charcoal-900">
            Activities ({activities.length})
          </h2>
          {pendingActivities.length > 0 && (
            <p className="text-sm text-charcoal-500">{pendingActivities.length} pending</p>
          )}
        </div>
        <Button size="sm" onClick={handleLogActivity}>
          <Plus className="h-4 w-4 mr-1" />
          Log Activity
        </Button>
      </div>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {activities.length > 0 ? (
            <div className="divide-y divide-charcoal-100">
              {activities.map((activity) => {
                const Icon = TYPE_ICONS[activity.type] || Activity
                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-4 hover:bg-charcoal-50 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-charcoal-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-charcoal-900 truncate">
                          {activity.subject}
                        </p>
                        <Badge
                          className={cn(
                            'capitalize',
                            STATUS_STYLES[activity.status] || STATUS_STYLES.pending
                          )}
                        >
                          {activity.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-charcoal-500">
                        <span className="capitalize">{activity.type}</span>
                        {activity.assignedTo && <span>{activity.assignedTo}</span>}
                        {activity.dueDate && (
                          <span className="flex items-center gap-1">
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
          ) : (
            <div className="p-8 text-center">
              <Activity className="h-12 w-12 text-charcoal-300 mx-auto mb-4" />
              <p className="text-sm text-charcoal-500">No activities logged for this deal</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={handleLogActivity}>
                <Plus className="h-4 w-4 mr-1" />
                Log First Activity
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DealActivitiesSection
