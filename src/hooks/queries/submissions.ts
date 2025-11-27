/**
 * Submissions Query Hooks
 *
 * React Query hooks for submission-related data fetching.
 * Includes pipeline view helpers and stage grouping.
 */

import { trpc } from '@/lib/trpc/client';
import {
  submissionAdapter,
  type DisplaySubmission,
  type PipelineData,
  type SubmissionStats,
  PIPELINE_STAGES,
} from '@/lib/adapters';
import type { AlignedSubmission, SubmissionStatus } from '@/types/aligned/ats';

// ============================================
// QUERY OPTIONS TYPES
// ============================================

export interface SubmissionsQueryOptions {
  limit?: number;
  offset?: number;
  status?: SubmissionStatus;
  jobId?: string;
  candidateId?: string;
  enabled?: boolean;
}

export interface SubmissionQueryOptions {
  enabled?: boolean;
}

export interface PipelineQueryOptions {
  jobId?: string;
  accountId?: string;
  enabled?: boolean;
}

// ============================================
// LIST HOOKS
// ============================================

/**
 * Fetch list of submissions with automatic type transformation
 *
 * @example
 * ```tsx
 * const { data: submissions } = useSubmissions({ jobId: 'xxx' });
 * // submissions is DisplaySubmission[] with frontend-friendly fields
 * ```
 */
export function useSubmissions(options: SubmissionsQueryOptions = {}) {
  const { enabled = true, ...input } = options;

  const query = trpc.ats.submissions.list.useQuery(
    {
      limit: input.limit ?? 50,
      offset: input.offset ?? 0,
      status: input.status,
      jobId: input.jobId,
      candidateId: input.candidateId,
    },
    {
      enabled,
      staleTime: 30 * 1000,
      select: (data): DisplaySubmission[] => {
        return data.map(sub =>
          submissionAdapter.toDisplay(sub as AlignedSubmission)
        );
      },
    }
  );

  return {
    ...query,
    submissions: query.data ?? [],
    isEmpty: query.data?.length === 0,
  };
}

/**
 * Fetch submissions with raw database types
 */
export function useSubmissionsRaw(options: SubmissionsQueryOptions = {}) {
  const { enabled = true, ...input } = options;

  return trpc.ats.submissions.list.useQuery(
    {
      limit: input.limit ?? 50,
      offset: input.offset ?? 0,
      status: input.status,
      jobId: input.jobId,
      candidateId: input.candidateId,
    },
    { enabled }
  );
}

// ============================================
// SINGLE ITEM HOOKS
// ============================================

/**
 * Fetch single submission by ID with automatic type transformation
 *
 * @example
 * ```tsx
 * const { data: submission } = useSubmission(submissionId);
 * // submission is DisplaySubmission with frontend-friendly fields
 * ```
 */
export function useSubmission(id: string | undefined, options: SubmissionQueryOptions = {}) {
  const { enabled = true } = options;

  const query = trpc.ats.submissions.getById.useQuery(
    { id: id! },
    {
      enabled: enabled && !!id,
      staleTime: 30 * 1000,
      select: (data): DisplaySubmission => {
        return submissionAdapter.toDisplay(data as AlignedSubmission);
      },
    }
  );

  return {
    ...query,
    submission: query.data,
  };
}

// ============================================
// PIPELINE HOOKS
// ============================================

/**
 * Fetch submissions grouped by pipeline stage for Kanban view
 *
 * @example
 * ```tsx
 * const { pipelineData, stages } = useSubmissionPipeline({ jobId: 'xxx' });
 * // pipelineData is { sourced: [...], screening: [...], ... }
 * ```
 */
export function useSubmissionPipeline(options: PipelineQueryOptions = {}) {
  const { enabled = true, jobId, accountId } = options;

  const query = trpc.ats.submissions.list.useQuery(
    {
      limit: 200, // Get all for pipeline view
      offset: 0,
      jobId,
    },
    {
      enabled,
      staleTime: 30 * 1000,
      select: (data): PipelineData => {
        // Group submissions by stage
        return submissionAdapter.groupByStage(data as AlignedSubmission[]);
      },
    }
  );

  return {
    ...query,
    pipelineData: query.data ?? initializePipeline(),
    stages: PIPELINE_STAGES,
    stageLabels: submissionAdapter.PIPELINE_STAGE_LABELS,
  };
}

/**
 * Fetch submissions for a specific stage
 */
export function useSubmissionsByStage(
  stage: SubmissionStatus,
  options: Omit<SubmissionsQueryOptions, 'status'> = {}
) {
  return useSubmissions({ ...options, status: stage });
}

// ============================================
// STATISTICS HOOKS
// ============================================

/**
 * Calculate submission statistics
 *
 * @example
 * ```tsx
 * const { stats } = useSubmissionStats({ jobId: 'xxx' });
 * // stats.total, stats.byStatus, stats.averageMatchScore
 * ```
 */
export function useSubmissionStats(options: PipelineQueryOptions = {}) {
  const { enabled = true, jobId } = options;

  const query = trpc.ats.submissions.list.useQuery(
    {
      limit: 500,
      offset: 0,
      jobId,
    },
    {
      enabled,
      staleTime: 60 * 1000,
      select: (data): SubmissionStats => {
        return submissionAdapter.calculateStats(data as AlignedSubmission[]);
      },
    }
  );

  return {
    ...query,
    stats: query.data ?? {
      total: 0,
      byStatus: {},
      averageMatchScore: 0,
      averageTimeInStage: {},
    },
  };
}

// ============================================
// JOB-SPECIFIC HOOKS
// ============================================

/**
 * Fetch all submissions for a specific job
 */
export function useJobSubmissions(jobId: string | undefined, options: Omit<SubmissionsQueryOptions, 'jobId'> = {}) {
  return useSubmissions({
    ...options,
    jobId,
    enabled: options.enabled !== false && !!jobId,
  });
}

/**
 * Fetch pipeline view for a specific job
 */
export function useJobPipeline(jobId: string | undefined) {
  return useSubmissionPipeline({
    jobId,
    enabled: !!jobId,
  });
}

// ============================================
// CANDIDATE-SPECIFIC HOOKS
// ============================================

/**
 * Fetch all submissions for a specific candidate
 */
export function useCandidateSubmissions(
  candidateId: string | undefined,
  options: Omit<SubmissionsQueryOptions, 'candidateId'> = {}
) {
  return useSubmissions({
    ...options,
    candidateId,
    enabled: options.enabled !== false && !!candidateId,
  });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function initializePipeline(): PipelineData {
  const pipeline: PipelineData = {};
  PIPELINE_STAGES.forEach(stage => {
    pipeline[stage] = [];
  });
  return pipeline;
}

// ============================================
// PREFETCH UTILITIES
// ============================================

/**
 * Prefetch submissions data for faster navigation
 */
export function usePrefetchSubmissions() {
  const utils = trpc.useUtils();

  return {
    prefetchList: (options: Omit<SubmissionsQueryOptions, 'enabled'> = {}) => {
      return utils.ats.submissions.list.prefetch({
        limit: options.limit ?? 50,
        offset: options.offset ?? 0,
        status: options.status,
        jobId: options.jobId,
        candidateId: options.candidateId,
      });
    },
    prefetchSubmission: (id: string) => {
      return utils.ats.submissions.getById.prefetch({ id });
    },
    prefetchPipeline: (jobId: string) => {
      return utils.ats.submissions.list.prefetch({
        limit: 200,
        offset: 0,
        jobId,
      });
    },
  };
}

// ============================================
// INVALIDATION UTILITIES
// ============================================

/**
 * Utilities for invalidating submission queries after mutations
 */
export function useInvalidateSubmissions() {
  const utils = trpc.useUtils();

  return {
    invalidateAll: () => utils.ats.submissions.list.invalidate(),
    invalidateSubmission: (id: string) => utils.ats.submissions.getById.invalidate({ id }),
    invalidateForJob: (jobId: string) =>
      utils.ats.submissions.list.invalidate({ jobId }),
    invalidateForCandidate: (candidateId: string) =>
      utils.ats.submissions.list.invalidate({ candidateId }),
  };
}
