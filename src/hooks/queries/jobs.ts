/**
 * Jobs Query Hooks
 *
 * React Query hooks for job-related data fetching.
 * Automatically transforms database types to display types using adapters.
 */

import { trpc } from '@/lib/trpc/client';
import { jobAdapter } from '@/lib/adapters';
import type { AlignedJob } from '@/types/aligned/ats';

// DisplayJob type from adapter
type DisplayJob = ReturnType<typeof jobAdapter.toDisplay>;

// ============================================
// QUERY OPTIONS TYPES
// ============================================

export interface JobsQueryOptions {
  limit?: number;
  offset?: number;
  status?: 'draft' | 'open' | 'on_hold' | 'filled' | 'closed';
  clientId?: string;
  enabled?: boolean;
}

export interface JobQueryOptions {
  enabled?: boolean;
}

// ============================================
// LIST HOOKS
// ============================================

/**
 * Fetch list of jobs with automatic type transformation
 *
 * @example
 * ```tsx
 * const { data: jobs, isLoading } = useJobs({ status: 'open' });
 * // jobs is DisplayJob[] with frontend-friendly fields
 * ```
 */
export function useJobs(options: JobsQueryOptions = {}) {
  const { enabled = true, ...input } = options;

  const query = trpc.ats.jobs.list.useQuery(
    {
      limit: input.limit ?? 50,
      offset: input.offset ?? 0,
      status: input.status,
      clientId: input.clientId,
    },
    {
      enabled,
      staleTime: 30 * 1000, // 30 seconds
      select: (data): DisplayJob[] => {
        // Transform database types to display types
        return data.map(job => jobAdapter.toDisplay(job as AlignedJob));
      },
    }
  );

  return {
    ...query,
    jobs: query.data ?? [],
    isEmpty: query.data?.length === 0,
  };
}

/**
 * Fetch jobs with raw database types (no transformation)
 * Use when you need the raw data for mutations or custom processing
 */
export function useJobsRaw(options: JobsQueryOptions = {}) {
  const { enabled = true, ...input } = options;

  return trpc.ats.jobs.list.useQuery(
    {
      limit: input.limit ?? 50,
      offset: input.offset ?? 0,
      status: input.status,
      clientId: input.clientId,
    },
    { enabled }
  );
}

// ============================================
// SINGLE ITEM HOOKS
// ============================================

/**
 * Fetch single job by ID with automatic type transformation
 *
 * @example
 * ```tsx
 * const { data: job, isLoading } = useJob(jobId);
 * // job is DisplayJob with frontend-friendly fields
 * ```
 */
export function useJob(id: string | undefined, options: JobQueryOptions = {}) {
  const { enabled = true } = options;

  const query = trpc.ats.jobs.getById.useQuery(
    { id: id! },
    {
      enabled: enabled && !!id,
      staleTime: 30 * 1000,
      select: (data): DisplayJob => {
        return jobAdapter.toDisplay(data as AlignedJob);
      },
    }
  );

  return {
    ...query,
    job: query.data,
  };
}

/**
 * Fetch single job with raw database types
 */
export function useJobRaw(id: string | undefined, options: JobQueryOptions = {}) {
  const { enabled = true } = options;

  return trpc.ats.jobs.getById.useQuery(
    { id: id! },
    { enabled: enabled && !!id }
  );
}

// ============================================
// METRICS HOOKS
// ============================================

/**
 * Fetch job metrics (submission counts, interview counts, etc.)
 *
 * @example
 * ```tsx
 * const { data: metrics } = useJobMetrics(jobId);
 * // metrics.submissions, metrics.interviews, metrics.offers
 * ```
 */
export function useJobMetrics(jobId: string | undefined, options: JobQueryOptions = {}) {
  const { enabled = true } = options;

  return trpc.ats.jobs.metrics.useQuery(
    { jobId: jobId! },
    {
      enabled: enabled && !!jobId,
      staleTime: 60 * 1000, // 1 minute
    }
  );
}

// ============================================
// SEARCH & FILTER HOOKS
// ============================================

/**
 * Fetch open jobs (convenience hook)
 */
export function useOpenJobs(options: Omit<JobsQueryOptions, 'status'> = {}) {
  return useJobs({ ...options, status: 'open' });
}

/**
 * Fetch urgent jobs (open with urgent flag)
 */
export function useUrgentJobs(options: Omit<JobsQueryOptions, 'status'> = {}) {
  const query = useJobs({ ...options, status: 'open' });

  return {
    ...query,
    jobs: query.jobs.filter(job => job.status === 'urgent'),
  };
}

/**
 * Fetch jobs by client/account
 */
export function useJobsByClient(clientId: string | undefined, options: Omit<JobsQueryOptions, 'clientId'> = {}) {
  return useJobs({
    ...options,
    clientId,
    enabled: options.enabled !== false && !!clientId,
  });
}

// ============================================
// PREFETCH UTILITIES
// ============================================

/**
 * Prefetch jobs data for faster navigation
 */
export function usePrefetchJobs() {
  const utils = trpc.useUtils();

  return {
    prefetchList: (options: Omit<JobsQueryOptions, 'enabled'> = {}) => {
      return utils.ats.jobs.list.prefetch({
        limit: options.limit ?? 50,
        offset: options.offset ?? 0,
        status: options.status,
        clientId: options.clientId,
      });
    },
    prefetchJob: (id: string) => {
      return utils.ats.jobs.getById.prefetch({ id });
    },
  };
}

// ============================================
// INVALIDATION UTILITIES
// ============================================

/**
 * Utilities for invalidating job queries after mutations
 */
export function useInvalidateJobs() {
  const utils = trpc.useUtils();

  return {
    /** Invalidate all job lists */
    invalidateAll: () => utils.ats.jobs.list.invalidate(),
    /** Invalidate a specific job */
    invalidateJob: (id: string) => utils.ats.jobs.getById.invalidate({ id }),
    /** Invalidate job metrics */
    invalidateMetrics: (jobId: string) => utils.ats.jobs.metrics.invalidate({ jobId }),
  };
}
