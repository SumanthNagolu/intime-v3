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
  const { enabled = true, ...input } = options;

  const query = trpc.crm.accounts.list.useQuery(
    {
      limit: input.limit ?? 50,
      offset: input.offset ?? 0,
      status: input.status,
      search: input.search,
    },
    {
      enabled,
      staleTime: 30 * 1000,
      select: (data): DisplayAccount[] => {
        return data.map(account =>
          accountAdapter.toDisplay(account as AlignedAccount)
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
  const { enabled = true, ...input } = options;

  return trpc.crm.accounts.list.useQuery(
    {
      limit: input.limit ?? 50,
      offset: input.offset ?? 0,
      status: input.status,
      search: input.search,
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
        return accountAdapter.toDisplay(data as AlignedAccount);
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
          pocAdapter.toDisplay(poc as AlignedPointOfContact)
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
  const { enabled = true, query: searchQuery, ...filters } = options;

  const query = trpc.crm.accounts.list.useQuery(
    {
      search: searchQuery,
      status: filters.status,
      limit: 50,
      offset: 0,
    },
    {
      enabled: enabled && searchQuery.length >= 2,
      staleTime: 30 * 1000,
      select: (data): DisplayAccount[] => {
        return data.map(account =>
          accountAdapter.toDisplay(account as AlignedAccount)
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
 * Calculate account statistics
 */
export function useAccountStats(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  const query = trpc.crm.accounts.list.useQuery(
    { limit: 500, offset: 0 },
    {
      enabled,
      staleTime: 60 * 1000,
      select: (data): AccountStats => {
        const byStatus: Record<string, number> = {};
        const byTier: Record<string, number> = {};
        let activeClients = 0;

        data.forEach(account => {
          const status = account.accountStatus;
          const tier = (account as AlignedAccount).tier || 'none';

          byStatus[status] = (byStatus[status] || 0) + 1;
          byTier[tier] = (byTier[tier] || 0) + 1;

          if (status === 'active') {
            activeClients++;
          }
        });

        return {
          total: data.length,
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
    { limit: 200, offset: 0, status: 'active' },
    {
      enabled,
      staleTime: 60 * 1000,
      select: (data) => {
        return data.map(account => ({
          value: account.id,
          label: account.name,
          status: account.accountStatus,
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
      return utils.crm.accounts.list.prefetch({
        limit: options.limit ?? 50,
        offset: options.offset ?? 0,
        status: options.status,
        search: options.search,
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
