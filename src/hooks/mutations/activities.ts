/**
 * Unified Activities Hooks
 * 
 * React hooks for the unified activities API.
 * Replaces both activity log and lead tasks hooks.
 */

import { trpc } from '@/lib/trpc/client';
import type {
  ActivityType,
} from '@/lib/db/schema/activities';

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Get activities for an entity
 */
export function useActivities(
  entityType: string,
  entityId: string,
  options?: {
    includeCompleted?: boolean;
    activityTypes?: ActivityType[];
    limit?: number;
    offset?: number;
  }
) {
  return trpc.activities.list.useQuery(
    {
      entityType: entityType as 'lead' | 'deal' | 'account' | 'candidate' | 'submission' | 'job' | 'poc',
      entityId,
      includeCompleted: options?.includeCompleted ?? true,
      activityTypes: options?.activityTypes,
      limit: options?.limit ?? 50,
      offset: options?.offset ?? 0,
    },
    { enabled: !!entityId }
  );
}

/**
 * Get pending activities (tasks, follow-ups) for an entity
 */
export function usePendingActivities(entityType: string, entityId: string) {
  return trpc.activities.pending.useQuery(
    {
      entityType: entityType as 'lead' | 'deal' | 'account' | 'candidate' | 'submission' | 'job' | 'poc',
      entityId,
    },
    { enabled: !!entityId }
  );
}

/**
 * Get overdue activities
 */
export function useOverdueActivities(entityType?: string, limit?: number) {
  return trpc.activities.overdue.useQuery({
    entityType: entityType as 'lead' | 'deal' | 'account' | 'candidate' | 'submission' | 'job' | 'poc' | undefined,
    limit: limit ?? 20,
  });
}

/**
 * Get single activity by ID
 */
export function useActivity(activityId: string) {
  return trpc.activities.get.useQuery(
    { id: activityId },
    { enabled: !!activityId }
  );
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Create a new activity
 */
export function useCreateActivity() {
  const utils = trpc.useUtils();

  return trpc.activities.create.useMutation({
    onSuccess: (data) => {
      utils.activities.list.invalidate({
        entityType: data.entityType as 'lead',
        entityId: data.entityId,
      });
      utils.activities.pending.invalidate({
        entityType: data.entityType as 'lead',
        entityId: data.entityId,
      });
    },
  });
}

/**
 * Log a completed activity (email, call, meeting, note)
 * Convenience hook that creates with status='completed'
 */
export function useLogActivity() {
  const utils = trpc.useUtils();

  return trpc.activities.log.useMutation({
    onSuccess: (data) => {
      utils.activities.list.invalidate({
        entityType: data.activity.entityType as 'lead',
        entityId: data.activity.entityId,
      });
      utils.activities.pending.invalidate({
        entityType: data.activity.entityType as 'lead',
        entityId: data.activity.entityId,
      });
    },
  });
}

/**
 * Update an activity
 */
export function useUpdateActivity() {
  const utils = trpc.useUtils();

  return trpc.activities.update.useMutation({
    onSuccess: (data) => {
      utils.activities.list.invalidate({
        entityType: data.entityType as 'lead',
        entityId: data.entityId,
      });
      utils.activities.pending.invalidate({
        entityType: data.entityType as 'lead',
        entityId: data.entityId,
      });
      utils.activities.get.invalidate({ id: data.id });
    },
  });
}

/**
 * Complete an activity
 */
export function useCompleteActivity() {
  const utils = trpc.useUtils();

  return trpc.activities.complete.useMutation({
    onSuccess: (data) => {
      utils.activities.list.invalidate({
        entityType: data.activity.entityType as 'lead',
        entityId: data.activity.entityId,
      });
      utils.activities.pending.invalidate({
        entityType: data.activity.entityType as 'lead',
        entityId: data.activity.entityId,
      });
      utils.activities.overdue.invalidate();
    },
  });
}

/**
 * Skip an activity
 */
export function useSkipActivity() {
  const utils = trpc.useUtils();

  return trpc.activities.skip.useMutation({
    onSuccess: (data) => {
      utils.activities.list.invalidate({
        entityType: data.entityType as 'lead',
        entityId: data.entityId,
      });
      utils.activities.pending.invalidate({
        entityType: data.entityType as 'lead',
        entityId: data.entityId,
      });
      utils.activities.overdue.invalidate();
    },
  });
}

/**
 * Cancel an activity
 */
export function useCancelActivity() {
  const utils = trpc.useUtils();

  return trpc.activities.cancel.useMutation({
    onSuccess: (data) => {
      utils.activities.list.invalidate({
        entityType: data.entityType as 'lead',
        entityId: data.entityId,
      });
      utils.activities.pending.invalidate({
        entityType: data.entityType as 'lead',
        entityId: data.entityId,
      });
      utils.activities.overdue.invalidate();
    },
  });
}

/**
 * Delete an activity (soft delete via cancel)
 */
export function useDeleteActivity(entityType: string, entityId: string) {
  const utils = trpc.useUtils();

  return trpc.activities.delete.useMutation({
    onSuccess: () => {
      utils.activities.list.invalidate({
        entityType: entityType as 'lead',
        entityId,
      });
      utils.activities.pending.invalidate({
        entityType: entityType as 'lead',
        entityId,
      });
    },
  });
}

/**
 * Reschedule an activity
 */
export function useRescheduleActivity() {
  const utils = trpc.useUtils();

  return trpc.activities.reschedule.useMutation({
    onSuccess: (data) => {
      utils.activities.list.invalidate({
        entityType: data.entityType as 'lead',
        entityId: data.entityId,
      });
      utils.activities.pending.invalidate({
        entityType: data.entityType as 'lead',
        entityId: data.entityId,
      });
      utils.activities.overdue.invalidate();
    },
  });
}

// ============================================
// CONVENIENCE HOOKS FOR LEADS
// ============================================

/**
 * Get all activities for a lead
 */
export function useLeadActivities(leadId: string, includeCompleted = true) {
  return useActivities('lead', leadId, { includeCompleted });
}

/**
 * Get pending tasks/follow-ups for a lead
 */
export function useLeadPendingTasks(leadId: string) {
  return usePendingActivities('lead', leadId);
}

/**
 * Create activity for a lead (alias for legacy code)
 */
export function useCreateLeadActivity() {
  return useLogActivity();
}












