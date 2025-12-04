'use client';

/**
 * Candidates List Renderer
 *
 * A specialized renderer for the candidates/talent list screen with
 * filtering by status, skills, visa, and RACI-based ownership filtering.
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
  Users,
  ChevronRight,
  Loader2,
  AlertCircle,
  Send,
  UserPlus,
} from 'lucide-react';

interface CandidatesListRendererProps {
  /** Screen definition */
  definition: ScreenDefinition;
  /** Additional className */
  className?: string;
}

// Status badge colors
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  bench: 'bg-blue-100 text-blue-700 border-blue-200',
  placed: 'bg-purple-100 text-purple-700 border-purple-200',
  inactive: 'bg-stone-100 text-stone-600 border-stone-200',
  sourced: 'bg-amber-100 text-amber-700 border-amber-200',
  screening: 'bg-sky-100 text-sky-700 border-sky-200',
  available: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  archived: 'bg-stone-200 text-stone-500 border-stone-300',
};

// Visa badge colors
const VISA_COLORS: Record<string, string> = {
  USC: 'bg-green-100 text-green-700',
  GC: 'bg-green-100 text-green-700',
  H1B: 'bg-blue-100 text-blue-700',
  OPT: 'bg-amber-100 text-amber-700',
  CPT: 'bg-amber-100 text-amber-700',
  TN: 'bg-purple-100 text-purple-700',
  L1: 'bg-purple-100 text-purple-700',
  EAD: 'bg-sky-100 text-sky-700',
  Other: 'bg-stone-100 text-stone-600',
};

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

// Format enum values
function formatEnum(value: string | null | undefined): string {
  if (!value) return '-';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Candidates List Renderer Component
 */
export function CandidatesListRenderer({ definition, className }: CandidatesListRendererProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [visaFilter, setVisaFilter] = useState<string | null>(null);

  // Fetch candidates list
  const candidatesQuery = trpc.ats.candidates.list.useQuery(
    {
      limit: 100,
      offset: 0,
      status: statusFilter || undefined,
    },
    {
      refetchInterval: 30000,
    }
  );

  // Process data
  const candidates = candidatesQuery.data ?? [];

  // Filter candidates locally for instant feedback
  const filteredCandidates = useMemo(() => {
    let filtered = candidates;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (candidate) =>
          candidate.fullName?.toLowerCase().includes(query) ||
          candidate.firstName?.toLowerCase().includes(query) ||
          candidate.lastName?.toLowerCase().includes(query) ||
          candidate.email?.toLowerCase().includes(query) ||
          candidate.title?.toLowerCase().includes(query) ||
          candidate.skills?.some(s => s.toLowerCase().includes(query)) ||
          candidate.location?.toLowerCase().includes(query)
      );
    }

    if (visaFilter) {
      filtered = filtered.filter(c => c.visaStatus === visaFilter);
    }

    return filtered;
  }, [candidates, searchQuery, visaFilter]);

  // Loading state
  const isLoading = candidatesQuery.isLoading;

  // Error state
  if (candidatesQuery.error) {
    return (
      <div className={cn('p-6 bg-red-50 border border-red-200 rounded-lg', className)}>
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h2 className="text-lg font-semibold text-red-800">Error Loading Candidates</h2>
            <p className="mt-2 text-red-700">{candidatesQuery.error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('candidates-list space-y-6', className)}>
      {/* Header */}
      <header>
        <div className="flex items-start justify-between gap-4">
          <div>
            <nav className="mb-2">
              <ol className="flex items-center gap-2 text-sm text-stone-500">
                <li>Recruiting</li>
                <li>/</li>
                <li className="text-stone-900">Talent</li>
              </ol>
            </nav>
            <h1 className="text-2xl font-bold text-stone-900">Candidates</h1>
            <p className="mt-1 text-stone-500">
              Manage your talent pool and candidate profiles
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
              href="/employee/recruiting/talent/new"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-rust text-white hover:bg-rust/90 transition-colors flex items-center gap-2"
            >
              <UserPlus size={16} />
              Add Candidate
            </Link>
          </div>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">
            Total Candidates
          </div>
          <div className="mt-1 text-2xl font-bold text-stone-900">
            {isLoading ? '-' : candidates.length}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">
            Active
          </div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            {isLoading ? '-' : candidates.filter(c => c.status === 'active').length}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">
            On Bench
          </div>
          <div className="mt-1 text-2xl font-bold text-blue-600">
            {isLoading ? '-' : candidates.filter(c => c.status === 'bench').length}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">
            Placed
          </div>
          <div className="mt-1 text-2xl font-bold text-purple-600">
            {isLoading ? '-' : candidates.filter(c => c.status === 'placed').length}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, skills, or location..."
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
            onClick={() => setStatusFilter('bench')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              statusFilter === 'bench' ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            )}
          >
            Bench
          </button>
          <button
            onClick={() => setStatusFilter('placed')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              statusFilter === 'placed' ? 'bg-purple-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            )}
          >
            Placed
          </button>
        </div>

        {/* Visa Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-500">Visa:</span>
          <select
            value={visaFilter || ''}
            onChange={(e) => setVisaFilter(e.target.value || null)}
            className="px-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none"
          >
            <option value="">All Visas</option>
            <option value="USC">US Citizen</option>
            <option value="GC">Green Card</option>
            <option value="H1B">H-1B</option>
            <option value="OPT">OPT</option>
            <option value="CPT">CPT</option>
            <option value="TN">TN Visa</option>
            <option value="L1">L-1 Visa</option>
            <option value="EAD">EAD</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-rust" size={32} />
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto text-stone-300" size={48} />
            <p className="mt-4 text-stone-500">No candidates found</p>
            {searchQuery && (
              <p className="text-sm text-stone-400">Try adjusting your search terms</p>
            )}
            <Link
              href="/employee/recruiting/talent/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-rust text-white rounded-lg hover:bg-rust/90 transition-colors"
            >
              <UserPlus size={16} />
              Add Candidate
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Visa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Skills
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Added
                  </th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCandidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    onClick={() => router.push(`/employee/recruiting/talent/${candidate.id}`)}
                    className="hover:bg-stone-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rust/10 flex items-center justify-center">
                          <span className="text-rust font-medium">
                            {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-stone-900">{candidate.fullName}</div>
                          <div className="text-sm text-stone-500">{candidate.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-stone-600">
                        {candidate.title || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          'inline-flex px-2.5 py-1 text-xs font-medium rounded-full border',
                          STATUS_COLORS[candidate.status ?? ''] ?? 'bg-stone-100 text-stone-600 border-stone-200'
                        )}
                      >
                        {formatEnum(candidate.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-stone-600">
                        {candidate.location || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {candidate.visaStatus ? (
                        <span
                          className={cn(
                            'inline-flex px-2 py-0.5 text-xs font-medium rounded',
                            VISA_COLORS[candidate.visaStatus] ?? 'bg-stone-100 text-stone-600'
                          )}
                        >
                          {candidate.visaStatus}
                        </span>
                      ) : (
                        <span className="text-stone-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {candidate.skills && candidate.skills.length > 0 ? (
                          <>
                            {candidate.skills.slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-xs bg-stone-100 text-stone-600 rounded"
                              >
                                {skill}
                              </span>
                            ))}
                            {candidate.skills.length > 3 && (
                              <span className="px-2 py-0.5 text-xs text-stone-400">
                                +{candidate.skills.length - 3}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-stone-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-stone-600">
                        {candidate.experienceYears ? `${candidate.experienceYears} yrs` : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-stone-500">
                        {formatRelativeTime(candidate.createdAt)}
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
      {!isLoading && filteredCandidates.length > 0 && (
        <div className="text-sm text-stone-500 text-center">
          Showing {filteredCandidates.length} of {candidates.length} candidates
        </div>
      )}
    </div>
  );
}

export default CandidatesListRenderer;
