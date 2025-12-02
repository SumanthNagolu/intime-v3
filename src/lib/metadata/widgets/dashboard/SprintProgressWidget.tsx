'use client';

/**
 * Sprint Progress Widget
 *
 * Displays 6 KPI metrics with progress towards sprint targets.
 * Shows on-track/off-track indicators with color coding.
 */

import React from 'react';
import { Trophy, DollarSign, Send, Users, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface MetricData {
  current: number;
  target: number;
}

interface SprintProgressData {
  sprintName: string;
  daysRemaining: number;
  placements: MetricData;
  revenue: MetricData;
  submissions: MetricData;
  interviews: MetricData;
  candidates: MetricData;
  jobFill: MetricData;
}

const METRIC_CONFIG = [
  { key: 'placements', label: 'Placements', icon: Trophy, color: 'forest', format: 'number', href: '/employee/recruiting/submissions?status=placed' },
  { key: 'revenue', label: 'Revenue', icon: DollarSign, color: 'gold', format: 'currency', href: '/employee/recruiting/submissions?status=placed' },
  { key: 'submissions', label: 'Submissions', icon: Send, color: 'rust', format: 'number', href: '/employee/recruiting/submissions' },
  { key: 'interviews', label: 'Interviews', icon: Users, color: 'charcoal', format: 'number', href: '/employee/recruiting/pipeline?stage=interview' },
  { key: 'candidates', label: 'Candidates Sourced', icon: Target, color: 'forest', format: 'number', href: '/employee/recruiting/talent' },
  { key: 'jobFill', label: 'Job Fill Rate', icon: TrendingUp, color: 'gold', format: 'percent', href: '/employee/recruiting/jobs' },
];

function formatValue(value: number, format: string): string {
  switch (format) {
    case 'currency':
      return `$${(value / 1000).toFixed(0)}K`;
    case 'percent':
      return `${value}%`;
    default:
      return value.toString();
  }
}

function getProgressColor(progress: number): string {
  if (progress >= 100) return 'bg-success-500';
  if (progress >= 70) return 'bg-gold-500';
  if (progress >= 40) return 'bg-warning-500';
  return 'bg-error-500';
}

function getStatusLabel(progress: number): { label: string; color: string } {
  if (progress >= 100) return { label: 'ON TRACK', color: 'text-success-600 bg-success-50' };
  if (progress >= 70) return { label: 'CLOSE', color: 'text-gold-600 bg-gold-50' };
  if (progress >= 40) return { label: 'BEHIND', color: 'text-warning-600 bg-warning-50' };
  return { label: 'AT RISK', color: 'text-error-600 bg-error-50' };
}

export function SprintProgressWidget({ definition, data, context }: SectionWidgetProps) {
  const sprintData = data as SprintProgressData | undefined;
  const isLoading = context?.isLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-forest-100 rounded-lg animate-pulse" />
            <div className="h-6 w-40 bg-stone-200 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-stone-50 animate-pulse">
                <div className="h-4 w-20 bg-stone-200 rounded mb-2" />
                <div className="h-8 w-16 bg-stone-200 rounded mb-2" />
                <div className="h-2 w-full bg-stone-200 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Count on-track metrics
  const onTrackCount = METRIC_CONFIG.filter((config) => {
    const metric = sprintData?.[config.key as keyof SprintProgressData] as MetricData | undefined;
    if (!metric) return false;
    const progress = metric.target > 0 ? (metric.current / metric.target) * 100 : 0;
    return progress >= 70;
  }).length;

  return (
    <Card className="border-charcoal-100 shadow-elevation-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-forest rounded-lg flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-heading font-bold text-charcoal-900">
                {definition.title || 'Sprint Progress'}
              </CardTitle>
              <p className="text-sm text-charcoal-500 mt-0.5">
                {sprintData?.sprintName || 'Current Sprint'} • {sprintData?.daysRemaining || 0} days remaining
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full",
              onTrackCount >= 4 ? "text-success-600 bg-success-50" :
              onTrackCount >= 2 ? "text-warning-600 bg-warning-50" :
              "text-error-600 bg-error-50"
            )}>
              {onTrackCount}/6 On Track
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {METRIC_CONFIG.map((config) => {
            const metric = sprintData?.[config.key as keyof SprintProgressData] as MetricData | undefined;
            const current = metric?.current || 0;
            const target = metric?.target || 1;
            const progress = Math.min(100, Math.round((current / target) * 100));
            const status = getStatusLabel(progress);
            const Icon = config.icon;

            return (
              <Link
                key={config.key}
                href={config.href}
                className="group block"
              >
                <div className={cn(
                  "p-4 rounded-xl border transition-all duration-200",
                  "bg-white border-charcoal-100",
                  "hover:border-forest-300 hover:shadow-md hover:-translate-y-0.5"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      config.color === 'forest' && "bg-forest-100 text-forest-600",
                      config.color === 'gold' && "bg-gold-100 text-gold-600",
                      config.color === 'rust' && "bg-rust-100 text-rust-600",
                      config.color === 'charcoal' && "bg-charcoal-100 text-charcoal-600"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                      status.color
                    )}>
                      {status.label}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="text-2xl font-heading font-black text-charcoal-900">
                      {formatValue(current, config.format)}
                    </span>
                    <span className="text-sm text-charcoal-400 ml-1">
                      / {formatValue(target, config.format)}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-charcoal-500 mb-2">
                    {config.label}
                  </p>
                  <div className="h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", getProgressColor(progress))}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default SprintProgressWidget;
