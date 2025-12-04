'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type Columns = 1 | 2 | 3 | 4;

interface CardGridLayoutProps {
  children: React.ReactNode;
  /** Number of columns on desktop */
  columns?: Columns;
  /** Gap between cards */
  gap?: 'sm' | 'md' | 'lg';
  /** Use masonry-style layout (requires JS) */
  masonry?: boolean;
  className?: string;
}

const columnClasses: Record<Columns, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const gapClasses = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
};

/**
 * Responsive card grid layout
 */
export function CardGridLayout({
  children,
  columns = 3,
  gap = 'md',
  masonry = false,
  className,
}: CardGridLayoutProps) {
  if (masonry) {
    // CSS columns-based masonry
    return (
      <div
        className={cn(
          gapClasses[gap],
          className
        )}
        style={{
          columnCount: columns,
          columnGap: gap === 'sm' ? '0.75rem' : gap === 'lg' ? '1.5rem' : '1rem',
        }}
      >
        {React.Children.map(children, (child) => (
          <div className="break-inside-avoid mb-4">{child}</div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid',
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}
