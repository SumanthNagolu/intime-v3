/**
 * Badge Progress Widget
 * ACAD-016
 *
 * Shows progress toward next achievable badges
 */

'use client';

import { Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BadgeCard } from './BadgeCard';
import type { BadgeProgress } from '@/types/badges';
import { getRarityColor } from '@/types/badges';

// ============================================================================
// TYPES
// ============================================================================

export interface BadgeProgressWidgetProps {
  nextBadges: BadgeProgress[];
  onBadgeClick?: (badge: BadgeProgress) => void;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BadgeProgressWidget({
  nextBadges,
  onBadgeClick,
  className,
}: BadgeProgressWidgetProps) {
  if (nextBadges.length === 0) {
    return null;
  }

  // Show only closest badges (highest percentage)
  const topBadges = nextBadges.slice(0, 3);

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg border p-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold">Next Badges</h3>
        <TrendingUp className="w-4 h-4 text-green-500 ml-auto" />
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topBadges.map((badge) => (
          <BadgeCard
            key={badge.badgeId}
            badge={badge}
            earned={false}
            showProgress={true}
            onClick={() => onBadgeClick?.(badge)}
          />
        ))}
      </div>

      {/* See All Link */}
      {nextBadges.length > 3 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            See all {nextBadges.length} achievable badges →
          </button>
        </div>
      )}
    </div>
  );
}
