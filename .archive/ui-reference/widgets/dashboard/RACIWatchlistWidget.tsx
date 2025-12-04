'use client';

/**
 * RACI Watchlist Widget
 *
 * Shows items where the user is Consulted (C) or Informed (I) in RACI assignments.
 * Helps track entities the user should be aware of without being directly responsible.
 */

import React from 'react';
import { Eye, Briefcase, Users, Building2, DollarSign, ChevronRight, Bell } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface WatchlistItem {
  id: string;
  entityType: 'job' | 'submission' | 'account' | 'deal';
  entityId: string;
  title: string;
  subtitle?: string;
  raciRole: 'C' | 'I';
  lastActivityAt: string | Date;
  hasNewActivity: boolean;
  assignedTo?: string;
}

interface WatchlistData {
  items: WatchlistItem[];
  totalCount: number;
}

const ENTITY_CONFIG: Record<string, { icon: React.ElementType; color: string; href: string }> = {
  job: { icon: Briefcase, color: 'forest', href: '/employee/recruiting/jobs' },
  submission: { icon: Users, color: 'rust', href: '/employee/recruiting/submissions' },
  account: { icon: Building2, color: 'gold', href: '/employee/recruiting/accounts' },
  deal: { icon: DollarSign, color: 'charcoal', href: '/employee/recruiting/deals' },
};

const RACI_BADGES: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  C: { label: 'Consulted', variant: 'secondary' },
  I: { label: 'Informed', variant: 'outline' },
};

function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

function WatchlistItemRow({ item }: { item: WatchlistItem }) {
  const config = ENTITY_CONFIG[item.entityType] || ENTITY_CONFIG.job;
  const raciBadge = RACI_BADGES[item.raciRole];
  const Icon = config.icon;

  return (
    <Link
      href={`${config.href}/${item.entityId}`}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-charcoal-50 transition-colors group"
    >
      <div className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 relative",
        config.color === 'forest' && "bg-forest-100 text-forest-600",
        config.color === 'rust' && "bg-rust-100 text-rust-600",
        config.color === 'gold' && "bg-gold-100 text-gold-600",
        config.color === 'charcoal' && "bg-charcoal-100 text-charcoal-600"
      )}>
        <Icon className="w-4 h-4" />
        {item.hasNewActivity && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-error-500 rounded-full border-2 border-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-charcoal-900 truncate">
            {item.title}
          </p>
          <Badge variant={raciBadge.variant} className="text-[10px] px-1.5 py-0 h-4">
            {raciBadge.label}
          </Badge>
        </div>
        <p className="text-xs text-charcoal-500 truncate">
          {item.subtitle || `Updated ${formatRelativeTime(item.lastActivityAt)}`}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-charcoal-300 group-hover:text-charcoal-500 transition-colors shrink-0" />
    </Link>
  );
}

export function RACIWatchlistWidget({ definition, data, context }: SectionWidgetProps) {
  const watchlistData = data as WatchlistData | undefined;
  const isLoading = context?.isLoading;
  const maxItems = (definition.componentProps?.maxItems as number) || 8;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-charcoal-100 rounded-lg animate-pulse" />
            <div className="h-5 w-32 bg-charcoal-100 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-charcoal-50 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const items = watchlistData?.items?.slice(0, maxItems) || [];
  const totalCount = watchlistData?.totalCount || 0;
  const hasNewActivity = items.some(item => item.hasNewActivity);

  if (items.length === 0) {
    return (
      <Card className="border-charcoal-100">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-charcoal-100 rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-charcoal-500" />
            </div>
            <CardTitle className="text-base font-heading font-semibold text-charcoal-900">
              RACI Watchlist
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Bell className="w-8 h-8 text-charcoal-300 mx-auto mb-2" />
            <p className="text-sm text-charcoal-500">No items to watch</p>
            <p className="text-xs text-charcoal-400 mt-1">
              Items where you are Consulted or Informed will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-charcoal-100 shadow-elevation-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              hasNewActivity ? "bg-forest-100 text-forest-600" : "bg-charcoal-100 text-charcoal-500"
            )}>
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-heading font-semibold text-charcoal-900">
                {typeof definition.title === 'string' ? definition.title : 'RACI Watchlist'}
              </CardTitle>
              {typeof definition.description === 'string' && (
                <p className="text-xs text-charcoal-500">{definition.description}</p>
              )}
            </div>
          </div>
          {totalCount > maxItems && (
            <Link
              href="/employee/workspace/watchlist"
              className="text-xs font-semibold text-forest-600 hover:text-forest-700"
            >
              View All ({totalCount})
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-1">
          {items.map((item) => (
            <WatchlistItemRow key={`${item.entityType}-${item.entityId}`} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default RACIWatchlistWidget;
