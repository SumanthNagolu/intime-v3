'use client';

/**
 * Revenue Commission Widget
 *
 * Displays revenue and commission breakdown for bench sales.
 * Shows monthly revenue, placement counts, and commission details.
 */

import React from 'react';
import {
  DollarSign, TrendingUp, Award, Briefcase, Clock,
  Target, ChevronRight, ArrowUpRight, Wallet
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface RevenueCommissionData {
  totalPlacementRevenue: number;
  activePlacementCount: number;
  avgBillRate: number;
  totalHoursBilled: number;
  grossMargin: number;
  vendorCommission: number;
  netMargin: number;
  ytd: {
    totalRevenue: number;
    totalPlacements: number;
    avgPlacementDuration: number;
    retentionRate: number;
  };
  commission: {
    baseSalary: number;
    placementBonus: number;
    marginShare: number;
    sprintBonus: number;
    totalCompensation: number;
    ytdTotal: number;
    projectedAnnual: number;
  };
}

function formatCurrency(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toFixed(0)}`;
  }
  return `$${amount.toLocaleString()}`;
}

function MetricRow({ label, value, subtext, highlight = false }: {
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <span className="text-sm text-charcoal-600">{label}</span>
        {subtext && <span className="text-xs text-charcoal-400 ml-1">({subtext})</span>}
      </div>
      <span className={cn(
        "text-sm font-bold",
        highlight ? "text-forest-600" : "text-charcoal-900"
      )}>
        {value}
      </span>
    </div>
  );
}

export function RevenueCommissionWidget({ definition, data, context }: SectionWidgetProps) {
  const revenueData = data as RevenueCommissionData | undefined;
  const isLoading = context?.isLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-100 rounded-lg animate-pulse" />
            <div className="h-6 w-40 bg-stone-200 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-24 bg-stone-100 rounded-xl animate-pulse" />
            <div className="h-32 bg-stone-100 rounded-xl animate-pulse" />
            <div className="h-32 bg-stone-100 rounded-xl animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const monthlyRevenue = revenueData?.totalPlacementRevenue || 0;
  const commission = revenueData?.commission || {
    baseSalary: 0,
    placementBonus: 0,
    marginShare: 0,
    sprintBonus: 0,
    totalCompensation: 0,
    ytdTotal: 0,
    projectedAnnual: 0,
  };

  return (
    <Card className="border-charcoal-100 shadow-elevation-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-lg flex items-center justify-center shadow-sm">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-heading font-bold text-charcoal-900">
                {(typeof definition.title === 'string' ? definition.title : 'Revenue & Commission') || 'Revenue & Commission'}
              </CardTitle>
              <p className="text-sm text-charcoal-500 mt-0.5">
                Current month performance
              </p>
            </div>
          </div>
          <Link
            href="/employee/bench/commission"
            className="text-xs font-medium text-forest-600 hover:text-forest-700 flex items-center gap-1"
          >
            Details
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Revenue Display */}
        <div className="bg-gradient-to-br from-gold-50 to-gold-100 rounded-xl p-4 border border-gold-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gold-600 uppercase tracking-wider mb-1">
                Monthly Revenue
              </p>
              <p className="text-3xl font-heading font-black text-charcoal-900">
                {formatCurrency(monthlyRevenue)}
              </p>
              <p className="text-sm text-charcoal-500 mt-1">
                {revenueData?.activePlacementCount || 0} active placements
              </p>
            </div>
            <div className="flex items-center gap-1 bg-success-100 text-success-700 text-xs font-bold px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              12%
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gold-200">
            <div className="text-center">
              <p className="text-lg font-bold text-charcoal-900">
                ${revenueData?.avgBillRate || 0}
              </p>
              <p className="text-xs text-charcoal-500">Avg Bill Rate</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-forest-600">
                {formatCurrency(revenueData?.grossMargin || 0, true)}
              </p>
              <p className="text-xs text-charcoal-500">Gross Margin</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-charcoal-900">
                {revenueData?.totalHoursBilled?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-charcoal-500">Hours Billed</p>
            </div>
          </div>
        </div>

        {/* Commission Breakdown */}
        <div className="bg-charcoal-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-4 h-4 text-forest-600" />
            <h4 className="text-sm font-bold text-charcoal-900">Your Commission</h4>
          </div>

          <div className="divide-y divide-charcoal-100">
            <MetricRow label="Base Salary" value={formatCurrency(commission.baseSalary)} />
            <MetricRow label="Placement Bonus" value={formatCurrency(commission.placementBonus)} subtext={`${revenueData?.activePlacementCount || 0} × $500`} />
            <MetricRow label="Margin Share" value={formatCurrency(commission.marginShare)} subtext="2% of margin" />
            <MetricRow label="Sprint Bonus" value={formatCurrency(commission.sprintBonus)} />
            <div className="flex items-center justify-between py-3 mt-1">
              <span className="text-sm font-bold text-charcoal-900">Total This Month</span>
              <span className="text-lg font-black text-forest-600">
                {formatCurrency(commission.totalCompensation)}
              </span>
            </div>
          </div>
        </div>

        {/* YTD Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3 border border-charcoal-100">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-gold-500" />
              <span className="text-xs font-medium text-charcoal-500">YTD Revenue</span>
            </div>
            <p className="text-xl font-heading font-black text-charcoal-900">
              {formatCurrency(revenueData?.ytd?.totalRevenue || 0, true)}
            </p>
            <p className="text-xs text-charcoal-500">
              {revenueData?.ytd?.totalPlacements || 0} placements
            </p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-charcoal-100">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-forest-500" />
              <span className="text-xs font-medium text-charcoal-500">YTD Commission</span>
            </div>
            <p className="text-xl font-heading font-black text-charcoal-900">
              {formatCurrency(commission.ytdTotal, true)}
            </p>
            <p className="text-xs text-charcoal-500">
              Proj: {formatCurrency(commission.projectedAnnual, true)}/yr
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RevenueCommissionWidget;
