'use client';

/**
 * Marketing Activity Widget
 *
 * Shows marketing activity metrics and trends for bench sales.
 * Displays hotlist stats, vendor outreach, and LinkedIn activity.
 */

import React from 'react';
import {
  Megaphone, Mail, Phone, MessageSquare, TrendingUp, TrendingDown,
  Send, Users, Eye, MousePointer, ArrowUpRight, ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface RecentHotlist {
  id: string;
  name: string;
  sentDateFormatted: string;
  recipientCount: number;
  consultantCount: number;
  openedPercent: number;
  clickedPercent: number;
  respondedPercent: number;
  submissionsGenerated: number;
}

interface MarketingActivityData {
  hotlistsSent: number;
  totalRecipients: number;
  openRate: number;
  clickRate: number;
  responseRate: number;
  vendorCalls: number;
  linkedInMessages: number;
  vendorMeetings: number;
  recentHotlists: RecentHotlist[];
}

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: number;
  color: string;
}

function MetricCard({ icon: Icon, label, value, subtext, trend, color }: MetricCardProps) {
  const isPositive = trend && trend > 0;

  return (
    <div className={cn(
      "p-3 rounded-xl border transition-all duration-200",
      "bg-white border-charcoal-100 hover:border-charcoal-200 hover:shadow-sm"
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          color
        )}>
          <Icon className="w-4 h-4" />
        </div>
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-0.5 text-xs font-bold",
            isPositive ? "text-success-600" : "text-error-600"
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-xl font-heading font-black text-charcoal-900">
        {value}
      </div>
      <div className="text-xs text-charcoal-500">{label}</div>
      {subtext && (
        <div className="text-[10px] text-charcoal-400 mt-0.5">{subtext}</div>
      )}
    </div>
  );
}

function HotlistRow({ hotlist }: { hotlist: RecentHotlist }) {
  return (
    <Link
      href={`/employee/bench/hotlists/${hotlist.id}`}
      className="block"
    >
      <div className={cn(
        "flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200",
        "hover:bg-charcoal-50 group"
      )}>
        <div className="w-8 h-8 rounded-lg bg-rust-100 text-rust-600 flex items-center justify-center shrink-0">
          <Send className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-charcoal-900 truncate">
              {hotlist.name}
            </span>
            <span className="text-xs text-charcoal-400">
              {hotlist.sentDateFormatted}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-charcoal-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {hotlist.recipientCount} sent
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {hotlist.openedPercent}% opened
            </span>
            <span className="flex items-center gap-1">
              <MousePointer className="w-3 h-3" />
              {hotlist.clickedPercent}% clicked
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-forest-600">
            {hotlist.submissionsGenerated}
          </div>
          <div className="text-[10px] text-charcoal-400">submissions</div>
        </div>
        <ArrowUpRight className="w-4 h-4 text-charcoal-300 group-hover:text-forest-500 transition-colors" />
      </div>
    </Link>
  );
}

export function MarketingActivityWidget({ definition, data, context }: SectionWidgetProps) {
  const activityData = data as MarketingActivityData | undefined;
  const isLoading = context?.isLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rust-100 rounded-lg animate-pulse" />
            <div className="h-6 w-40 bg-stone-200 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-stone-100 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-stone-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      icon: Send,
      label: 'Hotlists Sent',
      value: activityData?.hotlistsSent || 0,
      subtext: `${activityData?.totalRecipients || 0} recipients`,
      trend: 12,
      color: 'bg-rust-100 text-rust-600'
    },
    {
      icon: Eye,
      label: 'Open Rate',
      value: `${activityData?.openRate || 0}%`,
      trend: 5,
      color: 'bg-gold-100 text-gold-600'
    },
    {
      icon: Phone,
      label: 'Vendor Calls',
      value: activityData?.vendorCalls || 0,
      subtext: `${activityData?.vendorMeetings || 0} meetings booked`,
      trend: -3,
      color: 'bg-forest-100 text-forest-600'
    },
    {
      icon: MessageSquare,
      label: 'LinkedIn Messages',
      value: activityData?.linkedInMessages || 0,
      subtext: `${activityData?.responseRate || 0}% response`,
      trend: 8,
      color: 'bg-charcoal-100 text-charcoal-600'
    },
  ];

  return (
    <Card className="border-charcoal-100 shadow-elevation-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-rust-500 to-rust-600 rounded-lg flex items-center justify-center shadow-sm">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-heading font-bold text-charcoal-900">
                {(typeof definition.title === 'string' ? definition.title : 'Marketing Activity') || 'Marketing Activity'}
              </CardTitle>
              <p className="text-sm text-charcoal-500 mt-0.5">
                This week's outreach performance
              </p>
            </div>
          </div>
          <Link
            href="/employee/bench/marketing"
            className="text-xs font-medium text-forest-600 hover:text-forest-700 flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Recent Hotlists */}
        {activityData?.recentHotlists && activityData.recentHotlists.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-charcoal-500 uppercase tracking-wider mb-2">
              Recent Hotlists
            </h4>
            <div className="space-y-1">
              {activityData.recentHotlists.map((hotlist) => (
                <HotlistRow key={hotlist.id} hotlist={hotlist} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MarketingActivityWidget;
