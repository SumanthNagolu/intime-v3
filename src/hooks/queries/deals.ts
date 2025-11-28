/**
 * Deals Query Hooks
 *
 * React Query hooks for CRM deals data.
 *
 * Usage:
 * ```typescript
 * import { useDeals, useDeal, useDealPipeline } from '@/hooks/queries/deals';
 *
 * function DealsPipeline() {
 *   const { deals, isLoading } = useDeals({ stage: 'proposal' });
 *   const { pipeline } = useDealPipeline();
 *   // ...
 * }
 * ```
 */

import { trpc } from '@/lib/trpc/client';
import type { DisplayDeal } from '@/types/aligned';

// ============================================
// QUERY OPTIONS TYPES
// ============================================

export interface DealsQueryOptions {
  enabled?: boolean;
  limit?: number;
  offset?: number;
  stage?: 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  accountId?: string;
}

export type DealStage = 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface DealQueryOptions {
  enabled?: boolean;
}

// ============================================
// DISPLAY TYPE ADAPTER
// ============================================

function toDisplayDeal(deal: any): DisplayDeal {
  return {
    id: deal.id,
    title: deal.title || '',
    value: deal.dealValue ? Number(deal.dealValue) : 0,
    stage: deal.stage || 'discovery',
    probability: deal.probability || 0,
    expectedCloseDate: deal.expectedCloseDate,
    accountId: deal.accountId,
    accountName: deal.accountName || '',
    leadId: deal.leadId,
    ownerId: deal.ownerId,
    createdAt: deal.createdAt,
    notes: deal.notes,
  };
}

// ============================================
// LIST HOOKS
// ============================================

/**
 * Get list of deals with display formatting
 */
export function useDeals(options: DealsQueryOptions = {}) {
  const { enabled = true, ...input } = options;

  const query = trpc.crm.deals.list.useQuery(
    {
      limit: input.limit ?? 50,
      offset: input.offset ?? 0,
      stage: input.stage,
      accountId: input.accountId,
    },
    {
      enabled,
      staleTime: 30 * 1000,
    }
  );

  return {
    deals: (query.data ?? []).map(toDisplayDeal),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

/**
 * Get raw deals data without transformation
 */
export function useDealsRaw(options: DealsQueryOptions = {}) {
  const { enabled = true, ...input } = options;

  return trpc.crm.deals.list.useQuery(
    {
      limit: input.limit ?? 50,
      offset: input.offset ?? 0,
      stage: input.stage,
      accountId: input.accountId,
    },
    {
      enabled,
      staleTime: 30 * 1000,
    }
  );
}

/**
 * Get single deal by ID
 */
export function useDeal(id: string | undefined, options: DealQueryOptions = {}) {
  const { enabled = true } = options;

  const query = trpc.crm.deals.getById.useQuery(
    { id: id! },
    {
      enabled: enabled && !!id,
      staleTime: 60 * 1000,
    }
  );

  return {
    deal: query.data ? toDisplayDeal(query.data) : null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Get raw deal data without transformation
 */
export function useDealRaw(id: string | undefined, options: DealQueryOptions = {}) {
  const { enabled = true } = options;

  return trpc.crm.deals.getById.useQuery(
    { id: id! },
    {
      enabled: enabled && !!id,
      staleTime: 60 * 1000,
    }
  );
}

// ============================================
// PIPELINE HOOKS
// ============================================

/**
 * Get deal pipeline summary (deals grouped by stage)
 */
export function useDealPipeline(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  const query = trpc.crm.deals.pipelineSummary.useQuery(undefined, {
    enabled,
    staleTime: 30 * 1000,
  });

  return {
    pipeline: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================
// STATS HOOKS
// ============================================

/**
 * Get deal statistics for dashboard
 */
export function useDealStats(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  const query = trpc.crm.deals.getStats.useQuery(undefined, {
    enabled,
    staleTime: 60 * 1000, // 1 minute cache
  });

  return {
    stats: query.data ?? {
      total: 0,
      discovery: 0,
      qualification: 0,
      proposal: 0,
      negotiation: 0,
      won: 0,
      lost: 0,
      active: 0,
      pipelineValue: 0,
      wonValue: 0,
    },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================
// FILTERED HOOKS
// ============================================

/**
 * Get deals in discovery stage
 */
export function useDiscoveryDeals(options: Omit<DealsQueryOptions, 'stage'> = {}) {
  return useDeals({ ...options, stage: 'discovery' });
}

/**
 * Get deals in proposal stage
 */
export function useProposalDeals(options: Omit<DealsQueryOptions, 'stage'> = {}) {
  return useDeals({ ...options, stage: 'proposal' });
}

/**
 * Get deals in negotiation stage
 */
export function useNegotiationDeals(options: Omit<DealsQueryOptions, 'stage'> = {}) {
  return useDeals({ ...options, stage: 'negotiation' });
}

/**
 * Get deals for a specific account
 */
export function useAccountDeals(accountId: string, options: Omit<DealsQueryOptions, 'accountId'> = {}) {
  return useDeals({ ...options, accountId, enabled: !!accountId && options.enabled !== false });
}

// ============================================
// CACHE UTILITIES
// ============================================

/**
 * Prefetch deals data
 */
export function usePrefetchDeals() {
  const utils = trpc.useUtils();

  return (options: Omit<DealsQueryOptions, 'enabled'> = {}) => {
    return utils.crm.deals.list.prefetch({
      limit: options.limit ?? 50,
      offset: options.offset ?? 0,
      stage: options.stage,
      accountId: options.accountId,
    });
  };
}

/**
 * Invalidate deals cache
 */
export function useInvalidateDeals() {
  const utils = trpc.useUtils();

  return () => {
    return utils.crm.deals.list.invalidate();
  };
}
