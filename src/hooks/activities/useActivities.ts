/**
 * useActivities Hook
 *
 * Activity list management with filtering, sorting, and grouping.
 */

import { useMemo, useCallback, useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import type { ActivityStatus } from '@/lib/activities/transitions';
import type { Priority } from '@/lib/activities/sla';
import { calculateSLAStatus } from '@/lib/activities/sla';

// ==========================================
// TYPES
// ==========================================

export interface ActivityListItem {
  id: string;
  subject: string;
  description?: string;
  patternId: string;
  status: ActivityStatus;
  priority: Priority;
  dueAt?: string;
  completedAt?: string;
  createdAt: string;
  assigneeId?: string;
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  entityType: string;
  entityId: string;
  entity?: {
    type: string;
    id: string;
    name: string;
  };
  checklistProgress?: {
    completed: number;
    total: number;
  };
}

export type SortField = 'dueAt' | 'priority' | 'createdAt' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';
export type GroupBy = 'status' | 'date' | 'entity' | 'assignee' | 'pattern' | 'none';

export interface ActivitiesFilters {
  /** Filter by status */
  status?: ActivityStatus[];

  /** Filter by assignee IDs */
  assigneeIds?: string[];

  /** Filter by entity type */
  entityType?: string;

  /** Filter by entity ID */
  entityId?: string;

  /** Filter by pattern IDs */
  patternIds?: string[];

  /** Filter by priority */
  priority?: Priority[];

  /** Date range filter */
  dateRange?: {
    from?: Date;
    to?: Date;
  };

  /** Search query */
  search?: string;

  /** Include completed activities */
  includeCompleted?: boolean;
}

export interface UseActivitiesOptions {
  /** Filters */
  filters?: ActivitiesFilters;

  /** Sort field */
  sortBy?: SortField;

  /** Sort direction */
  sortDirection?: SortDirection;

  /** Group activities by */
  groupBy?: GroupBy;

  /** Page size for pagination */
  pageSize?: number;

  /** Enable infinite scroll */
  infiniteScroll?: boolean;

  /** Enable real-time updates */
  enableRealtime?: boolean;
}

export interface ActivityGroup {
  key: string;
  label: string;
  activities: ActivityListItem[];
  count: number;
}

export interface UseActivitiesReturn {
  /** All activities (flat list) */
  activities: ActivityListItem[];

  /** Grouped activities */
  groupedActivities: ActivityGroup[];

  /** Total count */
  totalCount: number;

  /** Loading state */
  isLoading: boolean;

  /** Loading more state */
  isLoadingMore: boolean;

  /** Error state */
  error: Error | null;

  /** Has more pages */
  hasMore: boolean;

  /** Load next page */
  loadMore: () => void;

  /** Refetch */
  refetch: () => void;

  /** Update filters */
  setFilters: (filters: ActivitiesFilters) => void;

  /** Update sort */
  setSort: (field: SortField, direction: SortDirection) => void;

  /** Update grouping */
  setGroupBy: (groupBy: GroupBy) => void;
}

// ==========================================
// HELPERS
// ==========================================

function groupActivities(
  activities: ActivityListItem[],
  groupBy: GroupBy
): ActivityGroup[] {
  if (groupBy === 'none') {
    return [{
      key: 'all',
      label: 'All Activities',
      activities,
      count: activities.length,
    }];
  }

  const groups = new Map<string, ActivityListItem[]>();

  activities.forEach(activity => {
    let key: string;
    let label: string;

    switch (groupBy) {
      case 'status':
        key = activity.status;
        label = activity.status.replace('_', ' ').toUpperCase();
        break;

      case 'date':
        if (activity.dueAt) {
          const due = new Date(activity.dueAt);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const nextWeek = new Date(today);
          nextWeek.setDate(nextWeek.getDate() + 7);

          if (due < today) {
            key = 'overdue';
            label = 'Overdue';
          } else if (due < tomorrow) {
            key = 'today';
            label = 'Today';
          } else if (due < nextWeek) {
            key = 'this_week';
            label = 'This Week';
          } else {
            key = 'later';
            label = 'Later';
          }
        } else {
          key = 'no_due_date';
          label = 'No Due Date';
        }
        break;

      case 'entity':
        key = `${activity.entityType}_${activity.entityId}`;
        label = activity.entity?.name || activity.entityId;
        break;

      case 'assignee':
        key = activity.assigneeId || 'unassigned';
        label = activity.assignee?.name || 'Unassigned';
        break;

      case 'pattern':
        key = activity.patternId;
        label = activity.patternId.replace('_', ' ');
        break;

      default:
        key = 'all';
        label = 'All';
    }

    const existing = groups.get(key) || [];
    existing.push(activity);
    groups.set(key, existing);
  });

  return Array.from(groups.entries()).map(([key, items]) => ({
    key,
    label: key === items[0]?.assignee?.name ? items[0].assignee.name :
           key === items[0]?.entity?.name ? items[0].entity.name :
           key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    activities: items,
    count: items.length,
  }));
}

// ==========================================
// HOOK
// ==========================================

export function useActivities(options: UseActivitiesOptions = {}): UseActivitiesReturn {
  const {
    filters: initialFilters = {},
    sortBy: initialSortBy = 'dueAt',
    sortDirection: initialSortDirection = 'asc',
    groupBy: initialGroupBy = 'none',
    pageSize = 50,
    infiniteScroll = false,
    enableRealtime = false,
  } = options;

  const [filters, setFilters] = useState<ActivitiesFilters>(initialFilters);
  const [sortBy, setSortBy] = useState<SortField>(initialSortBy);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection);
  const [groupBy, setGroupBy] = useState<GroupBy>(initialGroupBy);
  const [page, setPage] = useState(0);

  // Build query params - with required types
  const queryParams = useMemo(() => {
    if (!filters.entityType || !filters.entityId) {
      return {
        entityType: 'lead' as const,
        entityId: '',
        includeCompleted: true,
        limit: pageSize,
        offset: page * pageSize,
      };
    }
    return {
      entityType: filters.entityType as 'lead' | 'deal' | 'account' | 'candidate' | 'submission' | 'job' | 'poc',
      entityId: filters.entityId,
      includeCompleted: filters.includeCompleted ?? true,
      limit: pageSize,
      offset: page * pageSize,
    };
  }, [filters, pageSize, page]);

  // Main query
  const query = trpc.activities.list.useQuery(queryParams, {
    enabled: !!(filters.entityType && filters.entityId),
    staleTime: enableRealtime ? 0 : 30000,
  });

  // Transform and filter activities
  const activities = useMemo(() => {
    if (!query.data) return [];

    let result = query.data as unknown as ActivityListItem[];

    // Apply additional filters
    if (filters.status && filters.status.length > 0) {
      result = result.filter(a => filters.status!.includes(a.status));
    }

    if (filters.assigneeIds && filters.assigneeIds.length > 0) {
      result = result.filter(a => a.assigneeId && filters.assigneeIds!.includes(a.assigneeId));
    }

    if (filters.patternIds && filters.patternIds.length > 0) {
      result = result.filter(a => filters.patternIds!.includes(a.patternId));
    }

    if (filters.priority && filters.priority.length > 0) {
      result = result.filter(a => filters.priority!.includes(a.priority));
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(a =>
        a.subject.toLowerCase().includes(search) ||
        a.description?.toLowerCase().includes(search)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'dueAt':
          const aDue = a.dueAt ? new Date(a.dueAt).getTime() : Infinity;
          const bDue = b.dueAt ? new Date(b.dueAt).getTime() : Infinity;
          comparison = aDue - bDue;
          break;

        case 'priority':
          const priorityOrder = { critical: 0, urgent: 1, high: 2, normal: 3, low: 4 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;

        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;

        case 'updatedAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [query.data, filters, sortBy, sortDirection]);

  // Group activities
  const groupedActivities = useMemo(() =>
    groupActivities(activities, groupBy),
    [activities, groupBy]
  );

  // Load more for infinite scroll
  const loadMore = useCallback(() => {
    if (infiniteScroll && !query.isFetching) {
      setPage(p => p + 1);
    }
  }, [infiniteScroll, query.isFetching]);

  // Set sort
  const setSort = useCallback((field: SortField, direction: SortDirection) => {
    setSortBy(field);
    setSortDirection(direction);
  }, []);

  return {
    activities,
    groupedActivities,
    totalCount: activities.length,
    isLoading: query.isLoading,
    isLoadingMore: query.isFetching && page > 0,
    error: query.error as Error | null,
    hasMore: (query.data?.length ?? 0) >= pageSize,
    loadMore,
    refetch: query.refetch,
    setFilters,
    setSort,
    setGroupBy,
  };
}

export default useActivities;
