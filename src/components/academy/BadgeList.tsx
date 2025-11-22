/**
 * Badge List Component
 * ACAD-016
 *
 * Displays a collection of badges with filtering and sorting
 */

'use client';

import { useState } from 'react';
import { Trophy, Star, Sparkles, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BadgeCard } from './BadgeCard';
import type { UserBadgeWithDetails, BadgeRarity } from '@/types/badges';

// ============================================================================
// TYPES
// ============================================================================

export interface BadgeListProps {
  badges: UserBadgeWithDetails[];
  onBadgeClick?: (badge: UserBadgeWithDetails) => void;
  onBadgeShare?: (badge: UserBadgeWithDetails) => void;
  className?: string;
}

type FilterRarity = 'all' | BadgeRarity;

// ============================================================================
// COMPONENT
// ============================================================================

export function BadgeList({
  badges,
  onBadgeClick,
  onBadgeShare,
  className,
}: BadgeListProps) {
  const [filter, setFilter] = useState<FilterRarity>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'rarity' | 'name'>('recent');

  // Filter badges by rarity
  const filteredBadges = badges.filter((b) =>
    filter === 'all' ? true : b.badge.rarity === filter
  );

  // Sort badges
  const sortedBadges = [...filteredBadges].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime();
    } else if (sortBy === 'rarity') {
      const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
      return (
        rarityOrder[b.badge.rarity] - rarityOrder[a.badge.rarity]
      );
    } else {
      return a.badge.name.localeCompare(b.badge.name);
    }
  });

  // Count badges by rarity
  const counts = badges.reduce(
    (acc, badge) => {
      acc[badge.badge.rarity]++;
      acc.total++;
      return acc;
    },
    { common: 0, rare: 0, epic: 0, legendary: 0, total: 0 }
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Badge Collection
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {counts.total} {counts.total === 1 ? 'badge' : 'badges'} earned
          </p>
        </div>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
        >
          <option value="recent">Most Recent</option>
          <option value="rarity">Rarity</option>
          <option value="name">Name</option>
        </select>
      </div>

      {/* Rarity Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap',
            filter === 'all'
              ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800'
              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
          )}
        >
          All ({counts.total})
        </button>

        <button
          onClick={() => setFilter('common')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-1',
            filter === 'common'
              ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800'
              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
          )}
        >
          <Trophy className="w-4 h-4" />
          Common ({counts.common})
        </button>

        <button
          onClick={() => setFilter('rare')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-1',
            filter === 'rare'
              ? 'bg-blue-600 text-white'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
          )}
        >
          <Star className="w-4 h-4" />
          Rare ({counts.rare})
        </button>

        <button
          onClick={() => setFilter('epic')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-1',
            filter === 'epic'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50'
          )}
        >
          <Sparkles className="w-4 h-4" />
          Epic ({counts.epic})
        </button>

        <button
          onClick={() => setFilter('legendary')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-1',
            filter === 'legendary'
              ? 'bg-yellow-600 text-white'
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
          )}
        >
          <Crown className="w-4 h-4" />
          Legendary ({counts.legendary})
        </button>
      </div>

      {/* Badge Grid */}
      {sortedBadges.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No badges found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedBadges.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              earned={true}
              isNew={badge.isNew}
              onClick={() => onBadgeClick?.(badge)}
              onShare={() => onBadgeShare?.(badge)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
