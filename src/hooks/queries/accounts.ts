/**
 * Accounts Query Hooks
 *
 * React Query hooks for account-related data fetching.
 * Includes POCs, activity logs, and account statistics.
 */

import { trpc } from '@/lib/trpc/client';
import {
  accountAdapter,
  pocAdapter,
  type DisplayAccount,
  type DisplayPointOfContact,
} from '@/lib/adapters';
import type {
  AlignedAccount,
  AlignedPointOfContact,
  AccountStatus,
} from '@/types/aligned/crm';
import type { OwnershipFilter } from '@/lib/validations/ownership';

// ============================================
// QUERY OPTIONS TYPES
// ============================================

export interface AccountsQueryOptions {
  limit?: number;
  offset?: number;
  status?: AccountStatus;
  search?: string;
  tier?: string;
  enabled?: boolean;
  ownership?: OwnershipFilter;
}

export interface AccountQueryOptions {
  includePocs?: boolean;
  includeActivities?: boolean;
  enabled?: boolean;
}

// ============================================
// LIST HOOKS
// ============================================

/**
 * Fetch list of accounts with automatic type transformation
 *
 * @example
 * ```tsx
 * const { data: accounts } = useAccounts({ status: 'active' });
 * // accounts is DisplayAccount[] with frontend-friendly fields
 * ```
 */
export function useAccounts(options: AccountsQueryOptions = {}) {
  const { enabled = true, ownership, limit, offset, status, search, tier } = options;

  // Convert limit/offset to page/pageSize for the API
  const pageSize = limit ?? 50;
  const page = offset ? Math.floor(offset / pageSize) + 1 : 1;

  const query = trpc.crm.accounts.list.useQuery(
    {
      page,
      pageSize,
      search,
      filters: status || tier ? {
        status: status ? [status] : undefined,
        tier: tier ? [tier as 'enterprise' | 'mid_market' | 'smb' | 'strategic'] : undefined,
      } : undefined,
      // Note: ownership is handled by the ownershipProcedure middleware, not passed in input
    },
    {
      enabled,
      staleTime: 30 * 1000,
      select: (data): DisplayAccount[] => {
        return data.items.map(account =>
          accountAdapter.toDisplay(account as unknown as AlignedAccount)
        );
      },
    }
  );

  return {
    ...query,
    accounts: query.data ?? [],
    isEmpty: query.data?.length === 0,
  };
}

/**
 * Fetch accounts with raw database types
 */
export function useAccountsRaw(options: AccountsQueryOptions = {}) {
  const { enabled = true, limit, offset, status, search, tier } = options;

  // Convert limit/offset to page/pageSize for the API
  const pageSize = limit ?? 50;
  const page = offset ? Math.floor(offset / pageSize) + 1 : 1;

  return trpc.crm.accounts.list.useQuery(
    {
      page,
      pageSize,
      search,
      filters: status || tier ? {
        status: status ? [status] : undefined,
        tier: tier ? [tier as 'enterprise' | 'mid_market' | 'smb' | 'strategic'] : undefined,
      } : undefined,
    },
    { enabled }
  );
}

// ============================================
// SINGLE ITEM HOOKS
// ============================================

/**
 * Fetch single account by ID with automatic type transformation
 *
 * @example
 * ```tsx
 * const { data: account } = useAccount(accountId);
 * // account is DisplayAccount with frontend-friendly fields
 * ```
 */
export function useAccount(id: string | undefined, options: AccountQueryOptions = {}) {
  const { enabled = true } = options;

  const query = trpc.crm.accounts.getById.useQuery(
    { id: id! },
    {
      enabled: enabled && !!id,
      staleTime: 30 * 1000,
      select: (data): DisplayAccount => {
        return accountAdapter.toDisplay(data as unknown as AlignedAccount);
      },
    }
  );

  return {
    ...query,
    account: query.data,
  };
}

/**
 * Fetch single account with raw database types
 */
export function useAccountRaw(id: string | undefined, options: AccountQueryOptions = {}) {
  const { enabled = true } = options;

  return trpc.crm.accounts.getById.useQuery(
    { id: id! },
    { enabled: enabled && !!id }
  );
}

// ============================================
// POC (POINT OF CONTACT) HOOKS
// ============================================

/**
 * Fetch POCs for an account
 *
 * @example
 * ```tsx
 * const { pocs } = useAccountPocs(accountId);
 * // pocs is DisplayPointOfContact[]
 * ```
 */
export function useAccountPocs(accountId: string | undefined, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  const query = trpc.crm.pocs.list.useQuery(
    { accountId: accountId! },
    {
      enabled: enabled && !!accountId,
      staleTime: 30 * 1000,
      select: (data): DisplayPointOfContact[] => {
        return data.map(poc =>
          pocAdapter.toDisplay(poc as unknown as AlignedPointOfContact)
        );
      },
    }
  );

  return {
    ...query,
    pocs: query.data ?? [],
    primaryPoc: query.data?.find(poc => poc.id === query.data?.[0]?.id),
  };
}

// ============================================
// STATUS-FILTERED HOOKS
// ============================================

/**
 * Fetch active accounts
 */
export function useActiveAccounts(options: Omit<AccountsQueryOptions, 'status'> = {}) {
  return useAccounts({ ...options, status: 'active' });
}

/**
 * Fetch prospect accounts
 */
export function useProspectAccounts(options: Omit<AccountsQueryOptions, 'status'> = {}) {
  return useAccounts({ ...options, status: 'prospect' });
}

/**
 * Fetch accounts on hold
 */
export function useHoldAccounts(options: Omit<AccountsQueryOptions, 'status'> = {}) {
  return useAccounts({ ...options, status: 'inactive' });
}

// ============================================
// SEARCH HOOKS
// ============================================

export interface AccountSearchOptions {
  query: string;
  status?: AccountStatus;
  tier?: string;
  enabled?: boolean;
}

/**
 * Search accounts by name or other criteria
 *
 * @example
 * ```tsx
 * const { accounts } = useAccountSearch({ query: 'Tech Corp' });
 * ```
 */
export function useAccountSearch(options: AccountSearchOptions) {
  const { enabled = true, query: searchQuery, status, tier } = options;

  const query = trpc.crm.accounts.list.useQuery(
    {
      search: searchQuery,
      page: 1,
      pageSize: 50,
      filters: status || tier ? {
        status: status ? [status] : undefined,
        tier: tier ? [tier as 'enterprise' | 'mid_market' | 'smb' | 'strategic'] : undefined,
      } : undefined,
    },
    {
      enabled: enabled && searchQuery.length >= 2,
      staleTime: 30 * 1000,
      select: (data): DisplayAccount[] => {
        return data.items.map(account =>
          accountAdapter.toDisplay(account as unknown as AlignedAccount)
        );
      },
    }
  );

  return {
    ...query,
    accounts: query.data ?? [],
    isEmpty: query.data?.length === 0,
  };
}

// ============================================
// TIER-SPECIFIC HOOKS
// ============================================

/**
 * Fetch accounts by tier (platinum, gold, silver, bronze)
 */
export function useAccountsByTier(tier: string, options: Omit<AccountsQueryOptions, 'tier'> = {}) {
  // Note: This would need a tier filter added to the backend
  const query = useAccounts(options);

  return {
    ...query,
    accounts: query.accounts.filter(account => account.tier === tier),
  };
}

// ============================================
// STATISTICS HOOKS
// ============================================

export interface AccountStats {
  total: number;
  byStatus: Record<string, number>;
  byTier: Record<string, number>;
  activeClients: number;
}

/**
 * Calculate account statistics - client-side aggregation
 */
export function useAccountStats(options: { enabled?: boolean; ownership?: OwnershipFilter } = {}) {
  const { enabled = true } = options;

  const query = trpc.crm.accounts.list.useQuery(
    { page: 1, pageSize: 500 },
    {
      enabled,
      staleTime: 60 * 1000,
      select: (data): AccountStats => {
        const byStatus: Record<string, number> = {};
        const byTier: Record<string, number> = {};
        let activeClients = 0;

        data.items.forEach(account => {
          const status = account.status || 'unknown';
          const tier = account.tier || 'none';

          byStatus[status] = (byStatus[status] || 0) + 1;
          byTier[tier] = (byTier[tier] || 0) + 1;

          if (status === 'active') {
            activeClients++;
          }
        });

        return {
          total: data.items.length,
          byStatus,
          byTier,
          activeClients,
        };
      },
    }
  );

  return {
    ...query,
    stats: query.data ?? {
      total: 0,
      byStatus: {},
      byTier: {},
      activeClients: 0,
    },
  };
}

// ============================================
// METRICS HOOKS (Server-side aggregation)
// ============================================

export interface AccountMetrics {
  byStatus: Record<string, number>;
  byTier: Record<string, number>;
  byIndustry: Record<string, number>;
  byCompanyType: Record<string, number>;
  totalRevenueTarget: number;
  avgRevenueTarget: number;
}

/**
 * Fetch account metrics - server-side aggregation
 * More efficient for large datasets compared to client-side aggregation
 *
 * @example
 * ```tsx
 * const { metrics } = useAccountMetrics();
 * console.log(metrics.byStatus.active); // Number of active accounts
 * console.log(metrics.totalRevenueTarget); // Total revenue target
 * ```
 */
export function useAccountMetrics(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  const query = trpc.crm.accounts.getMetrics.useQuery(undefined, {
    enabled,
    staleTime: 60 * 1000,
  });

  return {
    ...query,
    metrics: query.data ?? {
      byStatus: {},
      byTier: {},
      byIndustry: {},
      byCompanyType: {},
      totalRevenueTarget: 0,
      avgRevenueTarget: 0,
    },
  };
}

// ============================================
// ACCOUNT SELECT HOOKS
// ============================================

/**
 * Fetch accounts formatted for select/dropdown components
 *
 * @example
 * ```tsx
 * const { options } = useAccountOptions();
 * // options is [{ value: 'id', label: 'Account Name' }, ...]
 * ```
 */
export function useAccountOptions(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  const query = trpc.crm.accounts.list.useQuery(
    { page: 1, pageSize: 200, filters: { status: ['active'] } },
    {
      enabled,
      staleTime: 60 * 1000,
      select: (data) => {
        return data.items.map(account => ({
          value: account.id,
          label: account.name,
          status: account.status,
        }));
      },
    }
  );

  return {
    ...query,
    options: query.data ?? [],
  };
}

// ============================================
// PREFETCH UTILITIES
// ============================================

/**
 * Prefetch accounts data for faster navigation
 */
export function usePrefetchAccounts() {
  const utils = trpc.useUtils();

  return {
    prefetchList: (options: Omit<AccountsQueryOptions, 'enabled'> = {}) => {
      const pageSize = options.limit ?? 50;
      const page = options.offset ? Math.floor(options.offset / pageSize) + 1 : 1;

      return utils.crm.accounts.list.prefetch({
        page,
        pageSize,
        search: options.search,
        filters: options.status ? { status: [options.status] } : undefined,
      });
    },
    prefetchAccount: (id: string) => {
      return utils.crm.accounts.getById.prefetch({ id });
    },
  };
}

// ============================================
// INVALIDATION UTILITIES
// ============================================

/**
 * Utilities for invalidating account queries after mutations
 */
export function useInvalidateAccounts() {
  const utils = trpc.useUtils();

  return {
    invalidateAll: () => utils.crm.accounts.list.invalidate(),
    invalidateAccount: (id: string) => utils.crm.accounts.getById.invalidate({ id }),
    invalidatePocs: (accountId: string) =>
      utils.crm.pocs.list.invalidate({ accountId }),
  };
}
