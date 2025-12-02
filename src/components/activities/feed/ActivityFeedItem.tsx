/**
 * Activity Feed Item
 *
 * Activity display within a feed - expandable with quick actions.
 */

'use client';

import React, { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  ChevronDown, ChevronUp, Clock, CheckCircle, XCircle,
  PlayCircle, PauseCircle, ExternalLink, MoreHorizontal,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { getPattern, getCategoryColor } from '@/lib/activities/patterns';
import { getStatusConfig, type ActivityStatus } from '@/lib/activities/transitions';
import { calculateSLAStatus, type Priority } from '@/lib/activities/sla';

// ==========================================
// TYPES
// ==========================================

export interface FeedActivity {
  id: string;
  subject: string;
  description?: string;
  patternId: string;
  status: ActivityStatus;
  priority: Priority;
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  dueAt?: string;
  completedAt?: string;
  createdAt: string;
  checklist?: Array<{
    id: string;
    label: string;
    completed: boolean;
  }>;
  entity?: {
    type: string;
    id: string;
    name: string;
    url: string;
  };
}

export interface ActivityFeedItemProps {
  /** Activity data */
  activity: FeedActivity;

  /** Click handler for activity link */
  onActivityClick?: (activity: FeedActivity) => void;

  /** Quick action handlers */
  onStartActivity?: (activity: FeedActivity) => void;
  onCompleteActivity?: (activity: FeedActivity) => void;
  onDeferActivity?: (activity: FeedActivity) => void;

  /** Show quick actions */
  showQuickActions?: boolean;

  /** Compact mode */
  compact?: boolean;

  /** Additional className */
  className?: string;
}

// ==========================================
// HELPER COMPONENTS
// ==========================================

function ChecklistPreview({
  items,
}: {
  items: Array<{ id: string; label: string; completed: boolean }>;
}) {
  const completed = items.filter(i => i.completed).length;
  const total = items.length;
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Checklist Progress</span>
        <span>{completed}/{total}</span>
      </div>
      <Progress value={percentage} className="h-1.5" />
      <div className="space-y-1">
        {items.slice(0, 3).map((item) => (
          <div key={item.id} className="flex items-center gap-2 text-xs">
            <div className={cn(
              'h-3 w-3 rounded-sm border flex items-center justify-center',
              item.completed ? 'bg-primary border-primary' : 'border-muted-foreground'
            )}>
              {item.completed && <CheckCircle className="h-2 w-2 text-primary-foreground" />}
            </div>
            <span className={cn(item.completed && 'line-through text-muted-foreground')}>
              {item.label}
            </span>
          </div>
        ))}
        {items.length > 3 && (
          <p className="text-xs text-muted-foreground">
            +{items.length - 3} more items
          </p>
        )}
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function ActivityFeedItem({
  activity,
  onActivityClick,
  onStartActivity,
  onCompleteActivity,
  onDeferActivity,
  showQuickActions = true,
  compact = false,
  className,
}: ActivityFeedItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const pattern = getPattern(activity.patternId);
  const statusConfig = getStatusConfig(activity.status);
  const PatternIcon = pattern?.icon || CheckCircle;

  const slaStatus = activity.dueAt
    ? calculateSLAStatus(activity.dueAt, activity.priority)
    : null;

  const isActionable = activity.status === 'pending' || activity.status === 'in_progress';
  const isPending = activity.status === 'pending';
  const isInProgress = activity.status === 'in_progress';

  const completedChecklist = activity.checklist?.filter(i => i.completed).length || 0;
  const totalChecklist = activity.checklist?.length || 0;

  return (
    <div className={cn(
      'group border rounded-lg p-3 transition-colors',
      'hover:border-primary/30 hover:bg-muted/30',
      className
    )}>
      {/* Main Content */}
      <div className="flex items-start gap-3">
        {/* Pattern Icon */}
        <div className={cn(
          'p-2 rounded-lg flex-shrink-0',
          pattern ? getCategoryColor(pattern.category) : 'bg-gray-100'
        )}>
          <PatternIcon className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Subject */}
          <div className="flex items-start justify-between gap-2">
            <button
              onClick={() => onActivityClick?.(activity)}
              className="text-sm font-medium text-left hover:text-primary hover:underline truncate"
            >
              {activity.subject}
            </button>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Status Badge */}
              <Badge
                variant="outline"
                className={cn('text-xs', statusConfig.color)}
              >
                {statusConfig.label}
              </Badge>

              {/* Actions Menu */}
              {showQuickActions && isActionable && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isPending && onStartActivity && (
                      <DropdownMenuItem onClick={() => onStartActivity(activity)}>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Start
                      </DropdownMenuItem>
                    )}
                    {isInProgress && onCompleteActivity && (
                      <DropdownMenuItem onClick={() => onCompleteActivity(activity)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete
                      </DropdownMenuItem>
                    )}
                    {onDeferActivity && (
                      <DropdownMenuItem onClick={() => onDeferActivity(activity)}>
                        <PauseCircle className="h-4 w-4 mr-2" />
                        Defer
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Meta Row */}
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            {/* Assignee */}
            {activity.assignee && (
              <div className="flex items-center gap-1">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={activity.assignee.avatarUrl} />
                  <AvatarFallback className="text-[8px]">
                    {activity.assignee.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate max-w-[100px]">{activity.assignee.name}</span>
              </div>
            )}

            {/* Due/Completed Date */}
            {activity.completedAt ? (
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                {format(new Date(activity.completedAt), 'MMM d')}
              </span>
            ) : activity.dueAt ? (
              <span className={cn(
                'flex items-center gap-1',
                slaStatus === 'breached' && 'text-red-600',
                slaStatus === 'at_risk' && 'text-amber-600'
              )}>
                <Clock className="h-3 w-3" />
                {format(new Date(activity.dueAt), 'MMM d')}
              </span>
            ) : null}

            {/* Checklist Progress */}
            {totalChecklist > 0 && (
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {completedChecklist}/{totalChecklist}
              </span>
            )}

            {/* Related Entity */}
            {activity.entity && (
              <span className="flex items-center gap-1">
                <span className="capitalize">{activity.entity.type}:</span>
                <span className="truncate max-w-[120px]">{activity.entity.name}</span>
              </span>
            )}
          </div>

          {/* Expand Toggle */}
          {!compact && (activity.description || (activity.checklist && activity.checklist.length > 0)) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  Show more
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && !compact && (
        <div className="mt-3 pl-11 space-y-3">
          {activity.description && (
            <p className="text-sm text-muted-foreground">{activity.description}</p>
          )}

          {activity.checklist && activity.checklist.length > 0 && (
            <ChecklistPreview items={activity.checklist} />
          )}

          {activity.entity && (
            <a
              href={activity.entity.url}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View {activity.entity.type}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default ActivityFeedItem;
