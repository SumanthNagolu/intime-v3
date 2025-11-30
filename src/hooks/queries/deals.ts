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
import type { OwnershipFilter } from '@/lib/validations/ownership';

// ============================================
// QUERY OPTIONS TYPES
// ============================================

export interface DealsQueryOptions {
  enabled?: boolean;
  limit?: number;
  offset?: number;
  stage?: 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  accountId?: string;
  ownership?: OwnershipFilter;
}

export type DealStage = 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface DealQueryOptions {
  enabled?: boolean;
}

// ============================================
// DISPLAY TYPE ADAPTER
// ============================================

// Extended display deal with additional fields for list views
export interface DealDisplayExtended extends DisplayDeal {
  accountName?: string;
  expectedCloseDate?: Date | string | null;
  createdAt?: Date | string;
}

type DealRawData = Record<string, unknown> & {
  id: string;
  stage: string;
};

function toDisplayDeal(deal: DealRawData): DealDisplayExtended {
  const leadId = typeof deal.leadId === 'string' ? deal.leadId : (deal.lead_id as string | undefined);
  const accountName = typeof deal.accountName === 'string' ? deal.accountName : (deal.account_name as string | undefined);
  const company = typeof deal.company === 'string' ? deal.company : undefined;
  const title = typeof deal.title === 'string' ? deal.title : '';
  const dealValue = typeof deal.dealValue === 'number' || typeof deal.dealValue === 'string'
    ? deal.dealValue
    : (deal.deal_value as number | string | undefined);
  const value = typeof deal.value === 'number' || typeof deal.value === 'string'
    ? deal.value
    : undefined;
  const probability = typeof deal.probability === 'number' ? deal.probability : 0;
  const expectedCloseDate = deal.expectedCloseDate instanceof Date || typeof deal.expectedCloseDate === 'string'
    ? deal.expectedCloseDate
    : (deal.expected_close_date as Date | string | null | undefined);
  const ownerId = typeof deal.ownerId === 'string' ? deal.ownerId : (deal.owner_id as string | undefined);
  const notes = typeof deal.notes === 'string' ? deal.notes : undefined;
  const accountId = typeof deal.accountId === 'string' ? deal.accountId : (deal.account_id as string | undefined);
  const linkedJobIds = Array.isArray(deal.linkedJobIds) ? deal.linkedJobIds as string[] : (deal.linked_job_ids as string[] | undefined);
  const createdAt = deal.createdAt instanceof Date || typeof deal.createdAt === 'string'
    ? deal.createdAt
    : (deal.created_at as Date | string | undefined);

  return {
    id: deal.id,
    leadId: leadId ?? '',
    company: accountName ?? company ?? '',
    title: title ?? '',
    value: String(dealValue ?? value ?? '0'),
    stage: mapStageToDisplay(deal.stage),
    probability: probability ?? 0,
    expectedClose: expectedCloseDate ? new Date(expectedCloseDate).toISOString() : '',
    ownerId: ownerId ?? '',
    notes,
    accountId,
    linkedJobIds,
    // Extended fields for our list views
    accountName: accountName ?? '',
    expectedCloseDate,
    createdAt,
  };
}

function mapStageToDisplay(stage: string): DisplayDeal['stage'] {
  const stageMap: Record<string, DisplayDeal['stage']> = {
    discovery: 'Discovery',
    qualification: 'Discovery',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
    closed_won: 'Won',
    closed_lost: 'Lost',
  };
  return stageMap[stage] || 'Prospect';
}

// ============================================
// LIST HOOKS
// ============================================

/**
 * Get list of deals with display formatting
 */
export function useDeals(options: DealsQueryOptions = {}): {
  deals: DealDisplayExtended[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
  isFetching: boolean;
} {
  const { enabled = true, ownership, ...input } = options;

  const query = trpc.crm.deals.list.useQuery(
    {
      limit: input.limit ?? 50,
      offset: input.offset ?? 0,
      stage: input.stage,
      accountId: input.accountId,
      ownership: ownership ?? 'my_items',
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
export function useDealStats(options: { enabled?: boolean; ownership?: OwnershipFilter } = {}) {
  const { enabled = true, ownership } = options;

  const query = trpc.crm.deals.list.useQuery(
    { limit: 500, offset: 0, ownership: ownership ?? 'my_items' },
    {
      enabled,
      staleTime: 60 * 1000, // 1 minute cache
      select: (data) => {
        let discovery = 0;
        let qualification = 0;
        let proposal = 0;
        let negotiation = 0;
        let won = 0;
        let lost = 0;
        let pipelineValue = 0;
        let wonValue = 0;

        data.forEach(deal => {
          const value = Number(deal.value || 0);
          switch (deal.stage) {
            case 'discovery': discovery++; pipelineValue += value; break;
            case 'qualification': qualification++; pipelineValue += value; break;
            case 'proposal': proposal++; pipelineValue += value; break;
            case 'negotiation': negotiation++; pipelineValue += value; break;
            case 'closed_won': won++; wonValue += value; break;
            case 'closed_lost': lost++; break;
          }
        });

        const active = discovery + qualification + proposal + negotiation;

        return {
          total: data.length,
          discovery,
          qualification,
          proposal,
          negotiation,
          won,
          lost,
          active,
          pipelineValue,
          wonValue,
        };
      },
    }
  );

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
