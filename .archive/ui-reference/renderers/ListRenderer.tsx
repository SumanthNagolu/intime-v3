'use client';

/**
 * List Renderer
 *
 * A specialized renderer for list screens that fetches data from tRPC
 * based on the entityType in the screen definition.
 * Supports filtering, pagination, and sorting.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import type { ScreenDefinition, SectionDefinition, RenderContext, TableColumnDefinition } from '../types';
import { LayoutRenderer } from './LayoutRenderer';
import { cn } from '@/lib/utils';
import {
  Search,
  Plus,
  Download,
  Upload,
  Loader2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

// Import and register widgets
import '@/lib/metadata/widgets/register-widgets';

interface ListRendererProps {
  /** Screen definition */
  definition: ScreenDefinition;
  /** Additional className */
  className?: string;
}

// Status badge colors
const STATUS_COLORS: Record<string, string> = {
  // Submission statuses
  sourced: 'bg-gray-100 text-gray-700 border-gray-200',
  screening: 'bg-blue-100 text-blue-700 border-blue-200',
  submission_ready: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  submitted: 'bg-purple-100 text-purple-700 border-purple-200',
  submitted_to_client: 'bg-purple-100 text-purple-700 border-purple-200',
  client_review: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  interview_scheduled: 'bg-orange-100 text-orange-700 border-orange-200',
  interview_completed: 'bg-amber-100 text-amber-700 border-amber-200',
  client_interview: 'bg-orange-100 text-orange-700 border-orange-200',
  offer_pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  offer_stage: 'bg-amber-100 text-amber-700 border-amber-200',
  placed: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  withdrawn: 'bg-stone-100 text-stone-700 border-stone-200',
  // Generic statuses
  active: 'bg-green-100 text-green-700 border-green-200',
  open: 'bg-green-100 text-green-700 border-green-200',
  closed: 'bg-stone-100 text-stone-600 border-stone-200',
  draft: 'bg-stone-100 text-stone-600 border-stone-200',
  on_hold: 'bg-amber-100 text-amber-700 border-amber-200',
  filled: 'bg-purple-100 text-purple-700 border-purple-200',
};

// Priority colors
const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-stone-100 text-stone-600',
};

// Format enum values
function formatEnum(value: string | null | undefined): string {
  if (!value) return '-';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Format relative time
function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

// Format date
function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Resolve nested path value
function resolveValue(obj: Record<string, unknown> | undefined, path: string): unknown {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/**
 * List Renderer Component
 */
export function ListRenderer({ definition, className }: ListRendererProps) {
  const router = useRouter();
  const entityType = definition.entityType || 'submission';

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Get table section from definition
  const tableSection = definition.layout?.sections?.find(
    (s: SectionDefinition) => s.type === 'table'
  );
  const columns = (tableSection?.columns_config || []) as TableColumnDefinition[];

  // Fetch data based on entity type
  const submissionsQuery = trpc.ats.submissions.listWithDetails.useQuery(
    { limit: 100 },
    {
      enabled: entityType === 'submission',
      refetchInterval: 30000,
    }
  );

  const jobsQuery = trpc.ats.jobs.list.useQuery(
    { limit: 100 },
    {
      enabled: entityType === 'job',
      refetchInterval: 30000,
    }
  );

  const candidatesQuery = trpc.ats.candidates.list.useQuery(
    { limit: 100 },
    {
      enabled: entityType === 'candidate',
      refetchInterval: 30000,
    }
  );

  // Bench consultants query for talent entity type
  const consultantsQuery = trpc.bench.getMyConsultants.useQuery(
    undefined,
    {
      enabled: entityType === 'talent' || entityType === 'consultant',
      refetchInterval: 30000,
    }
  );

  // Hotlists query
  const hotlistsQuery = trpc.bench.hotlists.list.useQuery(
    { limit: 100 },
    {
      enabled: entityType === 'hotlist',
      refetchInterval: 30000,
    }
  );

  // Hotlists stats query
  const hotlistsStatsQuery = trpc.bench.hotlists.getStats.useQuery(
    undefined,
    {
      enabled: entityType === 'hotlist',
      refetchInterval: 30000,
    }
  );

  // Job orders query
  const jobOrdersQuery = trpc.bench.jobOrders.list.useQuery(
    { limit: 100 },
    {
      enabled: entityType === 'job_order',
      refetchInterval: 30000,
    }
  );

  // Job orders stats query
  const jobOrdersStatsQuery = trpc.bench.jobOrders.getStats.useQuery(
    undefined,
    {
      enabled: entityType === 'job_order',
      refetchInterval: 30000,
    }
  );

  // Lead query
  const leadsQuery = trpc.crm.leads.list.useQuery(
    { limit: 100 },
    {
      enabled: entityType === 'lead',
      refetchInterval: 30000,
    }
  );

  // Deal query
  const dealsQuery = trpc.crm.deals.list.useQuery(
    { limit: 100 },
    {
      enabled: entityType === 'deal',
      refetchInterval: 30000,
    }
  );

  // Account query
  const accountsQuery = trpc.crm.accounts.list.useQuery(
    { limit: 100 },
    {
      enabled: entityType === 'account',
      refetchInterval: 30000,
    }
  );

  // Contact query
  const contactsQuery = trpc.crm.contacts.listAll.useQuery(
    { limit: 100 },
    {
      enabled: entityType === 'contact',
      refetchInterval: 30000,
    }
  );

  // Campaign query
  const campaignsQuery = trpc.crm.campaigns.list.useQuery(
    { limit: 100 },
    {
      enabled: entityType === 'campaign',
      refetchInterval: 30000,
    }
  );

  // Placement query
  const placementsQuery = trpc.ats.placements.list.useQuery(
    { limit: 100 },
    {
      enabled: entityType === 'placement',
      refetchInterval: 30000,
    }
  );

  // Select appropriate query based on entity type
  const query = entityType === 'submission'
    ? submissionsQuery
    : entityType === 'job'
    ? jobsQuery
    : entityType === 'candidate'
    ? candidatesQuery
    : entityType === 'talent' || entityType === 'consultant'
    ? consultantsQuery
    : entityType === 'hotlist'
    ? hotlistsQuery
    : entityType === 'job_order'
    ? jobOrdersQuery
    : entityType === 'lead'
    ? leadsQuery
    : entityType === 'deal'
    ? dealsQuery
    : entityType === 'account'
    ? accountsQuery
    : entityType === 'contact'
    ? contactsQuery
    : entityType === 'campaign'
    ? campaignsQuery
    : entityType === 'placement'
    ? placementsQuery
    : submissionsQuery;

  // Extract data based on response shape (CRM entities return { items, total }, others return array)
  const rawData = query.data;
  const paginatedEntityTypes = ['hotlist', 'job_order', 'lead', 'deal', 'account', 'contact', 'campaign', 'placement'];
  const data = paginatedEntityTypes.includes(entityType)
    ? ((rawData as { items?: unknown[] } | undefined)?.items || (rawData as unknown[]) || [])
    : (rawData || []);
  const isLoading = query.isLoading;
  const error = query.error;

  // Filter data
  const filteredData = useMemo(() => {
    let filtered = data as Record<string, unknown>[];

    // Apply search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        // Search across common fields
        const searchFields = [
          'candidate.fullName',
          'candidate.email',
          'job.title',
          'job.account.name',
          'title',
          'name',
          'fullName',
          'email',
          'description',
        ];
        return searchFields.some((field) => {
          const val = resolveValue(item, field);
          return val && String(val).toLowerCase().includes(q);
        });
      });
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    return filtered;
  }, [data, searchQuery, statusFilter]);

  // Stats - use dedicated stats queries if available
  const stats = useMemo(() => {
    // For hotlists, use the dedicated stats query
    if (entityType === 'hotlist' && hotlistsStatsQuery.data) {
      const s = hotlistsStatsQuery.data.stats;
      return {
        total: s.total,
        active: s.active,
        totalConsultants: s.totalConsultants,
        sentThisWeek: s.sentThisWeek,
      };
    }

    // For job orders, use the dedicated stats query
    if (entityType === 'job_order' && jobOrdersStatsQuery.data) {
      const s = jobOrdersStatsQuery.data.stats;
      return {
        total: s.total,
        open: s.open,
        urgent: s.urgent,
        submissionsThisWeek: s.submissionsThisWeek,
        placements: s.placements,
      };
    }

    // For other entity types, calculate from data
    const items = data as Record<string, unknown>[];
    return {
      total: items.length,
      active: items.filter(
        (i) => !['rejected', 'withdrawn', 'placed', 'closed', 'archived'].includes(i.status as string)
      ).length,
      placed: items.filter((i) => i.status === 'placed').length,
      interviewing: items.filter((i) =>
        ['interview_scheduled', 'interview_completed', 'client_interview'].includes(i.status as string)
      ).length,
    };
  }, [data, entityType, hotlistsStatsQuery.data, jobOrdersStatsQuery.data]);

  // Handle row click
  const handleRowClick = useCallback(
    (item: Record<string, unknown>) => {
      const id = item.id as string;
      const basePath =
        entityType === 'submission'
          ? '/employee/recruiting/submissions'
          : entityType === 'job'
          ? '/employee/recruiting/jobs'
          : entityType === 'candidate'
          ? '/employee/recruiting/talent'
          : entityType === 'talent' || entityType === 'consultant'
          ? '/employee/bench/talent'
          : entityType === 'hotlist'
          ? '/employee/bench/hotlists'
          : entityType === 'job_order'
          ? '/employee/bench/job-orders'
          : entityType === 'lead'
          ? '/employee/recruiting/leads'
          : entityType === 'deal'
          ? '/employee/recruiting/deals'
          : entityType === 'account'
          ? '/employee/recruiting/accounts'
          : entityType === 'contact'
          ? '/employee/recruiting/contacts'
          : entityType === 'campaign'
          ? '/employee/recruiting/campaigns'
          : entityType === 'placement'
          ? '/employee/recruiting/placements'
          : '/employee/recruiting/submissions';
      router.push(`${basePath}/${id}`);
    },
    [entityType, router]
  );

  // Render cell value
  const renderCellValue = useCallback(
    (item: Record<string, unknown>, col: TableColumnDefinition) => {
      const value = resolveValue(item, col.path || col.id);

      // Handle special column types
      switch (col.type) {
        case 'submission-status-badge':
        case 'status-badge':
        case 'job-status-badge':
        case 'candidate-status-badge': {
          const status = value as string;
          return (
            <span
              className={cn(
                'inline-flex px-2.5 py-1 text-xs font-medium rounded-full border',
                STATUS_COLORS[status] || 'bg-stone-100 text-stone-600 border-stone-200'
              )}
            >
              {formatEnum(status)}
            </span>
          );
        }

        case 'priority-badge': {
          const priority = value as string;
          if (!priority) return <span className="text-stone-400">-</span>;
          return (
            <span
              className={cn(
                'inline-flex px-2 py-0.5 text-xs font-medium rounded',
                PRIORITY_COLORS[priority] || 'bg-stone-100 text-stone-600'
              )}
            >
              {formatEnum(priority)}
            </span>
          );
        }

        case 'date':
          return <span className="text-stone-600">{formatDate(value as string)}</span>;

        case 'relative-time':
          return <span className="text-stone-500">{formatRelativeTime(value as string)}</span>;

        case 'number':
          return <span className="text-stone-600">{value != null ? String(value) : '-'}</span>;

        case 'sla-status-badge': {
          const sla = value as string;
          if (!sla) return <span className="text-stone-400">-</span>;
          const color =
            sla === 'on_track'
              ? 'text-green-600'
              : sla === 'at_risk'
              ? 'text-amber-600'
              : 'text-red-600';
          return <span className={cn('text-xs font-medium', color)}>{formatEnum(sla)}</span>;
        }

        case 'activity-overdue-badge': {
          const count = value as number;
          if (!count || count === 0) return null;
          return (
            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full">
              {count}
            </span>
          );
        }

        // Bench sales specific column types
        case 'bench-status-indicator': {
          const status = value as string;
          const colors: Record<string, string> = {
            green: 'bg-green-500',
            yellow: 'bg-yellow-500',
            orange: 'bg-orange-500',
            red: 'bg-red-500',
            black: 'bg-stone-700',
          };
          return (
            <div
              className={cn(
                'w-3 h-3 rounded-full',
                colors[status] || 'bg-stone-300'
              )}
              title={`${status} status`}
            />
          );
        }

        case 'days-on-bench-badge': {
          const days = value as number;
          if (days == null) return <span className="text-stone-400">-</span>;
          const color =
            days <= 15 ? 'bg-green-100 text-green-700' :
            days <= 30 ? 'bg-yellow-100 text-yellow-700' :
            days <= 60 ? 'bg-orange-100 text-orange-700' :
            days <= 90 ? 'bg-red-100 text-red-700' :
            'bg-stone-200 text-stone-700';
          return (
            <span className={cn('inline-flex px-2 py-0.5 text-xs font-medium rounded', color)}>
              {days}d
            </span>
          );
        }

        case 'visa-badge': {
          const visa = value as string;
          if (!visa || visa === 'Unknown') return <span className="text-stone-400">-</span>;
          return (
            <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-blue-50 text-blue-700">
              {formatEnum(visa)}
            </span>
          );
        }

        case 'tags-preview': {
          const tags = value as string[];
          if (!tags || !Array.isArray(tags) || tags.length === 0) {
            return <span className="text-stone-400">-</span>;
          }
          const maxTags = (col.config?.maxTags as number) || 3;
          const displayTags = tags.slice(0, maxTags);
          const remaining = tags.length - maxTags;
          return (
            <div className="flex flex-wrap gap-1">
              {displayTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex px-1.5 py-0.5 text-xs bg-stone-100 text-stone-600 rounded"
                >
                  {tag}
                </span>
              ))}
              {remaining > 0 && (
                <span className="text-xs text-stone-400">+{remaining}</span>
              )}
            </div>
          );
        }

        case 'currency': {
          const amount = value as number;
          if (amount == null) return <span className="text-stone-400">-</span>;
          const suffix = (col.config?.suffix as string) || '';
          return (
            <span className="text-stone-600 font-medium">
              ${amount}{suffix}
            </span>
          );
        }

        case 'user-avatar': {
          const name = value as string;
          if (!name) return <span className="text-stone-400">-</span>;
          const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
          return (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-rust/10 text-rust text-xs font-medium flex items-center justify-center">
                {initials}
              </div>
              <span className="text-sm text-stone-600">{name}</span>
            </div>
          );
        }

        default:
          // Handle link type in config
          if (col.config?.link && col.config?.linkPath) {
            const linkPath = (col.config.linkPath as string).replace(
              /\{\{([^}]+)\}\}/g,
              (_, path) => String(resolveValue(item, path) || '')
            );
            return (
              <Link
                href={linkPath}
                className="text-rust hover:underline font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                {value != null ? String(value) : '-'}
              </Link>
            );
          }
          return <span className="text-stone-600">{value != null ? String(value) : '-'}</span>;
      }
    },
    []
  );

  // Error state
  if (error) {
    return (
      <div className={cn('p-6 bg-red-50 border border-red-200 rounded-lg', className)}>
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h2 className="text-lg font-semibold text-red-800">Error Loading Data</h2>
            <p className="mt-2 text-red-700">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Get title from definition
  const title = typeof definition.title === 'string' ? definition.title : 'Items';
  const subtitle = typeof definition.subtitle === 'string' ? definition.subtitle : undefined;

  return (
    <div className={cn('list-renderer space-y-6', className)}>
      {/* Header */}
      <header>
        <div className="flex items-start justify-between gap-4">
          <div>
            <nav className="mb-2">
              <ol className="flex items-center gap-2 text-sm text-stone-500">
                <li>{entityType === 'hotlist' || entityType === 'consultant' || entityType === 'talent' || entityType === 'job_order' ? 'Bench Sales' : 'Recruiting'}</li>
                <li>/</li>
                <li className="text-stone-900">{title}</li>
              </ol>
            </nav>
            <h1 className="text-2xl font-bold text-stone-900">{title}</h1>
            {subtitle && <p className="mt-1 text-stone-500">{subtitle}</p>}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {definition.actions?.map((action) => {
              const isPrimary = action.variant === 'primary';
              const Icon =
                action.icon === 'Plus'
                  ? Plus
                  : action.icon === 'Upload'
                  ? Upload
                  : action.icon === 'Download'
                  ? Download
                  : null;

              const route =
                action.config &&
                'route' in action.config &&
                typeof action.config.route === 'string'
                  ? action.config.route
                  : undefined;

              if (route) {
                return (
                  <Link
                    key={action.id}
                    href={route}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                      isPrimary
                        ? 'bg-rust text-white hover:bg-rust/90'
                        : 'bg-stone-100 hover:bg-stone-200'
                    )}
                  >
                    {Icon && <Icon size={16} />}
                    {action.label}
                  </Link>
                );
              }

              return (
                <button
                  key={action.id}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                    isPrimary
                      ? 'bg-rust text-white hover:bg-rust/90'
                      : 'bg-stone-100 hover:bg-stone-200'
                  )}
                >
                  {Icon && <Icon size={16} />}
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">
            {entityType === 'hotlist' ? 'Total Hotlists' : entityType === 'job_order' ? 'Total Orders' : 'Total'}
          </div>
          <div className="mt-1 text-2xl font-bold text-stone-900">
            {isLoading ? '-' : stats.total}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">
            {entityType === 'job_order' ? 'Open' : 'Active'}
          </div>
          <div className="mt-1 text-2xl font-bold text-blue-600">
            {isLoading ? '-' : (entityType === 'job_order' ? (stats as { open?: number }).open || 0 : stats.active)}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">
            {entityType === 'hotlist' ? 'Total Consultants' : entityType === 'job_order' ? 'Urgent' : 'Interviewing'}
          </div>
          <div className="mt-1 text-2xl font-bold text-orange-600">
            {isLoading ? '-' : (
              entityType === 'hotlist'
                ? (stats as { totalConsultants?: number }).totalConsultants || 0
                : entityType === 'job_order'
                  ? (stats as { urgent?: number }).urgent || 0
                  : stats.interviewing
            )}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">
            {entityType === 'hotlist' ? 'Sent This Week' : entityType === 'job_order' ? 'Submissions (Week)' : 'Placed'}
          </div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            {isLoading ? '-' : (
              entityType === 'hotlist'
                ? (stats as { sentThisWeek?: number }).sentThisWeek || 0
                : entityType === 'job_order'
                  ? (stats as { submissionsThisWeek?: number }).submissionsThisWeek || 0
                  : stats.placed
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-500">Status:</span>
          <button
            onClick={() => setStatusFilter(null)}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              !statusFilter
                ? 'bg-rust text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            )}
          >
            All
          </button>
          {entityType === 'hotlist' ? (
            <>
              <button
                onClick={() => setStatusFilter('active')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  statusFilter === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                )}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('archived')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  statusFilter === 'archived'
                    ? 'bg-stone-500 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                )}
              >
                Archived
              </button>
            </>
          ) : entityType === 'job_order' ? (
            <>
              <button
                onClick={() => setStatusFilter('open')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  statusFilter === 'open'
                    ? 'bg-green-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                )}
              >
                Open
              </button>
              <button
                onClick={() => setStatusFilter('filled')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  statusFilter === 'filled'
                    ? 'bg-purple-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                )}
              >
                Filled
              </button>
              <button
                onClick={() => setStatusFilter('on_hold')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  statusFilter === 'on_hold'
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                )}
              >
                On Hold
              </button>
              <button
                onClick={() => setStatusFilter('closed')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  statusFilter === 'closed'
                    ? 'bg-stone-500 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                )}
              >
                Closed
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStatusFilter('submitted_to_client')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  statusFilter === 'submitted_to_client'
                    ? 'bg-purple-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                )}
              >
                Submitted
              </button>
              <button
                onClick={() => setStatusFilter('client_interview')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  statusFilter === 'client_interview'
                    ? 'bg-orange-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                )}
              >
                Interview
              </button>
              <button
                onClick={() => setStatusFilter('placed')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  statusFilter === 'placed'
                    ? 'bg-green-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                )}
              >
                Placed
              </button>
            </>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-rust" size={32} />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-stone-300 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <p className="text-stone-500">No {title.toLowerCase()} found</p>
            {searchQuery && (
              <p className="text-sm text-stone-400">Try adjusting your search terms</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  {columns.map((col) => (
                    <th
                      key={col.id}
                      className={cn(
                        'px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider',
                        col.width && `w-[${col.width}]`
                      )}
                    >
                      {col.header || col.label || col.id}
                    </th>
                  ))}
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredData.map((item) => (
                  <tr
                    key={item.id as string}
                    onClick={() => handleRowClick(item)}
                    className="hover:bg-stone-50 cursor-pointer transition-colors group"
                  >
                    {columns.map((col) => (
                      <td key={col.id} className="px-4 py-4">
                        {renderCellValue(item, col)}
                      </td>
                    ))}
                    <td className="px-4 py-4">
                      <ChevronRight
                        className="text-stone-300 group-hover:text-stone-500 transition-colors"
                        size={20}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results count */}
      {!isLoading && filteredData.length > 0 && (
        <div className="text-sm text-stone-500 text-center">
          Showing {filteredData.length} of {stats.total} {title.toLowerCase()}
        </div>
      )}
    </div>
  );
}

export default ListRenderer;
