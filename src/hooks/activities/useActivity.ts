/**
 * useActivity Hook
 *
 * Single activity management with real-time updates and optimistic mutations.
 */

import { useMemo, useCallback } from 'react';
import { trpc } from '@/lib/trpc/client';
import type { ActivityStatus } from '@/lib/activities/transitions';
import type { Priority } from '@/lib/activities/sla';

// ==========================================
// TYPES
// ==========================================

export interface Activity {
  id: string;
  subject: string;
  description?: string;
  patternId: string;
  status: ActivityStatus;
  priority: Priority;
  dueAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  assigneeId?: string;
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  entityType: string;
  entityId: string;
  entity?: {
    type: string;
    id: string;
    name: string;
    url: string;
  };
  checklist?: Array<{
    id: string;
    label: string;
    completed: boolean;
    required: boolean;
    completedAt?: string;
  }>;
  outcome?: string;
  outcomeNotes?: string;
  customFields?: Record<string, unknown>;
}

export interface UseActivityOptions {
  /** Enable real-time subscription */
  enableRealtime?: boolean;

  /** Include history on initial fetch */
  includeHistory?: boolean;

  /** Include comments on initial fetch */
  includeComments?: boolean;
}

export interface UseActivityReturn {
  /** Activity data */
  activity: Activity | null;

  /** Loading state */
  isLoading: boolean;

  /** Error state */
  error: Error | null;

  /** Refetch activity */
  refetch: () => void;

  /** Optimistic updates */
  updateOptimistically: (updates: Partial<Activity>) => void;

  /** History (lazy loaded) */
  history: {
    data: unknown[];
    isLoading: boolean;
    load: () => void;
  };

  /** Comments (lazy loaded) */
  comments: {
    data: unknown[];
    isLoading: boolean;
    load: () => void;
  };
}

// ==========================================
// HOOK
// ==========================================

export function useActivity(
  activityId: string | undefined,
  options: UseActivityOptions = {}
): UseActivityReturn {
  const {
    enableRealtime = false,
    includeHistory = false,
    includeComments = false,
  } = options;

  const utils = trpc.useUtils();

  // Main activity query
  const activityQuery = trpc.activities.get.useQuery(
    { id: activityId! },
    {
      enabled: !!activityId,
      staleTime: enableRealtime ? 0 : 30000,
    }
  );

  // History query (lazy) - disabled for now as endpoint doesn't exist
  const historyQuery = undefined;

  // Comments query (lazy) - disabled for now as endpoint doesn't exist
  const commentsQuery = undefined;

  // Optimistic update helper
  const updateOptimistically = useCallback((updates: Partial<Activity>) => {
    if (!activityId) return;

    utils.activities.get.setData({ id: activityId }, (old) => {
      if (!old) return old;
      return { ...old, ...updates } as typeof old;
    });
  }, [activityId, utils]);

  // Lazy load history - disabled for now
  const loadHistory = useCallback(() => {
    // History endpoint not yet implemented
  }, []);

  // Lazy load comments - disabled for now
  const loadComments = useCallback(() => {
    // Comments endpoint not yet implemented
  }, []);

  // Transform activity data
  const activity = useMemo(() => {
    if (!activityQuery.data) return null;
    return activityQuery.data as unknown as Activity;
  }, [activityQuery.data]);

  return {
    activity,
    isLoading: activityQuery.isLoading,
    error: activityQuery.error as Error | null,
    refetch: activityQuery.refetch,
    updateOptimistically,
    history: {
      data: [],
      isLoading: false,
      load: loadHistory,
    },
    comments: {
      data: [],
      isLoading: false,
      load: loadComments,
    },
  };
}

export default useActivity;
