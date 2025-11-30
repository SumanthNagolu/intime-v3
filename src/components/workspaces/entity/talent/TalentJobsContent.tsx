/**
 * TalentJobsContent Component
 *
 * Displays jobs that a talent/candidate is attached to through submissions.
 * Shows job details and submission status.
 */

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  ChevronRight,
  Search,
  Filter,
  Plus,
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

export interface TalentJob {
  id: string;
  submissionId: string;
  jobId: string;
  jobTitle: string;
  accountName?: string | null;
  location?: string | null;
  rateMin?: number | null;
  rateMax?: number | null;
  rateType?: string | null;
  status: string;
  submissionStatus: string;
  submittedAt?: Date | string | null;
}

export interface TalentJobsContentProps {
  jobs: TalentJob[];
  onAttachToJob?: () => void;
  onJobClick?: (job: TalentJob) => void;
  jobRoute?: (id: string) => string;
  submissionRoute?: (id: string) => string;
  className?: string;
}

// =====================================================
// STATUS COLORS
// =====================================================

const JOB_STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-100 text-green-700',
  on_hold: 'bg-amber-100 text-amber-700',
  filled: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  draft: 'bg-stone-100 text-stone-700',
};

const SUBMISSION_STATUS_COLORS: Record<string, string> = {
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

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'sourced', label: 'Sourced' },
  { value: 'screening', label: 'Screening' },
  { value: 'submitted_to_client', label: 'Submitted to Client' },
  { value: 'client_interview', label: 'Interview' },
  { value: 'offer_stage', label: 'Offer' },
  { value: 'placed', label: 'Placed' },
  { value: 'rejected', label: 'Rejected' },
];

// =====================================================
// HELPERS
// =====================================================

function formatRate(job: TalentJob): string | null {
  if (!job.rateMin && !job.rateMax) return null;
  const min = job.rateMin ? `$${job.rateMin}` : '';
  const max = job.rateMax ? `$${job.rateMax}` : '';
  const type = job.rateType === 'hourly' ? '/hr' : job.rateType === 'annual' ? '/yr' : '';
  if (min && max) return `${min}-${max}${type}`;
  if (min) return `${min}+${type}`;
  return `Up to ${max}${type}`;
}

// =====================================================
// JOB ROW
// =====================================================

function JobRow({
  job,
  jobHref,
  submissionHref,
  onClick,
}: {
  job: TalentJob;
  jobHref?: string;
  submissionHref?: string;
  onClick?: () => void;
}) {
  const rate = formatRate(job);

  return (
    <div className="bg-white rounded-xl border border-stone-200 hover:border-rust/30 hover:shadow-sm transition-all p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Job Icon */}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-5 h-5 text-blue-600" />
          </div>

          {/* Job Info */}
          <div className="flex-1 min-w-0">
            {jobHref ? (
              <Link
                href={jobHref}
                className="font-medium text-charcoal hover:text-rust transition-colors block truncate"
              >
                {job.jobTitle}
              </Link>
            ) : (
              <span className="font-medium text-charcoal block truncate">
                {job.jobTitle}
              </span>
            )}
            <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
              {job.accountName && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> {job.accountName}
                </span>
              )}
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {job.location}
                </span>
              )}
              {rate && (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <DollarSign className="w-3 h-3" /> {rate}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Date */}
          {job.submittedAt && (
            <div className="text-right hidden sm:block">
              <div className="text-xs text-stone-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(job.submittedAt).toLocaleDateString()}
              </div>
            </div>
          )}

          {/* Statuses */}
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={cn(
                'text-[10px] font-bold uppercase',
                SUBMISSION_STATUS_COLORS[job.submissionStatus] ||
                  SUBMISSION_STATUS_COLORS.sourced
              )}
            >
              {job.submissionStatus.replace(/_/g, ' ')}
            </Badge>
            <Badge
              variant="secondary"
              className={cn(
                'text-[10px] font-bold uppercase',
                JOB_STATUS_COLORS[job.status] || JOB_STATUS_COLORS.open
              )}
            >
              {job.status}
            </Badge>
          </div>

          {/* Link to Submission */}
          {submissionHref ? (
            <Link
              href={submissionHref}
              className="p-2 text-stone-300 hover:text-rust transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </Link>
          ) : onClick ? (
            <button
              onClick={onClick}
              className="p-2 text-stone-300 hover:text-rust transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function TalentJobsContent({
  jobs,
  onAttachToJob,
  onJobClick,
  jobRoute = (id) => `/employee/recruiting/jobs/${id}`,
  submissionRoute = (id) => `/employee/recruiting/submissions/${id}`,
  className,
}: TalentJobsContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter jobs
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (j) =>
          j.jobTitle.toLowerCase().includes(query) ||
          j.accountName?.toLowerCase().includes(query) ||
          j.location?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((j) => j.submissionStatus === statusFilter);
    }

    return result;
  }, [jobs, searchQuery, statusFilter]);

  // Stats
  const activeCount = jobs.filter(
    (j) => j.submissionStatus !== 'rejected' && j.submissionStatus !== 'withdrawn'
  ).length;
  const placedCount = jobs.filter((j) => j.submissionStatus === 'placed').length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-bold text-charcoal">Jobs</h3>
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

        {onAttachToJob && (
          <Button onClick={onAttachToJob} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Attach to Job
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
            placeholder="Search jobs..."
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
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <JobRow
              key={job.submissionId}
              job={job}
              jobHref={jobRoute(job.jobId)}
              submissionHref={submissionRoute(job.submissionId)}
              onClick={onJobClick ? () => onJobClick(job) : undefined}
            />
          ))
        ) : jobs.length > 0 ? (
          <div className="text-center py-12 bg-stone-50 rounded-xl border border-stone-200">
            <Search className="w-10 h-10 mx-auto text-stone-300 mb-3" />
            <p className="text-stone-500 font-medium">No matching jobs</p>
            <p className="text-sm text-stone-400 mt-1">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200">
            <Briefcase className="w-12 h-12 mx-auto text-stone-300 mb-4" />
            <h3 className="font-bold text-charcoal mb-2">No Job Submissions</h3>
            <p className="text-stone-500 text-sm mb-4">
              This candidate hasn&apos;t been attached to any jobs yet
            </p>
            {onAttachToJob && (
              <Button onClick={onAttachToJob}>Attach to First Job</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TalentJobsContent;
