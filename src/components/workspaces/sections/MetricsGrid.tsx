/**
 * MetricsGrid Component
 *
 * Grid of KPI/metric cards for displaying stats.
 */

'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

export interface MetricItem {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
  bgColor?: string;
  description?: string;
}

export interface MetricsGridProps {
  items: MetricItem[];
  columns?: 2 | 3 | 4;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// =====================================================
// METRIC CARD
// =====================================================

function MetricCard({ item, size }: { item: MetricItem; size: 'sm' | 'md' | 'lg' }) {
  const Icon = item.icon;
  const TrendIcon =
    item.trend === 'up' ? TrendingUp : item.trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    item.trend === 'up'
      ? 'text-green-600'
      : item.trend === 'down'
        ? 'text-red-600'
        : 'text-stone-400';

  const sizeClasses = {
    sm: {
      padding: 'p-3',
      title: 'text-[10px]',
      value: 'text-lg',
      icon: 'w-8 h-8',
      iconSize: 'w-4 h-4',
    },
    md: {
      padding: 'p-4',
      title: 'text-xs',
      value: 'text-2xl',
      icon: 'w-10 h-10',
      iconSize: 'w-5 h-5',
    },
    lg: {
      padding: 'p-5',
      title: 'text-sm',
      value: 'text-3xl',
      icon: 'w-12 h-12',
      iconSize: 'w-6 h-6',
    },
  };

  const s = sizeClasses[size];

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-stone-200 hover:border-stone-300 transition-colors',
        s.padding
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={cn(
              'font-medium text-stone-500 uppercase tracking-wider',
              s.title
            )}
          >
            {item.label}
          </p>
          <p className={cn('font-bold mt-1', s.value, item.color || 'text-charcoal')}>
            {item.value}
          </p>
          {item.description && (
            <p className="text-xs text-stone-400 mt-1">{item.description}</p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              'rounded-lg flex items-center justify-center',
              s.icon,
              item.bgColor || 'bg-stone-100'
            )}
          >
            <Icon className={cn('text-stone-600', s.iconSize)} />
          </div>
        )}
      </div>
      {item.trend && item.trendValue && (
        <div className={cn('flex items-center gap-1 mt-2 text-xs', trendColor)}>
          <TrendIcon className="w-3 h-3" />
          <span>{item.trendValue}</span>
        </div>
      )}
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function MetricsGrid({
  items,
  columns = 4,
  size = 'md',
  className,
}: MetricsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {items.map((item, idx) => (
        <MetricCard key={idx} item={item} size={size} />
      ))}
    </div>
  );
}

export default MetricsGrid;
