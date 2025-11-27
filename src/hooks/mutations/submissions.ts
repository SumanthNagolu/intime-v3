/**
 * Submissions Mutation Hooks
 *
 * React Query hooks for submission-related mutations.
 * Handles pipeline stage updates, submissions, and status changes.
 */

import { trpc } from '@/lib/trpc/client';
import { submissionAdapter, type CreateSubmissionInput, PIPELINE_STAGES } from '@/lib/adapters';
import { useInvalidateSubmissions } from '../queries/submissions';
import type { SubmissionStatus } from '@/types/aligned/ats';

// ============================================
// CREATE HOOK
// ============================================

export interface CreateSubmissionOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

/**
 * Create a new submission (submit candidate to job)
 *
 * @example
 * ```tsx
 * const { createSubmission, isCreating } = useCreateSubmission();
 *
 * await createSubmission({
 *   jobId: 'job-id',
 *   candidateId: 'candidate-id',
 *   matchScore: 85,
 *   notes: 'Strong match for requirements',
 * });
 * ```
 */
export function useCreateSubmission(options: CreateSubmissionOptions = {}) {
  const invalidate = useInvalidateSubmissions();

  const mutation = trpc.ats.submissions.create.useMutation({
    onSuccess: (data, variables) => {
      invalidate.invalidateAll();
      invalidate.invalidateForJob(variables.jobId);
      invalidate.invalidateForCandidate(variables.candidateId);
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });

  return {
    createSubmission: async (input: CreateSubmissionInput) => {
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

export interface UpdateSubmissionInput extends Partial<CreateSubmissionInput> {
  id: string;
}

export interface UpdateSubmissionOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
  optimistic?: boolean;
}

/**
 * Update an existing submission
 *
 * @example
 * ```tsx
 * const { updateSubmission, isUpdating } = useUpdateSubmission();
 *
 * await updateSubmission({
 *   id: 'submission-id',
 *   status: 'client_interview',
 *   notes: 'Interview scheduled for Monday',
 * });
 * ```
 */
export function useUpdateSubmission(options: UpdateSubmissionOptions = {}) {
  const invalidate = useInvalidateSubmissions();
  const utils = trpc.useUtils();

  const mutation = trpc.ats.submissions.update.useMutation({
    onMutate: async (newData) => {
      if (!options.optimistic) return;

      await utils.ats.submissions.getById.cancel({ id: newData.id });
      const previousSubmission = utils.ats.submissions.getById.getData({ id: newData.id });

      if (previousSubmission) {
        utils.ats.submissions.getById.setData(
          { id: newData.id },
          { ...previousSubmission, ...newData }
        );
      }

      return { previousSubmission };
    },
    onError: (error, newData, context) => {
      if (options.optimistic && context?.previousSubmission) {
        utils.ats.submissions.getById.setData(
          { id: newData.id },
          context.previousSubmission
        );
      }
      options.onError?.(error);
    },
    onSuccess: (data, variables) => {
      invalidate.invalidateAll();
      invalidate.invalidateSubmission(variables.id);
      options.onSuccess?.(data);
    },
  });

  return {
    updateSubmission: async (input: UpdateSubmissionInput) => {
      return mutation.mutateAsync(input as Parameters<typeof mutation.mutateAsync>[0]);
    },
    isUpdating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

// ============================================
// PIPELINE STAGE HOOKS
// ============================================

/**
 * Move submission to next pipeline stage
 *
 * @example
 * ```tsx
 * const { moveToNextStage } = useMoveSubmissionStage();
 *
 * await moveToNextStage('submission-id');
 * ```
 */
export function useMoveSubmissionStage(options: UpdateSubmissionOptions = {}) {
  const { updateSubmission, isUpdating, error } = useUpdateSubmission(options);

  const getNextStage = (currentStatus: SubmissionStatus): SubmissionStatus | null => {
    const currentIndex = PIPELINE_STAGES.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === PIPELINE_STAGES.length - 1) {
      return null;
    }
    return PIPELINE_STAGES[currentIndex + 1];
  };

  const getPreviousStage = (currentStatus: SubmissionStatus): SubmissionStatus | null => {
    const currentIndex = PIPELINE_STAGES.indexOf(currentStatus);
    if (currentIndex <= 0) {
      return null;
    }
    return PIPELINE_STAGES[currentIndex - 1];
  };

  return {
    moveToNextStage: async (id: string, currentStatus: SubmissionStatus) => {
      const nextStage = getNextStage(currentStatus);
      if (!nextStage) {
        throw new Error('Already at final stage');
      }
      return updateSubmission({ id, status: nextStage });
    },
    moveToPreviousStage: async (id: string, currentStatus: SubmissionStatus) => {
      const prevStage = getPreviousStage(currentStatus);
      if (!prevStage) {
        throw new Error('Already at first stage');
      }
      return updateSubmission({ id, status: prevStage });
    },
    moveToStage: async (id: string, stage: SubmissionStatus) => {
      return updateSubmission({ id, status: stage });
    },
    isMoving: isUpdating,
    error,
  };
}

/**
 * Quick status update for submissions
 */
export function useUpdateSubmissionStatus(options: UpdateSubmissionOptions = {}) {
  const { updateSubmission, isUpdating, error } = useUpdateSubmission(options);

  return {
    updateStatus: async (id: string, status: SubmissionStatus) => {
      return updateSubmission({ id, status });
    },
    isUpdating,
    error,
  };
}

// ============================================
// REJECTION HOOK
// ============================================

export interface RejectSubmissionInput {
  id: string;
  reason?: string;
  feedback?: string;
}

/**
 * Reject a submission
 *
 * @example
 * ```tsx
 * const { rejectSubmission } = useRejectSubmission();
 *
 * await rejectSubmission({
 *   id: 'submission-id',
 *   reason: 'Not enough experience',
 *   feedback: 'Consider candidates with 5+ years',
 * });
 * ```
 */
export function useRejectSubmission(options: UpdateSubmissionOptions = {}) {
  const { updateSubmission, isUpdating, error } = useUpdateSubmission(options);

  return {
    rejectSubmission: async (input: RejectSubmissionInput) => {
      return updateSubmission({
        id: input.id,
        status: 'rejected',
        notes: [input.reason, input.feedback].filter(Boolean).join(' - '),
      });
    },
    isRejecting: isUpdating,
    error,
  };
}

// ============================================
// SUBMIT TO CLIENT HOOK
// ============================================

export interface SubmitToClientInput {
  id: string;
  submittedRate?: number;
  rateType?: 'hourly' | 'annual';
  coverNote?: string;
}

/**
 * Submit candidate to client
 *
 * @example
 * ```tsx
 * const { submitToClient } = useSubmitToClient();
 *
 * await submitToClient({
 *   id: 'submission-id',
 *   submittedRate: 85,
 *   rateType: 'hourly',
 *   coverNote: 'Highly recommended candidate',
 * });
 * ```
 */
export function useSubmitToClient(options: UpdateSubmissionOptions = {}) {
  const { updateSubmission, isUpdating, error } = useUpdateSubmission(options);

  return {
    submitToClient: async (input: SubmitToClientInput) => {
      return updateSubmission({
        id: input.id,
        status: 'submitted_to_client',
        submittedRate: input.submittedRate,
        rateType: input.rateType,
        notes: input.coverNote,
      });
    },
    isSubmitting: isUpdating,
    error,
  };
}

// ============================================
// SCHEDULE INTERVIEW HOOK
// ============================================

export interface ScheduleInterviewInput {
  submissionId: string;
  type: 'phone' | 'video' | 'onsite' | 'technical';
  scheduledAt: Date;
  interviewerName?: string;
  notes?: string;
}

/**
 * Schedule interview for submission
 *
 * @example
 * ```tsx
 * const { scheduleInterview } = useScheduleInterview();
 *
 * await scheduleInterview({
 *   submissionId: 'submission-id',
 *   type: 'video',
 *   scheduledAt: new Date('2024-01-15T10:00:00'),
 *   interviewerName: 'John Smith',
 * });
 * ```
 */
export function useScheduleInterview(options: { onSuccess?: () => void; onError?: (error: Error) => void } = {}) {
  const invalidate = useInvalidateSubmissions();

  const mutation = trpc.ats.interviews.create.useMutation({
    onSuccess: (data, variables) => {
      invalidate.invalidateAll();
      options.onSuccess?.();
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });

  return {
    scheduleInterview: async (input: ScheduleInterviewInput) => {
      return mutation.mutateAsync({
        submissionId: input.submissionId,
        interviewType: input.type,
        scheduledAt: input.scheduledAt.toISOString(),
        interviewerName: input.interviewerName,
        notes: input.notes,
      } as Parameters<typeof mutation.mutateAsync>[0]);
    },
    isScheduling: mutation.isPending,
    error: mutation.error,
  };
}

// ============================================
// BULK OPERATIONS
// ============================================

export interface BulkUpdateSubmissionsInput {
  ids: string[];
  update: Partial<CreateSubmissionInput>;
}

/**
 * Bulk update multiple submissions
 */
export function useBulkUpdateSubmissions(options: UpdateSubmissionOptions = {}) {
  const { updateSubmission, isUpdating } = useUpdateSubmission(options);
  const invalidate = useInvalidateSubmissions();

  return {
    bulkUpdate: async (input: BulkUpdateSubmissionsInput) => {
      const results = await Promise.allSettled(
        input.ids.map(id =>
          updateSubmission({ id, ...input.update })
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

/**
 * Bulk reject submissions
 */
export function useBulkRejectSubmissions(options: UpdateSubmissionOptions = {}) {
  const { bulkUpdate, isUpdating } = useBulkUpdateSubmissions(options);

  return {
    bulkReject: async (ids: string[], reason?: string) => {
      return bulkUpdate({
        ids,
        update: {
          status: 'rejected',
          notes: reason,
        },
      });
    },
    isRejecting: isUpdating,
  };
}
