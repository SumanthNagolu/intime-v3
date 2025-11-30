/**
 * Deal Mutation Hooks
 *
 * React Query mutation hooks for CRM deals operations.
 *
 * Usage:
 * ```typescript
 * import { useUpdateDeal, useUpdateDealStage } from '@/hooks/mutations/deals';
 *
 * function DealActions({ dealId }) {
 *   const updateStage = useUpdateDealStage();
 *   const handleAdvance = () => updateStage.mutate({ id: dealId, stage: 'proposal' });
 * }
 * ```
 */

import { trpc } from '@/lib/trpc/client';

// ============================================
// CREATE DEAL
// ============================================

/**
 * Create a new deal
 */
export function useCreateDeal() {
  const utils = trpc.useUtils();

  return trpc.crm.deals.create.useMutation({
    onSuccess: () => {
      utils.crm.deals.list.invalidate();
      utils.crm.deals.pipelineSummary.invalidate();
    },
  });
}

// ============================================
// UPDATE DEAL
// ============================================

/**
 * Update an existing deal
 */
export function useUpdateDeal() {
  const utils = trpc.useUtils();

  return trpc.crm.deals.update.useMutation({
    onSuccess: (data) => {
      utils.crm.deals.list.invalidate();
      utils.crm.deals.getById.invalidate({ id: data.id });
      utils.crm.deals.pipelineSummary.invalidate();
    },
  });
}

/**
 * Update deal stage (quick stage change)
 */
export function useUpdateDealStage() {
  const utils = trpc.useUtils();

  return trpc.crm.deals.update.useMutation({
    onSuccess: (data, variables) => {
      utils.crm.deals.list.invalidate();
      utils.crm.deals.getById.invalidate({ id: variables.id });
      utils.crm.deals.pipelineSummary.invalidate();
      // Refresh activities since stage change may create an activity
      utils.activities.list.invalidate({
        entityType: 'deal',
        entityId: variables.id,
      });
    },
  });
}

// ============================================
// CLOSE DEAL
// ============================================

/**
 * Close deal as won
 */
export function useCloseDealWon() {
  const utils = trpc.useUtils();

  return trpc.crm.deals.update.useMutation({
    onSuccess: (data, variables) => {
      utils.crm.deals.list.invalidate();
      utils.crm.deals.getById.invalidate({ id: variables.id });
      utils.crm.deals.pipelineSummary.invalidate();
    },
  });
}

/**
 * Close deal as lost
 */
export function useCloseDealLost() {
  const utils = trpc.useUtils();

  return trpc.crm.deals.update.useMutation({
    onSuccess: (data, variables) => {
      utils.crm.deals.list.invalidate();
      utils.crm.deals.getById.invalidate({ id: variables.id });
      utils.crm.deals.pipelineSummary.invalidate();
    },
  });
}

// ============================================
// ACTIVITY MUTATIONS FOR DEALS
// ============================================

/**
 * Create an activity for a deal
 */
export function useCreateDealActivity() {
  const utils = trpc.useUtils();

  return trpc.activities.create.useMutation({
    onSuccess: (data, variables) => {
      // Refresh activities list
      utils.activities.list.invalidate({
        entityType: 'deal',
        entityId: variables.entityId,
      });
    },
  });
}

// ============================================
// DEAL ACTIVITIES (using unified activities)
// ============================================

/**
 * Get all activities for a deal
 */
export function useDealActivities(dealId: string, includeCompleted = true) {
  return trpc.activities.list.useQuery(
    {
      entityType: 'deal',
      entityId: dealId,
      includeCompleted,
      limit: 50,
      offset: 0,
    },
    { enabled: !!dealId }
  );
}

/**
 * Get pending tasks/follow-ups for a deal
 */
export function useDealPendingTasks(dealId: string) {
  return trpc.activities.pending.useQuery(
    {
      entityType: 'deal',
      entityId: dealId,
    },
    { enabled: !!dealId }
  );
}

/**
 * Get all tasks for a deal (including completed)
 */
export function useDealTasks(dealId: string) {
  return trpc.activities.list.useQuery(
    {
      entityType: 'deal',
      entityId: dealId,
      activityTypes: ['task', 'follow_up'],
      includeCompleted: true,
      limit: 100,
      offset: 0,
    },
    { enabled: !!dealId }
  );
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Invalidate all deal-related caches
 */
export function useInvalidateAllDealData() {
  const utils = trpc.useUtils();

  return () => {
    utils.crm.deals.list.invalidate();
    utils.crm.deals.pipelineSummary.invalidate();
  };
}
