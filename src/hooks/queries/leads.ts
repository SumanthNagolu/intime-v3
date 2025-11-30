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
import type { OwnershipFilter } from '@/lib/validations/ownership';

// ============================================
// QUERY OPTIONS TYPES
// ============================================

export interface LeadsQueryOptions {
  enabled?: boolean;
  limit?: number;
  offset?: number;
  status?: 'new' | 'warm' | 'hot' | 'cold' | 'converted' | 'lost';
  accountId?: string;
  ownership?: OwnershipFilter;
}

export interface LeadQueryOptions {
  enabled?: boolean;
}

// ============================================
// DISPLAY TYPE ADAPTER
// ============================================

interface LeadData {
  id: string;
  orgId: string;
  leadType: string;
  companyName: string | null;
  industry: string | null;
  companyType: string | null;
  companySize: string | null;
  website: string | null;
  headquarters: string | null;
  contactRole: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  phoneExt: string | null;
  linkedinUrl: string | null;
  decisionAuthority: string | null;
  status: string;
  source: string | null;
  sourceDetails: string | null;
  estimatedValue: number | null;
  expectedCloseDate: string | null;
  lastContactDate: string | null;
  notes: string | null;
  accountId: string | null;
  pocId: string | null;
  ownerId: string | null;
  assignedToId: string | null;
  conversionDate: string | null;
  lostReason: string | null;
  engagementScore: number | null;
  qualificationNotes: string | null;
  tags: string[] | null;
  customFields: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: Date | null;
}

function toDisplayLead(lead: LeadData): DisplayLead {
  return {
    id: lead.id,
    leadType: lead.leadType as 'company' | 'person',
    companyName: lead.companyName ?? '',
    firstName: lead.firstName ?? '',
    lastName: lead.lastName ?? '',
    title: lead.title ?? undefined,
    email: lead.email ?? undefined,
    phone: lead.phone ?? undefined,
    status: lead.status as 'new' | 'warm' | 'hot' | 'cold' | 'converted' | 'lost',
    source: lead.source ?? undefined,
    estimatedValue: lead.estimatedValue ?? undefined,
    accountId: lead.accountId ?? undefined,
    ownerId: lead.ownerId ?? undefined,
    createdAt: new Date(lead.createdAt),
    notes: lead.notes ?? undefined,
    industry: lead.industry ?? undefined,
    companySize: lead.companySize ?? undefined,
    engagementScore: lead.engagementScore ?? undefined,
  };
}

// ============================================
// LIST HOOKS
// ============================================

/**
 * Get list of leads with display formatting
 */
export function useLeads(options: LeadsQueryOptions = {}) {
  const { enabled = true, ownership, ...input } = options;

  const query = trpc.crm.leads.list.useQuery(
    {
      limit: input.limit ?? 50,
      offset: input.offset ?? 0,
      status: input.status,
      accountId: input.accountId,
      ownership: ownership ?? 'my_items',
    },
    {
      enabled,
      staleTime: 30 * 1000,
    }
  );

  return {
    leads: (query.data ?? []).map((lead) => toDisplayLead(lead as unknown as LeadData)),
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
 * Get warm leads (qualified)
 */
export function useWarmLeads(options: Omit<LeadsQueryOptions, 'status'> = {}) {
  return useLeads({ ...options, status: 'warm' });
}

/**
 * Get hot leads (high priority)
 */
export function useHotLeads(options: Omit<LeadsQueryOptions, 'status'> = {}) {
  return useLeads({ ...options, status: 'hot' });
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

// ============================================
// SINGLE LEAD HOOKS
// ============================================

/**
 * Get single lead by ID
 */
export function useLead(id: string | undefined, options: LeadQueryOptions = {}) {
  const { enabled = true } = options;

  const query = trpc.crm.leads.getById.useQuery(
    { id: id! },
    {
      enabled: enabled && !!id,
      staleTime: 30 * 1000,
    }
  );

  return {
    lead: query.data ? toDisplayLead(query.data as unknown as LeadData) : null,
    leadRaw: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Get raw lead data by ID without transformation
 */
export function useLeadRaw(id: string | undefined, options: LeadQueryOptions = {}) {
  const { enabled = true } = options;

  return trpc.crm.leads.getById.useQuery(
    { id: id! },
    {
      enabled: enabled && !!id,
      staleTime: 30 * 1000,
    }
  );
}

// ============================================
// STATS HOOKS
// ============================================

/**
 * Get lead statistics for dashboard
 */
export function useLeadStats(options: { enabled?: boolean; ownership?: OwnershipFilter } = {}) {
  const { enabled = true, ownership } = options;

  const query = trpc.crm.leads.list.useQuery(
    { limit: 500, offset: 0, ownership: ownership ?? 'my_items' },
    {
      enabled,
      staleTime: 60 * 1000, // 1 minute cache
      select: (data) => {
        let newCount = 0;
        let warm = 0;
        let hot = 0;
        let cold = 0;
        let converted = 0;
        let lost = 0;
        let totalValue = 0;

        data.forEach(lead => {
          switch (lead.status) {
            case 'new': newCount++; break;
            case 'warm': warm++; break;
            case 'hot': hot++; break;
            case 'cold': cold++; break;
            case 'converted': converted++; break;
            case 'lost': lost++; break;
          }
          if (lead.estimatedValue) {
            totalValue += Number(lead.estimatedValue);
          }
        });

        return {
          total: data.length,
          new: newCount,
          warm,
          hot,
          cold,
          converted,
          lost,
          totalValue,
        };
      },
    }
  );

  return {
    stats: query.data ?? {
      total: 0,
      new: 0,
      warm: 0,
      hot: 0,
      cold: 0,
      converted: 0,
      lost: 0,
      totalValue: 0,
    },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================
// ACTIVITY HOOKS
// ============================================

/**
 * Get activities for a lead
 * Now uses the unified activities table
 */
export function useLeadActivities(leadId: string | undefined, options: { enabled?: boolean; limit?: number } = {}) {
  const { enabled = true, limit = 50 } = options;

  // Use the new unified activities API
  const query = trpc.activities.list.useQuery(
    {
      entityType: 'lead',
      entityId: leadId!,
      limit,
      includeCompleted: true,
    },
    {
      enabled: enabled && !!leadId,
      staleTime: 30 * 1000,
    }
  );

  return {
    activities: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
