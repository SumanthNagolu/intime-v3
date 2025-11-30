/**
 * SubmissionSidebarContent Component
 *
 * Sidebar content for submission workspace including status card,
 * candidate quick info, job summary, and key dates.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import {
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

export interface SubmissionSidebarContentProps {
  submission: {
    id: string;
    status: string;
    createdAt?: Date | string | null;
    updatedAt?: Date | string | null;
    vendorSubmittedAt?: Date | string | null;
    clientSubmittedAt?: Date | string | null;
    interviewScheduledAt?: Date | string | null;
    placedAt?: Date | string | null;
  };
  candidate: {
    id: string;
    fullName: string;
    initials?: string;
    location?: string | null;
    visa?: string | null;
    hourlyRate?: number | null;
  };
  job: {
    id: string;
    title: string;
    location?: string | null;
    accountName?: string | null;
  };
  candidateRoute?: string;
  jobRoute?: string;
  className?: string;
}

// =====================================================
// STATUS COLORS
// =====================================================

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  sourced: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Sourced' },
  screening: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Screening' },
  vendor_pending: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Vendor Pending' },
  vendor_screening: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Vendor Screening' },
  vendor_accepted: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Vendor Accepted' },
  vendor_rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Vendor Rejected' },
  submitted_to_client: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Client Submitted' },
  client_review: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Client Review' },
  client_accepted: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Client Accepted' },
  client_rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Client Rejected' },
  client_interview: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Interviewing' },
  offer_stage: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Offer Stage' },
  placed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Placed' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
  withdrawn: { bg: 'bg-stone-100', text: 'text-stone-700', label: 'Withdrawn' },
};

const VISA_COLORS: Record<string, string> = {
  H1B: 'bg-blue-100 text-blue-700 border-blue-200',
  GC: 'bg-green-100 text-green-700 border-green-200',
  USC: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  OPT: 'bg-amber-100 text-amber-700 border-amber-200',
  Other: 'bg-gray-100 text-gray-700 border-gray-200',
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export function SubmissionSidebarContent({
  submission,
  candidate,
  job,
  candidateRoute = `/employee/recruiting/talent/${candidate.id}`,
  jobRoute = `/employee/recruiting/jobs/${job.id}`,
  className,
}: SubmissionSidebarContentProps) {
  const statusConfig = STATUS_CONFIG[submission.status] || STATUS_CONFIG.sourced;
  const initials =
    candidate.initials || candidate.fullName.slice(0, 2).toUpperCase();

  // Build timeline events
  const timelineEvents = [
    submission.createdAt && {
      label: 'Created',
      date: new Date(submission.createdAt),
    },
    submission.vendorSubmittedAt && {
      label: 'Sent to Vendor',
      date: new Date(submission.vendorSubmittedAt),
    },
    submission.clientSubmittedAt && {
      label: 'Sent to Client',
      date: new Date(submission.clientSubmittedAt),
    },
    submission.interviewScheduledAt && {
      label: 'Interview',
      date: new Date(submission.interviewScheduledAt),
    },
    submission.placedAt && {
      label: 'Placed',
      date: new Date(submission.placedAt),
    },
  ].filter(Boolean) as { label: string; date: Date }[];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Status Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div
          className={cn(
            'h-16 flex items-center justify-center',
            submission.status === 'placed'
              ? 'bg-gradient-to-r from-green-500 to-green-600'
              : submission.status.includes('rejected')
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : 'bg-gradient-to-r from-stone-800 to-stone-700'
          )}
        >
          <Badge
            className={cn(
              'text-lg font-bold uppercase tracking-wider',
              submission.status === 'placed' || submission.status.includes('rejected')
                ? 'bg-white/20 text-white'
                : statusConfig.bg + ' ' + statusConfig.text
            )}
          >
            {statusConfig.label}
          </Badge>
        </div>
        <div className="p-6 space-y-4">
          {/* Candidate Summary */}
          <Link
            href={candidateRoute}
            className="block p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rust/20 to-rust/10 rounded-lg flex items-center justify-center text-rust font-bold text-sm flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-charcoal truncate">
                  {candidate.fullName}
                </p>
                <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                  {candidate.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {candidate.location}
                    </span>
                  )}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-rust transition-colors" />
            </div>
            <div className="flex gap-2 mt-2">
              {candidate.visa && (
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px]',
                    VISA_COLORS[candidate.visa] || VISA_COLORS.Other
                  )}
                >
                  {candidate.visa}
                </Badge>
              )}
              {candidate.hourlyRate && (
                <Badge variant="outline" className="text-[10px] border-green-200 text-green-700">
                  ${candidate.hourlyRate}/hr
                </Badge>
              )}
            </div>
          </Link>

          {/* Job Summary */}
          <Link
            href={jobRoute}
            className="block p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-charcoal truncate">{job.title}</p>
                <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
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
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-rust transition-colors" />
            </div>
          </Link>
        </div>
      </div>

      {/* Timeline Card */}
      {timelineEvents.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
              Timeline
            </span>
            <Clock className="w-4 h-4 text-stone-400" />
          </div>
          <div className="space-y-3">
            {timelineEvents.map((event, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-rust flex-shrink-0" />
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm text-charcoal">{event.label}</span>
                  <span className="text-xs text-stone-400">
                    {event.date.toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Days Active */}
      {submission.createdAt && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
              Days Active
            </span>
            <Calendar className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-3xl font-bold text-charcoal">
            {Math.floor(
              (new Date().getTime() - new Date(submission.createdAt).getTime()) /
                (1000 * 60 * 60 * 24)
            )}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Since {new Date(submission.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}

export default SubmissionSidebarContent;
