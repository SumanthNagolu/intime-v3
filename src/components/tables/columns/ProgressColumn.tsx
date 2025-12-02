'use client';

/**
 * ProgressColumn Component
 *
 * Progress bar or step indicator.
 */

import * as React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { ProgressConfig } from '../types';

// ==========================================
// PROPS
// ==========================================

interface ProgressColumnProps {
  /** Progress value */
  value: number | string | null | undefined;

  /** Maximum value (for step display) */
  max?: number;

  /** Progress configuration */
  config?: ProgressConfig;

  /** Additional class name */
  className?: string;
}

// ==========================================
// COMPONENT
// ==========================================

export function ProgressColumn({ value, max, config = {}, className }: ProgressColumnProps) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-muted-foreground">-</span>;
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) {
    return <span className="text-muted-foreground">-</span>;
  }

  const {
    max: configMax = 100,
    showLabel = true,
    asSteps = false,
    colorByProgress = true,
  } = config;

  const maxValue = max ?? configMax;

  if (asSteps) {
    return (
      <StepProgress
        current={numValue}
        total={maxValue}
        showLabel={showLabel}
        colorByProgress={colorByProgress}
        className={className}
      />
    );
  }

  const percentage = Math.min(100, Math.max(0, (numValue / maxValue) * 100));
  const color = colorByProgress ? getProgressColor(percentage) : 'bg-primary';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

// ==========================================
// STEP PROGRESS
// ==========================================

interface StepProgressProps {
  current: number;
  total: number;
  showLabel?: boolean;
  colorByProgress?: boolean;
  className?: string;
}

function StepProgress({
  current,
  total,
  showLabel,
  colorByProgress,
  className,
}: StepProgressProps) {
  const percentage = (current / total) * 100;
  const color = colorByProgress ? getTextColor(percentage) : 'text-foreground';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex gap-0.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 w-3 rounded-full',
              i < current
                ? colorByProgress
                  ? getProgressColor(percentage)
                  : 'bg-primary'
                : 'bg-gray-200'
            )}
          />
        ))}
      </div>
      {showLabel && (
        <span className={cn('text-xs font-medium', color)}>
          {current}/{total}
        </span>
      )}
    </div>
  );
}

// ==========================================
// HELPERS
// ==========================================

function getProgressColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-500';
  if (percentage >= 60) return 'bg-blue-500';
  if (percentage >= 40) return 'bg-yellow-500';
  if (percentage >= 20) return 'bg-orange-500';
  return 'bg-red-500';
}

function getTextColor(percentage: number): string {
  if (percentage >= 80) return 'text-green-600';
  if (percentage >= 60) return 'text-blue-600';
  if (percentage >= 40) return 'text-yellow-600';
  if (percentage >= 20) return 'text-orange-600';
  return 'text-red-600';
}

export default ProgressColumn;
