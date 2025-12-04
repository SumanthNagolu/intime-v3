'use client';

/**
 * Job Order Feed Widget
 *
 * Displays recent job orders with key details
 */

import React from 'react';
import { MapPin, DollarSign, Clock, Building2, Briefcase, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface JobOrder {
  id: string;
  title: string;
  vendor: { name: string };
  location: string;
  workMode: string;
  rateRangeFormatted: string;
  postedAtRelative: string;
  priority: string;
  bestMatchScore: number;
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-amber-100 text-amber-700 border-amber-200',
  medium: 'bg-blue-100 text-blue-700 border-blue-200',
  low: 'bg-charcoal-100 text-charcoal-700 border-charcoal-200',
};

const WORK_MODE_LABELS: Record<string, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site',
};

function JobOrderCard({ job }: { job: JobOrder }) {
  return (
    <Link
      href={`/employee/bench/jobs/${job.id}`}
      className="block p-4 rounded-lg border border-charcoal-100 transition-all hover:shadow-md hover:border-charcoal-200 group bg-white"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-charcoal-900 truncate group-hover:text-goldfinch-700">
            {job.title}
          </h4>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-charcoal-500">
            <Building2 className="w-3 h-3" />
            <span className="truncate">{job.vendor.name}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge variant="outline" className={cn('text-xs', PRIORITY_COLORS[job.priority] || PRIORITY_COLORS.medium)}>
            {job.priority}
          </Badge>
          {job.bestMatchScore > 0 && (
            <div className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              job.bestMatchScore >= 80 ? 'bg-green-100 text-green-700' :
              job.bestMatchScore >= 60 ? 'bg-amber-100 text-amber-700' :
              'bg-charcoal-100 text-charcoal-600'
            )}>
              {job.bestMatchScore}% match
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-y-1.5 text-xs text-charcoal-600">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-charcoal-400" />
          <span className="truncate">{job.location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Briefcase className="w-3 h-3 text-charcoal-400" />
          <span>{WORK_MODE_LABELS[job.workMode] || job.workMode}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-3 h-3 text-charcoal-400" />
          <span>{job.rateRangeFormatted}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-charcoal-400" />
          <span>{job.postedAtRelative}</span>
        </div>
      </div>
    </Link>
  );
}

export function JobOrderFeed({ definition, data, context }: SectionWidgetProps) {
  const jobs = data as JobOrder[] | undefined;
  const isLoading = context?.isLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="h-6 w-36 bg-stone-200 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-stone-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-charcoal-100">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-heading font-bold text-charcoal-900">
            {(typeof definition.title === 'string' ? definition.title : 'New Job Orders') || 'New Job Orders'}
          </CardTitle>
          <Link
            href="/employee/bench/jobs"
            className="text-sm text-goldfinch-600 hover:text-goldfinch-700 flex items-center gap-1"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {jobs && jobs.length > 0 ? (
            jobs.slice(0, 5).map((job) => (
              <JobOrderCard key={job.id} job={job} />
            ))
          ) : (
            <div className="text-center py-8 text-charcoal-400">
              <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No job orders available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default JobOrderFeed;
