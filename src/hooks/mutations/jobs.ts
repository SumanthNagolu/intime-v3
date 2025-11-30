/**
 * Jobs Mutation Hooks
 *
 * React Query hooks for job-related mutations.
 * Handles create, update, and delete operations with optimistic updates.
 */

import { trpc } from '@/lib/trpc/client';
import { jobAdapter, type CreateJobInput } from '@/lib/adapters';
import { useInvalidateJobs } from '../queries/jobs';

// ============================================
// CREATE HOOK
// ============================================

export interface CreateJobOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

/**
 * Create a new job
 *
 * @example
 * ```tsx
 * const { createJob, isCreating } = useCreateJob();
 *
 * await createJob({
 *   title: 'Senior React Developer',
 *   type: 'Contract',
 *   rate: '$80-100/hr',
 *   accountId: 'xxx',
 * });
 * ```
 */
export function useCreateJob(options: CreateJobOptions = {}) {
  const invalidate = useInvalidateJobs();

  const mutation = trpc.ats.jobs.create.useMutation({
    onSuccess: (data) => {
      // Invalidate job lists to refetch
      invalidate.invalidateAll();
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error as unknown as Error);
    },
  });

  return {
    createJob: async (input: CreateJobInput) => {
      // Transform display input to database format
      // Note: The actual ctx comes from the tRPC context
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

export interface UpdateJobInput extends Partial<CreateJobInput> {
  id: string;
}

export interface UpdateJobOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
  /** Enable optimistic updates */
  optimistic?: boolean;
}

/**
 * Update an existing job
 *
 * @example
 * ```tsx
 * const { updateJob, isUpdating } = useUpdateJob();
 *
 * await updateJob({
 *   id: 'job-id',
 *   status: 'filled',
 * });
 * ```
 */
export function useUpdateJob(options: UpdateJobOptions = {}) {
  const invalidate = useInvalidateJobs();
  const utils = trpc.useUtils();

  const mutation = trpc.ats.jobs.update.useMutation({
    onMutate: async (newData) => {
      if (!options.optimistic) return;

      // Cancel outgoing refetches
      await utils.ats.jobs.getById.cancel({ id: newData.id });

      // Snapshot the previous value
      const previousJob = utils.ats.jobs.getById.getData({ id: newData.id });

      // Optimistically update the cache
      if (previousJob) {
        utils.ats.jobs.getById.setData(
          { id: newData.id },
          { ...previousJob, ...newData } as typeof previousJob
        );
      }

      return { previousJob };
    },
    onError: (error, newData, context) => {
      // Rollback on error
      if (options.optimistic && context?.previousJob) {
        utils.ats.jobs.getById.setData(
          { id: newData.id },
          context.previousJob
        );
      }
      options.onError?.(error as unknown as Error);
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      invalidate.invalidateAll();
      invalidate.invalidateJob(variables.id);
      options.onSuccess?.(data);
    },
  });

  return {
    updateJob: async (input: UpdateJobInput) => {
      return mutation.mutateAsync(input as Parameters<typeof mutation.mutateAsync>[0]);
    },
    isUpdating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

// ============================================
// DELETE HOOK
// ============================================

export interface DeleteJobOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Delete a job (soft delete)
 *
 * @example
 * ```tsx
 * const { deleteJob, isDeleting } = useDeleteJob();
 *
 * await deleteJob('job-id');
 * ```
 */
export function useDeleteJob(options: DeleteJobOptions = {}) {
  const invalidate = useInvalidateJobs();

  // Note: Delete procedure may need to be added to the router
  const mutation = trpc.ats.jobs.update.useMutation({
    onSuccess: () => {
      invalidate.invalidateAll();
      options.onSuccess?.();
    },
    onError: (error) => {
      options.onError?.(error as unknown as Error);
    },
  });

  return {
    deleteJob: async (id: string) => {
      // Use update with status change for soft delete
      // A proper delete procedure would be better
      return mutation.mutateAsync({
        id,
        status: 'cancelled',
      } as Parameters<typeof mutation.mutateAsync>[0]);
    },
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
}

// ============================================
// STATUS UPDATE HOOK
// ============================================

export type JobStatusAction = 'open' | 'hold' | 'close' | 'fill' | 'reopen';

/**
 * Quick status update for jobs
 *
 * @example
 * ```tsx
 * const { updateStatus } = useUpdateJobStatus();
 *
 * await updateStatus('job-id', 'fill');
 * ```
 */
export function useUpdateJobStatus(options: UpdateJobOptions = {}) {
  const { updateJob, isUpdating, error } = useUpdateJob(options);

  const statusMap: Record<JobStatusAction, string> = {
    open: 'open',
    hold: 'on_hold',
    close: 'closed',
    fill: 'filled',
    reopen: 'open',
  };

  return {
    updateStatus: async (id: string, action: JobStatusAction) => {
      return updateJob({
        id,
        status: statusMap[action] as CreateJobInput['status'],
      });
    },
    isUpdating,
    error,
  };
}

// ============================================
// BULK OPERATIONS
// ============================================

export interface BulkUpdateJobsInput {
  ids: string[];
  update: Partial<CreateJobInput>;
}

/**
 * Bulk update multiple jobs
 *
 * @example
 * ```tsx
 * const { bulkUpdate } = useBulkUpdateJobs();
 *
 * await bulkUpdate({
 *   ids: ['id1', 'id2', 'id3'],
 *   update: { status: 'hold' }
 * });
 * ```
 */
export function useBulkUpdateJobs(options: UpdateJobOptions = {}) {
  const { updateJob, isUpdating } = useUpdateJob(options);
  const invalidate = useInvalidateJobs();

  return {
    bulkUpdate: async (input: BulkUpdateJobsInput) => {
      const results = await Promise.allSettled(
        input.ids.map(id =>
          updateJob({ id, ...input.update })
        )
      );

      // Invalidate once after all updates
      invalidate.invalidateAll();

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return { successful, failed, total: input.ids.length };
    },
    isUpdating,
  };
}
