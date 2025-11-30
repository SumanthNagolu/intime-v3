/**
 * SubmissionOverviewContent Component
 *
 * Displays submission overview including candidate info, job details,
 * workflow progress, and key metrics.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import {
  User,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MetricsGrid, type MetricItem } from '../../sections/MetricsGrid';

// =====================================================
// TYPES
// =====================================================

export interface CandidateInfo {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName: string;
  email: string;
  phone?: string | null;
  candidateLocation?: string | null;
  candidateCurrentVisa?: string | null;
  candidateHourlyRate?: number | null;
  candidateSkills?: string[] | null;
}

export interface JobInfo {
  id: string;
  title: string;
  location?: string | null;
  rateMin?: number | null;
  rateMax?: number | null;
  rateType?: string | null;
  accountId?: string | null;
  accountName?: string | null;
}

export interface SubmissionData {
  id: string;
  status: string;
  candidate: CandidateInfo;
  job: JobInfo;
  vendorName?: string | null;
  vendorId?: string | null;
  clientSubmittedAt?: Date | string | null;
  interviewCount?: number;
  submissionNotes?: string | null;
  internalNotes?: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

export interface SubmissionOverviewContentProps {
  submission: SubmissionData;
  candidateRoute?: string;
  jobRoute?: string;
  accountRoute?: string;
  className?: string;
}

// =====================================================
// STATUS COLORS
// =====================================================

const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; label: string; stage: string }
> = {
  sourced: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Sourced', stage: 'initial' },
  screening: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Screening', stage: 'initial' },
  vendor_pending: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Vendor Pending', stage: 'vendor' },
  vendor_screening: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Vendor Screening', stage: 'vendor' },
  vendor_accepted: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Vendor Accepted', stage: 'vendor' },
  vendor_rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Vendor Rejected', stage: 'vendor' },
  submitted_to_client: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Client Submitted', stage: 'client' },
  client_review: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Client Review', stage: 'client' },
  client_accepted: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Client Accepted', stage: 'client' },
  client_rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Client Rejected', stage: 'client' },
  client_interview: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Interviewing', stage: 'interview' },
  offer_stage: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Offer Stage', stage: 'offer' },
  placed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Placed', stage: 'placed' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected', stage: 'rejected' },
  withdrawn: { bg: 'bg-stone-100', text: 'text-stone-700', label: 'Withdrawn', stage: 'withdrawn' },
};

const VISA_COLORS: Record<string, string> = {
  H1B: 'bg-blue-100 text-blue-700',
  GC: 'bg-green-100 text-green-700',
  USC: 'bg-emerald-100 text-emerald-700',
  OPT: 'bg-amber-100 text-amber-700',
  Other: 'bg-gray-100 text-gray-700',
};

// =====================================================
// PIPELINE PROGRESS
// =====================================================

const PIPELINE_STAGES = [
  { key: 'initial', label: 'Sourced' },
  { key: 'vendor', label: 'Vendor' },
  { key: 'client', label: 'Client' },
  { key: 'interview', label: 'Interview' },
  { key: 'offer', label: 'Offer' },
  { key: 'placed', label: 'Placed' },
];

function PipelineProgress({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.sourced;
  const currentStageIndex = PIPELINE_STAGES.findIndex(
    (stage) => stage.key === config.stage
  );
  const isTerminal = ['rejected', 'withdrawn'].includes(config.stage);

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-4">
        Pipeline Progress
      </h3>
      <div className="flex items-center gap-2">
        {PIPELINE_STAGES.map((stage, idx) => {
          const isPast = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const isFuture = idx > currentStageIndex;

          return (
            <React.Fragment key={stage.key}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                    isPast && 'bg-green-500 text-white',
                    isCurrent && !isTerminal && 'bg-rust text-white',
                    isCurrent && isTerminal && 'bg-red-500 text-white',
                    isFuture && 'bg-stone-100 text-stone-400'
                  )}
                >
                  {idx + 1}
                </div>
                <span
                  className={cn(
                    'text-[10px] mt-1 uppercase tracking-wider',
                    isCurrent ? 'text-charcoal font-bold' : 'text-stone-400'
                  )}
                >
                  {stage.label}
                </span>
              </div>
              {idx < PIPELINE_STAGES.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-1 rounded',
                    isPast ? 'bg-green-500' : 'bg-stone-100'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// =====================================================
// ENTITY CARD
// =====================================================

function EntityCard({
  title,
  icon: Icon,
  name,
  subtitle,
  badges,
  href,
}: {
  title: string;
  icon: React.ElementType;
  name: string;
  subtitle?: string;
  badges?: { label: string; color: string }[];
  href?: string;
}) {
  const content = (
    <div className="bg-white rounded-xl border border-stone-200 p-4 hover:border-rust/30 hover:shadow-sm transition-all group">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-rust/20 to-rust/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-rust" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-0.5">
            {title}
          </p>
          <p className="font-medium text-charcoal truncate">{name}</p>
          {subtitle && <p className="text-xs text-stone-500 truncate">{subtitle}</p>}
          {badges && badges.length > 0 && (
            <div className="flex gap-1 mt-1">
              {badges.map((badge, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className={cn('text-[10px]', badge.color)}
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-rust transition-colors flex-shrink-0" />
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function SubmissionOverviewContent({
  submission,
  candidateRoute = `/employee/recruiting/talent/${submission.candidate.id}`,
  jobRoute = `/employee/recruiting/jobs/${submission.job.id}`,
  accountRoute,
  className,
}: SubmissionOverviewContentProps) {
  const statusConfig = STATUS_CONFIG[submission.status] || STATUS_CONFIG.sourced;

  // Build metrics
  const metricsItems: MetricItem[] = [
    {
      label: 'Current Status',
      value: statusConfig.label,
      icon: Clock,
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Interviews',
      value: submission.interviewCount ?? 0,
      icon: Calendar,
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Days Active',
      value: submission.createdAt
        ? Math.floor(
            (new Date().getTime() - new Date(submission.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0,
      icon: Clock,
      bgColor: 'bg-green-100',
    },
  ];

  // Candidate badges
  const candidateBadges = [];
  if (submission.candidate.candidateCurrentVisa) {
    candidateBadges.push({
      label: submission.candidate.candidateCurrentVisa,
      color:
        VISA_COLORS[submission.candidate.candidateCurrentVisa] || VISA_COLORS.Other,
    });
  }
  if (submission.candidate.candidateHourlyRate) {
    candidateBadges.push({
      label: `$${submission.candidate.candidateHourlyRate}/hr`,
      color: 'bg-green-100 text-green-700',
    });
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Pipeline Progress */}
      <PipelineProgress status={submission.status} />

      {/* Key Metrics */}
      <MetricsGrid items={metricsItems} columns={3} />

      {/* Candidate & Job Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EntityCard
          title="Candidate"
          icon={User}
          name={submission.candidate.fullName}
          subtitle={submission.candidate.candidateLocation || undefined}
          badges={candidateBadges}
          href={candidateRoute}
        />
        <EntityCard
          title="Job"
          icon={Briefcase}
          name={submission.job.title}
          subtitle={submission.job.location || undefined}
          href={jobRoute}
        />
      </div>

      {/* Account & Vendor */}
      {(submission.job.accountName || submission.vendorName) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {submission.job.accountName && (
            <EntityCard
              title="Client Account"
              icon={Building2}
              name={submission.job.accountName}
              href={
                accountRoute ||
                (submission.job.accountId
                  ? `/employee/recruiting/accounts/${submission.job.accountId}`
                  : undefined)
              }
            />
          )}
          {submission.vendorName && (
            <EntityCard
              title="Vendor"
              icon={Building2}
              name={submission.vendorName}
            />
          )}
        </div>
      )}

      {/* Submission Notes */}
      {submission.submissionNotes && (
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-3">
            Submission Notes
          </h3>
          <p className="text-sm text-stone-600 whitespace-pre-wrap">
            {submission.submissionNotes}
          </p>
        </div>
      )}

      {/* Internal Notes */}
      {submission.internalNotes && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-700 mb-3">
            Internal Notes
          </h3>
          <p className="text-sm text-amber-800 whitespace-pre-wrap">
            {submission.internalNotes}
          </p>
        </div>
      )}

      {/* Candidate Skills */}
      {(submission.candidate.candidateSkills?.length ?? 0) > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-3">
            Candidate Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {submission.candidate.candidateSkills?.map((skill, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="bg-rust/10 text-rust border-rust/20"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SubmissionOverviewContent;
