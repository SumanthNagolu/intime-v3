'use client'

import { AlertTriangle, Clock, User, CheckCircle, ExternalLink } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface BlockingActivity {
  id: string
  subject: string | null
  status: string
  priority: string
  dueDate: string | null
  assignedTo: {
    id: string
    firstName: string
    lastName: string
  } | null
  blockingStatuses: string[]
}

interface BlockingActivitiesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activities: BlockingActivity[]
  targetStatus: string
  entityType: string
  entityName?: string
  onActivityClick?: (activityId: string) => void
}

const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  low: { bg: 'bg-charcoal-100', text: 'text-charcoal-600' },
  normal: { bg: 'bg-blue-100', text: 'text-blue-600' },
  high: { bg: 'bg-orange-100', text: 'text-orange-600' },
  urgent: { bg: 'bg-red-100', text: 'text-red-600' },
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  open: { bg: 'bg-blue-100', text: 'text-blue-600' },
  in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  scheduled: { bg: 'bg-purple-100', text: 'text-purple-600' },
}

/**
 * Dialog showing blocking activities that prevent an entity status change.
 * Allows users to see what needs to be completed before closing.
 */
export function BlockingActivitiesDialog({
  open,
  onOpenChange,
  activities,
  targetStatus,
  entityType,
  entityName,
  onActivityClick,
}: BlockingActivitiesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-error-600">
            <AlertTriangle className="h-5 w-5" />
            Cannot Change Status
          </DialogTitle>
          <DialogDescription>
            The following activities must be completed before changing{' '}
            {entityName ? `"${entityName}"` : `this ${entityType}`} to{' '}
            <span className="font-medium text-charcoal-900">{targetStatus}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto space-y-3">
          {activities.map((activity) => {
            const priorityStyle = PRIORITY_STYLES[activity.priority] || PRIORITY_STYLES.normal
            const statusStyle = STATUS_STYLES[activity.status] || STATUS_STYLES.open
            const isOverdue = activity.dueDate && new Date(activity.dueDate) < new Date()

            return (
              <div
                key={activity.id}
                className={cn(
                  'rounded-lg border p-3 transition-colors',
                  onActivityClick && 'cursor-pointer hover:bg-charcoal-50'
                )}
                onClick={() => onActivityClick?.(activity.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-charcoal-900 truncate">
                        {activity.subject || 'Untitled Activity'}
                      </p>
                      {onActivityClick && (
                        <ExternalLink className="h-3 w-3 text-charcoal-400 flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <Badge
                        variant="outline"
                        className={cn('text-xs', statusStyle.bg, statusStyle.text)}
                      >
                        {activity.status.replace('_', ' ')}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn('text-xs', priorityStyle.bg, priorityStyle.text)}
                      >
                        {activity.priority}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-2 text-xs text-charcoal-500">
                  {activity.dueDate && (
                    <div className={cn('flex items-center gap-1', isOverdue && 'text-error-600')}>
                      <Clock className="h-3 w-3" />
                      <span>
                        {isOverdue ? 'Overdue by ' : 'Due '}
                        {formatDistanceToNow(new Date(activity.dueDate), { addSuffix: !isOverdue })}
                      </span>
                    </div>
                  )}
                  {activity.assignedTo && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>
                        {activity.assignedTo.firstName} {activity.assignedTo.lastName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="rounded-lg bg-charcoal-50 p-3 mt-2">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-charcoal-500 mt-0.5" />
            <div className="text-sm text-charcoal-600">
              <p className="font-medium">To proceed:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
                <li>Complete all blocking activities above</li>
                <li>Or cancel/reassign them if no longer needed</li>
                <li>Then retry the status change</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onActivityClick && activities.length > 0 && (
            <Button
              onClick={() => {
                onActivityClick(activities[0].id)
                onOpenChange(false)
              }}
            >
              View First Activity
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
