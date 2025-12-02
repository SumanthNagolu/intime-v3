/**
 * My Activities Widget
 *
 * Personal queue summary for dashboard display.
 */

'use client';

import React from 'react';
import { format } from 'date-fns';
import {
  CheckCircle, Clock, AlertTriangle, ArrowRight, TrendingUp,
  Calendar, Activity,
} from 'lucide-react';
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

interface ActivitySummary {
  id: string;
  subject: string;
  patternId: string;
  status: ActivityStatus;
  priority: Priority;
  dueAt?: string;
  completedAt?: string;
}

export interface MyActivitiesWidgetProps {
  /** Pending activities */
  pendingActivities: ActivitySummary[];

  /** In-progress activities */
  inProgressActivities: ActivitySummary[];

  /** Overdue activities count */
  overdueCount: number;

  /** Due today count */
  dueTodayCount: number;

  /** Due tomorrow count */
  dueTomorrowCount: number;

  /** Recent completions (optional) */
  recentCompletions?: ActivitySummary[];

  /** Loading state */
  isLoading?: boolean;

  /** View queue handler */
  onViewQueue?: () => void;

  /** Activity click handler */
  onActivityClick?: (activity: ActivitySummary) => void;

  /** Additional className */
  className?: string;
}

// ==========================================
// HELPER COMPONENTS
// ==========================================

function StatItem({
  icon: Icon,
  label,
  value,
  variant = 'default',
}: {
  icon: typeof Clock;
  label: string;
  value: number;
  variant?: 'default' | 'warning' | 'danger';
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className={cn(
          'h-4 w-4',
          variant === 'warning' && 'text-amber-500',
          variant === 'danger' && 'text-red-500'
        )} />
        {label}
      </div>
      <Badge
        variant={variant === 'danger' ? 'destructive' : variant === 'warning' ? 'outline' : 'secondary'}
        className={cn(variant === 'warning' && 'border-amber-500 text-amber-600')}
      >
        {value}
      </Badge>
    </div>
  );
}

function CompletionItem({
  activity,
  onClick,
}: {
  activity: ActivitySummary;
  onClick?: () => void;
}) {
  const pattern = getPattern(activity.patternId);
  const PatternIcon = pattern?.icon || CheckCircle;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full p-2 rounded hover:bg-muted/50 text-left"
    >
      <div className={cn(
        'p-1 rounded',
        pattern ? getCategoryColor(pattern.category) : 'bg-gray-100'
      )}>
        <PatternIcon className="h-3 w-3" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs truncate">{activity.subject}</p>
        {activity.completedAt && (
          <p className="text-[10px] text-muted-foreground">
            {format(new Date(activity.completedAt), 'MMM d, h:mm a')}
          </p>
        )}
      </div>
      <CheckCircle className="h-3 w-3 text-green-500" />
    </button>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function MyActivitiesWidget({
  pendingActivities,
  inProgressActivities,
  overdueCount,
  dueTodayCount,
  dueTomorrowCount,
  recentCompletions,
  isLoading = false,
  onViewQueue,
  onActivityClick,
  className,
}: MyActivitiesWidgetProps) {
  const totalActive = pendingActivities.length + inProgressActivities.length;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            My Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-2/3" />
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
            <Activity className="h-4 w-4" />
            My Activities
          </CardTitle>
          <Badge variant="secondary" className="text-lg px-3">
            {totalActive}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="space-y-1">
          <StatItem
            icon={Clock}
            label="In Progress"
            value={inProgressActivities.length}
          />
          <StatItem
            icon={Calendar}
            label="Pending"
            value={pendingActivities.length}
          />
          {overdueCount > 0 && (
            <StatItem
              icon={AlertTriangle}
              label="Overdue"
              value={overdueCount}
              variant="danger"
            />
          )}
          {dueTodayCount > 0 && (
            <StatItem
              icon={Clock}
              label="Due Today"
              value={dueTodayCount}
              variant="warning"
            />
          )}
          {dueTomorrowCount > 0 && (
            <StatItem
              icon={Calendar}
              label="Due Tomorrow"
              value={dueTomorrowCount}
            />
          )}
        </div>

        {/* Recent Completions */}
        {recentCompletions && recentCompletions.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Recent Completions
              </p>
              <div className="space-y-1">
                {recentCompletions.slice(0, 3).map((activity) => (
                  <CompletionItem
                    key={activity.id}
                    activity={activity}
                    onClick={() => onActivityClick?.(activity)}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* View Queue Button */}
        {onViewQueue && (
          <Button
            variant="outline"
            className="w-full"
            onClick={onViewQueue}
          >
            View My Queue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default MyActivitiesWidget;
