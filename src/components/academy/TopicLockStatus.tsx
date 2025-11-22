/**
 * Topic Lock Status Component
 * Story: ACAD-006
 *
 * Shows visual indicator of topic lock/unlock/completion status
 */

'use client';

import { Lock, Unlock, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopicLockStatusProps {
  isUnlocked: boolean;
  isCompleted: boolean;
  topicTitle?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function TopicLockStatus({
  isUnlocked,
  isCompleted,
  topicTitle,
  showLabel = true,
  size = 'md',
}: TopicLockStatusProps) {
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  if (isCompleted) {
    return (
      <div className={cn('flex items-center gap-2 text-green-600', showLabel && 'font-medium')}>
        <Check className={iconSizes[size]} />
        {showLabel && <span className={textSizes[size]}>Completed</span>}
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className={cn('flex items-center gap-2 text-gray-400', showLabel && 'font-medium')}>
        <Lock className={iconSizes[size]} />
        {showLabel && <span className={textSizes[size]}>Locked</span>}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2 text-blue-600', showLabel && 'font-medium')}>
      <Unlock className={iconSizes[size]} />
      {showLabel && <span className={textSizes[size]}>Available</span>}
    </div>
  );
}

/**
 * Topic Lock Badge - Compact version for lists
 */
export function TopicLockBadge({
  isUnlocked,
  isCompleted,
}: {
  isUnlocked: boolean;
  isCompleted: boolean;
}) {
  if (isCompleted) {
    return (
      <div className="inline-flex items-center justify-center rounded-full bg-green-100 p-1.5">
        <Check className="h-3 w-3 text-green-600" />
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="inline-flex items-center justify-center rounded-full bg-gray-100 p-1.5">
        <Lock className="h-3 w-3 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="inline-flex items-center justify-center rounded-full bg-blue-100 p-1.5">
      <Unlock className="h-3 w-3 text-blue-600" />
    </div>
  );
}

/**
 * Module Progress Indicator
 */
export function ModuleProgressIndicator({
  totalTopics,
  completedTopics,
  unlockedTopics,
}: {
  totalTopics: number;
  completedTopics: number;
  unlockedTopics: number;
}) {
  const completionPercentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
  const lockedTopics = totalTopics - unlockedTopics;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-medium">{Math.round(completionPercentage)}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-300"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Check className="h-3 w-3 text-green-600" />
          {completedTopics} completed
        </span>
        <span className="flex items-center gap-1">
          <Unlock className="h-3 w-3 text-blue-600" />
          {unlockedTopics - completedTopics} available
        </span>
        {lockedTopics > 0 && (
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3 text-gray-400" />
            {lockedTopics} locked
          </span>
        )}
      </div>
    </div>
  );
}
