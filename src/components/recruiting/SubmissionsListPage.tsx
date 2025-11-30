'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Send, Search, Filter, ChevronRight, Loader2, User, Briefcase, MapPin,
  Calendar, Star, Clock
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

// Time filters (same as Deals)
const TIME_FILTERS = ['Current Sprint', 'This Month', 'This Quarter', 'YTD', 'All Time'];

// Status colors
const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  sourced: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Sourced' },
  screening: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Screening' },
  submission_ready: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Ready' },
  submitted_to_client: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Submitted' },
  client_review: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Review' },
  client_interview: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Interview' },
  offer_stage: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Offer' },
  placed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Placed' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
  withdrawn: { bg: 'bg-stone-100', text: 'text-stone-700', label: 'Withdrawn' },
};

type StatusFilter = 'all' | 'active' | 'placed' | 'rejected';

// Helper to get date range for time filters
const getDateRangeForFilter = (filter: string): { start: Date; end: Date } | null => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case 'Current Sprint': {
      // 2-week sprint, starting from Monday
      const dayOfWeek = today.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(today);
      monday.setDate(today.getDate() - daysToMonday);
      // Get the week number to determine sprint start
      const weekNum = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
      const isEvenWeek = weekNum % 2 === 0;
      const sprintStart = isEvenWeek ? monday : new Date(monday.getTime() - 7 * 24 * 60 * 60 * 1000);
      const sprintEnd = new Date(sprintStart.getTime() + 14 * 24 * 60 * 60 * 1000 - 1);
      return { start: sprintStart, end: sprintEnd };
    }
    case 'This Month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
      return { start, end };
    }
    case 'This Quarter': {
      const quarter = Math.floor(today.getMonth() / 3);
      const start = new Date(today.getFullYear(), quarter * 3, 1);
      const end = new Date(today.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59);
      return { start, end };
    }
    case 'YTD': {
      const start = new Date(today.getFullYear(), 0, 1);
      return { start, end: now };
    }
    case 'All Time':
    default:
      return null;
  }
};

export const SubmissionsListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [timeFilter, setTimeFilter] = useState('Current Sprint');

  // Fetch all submissions
  const { data: submissions = [], isLoading } = trpc.ats.submissions.list.useQuery({
    limit: 100,
  });

  // Filter submissions
  const filteredSubmissions = useMemo(() => {
    const dateRange = getDateRangeForFilter(timeFilter);

    return submissions.filter(sub => {
      // Time filter
      if (dateRange && sub.createdAt) {
        const subDate = new Date(sub.createdAt);
        if (subDate < dateRange.start || subDate > dateRange.end) {
          return false;
        }
      }

      // Status filter
      if (statusFilter === 'active' && (sub.status === 'rejected' || sub.status === 'withdrawn' || sub.status === 'placed')) {
        return false;
      }
      if (statusFilter === 'placed' && sub.status !== 'placed') {
        return false;
      }
      if (statusFilter === 'rejected' && sub.status !== 'rejected') {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const candidateMatch = sub.candidateId?.toLowerCase().includes(term);
        const jobMatch = sub.jobId?.toLowerCase().includes(term);
        if (!candidateMatch && !jobMatch) {
          return false;
        }
      }

      return true;
    });
  }, [submissions, timeFilter, statusFilter, searchTerm]);

  // Stats
  const activeCount = submissions.filter(s => !['rejected', 'withdrawn', 'placed'].includes(s.status)).length;
  const placedCount = submissions.filter(s => s.status === 'placed').length;
  const interviewCount = submissions.filter(s => s.status === 'client_interview').length;

  return (
    <div className="animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="text-xs text-stone-500 uppercase tracking-widest mb-1">Total Submissions</div>
          <div className="text-3xl font-bold text-charcoal">{submissions.length}</div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="text-xs text-stone-500 uppercase tracking-widest mb-1">Active</div>
          <div className="text-3xl font-bold text-blue-600">{activeCount}</div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="text-xs text-stone-500 uppercase tracking-widest mb-1">In Interview</div>
          <div className="text-3xl font-bold text-orange-600">{interviewCount}</div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="text-xs text-stone-500 uppercase tracking-widest mb-1">Placed</div>
          <div className="text-3xl font-bold text-green-600">{placedCount}</div>
        </div>
      </div>

      {/* Controls Header */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-end">
        <div className="flex items-center gap-4 bg-white p-3 rounded-full border border-stone-200 shadow-sm flex-1 max-w-md">
          <Search size={18} className="text-stone-400 ml-2" />
          <input
            type="text"
            placeholder="Search submissions..."
            className="flex-1 bg-transparent outline-none text-sm font-medium text-charcoal placeholder-stone-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-stone-100 p-1 rounded-full flex gap-1 overflow-x-auto max-w-full">
          {TIME_FILTERS.map(tf => (
            <button
              key={tf}
              onClick={() => setTimeFilter(tf)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                timeFilter === tf ? 'bg-white text-charcoal shadow-sm' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Status Pills */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {(['all', 'active', 'placed', 'rejected'] as StatusFilter[]).map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
              statusFilter === filter
                ? 'bg-charcoal text-white'
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
          >
            {filter}
            {filter !== 'all' && (
              <span className="ml-2 opacity-60">
                ({filter === 'active' ? activeCount : filter === 'placed' ? placedCount : filter === 'rejected' ? submissions.filter(s => s.status === 'rejected').length : 0})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 size={32} className="animate-spin text-stone-400" />
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-16 text-center">
          <Send size={48} className="mx-auto text-stone-300 mb-4" />
          <h3 className="font-bold text-charcoal mb-2">No Submissions Found</h3>
          <p className="text-stone-500">
            {statusFilter !== 'all'
              ? `No ${statusFilter} submissions at the moment`
              : 'Start by attaching candidates to jobs from the Talent pool'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-stone-500">Candidate</th>
                <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-stone-500">Job</th>
                <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-stone-500">Status</th>
                <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-stone-500">Date</th>
                <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-stone-500">Match</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredSubmissions.map((sub) => {
                const statusConfig = STATUS_COLORS[sub.status] || STATUS_COLORS.sourced;
                return (
                  <tr key={sub.id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-rust/20 to-rust/10 rounded-lg flex items-center justify-center text-rust font-bold text-sm border border-rust/10">
                          <User size={18} />
                        </div>
                        <div>
                          <div className="font-medium text-charcoal">Candidate #{sub.candidateId.slice(0, 8)}</div>
                          <div className="text-xs text-stone-500">ID: {sub.candidateId.slice(0, 12)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Briefcase size={14} className="text-stone-400" />
                        <span className="text-sm text-charcoal">Job #{sub.jobId.slice(0, 8)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-stone-500">
                        <Calendar size={14} />
                        {new Date(sub.createdAt || '').toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      {sub.aiMatchScore ? (
                        <div className="flex items-center gap-1 text-amber-600">
                          <Star size={14} />
                          <span className="text-sm font-bold">{sub.aiMatchScore}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-stone-400">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/employee/recruiting/submissions/${sub.id}`}
                        className="flex items-center gap-1 text-rust font-bold text-sm hover:underline"
                      >
                        View <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SubmissionsListPage;
