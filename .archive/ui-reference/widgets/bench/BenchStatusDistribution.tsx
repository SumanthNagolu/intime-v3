'use client';

/**
 * Bench Status Distribution Widget
 *
 * Shows consultants grouped by bench status (green, yellow, orange, red, black).
 */

import React from 'react';
import { Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface StatusCategory {
  id: string;
  label: string;
  color: string;
  description: string;
  count?: number;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  green: { bg: 'bg-green-50', text: 'text-green-700', bar: 'bg-green-500' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', bar: 'bg-yellow-500' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', bar: 'bg-orange-500' },
  red: { bg: 'bg-red-50', text: 'text-red-700', bar: 'bg-red-500' },
  gray: { bg: 'bg-stone-100', text: 'text-stone-700', bar: 'bg-stone-500' },
};

export function BenchStatusDistribution({ definition, data, context }: SectionWidgetProps) {
  const isLoading = context?.isLoading;
  const componentProps = definition.componentProps as {
    categories?: StatusCategory[];
    showChart?: boolean;
    chartType?: 'donut' | 'bar';
  } | undefined;
  const categories = componentProps?.categories || [];

  // Get status distribution from data
  const statusDistribution = (data as Record<string, unknown>)?.statusDistribution as Record<string, number> | undefined;
  const total = statusDistribution
    ? Object.values(statusDistribution).reduce((sum, count) => sum + count, 0)
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span>Bench Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-stone-200 animate-pulse" />
                <div className="flex-1 h-4 bg-stone-200 rounded animate-pulse" />
                <div className="w-8 h-4 bg-stone-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          <span>
            {typeof definition.title === 'string' ? definition.title : 'Bench Status Distribution'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {categories.map((category) => {
            const count = statusDistribution?.[category.id] ?? 0;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            const colors = STATUS_COLORS[category.color] || STATUS_COLORS.gray;

            return (
              <div key={category.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-3 h-3 rounded-full', colors.bar)} />
                    <span className="text-sm font-medium">{category.label}</span>
                  </div>
                  <span className={cn('text-sm font-semibold', colors.text)}>
                    {count}
                  </span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', colors.bar)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-stone-500">{category.description}</p>
              </div>
            );
          })}
          {categories.length === 0 && (
            <p className="text-sm text-stone-400 text-center py-4">
              No status data available
            </p>
          )}
        </div>
        {total > 0 && (
          <div className="mt-4 pt-4 border-t text-center">
            <span className="text-sm text-stone-500">Total on Bench: </span>
            <span className="text-lg font-semibold">{total}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BenchStatusDistribution;
