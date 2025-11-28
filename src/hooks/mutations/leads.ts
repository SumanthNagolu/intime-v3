/**
 * Lead Mutation Hooks
 *
 * React Query mutation hooks for CRM leads operations.
 *
 * Usage:
 * ```typescript
 * import { useCreateLead, useUpdateLeadStatus } from '@/hooks/mutations/leads';
 *
 * function LeadActions({ leadId }) {
 *   const updateStatus = useUpdateLeadStatus();
 *   const handleMarkHot = () => updateStatus.mutate({ id: leadId, status: 'hot' });
 * }
 * ```
 */

import { trpc } from '@/lib/trpc/client';
import type { CreateLeadInput, UpdateLeadInput } from '@/lib/validations/crm';

// ============================================
// CREATE LEAD
// ============================================

/**
 * Create a new lead
 */
export function useCreateLead() {
  const utils = trpc.useUtils();

  return trpc.crm.leads.create.useMutation({
    onSuccess: () => {
      utils.crm.leads.list.invalidate();
      utils.crm.leads.getStats.invalidate();
    },
  });
}

// ============================================
// UPDATE LEAD
// ============================================

/**
 * Update an existing lead
 */
export function useUpdateLead() {
  const utils = trpc.useUtils();

  return trpc.crm.leads.update.useMutation({
    onSuccess: (data) => {
      utils.crm.leads.list.invalidate();
      utils.crm.leads.getById.invalidate({ id: data.id });
      utils.crm.leads.getStats.invalidate();
    },
  });
}

/**
 * Update lead status (quick status change)
 */
export function useUpdateLeadStatus() {
  const utils = trpc.useUtils();

  return trpc.crm.leads.updateStatus.useMutation({
    onSuccess: (data, variables) => {
      utils.crm.leads.list.invalidate();
      utils.crm.leads.getById.invalidate({ id: variables.id });
      utils.crm.leads.getStats.invalidate();
      // Also refresh activities since status change creates an activity
      utils.crm.activities.list.invalidate({
        entityType: 'lead',
        entityId: variables.id,
      });
    },
  });
}

// ============================================
// DELETE LEAD
// ============================================

/**
 * Soft delete a lead
 */
export function useDeleteLead() {
  const utils = trpc.useUtils();

  return trpc.crm.leads.delete.useMutation({
    onSuccess: () => {
      utils.crm.leads.list.invalidate();
      utils.crm.leads.getStats.invalidate();
    },
  });
}

// ============================================
// CONVERT LEAD
// ============================================

/**
 * Convert lead to deal
 */
export function useConvertLead() {
  const utils = trpc.useUtils();

  return trpc.crm.leads.convertToDeal.useMutation({
    onSuccess: (data, variables) => {
      utils.crm.leads.list.invalidate();
      utils.crm.leads.getById.invalidate({ id: variables.leadId });
      utils.crm.leads.getStats.invalidate();
      utils.crm.deals.list.invalidate();
      // Also refresh activities
      utils.crm.activities.list.invalidate({
        entityType: 'lead',
        entityId: variables.leadId,
      });
    },
  });
}

// ============================================
// ACTIVITY MUTATIONS
// ============================================

/**
 * Create an activity for a lead
 */
export function useCreateLeadActivity() {
  const utils = trpc.useUtils();

  return trpc.crm.activities.create.useMutation({
    onSuccess: (data, variables) => {
      // Refresh activities list
      utils.crm.activities.list.invalidate({
        entityType: variables.entityType,
        entityId: variables.entityId,
      });
      // If it's a lead activity, also refresh the lead (lastContactedAt might change)
      if (variables.entityType === 'lead') {
        utils.crm.leads.getById.invalidate({ id: variables.entityId });
      }
    },
  });
}

// ============================================
// BANT UPDATES
// ============================================

/**
 * Update BANT scores for a lead
 */
export function useUpdateLeadBANT() {
  const utils = trpc.useUtils();

  return trpc.crm.leads.updateBANT.useMutation({
    onSuccess: (data, variables) => {
      utils.crm.leads.getById.invalidate({ id: variables.id });
      utils.crm.leads.list.invalidate();
    },
  });
}

// ============================================
// LEAD TASKS
// ============================================
// DEPRECATED: Lead Tasks
// These have been replaced by the unified activities system.
// Use hooks from '@/hooks/mutations/activities' instead:
//   - usePendingActivities('lead', leadId)
//   - useCreateActivity()
//   - useCompleteActivity()
//   - useCancelActivity()
// ============================================

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Invalidate all lead-related caches
 */
export function useInvalidateAllLeadData() {
  const utils = trpc.useUtils();

  return () => {
    utils.crm.leads.list.invalidate();
    utils.crm.leads.getStats.invalidate();
  };
}
