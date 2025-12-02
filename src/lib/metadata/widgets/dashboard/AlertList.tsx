'use client';

/**
 * Alert List Widget
 *
 * Displays urgent attention items like stale jobs, overdue feedback, etc.
 * Shows actionable alerts with navigation.
 */

import React from 'react';
import { AlertTriangle, Clock, MessageSquare, Briefcase, ChevronRight, Bell } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface PipelineHealthData {
  staleJobs: number;
  overdueFeedback: number;
  interviewsNeedScheduling: number;
  placementsDueCheckin: number;
  offersOutstanding: number;
}

interface AlertConfig {
  key: keyof PipelineHealthData;
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  severity: 'error' | 'warning' | 'info';
}

const ALERT_CONFIG: AlertConfig[] = [
  {
    key: 'staleJobs',
    label: 'Stale Jobs',
    description: 'Open jobs with weak pipeline (14+ days)',
    icon: Briefcase,
    href: '/employee/recruiting/jobs?filter=stale',
    severity: 'error',
  },
  {
    key: 'overdueFeedback',
    label: 'Awaiting Feedback',
    description: 'Client feedback overdue (3+ days)',
    icon: MessageSquare,
    href: '/employee/recruiting/submissions?filter=awaiting_feedback',
    severity: 'warning',
  },
  {
    key: 'interviewsNeedScheduling',
    label: 'Interviews to Schedule',
    description: 'Submissions ready for interview',
    icon: Clock,
    href: '/employee/recruiting/pipeline?stage=interview',
    severity: 'info',
  },
  {
    key: 'placementsDueCheckin',
    label: 'Check-ins Due',
    description: 'Active placements need check-in (30+ days)',
    icon: Bell,
    href: '/employee/recruiting/submissions?status=placed',
    severity: 'info',
  },
  {
    key: 'offersOutstanding',
    label: 'Pending Offers',
    description: 'Offers awaiting response',
    icon: AlertTriangle,
    href: '/employee/recruiting/pipeline?stage=offer',
    severity: 'warning',
  },
];

function AlertItem({ config, count }: { config: AlertConfig; count: number }) {
  const Icon = config.icon;

  if (count === 0) return null;

  return (
    <Link
      href={config.href}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
        "hover:shadow-md group",
        config.severity === 'error' && "bg-error-50 hover:bg-error-100 border border-error-200",
        config.severity === 'warning' && "bg-warning-50 hover:bg-warning-100 border border-warning-200",
        config.severity === 'info' && "bg-charcoal-50 hover:bg-charcoal-100 border border-charcoal-200"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
        config.severity === 'error' && "bg-error-100 text-error-600",
        config.severity === 'warning' && "bg-warning-100 text-warning-600",
        config.severity === 'info' && "bg-charcoal-200 text-charcoal-600"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-bold",
            config.severity === 'error' && "text-error-700",
            config.severity === 'warning' && "text-warning-700",
            config.severity === 'info' && "text-charcoal-700"
          )}>
            {config.label}
          </span>
          <span className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-full",
            config.severity === 'error' && "bg-error-200 text-error-700",
            config.severity === 'warning' && "bg-warning-200 text-warning-700",
            config.severity === 'info' && "bg-charcoal-200 text-charcoal-700"
          )}>
            {count}
          </span>
        </div>
        <p className={cn(
          "text-xs mt-0.5",
          config.severity === 'error' && "text-error-600",
          config.severity === 'warning' && "text-warning-600",
          config.severity === 'info' && "text-charcoal-500"
        )}>
          {config.description}
        </p>
      </div>
      <ChevronRight className={cn(
        "w-5 h-5 transition-transform group-hover:translate-x-1",
        config.severity === 'error' && "text-error-400",
        config.severity === 'warning' && "text-warning-400",
        config.severity === 'info' && "text-charcoal-400"
      )} />
    </Link>
  );
}

export function AlertList({ definition, data, context }: SectionWidgetProps) {
  const healthData = data as PipelineHealthData | undefined;
  const isLoading = context?.isLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-error-100 rounded-lg animate-pulse" />
            <div className="h-6 w-40 bg-stone-200 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-stone-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter alerts with count > 0
  const activeAlerts = ALERT_CONFIG.filter((config) => {
    const count = healthData?.[config.key] || 0;
    return count > 0;
  });

  const totalAlerts = activeAlerts.reduce((sum, config) => {
    return sum + (healthData?.[config.key] || 0);
  }, 0);

  return (
    <Card className="border-charcoal-100 shadow-elevation-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shadow-sm",
              totalAlerts > 0 ? "bg-gradient-to-br from-error-500 to-error-600" : "bg-gradient-to-br from-success-500 to-success-600"
            )}>
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-heading font-bold text-charcoal-900">
                {(typeof definition.title === 'string' ? definition.title : 'Needs Attention') || 'Needs Attention'}
              </CardTitle>
              <p className="text-sm text-charcoal-500 mt-0.5">
                {totalAlerts > 0 ? `${totalAlerts} items require action` : 'All clear!'}
              </p>
            </div>
          </div>
          {totalAlerts > 0 && (
            <span className="text-xs font-bold text-error-600 bg-error-50 px-3 py-1.5 rounded-full">
              {activeAlerts.length} ALERTS
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {activeAlerts.length > 0 ? (
          <div className="space-y-3">
            {activeAlerts.map((config) => (
              <AlertItem
                key={config.key}
                config={config}
                count={healthData?.[config.key] || 0}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-charcoal-600">
              No urgent items
            </p>
            <p className="text-xs text-charcoal-400 mt-1">
              Your pipeline is healthy
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AlertList;
