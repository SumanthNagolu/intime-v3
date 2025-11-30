/**
 * JobSidebarContent Component
 *
 * Sidebar content for job workspace including job card,
 * compensation, positions progress, and skills.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

export interface JobSidebarData {
  id: string;
  title: string;
  status: string;
  location?: string | null;
  isRemote?: boolean | null;
  jobType?: string | null;
  rateMin?: number | null;
  rateMax?: number | null;
  rateType?: string | null;
  positionsCount?: number | null;
  positionsFilled?: number | null;
  requiredSkills?: string[] | null;
  createdAt?: Date | string | null;
}

export interface TasksSummary {
  total: number;
  completed: number;
  overdue: number;
}

export interface JobSidebarContentProps {
  job: JobSidebarData;
  accountName?: string;
  accountId?: string;
  accountRoute?: string;
  tasksSummary?: TasksSummary;
  className?: string;
}

// =====================================================
// STATUS COLORS
// =====================================================

const JOB_STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-100 text-green-700 border-green-200',
  on_hold: 'bg-amber-100 text-amber-700 border-amber-200',
  filled: 'bg-blue-100 text-blue-700 border-blue-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  draft: 'bg-stone-100 text-stone-700 border-stone-200',
  urgent: 'bg-red-100 text-red-700 border-red-200',
};

// =====================================================
// HELPERS
// =====================================================

function formatRate(job: JobSidebarData): string | null {
  if (!job.rateMin && !job.rateMax) return null;
  const min = job.rateMin ? `$${job.rateMin.toLocaleString()}` : '';
  const max = job.rateMax ? `$${job.rateMax.toLocaleString()}` : '';
  const type = job.rateType === 'hourly' ? '/hr' : job.rateType === 'annual' ? '/yr' : '';
  if (min && max) return `${min} - ${max}${type}`;
  if (min) return `${min}+${type}`;
  return `Up to ${max}${type}`;
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function JobSidebarContent({
  job,
  accountName,
  accountId,
  accountRoute = `/employee/recruiting/accounts/${accountId}`,
  tasksSummary,
  className,
}: JobSidebarContentProps) {
  const positionsFilled = job.positionsFilled || 0;
  const positionsTotal = job.positionsCount || 1;
  const fillPercentage = (positionsFilled / positionsTotal) * 100;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Job Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-stone-800 to-stone-700" />
        <div className="px-6 pb-6 -mt-10">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-white">
            <Briefcase className="w-8 h-8 text-rust" />
          </div>
          <h1 className="text-xl font-serif font-bold text-charcoal text-center mb-1">
            {job.title}
          </h1>
          {accountName && accountId && (
            <Link
              href={accountRoute}
              className="flex items-center justify-center gap-1 text-sm text-stone-500 hover:text-rust transition-colors"
            >
              <Building2 className="w-3 h-3" /> {accountName}
            </Link>
          )}

          {/* Status Badge */}
          <div className="flex justify-center mt-3">
            <Badge
              variant="outline"
              className={cn(
                'text-xs font-bold uppercase tracking-wider',
                JOB_STATUS_COLORS[job.status] || JOB_STATUS_COLORS.open
              )}
            >
              {job.status.replace(/_/g, ' ')}
            </Badge>
          </div>

          {/* Job Details */}
          <div className="space-y-2 text-sm border-t border-stone-100 pt-4 mt-4">
            {job.location && (
              <div className="flex items-center gap-2 text-stone-600">
                <MapPin className="w-4 h-4 text-stone-400" />
                <span>
                  {job.location}
                  {job.isRemote && <span className="text-blue-600 ml-1">(Remote)</span>}
                </span>
              </div>
            )}
            {job.jobType && (
              <div className="flex items-center gap-2 text-stone-600">
                <Briefcase className="w-4 h-4 text-stone-400" />
                <span className="capitalize">{job.jobType.replace(/_/g, ' ')}</span>
              </div>
            )}
            {job.createdAt && (
              <div className="flex items-center gap-2 text-stone-600">
                <Calendar className="w-4 h-4 text-stone-400" />
                <span>Created {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compensation Card */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
            Compensation
          </span>
          <DollarSign className="w-4 h-4 text-green-400" />
        </div>
        <div className="text-2xl font-serif font-bold mb-2">
          {formatRate(job) || 'Not specified'}
        </div>
        <div className="text-xs text-stone-400">
          {job.rateType === 'hourly'
            ? 'Hourly Rate'
            : job.rateType === 'annual'
              ? 'Annual Salary'
              : 'Rate'}
        </div>
      </div>

      {/* Positions Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
            Positions
          </span>
          <Users className="w-4 h-4 text-stone-400" />
        </div>
        <div className="flex items-center gap-6">
          <div>
            <div className="text-2xl font-bold text-charcoal">{positionsFilled}</div>
            <div className="text-xs text-stone-500">Filled</div>
          </div>
          <div className="text-stone-300 text-xl">/</div>
          <div>
            <div className="text-2xl font-bold text-charcoal">{positionsTotal}</div>
            <div className="text-xs text-stone-500">Open</div>
          </div>
        </div>
        <div className="mt-4">
          <Progress value={fillPercentage} className="h-2" />
        </div>
      </div>

      {/* Tasks Summary Card */}
      {tasksSummary && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
              Tasks
            </span>
            <span className="text-sm font-medium text-stone-600">
              {tasksSummary.completed}/{tasksSummary.total}
            </span>
          </div>
          {tasksSummary.overdue > 0 && (
            <div className="flex items-center gap-2 text-red-600 text-xs mb-3">
              <AlertCircle className="w-3 h-3" />
              {tasksSummary.overdue} overdue
            </div>
          )}
          <div className="relative h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'absolute inset-y-0 left-0 rounded-full transition-all',
                tasksSummary.overdue > 0 ? 'bg-amber-500' : 'bg-green-500'
              )}
              style={{
                width: `${tasksSummary.total ? (tasksSummary.completed / tasksSummary.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Required Skills Card */}
      {(job.requiredSkills?.length ?? 0) > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
              Required Skills
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {job.requiredSkills?.map((skill, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="bg-rust/10 text-rust border-rust/20 text-xs"
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

export default JobSidebarContent;
