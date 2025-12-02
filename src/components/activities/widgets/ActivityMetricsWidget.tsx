/**
 * Activity Metrics Widget
 *
 * Performance metrics display for dashboard.
 */

'use client';

import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle,
  BarChart3, Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ==========================================
// TYPES
// ==========================================

type Period = 'day' | 'week' | 'month';

interface MetricData {
  value: number;
  previousValue: number;
  label: string;
  format?: 'number' | 'percentage' | 'duration';
}

export interface ActivityMetricsWidgetProps {
  /** Completed activities count by period */
  completedByPeriod: Record<Period, number>;
  previousCompletedByPeriod: Record<Period, number>;

  /** Average completion time (hours) by period */
  avgCompletionTimeByPeriod: Record<Period, number>;
  previousAvgCompletionTimeByPeriod: Record<Period, number>;

  /** SLA compliance rate (0-100) by period */
  slaComplianceByPeriod: Record<Period, number>;
  previousSlaComplianceByPeriod: Record<Period, number>;

  /** On-time completion rate (0-100) by period */
  onTimeRateByPeriod: Record<Period, number>;
  previousOnTimeRateByPeriod: Record<Period, number>;

  /** Loading state */
  isLoading?: boolean;

  /** Additional className */
  className?: string;
}

// ==========================================
// HELPER COMPONENTS
// ==========================================

function formatValue(value: number, format: MetricData['format'] = 'number'): string {
  switch (format) {
    case 'percentage':
      return `${Math.round(value)}%`;
    case 'duration':
      if (value < 1) return `${Math.round(value * 60)}m`;
      return `${value.toFixed(1)}h`;
    default:
      return value.toLocaleString();
  }
}

function calculateChange(current: number, previous: number): { change: number; trend: 'up' | 'down' | 'flat' } {
  if (previous === 0) return { change: 0, trend: 'flat' };
  const change = ((current - previous) / previous) * 100;
  if (Math.abs(change) < 1) return { change: 0, trend: 'flat' };
  return {
    change: Math.abs(Math.round(change)),
    trend: change > 0 ? 'up' : 'down',
  };
}

function MetricCard({
  icon: Icon,
  label,
  value,
  previousValue,
  format = 'number',
  positiveDirection = 'up',
}: {
  icon: typeof Clock;
  label: string;
  value: number;
  previousValue: number;
  format?: MetricData['format'];
  positiveDirection?: 'up' | 'down';
}) {
  const { change, trend } = calculateChange(value, previousValue);
  const isPositive = trend === positiveDirection || trend === 'flat';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-semibold">
          {formatValue(value, format)}
        </span>
        {change > 0 ? (
          <span className={cn(
            'flex items-center gap-0.5 text-xs',
            isPositive ? 'text-green-600' : 'text-red-600'
          )}>
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {change}%
          </span>
        ) : (
          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
            <Minus className="h-3 w-3" />
            0%
          </span>
        )}
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function ActivityMetricsWidget({
  completedByPeriod,
  previousCompletedByPeriod,
  avgCompletionTimeByPeriod,
  previousAvgCompletionTimeByPeriod,
  slaComplianceByPeriod,
  previousSlaComplianceByPeriod,
  onTimeRateByPeriod,
  previousOnTimeRateByPeriod,
  isLoading = false,
  className,
}: ActivityMetricsWidgetProps) {
  const [period, setPeriod] = useState<Period>('week');

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Activity Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 animate-pulse">
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
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
            <BarChart3 className="h-4 w-4" />
            Activity Metrics
          </CardTitle>

          {/* Period Toggle */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {(['day', 'week', 'month'] as Period[]).map((p) => (
              <Button
                key={p}
                variant={period === p ? 'secondary' : 'ghost'}
                size="sm"
                className="h-6 px-2 text-xs capitalize"
                onClick={() => setPeriod(p)}
              >
                {p}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            icon={CheckCircle}
            label="Completed"
            value={completedByPeriod[period]}
            previousValue={previousCompletedByPeriod[period]}
            format="number"
            positiveDirection="up"
          />

          <MetricCard
            icon={Clock}
            label="Avg. Completion Time"
            value={avgCompletionTimeByPeriod[period]}
            previousValue={previousAvgCompletionTimeByPeriod[period]}
            format="duration"
            positiveDirection="down"
          />

          <MetricCard
            icon={AlertTriangle}
            label="SLA Compliance"
            value={slaComplianceByPeriod[period]}
            previousValue={previousSlaComplianceByPeriod[period]}
            format="percentage"
            positiveDirection="up"
          />

          <MetricCard
            icon={TrendingUp}
            label="On-Time Rate"
            value={onTimeRateByPeriod[period]}
            previousValue={previousOnTimeRateByPeriod[period]}
            format="percentage"
            positiveDirection="up"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default ActivityMetricsWidget;
