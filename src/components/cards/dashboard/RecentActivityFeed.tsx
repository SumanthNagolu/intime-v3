'use client';

import * as React from 'react';
import { RefreshCw, Filter, ChevronRight, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ActivityListItem } from '../list/ActivityListItem';
import type { ActivityData } from '../types';

interface RecentActivityFeedProps {
  title?: string;
  activities: ActivityData[];
  filterTypes?: string[];
  maxItems?: number;
  showRealTimeIndicator?: boolean;
  viewAllHref?: string;
  onFilterChange?: (type: string | null) => void;
  onActivityClick?: (activity: ActivityData) => void;
  onActivityComplete?: (activity: ActivityData) => void;
  onRefresh?: () => void;
  loading?: boolean;
  className?: string;
}

export function RecentActivityFeed({
  title = 'Recent Activity',
  activities,
  filterTypes = ['call', 'email', 'meeting', 'note', 'task'],
  maxItems = 10,
  showRealTimeIndicator = true,
  viewAllHref,
  onFilterChange,
  onActivityClick,
  onActivityComplete,
  onRefresh,
  loading = false,
  className,
}: RecentActivityFeedProps) {
  const [selectedFilter, setSelectedFilter] = React.useState<string | null>(null);

  const filteredActivities = selectedFilter
    ? activities.filter((a) => a.patternName.toLowerCase() === selectedFilter)
    : activities;

  const displayedActivities = filteredActivities.slice(0, maxItems);

  const handleFilterChange = (type: string | null) => {
    setSelectedFilter(type);
    if (onFilterChange) {
      onFilterChange(type);
    }
  };

  // Group activities by date
  const groupedActivities = React.useMemo(() => {
    const groups: { [key: string]: ActivityData[] } = {};

    displayedActivities.forEach((activity) => {
      const date = new Date(activity.dueDate || new Date()).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });

    return groups;
  }, [displayedActivities]);

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {showRealTimeIndicator && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <Wifi className="h-3 w-3" />
              <span>Live</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8">
                <Filter className="h-4 w-4 mr-1" />
                {selectedFilter || 'All'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleFilterChange(null)}>
                All
              </DropdownMenuItem>
              {filterTypes.map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => handleFilterChange(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Refresh button */}
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3 p-2">
                <div className="h-8 w-8 bg-charcoal-200 rounded-md" />
                <div className="flex-1">
                  <div className="h-4 bg-charcoal-200 rounded w-3/4 mb-1" />
                  <div className="h-3 bg-charcoal-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedActivities.length === 0 ? (
          <div className="text-center py-8 text-charcoal-500">
            <p className="text-sm">No recent activities</p>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2">
            {Object.entries(groupedActivities).map(([date, items]) => (
              <div key={date}>
                <p className="text-xs font-medium text-charcoal-400 mb-2">
                  {date}
                </p>
                <div className="space-y-1">
                  {items.map((activity) => (
                    <ActivityListItem
                      key={activity.id}
                      data={activity}
                      onClick={() => onActivityClick?.(activity)}
                      onComplete={() => onActivityComplete?.(activity)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View all link */}
        {viewAllHref && displayedActivities.length > 0 && (
          <a
            href={viewAllHref}
            className="flex items-center justify-center gap-1 mt-4 pt-2 border-t border-charcoal-100 text-sm text-blue-600 hover:underline"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}

export default RecentActivityFeed;
