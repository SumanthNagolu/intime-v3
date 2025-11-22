/**
 * Badge Unlock Modal
 * ACAD-016
 *
 * Animated modal shown when user earns a new badge
 */

'use client';

import { useEffect, useState } from 'react';
import { X, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BadgeUnlockAnimation } from '@/types/badges';
import {
  getRarityColor,
  getRarityBgColor,
  getBadgeIconFallback,
} from '@/types/badges';

// ============================================================================
// TYPES
// ============================================================================

export interface BadgeUnlockModalProps {
  badge: BadgeUnlockAnimation | null;
  isOpen: boolean;
  onClose: () => void;
  onShare?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BadgeUnlockModal({
  badge,
  isOpen,
  onClose,
  onShare,
}: BadgeUnlockModalProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen && badge) {
      // Trigger animation after modal opens
      setTimeout(() => setAnimate(true), 100);
    } else {
      setAnimate(false);
    }
  }, [isOpen, badge]);

  if (!isOpen || !badge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-md mx-4 p-8 rounded-2xl shadow-2xl transform transition-all duration-500',
          getRarityBgColor(badge.rarity),
          'border-4',
          badge.rarity === 'legendary'
            ? 'border-yellow-400'
            : badge.rarity === 'epic'
              ? 'border-purple-400'
              : badge.rarity === 'rare'
                ? 'border-blue-400'
                : 'border-gray-400',
          animate ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        )}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Confetti Effect (legendary only) */}
        {badge.rarity === 'legendary' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
            <div className="absolute top-0 right-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping animation-delay-200" />
            <div className="absolute bottom-0 left-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-ping animation-delay-400" />
          </div>
        )}

        {/* Badge Icon */}
        <div className="flex justify-center mb-6">
          <div
            className={cn(
              'transform transition-all duration-700',
              animate ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
            )}
          >
            {badge.iconUrl ? (
              <img
                src={badge.iconUrl}
                alt={badge.name}
                className="w-32 h-32"
              />
            ) : (
              <div className="text-8xl">{getBadgeIconFallback(badge.rarity)}</div>
            )}
          </div>
        </div>

        {/* "NEW BADGE!" Header */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold uppercase tracking-wider">
            🎉 New Badge Unlocked! 🎉
          </h2>
        </div>

        {/* Badge Name */}
        <div className="text-center mb-2">
          <h3 className={cn('text-3xl font-bold', getRarityColor(badge.rarity))}>
            {badge.name}
          </h3>
        </div>

        {/* Rarity */}
        <div className="flex justify-center mb-4">
          <span
            className={cn(
              'px-4 py-2 rounded-full text-sm font-semibold uppercase',
              getRarityColor(badge.rarity),
              getRarityBgColor(badge.rarity)
            )}
          >
            {badge.rarity}
          </span>
        </div>

        {/* Description */}
        <p className="text-center text-gray-700 dark:text-gray-300 mb-6">
          {badge.description}
        </p>

        {/* XP Reward */}
        <div className="text-center mb-6">
          <div className="inline-block px-6 py-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <span className="text-2xl font-bold text-green-700 dark:text-green-400">
              +{badge.xpReward} XP
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            Continue
          </button>
          {onShare && (
            <button
              onClick={() => {
                onShare();
                onClose();
              }}
              className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
