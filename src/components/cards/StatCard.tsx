'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import type { MetricCardProps, TrendDirection } from './types';
import { getTrendColor, formatPercentage } from './types';

interface StatCardProps extends MetricCardProps {
  showComparison?: boolean;
}

function TrendIcon({ trend, className }: { trend: TrendDirection; className?: string }) {
  switch (trend) {
    case 'up':
      return <TrendingUp className={cn('h-4 w-4', className)} />;
    case 'down':
      return <TrendingDown className={cn('h-4 w-4', className)} />;
    default:
      return <Minus className={cn('h-4 w-4', className)} />;
  }
}

function Sparkline({ data, className }: { data: number[]; className?: string }) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 24;
  const width = 60;
  const stepX = width / (data.length - 1);

  const points = data
    .map((value, index) => {
      const x = index * stepX;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      className={cn('flex-shrink-0', className)}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StatCard({
  label,
  value,
  previousValue,
  trend,
  target,
  status,
  icon: Icon,
  onClick,
  sparklineData,
  comparisonPeriod = 'week',
  showComparison = true,
  className,
}: StatCardProps) {
  const hasComparison = previousValue !== undefined && showComparison;
  const comparisonLabel = comparisonPeriod === 'day' ? 'vs yesterday' :
    comparisonPeriod === 'week' ? 'vs last week' :
    comparisonPeriod === 'month' ? 'vs last month' :
    comparisonPeriod === 'quarter' ? 'vs last quarter' : 'vs previous';

  // Calculate percentage change
  let percentageChange: number | undefined;
  if (hasComparison && typeof value === 'number' && typeof previousValue === 'number' && previousValue !== 0) {
    percentageChange = ((value - previousValue) / previousValue) * 100;
  }

  // Determine status color
  const statusColorClass = status === 'on_track' || status === 'excellent'
    ? 'border-l-green-500'
    : status === 'at_risk'
    ? 'border-l-yellow-500'
    : status === 'behind' || status === 'critical'
    ? 'border-l-red-500'
    : 'border-l-transparent';

  return (
    <Card
      className={cn(
        'relative transition-all duration-200 border-l-4',
        statusColorClass,
        onClick && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Label with optional icon */}
            <div className="flex items-center gap-2 mb-1">
              {Icon && (
                <Icon className="h-4 w-4 text-charcoal-500 flex-shrink-0" />
              )}
              <span className="text-sm font-medium text-charcoal-600 truncate">
                {label}
              </span>
            </div>

            {/* Value */}
            <div className="text-2xl font-bold text-charcoal-900">
              {value}
            </div>

            {/* Comparison / Trend */}
            {(hasComparison || trend) && (
              <div className="flex items-center gap-2 mt-1">
                {trend && (
                  <div className={cn('flex items-center gap-1', getTrendColor(trend))}>
                    <TrendIcon trend={trend} />
                    {percentageChange !== undefined && (
                      <span className="text-xs font-medium">
                        {formatPercentage(Math.abs(percentageChange), 1)}
                      </span>
                    )}
                  </div>
                )}
                {hasComparison && (
                  <span className="text-xs text-charcoal-500">
                    {comparisonLabel}
                  </span>
                )}
              </div>
            )}

            {/* Target indicator */}
            {target !== undefined && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-charcoal-500">Target: {target}</span>
                  {typeof value === 'number' && (
                    <span className={cn(
                      'font-medium',
                      value >= target ? 'text-green-600' : 'text-charcoal-500'
                    )}>
                      {formatPercentage((value / target) * 100)}
                    </span>
                  )}
                </div>
                <div className="h-1 bg-charcoal-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-300',
                      typeof value === 'number' && value >= target
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                    )}
                    style={{
                      width: `${Math.min(100, typeof value === 'number' ? (value / target) * 100 : 0)}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sparkline */}
          {sparklineData && sparklineData.length > 0 && (
            <Sparkline
              data={sparklineData}
              className={cn(
                'text-charcoal-300',
                trend === 'up' && 'text-green-400',
                trend === 'down' && 'text-red-400'
              )}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;
