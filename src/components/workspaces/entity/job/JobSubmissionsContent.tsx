/**
 * JobSubmissionsContent Component
 *
 * Displays the list of candidate submissions for a job.
 * Supports filtering, sorting, and quick actions.
 */

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  Search,
  Filter,
  ChevronRight,
  MapPin,
  DollarSign,
  Calendar,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

export interface Submission {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateInitials?: string;
  candidateLocation?: string | null;
  candidateVisa?: string | null;
  candidateHourlyRate?: number | null;
  candidateSkills?: string[];
  status: string;
  submissionNotes?: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

export interface JobSubmissionsContentProps {
  submissions: Submission[];
  onAddCandidate?: () => void;
  onSubmissionClick?: (submission: Submission) => void;
  submissionRoute?: (id: string) => string;
  className?: string;
}

// =====================================================
// STATUS COLORS
// =====================================================

const STATUS_COLORS: Record<string, string> = {
  sourced: 'bg-gray-100 text-gray-700',
  screening: 'bg-blue-100 text-blue-700',
  submitted_to_client: 'bg-purple-100 text-purple-700',
  client_review: 'bg-indigo-100 text-indigo-700',
  client_interview: 'bg-cyan-100 text-cyan-700',
  offer_stage: 'bg-amber-100 text-amber-700',
  placed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-stone-100 text-stone-700',
};

const VISA_COLORS: Record<string, string> = {
  H1B: 'bg-blue-100 text-blue-700',
  GC: 'bg-green-100 text-green-700',
  USC: 'bg-emerald-100 text-emerald-700',
  OPT: 'bg-amber-100 text-amber-700',
  CPT: 'bg-orange-100 text-orange-700',
  TN: 'bg-purple-100 text-purple-700',
  L1: 'bg-indigo-100 text-indigo-700',
  EAD: 'bg-cyan-100 text-cyan-700',
  Other: 'bg-gray-100 text-gray-700',
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'sourced', label: 'Sourced' },
  { value: 'screening', label: 'Screening' },
  { value: 'submitted_to_client', label: 'Submitted to Client' },
  { value: 'client_review', label: 'Client Review' },
  { value: 'client_interview', label: 'Client Interview' },
  { value: 'offer_stage', label: 'Offer Stage' },
  { value: 'placed', label: 'Placed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

// =====================================================
// SUBMISSION ROW
// =====================================================

function SubmissionRow({
  submission,
  onClick,
  href,
}: {
  submission: Submission;
  onClick?: () => void;
  href?: string;
}) {
  const content = (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-200 hover:border-rust/30 hover:shadow-sm transition-all group">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 bg-gradient-to-br from-rust/20 to-rust/10 rounded-xl flex items-center justify-center text-rust font-bold">
          {submission.candidateInitials ||
            submission.candidateName.slice(0, 2).toUpperCase()}
        </div>

        {/* Info */}
        <div>
          <div className="font-medium text-charcoal">{submission.candidateName}</div>
          <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
            {submission.candidateLocation && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {submission.candidateLocation}
              </span>
            )}
            {submission.candidateVisa && (
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded text-[10px] font-bold',
                  VISA_COLORS[submission.candidateVisa] || VISA_COLORS.Other
                )}
              >
                {submission.candidateVisa}
              </span>
            )}
            {submission.candidateHourlyRate && (
              <span className="text-green-600 font-medium flex items-center gap-1">
                <DollarSign className="w-3 h-3" />${submission.candidateHourlyRate}/hr
              </span>
            )}
          </div>
          {submission.candidateSkills && submission.candidateSkills.length > 0 && (
            <div className="flex gap-1 mt-2">
              {submission.candidateSkills.slice(0, 4).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px]"
                >
                  {skill}
                </span>
              ))}
              {submission.candidateSkills.length > 4 && (
                <span className="text-[10px] text-stone-400">
                  +{submission.candidateSkills.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Date */}
        <div className="text-right hidden sm:block">
          <div className="text-xs text-stone-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {submission.createdAt
              ? new Date(submission.createdAt).toLocaleDateString()
              : 'N/A'}
          </div>
        </div>

        {/* Status */}
        <Badge
          variant="secondary"
          className={cn(
            'text-[10px] font-bold uppercase',
            STATUS_COLORS[submission.status] || STATUS_COLORS.sourced
          )}
        >
          {submission.status.replace(/_/g, ' ')}
        </Badge>

        {/* Arrow */}
        <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-rust transition-colors" />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className="w-full text-left">
      {content}
    </button>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function JobSubmissionsContent({
  submissions,
  onAddCandidate,
  onSubmissionClick,
  submissionRoute = (id) => `/employee/recruiting/submissions/${id}`,
  className,
}: JobSubmissionsContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort submissions
  const filteredSubmissions = useMemo(() => {
    let result = [...submissions];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.candidateName.toLowerCase().includes(query) ||
          s.candidateSkills?.some((skill) => skill.toLowerCase().includes(query)) ||
          s.candidateLocation?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((s) => s.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [submissions, searchQuery, statusFilter, sortOrder]);

  // Stats
  const activeCount = submissions.filter(
    (s) => s.status !== 'rejected' && s.status !== 'withdrawn'
  ).length;
  const placedCount = submissions.filter((s) => s.status === 'placed').length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-bold text-charcoal">Submissions</h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {activeCount} active
            </Badge>
            {placedCount > 0 && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                {placedCount} placed
              </Badge>
            )}
          </div>
        </div>

        {onAddCandidate && (
          <Button onClick={onAddCandidate} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Attach Candidate
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidates..."
            className="pl-9"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2 text-stone-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
          title={sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
        >
          {sortOrder === 'desc' ? (
            <SortDesc className="w-4 h-4" />
          ) : (
            <SortAsc className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {filteredSubmissions.length > 0 ? (
          filteredSubmissions.map((submission) => (
            <SubmissionRow
              key={submission.id}
              submission={submission}
              href={submissionRoute(submission.id)}
              onClick={onSubmissionClick ? () => onSubmissionClick(submission) : undefined}
            />
          ))
        ) : submissions.length > 0 ? (
          <div className="text-center py-12 bg-stone-50 rounded-xl border border-stone-200">
            <Search className="w-10 h-10 mx-auto text-stone-300 mb-3" />
            <p className="text-stone-500 font-medium">No matching submissions</p>
            <p className="text-sm text-stone-400 mt-1">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200">
            <Users className="w-12 h-12 mx-auto text-stone-300 mb-4" />
            <h3 className="font-bold text-charcoal mb-2">No Candidates Yet</h3>
            <p className="text-stone-500 text-sm mb-4">
              Attach candidates from your talent pool to start the pipeline
            </p>
            {onAddCandidate && (
              <Button onClick={onAddCandidate}>Attach First Candidate</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobSubmissionsContent;
