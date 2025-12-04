'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type MaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  /** Maximum width constraint */
  maxWidth?: MaxWidth;
  /** Center the container */
  center?: boolean;
  /** Responsive padding */
  padding?: boolean;
  className?: string;
}

const maxWidthClasses: Record<MaxWidth, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

/**
 * Responsive container with max-width constraints
 */
export function ResponsiveContainer({
  children,
  maxWidth = '7xl',
  center = true,
  padding = true,
  className,
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        maxWidthClasses[maxWidth],
        center && 'mx-auto',
        padding && 'px-4 sm:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </div>
  );
}
