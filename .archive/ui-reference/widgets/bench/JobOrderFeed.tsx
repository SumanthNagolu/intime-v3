'use client';

/**
 * Job Order Feed Widget
 *
 * Displays recent job orders with quick actions.
 */

import React from 'react';
import { Briefcase, MapPin, DollarSign, Clock, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface JobOrder {
  id: string;
  title: string;
  vendor?: { name: string };
  priority?: string;
  workMode?: string;
  location?: string;
  rateRangeFormatted?: string;
  postedAtRelative?: string;
  bestMatchScore?: number;
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  normal: 'bg-blue-100 text-blue-700',
  low: 'bg-stone-100 text-stone-700',
};

export function JobOrderFeed({ definition, data, context }: SectionWidgetProps) {
  const isLoading = context?.isLoading;
  const componentProps = definition.componentProps as {
    maxItems?: number;
  } | undefined;
  const maxItems = componentProps?.maxItems || 5;

  const jobOrders = Array.isArray(data) ? data as JobOrder[] :
    ((data as Record<string, unknown>)?.jobOrders as JobOrder[]) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            <span>New Job Orders</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="h-5 w-48 bg-stone-200 rounded mb-2" />
                <div className="h-4 w-32 bg-stone-100 rounded mb-3" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-stone-100 rounded" />
                  <div className="h-6 w-20 bg-stone-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          <span>
            {typeof definition.title === 'string' ? definition.title : 'New Job Orders'}
          </span>
        </CardTitle>
        <Link href="/employee/bench/job-orders">
          <Button variant="ghost" size="sm">
            View All
            <ExternalLink className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {jobOrders.slice(0, maxItems).map((job) => (
            <div
              key={job.id}
              className="p-4 border rounded-lg hover:bg-stone-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-stone-900">{job.title}</h4>
                  {job.vendor?.name && (
                    <p className="text-sm text-stone-500">{job.vendor.name}</p>
                  )}
                </div>
                {job.bestMatchScore !== undefined && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {job.bestMatchScore}% Match
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {job.priority && (
                  <Badge className={cn('capitalize', PRIORITY_COLORS[job.priority])}>
                    {job.priority}
                  </Badge>
                )}
                {job.workMode && (
                  <Badge variant="outline">{job.workMode}</Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-stone-500">
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>
                )}
                {job.rateRangeFormatted && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {job.rateRangeFormatted}
                  </span>
                )}
                {job.postedAtRelative && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {job.postedAtRelative}
                  </span>
                )}
              </div>
            </div>
          ))}
          {jobOrders.length === 0 && (
            <p className="text-sm text-stone-400 text-center py-8">
              No job orders available
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default JobOrderFeed;
