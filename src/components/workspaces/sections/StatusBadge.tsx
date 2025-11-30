/**
 * StatusBadge Component
 *
 * Entity-aware status badge using entity-registry colors.
 */

'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getEntityConfig, type EntityType } from '@/lib/workspace/entity-registry';

// =====================================================
// TYPES
// =====================================================

export interface StatusBadgeProps {
  status: string;
  entityType?: EntityType;
  customColors?: {
    color: string;
    bgColor: string;
  };
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

// =====================================================
// FALLBACK COLORS
// =====================================================

const FALLBACK_STATUS_COLORS: Record<string, { color: string; bgColor: string }> = {
  // Generic
  active: { color: 'text-green-700', bgColor: 'bg-green-100' },
  inactive: { color: 'text-stone-500', bgColor: 'bg-stone-100' },
  pending: { color: 'text-amber-700', bgColor: 'bg-amber-100' },
  completed: { color: 'text-purple-700', bgColor: 'bg-purple-100' },
  cancelled: { color: 'text-red-700', bgColor: 'bg-red-100' },
  draft: { color: 'text-stone-500', bgColor: 'bg-stone-100' },
  open: { color: 'text-green-700', bgColor: 'bg-green-100' },
  closed: { color: 'text-stone-500', bgColor: 'bg-stone-100' },

  // Lead statuses
  new: { color: 'text-blue-700', bgColor: 'bg-blue-100' },
  warm: { color: 'text-amber-700', bgColor: 'bg-amber-100' },
  hot: { color: 'text-orange-700', bgColor: 'bg-orange-100' },
  cold: { color: 'text-stone-500', bgColor: 'bg-stone-100' },
  converted: { color: 'text-green-700', bgColor: 'bg-green-100' },
  lost: { color: 'text-red-700', bgColor: 'bg-red-100' },

  // Job statuses
  urgent: { color: 'text-red-700', bgColor: 'bg-red-100' },
  on_hold: { color: 'text-blue-600', bgColor: 'bg-blue-100' },
  filled: { color: 'text-purple-700', bgColor: 'bg-purple-100' },

  // Submission statuses
  sourced: { color: 'text-blue-700', bgColor: 'bg-blue-100' },
  screening: { color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
  submitted_to_client: { color: 'text-amber-700', bgColor: 'bg-amber-100' },
  client_review: { color: 'text-orange-700', bgColor: 'bg-orange-100' },
  client_interview: { color: 'text-purple-700', bgColor: 'bg-purple-100' },
  offer_stage: { color: 'text-pink-700', bgColor: 'bg-pink-100' },
  placed: { color: 'text-green-700', bgColor: 'bg-green-100' },
  rejected: { color: 'text-red-700', bgColor: 'bg-red-100' },
  withdrawn: { color: 'text-stone-500', bgColor: 'bg-stone-100' },

  // Deal stages
  discovery: { color: 'text-blue-700', bgColor: 'bg-blue-100' },
  qualification: { color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
  proposal: { color: 'text-amber-700', bgColor: 'bg-amber-100' },
  negotiation: { color: 'text-orange-700', bgColor: 'bg-orange-100' },
  closed_won: { color: 'text-green-700', bgColor: 'bg-green-100' },
  closed_lost: { color: 'text-red-700', bgColor: 'bg-red-100' },

  // Talent statuses
  bench: { color: 'text-amber-700', bgColor: 'bg-amber-100' },
  blacklisted: { color: 'text-red-700', bgColor: 'bg-red-100' },

  // Account statuses
  prospect: { color: 'text-blue-700', bgColor: 'bg-blue-100' },
  churned: { color: 'text-red-700', bgColor: 'bg-red-100' },
};

// =====================================================
// HELPERS
// =====================================================

function getStatusColors(
  status: string,
  entityType?: EntityType,
  customColors?: { color: string; bgColor: string }
): { color: string; bgColor: string } {
  // Use custom colors if provided
  if (customColors) {
    return customColors;
  }

  // Try to get from entity registry
  if (entityType) {
    try {
      const config = getEntityConfig(entityType);
      const normalizedStatus = status.toLowerCase().replace(/ /g, '_');
      const statusConfig = config.statuses[normalizedStatus];
      if (statusConfig) {
        return { color: statusConfig.color, bgColor: statusConfig.bgColor };
      }
    } catch {
      // Entity type not found, use fallback
    }
  }

  // Use fallback colors
  const normalizedStatus = status.toLowerCase().replace(/ /g, '_');
  const fallback = FALLBACK_STATUS_COLORS[normalizedStatus];
  if (fallback) {
    return fallback;
  }

  // Default gray
  return { color: 'text-stone-600', bgColor: 'bg-stone-100' };
}

function formatStatusLabel(status: string): string {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function StatusBadge({
  status,
  entityType,
  customColors,
  size = 'md',
  showDot = false,
  className,
}: StatusBadgeProps) {
  const colors = getStatusColors(status, entityType, customColors);
  const label = formatStatusLabel(status);

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-1',
  };

  return (
    <Badge
      variant="secondary"
      className={cn(
        'font-medium uppercase tracking-wider',
        colors.bgColor,
        colors.color,
        sizeClasses[size],
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full mr-1.5',
            colors.bgColor.replace('bg-', 'bg-').replace('-100', '-500')
          )}
        />
      )}
      {label}
    </Badge>
  );
}

export default StatusBadge;
