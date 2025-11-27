/**
 * Leads Query Hooks
 *
 * React Query hooks for CRM leads data.
 *
 * Usage:
 * ```typescript
 * import { useLeads, useLead } from '@/hooks/queries/leads';
 *
 * function LeadsList() {
 *   const { leads, isLoading } = useLeads({ status: 'qualified' });
 *   // ...
 * }
 * ```
 */

import { trpc } from '@/lib/trpc/client';
import type { DisplayLead } from '@/types/aligned';

// ============================================
// QUERY OPTIONS TYPES
// ============================================

export interface LeadsQueryOptions {
  enabled?: boolean;
  limit?: number;
  offset?: number;
  status?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  accountId?: string;
}

export interface LeadQueryOptions {
  enabled?: boolean;
}

// ============================================
// DISPLAY TYPE ADAPTER
// ============================================

function toDisplayLead(lead: any): DisplayLead {
  return {
    id: lead.id,
    companyName: lead.companyName || '',
    firstName: lead.firstName || '',
    lastName: lead.lastName || '',
    email: lead.email || '',
    phone: lead.phone || '',
    status: lead.status || 'new',
    source: lead.source || 'manual',
    estimatedValue: lead.estimatedValue ? Number(lead.estimatedValue) : 0,
    accountId: lead.accountId,
    ownerId: lead.ownerId,
    createdAt: lead.createdAt,
    notes: lead.notes,
  };
}

// ============================================
// LIST HOOKS
// ============================================

/**
 * Get list of leads with display formatting
 */
export function useLeads(options: LeadsQueryOptions = {}) {
  const { enabled = true, ...input } = options;

  const query = trpc.crm.leads.list.useQuery(
    {
      limit: input.limit ?? 50,
      offset: input.offset ?? 0,
      status: input.status,
      accountId: input.accountId,
    },
    {
      enabled,
      staleTime: 30 * 1000,
    }
  );

  return {
    leads: (query.data ?? []).map(toDisplayLead),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

/**
 * Get raw leads data without transformation
 */
export function useLeadsRaw(options: LeadsQueryOptions = {}) {
  const { enabled = true, ...input } = options;

  return trpc.crm.leads.list.useQuery(
    {
      limit: input.limit ?? 50,
      offset: input.offset ?? 0,
      status: input.status,
      accountId: input.accountId,
    },
    {
      enabled,
      staleTime: 30 * 1000,
    }
  );
}

// ============================================
// FILTERED HOOKS
// ============================================

/**
 * Get new leads
 */
export function useNewLeads(options: Omit<LeadsQueryOptions, 'status'> = {}) {
  return useLeads({ ...options, status: 'new' });
}

/**
 * Get qualified leads
 */
export function useQualifiedLeads(options: Omit<LeadsQueryOptions, 'status'> = {}) {
  return useLeads({ ...options, status: 'qualified' });
}

/**
 * Get leads in negotiation
 */
export function useNegotiationLeads(options: Omit<LeadsQueryOptions, 'status'> = {}) {
  return useLeads({ ...options, status: 'negotiation' });
}

/**
 * Get leads for a specific account
 */
export function useAccountLeads(accountId: string, options: Omit<LeadsQueryOptions, 'accountId'> = {}) {
  return useLeads({ ...options, accountId, enabled: !!accountId && options.enabled !== false });
}

// ============================================
// CACHE UTILITIES
// ============================================

/**
 * Prefetch leads data
 */
export function usePrefetchLeads() {
  const utils = trpc.useUtils();

  return (options: Omit<LeadsQueryOptions, 'enabled'> = {}) => {
    return utils.crm.leads.list.prefetch({
      limit: options.limit ?? 50,
      offset: options.offset ?? 0,
      status: options.status,
      accountId: options.accountId,
    });
  };
}

/**
 * Invalidate leads cache
 */
export function useInvalidateLeads() {
  const utils = trpc.useUtils();

  return () => {
    return utils.crm.leads.list.invalidate();
  };
}
