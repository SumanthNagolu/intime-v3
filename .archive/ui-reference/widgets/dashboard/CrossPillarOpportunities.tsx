'use client';

/**
 * Cross-Pillar Opportunities Widget
 *
 * Shows potential opportunities detected from recent interactions that could
 * benefit other business pillars (Academy, Bench Sales, TA).
 */

import React from 'react';
import { Lightbulb, GraduationCap, Users, Target, ChevronRight, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface Opportunity {
  id: string;
  pillar: 'academy' | 'bench_sales' | 'ta';
  title: string;
  description: string;
  sourceActivity: {
    type: string;
    entityType: string;
    entityName: string;
    date: string | Date;
  };
  confidence: 'high' | 'medium' | 'low';
  actionUrl?: string;
}

interface OpportunitiesData {
  opportunities: Opportunity[];
  length: number;
}

const PILLAR_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string; bgColor: string }> = {
  academy: {
    icon: GraduationCap,
    label: 'Training Need',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  bench_sales: {
    icon: Users,
    label: 'Bench Opportunity',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  ta: {
    icon: Target,
    label: 'New Business',
    color: 'text-forest-600',
    bgColor: 'bg-forest-100',
  },
};

const CONFIDENCE_COLORS: Record<string, string> = {
  high: 'bg-success-100 text-success-700',
  medium: 'bg-warning-100 text-warning-700',
  low: 'bg-charcoal-100 text-charcoal-600',
};

function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

function OpportunityRow({ opportunity }: { opportunity: Opportunity }) {
  const config = PILLAR_CONFIG[opportunity.pillar] || PILLAR_CONFIG.ta;
  const Icon = config.icon;

  return (
    <Link
      href={opportunity.actionUrl || '#'}
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-charcoal-50 transition-colors group"
    >
      <div className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
        config.bgColor
      )}>
        <Icon className={cn("w-4 h-4", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4", config.color)}>
            {config.label}
          </Badge>
          <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 h-4", CONFIDENCE_COLORS[opportunity.confidence])}>
            {opportunity.confidence}
          </Badge>
        </div>
        <p className="text-sm font-medium text-charcoal-900 leading-tight">
          {opportunity.title}
        </p>
        <p className="text-xs text-charcoal-500 mt-0.5 line-clamp-2">
          {opportunity.description}
        </p>
        <p className="text-[10px] text-charcoal-400 mt-1">
          From {opportunity.sourceActivity.type} with {opportunity.sourceActivity.entityName} • {formatRelativeTime(opportunity.sourceActivity.date)}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-charcoal-300 group-hover:text-charcoal-500 transition-colors shrink-0 mt-1" />
    </Link>
  );
}

export function CrossPillarOpportunities({ definition, data, context }: SectionWidgetProps) {
  const opportunitiesData = data as OpportunitiesData | undefined;
  const isLoading = context?.isLoading;
  const maxItems = (definition.componentProps?.maxItems as number) || 5;
  const showSourceActivity = definition.componentProps?.showSourceActivity as boolean;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold-100 rounded-lg animate-pulse" />
            <div className="h-5 w-44 bg-charcoal-100 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-charcoal-50 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const opportunities = opportunitiesData?.opportunities?.slice(0, maxItems) || [];

  if (opportunities.length === 0) {
    return (
      <Card className="border-charcoal-100">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold-100 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-gold-600" />
            </div>
            <CardTitle className="text-base font-heading font-semibold text-charcoal-900">
              Cross-Pillar Opportunities
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Sparkles className="w-8 h-8 text-charcoal-300 mx-auto mb-2" />
            <p className="text-sm text-charcoal-500">No opportunities detected</p>
            <p className="text-xs text-charcoal-400 mt-1">
              AI will surface opportunities from your interactions
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-charcoal-100 shadow-elevation-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold-100 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-gold-600" />
            </div>
            <div>
              <CardTitle className="text-base font-heading font-semibold text-charcoal-900">
                {typeof definition.title === 'string' ? definition.title : 'Cross-Pillar Opportunities'}
              </CardTitle>
              {typeof definition.description === 'string' && (
                <p className="text-xs text-charcoal-500">{definition.description}</p>
              )}
            </div>
          </div>
          <Link
            href="/employee/workspace/opportunities"
            className="text-xs font-semibold text-forest-600 hover:text-forest-700"
          >
            View All
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-1">
          {opportunities.map((opp) => (
            <OpportunityRow key={opp.id} opportunity={opp} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default CrossPillarOpportunities;
