'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type Columns = 1 | 2 | 3 | 4 | 5 | 6;
type Gap = 'none' | 'sm' | 'md' | 'lg' | 'xl';

interface GridLayoutProps {
  children: React.ReactNode;
  /** Number of columns */
  columns?: Columns;
  /** Gap between items */
  gap?: Gap;
  /** Responsive column overrides */
  responsiveColumns?: {
    sm?: Columns;
    md?: Columns;
    lg?: Columns;
    xl?: Columns;
  };
  className?: string;
}

const columnClasses: Record<Columns, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};

const responsiveColumnClasses: Record<string, Record<Columns, string>> = {
  sm: {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    5: 'sm:grid-cols-5',
    6: 'sm:grid-cols-6',
  },
  md: {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6',
  },
  lg: {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
  },
  xl: {
    1: 'xl:grid-cols-1',
    2: 'xl:grid-cols-2',
    3: 'xl:grid-cols-3',
    4: 'xl:grid-cols-4',
    5: 'xl:grid-cols-5',
    6: 'xl:grid-cols-6',
  },
};

const gapClasses: Record<Gap, string> = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

/**
 * Responsive CSS grid layout component
 */
export function GridLayout({
  children,
  columns = 1,
  gap = 'md',
  responsiveColumns,
  className,
}: GridLayoutProps) {
  const responsiveClasses = responsiveColumns
    ? Object.entries(responsiveColumns)
        .map(([breakpoint, cols]) => responsiveColumnClasses[breakpoint]?.[cols])
        .filter(Boolean)
        .join(' ')
    : '';

  return (
    <div
      className={cn(
        'grid',
        columnClasses[columns],
        gapClasses[gap],
        responsiveClasses,
        className
      )}
    >
      {children}
    </div>
  );
}
