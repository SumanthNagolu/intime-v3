'use client';

/**
 * DateColumn Component
 *
 * Date display with relative time, tooltips, and formatting options.
 */

import * as React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatDate, getRelativeTime } from '@/lib/tables';
import type { DateConfig } from '../types';

// ==========================================
// PROPS
// ==========================================

interface DateColumnProps {
  /** Date value */
  value: Date | string | null | undefined;

  /** Date configuration */
  config?: DateConfig;

  /** Additional class name */
  className?: string;
}

// ==========================================
// COMPONENT
// ==========================================

export function DateColumn({ value, config = {}, className }: DateColumnProps) {
  if (!value) {
    return <span className="text-muted-foreground">-</span>;
  }

  const date = typeof value === 'string' ? new Date(value) : value;

  if (isNaN(date.getTime())) {
    return <span className="text-muted-foreground">Invalid date</span>;
  }

  const { format = 'relative', showTime = false, showTooltip = true } = config;

  // Format the display value
  const displayValue = format === 'relative'
    ? getRelativeTime(date)
    : formatDate(date, format, showTime);

  // Format the tooltip value (always show full date)
  const tooltipValue = formatDate(date, 'long', true);

  const content = (
    <span className={cn('whitespace-nowrap', className)}>
      {displayValue}
    </span>
  );

  if (showTooltip && format === 'relative') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltipValue}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

// ==========================================
// RELATIVE DATE COLUMN
// ==========================================

interface RelativeDateColumnProps {
  value: Date | string | null | undefined;
  className?: string;
}

export function RelativeDateColumn({ value, className }: RelativeDateColumnProps) {
  return <DateColumn value={value} config={{ format: 'relative' }} className={className} />;
}

// ==========================================
// DATETIME COLUMN
// ==========================================

interface DateTimeColumnProps {
  value: Date | string | null | undefined;
  className?: string;
}

export function DateTimeColumn({ value, className }: DateTimeColumnProps) {
  return (
    <DateColumn
      value={value}
      config={{ format: 'medium', showTime: true, showTooltip: false }}
      className={className}
    />
  );
}

export default DateColumn;
