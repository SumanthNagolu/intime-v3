'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MarginDistribution, TrendDirection } from '../types';
import { formatPercentage, getTrendColor } from '../types';

interface MarginCardProps {
  averageMargin: number;
  trend?: TrendDirection;
  trendPercentage?: number;
  distribution?: MarginDistribution;
  targetMargin?: number;
  className?: string;
}

export function MarginCard({
  averageMargin,
  trend,
  trendPercentage,
  distribution,
  targetMargin,
  className,
}: MarginCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  const getMarginColor = (margin: number): string => {
    if (margin >= 25) return 'text-green-600';
    if (margin >= 20) return 'text-yellow-600';
    if (margin >= 15) return 'text-orange-600';
    return 'text-red-600';
  };

  // Calculate distribution percentages
  const totalInDistribution = distribution
    ? distribution.low + distribution.mid + distribution.high
    : 0;
  const distributionPercents = distribution
    ? {
        low: (distribution.low / totalInDistribution) * 100,
        mid: (distribution.mid / totalInDistribution) * 100,
        high: (distribution.high / totalInDistribution) * 100,
      }
    : null;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Margin</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Average Margin */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className={cn('text-3xl font-bold', getMarginColor(averageMargin))}>
            {formatPercentage(averageMargin, 1)}
          </span>
          <span className="text-sm text-charcoal-500">average</span>
        </div>

        {/* Target indicator */}
        {targetMargin !== undefined && (
          <div className="flex items-center gap-2 mb-4">
            <Percent className="h-4 w-4 text-charcoal-400" />
            <span className="text-sm text-charcoal-500">
              Target: {formatPercentage(targetMargin)}
            </span>
            {averageMargin >= targetMargin ? (
              <span className="text-xs text-green-600 font-medium">On Target</span>
            ) : (
              <span className="text-xs text-red-600 font-medium">Below Target</span>
            )}
          </div>
        )}

        {/* Trend */}
        {trend && (
          <div className={cn('flex items-center gap-2 mb-4', getTrendColor(trend))}>
            {TrendIcon && <TrendIcon className="h-4 w-4" />}
            {trendPercentage !== undefined && (
              <span className="text-sm font-medium">
                {trend === 'up' ? '+' : '-'}
                {formatPercentage(Math.abs(trendPercentage), 1)} vs last period
              </span>
            )}
          </div>
        )}

        {/* Distribution */}
        {distribution && distributionPercents && (
          <div className="pt-4 border-t border-charcoal-100">
            <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-3">
              Distribution
            </p>

            {/* Distribution bar */}
            <div className="h-4 flex rounded-full overflow-hidden mb-3">
              <div
                className="bg-red-400"
                style={{ width: `${distributionPercents.low}%` }}
                title={`Low margin: ${distribution.low}`}
              />
              <div
                className="bg-yellow-400"
                style={{ width: `${distributionPercents.mid}%` }}
                title={`Mid margin: ${distribution.mid}`}
              />
              <div
                className="bg-green-400"
                style={{ width: `${distributionPercents.high}%` }}
                title={`High margin: ${distribution.high}`}
              />
            </div>

            {/* Distribution legend */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-red-400" />
                <span className="text-charcoal-500">Low (&lt;20%)</span>
                <span className="font-medium text-charcoal-700">{distribution.low}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-yellow-400" />
                <span className="text-charcoal-500">Mid (20-25%)</span>
                <span className="font-medium text-charcoal-700">{distribution.mid}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <span className="text-charcoal-500">High (&gt;25%)</span>
                <span className="font-medium text-charcoal-700">{distribution.high}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MarginCard;
