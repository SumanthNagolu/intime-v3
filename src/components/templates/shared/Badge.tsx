'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'gold' | 'forest' | 'charcoal' | 'white' | 'success' | 'warning' | 'error';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  className?: string;
  pulse?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  gold: 'bg-gold-500/10 text-gold-600 border-gold-500/20',
  forest: 'bg-forest-500/10 text-forest-600 border-forest-500/20',
  charcoal: 'bg-charcoal-100 text-charcoal-600 border-charcoal-200',
  white: 'bg-white/10 text-white border-white/20',
  success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  error: 'bg-red-500/10 text-red-600 border-red-500/20'
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gold',
  icon,
  className,
  pulse = false
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border',
        variants[variant],
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {icon}
      {children}
    </span>
  );
};

export default Badge;
