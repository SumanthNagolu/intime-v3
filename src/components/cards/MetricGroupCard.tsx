'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MetricGroupCardProps, MetricCardProps, TrendDirection } from './types';
import { getTrendColor, formatPercentage } from './types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function TrendIcon({ trend }: { trend: TrendDirection }) {
  switch (trend) {
    case 'up': return <TrendingUp className="h-3 w-3" />;
    case 'down': return <TrendingDown className="h-3 w-3" />;
    default: return <Minus className="h-3 w-3" />;
  }
}

function PrimaryMetric({ metric }: { metric: MetricCardProps }) {
  const Icon = metric.icon;

  return (
    <div className="flex items-center gap-4 pb-4 border-b border-charcoal-100">
      {Icon && (
        <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-charcoal-500 truncate">
          {metric.label}
        </p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-3xl font-bold text-charcoal-900">
            {metric.value}
          </span>
          {metric.trend && (
            <div className={cn('flex items-center gap-1', getTrendColor(metric.trend))}>
              <TrendIcon trend={metric.trend} />
              {metric.previousValue !== undefined && typeof metric.value === 'number' && typeof metric.previousValue === 'number' && (
                <span className="text-sm font-medium">
                  {formatPercentage(Math.abs(((metric.value - metric.previousValue) / metric.previousValue) * 100), 1)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SecondaryMetric({ metric }: { metric: MetricCardProps }) {
  const Icon = metric.icon;

  return (
    <div className="flex items-center gap-2">
      {Icon && (
        <Icon className="h-4 w-4 text-charcoal-400 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-charcoal-500 truncate">{metric.label}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-sm font-semibold text-charcoal-900">
            {metric.value}
          </span>
          {metric.trend && (
            <div className={cn('flex items-center', getTrendColor(metric.trend))}>
              <TrendIcon trend={metric.trend} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function MetricGroupCard({
  title,
  primaryMetric,
  secondaryMetrics,
  columns = 2,
  className,
}: MetricGroupCardProps) {
  const gridCols = columns === 2 ? 'grid-cols-2' : columns === 3 ? 'grid-cols-3' : 'grid-cols-4';

  return (
    <Card className={cn('transition-all duration-200', className)}>
      {title && (
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-medium text-charcoal-600">
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn(title ? 'pt-4' : 'pt-6')}>
        {/* Primary Metric */}
        <PrimaryMetric metric={primaryMetric} />

        {/* Secondary Metrics Grid */}
        {secondaryMetrics.length > 0 && (
          <div className={cn('grid gap-4 mt-4', gridCols)}>
            {secondaryMetrics.map((metric, index) => (
              <SecondaryMetric key={metric.label || index} metric={metric} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MetricGroupCard;
