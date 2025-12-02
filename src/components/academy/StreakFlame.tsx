'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Crown, Flame } from 'lucide-react';
import { getFlameLevel, getFlameColor } from '@/lib/academy/gamification';

interface StreakFlameProps {
  streakDays: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakFlame({ streakDays, showLabel = true, size = 'md' }: StreakFlameProps) {
  const flameLevel = getFlameLevel(streakDays);
  const flameColor = getFlameColor(flameLevel);
  
  const sizeClasses = {
    sm: 'w-8 h-10 text-xs',
    md: 'w-12 h-16 text-lg',
    lg: 'w-16 h-20 text-2xl',
  };

  const milestones = [
    { days: 7, badge: '🔥' },
    { days: 30, badge: '👑' },
    { days: 60, badge: '⚡' },
    { days: 100, badge: '💎' },
  ];

  const currentMilestone = milestones.filter(m => streakDays >= m.days).pop();

  return (
    <div className="relative group">
      {/* Flame container */}
      <div 
        className={cn(
          "relative flex items-center justify-center",
          sizeClasses[size],
          "flame-container"
        )}
      >
        {/* Animated flame background */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-t rounded-t-full",
            flameColor,
            "animate-flame clip-path-flame",
            flameLevel >= 2 && "shadow-lg",
            flameLevel >= 3 && "shadow-xl"
          )}
          style={{
            clipPath: 'ellipse(50% 60% at 50% 60%)',
            filter: flameLevel >= 2 ? `drop-shadow(0 0 ${8 + flameLevel * 4}px ${flameLevel >= 3 ? 'rgba(139, 92, 246, 0.5)' : 'rgba(251, 146, 60, 0.5)'})` : undefined,
          }}
        />
        
        {/* Inner glow */}
        <div 
          className={cn(
            "absolute inset-2 bg-gradient-to-t rounded-t-full opacity-80",
            flameLevel === 0 && "from-orange-200 to-yellow-300",
            flameLevel === 1 && "from-yellow-200 to-orange-300",
            flameLevel === 2 && "from-cyan-200 to-blue-300",
            flameLevel >= 3 && "from-violet-200 to-purple-300"
          )}
          style={{
            clipPath: 'ellipse(40% 50% at 50% 60%)',
          }}
        />

        {/* Streak number */}
        <span className={cn(
          "relative z-10 font-heading font-black text-white drop-shadow-md",
          size === 'sm' && "text-xs",
          size === 'md' && "text-lg",
          size === 'lg' && "text-2xl"
        )}>
          {streakDays}
        </span>
      </div>

      {/* Milestone badge */}
      {streakDays >= 30 && (
        <div className={cn(
          "absolute -top-1 -right-1 flex items-center justify-center rounded-full",
          "bg-gold-500 border-2 border-white shadow-md",
          size === 'sm' ? "w-4 h-4" : "w-6 h-6"
        )}>
          <Crown size={size === 'sm' ? 8 : 12} className="text-white" />
        </div>
      )}

      {/* Tooltip on hover */}
      {showLabel && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
          <div className="bg-charcoal-900 text-white px-3 py-2 rounded-lg text-center whitespace-nowrap shadow-xl">
            <div className="text-[10px] font-mono uppercase tracking-widest text-charcoal-400 mb-1">
              Learning Streak
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Flame size={12} className={cn(
                flameLevel >= 3 ? "text-purple-400" : 
                flameLevel >= 2 ? "text-blue-400" : 
                "text-orange-400"
              )} />
              <span className="font-bold">{streakDays} Days</span>
            </div>
            {currentMilestone && (
              <div className="text-[10px] text-gold-400 mt-1">
                {currentMilestone.badge} {streakDays >= 100 ? 'Diamond' : streakDays >= 60 ? 'Lightning' : streakDays >= 30 ? 'Crown' : 'Fire'} Status
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Compact inline version for headers
export function StreakBadge({ streakDays }: { streakDays: number }) {
  const flameLevel = getFlameLevel(streakDays);
  
  if (streakDays === 0) return null;

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold",
      flameLevel >= 3 && "bg-purple-100 text-purple-700",
      flameLevel === 2 && "bg-blue-100 text-blue-700",
      flameLevel === 1 && "bg-orange-100 text-orange-700",
      flameLevel === 0 && "bg-amber-100 text-amber-700"
    )}>
      <Flame size={12} />
      {streakDays}
    </div>
  );
}














