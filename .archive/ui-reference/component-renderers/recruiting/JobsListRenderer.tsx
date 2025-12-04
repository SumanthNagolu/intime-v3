'use client';

/**
 * Jobs List Renderer
 *
 * A specialized renderer for the jobs list screen with filtering,
 * RACI-based ownership filtering, and proper data display.
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import type { ScreenDefinition } from '@/lib/metadata/types';
import { cn } from '@/lib/utils';
import {
  Plus,
  Download,
  Search,
  Briefcase,
  ChevronRight,
  Loader2,
  AlertCircle,
  MapPin,
  Clock,
  Users,
  Building2,
} from 'lucide-react';

// Import and register widgets
import '@/lib/metadata/widgets/register-widgets';

interface JobsListRendererProps {
  /** Screen definition */
  definition: ScreenDefinition;
  /** Additional className */
  className?: string;
}

// Status badge colors
const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-stone-100 text-stone-600 border-stone-200',
  open: 'bg-green-100 text-green-700 border-green-200',
  urgent: 'bg-red-100 text-red-700 border-red-200',
  on_hold: 'bg-amber-100 text-amber-700 border-amber-200',
  filled: 'bg-blue-100 text-blue-700 border-blue-200',
  closed: 'bg-stone-100 text-stone-500 border-stone-200',
};

// Priority badge colors
const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-blue-100 text-blue-700 border-blue-200',
  low: 'bg-stone-100 text-stone-600 border-stone-200',
};

// Format date
function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Calculate days open
function calculateDaysOpen(createdAt: string | Date | null | undefined): number {
  if (!createdAt) return 0;
  const d = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Capitalize and format enum values
function formatEnum(value: string | null | undefined): string {
  if (!value) return '-';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Job type display mapping
const JOB_TYPE_DISPLAY: Record<string, string> = {
  contract: 'Contract',
  c2c: 'C2C',
  w2: 'W2',
  fulltime: 'Full-time',
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract_to_hire: 'C2H',
};

/**
 * Jobs List Renderer Component
 */
export function JobsListRenderer({ definition, className }: JobsListRendererProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [clientFilter, setClientFilter] = useState<string | null>(null);
  const [myJobsOnly, setMyJobsOnly] = useState(false);

  // Fetch jobs list with RACI-based filtering
  const jobsQuery = trpc.ats.jobs.list.useQuery(
    {
      limit: 100,
      offset: 0,
      status: statusFilter as 'draft' | 'open' | 'on_hold' | 'filled' | 'closed' | undefined,
      clientId: clientFilter ?? undefined,
      ownership: myJobsOnly ? 'my_items' : undefined,
    },
    {
      refetchInterval: 30000,
    }
  );

  // Fetch accounts for filter dropdown
  const accountsQuery = trpc.crm.accounts.list.useQuery(
    {
      page: 1,
      pageSize: 100,
      filters: { status: ['active'] },
    },
    {
      refetchInterval: 60000,
    }
  );

  // Process data
  const jobs = jobsQuery.data ?? [];
  const accounts = accountsQuery.data?.items ?? [];

  // Calculate submission counts for each job (we'll need to add this to the query later)
  // For now, we'll show a placeholder

  // Filter jobs locally for instant feedback
  const filteredJobs = useMemo(() => {
    let filtered = jobs;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title?.toLowerCase().includes(query) ||
          job.location?.toLowerCase().includes(query) ||
          job.description?.toLowerCase().includes(query)
      );
    }

    // Priority filter
    if (priorityFilter) {
      filtered = filtered.filter((job) => job.priority === priorityFilter);
    }

    return filtered;
  }, [jobs, searchQuery, priorityFilter]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = jobs.length;
    const open = jobs.filter((j) => j.status === 'open').length;
    const urgent = jobs.filter((j) => j.status === 'urgent' || j.priority === 'urgent').length;
    const onHold = jobs.filter((j) => j.status === 'on_hold').length;
    return { total, open, urgent, onHold };
  }, [jobs]);

  // Loading state
  const isLoading = jobsQuery.isLoading;

  // Error state
  if (jobsQuery.error) {
    return (
      <div className={cn('p-6 bg-red-50 border border-red-200 rounded-lg', className)}>
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h2 className="text-lg font-semibold text-red-800">Error Loading Jobs</h2>
            <p className="mt-2 text-red-700">{jobsQuery.error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('jobs-list space-y-6', className)}>
      {/* Header */}
      <header>
        <div className="flex items-start justify-between gap-4">
          <div>
            <nav className="mb-2">
              <ol className="flex items-center gap-2 text-sm text-stone-500">
                <li>Workspace</li>
                <li>/</li>
                <li className="text-stone-900">Jobs</li>
              </ol>
            </nav>
            <h1 className="text-2xl font-bold text-stone-900">Jobs</h1>
            <p className="mt-1 text-stone-500">
              Manage job requisitions and track candidates
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium bg-stone-100 hover:bg-stone-200 transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </button>
            <Link
              href="/employee/recruiting/jobs/new"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-rust text-white hover:bg-rust/90 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Create Job
            </Link>
          </div>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">
            Total Jobs
          </div>
          <div className="mt-1 text-2xl font-bold text-stone-900">
            {isLoading ? '-' : metrics.total}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">
            Open
          </div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            {isLoading ? '-' : metrics.open}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">
            Urgent
          </div>
          <div className="mt-1 text-2xl font-bold text-red-600">
            {isLoading ? '-' : metrics.urgent}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">
            On Hold
          </div>
          <div className="mt-1 text-2xl font-bold text-amber-600">
            {isLoading ? '-' : metrics.onHold}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-500">Status:</span>
          <select
            value={statusFilter ?? ''}
            onChange={(e) => setStatusFilter(e.target.value || null)}
            className="px-3 py-2 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none"
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="open">Open</option>
            <option value="urgent">Urgent</option>
            <option value="on_hold">On Hold</option>
            <option value="filled">Filled</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-500">Priority:</span>
          <select
            value={priorityFilter ?? ''}
            onChange={(e) => setPriorityFilter(e.target.value || null)}
            className="px-3 py-2 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none"
          >
            <option value="">All</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Client Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-500">Client:</span>
          <select
            value={clientFilter ?? ''}
            onChange={(e) => setClientFilter(e.target.value || null)}
            className="px-3 py-2 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none min-w-[150px]"
          >
            <option value="">All Clients</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>

        {/* My Jobs Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={myJobsOnly}
            onChange={(e) => setMyJobsOnly(e.target.checked)}
            className="rounded border-stone-300 text-rust focus:ring-rust"
          />
          <span className="text-sm text-stone-600">My Jobs Only</span>
        </label>
      </div>

      {/* Jobs Table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-rust" size={32} />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="mx-auto text-stone-300" size={48} />
            <p className="mt-4 text-stone-500">No jobs found</p>
            {searchQuery && (
              <p className="text-sm text-stone-400">Try adjusting your search terms</p>
            )}
            <Link
              href="/employee/recruiting/jobs/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-rust text-white rounded-lg hover:bg-rust/90 transition-colors"
            >
              <Plus size={16} />
              Create Job
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Subs
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Days
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredJobs.map((job) => {
                  const daysOpen = calculateDaysOpen(job.createdAt);
                  const accountName = accounts.find((a) => a.id === job.accountId)?.name;

                  return (
                    <tr
                      key={job.id}
                      onClick={() => router.push(`/employee/recruiting/jobs/${job.id}`)}
                      className="hover:bg-stone-50 cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-rust/10 flex items-center justify-center">
                            <Briefcase className="text-rust" size={20} />
                          </div>
                          <div>
                            <div className="font-medium text-stone-900">{job.title}</div>
                            {job.location && (
                              <div className="text-sm text-stone-500 flex items-center gap-1">
                                <MapPin size={12} />
                                {job.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {accountName ? (
                          <div className="flex items-center gap-2 text-sm text-stone-600">
                            <Building2 size={14} className="text-stone-400" />
                            {accountName}
                          </div>
                        ) : (
                          <span className="text-stone-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            'inline-flex px-2.5 py-1 text-xs font-medium rounded-full border',
                            STATUS_COLORS[job.status ?? ''] ?? 'bg-stone-100 text-stone-600 border-stone-200'
                          )}
                        >
                          {formatEnum(job.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            'inline-flex px-2.5 py-1 text-xs font-medium rounded-full border',
                            PRIORITY_COLORS[job.priority ?? ''] ?? 'bg-stone-100 text-stone-600 border-stone-200'
                          )}
                        >
                          {formatEnum(job.priority)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-stone-600">
                          {job.location || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-stone-600">
                          {JOB_TYPE_DISPLAY[job.jobType ?? ''] || formatEnum(job.jobType)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-stone-100 text-stone-600">
                          <Users size={12} className="mr-1" />
                          {/* Submission count - would need to add to query */}
                          -
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={cn(
                            'inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full',
                            daysOpen > 30
                              ? 'bg-red-100 text-red-700'
                              : daysOpen > 14
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-stone-100 text-stone-600'
                          )}
                        >
                          <Clock size={12} className="mr-1" />
                          {daysOpen}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-stone-500">
                          {formatDate(job.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <ChevronRight
                          className="text-stone-300 group-hover:text-stone-500 transition-colors"
                          size={20}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination info */}
      {!isLoading && filteredJobs.length > 0 && (
        <div className="text-sm text-stone-500 text-center">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </div>
      )}
    </div>
  );
}

export default JobsListRenderer;
