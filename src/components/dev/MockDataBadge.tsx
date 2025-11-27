/**
 * Mock Data Badge
 *
 * Shows a visual indicator when mock data is being used.
 * Only visible when SHOW_MOCK_DATA_BADGE feature flag is enabled.
 */

'use client';

import { useFeatureFlag, FeatureFlags } from '@/lib/features';

interface MockDataBadgeProps {
  /** Which data source is mock */
  source?: string;
  /** Position on screen */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Custom className */
  className?: string;
}

export function MockDataBadge({
  source = 'data',
  position = 'bottom-right',
  className = '',
}: MockDataBadgeProps) {
  const showBadge = useFeatureFlag(FeatureFlags.SHOW_MOCK_DATA_BADGE);

  if (!showBadge) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 ${className}`}
    >
      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 border border-amber-300 rounded-full shadow-lg">
        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
        <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
          Mock {source}
        </span>
      </div>
    </div>
  );
}

/**
 * Inline mock data indicator
 * Use this within components to show mock data status
 */
export function MockDataIndicator({ isLive }: { isLive: boolean }) {
  const showBadge = useFeatureFlag(FeatureFlags.SHOW_MOCK_DATA_BADGE);

  if (!showBadge || isLive) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 border border-amber-200 rounded text-xs font-medium text-amber-700">
      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
      Mock
    </span>
  );
}
