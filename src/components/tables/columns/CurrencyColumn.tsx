'use client';

/**
 * CurrencyColumn Component
 *
 * Formatted currency display with symbol and rate type.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/tables';
import type { CurrencyConfig } from '../types';

// ==========================================
// PROPS
// ==========================================

interface CurrencyColumnProps {
  /** Currency value */
  value: number | string | null | undefined;

  /** Currency configuration */
  config?: CurrencyConfig;

  /** Additional class name */
  className?: string;
}

// ==========================================
// COMPONENT
// ==========================================

export function CurrencyColumn({ value, config = {}, className }: CurrencyColumnProps) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-muted-foreground">-</span>;
  }

  const {
    currency = 'USD',
    locale = 'en-US',
    suffix,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = config;

  const formatted = formatCurrency(value, currency, locale, {
    minimumFractionDigits,
    maximumFractionDigits,
    suffix,
  });

  return (
    <span className={cn('font-mono text-right whitespace-nowrap', className)}>
      {formatted}
    </span>
  );
}

// ==========================================
// RATE COLUMN (Currency with rate suffix)
// ==========================================

interface RateColumnProps {
  value: number | string | null | undefined;
  rateType?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual';
  currency?: string;
  className?: string;
}

const rateSuffixes: Record<string, string> = {
  hourly: '/hr',
  daily: '/day',
  weekly: '/wk',
  monthly: '/mo',
  annual: '/yr',
};

export function RateColumn({
  value,
  rateType = 'hourly',
  currency = 'USD',
  className,
}: RateColumnProps) {
  return (
    <CurrencyColumn
      value={value}
      config={{
        currency,
        suffix: rateSuffixes[rateType] ?? '',
      }}
      className={className}
    />
  );
}

// ==========================================
// RATE RANGE COLUMN
// ==========================================

interface RateRangeColumnProps {
  min: number | string | null | undefined;
  max: number | string | null | undefined;
  rateType?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual';
  currency?: string;
  className?: string;
}

export function RateRangeColumn({
  min,
  max,
  rateType = 'hourly',
  currency = 'USD',
  className,
}: RateRangeColumnProps) {
  const hasMin = min !== null && min !== undefined && min !== '';
  const hasMax = max !== null && max !== undefined && max !== '';

  if (!hasMin && !hasMax) {
    return <span className="text-muted-foreground">-</span>;
  }

  const formatValue = (val: number | string | null | undefined) => {
    if (val === null || val === undefined || val === '') return null;
    return formatCurrency(val, currency, 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const minFormatted = formatValue(min);
  const maxFormatted = formatValue(max);
  const suffix = rateSuffixes[rateType] ?? '';

  if (minFormatted && maxFormatted && minFormatted !== maxFormatted) {
    return (
      <span className={cn('font-mono text-right whitespace-nowrap', className)}>
        {minFormatted} - {maxFormatted}
        {suffix}
      </span>
    );
  }

  return (
    <span className={cn('font-mono text-right whitespace-nowrap', className)}>
      {minFormatted ?? maxFormatted}
      {suffix}
    </span>
  );
}

export default CurrencyColumn;
