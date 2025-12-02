/**
 * Upcoming Activities Widget
 *
 * Near-term focus list for activities due soon.
 */

'use client';

import React from 'react';
import { format, isToday, isTomorrow, differenceInHours } from 'date-fns';
import {
  Calendar, ArrowRight, Clock, CheckCircle, PlayCircle,
  AlertCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { getPattern, getCategoryColor } from '@/lib/activities/patterns';
import type { ActivityStatus } from '@/lib/activities/transitions';
import type { Priority } from '@/lib/activities/sla';

// ==========================================
// TYPES
// ==========================================

interface UpcomingActivity {
  id: string;
  subject: string;
  patternId: string;
  status: ActivityStatus;
  priority: Priority;
  dueAt: string;
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export interface UpcomingActivitiesWidgetProps {
  /** Upcoming activities */
  activities: UpcomingActivity[];

  /** Loading state */
  isLoading?: boolean;

  /** Activity click handler */
  onActivityClick?: (activity: UpcomingActivity) => void;

  /** Quick start handler */
  onStartActivity?: (activity: UpcomingActivity) => void;

  /** View all handler */
  onViewAll?: () => void;

  /** Show assignee (team view) */
  showAssignee?: boolean;

  /** Hours threshold for "due soon" highlighting */
  soonThresholdHours?: number;

  /** Additional className */
  className?: string;
}

// ==========================================
// HELPER COMPONENTS
// ==========================================

function UpcomingActivityItem({
  activity,
  onClick,
  onStart,
  showAssignee,
  soonThresholdHours = 4,
}: {
  activity: UpcomingActivity;
  onClick?: () => void;
  onStart?: () => void;
  showAssignee?: boolean;
  soonThresholdHours?: number;
}) {
  const pattern = getPattern(activity.patternId);
  const PatternIcon = pattern?.icon || CheckCircle;

  const dueDate = new Date(activity.dueAt);
  const hoursUntilDue = differenceInHours(dueDate, new Date());
  const isDueSoon = hoursUntilDue <= soonThresholdHours && hoursUntilDue > 0;
  const isPending = activity.status === 'pending';

  return (
    <div className={cn(
      'group flex items-center gap-3 p-2 rounded-lg transition-colors',
      'hover:bg-muted/50',
      isDueSoon && 'bg-amber-50/50'
    )}>
      {/* Pattern Icon */}
      <div className={cn(
        'p-1.5 rounded flex-shrink-0',
        pattern ? getCategoryColor(pattern.category) : 'bg-gray-100'
      )}>
        <PatternIcon className="h-3.5 w-3.5" />
      </div>

      {/* Content */}
      <button
        onClick={onClick}
        className="flex-1 min-w-0 text-left"
      >
        <p className="text-sm font-medium truncate hover:text-primary">
          {activity.subject}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn(
            'text-xs flex items-center gap-1',
            isDueSoon ? 'text-amber-600' : 'text-muted-foreground'
          )}>
            {isDueSoon ? (
              <AlertCircle className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            {format(dueDate, 'h:mm a')}
          </span>
          {activity.priority === 'critical' || activity.priority === 'urgent' ? (
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] px-1',
                activity.priority === 'critical' && 'border-red-300 text-red-600',
                activity.priority === 'urgent' && 'border-orange-300 text-orange-600'
              )}
            >
              {activity.priority}
            </Badge>
          ) : null}
        </div>
      </button>

      {/* Assignee */}
      {showAssignee && activity.assignee && (
        <Avatar className="h-6 w-6 flex-shrink-0">
          <AvatarImage src={activity.assignee.avatarUrl} />
          <AvatarFallback className="text-[10px]">
            {activity.assignee.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Quick Start */}
      {isPending && onStart && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onStart();
          }}
        >
          <PlayCircle className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function UpcomingActivitiesWidget({
  activities,
  isLoading = false,
  onActivityClick,
  onStartActivity,
  onViewAll,
  showAssignee = false,
  soonThresholdHours = 4,
  className,
}: UpcomingActivitiesWidgetProps) {
  // Group activities by due date
  const todayActivities = activities.filter(a => isToday(new Date(a.dueAt)));
  const tomorrowActivities = activities.filter(a => isTomorrow(new Date(a.dueAt)));

  const totalCount = activities.length;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            <div className="h-12 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No activities due in the next 48 hours</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming Activities
          </CardTitle>
          <Badge variant="secondary">{totalCount}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Due Today */}
        {todayActivities.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase">
                Due Today
              </span>
              <Badge variant="outline" className="text-xs">
                {todayActivities.length}
              </Badge>
            </div>
            <div className="space-y-1">
              {todayActivities.map((activity) => (
                <UpcomingActivityItem
                  key={activity.id}
                  activity={activity}
                  onClick={() => onActivityClick?.(activity)}
                  onStart={() => onStartActivity?.(activity)}
                  showAssignee={showAssignee}
                  soonThresholdHours={soonThresholdHours}
                />
              ))}
            </div>
          </div>
        )}

        {/* Due Tomorrow */}
        {tomorrowActivities.length > 0 && (
          <>
            {todayActivities.length > 0 && <Separator />}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  Due Tomorrow
                </span>
                <Badge variant="outline" className="text-xs">
                  {tomorrowActivities.length}
                </Badge>
              </div>
              <div className="space-y-1">
                {tomorrowActivities.map((activity) => (
                  <UpcomingActivityItem
                    key={activity.id}
                    activity={activity}
                    onClick={() => onActivityClick?.(activity)}
                    onStart={() => onStartActivity?.(activity)}
                    showAssignee={showAssignee}
                    soonThresholdHours={soonThresholdHours}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* View All Link */}
        {onViewAll && (
          <Button
            variant="outline"
            className="w-full"
            onClick={onViewAll}
          >
            View All Upcoming
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default UpcomingActivitiesWidget;
