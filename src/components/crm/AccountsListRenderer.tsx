'use client';

/**
 * Accounts List Renderer
 *
 * A specialized renderer for the accounts list screen with improved layout,
 * RACI-based filtering, and better styling.
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
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
  X,
  FileSpreadsheet,
  CheckCircle2,
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
 * Helper function to convert data to CSV format
 */
function convertToCSV(data: Record<string, unknown>[], headers: string[]): string {
  const headerRow = headers.join(',');
  const rows = data.map(row =>
    headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      // Escape values containing commas, quotes, or newlines
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );
  return [headerRow, ...rows].join('\n');
}

/**
 * Helper function to parse CSV
 */
function parseCSV(csvText: string): { headers: string[], rows: Record<string, string>[] } {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    return row;
  });

  return { headers, rows };
}

/**
 * Accounts List Renderer Component
 */
export function AccountsListRenderer({ definition, className }: AccountsListRendererProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
    created?: number;
    skipped?: number;
  }>({ loading: false });
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    }
  );

  // Fetch account statistics
  const metricsQuery = trpc.crm.accounts.getStats.useQuery(undefined, {
    refetchInterval: 60000,
  });

  // Export mutation (using query that we fetch on demand)
  const exportQuery = trpc.crm.accounts.exportAll.useQuery(undefined, {
    enabled: false, // Manual trigger only
  });

  // Import mutation
  const importMutation = trpc.crm.accounts.bulkCreate.useMutation({
    onSuccess: (data) => {
      setImportStatus({
        loading: false,
        success: true,
        message: `Successfully imported ${data.created} accounts`,
        created: data.created,
        skipped: data.skipped,
      });
      // Refetch the accounts list
      accountsQuery.refetch();
      metricsQuery.refetch();
    },
    onError: (error) => {
      setImportStatus({
        loading: false,
        success: false,
        message: error.message || 'Failed to import accounts',
      });
    },
  });

  // Export handler
  const handleExport = useCallback(async () => {
    try {
      const result = await exportQuery.refetch();
      if (result.data) {
        const csv = convertToCSV(
          result.data.accounts as Record<string, unknown>[],
          result.data.headers
        );
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `accounts-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [exportQuery]);

  // Import handler
  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus({ loading: true });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const { rows } = parseCSV(csvText);

        // Valid enum values for validation
        const validIndustries = ['technology', 'healthcare', 'finance', 'banking', 'insurance', 'manufacturing', 'retail', 'consulting', 'government', 'education', 'energy', 'telecommunications', 'pharmaceutical', 'other'] as const;
        const validCompanyTypes = ['direct_client', 'implementation_partner', 'msp_vms', 'system_integrator', 'staffing_agency', 'vendor'] as const;
        const validStatuses = ['prospect', 'active', 'inactive', 'churned'] as const;
        const validTiers = ['enterprise', 'mid_market', 'smb', 'strategic'] as const;

        // Helper function to validate enum values
        const validateEnum = <T extends string>(value: string | undefined, validValues: readonly T[]): T | undefined => {
          if (!value) return undefined;
          const normalized = value.toLowerCase().trim();
          return validValues.includes(normalized as T) ? normalized as T : undefined;
        };

        // Map CSV rows to account objects
        const accountsToImport = rows.map(row => ({
          name: row.name || row.Name || '',
          industry: validateEnum(row.industry || row.Industry, validIndustries),
          companyType: validateEnum(row.companyType || row.company_type || row['Company Type'], validCompanyTypes),
          status: validateEnum(row.status || row.Status, validStatuses) || 'prospect',
          tier: validateEnum(row.tier || row.Tier, validTiers),
          website: row.website || row.Website || undefined,
          phone: row.phone || row.Phone || undefined,
          headquartersLocation: row.headquartersLocation || row.headquarters_location || row.Location || undefined,
          description: row.description || row.Description || undefined,
        })).filter(a => a.name); // Filter out rows without names

        if (accountsToImport.length === 0) {
          setImportStatus({
            loading: false,
            success: false,
            message: 'No valid accounts found in CSV. Make sure the file has a "name" column.',
          });
          return;
        }

        importMutation.mutate({
          accounts: accountsToImport,
          skipDuplicates: true,
        });
      } catch (error) {
        setImportStatus({
          loading: false,
          success: false,
          message: 'Failed to parse CSV file. Please check the format.',
        });
      }
    };

    reader.onerror = () => {
      setImportStatus({
        loading: false,
        success: false,
        message: 'Failed to read file.',
      });
    };

    reader.readAsText(file);

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [importMutation]);

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
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleImport}
              className="hidden"
            />
            <button
              onClick={() => setShowImportModal(true)}
              disabled={importMutation.isPending}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-stone-100 hover:bg-stone-200 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {importMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              Import
            </button>
            <button
              onClick={handleExport}
              disabled={exportQuery.isFetching}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-stone-100 hover:bg-stone-200 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {exportQuery.isFetching ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
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

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
            <div className="p-6 border-b border-stone-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-stone-900">Import Accounts</h2>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportStatus({ loading: false });
                  }}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {importStatus.success !== undefined ? (
                <div className={cn(
                  'p-4 rounded-lg mb-4',
                  importStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                )}>
                  <div className="flex items-start gap-3">
                    {importStatus.success ? (
                      <CheckCircle2 className="text-green-500 shrink-0" size={20} />
                    ) : (
                      <AlertCircle className="text-red-500 shrink-0" size={20} />
                    )}
                    <div>
                      <p className="font-medium">{importStatus.message}</p>
                      {importStatus.skipped !== undefined && importStatus.skipped > 0 && (
                        <p className="text-sm mt-1">
                          {importStatus.skipped} duplicate accounts were skipped.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="border-2 border-dashed border-stone-300 rounded-lg p-8 text-center">
                    <FileSpreadsheet className="mx-auto text-stone-400 mb-4" size={48} />
                    <p className="text-stone-600 mb-2">Upload a CSV file to import accounts</p>
                    <p className="text-sm text-stone-500 mb-4">
                      Required column: <span className="font-mono bg-stone-100 px-1">name</span>
                    </p>
                    <p className="text-xs text-stone-400 mb-4">
                      Optional: industry, companyType, status, tier, website, phone, headquartersLocation, description
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={importStatus.loading}
                      className="px-4 py-2 bg-rust text-white rounded-lg hover:bg-rust/90 transition-colors disabled:opacity-50"
                    >
                      {importStatus.loading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        'Select CSV File'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 rounded-b-xl">
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportStatus({ loading: false });
                  }}
                  className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900"
                >
                  {importStatus.success ? 'Done' : 'Cancel'}
                </button>
                {importStatus.success && (
                  <button
                    onClick={() => setImportStatus({ loading: false })}
                    className="px-4 py-2 text-sm font-medium bg-rust text-white rounded-lg hover:bg-rust/90"
                  >
                    Import More
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
