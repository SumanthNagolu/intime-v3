/**
 * Overdue Activities Widget
 *
 * Critical attention list for overdue activities.
 */

'use client';

import React from 'react';
import { formatDistanceToNow, differenceInHours, differenceInDays } from 'date-fns';
import {
  AlertTriangle, ArrowRight, Clock, CheckCircle, Flame,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getPattern, getCategoryColor } from '@/lib/activities/patterns';
import type { ActivityStatus } from '@/lib/activities/transitions';
import type { Priority } from '@/lib/activities/sla';

// ==========================================
// TYPES
// ==========================================

interface OverdueActivity {
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
  entity?: {
    type: string;
    id: string;
    name: string;
  };
}

export interface OverdueActivitiesWidgetProps {
  /** Overdue activities */
  activities: OverdueActivity[];

  /** Total overdue count (may be more than displayed) */
  totalCount?: number;

  /** Maximum activities to show */
  maxItems?: number;

  /** Loading state */
  isLoading?: boolean;

  /** Activity click handler */
  onActivityClick?: (activity: OverdueActivity) => void;

  /** View all handler */
  onViewAll?: () => void;

  /** Show assignee */
  showAssignee?: boolean;

  /** Additional className */
  className?: string;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getOverdueSeverity(dueAt: string): 'critical' | 'severe' | 'moderate' {
  const now = new Date();
  const due = new Date(dueAt);
  const hoursDiff = differenceInHours(now, due);

  if (hoursDiff >= 48) return 'critical';
  if (hoursDiff >= 24) return 'severe';
  return 'moderate';
}

function getSeverityColor(severity: 'critical' | 'severe' | 'moderate'): string {
  switch (severity) {
    case 'critical': return 'bg-red-100 text-red-700 border-red-200';
    case 'severe': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'moderate': return 'bg-amber-100 text-amber-700 border-amber-200';
  }
}

// ==========================================
// HELPER COMPONENTS
// ==========================================

function OverdueActivityItem({
  activity,
  onClick,
  showAssignee,
}: {
  activity: OverdueActivity;
  onClick?: () => void;
  showAssignee?: boolean;
}) {
  const pattern = getPattern(activity.patternId);
  const PatternIcon = pattern?.icon || CheckCircle;
  const severity = getOverdueSeverity(activity.dueAt);
  const severityColor = getSeverityColor(severity);

  const dueDate = new Date(activity.dueAt);
  const overdueDays = differenceInDays(new Date(), dueDate);

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 w-full p-3 rounded-lg text-left',
        'border transition-colors hover:bg-muted/50',
        severityColor
      )}
    >
      {/* Severity/Pattern Icon */}
      <div className={cn(
        'p-1.5 rounded flex-shrink-0',
        severity === 'critical' ? 'bg-red-200' : 'bg-transparent'
      )}>
        {severity === 'critical' ? (
          <Flame className="h-4 w-4 text-red-600" />
        ) : (
          <PatternIcon className="h-4 w-4" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{activity.subject}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {overdueDays > 0
              ? `${overdueDays}d overdue`
              : formatDistanceToNow(dueDate, { addSuffix: true })
            }
          </span>
          {activity.entity && (
            <span className="text-xs truncate max-w-[100px]">
              {activity.entity.name}
            </span>
          )}
        </div>
      </div>

      {/* Assignee */}
      {showAssignee && activity.assignee && (
        <Avatar className="h-6 w-6 flex-shrink-0">
          <AvatarImage src={activity.assignee.avatarUrl} />
          <AvatarFallback className="text-[10px]">
            {activity.assignee.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      )}
    </button>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function OverdueActivitiesWidget({
  activities,
  totalCount,
  maxItems = 5,
  isLoading = false,
  onActivityClick,
  onViewAll,
  showAssignee = true,
  className,
}: OverdueActivitiesWidgetProps) {
  const displayedActivities = activities.slice(0, maxItems);
  const total = totalCount ?? activities.length;
  const hasMore = total > maxItems;

  // Sort by how overdue (most overdue first)
  const sortedActivities = [...displayedActivities].sort((a, b) => {
    return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
  });

  if (isLoading) {
    return (
      <Card className={cn('border-red-200', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-4 w-4" />
            Overdue Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className={cn('border-green-200 bg-green-50/50', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            All Caught Up!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-600">
            No overdue activities. Great work keeping on top of things!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-red-200', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-4 w-4" />
            Overdue Activities
          </CardTitle>
          <Badge variant="destructive">{total}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Activities List */}
        <div className="space-y-2">
          {sortedActivities.map((activity) => (
            <OverdueActivityItem
              key={activity.id}
              activity={activity}
              onClick={() => onActivityClick?.(activity)}
              showAssignee={showAssignee}
            />
          ))}
        </div>

        {/* View All Link */}
        {hasMore && onViewAll && (
          <Button
            variant="ghost"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onViewAll}
          >
            View All {total} Overdue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default OverdueActivitiesWidget;
