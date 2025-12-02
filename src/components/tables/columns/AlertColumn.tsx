'use client';

/**
 * AlertColumn Component
 *
 * Alert level indicator for visa expiry, urgency, etc.
 */

import * as React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getDaysFromNow, getAlertLevel } from '@/lib/tables';
import type { AlertConfig, AlertLevel } from '../types';

// ==========================================
// ALERT STYLES
// ==========================================

const alertStyles: Record<AlertLevel, { bg: string; text: string; icon: typeof AlertCircle }> = {
  green: {
    bg: 'bg-green-100 border-green-200',
    text: 'text-green-700',
    icon: CheckCircle,
  },
  yellow: {
    bg: 'bg-yellow-100 border-yellow-200',
    text: 'text-yellow-700',
    icon: Clock,
  },
  orange: {
    bg: 'bg-orange-100 border-orange-200',
    text: 'text-orange-700',
    icon: AlertTriangle,
  },
  red: {
    bg: 'bg-red-100 border-red-200',
    text: 'text-red-700',
    icon: AlertCircle,
  },
  black: {
    bg: 'bg-gray-900 border-gray-800',
    text: 'text-white',
    icon: XCircle,
  },
};

// ==========================================
// DEFAULT LABELS
// ==========================================

const defaultLabels: Record<AlertLevel, string> = {
  green: 'On Track',
  yellow: 'Attention Needed',
  orange: 'Warning',
  red: 'Critical',
  black: 'Expired',
};

// ==========================================
// PROPS
// ==========================================

interface AlertColumnProps {
  /** Alert value - can be a level string, days remaining, or a date */
  value: AlertLevel | number | Date | string | null | undefined;

  /** Alert configuration */
  config?: AlertConfig;

  /** Additional class name */
  className?: string;
}

// ==========================================
// COMPONENT
// ==========================================

export function AlertColumn({ value, config = {}, className }: AlertColumnProps) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">-</span>;
  }

  const {
    thresholds = { green: 181, yellow: 90, orange: 30, red: 1 },
    labels = defaultLabels,
    showIcon = true,
    showDays = true,
    invert = false,
  } = config;

  // Determine the alert level
  let level: AlertLevel;
  let days: number | null = null;

  if (typeof value === 'string' && ['green', 'yellow', 'orange', 'red', 'black'].includes(value)) {
    level = value as AlertLevel;
  } else if (typeof value === 'number') {
    days = value;
    level = getAlertLevel(invert ? -value : value, thresholds);
  } else {
    // Date value
    days = getDaysFromNow(value);
    level = getAlertLevel(days, thresholds);
  }

  const style = alertStyles[level];
  const Icon = style.icon;
  const label = labels[level];

  const content = (
    <Badge
      variant="outline"
      className={cn(
        'font-medium whitespace-nowrap',
        style.bg,
        style.text,
        className
      )}
    >
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {showDays && days !== null ? (
        days <= 0 ? 'Expired' : `${days}d`
      ) : (
        label
      )}
    </Badge>
  );

  if (days !== null) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent>
            <p>
              {days <= 0
                ? `Expired ${Math.abs(days)} days ago`
                : `${days} days remaining`}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

// ==========================================
// VISA ALERT COLUMN
// ==========================================

interface VisaAlertColumnProps {
  /** Visa expiry date */
  expiryDate: Date | string | null | undefined;

  /** Show days remaining */
  showDays?: boolean;

  /** Additional class name */
  className?: string;
}

export function VisaAlertColumn({
  expiryDate,
  showDays = true,
  className,
}: VisaAlertColumnProps) {
  return (
    <AlertColumn
      value={expiryDate}
      config={{
        thresholds: { green: 181, yellow: 90, orange: 30, red: 1 },
        showDays,
        labels: {
          green: '181+ days',
          yellow: '90-180 days',
          orange: '30-90 days',
          red: '<30 days',
          black: 'Expired',
        },
      }}
      className={className}
    />
  );
}

// ==========================================
// BENCH DAYS COLUMN
// ==========================================

interface BenchDaysColumnProps {
  /** Days on bench */
  daysOnBench: number | null | undefined;

  /** Additional class name */
  className?: string;
}

export function BenchDaysColumn({ daysOnBench, className }: BenchDaysColumnProps) {
  if (daysOnBench === null || daysOnBench === undefined) {
    return <span className="text-muted-foreground">-</span>;
  }

  // For bench days, higher is worse (invert)
  const level = getBenchAlertLevel(daysOnBench);
  const style = alertStyles[level];

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium font-mono',
        style.bg,
        style.text,
        className
      )}
    >
      {daysOnBench}d
    </Badge>
  );
}

function getBenchAlertLevel(days: number): AlertLevel {
  if (days <= 15) return 'green';
  if (days <= 30) return 'yellow';
  if (days <= 60) return 'orange';
  if (days <= 90) return 'red';
  return 'black';
}

export default AlertColumn;
