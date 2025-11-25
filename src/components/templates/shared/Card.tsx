'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type CardVariant = 'default' | 'premium' | 'dark' | 'glass' | 'feature';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variants: Record<CardVariant, string> = {
  default: 'bg-white border border-charcoal-100/50 shadow-elevation-md',
  premium: 'bg-white border border-charcoal-100/50 shadow-premium-lg',
  dark: 'bg-charcoal-900 border border-charcoal-800 text-white',
  glass: 'bg-white/5 backdrop-blur-md border border-white/10',
  feature: 'bg-gradient-to-br from-white to-charcoal-50 border border-charcoal-100/50 shadow-elevation-lg'
};

const paddings: Record<string, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-10'
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className,
  hover = false,
  padding = 'md'
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-300',
        variants[variant],
        paddings[padding],
        hover && 'hover:shadow-premium-lg hover:-translate-y-1',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
