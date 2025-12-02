/**
 * Activity Feed
 *
 * Combined activity + event feed for entity detail pages.
 * Supports filtering, grouping by date, and infinite scroll.
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import {
  Filter, RefreshCw, ChevronDown, Calendar, Activity, Clock,
  CheckCircle, AlertCircle, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ActivityFeedItem, type FeedActivity } from './ActivityFeedItem';
import { EventFeedItem, type FeedEvent, type EventType } from './EventFeedItem';

// ==========================================
// TYPES
// ==========================================

type FeedItemType = 'activity' | 'event';
type FeedFilter = 'all' | 'activities' | 'events';

export interface FeedItem {
  type: FeedItemType;
  timestamp: string;
  data: FeedActivity | FeedEvent;
}

export interface ActivityFeedProps {
  /** Activity items */
  activities?: FeedActivity[];

  /** Event items */
  events?: FeedEvent[];

  /** Loading state */
  isLoading?: boolean;

  /** Loading more state */
  isLoadingMore?: boolean;

  /** Has more items to load */
  hasMore?: boolean;

  /** Load more callback */
  onLoadMore?: () => void;

  /** Refresh callback */
  onRefresh?: () => void;

  /** Activity click handler */
  onActivityClick?: (activity: FeedActivity) => void;

  /** Activity quick actions */
  onStartActivity?: (activity: FeedActivity) => void;
  onCompleteActivity?: (activity: FeedActivity) => void;
  onDeferActivity?: (activity: FeedActivity) => void;

  /** Entity click handler */
  onEntityClick?: (entity: FeedEvent['entity']) => void;

  /** Filter by pattern IDs */
  patternFilter?: string[];

  /** Filter by event types */
  eventTypeFilter?: EventType[];

  /** Filter by user IDs */
  userFilter?: string[];

  /** Date range filter */
  dateRange?: { from?: Date; to?: Date };

  /** Enable real-time updates */
  enableRealtime?: boolean;

  /** New items indicator */
  newItemsCount?: number;

  /** Show new items callback */
  onShowNewItems?: () => void;

  /** Additional className */
  className?: string;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getDateGroup(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return format(date, 'EEEE');
  return format(date, 'MMMM d, yyyy');
}

function groupByDate(items: FeedItem[]): Map<string, FeedItem[]> {
  const groups = new Map<string, FeedItem[]>();

  items.forEach(item => {
    const group = getDateGroup(item.timestamp);
    const existing = groups.get(group) || [];
    existing.push(item);
    groups.set(group, existing);
  });

  return groups;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function ActivityFeed({
  activities = [],
  events = [],
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  onRefresh,
  onActivityClick,
  onStartActivity,
  onCompleteActivity,
  onDeferActivity,
  onEntityClick,
  patternFilter,
  eventTypeFilter,
  userFilter,
  dateRange,
  enableRealtime = false,
  newItemsCount = 0,
  onShowNewItems,
  className,
}: ActivityFeedProps) {
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('all');
  const [localPatternFilter, setLocalPatternFilter] = useState<string[]>(patternFilter || []);
  const [localEventTypeFilter, setLocalEventTypeFilter] = useState<EventType[]>(eventTypeFilter || []);
  const [localDateRange, setLocalDateRange] = useState<{ from?: Date; to?: Date }>(dateRange || {});

  // Combine and sort all items
  const allItems = useMemo(() => {
    const items: FeedItem[] = [];

    // Add activities
    if (feedFilter !== 'events') {
      activities.forEach(activity => {
        // Apply pattern filter
        if (localPatternFilter.length > 0 && !localPatternFilter.includes(activity.patternId)) {
          return;
        }
        // Apply user filter
        if (userFilter && userFilter.length > 0 && activity.assignee && !userFilter.includes(activity.assignee.id)) {
          return;
        }
        // Apply date filter
        if (localDateRange.from && new Date(activity.createdAt) < localDateRange.from) {
          return;
        }
        if (localDateRange.to && new Date(activity.createdAt) > localDateRange.to) {
          return;
        }

        items.push({
          type: 'activity',
          timestamp: activity.createdAt,
          data: activity,
        });
      });
    }

    // Add events
    if (feedFilter !== 'activities') {
      events.forEach(event => {
        // Apply event type filter
        if (localEventTypeFilter.length > 0 && !localEventTypeFilter.includes(event.type)) {
          return;
        }
        // Apply user filter
        if (userFilter && userFilter.length > 0 && event.actor && event.actor.type === 'user' && !userFilter.includes(event.actor.id)) {
          return;
        }
        // Apply date filter
        if (localDateRange.from && new Date(event.timestamp) < localDateRange.from) {
          return;
        }
        if (localDateRange.to && new Date(event.timestamp) > localDateRange.to) {
          return;
        }

        items.push({
          type: 'event',
          timestamp: event.timestamp,
          data: event,
        });
      });
    }

    // Sort by timestamp descending
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [activities, events, feedFilter, localPatternFilter, localEventTypeFilter, userFilter, localDateRange]);

  // Group by date
  const groupedItems = useMemo(() => groupByDate(allItems), [allItems]);

  const hasActiveFilters = localPatternFilter.length > 0 ||
    localEventTypeFilter.length > 0 ||
    localDateRange.from ||
    localDateRange.to;

  const clearFilters = useCallback(() => {
    setLocalPatternFilter([]);
    setLocalEventTypeFilter([]);
    setLocalDateRange({});
  }, []);

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with filters */}
      <div className="flex items-center justify-between gap-4">
        {/* Feed type toggle */}
        <div className="flex items-center gap-2">
          <Select value={feedFilter} onValueChange={(v) => setFeedFilter(v as FeedFilter)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <span className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  All
                </span>
              </SelectItem>
              <SelectItem value="activities">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Activities
                </span>
              </SelectItem>
              <SelectItem value="events">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Events
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
                {hasActiveFilters && (
                  <Badge variant="secondary" className="h-5 w-5 p-0 justify-center">
                    !
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Event Types</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={localEventTypeFilter.includes('email_sent')}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setLocalEventTypeFilter([...localEventTypeFilter, 'email_sent', 'email_received']);
                  } else {
                    setLocalEventTypeFilter(localEventTypeFilter.filter(t => t !== 'email_sent' && t !== 'email_received'));
                  }
                }}
              >
                Emails
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={localEventTypeFilter.includes('call_made')}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setLocalEventTypeFilter([...localEventTypeFilter, 'call_made', 'call_received']);
                  } else {
                    setLocalEventTypeFilter(localEventTypeFilter.filter(t => t !== 'call_made' && t !== 'call_received'));
                  }
                }}
              >
                Calls
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={localEventTypeFilter.includes('status_changed')}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setLocalEventTypeFilter([...localEventTypeFilter, 'status_changed', 'stage_changed']);
                  } else {
                    setLocalEventTypeFilter(localEventTypeFilter.filter(t => t !== 'status_changed' && t !== 'stage_changed'));
                  }
                }}
              >
                Status Changes
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Date range filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="h-4 w-4" />
                {localDateRange.from || localDateRange.to
                  ? `${localDateRange.from ? format(localDateRange.from, 'MMM d') : ''} - ${localDateRange.to ? format(localDateRange.to, 'MMM d') : ''}`
                  : 'Date range'
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="range"
                selected={{
                  from: localDateRange.from,
                  to: localDateRange.to,
                }}
                onSelect={(range) => setLocalDateRange({
                  from: range?.from,
                  to: range?.to,
                })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* New items indicator */}
      {enableRealtime && newItemsCount > 0 && (
        <button
          onClick={onShowNewItems}
          className="w-full py-2 text-sm text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
        >
          {newItemsCount} new item{newItemsCount > 1 ? 's' : ''} - Click to load
        </button>
      )}

      {/* Feed content */}
      {allItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No activity to display</p>
          {hasActiveFilters && (
            <Button
              variant="link"
              size="sm"
              onClick={clearFilters}
              className="mt-2"
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(groupedItems.entries()).map(([dateGroup, items]) => (
            <div key={dateGroup}>
              {/* Date header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {dateGroup}
                </span>
                <Separator className="flex-1" />
              </div>

              {/* Items */}
              <div className="space-y-2">
                {items.map((item) => (
                  item.type === 'activity' ? (
                    <ActivityFeedItem
                      key={`activity-${(item.data as FeedActivity).id}`}
                      activity={item.data as FeedActivity}
                      onActivityClick={onActivityClick}
                      onStartActivity={onStartActivity}
                      onCompleteActivity={onCompleteActivity}
                      onDeferActivity={onDeferActivity}
                    />
                  ) : (
                    <EventFeedItem
                      key={`event-${(item.data as FeedEvent).id}`}
                      event={item.data as FeedEvent}
                      onEntityClick={onEntityClick}
                    />
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Load more
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default ActivityFeed;
