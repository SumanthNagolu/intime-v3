'use client';

/**
 * Leads List Renderer
 *
 * A specialized renderer for the leads list screen with improved layout,
 * filtering, and real-time data fetching from tRPC.
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import type { ScreenDefinition } from '@/lib/metadata/types';
import { cn } from '@/lib/utils';
import {
  Plus,
  Upload,
  Download,
  Search,
  User,
  Building2,
  Phone,
  Mail,
  ChevronRight,
  Loader2,
  AlertCircle,
  Target,
} from 'lucide-react';

interface LeadsListRendererProps {
  /** Screen definition */
  definition: ScreenDefinition;
  /** Additional className */
  className?: string;
}

// Status badge colors
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 border-blue-200',
  warm: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  hot: 'bg-orange-100 text-orange-700 border-orange-200',
  cold: 'bg-stone-100 text-stone-600 border-stone-200',
  converted: 'bg-green-100 text-green-700 border-green-200',
  lost: 'bg-red-100 text-red-700 border-red-200',
};

// Tier badge colors
const TIER_COLORS: Record<string, string> = {
  enterprise: 'bg-purple-100 text-purple-700 border-purple-200',
  mid_market: 'bg-blue-100 text-blue-700 border-blue-200',
  smb: 'bg-stone-100 text-stone-600 border-stone-200',
  strategic: 'bg-amber-100 text-amber-700 border-amber-200',
};

// Format currency
function formatCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

// Format date
function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Format relative date
function formatRelativeDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(date);
}

// Capitalize and format enum values
function formatEnum(value: string | null | undefined): string {
  if (!value) return '-';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Leads List Renderer Component
 */
export function LeadsListRenderer({ definition, className }: LeadsListRendererProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Fetch leads list
  const leadsQuery = trpc.crm.leads.list.useQuery(
    {
      limit: 100,
      offset: 0,
      status: statusFilter as 'new' | 'warm' | 'hot' | 'cold' | 'converted' | 'lost' | undefined,
    },
    {
      refetchInterval: 30000,
    }
  );

  // Fetch lead statistics
  const statsQuery = trpc.crm.leads.getStats.useQuery(undefined, {
    refetchInterval: 60000,
  });

  // Process data
  const leads = leadsQuery.data ?? [];
  const stats = statsQuery.data;

  // Calculate metrics from stats
  const metrics = useMemo(() => {
    if (!stats) {
      return {
        total: 0,
        newThisWeek: 0,
        qualified: 0,
        pipelineValue: 0,
      };
    }

    return {
      total: stats.total,
      newThisWeek: stats.new, // Using "new" status count as proxy for this week
      qualified: stats.hot + stats.warm, // Hot and warm leads are qualified
      pipelineValue: stats.totalValue,
    };
  }, [stats]);

  // Filter leads locally for instant feedback
  const filteredLeads = useMemo(() => {
    let filtered = leads;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.companyName?.toLowerCase().includes(query) ||
          lead.firstName?.toLowerCase().includes(query) ||
          lead.lastName?.toLowerCase().includes(query) ||
          lead.email?.toLowerCase().includes(query) ||
          lead.title?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [leads, searchQuery]);

  // Loading state
  const isLoading = leadsQuery.isLoading;

  // Error state
  if (leadsQuery.error) {
    return (
      <div className={cn('p-6 bg-red-50 border border-red-200 rounded-lg', className)}>
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h2 className="text-lg font-semibold text-red-800">Error Loading Leads</h2>
            <p className="mt-2 text-red-700">{leadsQuery.error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('leads-list space-y-6', className)}>
      {/* Header */}
      <header>
        <div className="flex items-start justify-between gap-4">
          <div>
            <nav className="mb-2">
              <ol className="flex items-center gap-2 text-sm text-stone-500">
                <li>CRM</li>
                <li>/</li>
                <li className="text-stone-900">Leads</li>
              </ol>
            </nav>
            <h1 className="text-2xl font-bold text-stone-900">Leads</h1>
            <p className="mt-1 text-stone-500">
              Manage your sales leads and prospects
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium bg-stone-100 hover:bg-stone-200 transition-colors flex items-center gap-2"
            >
              <Upload size={16} />
              Import
            </button>
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium bg-stone-100 hover:bg-stone-200 transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </button>
            <Link
              href="/employee/crm/leads/new"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-rust text-white hover:bg-rust/90 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Create Lead
            </Link>
          </div>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">
            Total Leads
          </div>
          <div className="mt-1 text-2xl font-bold text-stone-900">
            {isLoading ? '-' : metrics.total}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">
            New This Week
          </div>
          <div className="mt-1 text-2xl font-bold text-blue-600">
            {isLoading ? '-' : metrics.newThisWeek}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">
            Qualified
          </div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            {isLoading ? '-' : metrics.qualified}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">
            Pipeline Value
          </div>
          <div className="mt-1 text-2xl font-bold text-stone-900">
            {isLoading ? '-' : formatCurrency(metrics.pipelineValue)}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter(null)}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              !statusFilter ? 'bg-rust text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            )}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('new')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              statusFilter === 'new' ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            )}
          >
            New
          </button>
          <button
            onClick={() => setStatusFilter('hot')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              statusFilter === 'hot' ? 'bg-orange-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            )}
          >
            Hot
          </button>
          <button
            onClick={() => setStatusFilter('warm')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              statusFilter === 'warm' ? 'bg-yellow-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            )}
          >
            Warm
          </button>
          <button
            onClick={() => setStatusFilter('converted')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              statusFilter === 'converted' ? 'bg-green-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            )}
          >
            Converted
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-rust" size={32} />
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-12">
            <Target className="mx-auto text-stone-300" size={48} />
            <p className="mt-4 text-stone-500">No leads found</p>
            {searchQuery && (
              <p className="text-sm text-stone-400">Try adjusting your search terms</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Est. Value
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Last Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => router.push(`/employee/recruiting/leads/${lead.id}`)}
                    className="hover:bg-stone-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-rust/10 flex items-center justify-center">
                          {lead.leadType === 'company' ? (
                            <Building2 className="text-rust" size={20} />
                          ) : (
                            <User className="text-rust" size={20} />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-stone-900">
                            {lead.companyName || '-'}
                          </div>
                          {lead.industry && (
                            <div className="text-sm text-stone-500">{formatEnum(lead.industry)}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm text-stone-900">
                          {lead.firstName && lead.lastName
                            ? `${lead.firstName} ${lead.lastName}`
                            : lead.firstName || lead.lastName || '-'}
                        </div>
                        {lead.email && (
                          <div className="text-sm text-stone-500 flex items-center gap-1">
                            <Mail size={12} />
                            {lead.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-stone-600">
                        {lead.title || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          'inline-flex px-2.5 py-1 text-xs font-medium rounded-full border',
                          STATUS_COLORS[lead.status ?? ''] ?? 'bg-stone-100 text-stone-600 border-stone-200'
                        )}
                      >
                        {formatEnum(lead.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {lead.tier ? (
                        <span
                          className={cn(
                            'inline-flex px-2.5 py-1 text-xs font-medium rounded-full border',
                            TIER_COLORS[lead.tier] ?? 'bg-stone-100 text-stone-600 border-stone-200'
                          )}
                        >
                          {formatEnum(lead.tier)}
                        </span>
                      ) : (
                        <span className="text-stone-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm font-medium text-stone-900">
                        {formatCurrency(lead.estimatedValue)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-stone-600">
                        {formatEnum(lead.source)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-stone-500">
                        {formatRelativeDate(lead.lastContactedAt)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-stone-500">
                        {formatDate(lead.createdAt)}
                      </span>
                    </td>
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

      {/* Pagination info */}
      {!isLoading && filteredLeads.length > 0 && (
        <div className="text-sm text-stone-500 text-center">
          Showing {filteredLeads.length} of {stats?.total ?? filteredLeads.length} leads
        </div>
      )}
    </div>
  );
}

export default LeadsListRenderer;
