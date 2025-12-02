'use client';

/**
 * Accounts List Renderer
 *
 * A specialized renderer for the accounts list screen with improved layout,
 * RACI-based filtering, and better styling.
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
  Building2,
  Phone,
  Globe,
  ChevronRight,
  Filter,
  Loader2,
  AlertCircle,
} from 'lucide-react';

// Import and register widgets
import '@/lib/metadata/widgets/register-widgets';

interface AccountsListRendererProps {
  /** Screen definition */
  definition: ScreenDefinition;
  /** Additional className */
  className?: string;
}

// Status badge colors
const STATUS_COLORS: Record<string, string> = {
  prospect: 'bg-blue-100 text-blue-700 border-blue-200',
  active: 'bg-green-100 text-green-700 border-green-200',
  inactive: 'bg-stone-100 text-stone-600 border-stone-200',
  churned: 'bg-red-100 text-red-700 border-red-200',
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

// Capitalize and format enum values
function formatEnum(value: string | null | undefined): string {
  if (!value) return '-';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Accounts List Renderer Component
 */
export function AccountsListRenderer({ definition, className }: AccountsListRendererProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Fetch accounts list with RACI-based filtering (ownershipProcedure handles this)
  const accountsQuery = trpc.crm.accounts.list.useQuery(
    {
      page: 1,
      pageSize: 100,
      search: searchQuery || undefined,
      filters: statusFilter ? { status: [statusFilter as 'prospect' | 'active' | 'inactive' | 'churned'] } : undefined,
    },
    {
      refetchInterval: 30000,
      keepPreviousData: true,
    }
  );

  // Fetch account metrics
  const metricsQuery = trpc.crm.accounts.getMetrics.useQuery(undefined, {
    refetchInterval: 60000,
  });

  // Process data
  const accounts = accountsQuery.data?.items ?? [];
  const total = accountsQuery.data?.total ?? 0;
  const metrics = metricsQuery.data;

  // Filter accounts locally for instant feedback
  const filteredAccounts = useMemo(() => {
    let filtered = accounts;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (account) =>
          account.name?.toLowerCase().includes(query) ||
          account.website?.toLowerCase().includes(query) ||
          account.headquartersLocation?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [accounts, searchQuery]);

  // Loading state
  const isLoading = accountsQuery.isLoading;

  // Error state
  if (accountsQuery.error) {
    return (
      <div className={cn('p-6 bg-red-50 border border-red-200 rounded-lg', className)}>
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5\" size={20} />
          <div>
            <h2 className="text-lg font-semibold text-red-800">Error Loading Accounts</h2>
            <p className="mt-2 text-red-700">{accountsQuery.error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('accounts-list space-y-6', className)}>
      {/* Header */}
      <header>
        <div className="flex items-start justify-between gap-4">
          <div>
            <nav className="mb-2">
              <ol className="flex items-center gap-2 text-sm text-stone-500">
                <li>CRM</li>
                <li>/</li>
                <li className="text-stone-900">Accounts</li>
              </ol>
            </nav>
            <h1 className="text-2xl font-bold text-stone-900">Accounts</h1>
            <p className="mt-1 text-stone-500">
              Manage client accounts and relationships
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => console.log('Import')}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-stone-100 hover:bg-stone-200 transition-colors flex items-center gap-2"
            >
              <Upload size={16} />
              Import
            </button>
            <button
              onClick={() => console.log('Export')}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-stone-100 hover:bg-stone-200 transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </button>
            <Link
              href="/employee/recruiting/accounts/new"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-rust text-white hover:bg-rust/90 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              New Account
            </Link>
          </div>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">
            Total Accounts
          </div>
          <div className="mt-1 text-2xl font-bold text-stone-900">
            {isLoading ? '-' : total}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">
            Active
          </div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            {isLoading ? '-' : metrics?.byStatus?.active ?? 0}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">
            Prospects
          </div>
          <div className="mt-1 text-2xl font-bold text-blue-600">
            {isLoading ? '-' : metrics?.byStatus?.prospect ?? 0}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">
            Revenue Target
          </div>
          <div className="mt-1 text-2xl font-bold text-stone-900">
            {isLoading ? '-' : formatCurrency(metrics?.totalRevenueTarget)}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="Search accounts..."
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
            onClick={() => setStatusFilter('active')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              statusFilter === 'active' ? 'bg-green-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            )}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter('prospect')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              statusFilter === 'prospect' ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            )}
          >
            Prospect
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              statusFilter === 'inactive' ? 'bg-stone-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            )}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-rust" size={32} />
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="mx-auto text-stone-300" size={48} />
            <p className="mt-4 text-stone-500">No accounts found</p>
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
                    Account
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Revenue Target
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredAccounts.map((account) => (
                  <tr
                    key={account.id}
                    onClick={() => router.push(`/employee/recruiting/accounts/${account.id}`)}
                    className="hover:bg-stone-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-rust/10 flex items-center justify-center">
                          <Building2 className="text-rust" size={20} />
                        </div>
                        <div>
                          <div className="font-medium text-stone-900">{account.name}</div>
                          {account.headquartersLocation && (
                            <div className="text-sm text-stone-500">{account.headquartersLocation}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-stone-600">
                        {formatEnum(account.industry)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-stone-600">
                        {formatEnum(account.companyType)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          'inline-flex px-2.5 py-1 text-xs font-medium rounded-full border',
                          STATUS_COLORS[account.status ?? ''] ?? 'bg-stone-100 text-stone-600 border-stone-200'
                        )}
                      >
                        {formatEnum(account.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {account.tier ? (
                        <span
                          className={cn(
                            'inline-flex px-2.5 py-1 text-xs font-medium rounded-full border',
                            TIER_COLORS[account.tier] ?? 'bg-stone-100 text-stone-600 border-stone-200'
                          )}
                        >
                          {formatEnum(account.tier)}
                        </span>
                      ) : (
                        <span className="text-stone-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm font-medium text-stone-900">
                        {formatCurrency(account.annualRevenueTarget)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        {account.phone && (
                          <a
                            href={`tel:${account.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm text-rust hover:underline flex items-center gap-1"
                          >
                            <Phone size={12} />
                            {account.phone}
                          </a>
                        )}
                        {account.website && (
                          <a
                            href={account.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm text-rust hover:underline flex items-center gap-1 truncate max-w-[150px]"
                          >
                            <Globe size={12} />
                            {account.website.replace(/^https?:\/\//, '')}
                          </a>
                        )}
                        {!account.phone && !account.website && (
                          <span className="text-stone-400 text-sm">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-stone-500">
                        {formatDate(account.createdAt)}
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
      {!isLoading && filteredAccounts.length > 0 && (
        <div className="text-sm text-stone-500 text-center">
          Showing {filteredAccounts.length} of {total} accounts
        </div>
      )}
    </div>
  );
}

export default AccountsListRenderer;
