/**
 * Candidates Mutation Hooks
 *
 * React Query hooks for candidate/consultant-related mutations.
 * Uses bench.consultants router for bench operations.
 */

import { trpc } from '@/lib/trpc/client';
import { useInvalidateCandidates } from '../queries/candidates';

// ============================================
// CREATE HOOK
// ============================================

export interface CreateConsultantInput {
  userProfileId: string;
  benchStartDate?: Date;
  benchStatus?: 'bench' | 'marketing' | 'interview_process' | 'offer_stage';
  targetRate?: number;
  preferredLocations?: string[];
  notes?: string;
}

export interface CreateCandidateOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

/**
 * Create a new bench consultant entry
 *
 * @example
 * ```tsx
 * const { createCandidate, isCreating } = useCreateCandidate();
 *
 * await createCandidate({
 *   userProfileId: 'user-id',
 *   benchStatus: 'bench',
 *   targetRate: 85,
 * });
 * ```
 */
export function useCreateCandidate(options: CreateCandidateOptions = {}) {
  const invalidate = useInvalidateCandidates();

  const mutation = trpc.bench.consultants.create.useMutation({
    onSuccess: (data) => {
      invalidate.invalidateAll();
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });

  return {
    createCandidate: async (input: CreateConsultantInput) => {
      return mutation.mutateAsync(input as Parameters<typeof mutation.mutateAsync>[0]);
    },
    isCreating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

// ============================================
// UPDATE HOOK
// ============================================

export interface UpdateCandidateInput extends Partial<CreateConsultantInput> {
  id: string;
}

export interface UpdateCandidateOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
  optimistic?: boolean;
}

/**
 * Update an existing bench consultant
 *
 * @example
 * ```tsx
 * const { updateCandidate, isUpdating } = useUpdateCandidate();
 *
 * await updateCandidate({
 *   id: 'consultant-id',
 *   targetRate: 90,
 *   benchStatus: 'marketing',
 * });
 * ```
 */
export function useUpdateCandidate(options: UpdateCandidateOptions = {}) {
  const invalidate = useInvalidateCandidates();
  const utils = trpc.useUtils();

  const mutation = trpc.bench.consultants.update.useMutation({
    onMutate: async (newData) => {
      if (!options.optimistic) return;

      await utils.bench.consultants.getById.cancel({ id: newData.id });
      const previousCandidate = utils.bench.consultants.getById.getData({ id: newData.id });

      if (previousCandidate) {
        utils.bench.consultants.getById.setData(
          { id: newData.id },
          { ...previousCandidate, ...newData }
        );
      }

      return { previousCandidate };
    },
    onError: (error, newData, context) => {
      if (options.optimistic && context?.previousCandidate) {
        utils.bench.consultants.getById.setData(
          { id: newData.id },
          context.previousCandidate
        );
      }
      options.onError?.(error);
    },
    onSuccess: (data, variables) => {
      invalidate.invalidateAll();
      invalidate.invalidateCandidate(variables.id);
      options.onSuccess?.(data);
    },
  });

  return {
    updateCandidate: async (input: UpdateCandidateInput) => {
      return mutation.mutateAsync(input as Parameters<typeof mutation.mutateAsync>[0]);
    },
    isUpdating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

// ============================================
// STATUS UPDATE HOOKS
// ============================================

export type ConsultantStatusAction =
  | 'bench'
  | 'marketing'
  | 'interview_process'
  | 'offer_stage';

/**
 * Quick status update for consultants
 *
 * @example
 * ```tsx
 * const { updateStatus } = useUpdateCandidateStatus();
 *
 * await updateStatus('consultant-id', 'marketing');
 * ```
 */
export function useUpdateCandidateStatus(options: UpdateCandidateOptions = {}) {
  const { updateCandidate, isUpdating, error } = useUpdateCandidate(options);

  return {
    updateStatus: async (id: string, status: ConsultantStatusAction) => {
      return updateCandidate({
        id,
        benchStatus: status,
      });
    },
    isUpdating,
    error,
  };
}

// ============================================
// BENCH OPERATIONS
// ============================================

/**
 * Move consultant to marketing status
 */
export function useStartMarketing(options: UpdateCandidateOptions = {}) {
  const { updateCandidate, isUpdating, error } = useUpdateCandidate(options);

  return {
    startMarketing: async (id: string) => {
      return updateCandidate({
        id,
        benchStatus: 'marketing',
      });
    },
    isUpdating,
    error,
  };
}

/**
 * Move consultant to interview process
 */
export function useMoveToInterview(options: UpdateCandidateOptions = {}) {
  const { updateCandidate, isUpdating, error } = useUpdateCandidate(options);

  return {
    moveToInterview: async (id: string) => {
      return updateCandidate({
        id,
        benchStatus: 'interview_process',
      });
    },
    isUpdating,
    error,
  };
}

// ============================================
// HOTLIST OPERATIONS
// ============================================

export interface CreateHotlistInput {
  consultantIds: string[];
  recipientEmails: string[];
  subject: string;
  messageBody: string;
  includeResumes?: boolean;
}

/**
 * Create and send a hotlist
 *
 * @example
 * ```tsx
 * const { createHotlist } = useCreateHotlist();
 *
 * await createHotlist({
 *   consultantIds: ['id1', 'id2'],
 *   recipientEmails: ['client@example.com'],
 *   subject: 'Available Java Developers',
 *   messageBody: 'Here are available candidates...',
 * });
 * ```
 */
export function useCreateHotlist(options: { onSuccess?: () => void; onError?: (error: Error) => void } = {}) {
  const invalidate = useInvalidateCandidates();

  const mutation = trpc.bench.hotlist.create.useMutation({
    onSuccess: () => {
      invalidate.invalidateHotlist();
      options.onSuccess?.();
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });

  return {
    createHotlist: async (input: CreateHotlistInput) => {
      return mutation.mutateAsync({
        consultantIds: input.consultantIds,
        recipientEmails: input.recipientEmails,
        subject: input.subject,
        messageBody: input.messageBody,
        includeResumes: input.includeResumes ?? true,
      });
    },
    isCreating: mutation.isPending,
    error: mutation.error,
  };
}

// ============================================
// BULK OPERATIONS
// ============================================

export interface BulkUpdateCandidatesInput {
  ids: string[];
  update: Partial<CreateConsultantInput>;
}

/**
 * Bulk update multiple consultants
 */
export function useBulkUpdateCandidates(options: UpdateCandidateOptions = {}) {
  const { updateCandidate, isUpdating } = useUpdateCandidate(options);
  const invalidate = useInvalidateCandidates();

  return {
    bulkUpdate: async (input: BulkUpdateCandidatesInput) => {
      const results = await Promise.allSettled(
        input.ids.map(id =>
          updateCandidate({ id, ...input.update })
        )
      );

      invalidate.invalidateAll();

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return { successful, failed, total: input.ids.length };
    },
    isUpdating,
  };
}
