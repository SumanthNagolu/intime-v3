/**
 * JobOverviewContent Component
 *
 * Displays job overview with details, compensation, requirements, and key metrics.
 * Uses shared OverviewTab and MetricsGrid components.
 */

'use client';

import React from 'react';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Building2,
  Clock,
  Globe,
  FileText,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MetricsGrid, type MetricItem } from '../../sections/MetricsGrid';
import { InfoCard, type InfoCardField } from '../../sections/InfoCard';

// =====================================================
// TYPES
// =====================================================

export interface JobData {
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
  preferredSkills?: string[] | null;
  description?: string | null;
  requirements?: string | null;
  createdAt?: Date | string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
}

export interface JobMetrics {
  totalSubmissions?: number;
  activeSubmissions?: number;
  interviewsScheduled?: number;
  offersExtended?: number;
  placed?: number;
  avgTimeToSubmit?: number;
}

export interface JobOverviewContentProps {
  job: JobData;
  metrics?: JobMetrics | null;
  accountName?: string;
  onNavigateToAccount?: () => void;
  className?: string;
}

// =====================================================
// HELPERS
// =====================================================

function formatRate(job: JobData): string | null {
  if (!job.rateMin && !job.rateMax) return null;
  const min = job.rateMin ? `$${job.rateMin.toLocaleString()}` : '';
  const max = job.rateMax ? `$${job.rateMax.toLocaleString()}` : '';
  const type = job.rateType === 'hourly' ? '/hr' : job.rateType === 'annual' ? '/yr' : '';
  if (min && max) return `${min} - ${max}${type}`;
  if (min) return `${min}+${type}`;
  return `Up to ${max}${type}`;
}

function formatJobType(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function JobOverviewContent({
  job,
  metrics,
  accountName,
  onNavigateToAccount,
  className,
}: JobOverviewContentProps) {
  // Build metrics for grid
  const overviewMetrics: MetricItem[] = [
    {
      label: 'Submissions',
      value: metrics?.totalSubmissions ?? 0,
      icon: Users,
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Active',
      value: metrics?.activeSubmissions ?? 0,
      icon: Briefcase,
      bgColor: 'bg-green-100',
    },
    {
      label: 'Interviews',
      value: metrics?.interviewsScheduled ?? 0,
      icon: Calendar,
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Offers',
      value: metrics?.offersExtended ?? 0,
      icon: FileText,
      bgColor: 'bg-amber-100',
    },
  ];

  // Build job details fields
  const detailFields: InfoCardField[] = [
    {
      label: 'Location',
      value: job.location || 'Not specified',
      icon: MapPin,
    },
    {
      label: 'Remote',
      value: job.isRemote ? 'Yes' : 'No',
      icon: Globe,
    },
    {
      label: 'Job Type',
      value: job.jobType ? formatJobType(job.jobType) : 'Not specified',
      icon: Briefcase,
    },
    {
      label: 'Positions',
      value: `${job.positionsFilled || 0} / ${job.positionsCount || 1} filled`,
      icon: Users,
    },
  ];

  // Compensation fields
  const compensationFields: InfoCardField[] = [
    {
      label: 'Rate',
      value: formatRate(job) || 'Not specified',
      icon: DollarSign,
    },
    {
      label: 'Rate Type',
      value: job.rateType ? formatJobType(job.rateType) : 'Not specified',
      icon: Clock,
    },
  ];

  // Timeline fields
  const timelineFields: InfoCardField[] = [
    {
      label: 'Created',
      value: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A',
      icon: Calendar,
    },
    {
      label: 'Start Date',
      value: job.startDate ? new Date(job.startDate).toLocaleDateString() : 'TBD',
      icon: Calendar,
    },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Key Metrics */}
      <MetricsGrid items={overviewMetrics} columns={4} />

      {/* Job Details & Compensation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoCard
          title="Job Details"
          fields={detailFields}
          icon={Briefcase}
        />
        <InfoCard
          title="Compensation"
          fields={compensationFields}
          icon={DollarSign}
        />
      </div>

      {/* Account & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {accountName && (
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-stone-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
                Client
              </h3>
            </div>
            <button
              onClick={onNavigateToAccount}
              className="flex items-center gap-3 w-full text-left p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-charcoal">{accountName}</div>
                <div className="text-xs text-stone-500">View account details</div>
              </div>
            </button>
          </div>
        )}
        <InfoCard
          title="Timeline"
          fields={timelineFields}
          icon={Calendar}
        />
      </div>

      {/* Skills */}
      {((job.requiredSkills?.length ?? 0) > 0 || (job.preferredSkills?.length ?? 0) > 0) && (
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-4">
            Skills
          </h3>
          <div className="space-y-4">
            {(job.requiredSkills?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">
                  Required
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {job.requiredSkills?.map((skill, idx) => (
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
            {(job.preferredSkills?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">
                  Preferred
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {job.preferredSkills?.map((skill, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="bg-stone-100 text-stone-600"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {job.description && (
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-4">
            Job Description
          </h3>
          <div className="prose prose-sm max-w-none text-stone-600">
            <p className="whitespace-pre-wrap">{job.description}</p>
          </div>
        </div>
      )}

      {/* Requirements */}
      {job.requirements && (
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-4">
            Requirements
          </h3>
          <div className="prose prose-sm max-w-none text-stone-600">
            <p className="whitespace-pre-wrap">{job.requirements}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobOverviewContent;
