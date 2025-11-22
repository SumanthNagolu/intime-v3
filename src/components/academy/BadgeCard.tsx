/**
 * Badge Card Component
 * ACAD-016
 *
 * Displays an individual badge with rarity-based styling
 */

'use client';

import { Share2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Badge, BadgeProgress, UserBadgeWithDetails } from '@/types/badges';
import {
  getRarityColor,
  getRarityBgColor,
  getRarityBorderColor,
  getBadgeIconFallback,
  formatBadgeProgress,
} from '@/types/badges';

// ============================================================================
// TYPES
// ============================================================================

export interface BadgeCardProps {
  badge: Badge | BadgeProgress | UserBadgeWithDetails;
  earned?: boolean;
  isNew?: boolean;
  showProgress?: boolean;
  onShare?: () => void;
  onClick?: () => void;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BadgeCard({
  badge,
  earned = false,
  isNew = false,
  showProgress = false,
  onShare,
  onClick,
  className,
}: BadgeCardProps) {
  const badgeData = 'badge' in badge ? badge.badge : badge;
  const progress = 'percentage' in badge ? badge : null;

  return (
    <div
      className={cn(
        'relative p-4 rounded-lg border-2 transition-all',
        getRarityBgColor(badgeData.rarity),
        getRarityBorderColor(badgeData.rarity),
        earned ? 'opacity-100' : 'opacity-60',
        onClick && 'cursor-pointer hover:scale-105',
        className
      )}
      onClick={onClick}
    >
      {/* New Badge Indicator */}
      {isNew && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
          NEW
        </div>
      )}

      {/* Badge Icon */}
      <div className="flex justify-center mb-3">
        {badgeData.iconUrl ? (
          <img
            src={badgeData.iconUrl}
            alt={badgeData.name}
            className={cn('w-16 h-16', !earned && 'grayscale')}
          />
        ) : (
          <div className={cn('text-6xl', earned ? '' : 'grayscale')}>
            {getBadgeIconFallback(badgeData.rarity)}
          </div>
        )}
      </div>

      {/* Badge Name */}
      <div className="text-center mb-1">
        <h3 className={cn('font-bold text-lg', getRarityColor(badgeData.rarity))}>
          {badgeData.name}
        </h3>
      </div>

      {/* Badge Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-2">
        {badgeData.description}
      </p>

      {/* Rarity Badge */}
      <div className="flex justify-center mb-3">
        <span
          className={cn(
            'px-3 py-1 rounded-full text-xs font-semibold uppercase',
            getRarityColor(badgeData.rarity),
            getRarityBgColor(badgeData.rarity)
          )}
        >
          {badgeData.rarity}
        </span>
      </div>

      {/* XP Reward */}
      <div className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        +{badgeData.xpReward} XP
      </div>

      {/* Progress Bar */}
      {showProgress && progress && !earned && (
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span>Progress</span>
            <span>
              {formatBadgeProgress(progress.currentValue, progress.targetValue)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all',
                badgeData.rarity === 'legendary'
                  ? 'bg-yellow-500'
                  : badgeData.rarity === 'epic'
                    ? 'bg-purple-500'
                    : badgeData.rarity === 'rare'
                      ? 'bg-blue-500'
                      : 'bg-gray-500'
              )}
              style={{ width: `${Math.min(100, progress.percentage)}%` }}
            />
          </div>
        </div>
      )}

      {/* Locked Overlay */}
      {!earned && !showProgress && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
          <Lock className="w-8 h-8 text-white" />
        </div>
      )}

      {/* Share Button */}
      {earned && onShare && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare();
          }}
          className="absolute bottom-2 right-2 p-2 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Share badge"
        >
          <Share2 className="w-4 h-4" />
        </button>
      )}

      {/* Earned Date */}
      {earned && 'earnedAt' in badge && (
        <div className="text-xs text-gray-500 text-center mt-2">
          Earned {new Date(badge.earnedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
