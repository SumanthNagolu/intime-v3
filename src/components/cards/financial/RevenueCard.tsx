'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RevenueBreakdown, TimePeriod, TrendDirection } from '../types';
import { formatCurrency, formatPercentage, getTrendColor } from '../types';

interface RevenueCardProps {
  totalRevenue: number;
  trend?: TrendDirection;
  trendPercentage?: number;
  previousRevenue?: number;
  breakdown?: RevenueBreakdown[];
  defaultPeriod?: TimePeriod;
  onPeriodChange?: (period: TimePeriod) => void;
  className?: string;
}

const PERIOD_LABELS: Record<TimePeriod, string> = {
  day: 'Today',
  week: 'This Week',
  month: 'This Month',
  quarter: 'This Quarter',
  year: 'This Year',
  mtd: 'MTD',
  qtd: 'QTD',
  ytd: 'YTD',
};

export function RevenueCard({
  totalRevenue,
  trend,
  trendPercentage,
  previousRevenue,
  breakdown = [],
  defaultPeriod = 'month',
  onPeriodChange,
  className,
}: RevenueCardProps) {
  const [period, setPeriod] = React.useState<TimePeriod>(defaultPeriod);

  const handlePeriodChange = (value: string) => {
    const newPeriod = value as TimePeriod;
    setPeriod(newPeriod);
    if (onPeriodChange) {
      onPeriodChange(newPeriod);
    }
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">Revenue</CardTitle>
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(['mtd', 'qtd', 'ytd', 'month', 'quarter', 'year'] as TimePeriod[]).map((p) => (
              <SelectItem key={p} value={p}>
                {PERIOD_LABELS[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {/* Total Revenue */}
        <div className="flex items-baseline gap-2 mb-4">
          <DollarSign className="h-6 w-6 text-charcoal-400" />
          <span className="text-3xl font-bold text-charcoal-900">
            {formatCurrency(totalRevenue)}
          </span>
        </div>

        {/* Trend */}
        {trend && (
          <div className={cn('flex items-center gap-2 mb-4', getTrendColor(trend))}>
            {TrendIcon && <TrendIcon className="h-4 w-4" />}
            {trendPercentage !== undefined && (
              <span className="text-sm font-medium">
                {trend === 'up' ? '+' : '-'}
                {formatPercentage(Math.abs(trendPercentage), 1)}
              </span>
            )}
            {previousRevenue !== undefined && (
              <span className="text-xs text-charcoal-500">
                vs {formatCurrency(previousRevenue)} previous
              </span>
            )}
          </div>
        )}

        {/* Breakdown */}
        {breakdown.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-charcoal-100">
            <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-2">
              Breakdown
            </p>
            {breakdown.map((item) => (
              <div key={item.type} className="flex items-center justify-between">
                <span className="text-sm text-charcoal-600">{item.type}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-charcoal-900">
                    {formatCurrency(item.value)}
                  </span>
                  {item.percentage !== undefined && (
                    <span className="text-xs text-charcoal-400">
                      ({formatPercentage(item.percentage)})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RevenueCard;
