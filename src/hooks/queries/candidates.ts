/**
 * Candidates Query Hooks
 *
 * React Query hooks for candidate-related data fetching.
 * Automatically transforms database types to display types using adapters.
 *
 * Note: Uses bench.consultants router for bench candidates (internal consultants)
 * Future: Will need a dedicated candidates router for external candidates
 */

import { trpc } from '@/lib/trpc/client';
import {
  candidateAdapter,
  type DisplayBenchCandidate,
} from '@/lib/adapters';
import type { AlignedCandidate, DisplayCandidate } from '@/types/aligned/ats';

// ============================================
// QUERY OPTIONS TYPES
// ============================================

export interface CandidatesQueryOptions {
  limit?: number;
  offset?: number;
  status?: 'bench' | 'marketing' | 'interview_process' | 'offer_stage';
  minDaysOnBench?: number;
  maxDaysOnBench?: number;
  enabled?: boolean;
}

export interface CandidateQueryOptions {
  enabled?: boolean;
}

// ============================================
// LIST HOOKS
// ============================================

/**
 * Fetch list of bench consultants with automatic type transformation
 *
 * @example
 * ```tsx
 * const { data: candidates, isLoading } = useCandidates({ status: 'bench' });
 * // candidates is DisplayCandidate[] with frontend-friendly fields
 * ```
 */
export function useCandidates(options: CandidatesQueryOptions = {}) {
  const { enabled = true, ...input } = options;

  // Uses bench.consultants router (bench metadata)
  const query = trpc.bench.consultants.list.useQuery(
    {
      limit: input.limit ?? 50,
      offset: input.offset ?? 0,
      minDaysOnBench: input.minDaysOnBench,
      maxDaysOnBench: input.maxDaysOnBench,
    },
    {
      enabled,
      staleTime: 30 * 1000,
      select: (data): DisplayBenchCandidate[] => {
        return data.map(consultant => ({
          id: consultant.userId,
          name: 'Consultant', // Would need user profile join
          role: 'Consultant',
          status: 'bench' as const,
          type: 'internal_bench' as const,
          skills: [],
          experience: 'N/A',
          location: '',
          rate: 'N/A',
          email: '',
          score: 0,
          willingToRelocate: false,
          daysOnBench: consultant.daysOnBench || 0,
          lastContact: consultant.lastContactedAt?.toISOString() || '',
          benchStartDate: consultant.benchStartDate,
        }));
      },
    }
  );

  return {
    ...query,
    candidates: query.data ?? [],
    isEmpty: query.data?.length === 0,
  };
}

/**
 * Fetch consultants with raw database types
 */
export function useCandidatesRaw(options: CandidatesQueryOptions = {}) {
  const { enabled = true, ...input } = options;

  return trpc.bench.consultants.list.useQuery(
    {
      limit: input.limit ?? 50,
      offset: input.offset ?? 0,
      minDaysOnBench: input.minDaysOnBench,
      maxDaysOnBench: input.maxDaysOnBench,
    },
    { enabled }
  );
}

// ============================================
// SINGLE ITEM HOOKS
// ============================================

/**
 * Fetch single consultant by ID with automatic type transformation
 *
 * @example
 * ```tsx
 * const { data: candidate, isLoading } = useCandidate(candidateId);
 * // candidate is DisplayCandidate with frontend-friendly fields
 * ```
 */
export function useCandidate(id: string | undefined, options: CandidateQueryOptions = {}) {
  const { enabled = true } = options;

  const query = trpc.bench.consultants.getById.useQuery(
    { userId: id! },
    {
      enabled: enabled && !!id,
      staleTime: 30 * 1000,
      select: (data): DisplayBenchCandidate => ({
        id: data.userId,
        name: 'Consultant',
        role: 'Consultant',
        status: 'bench' as const,
        type: 'internal_bench' as const,
        skills: [],
        experience: 'N/A',
        location: '',
        rate: 'N/A',
        email: '',
        score: 0,
        willingToRelocate: false,
        daysOnBench: data.daysOnBench || 0,
        lastContact: data.lastContactedAt?.toISOString() || '',
        benchStartDate: data.benchStartDate,
      }),
    }
  );

  return {
    ...query,
    candidate: query.data,
  };
}

/**
 * Fetch single consultant with raw database types
 */
export function useCandidateRaw(id: string | undefined, options: CandidateQueryOptions = {}) {
  const { enabled = true } = options;

  return trpc.bench.consultants.getById.useQuery(
    { userId: id! },
    { enabled: enabled && !!id }
  );
}

// ============================================
// BENCH-SPECIFIC HOOKS
// ============================================

export interface BenchCandidatesOptions {
  limit?: number;
  offset?: number;
  minDaysOnBench?: number;
  maxDaysOnBench?: number;
  enabled?: boolean;
}

/**
 * Fetch bench candidates with bench-specific metadata
 *
 * @example
 * ```tsx
 * const { data: benchCandidates } = useBenchCandidates();
 * // benchCandidates includes daysOnBench, lastContact, etc.
 * ```
 */
export function useBenchCandidates(options: BenchCandidatesOptions = {}) {
  const { enabled = true, ...input } = options;

  // Uses bench.consultants router
  const query = trpc.bench.consultants.list.useQuery(
    {
      limit: input.limit ?? 50,
      offset: input.offset ?? 0,
      minDaysOnBench: input.minDaysOnBench,
      maxDaysOnBench: input.maxDaysOnBench,
    },
    {
      enabled,
      staleTime: 30 * 1000,
      select: (data): DisplayBenchCandidate[] => {
        return data.map(consultant => ({
          id: consultant.userId,
          name: 'Consultant',
          role: 'Consultant',
          status: 'bench' as const,
          type: 'internal_bench' as const,
          skills: [],
          experience: 'N/A',
          location: '',
          rate: 'N/A',
          email: '',
          score: 0,
          willingToRelocate: false,
          daysOnBench: consultant.daysOnBench || 0,
          lastContact: consultant.lastContactedAt?.toISOString() || '',
          benchStartDate: consultant.benchStartDate,
        }));
      },
    }
  );

  return {
    ...query,
    candidates: query.data ?? [],
    isEmpty: query.data?.length === 0,
  };
}

/**
 * Fetch hotlist records
 */
export function useHotlistCandidates(options: Omit<BenchCandidatesOptions, 'minDaysOnBench' | 'maxDaysOnBench'> = {}) {
  const { enabled = true, ...input } = options;

  const query = trpc.bench.hotlist.list.useQuery(
    {
      limit: input.limit ?? 20,
      offset: input.offset ?? 0,
    },
    {
      enabled,
      staleTime: 60 * 1000,
    }
  );

  return {
    ...query,
    hotlists: query.data ?? [],
  };
}

/**
 * Get bench aging report
 */
export function useBenchAgingReport(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return trpc.bench.consultants.agingReport.useQuery(undefined, {
    enabled,
    staleTime: 60 * 1000,
  });
}

// ============================================
// PREFETCH UTILITIES
// ============================================

/**
 * Prefetch candidates data for faster navigation
 */
export function usePrefetchCandidates() {
  const utils = trpc.useUtils();

  return {
    prefetchList: (options: Omit<CandidatesQueryOptions, 'enabled'> = {}) => {
      return utils.bench.consultants.list.prefetch({
        limit: options.limit ?? 50,
        offset: options.offset ?? 0,
        minDaysOnBench: options.minDaysOnBench,
        maxDaysOnBench: options.maxDaysOnBench,
      });
    },
    prefetchCandidate: (userId: string) => {
      return utils.bench.consultants.getById.prefetch({ userId });
    },
  };
}

// ============================================
// INVALIDATION UTILITIES
// ============================================

/**
 * Utilities for invalidating candidate queries after mutations
 */
export function useInvalidateCandidates() {
  const utils = trpc.useUtils();

  return {
    invalidateAll: () => utils.bench.consultants.list.invalidate(),
    invalidateCandidate: (userId: string) => utils.bench.consultants.getById.invalidate({ userId }),
    invalidateHotlist: () => utils.bench.hotlist.list.invalidate(),
    invalidateAgingReport: () => utils.bench.consultants.agingReport.invalidate(),
  };
}
