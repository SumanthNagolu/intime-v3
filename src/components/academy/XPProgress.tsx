'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Star, TrendingUp } from 'lucide-react';
import { getRankFromXP, getXPToNextRank, getNextRank, Rank } from '@/lib/academy/gamification';

interface XPProgressProps {
  xp: number;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function XPProgress({ xp, showDetails = true, size = 'md' }: XPProgressProps) {
  const currentRank = getRankFromXP(xp);
  const nextRank = getNextRank(currentRank);
  const xpProgress = getXPToNextRank(xp);

  const sizeClasses = {
    sm: { container: 'p-3', badge: 'text-xl', title: 'text-xs', bar: 'h-1' },
    md: { container: 'p-4', badge: 'text-3xl', title: 'text-sm', bar: 'h-1.5' },
    lg: { container: 'p-6', badge: 'text-4xl', title: 'text-base', bar: 'h-2' },
  };

  const classes = sizeClasses[size];

  return (
    <div className={cn("bg-white rounded-2xl border border-charcoal-100 shadow-elevation-sm", classes.container)}>
      <div className="flex items-center gap-4">
        {/* Rank Badge */}
        <div className={cn(
          "flex items-center justify-center rounded-xl bg-gradient-to-br",
          size === 'sm' ? "w-10 h-10" : size === 'md' ? "w-14 h-14" : "w-16 h-16",
          `from-${currentRank.color}/20 to-${currentRank.color}/10`
        )}>
          <span className={cn(classes.badge, "font-heading leading-none")}>
            {currentRank.badge}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("font-heading font-bold text-charcoal-900", classes.title)}>
              {currentRank.title}
            </span>
            <span className="text-[10px] font-mono text-charcoal-400 uppercase">
              LVL {currentRank.level}
            </span>
          </div>

          {/* XP Bar */}
          <div className={cn("w-full bg-charcoal-100 rounded-full overflow-hidden", classes.bar)}>
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                "bg-gradient-to-r from-gold-500 to-amber-500"
              )}
              style={{ width: `${xpProgress.percentage}%` }}
            />
          </div>

          {/* XP Numbers */}
          {showDetails && nextRank && (
            <div className="flex items-center justify-between mt-1.5 text-[10px] font-mono text-charcoal-500">
              <span>{xp.toLocaleString()} XP</span>
              <span className="flex items-center gap-1">
                <TrendingUp size={10} />
                {xpProgress.current.toLocaleString()} / {xpProgress.required.toLocaleString()} to {nextRank.title}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact XP display for headers
export function XPBadge({ xp }: { xp: number }) {
  const rank = getRankFromXP(xp);
  
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-charcoal-900 rounded-full">
      <span className="text-lg leading-none">{rank.badge}</span>
      <div className="flex flex-col">
        <span className="text-[10px] font-mono text-charcoal-400 uppercase leading-none">
          {rank.title}
        </span>
        <span className="text-xs font-bold text-gold-400 leading-none">
          {xp.toLocaleString()} XP
        </span>
      </div>
    </div>
  );
}

// XP Gain Animation (to be triggered on XP earn)
export function XPGainAnimation({ 
  amount, 
  position 
}: { 
  amount: number; 
  position: { x: number; y: number } 
}) {
  return (
    <div
      className="fixed pointer-events-none z-50 animate-xp-float"
      style={{ left: position.x, top: position.y }}
    >
      <div className="flex items-center gap-1 text-gold-500 font-heading font-bold text-xl drop-shadow-lg">
        <Star size={16} className="fill-current" />
        +{amount} XP
      </div>
    </div>
  );
}









