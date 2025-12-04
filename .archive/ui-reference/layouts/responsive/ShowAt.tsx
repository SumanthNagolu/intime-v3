'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface ShowAtProps {
  children: React.ReactNode;
  /** Show at this breakpoint and above */
  breakpoint: Breakpoint;
  className?: string;
}

const showClasses: Record<Breakpoint, string> = {
  sm: 'hidden sm:block',
  md: 'hidden md:block',
  lg: 'hidden lg:block',
  xl: 'hidden xl:block',
  '2xl': 'hidden 2xl:block',
};

/**
 * Show content only at specified breakpoint and above
 */
export function ShowAt({ children, breakpoint, className }: ShowAtProps) {
  return <div className={cn(showClasses[breakpoint], className)}>{children}</div>;
}
