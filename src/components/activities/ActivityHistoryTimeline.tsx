'use client'

import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  Check,
  SkipForward,
  ArrowUpRight,
  UserPlus,
  AlertTriangle,
  MessageSquare,
  CheckSquare,
  Play,
  Pause,
  Bell,
  RotateCcw,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface HistoryEntry {
  id: string
  action: string
  fieldChanged: string | null
  oldValue: string | null
  newValue: string | null
  notes: string | null
  changedAt: string
  changedBy: {
    id: string
    full_name: string
    avatar_url?: string
  } | Array<{ id: string; full_name: string; avatar_url?: string }> | null
}

interface EscalationEntry {
  id: string
  level: number
  reason: string | null
  type: 'automatic' | 'manual'
  createdAt: string
  from: { id: string; full_name: string } | Array<{ id: string; full_name: string }> | null
  to: { id: string; full_name: string } | Array<{ id: string; full_name: string }> | null
}

interface ActivityHistoryTimelineProps {
  history: HistoryEntry[]
  escalations?: EscalationEntry[]
}

// Map action types to icons and styles
const ACTION_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  created: { icon: Play, color: 'text-blue-600 bg-blue-100', label: 'Created' },
  completed: { icon: Check, color: 'text-success-600 bg-success-100', label: 'Completed' },
  skipped: { icon: SkipForward, color: 'text-charcoal-600 bg-charcoal-100', label: 'Skipped' },
  escalated: { icon: ArrowUpRight, color: 'text-red-600 bg-red-100', label: 'Escalated' },
  assigned: { icon: UserPlus, color: 'text-purple-600 bg-purple-100', label: 'Assigned' },
  claimed: { icon: Play, color: 'text-blue-600 bg-blue-100', label: 'Claimed' },
  released: { icon: RotateCcw, color: 'text-amber-600 bg-amber-100', label: 'Released' },
  snoozed: { icon: Pause, color: 'text-blue-600 bg-blue-100', label: 'Snoozed' },
  reminder_sent: { icon: Bell, color: 'text-amber-600 bg-amber-100', label: 'Reminder Sent' },
  note_added: { icon: MessageSquare, color: 'text-charcoal-600 bg-charcoal-100', label: 'Note Added' },
  checklist_updated: { icon: CheckSquare, color: 'text-blue-600 bg-blue-100', label: 'Checklist Updated' },
  auto_completed: { icon: Check, color: 'text-success-600 bg-success-100', label: 'Auto-Completed' },
  assigned_to_queue: { icon: UserPlus, color: 'text-purple-600 bg-purple-100', label: 'Assigned to Queue' },
}

/**
 * ActivityHistoryTimeline - Displays the activity's history and escalations
 */
export function ActivityHistoryTimeline({
  history,
  escalations = [],
}: ActivityHistoryTimelineProps) {
  // Combine and sort history and escalations
  const timelineItems = React.useMemo(() => {
    const combined: Array<{
      type: 'history' | 'escalation'
      timestamp: Date
      data: HistoryEntry | EscalationEntry
    }> = []

    history.forEach(h => {
      combined.push({
        type: 'history',
        timestamp: new Date(h.changedAt),
        data: h,
      })
    })

    escalations.forEach(e => {
      combined.push({
        type: 'escalation',
        timestamp: new Date(e.createdAt),
        data: e,
      })
    })

    // Sort by timestamp descending (newest first)
    return combined.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [history, escalations])

  if (timelineItems.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-charcoal-300 mx-auto mb-2" />
        <p className="text-charcoal-400 text-sm">No history yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {timelineItems.map((item) => (
        item.type === 'history' 
          ? <HistoryItem key={item.data.id} entry={item.data as HistoryEntry} />
          : <EscalationItem key={item.data.id} entry={item.data as EscalationEntry} />
      ))}
    </div>
  )
}

function HistoryItem({ entry }: { entry: HistoryEntry }) {
  const config = ACTION_CONFIG[entry.action] || {
    icon: Clock,
    color: 'text-charcoal-600 bg-charcoal-100',
    label: entry.action,
  }
  const Icon = config.icon

  // Handle both array and object formats for changedBy
  const changedByUser = Array.isArray(entry.changedBy) 
    ? entry.changedBy[0] 
    : entry.changedBy

  return (
    <div className="flex gap-3">
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        config.color
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 pt-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{config.label}</span>
          {changedByUser && (
            <span className="text-charcoal-500">
              by {changedByUser.full_name}
            </span>
          )}
        </div>
        
        {/* Field change details */}
        {entry.fieldChanged && (
          <p className="text-xs text-charcoal-500 mt-0.5">
            {entry.fieldChanged}:{' '}
            {entry.oldValue && (
              <span className="line-through text-charcoal-400">{entry.oldValue}</span>
            )}
            {entry.oldValue && entry.newValue && ' → '}
            {entry.newValue && (
              <span className="font-medium">{entry.newValue}</span>
            )}
          </p>
        )}

        {/* Notes */}
        {entry.notes && (
          <p className="text-xs text-charcoal-600 mt-1 italic">
            "{entry.notes}"
          </p>
        )}

        <p className="text-xs text-charcoal-400 mt-1">
          {format(new Date(entry.changedAt), 'PPp')}
        </p>
      </div>
    </div>
  )
}

function EscalationItem({ entry }: { entry: EscalationEntry }) {
  // Handle both array and object formats
  const fromUser = Array.isArray(entry.from) ? entry.from[0] : entry.from
  const toUser = Array.isArray(entry.to) ? entry.to[0] : entry.to

  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
        <ArrowUpRight className="h-4 w-4 text-red-600" />
      </div>
      <div className="flex-1 pt-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Escalated to Level {entry.level}</span>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs py-0",
              entry.type === 'automatic' 
                ? "text-amber-700 border-amber-300" 
                : "text-blue-700 border-blue-300"
            )}
          >
            {entry.type}
          </Badge>
        </div>

        {entry.reason && (
          <p className="text-xs text-charcoal-600 mt-0.5">
            {entry.reason}
          </p>
        )}

        {(fromUser || toUser) && (
          <p className="text-xs text-charcoal-500 mt-0.5">
            {fromUser && `From ${fromUser.full_name}`}
            {fromUser && toUser && ' → '}
            {toUser && `To ${toUser.full_name}`}
          </p>
        )}

        <p className="text-xs text-charcoal-400 mt-1">
          {format(new Date(entry.createdAt), 'PPp')}
        </p>
      </div>
    </div>
  )
}

export default ActivityHistoryTimeline

