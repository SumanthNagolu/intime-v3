'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { KPICardProps, TrendDirection, StatusLevel } from './types';
import { getTrendColor, getStatusColor, formatPercentage } from './types';

function TrendIndicator({ trend, percentage }: { trend: TrendDirection; percentage?: number }) {
  const Icon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const colorClass = getTrendColor(trend);

  return (
    <div className={cn('flex items-center gap-1', colorClass)}>
      <Icon className="h-3 w-3" />
      {percentage !== undefined && (
        <span className="text-xs font-medium">
          {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}
          {formatPercentage(Math.abs(percentage), 1)}
        </span>
      )}
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  status?: StatusLevel;
}

function CircularProgress({ value, max, size = 80, strokeWidth = 6, status }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(100, (value / max) * 100);
  const offset = circumference - (percentage / 100) * circumference;

  const statusColor = status === 'on_track' || status === 'excellent'
    ? 'stroke-green-500'
    : status === 'at_risk'
    ? 'stroke-yellow-500'
    : status === 'behind' || status === 'critical'
    ? 'stroke-red-500'
    : 'stroke-blue-500';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          className="stroke-charcoal-100"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className={cn('transition-all duration-500 ease-out', statusColor)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-charcoal-900">
          {formatPercentage(percentage)}
        </span>
      </div>
    </div>
  );
}

interface BarProgressProps {
  value: number;
  max: number;
  status?: StatusLevel;
  showGoalLine?: boolean;
}

function BarProgress({ value, max, status, showGoalLine = true }: BarProgressProps) {
  const percentage = Math.min(100, (value / max) * 100);

  const statusColor = status === 'on_track' || status === 'excellent'
    ? 'bg-green-500'
    : status === 'at_risk'
    ? 'bg-yellow-500'
    : status === 'behind' || status === 'critical'
    ? 'bg-red-500'
    : 'bg-blue-500';

  return (
    <div className="relative w-full">
      <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', statusColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showGoalLine && (
        <div
          className="absolute top-0 h-full w-0.5 bg-charcoal-400"
          style={{ left: '100%', transform: 'translateX(-50%)' }}
        />
      )}
    </div>
  );
}

function getTimePeriodLabel(period: KPICardProps['timePeriod']): string {
  switch (period) {
    case 'day': return 'Today';
    case 'week': return 'This Week';
    case 'month': return 'This Month';
    case 'quarter': return 'This Quarter';
    case 'year': return 'This Year';
    case 'mtd': return 'MTD';
    case 'qtd': return 'QTD';
    case 'ytd': return 'YTD';
    default: return '';
  }
}

export function KPICard({
  title,
  currentValue,
  targetValue,
  trend,
  trendPercentage,
  timePeriod = 'month',
  status = 'on_track',
  progressVariant = 'bar',
  icon: Icon,
  onClick,
  className,
}: KPICardProps) {
  const numericValue = typeof currentValue === 'number' ? currentValue : parseFloat(currentValue as string) || 0;
  const percentage = (numericValue / targetValue) * 100;

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-charcoal-500" />}
            <CardTitle className="text-sm font-medium text-charcoal-600">
              {title}
            </CardTitle>
          </div>
          {timePeriod && (
            <span className="text-xs text-charcoal-400 bg-charcoal-50 px-2 py-0.5 rounded">
              {getTimePeriodLabel(timePeriod)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className={cn(
          'flex gap-4',
          progressVariant === 'circular' ? 'items-center' : 'flex-col'
        )}>
          {/* Circular progress variant */}
          {progressVariant === 'circular' && (
            <CircularProgress
              value={numericValue}
              max={targetValue}
              status={status}
            />
          )}

          {/* Value section */}
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-charcoal-900">
                {currentValue}
              </span>
              <span className="text-sm text-charcoal-400">
                / {targetValue}
              </span>
            </div>

            {/* Trend indicator */}
            {trend && (
              <div className="mt-1">
                <TrendIndicator trend={trend} percentage={trendPercentage} />
              </div>
            )}

            {/* Bar progress variant */}
            {progressVariant === 'bar' && (
              <div className="mt-3">
                <BarProgress
                  value={numericValue}
                  max={targetValue}
                  status={status}
                />
              </div>
            )}

            {/* Status indicator */}
            <div className="flex items-center gap-2 mt-2">
              <Target className="h-3 w-3 text-charcoal-400" />
              <span className={cn('text-xs font-medium', getStatusColor(status))}>
                {status === 'on_track' && 'On Track'}
                {status === 'at_risk' && 'At Risk'}
                {status === 'behind' && 'Behind'}
                {status === 'critical' && 'Critical'}
                {status === 'excellent' && 'Excellent'}
              </span>
              <span className="text-xs text-charcoal-400">
                ({formatPercentage(percentage)} of goal)
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default KPICard;
