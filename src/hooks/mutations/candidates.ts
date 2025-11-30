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
  userId: string;
  benchStartDate: Date;
  contactFrequencyDays?: number;
  isResponsive?: boolean;
  responsivenessScore?: number;
  benchSalesRepId?: string;
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
      options.onError?.(error as unknown as Error);
    },
  });

  return {
    createCandidate: async (input: CreateConsultantInput) => {
      return mutation.mutateAsync(input);
    },
    isCreating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

// ============================================
// UPDATE HOOK
// ============================================

export interface UpdateCandidateInput extends Partial<Omit<CreateConsultantInput, 'userId'>> {
  userId: string;
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
 *   userId: 'consultant-id',
 *   contactFrequencyDays: 5,
 *   isResponsive: true,
 * });
 * ```
 */
export function useUpdateCandidate(options: UpdateCandidateOptions = {}) {
  const invalidate = useInvalidateCandidates();
  const utils = trpc.useUtils();

  const mutation = trpc.bench.consultants.update.useMutation({
    onMutate: async (newData) => {
      if (!options.optimistic) return;

      await utils.bench.consultants.getById.cancel({ userId: newData.userId });
      const previousCandidate = utils.bench.consultants.getById.getData({ userId: newData.userId });

      if (previousCandidate) {
        utils.bench.consultants.getById.setData(
          { userId: newData.userId },
          { ...previousCandidate, ...newData }
        );
      }

      return { previousCandidate };
    },
    onError: (error, newData, context) => {
      if (options.optimistic && context?.previousCandidate) {
        utils.bench.consultants.getById.setData(
          { userId: newData.userId },
          context.previousCandidate
        );
      }
      options.onError?.(error as unknown as Error);
    },
    onSuccess: (data, variables) => {
      invalidate.invalidateAll();
      invalidate.invalidateCandidate(variables.userId);
      options.onSuccess?.(data);
    },
  });

  return {
    updateCandidate: async (input: UpdateCandidateInput) => {
      return mutation.mutateAsync(input);
    },
    isUpdating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

// ============================================
// BENCH OPERATIONS
// ============================================

/**
 * Update consultant responsiveness
 *
 * @example
 * ```tsx
 * const { updateResponsiveness } = useUpdateResponsiveness();
 *
 * await updateResponsiveness('consultant-id', true, 85);
 * ```
 */
export function useUpdateResponsiveness(options: UpdateCandidateOptions = {}) {
  const { updateCandidate, isUpdating, error } = useUpdateCandidate(options);

  return {
    updateResponsiveness: async (userId: string, isResponsive: boolean, score?: number) => {
      return updateCandidate({
        userId,
        isResponsive,
        responsivenessScore: score,
      });
    },
    isUpdating,
    error,
  };
}

/**
 * Update contact frequency for consultant
 */
export function useUpdateContactFrequency(options: UpdateCandidateOptions = {}) {
  const { updateCandidate, isUpdating, error } = useUpdateCandidate(options);

  return {
    updateContactFrequency: async (userId: string, frequencyDays: number) => {
      return updateCandidate({
        userId,
        contactFrequencyDays: frequencyDays,
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
  title: string;
  description?: string;
  candidateIds: string[];
  targetAccounts?: string[];
  targetSkills?: string[];
  targetRoles?: string[];
  sentToEmails?: string[];
}

/**
 * Create and send a hotlist
 *
 * @example
 * ```tsx
 * const { createHotlist } = useCreateHotlist();
 *
 * await createHotlist({
 *   title: 'Available Java Developers',
 *   candidateIds: ['id1', 'id2'],
 *   sentToEmails: ['client@example.com'],
 *   description: 'Here are available candidates...',
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
      options.onError?.(error as unknown as Error);
    },
  });

  return {
    createHotlist: async (input: CreateHotlistInput) => {
      return mutation.mutateAsync(input);
    },
    isCreating: mutation.isPending,
    error: mutation.error,
  };
}

// ============================================
// BULK OPERATIONS
// ============================================

export interface BulkUpdateCandidatesInput {
  userIds: string[];
  update: Partial<Omit<CreateConsultantInput, 'userId'>>;
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
        input.userIds.map(userId =>
          updateCandidate({ userId, ...input.update })
        )
      );

      invalidate.invalidateAll();

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return { successful, failed, total: input.userIds.length };
    },
    isUpdating,
  };
}
