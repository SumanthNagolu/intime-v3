'use client';

/**
 * RatingColumn Component
 *
 * Star ratings, scores, and match percentages.
 */

import * as React from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RatingConfig } from '../types';

// ==========================================
// PROPS
// ==========================================

interface RatingColumnProps {
  /** Rating value */
  value: number | string | null | undefined;

  /** Rating configuration */
  config?: RatingConfig;

  /** Additional class name */
  className?: string;
}

// ==========================================
// COMPONENT
// ==========================================

export function RatingColumn({ value, config = {}, className }: RatingColumnProps) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-muted-foreground">-</span>;
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) {
    return <span className="text-muted-foreground">-</span>;
  }

  const { max = 5, type = 'stars', showLabel = false, colorGradient = true } = config;

  switch (type) {
    case 'stars':
      return (
        <StarRating
          value={numValue}
          max={max}
          showLabel={showLabel}
          className={className}
        />
      );

    case 'percentage':
      return (
        <PercentageRating
          value={numValue}
          colorGradient={colorGradient}
          showLabel={showLabel}
          className={className}
        />
      );

    case 'number':
    default:
      return (
        <NumberRating
          value={numValue}
          max={max}
          colorGradient={colorGradient}
          className={className}
        />
      );
  }
}

// ==========================================
// STAR RATING
// ==========================================

interface StarRatingProps {
  value: number;
  max: number;
  showLabel?: boolean;
  className?: string;
}

function StarRating({ value, max, showLabel, className }: StarRatingProps) {
  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 >= 0.5;
  const emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
          />
        ))}
        {/* Half star */}
        {hasHalfStar && (
          <StarHalf className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
        )}
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className="h-3.5 w-3.5 text-gray-300" />
        ))}
      </div>
      {showLabel && (
        <span className="ml-1 text-sm text-muted-foreground">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// ==========================================
// PERCENTAGE RATING
// ==========================================

interface PercentageRatingProps {
  value: number;
  colorGradient?: boolean;
  showLabel?: boolean;
  className?: string;
}

function PercentageRating({
  value,
  colorGradient,
  showLabel,
  className,
}: PercentageRatingProps) {
  const percentage = Math.min(100, Math.max(0, value));
  const color = colorGradient ? getColorForPercentage(percentage) : 'bg-primary';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel !== false && (
        <span className={cn('text-sm font-medium', getTextColorForPercentage(percentage))}>
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

// ==========================================
// NUMBER RATING
// ==========================================

interface NumberRatingProps {
  value: number;
  max: number;
  colorGradient?: boolean;
  className?: string;
}

function NumberRating({ value, max, colorGradient, className }: NumberRatingProps) {
  const percentage = (value / max) * 100;
  const textColor = colorGradient ? getTextColorForPercentage(percentage) : '';

  return (
    <span className={cn('font-medium', textColor, className)}>
      {value.toFixed(1)}/{max}
    </span>
  );
}

// ==========================================
// MATCH SCORE COLUMN
// ==========================================

interface MatchScoreColumnProps {
  value: number | string | null | undefined;
  className?: string;
}

export function MatchScoreColumn({ value, className }: MatchScoreColumnProps) {
  return (
    <RatingColumn
      value={value}
      config={{ type: 'percentage', colorGradient: true, showLabel: true }}
      className={className}
    />
  );
}

// ==========================================
// HELPERS
// ==========================================

function getColorForPercentage(percentage: number): string {
  if (percentage >= 80) return 'bg-green-500';
  if (percentage >= 60) return 'bg-yellow-500';
  if (percentage >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

function getTextColorForPercentage(percentage: number): string {
  if (percentage >= 80) return 'text-green-600';
  if (percentage >= 60) return 'text-yellow-600';
  if (percentage >= 40) return 'text-orange-600';
  return 'text-red-600';
}

export default RatingColumn;
