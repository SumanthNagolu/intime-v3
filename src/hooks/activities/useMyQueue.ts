/**
 * useMyQueue Hook
 *
 * Current user's activity queue with filtering and quick counts.
 */

import { useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import { isToday, isTomorrow, isPast, isThisWeek } from 'date-fns';
import { calculateSLAStatus } from '@/lib/activities/sla';
import type { ActivityStatus } from '@/lib/activities/transitions';
import type { Priority, SLAStatus } from '@/lib/activities/sla';

// ==========================================
// TYPES
// ==========================================

export interface QueueActivity {
  id: string;
  subject: string;
  description?: string;
  patternId: string;
  status: ActivityStatus;
  priority: Priority;
  dueAt?: string;
  createdAt: string;
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
  slaStatus?: SLAStatus;
}

export interface QueueCounts {
  total: number;
  pending: number;
  inProgress: number;
  overdue: number;
  dueToday: number;
  dueTomorrow: number;
  dueThisWeek: number;
  noDueDate: number;
  byPriority: Record<Priority, number>;
}

export interface UseMyQueueOptions {
  /** Include only specific statuses */
  statuses?: ActivityStatus[];

  /** Filter by pattern IDs */
  patternIds?: string[];

  /** Filter by entity type */
  entityType?: string;

  /** Enable real-time updates */
  enableRealtime?: boolean;
}

export interface UseMyQueueReturn {
  /** All activities in queue */
  activities: QueueActivity[];

  /** Today's activities */
  todayActivities: QueueActivity[];

  /** Overdue activities */
  overdueActivities: QueueActivity[];

  /** Due this week */
  thisWeekActivities: QueueActivity[];

  /** Quick counts */
  counts: QueueCounts;

  /** Loading state */
  isLoading: boolean;

  /** Error state */
  error: Error | null;

  /** Refetch */
  refetch: () => void;
}

// ==========================================
// HOOK
// ==========================================

export function useMyQueue(options: UseMyQueueOptions = {}): UseMyQueueReturn {
  const {
    statuses = ['pending', 'in_progress'],
    patternIds,
    entityType,
    enableRealtime = false,
  } = options;

  // Fetch overdue activities (which includes user's queue)
  const overdueQuery = trpc.activities.overdue.useQuery(
    {
      entityType: entityType as 'lead' | 'deal' | 'account' | 'candidate' | 'submission' | 'job' | 'poc' | undefined,
      limit: 100,
    },
    {
      staleTime: enableRealtime ? 0 : 30000,
    }
  );

  // Transform and categorize activities
  const processedData = useMemo(() => {
    if (!overdueQuery.data) {
      return {
        activities: [] as QueueActivity[],
        todayActivities: [] as QueueActivity[],
        overdueActivities: [] as QueueActivity[],
        thisWeekActivities: [] as QueueActivity[],
        counts: {
          total: 0,
          pending: 0,
          inProgress: 0,
          overdue: 0,
          dueToday: 0,
          dueTomorrow: 0,
          dueThisWeek: 0,
          noDueDate: 0,
          byPriority: {
            critical: 0,
            urgent: 0,
            high: 0,
            normal: 0,
            low: 0,
          },
        } as QueueCounts,
      };
    }

    let activities = (overdueQuery.data as unknown as QueueActivity[]).map(activity => ({
      ...activity,
      slaStatus: activity.dueAt
        ? calculateSLAStatus(activity.dueAt, activity.priority)
        : undefined,
    }));

    // Filter by statuses
    if (statuses.length > 0) {
      activities = activities.filter(a => statuses.includes(a.status));
    }

    // Filter by pattern IDs
    if (patternIds && patternIds.length > 0) {
      activities = activities.filter(a => patternIds.includes(a.patternId));
    }

    // Sort by priority and due date
    activities.sort((a, b) => {
      // Overdue first
      const aOverdue = a.dueAt && isPast(new Date(a.dueAt)) ? 0 : 1;
      const bOverdue = b.dueAt && isPast(new Date(b.dueAt)) ? 0 : 1;
      if (aOverdue !== bOverdue) return aOverdue - bOverdue;

      // Then by priority
      const priorityOrder = { critical: 0, urgent: 1, high: 2, normal: 3, low: 4 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by due date
      if (a.dueAt && b.dueAt) {
        return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
      }
      return a.dueAt ? -1 : 1;
    });

    // Categorize
    const todayActivities = activities.filter(a =>
      a.dueAt && isToday(new Date(a.dueAt))
    );

    const overdueActivities = activities.filter(a =>
      a.dueAt && isPast(new Date(a.dueAt)) && !isToday(new Date(a.dueAt))
    );

    const thisWeekActivities = activities.filter(a =>
      a.dueAt && isThisWeek(new Date(a.dueAt))
    );

    // Calculate counts
    const counts: QueueCounts = {
      total: activities.length,
      pending: activities.filter(a => a.status === 'pending').length,
      inProgress: activities.filter(a => a.status === 'in_progress').length,
      overdue: overdueActivities.length,
      dueToday: todayActivities.length,
      dueTomorrow: activities.filter(a => a.dueAt && isTomorrow(new Date(a.dueAt))).length,
      dueThisWeek: thisWeekActivities.length,
      noDueDate: activities.filter(a => !a.dueAt).length,
      byPriority: {
        critical: activities.filter(a => a.priority === 'critical').length,
        urgent: activities.filter(a => a.priority === 'urgent').length,
        high: activities.filter(a => a.priority === 'high').length,
        normal: activities.filter(a => a.priority === 'normal').length,
        low: activities.filter(a => a.priority === 'low').length,
      },
    };

    return {
      activities,
      todayActivities,
      overdueActivities,
      thisWeekActivities,
      counts,
    };
  }, [overdueQuery.data, statuses, patternIds]);

  return {
    ...processedData,
    isLoading: overdueQuery.isLoading,
    error: overdueQuery.error as Error | null,
    refetch: overdueQuery.refetch,
  };
}

export default useMyQueue;
