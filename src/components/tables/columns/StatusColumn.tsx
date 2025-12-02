'use client';

/**
 * StatusColumn Component
 *
 * Badge-based status display with color coding and tooltips.
 */

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { StatusColor, StatusConfig } from '../types';

// ==========================================
// COLOR MAPPING
// ==========================================

const colorClasses: Record<StatusColor, string> = {
  default: 'bg-gray-100 text-gray-700 border-gray-200',
  primary: 'bg-blue-100 text-blue-700 border-blue-200',
  secondary: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  gray: 'bg-gray-100 text-gray-600 border-gray-200',
  green: 'bg-green-100 text-green-700 border-green-200',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  pink: 'bg-pink-100 text-pink-700 border-pink-200',
};

// ==========================================
// DEFAULT STATUS COLORS
// ==========================================

export const defaultStatusColors: Record<string, StatusColor> = {
  // Common statuses
  active: 'green',
  inactive: 'gray',
  pending: 'yellow',
  completed: 'green',
  cancelled: 'red',
  archived: 'gray',
  draft: 'gray',

  // Activity statuses
  scheduled: 'blue',
  open: 'yellow',
  in_progress: 'purple',
  skipped: 'gray',

  // Recruiting statuses
  sourced: 'blue',
  screening: 'yellow',
  submitted_to_client: 'orange',
  client_review: 'orange',
  client_accepted: 'green',
  client_rejected: 'red',
  interview_scheduled: 'purple',
  interview_completed: 'blue',
  offer_pending: 'yellow',
  offer_extended: 'orange',
  offer_accepted: 'green',
  offer_declined: 'red',
  placed: 'green',
  withdrawn: 'gray',

  // Job statuses
  new: 'blue',
  working: 'purple',
  filled: 'green',
  closed: 'gray',
  on_hold: 'yellow',

  // Bench statuses
  onboarding: 'blue',
  available: 'green',
  marketing: 'purple',
  interviewing: 'orange',

  // Priority
  low: 'gray',
  medium: 'blue',
  high: 'orange',
  urgent: 'red',

  // HR statuses
  on_leave: 'yellow',
  terminated: 'red',
  approved: 'green',
  denied: 'red',
};

// ==========================================
// PROPS
// ==========================================

interface StatusColumnProps {
  /** Status value */
  value: string | null | undefined;

  /** Status configuration */
  config?: StatusConfig;

  /** Additional class name */
  className?: string;
}

// ==========================================
// COMPONENT
// ==========================================

export function StatusColumn({ value, config = {}, className }: StatusColumnProps) {
  if (!value) {
    return <span className="text-muted-foreground">-</span>;
  }

  const label = config.labels?.[value] ?? formatStatusLabel(value);
  const color = config.colors?.[value] ?? defaultStatusColors[value] ?? 'default';
  const description = config.descriptions?.[value];
  const Icon = config.icons?.[value];

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        'font-medium capitalize whitespace-nowrap',
        colorClasses[color],
        className
      )}
    >
      {config.showIcon && Icon && <Icon className="mr-1 h-3 w-3" />}
      {label}
    </Badge>
  );

  if (config.showTooltip && description) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent>
            <p>{description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
}

// ==========================================
// HELPERS
// ==========================================

/**
 * Format status value to display label
 */
function formatStatusLabel(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

export default StatusColumn;
