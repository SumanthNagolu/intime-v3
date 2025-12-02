'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type Direction = 'row' | 'column';
type Spacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type Alignment = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

interface StackLayoutProps {
  children: React.ReactNode;
  /** Stack direction */
  direction?: Direction;
  /** Spacing between items */
  spacing?: Spacing;
  /** Cross-axis alignment */
  align?: Alignment;
  /** Main-axis alignment */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** Wrap items */
  wrap?: boolean;
  /** Add dividers between items */
  dividers?: boolean;
  className?: string;
}

const spacingClasses: Record<Spacing, Record<Direction, string>> = {
  none: { row: 'gap-0', column: 'gap-0' },
  xs: { row: 'gap-1', column: 'gap-1' },
  sm: { row: 'gap-2', column: 'gap-2' },
  md: { row: 'gap-4', column: 'gap-4' },
  lg: { row: 'gap-6', column: 'gap-6' },
  xl: { row: 'gap-8', column: 'gap-8' },
};

const alignClasses: Record<Alignment, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const justifyClasses: Record<string, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

/**
 * Flexbox-based stacking layout component
 */
export function StackLayout({
  children,
  direction = 'column',
  spacing = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  dividers = false,
  className,
}: StackLayoutProps) {
  const childrenArray = React.Children.toArray(children);

  return (
    <div
      className={cn(
        'flex',
        direction === 'row' ? 'flex-row' : 'flex-col',
        spacingClasses[spacing][direction],
        alignClasses[align],
        justifyClasses[justify],
        wrap && 'flex-wrap',
        className
      )}
    >
      {dividers
        ? childrenArray.map((child, index) => (
            <React.Fragment key={index}>
              {child}
              {index < childrenArray.length - 1 && (
                <div
                  className={cn(
                    'bg-border',
                    direction === 'row' ? 'w-px self-stretch' : 'h-px w-full'
                  )}
                />
              )}
            </React.Fragment>
          ))
        : children}
    </div>
  );
}
