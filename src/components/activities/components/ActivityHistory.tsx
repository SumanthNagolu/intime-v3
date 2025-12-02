/**
 * Activity History
 *
 * Audit log and history display for an activity.
 */

'use client';

import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Clock, User, Edit, CheckCircle, XCircle, PlayCircle,
  PauseCircle, ArrowRight, FileText, MessageSquare,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { getStatusConfig, type ActivityStatus } from '@/lib/activities/transitions';

// ==========================================
// TYPES
// ==========================================

export type HistoryEventType =
  | 'created'
  | 'status_changed'
  | 'reassigned'
  | 'field_updated'
  | 'checklist_updated'
  | 'comment_added'
  | 'due_date_changed'
  | 'priority_changed';

export interface HistoryEvent {
  id: string;
  type: HistoryEventType;
  timestamp: string;
  actor: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  changes?: {
    field?: string;
    oldValue?: unknown;
    newValue?: unknown;
  };
  metadata?: Record<string, unknown>;
}

export interface ActivityHistoryProps {
  /** History events */
  events: HistoryEvent[];

  /** Loading state */
  isLoading?: boolean;

  /** Show relative timestamps */
  relativeTime?: boolean;

  /** Maximum events to show initially */
  initialLimit?: number;

  /** Additional className */
  className?: string;
}

// ==========================================
// HELPER COMPONENTS
// ==========================================

const EVENT_ICONS: Record<HistoryEventType, typeof Clock> = {
  created: Clock,
  status_changed: ArrowRight,
  reassigned: User,
  field_updated: Edit,
  checklist_updated: CheckCircle,
  comment_added: MessageSquare,
  due_date_changed: Clock,
  priority_changed: FileText,
};

const EVENT_COLORS: Record<HistoryEventType, string> = {
  created: 'bg-blue-100 text-blue-600',
  status_changed: 'bg-purple-100 text-purple-600',
  reassigned: 'bg-amber-100 text-amber-600',
  field_updated: 'bg-gray-100 text-gray-600',
  checklist_updated: 'bg-green-100 text-green-600',
  comment_added: 'bg-teal-100 text-teal-600',
  due_date_changed: 'bg-orange-100 text-orange-600',
  priority_changed: 'bg-red-100 text-red-600',
};

function getEventDescription(event: HistoryEvent): React.ReactNode {
  const { type, changes, metadata } = event;

  switch (type) {
    case 'created':
      return 'created this activity';

    case 'status_changed':
      const oldStatus = changes?.oldValue as ActivityStatus | undefined;
      const newStatus = changes?.newValue as ActivityStatus | undefined;
      return (
        <>
          changed status from{' '}
          {oldStatus && (
            <Badge variant="outline" className="mx-1 text-xs">
              {getStatusConfig(oldStatus).label}
            </Badge>
          )}
          to{' '}
          {newStatus && (
            <Badge variant="outline" className={cn('mx-1 text-xs', getStatusConfig(newStatus).color)}>
              {getStatusConfig(newStatus).label}
            </Badge>
          )}
        </>
      );

    case 'reassigned':
      const oldAssignee = changes?.oldValue as string | undefined;
      const newAssignee = changes?.newValue as string | undefined;
      if (oldAssignee && newAssignee) {
        return (
          <>
            reassigned from <strong>{oldAssignee}</strong> to <strong>{newAssignee}</strong>
          </>
        );
      }
      return (
        <>
          assigned to <strong>{newAssignee || 'someone'}</strong>
        </>
      );

    case 'field_updated':
      const fieldName = changes?.field || 'a field';
      if (changes?.oldValue && changes?.newValue) {
        return (
          <>
            updated <strong>{fieldName}</strong> from &quot;{String(changes.oldValue)}&quot; to &quot;{String(changes.newValue)}&quot;
          </>
        );
      }
      return (
        <>
          updated <strong>{fieldName}</strong>
        </>
      );

    case 'checklist_updated':
      const checklistItem = metadata?.itemLabel as string | undefined;
      const completed = metadata?.completed as boolean | undefined;
      if (checklistItem) {
        return (
          <>
            {completed ? 'completed' : 'unchecked'} checklist item: <strong>{checklistItem}</strong>
          </>
        );
      }
      return 'updated the checklist';

    case 'comment_added':
      return 'added a comment';

    case 'due_date_changed':
      const oldDate = changes?.oldValue as string | undefined;
      const newDate = changes?.newValue as string | undefined;
      return (
        <>
          changed due date
          {oldDate && ` from ${format(new Date(oldDate), 'MMM d, yyyy')}`}
          {newDate && ` to ${format(new Date(newDate), 'MMM d, yyyy')}`}
        </>
      );

    case 'priority_changed':
      return (
        <>
          changed priority from <strong>{String(changes?.oldValue)}</strong> to{' '}
          <strong>{String(changes?.newValue)}</strong>
        </>
      );

    default:
      return 'made changes';
  }
}

function HistoryItem({
  event,
  relativeTime,
}: {
  event: HistoryEvent;
  relativeTime?: boolean;
}) {
  const Icon = EVENT_ICONS[event.type] || Clock;
  const colorClass = EVENT_COLORS[event.type] || 'bg-gray-100 text-gray-600';
  const timestamp = new Date(event.timestamp);

  return (
    <div className="flex gap-3 py-3">
      {/* Icon */}
      <div className={cn('p-1.5 rounded-full h-fit', colorClass)}>
        <Icon className="h-3.5 w-3.5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm">
            <span className="font-medium">{event.actor.name}</span>{' '}
            {getEventDescription(event)}
          </div>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {relativeTime
              ? formatDistanceToNow(timestamp, { addSuffix: true })
              : format(timestamp, 'MMM d, h:mm a')
            }
          </span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function ActivityHistory({
  events,
  isLoading = false,
  relativeTime = true,
  initialLimit = 10,
  className,
}: ActivityHistoryProps) {
  const [showAll, setShowAll] = React.useState(false);

  const displayedEvents = showAll ? events : events.slice(0, initialLimit);
  const hasMore = events.length > initialLimit;

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={cn('text-center py-8 text-muted-foreground', className)}>
        No history available
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="font-medium mb-4">Activity History</h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border" />

        {/* Events */}
        <div className="space-y-0">
          {displayedEvents.map((event, index) => (
            <React.Fragment key={event.id}>
              <HistoryItem event={event} relativeTime={relativeTime} />
              {index < displayedEvents.length - 1 && (
                <Separator className="ml-8" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Show more/less */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 text-sm text-primary hover:underline"
        >
          {showAll ? 'Show less' : `Show ${events.length - initialLimit} more`}
        </button>
      )}
    </div>
  );
}

export default ActivityHistory;
