'use client';

/**
 * Wins List Widget
 *
 * Displays recent wins including placements, accepted offers, and closed deals.
 * Celebratory UI to highlight achievements.
 */

import React from 'react';
import { Trophy, Star, Handshake, DollarSign, PartyPopper, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface Win {
  id: string;
  type: 'placement' | 'offer' | 'deal';
  title: string;
  date: string | Date | null;
  value?: number;
}

interface WinsData {
  wins: Win[];
  totalCount: number;
}

const WIN_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  placement: { icon: Trophy, color: 'forest', label: 'Placement' },
  offer: { icon: Handshake, color: 'gold', label: 'Offer Accepted' },
  deal: { icon: Star, color: 'rust', label: 'Deal Won' },
};

function formatRelativeDate(date: string | Date | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatValue(value?: number): string {
  if (!value) return '';
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
}

function WinItem({ win, index }: { win: Win; index: number }) {
  const config = WIN_CONFIG[win.type] || WIN_CONFIG.placement;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl transition-all duration-300",
        "bg-gradient-to-r hover:shadow-md",
        index === 0 && "from-gold-50 to-gold-100/50 border border-gold-200",
        index !== 0 && "from-white to-charcoal-50 border border-charcoal-100"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
        config.color === 'forest' && "bg-gradient-forest text-white",
        config.color === 'gold' && "bg-gradient-gold text-charcoal-900",
        config.color === 'rust' && "bg-gradient-to-br from-rust-500 to-rust-600 text-white"
      )}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-charcoal-900 truncate">
          {win.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn(
            "text-xs font-medium",
            config.color === 'forest' && "text-forest-600",
            config.color === 'gold' && "text-gold-600",
            config.color === 'rust' && "text-rust-600"
          )}>
            {config.label}
          </span>
          <span className="text-xs text-charcoal-400">•</span>
          <span className="text-xs text-charcoal-500">
            {formatRelativeDate(win.date)}
          </span>
        </div>
      </div>
      {win.value && (
        <div className="text-right shrink-0">
          <span className="text-lg font-heading font-black text-charcoal-900">
            {formatValue(win.value)}
          </span>
        </div>
      )}
      {index === 0 && (
        <Sparkles className="w-5 h-5 text-gold-500 shrink-0 animate-pulse" />
      )}
    </div>
  );
}

export function WinsList({ definition, data, context }: SectionWidgetProps) {
  const winsData = data as WinsData | undefined;
  const isLoading = context?.isLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-100 rounded-lg animate-pulse" />
            <div className="h-6 w-40 bg-stone-200 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-stone-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const wins = winsData?.wins || [];

  return (
    <Card className="border-charcoal-100 shadow-elevation-sm overflow-hidden">
      <CardHeader className="pb-4 relative">
        {wins.length > 0 && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gold-200/30 to-transparent rounded-bl-full pointer-events-none" />
        )}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center shadow-sm">
              <PartyPopper className="w-5 h-5 text-charcoal-900" />
            </div>
            <div>
              <CardTitle className="text-lg font-heading font-bold text-charcoal-900">
                {(typeof definition.title === 'string' ? definition.title : 'Recent Wins') || 'Recent Wins'}
              </CardTitle>
              <p className="text-sm text-charcoal-500 mt-0.5">
                Last 30 days
              </p>
            </div>
          </div>
          {wins.length > 0 && (
            <span className="text-xs font-bold text-gold-600 bg-gold-50 px-3 py-1.5 rounded-full border border-gold-200">
              {wins.length} WINS
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {wins.length > 0 ? (
          <div className="space-y-3">
            {wins.map((win, index) => (
              <WinItem key={win.id} win={win} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-charcoal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-charcoal-400" />
            </div>
            <p className="text-sm font-medium text-charcoal-600">
              No wins yet this month
            </p>
            <p className="text-xs text-charcoal-400 mt-1">
              Keep pushing - your next win is coming!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WinsList;
