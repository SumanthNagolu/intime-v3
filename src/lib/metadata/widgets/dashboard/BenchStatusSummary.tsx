'use client';

/**
 * Bench Status Summary Widget
 *
 * Interactive status filter bar for bench consultant lists.
 * Shows clickable badges with counts for each bench status category.
 * Used on consultant list pages to filter by days-on-bench status.
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface StatusBadge {
  id: string;
  label: string;
  filter: Record<string, unknown>;
  color?: string;
}

interface StatusDistribution {
  green: number;
  yellow: number;
  orange: number;
  red: number;
  black: number;
}

interface BenchStatusSummaryData {
  totalConsultants?: number;
  statusDistribution?: StatusDistribution;
}

const STATUS_STYLES: Record<string, { bg: string; bgActive: string; text: string; border: string }> = {
  all: {
    bg: 'bg-stone-100',
    bgActive: 'bg-rust',
    text: 'text-stone-700',
    border: 'border-stone-300',
  },
  green: {
    bg: 'bg-green-50',
    bgActive: 'bg-green-600',
    text: 'text-green-700',
    border: 'border-green-300',
  },
  yellow: {
    bg: 'bg-yellow-50',
    bgActive: 'bg-yellow-500',
    text: 'text-yellow-700',
    border: 'border-yellow-300',
  },
  orange: {
    bg: 'bg-orange-50',
    bgActive: 'bg-orange-600',
    text: 'text-orange-700',
    border: 'border-orange-300',
  },
  red: {
    bg: 'bg-red-50',
    bgActive: 'bg-red-600',
    text: 'text-red-700',
    border: 'border-red-300',
  },
  gray: {
    bg: 'bg-stone-100',
    bgActive: 'bg-stone-700',
    text: 'text-stone-700',
    border: 'border-stone-400',
  },
};

export function BenchStatusSummary({ definition, data, context }: SectionWidgetProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const isLoading = context?.isLoading;

  const componentProps = definition.componentProps as {
    badges?: StatusBadge[];
    showCounts?: boolean;
  } | undefined;

  const badges = componentProps?.badges || [
    { id: 'all', label: 'All', filter: {}, color: 'all' },
    { id: 'green', label: 'Green (0-15 days)', filter: { benchStatus: 'green' }, color: 'green' },
    { id: 'yellow', label: 'Yellow (16-30)', filter: { benchStatus: 'yellow' }, color: 'yellow' },
    { id: 'orange', label: 'Orange (31-60)', filter: { benchStatus: 'orange' }, color: 'orange' },
    { id: 'red', label: 'Red (61-90)', filter: { benchStatus: 'red' }, color: 'red' },
    { id: 'black', label: 'Black (91+)', filter: { benchStatus: 'black' }, color: 'gray' },
  ];

  const showCounts = componentProps?.showCounts ?? true;

  // Extract status distribution from data
  const benchData = data as BenchStatusSummaryData | undefined;
  const statusDistribution = benchData?.statusDistribution;
  const totalConsultants = benchData?.totalConsultants ?? 0;

  // Calculate total for 'all' badge
  const total = statusDistribution
    ? Object.values(statusDistribution).reduce((sum, count) => sum + count, 0)
    : totalConsultants;

  // Get count for a badge
  const getCount = (badgeId: string): number => {
    if (badgeId === 'all') return total;
    if (!statusDistribution) return 0;
    return statusDistribution[badgeId as keyof StatusDistribution] ?? 0;
  };

  // Handle badge click - would trigger filter in parent
  const handleBadgeClick = (badge: StatusBadge) => {
    setActiveFilter(badge.id);
    // In a full implementation, this would update URL params or call a parent filter function
    // For now, it updates visual state
  };

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-9 w-32 bg-stone-200 rounded-full animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {badges.map((badge) => {
        const isActive = activeFilter === badge.id;
        const color = badge.color || 'all';
        const styles = STATUS_STYLES[color] || STATUS_STYLES.all;
        const count = getCount(badge.id);

        return (
          <button
            key={badge.id}
            onClick={() => handleBadgeClick(badge)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
              'border focus:outline-none focus:ring-2 focus:ring-offset-1',
              isActive
                ? cn(styles.bgActive, 'text-white border-transparent focus:ring-stone-400')
                : cn(styles.bg, styles.text, styles.border, 'hover:opacity-80 focus:ring-stone-300')
            )}
          >
            <span>{badge.label}</span>
            {showCounts && (
              <span
                className={cn(
                  'inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full text-xs font-bold',
                  isActive
                    ? 'bg-white/25 text-white'
                    : 'bg-white text-stone-600'
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default BenchStatusSummary;
