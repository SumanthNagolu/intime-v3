'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface HideAtProps {
  children: React.ReactNode;
  /** Hide at this breakpoint and above */
  breakpoint: Breakpoint;
  className?: string;
}

const hideClasses: Record<Breakpoint, string> = {
  sm: 'sm:hidden',
  md: 'md:hidden',
  lg: 'lg:hidden',
  xl: 'xl:hidden',
  '2xl': '2xl:hidden',
};

/**
 * Hide content at specified breakpoint and above
 */
export function HideAt({ children, breakpoint, className }: HideAtProps) {
  return <div className={cn(hideClasses[breakpoint], className)}>{children}</div>;
}
