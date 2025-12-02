/**
 * Activity SLA Indicator
 *
 * Shows SLA status with countdown, color coding, and optional details.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  calculateSLAStatus,
  getTimeRemaining,
  getSLAColors,
  getSLALabel,
  getAtRiskThreshold,
  type SLAStatus,
  type Priority,
  type TimeRemaining,
} from '@/lib/activities/sla';
import { format, formatDistanceToNow } from 'date-fns';

export interface ActivitySLAProps {
  /** Due date */
  dueAt: string | Date;

  /** Priority level */
  priority?: Priority;

  /** Variant display mode */
  variant?: 'badge' | 'card' | 'inline' | 'countdown';

  /** Show full details on hover */
  showTooltip?: boolean;

  /** Live countdown update interval (ms) */
  updateInterval?: number;

  /** Override reason (for breached SLAs) */
  overrideReason?: string;

  /** Override handler */
  onOverride?: () => void;

  /** Additional className */
  className?: string;
}

function getStatusIcon(status: SLAStatus) {
  switch (status) {
    case 'on_track':
      return CheckCircle;
    case 'at_risk':
      return AlertTriangle;
    case 'breached':
      return AlertCircle;
  }
}

export function ActivitySLA({
  dueAt,
  priority = 'normal',
  variant = 'badge',
  showTooltip = true,
  updateInterval = 60000, // 1 minute
  overrideReason,
  onOverride,
  className,
}: ActivitySLAProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    getTimeRemaining(dueAt)
  );

  // Update countdown periodically
  useEffect(() => {
    if (variant === 'countdown' || updateInterval > 0) {
      const interval = setInterval(() => {
        setTimeRemaining(getTimeRemaining(dueAt));
      }, updateInterval);

      return () => clearInterval(interval);
    }
  }, [dueAt, variant, updateInterval]);

  const slaStatus = calculateSLAStatus(dueAt, priority);
  const colors = getSLAColors(slaStatus);
  const StatusIcon = getStatusIcon(slaStatus);
  const dueDate = typeof dueAt === 'string' ? new Date(dueAt) : dueAt;

  // Calculate progress (for card variant)
  const atRiskThreshold = getAtRiskThreshold(priority);
  const progressPercent = timeRemaining.isOverdue
    ? 100
    : Math.max(0, Math.min(100, 100 - (timeRemaining.totalMinutes / atRiskThreshold) * 50));

  const tooltipContent = (
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2">
        <span className={cn('h-2 w-2 rounded-full', colors.dot)} />
        <span className="font-medium">{getSLALabel(slaStatus)}</span>
      </div>
      <div className="text-muted-foreground">
        <p>Due: {format(dueDate, 'PPpp')}</p>
        <p>{timeRemaining.text}</p>
        {slaStatus === 'at_risk' && (
          <p className="text-amber-600 mt-1">
            Will breach in {formatDistanceToNow(dueDate)}
          </p>
        )}
      </div>
      {overrideReason && (
        <div className="pt-2 border-t text-xs">
          <p className="text-muted-foreground">Override reason:</p>
          <p>{overrideReason}</p>
        </div>
      )}
    </div>
  );

  // Badge variant
  if (variant === 'badge') {
    const badge = (
      <Badge
        variant="outline"
        className={cn(
          'text-xs gap-1',
          colors.bg,
          colors.text,
          colors.border,
          className
        )}
      >
        <StatusIcon className="h-3 w-3" />
        {timeRemaining.isOverdue ? 'Overdue' : timeRemaining.text.replace(' remaining', '')}
      </Badge>
    );

    if (!showTooltip) return badge;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent>{tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Inline variant
  if (variant === 'inline') {
    const content = (
      <span className={cn('flex items-center gap-1.5 text-sm', colors.text, className)}>
        <span className={cn('h-2 w-2 rounded-full', colors.dot)} />
        <span>{timeRemaining.text}</span>
      </span>
    );

    if (!showTooltip) return content;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent>{tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Countdown variant
  if (variant === 'countdown') {
    return (
      <div className={cn('text-center', className)}>
        <div className={cn('text-3xl font-bold tabular-nums', colors.text)}>
          {timeRemaining.isOverdue ? '-' : ''}
          {timeRemaining.days > 0 && `${timeRemaining.days}d `}
          {timeRemaining.hours > 0 && `${String(timeRemaining.hours).padStart(2, '0')}:`}
          {String(timeRemaining.minutes).padStart(2, '0')}
          {timeRemaining.days === 0 && timeRemaining.hours === 0 && 'm'}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {timeRemaining.isOverdue ? 'overdue' : 'remaining'}
        </p>
      </div>
    );
  }

  // Card variant
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className={cn('h-1', colors.bg)} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <StatusIcon className={cn('h-5 w-5', colors.text)} />
              <span className={cn('font-semibold', colors.text)}>
                {getSLALabel(slaStatus)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {timeRemaining.text}
            </p>
          </div>
          {onOverride && slaStatus === 'breached' && !overrideReason && (
            <button
              onClick={onOverride}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Override
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <Progress
            value={progressPercent}
            className={cn(
              'h-2',
              slaStatus === 'on_track' && '[&>div]:bg-green-500',
              slaStatus === 'at_risk' && '[&>div]:bg-yellow-500',
              slaStatus === 'breached' && '[&>div]:bg-red-500'
            )}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Target: {format(dueDate, 'MMM d, h:mm a')}</span>
            <span className="capitalize">{priority} priority</span>
          </div>
        </div>

        {/* Override reason if present */}
        {overrideReason && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">SLA Override:</p>
            <p className="text-sm">{overrideReason}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ActivitySLA;
