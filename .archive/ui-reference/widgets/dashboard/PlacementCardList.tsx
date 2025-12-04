'use client';

/**
 * Placement Card List Widget
 *
 * Displays active placements in a card grid format with health indicators.
 * Shows consultant, client, rate, dates, and status.
 */

import React from 'react';
import { Briefcase, User, Building2, DollarSign, Calendar, Heart, ChevronRight, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface PlacementData {
  id: string;
  consultant: { name: string };
  client: { name: string };
  role: string;
  healthScore: number;
  startedFormatted: string;
  rateFormatted: string;
  monthlyValueFormatted: string;
  nextCheckinFormatted: string;
  statusNote: string;
}

function getHealthColor(score: number): { bg: string; text: string; ring: string } {
  if (score >= 90) return { bg: 'bg-success-100', text: 'text-success-700', ring: 'ring-success-500' };
  if (score >= 70) return { bg: 'bg-gold-100', text: 'text-gold-700', ring: 'ring-gold-500' };
  if (score >= 50) return { bg: 'bg-warning-100', text: 'text-warning-700', ring: 'ring-warning-500' };
  return { bg: 'bg-error-100', text: 'text-error-700', ring: 'ring-error-500' };
}

function PlacementCard({ placement }: { placement: PlacementData }) {
  const healthColors = getHealthColor(placement.healthScore);

  return (
    <Link
      href={`/employee/bench/placements/${placement.id}`}
      className="block group"
    >
      <div className={cn(
        "p-4 rounded-xl border transition-all duration-200",
        "bg-white border-charcoal-100",
        "hover:border-forest-300 hover:shadow-md hover:-translate-y-0.5"
      )}>
        {/* Header with health score */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-forest-100 text-forest-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-charcoal-900 truncate max-w-[120px]">
                {placement.consultant.name}
              </p>
              <p className="text-xs text-charcoal-500">{placement.role}</p>
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
            healthColors.bg, healthColors.text
          )}>
            <Heart className="w-3 h-3" />
            {placement.healthScore}%
          </div>
        </div>

        {/* Client */}
        <div className="flex items-center gap-2 text-xs text-charcoal-600 mb-2">
          <Building2 className="w-3.5 h-3.5 text-charcoal-400" />
          <span className="truncate">{placement.client.name}</span>
        </div>

        {/* Rate and Value */}
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-1 text-charcoal-600">
            <DollarSign className="w-3.5 h-3.5 text-gold-500" />
            <span className="font-medium">{placement.rateFormatted}</span>
          </div>
          <span className="text-forest-600 font-bold">{placement.monthlyValueFormatted}</span>
        </div>

        {/* Footer with dates */}
        <div className="flex items-center justify-between pt-2 border-t border-charcoal-100">
          <div className="flex items-center gap-1 text-xs text-charcoal-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>Started {placement.startedFormatted}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-charcoal-500">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Check-in {placement.nextCheckinFormatted}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function PlacementCardList({ definition, data, context }: SectionWidgetProps) {
  const placements = (data as PlacementData[] | undefined) || [];
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 bg-stone-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalMonthlyValue = placements.reduce((sum, p) => {
    const value = parseFloat(p.monthlyValueFormatted.replace(/[$,/mo]/g, '')) || 0;
    return sum + value;
  }, 0);

  return (
    <Card className="border-charcoal-100 shadow-elevation-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-forest rounded-lg flex items-center justify-center shadow-sm">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-heading font-bold text-charcoal-900">
                {(typeof definition.title === 'string' ? definition.title : 'Active Placements') || 'Active Placements'}
              </CardTitle>
              <p className="text-sm text-charcoal-500 mt-0.5">
                {placements.length} consultants generating ${totalMonthlyValue.toLocaleString()}/mo
              </p>
            </div>
          </div>
          <Link
            href="/employee/bench/placements"
            className="text-xs font-medium text-forest-600 hover:text-forest-700 flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {placements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {placements.map((placement) => (
              <PlacementCard key={placement.id} placement={placement} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-charcoal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-charcoal-400" />
            </div>
            <p className="text-sm font-medium text-charcoal-600">
              No active placements
            </p>
            <p className="text-xs text-charcoal-400 mt-1">
              Placements will appear here once consultants are placed
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PlacementCardList;
