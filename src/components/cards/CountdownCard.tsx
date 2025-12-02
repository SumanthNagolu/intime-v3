'use client';

import * as React from 'react';
import { Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import type { CountdownCardProps } from './types';
import { formatDaysRemaining } from './types';

const DEFAULT_URGENCY_THRESHOLDS = {
  warning: 30,
  critical: 14,
  danger: 7,
};

type UrgencyLevel = 'safe' | 'warning' | 'critical' | 'danger' | 'overdue';

function getUrgencyLevel(
  daysRemaining: number,
  isOverdue: boolean,
  thresholds = DEFAULT_URGENCY_THRESHOLDS
): UrgencyLevel {
  if (isOverdue) return 'overdue';
  if (daysRemaining <= thresholds.danger) return 'danger';
  if (daysRemaining <= thresholds.critical) return 'critical';
  if (daysRemaining <= thresholds.warning) return 'warning';
  return 'safe';
}

function getUrgencyStyles(level: UrgencyLevel) {
  switch (level) {
    case 'overdue':
      return {
        card: 'border-red-200 bg-red-50',
        text: 'text-red-700',
        badge: 'bg-red-100 text-red-800 border-red-200',
        icon: 'text-red-500',
      };
    case 'danger':
      return {
        card: 'border-red-200 bg-red-50',
        text: 'text-red-700',
        badge: 'bg-red-100 text-red-800 border-red-200',
        icon: 'text-red-500',
      };
    case 'critical':
      return {
        card: 'border-orange-200 bg-orange-50',
        text: 'text-orange-700',
        badge: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: 'text-orange-500',
      };
    case 'warning':
      return {
        card: 'border-yellow-200 bg-yellow-50',
        text: 'text-yellow-700',
        badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: 'text-yellow-500',
      };
    default:
      return {
        card: 'border-charcoal-100 bg-white',
        text: 'text-charcoal-700',
        badge: 'bg-charcoal-100 text-charcoal-700 border-charcoal-200',
        icon: 'text-charcoal-500',
      };
  }
}

export function CountdownCard({
  label,
  targetDate,
  entityType,
  entityLink,
  urgencyThresholds = DEFAULT_URGENCY_THRESHOLDS,
  onClick,
  className,
}: CountdownCardProps) {
  const { days, hours, isOverdue } = formatDaysRemaining(targetDate);
  const urgencyLevel = getUrgencyLevel(days, isOverdue, urgencyThresholds);
  const styles = getUrgencyStyles(urgencyLevel);

  const formattedDate = typeof targetDate === 'string'
    ? new Date(targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        styles.card,
        onClick && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Icon and Label */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={cn('p-2 rounded-lg', urgencyLevel === 'safe' ? 'bg-charcoal-100' : styles.badge)}>
              {urgencyLevel === 'overdue' || urgencyLevel === 'danger' ? (
                <AlertTriangle className={cn('h-5 w-5', styles.icon)} />
              ) : (
                <Clock className={cn('h-5 w-5', styles.icon)} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-charcoal-900 truncate">
                {label}
              </p>
              {entityType && (
                <p className="text-xs text-charcoal-500 mt-0.5">
                  {entityType}
                </p>
              )}
            </div>
          </div>

          {/* Entity Link */}
          {entityLink && (
            <a
              href={entityLink}
              onClick={(e) => e.stopPropagation()}
              className="text-charcoal-400 hover:text-charcoal-600 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        {/* Countdown Display */}
        <div className="mt-3">
          <div className={cn('text-3xl font-bold', styles.text)}>
            {isOverdue ? (
              <span>{days}d {hours}h overdue</span>
            ) : days > 0 ? (
              <span>{days}d {hours}h</span>
            ) : (
              <span>{hours}h remaining</span>
            )}
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-charcoal-500">
              {isOverdue ? 'Was due' : 'Due'}: {formattedDate}
            </span>
            {urgencyLevel !== 'safe' && (
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full border',
                styles.badge
              )}>
                {urgencyLevel === 'overdue' && 'Overdue'}
                {urgencyLevel === 'danger' && 'Urgent'}
                {urgencyLevel === 'critical' && 'Critical'}
                {urgencyLevel === 'warning' && 'Warning'}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CountdownCard;
