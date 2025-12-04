'use client';

/**
 * Integration Category Grid Widget
 *
 * Displays integration categories in a grid with counts and click-to-filter.
 */

import React from 'react';
import {
  Webhook, Database, Mail, MessageSquare, Calendar,
  Cloud, CreditCard, FileText, Users, BarChart3, ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface IntegrationCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  activeCount: number;
  description: string;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  crm: Users,
  ats: FileText,
  communication: MessageSquare,
  calendar: Calendar,
  cloud: Cloud,
  payment: CreditCard,
  analytics: BarChart3,
  database: Database,
  email: Mail,
  webhook: Webhook,
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  crm: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  ats: { bg: 'bg-forest-50', text: 'text-forest-600', border: 'border-forest-200' },
  communication: { bg: 'bg-gold-50', text: 'text-gold-600', border: 'border-gold-200' },
  calendar: { bg: 'bg-rust-50', text: 'text-rust-600', border: 'border-rust-200' },
  cloud: { bg: 'bg-charcoal-50', text: 'text-charcoal-600', border: 'border-charcoal-200' },
  payment: { bg: 'bg-success-50', text: 'text-success-600', border: 'border-success-200' },
  analytics: { bg: 'bg-warning-50', text: 'text-warning-600', border: 'border-warning-200' },
  database: { bg: 'bg-error-50', text: 'text-error-600', border: 'border-error-200' },
  email: { bg: 'bg-forest-50', text: 'text-forest-600', border: 'border-forest-200' },
  webhook: { bg: 'bg-charcoal-50', text: 'text-charcoal-600', border: 'border-charcoal-200' },
};

// Default categories
const DEFAULT_CATEGORIES: IntegrationCategory[] = [
  { id: 'crm', name: 'CRM', icon: 'crm', count: 5, activeCount: 2, description: 'Customer relationship management' },
  { id: 'ats', name: 'ATS', icon: 'ats', count: 4, activeCount: 1, description: 'Applicant tracking systems' },
  { id: 'communication', name: 'Communication', icon: 'communication', count: 6, activeCount: 3, description: 'Slack, Teams, messaging' },
  { id: 'calendar', name: 'Calendar', icon: 'calendar', count: 3, activeCount: 2, description: 'Google, Outlook calendar' },
  { id: 'email', name: 'Email', icon: 'email', count: 4, activeCount: 2, description: 'Email providers & marketing' },
  { id: 'analytics', name: 'Analytics', icon: 'analytics', count: 3, activeCount: 1, description: 'Reporting & BI tools' },
];

function CategoryCard({ category }: { category: IntegrationCategory }) {
  const Icon = CATEGORY_ICONS[category.icon] || Webhook;
  const colors = CATEGORY_COLORS[category.icon] || CATEGORY_COLORS.webhook;

  return (
    <Link href={`/employee/admin/integrations?category=${category.id}`}>
      <div className={cn(
        "group p-4 rounded-xl border transition-all duration-200",
        "bg-white hover:shadow-md hover:-translate-y-0.5",
        colors.border
      )}>
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            colors.bg, colors.text
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <ChevronRight className="w-4 h-4 text-charcoal-300 group-hover:text-charcoal-500 group-hover:translate-x-0.5 transition-all" />
        </div>
        <h3 className="font-medium text-charcoal-900 mb-1">{category.name}</h3>
        <p className="text-xs text-charcoal-500 mb-3 line-clamp-1">{category.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-charcoal-400">
            {category.count} available
          </span>
          <span className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-full",
            category.activeCount > 0
              ? "bg-success-100 text-success-700"
              : "bg-charcoal-100 text-charcoal-500"
          )}>
            {category.activeCount} active
          </span>
        </div>
      </div>
    </Link>
  );
}

export function IntegrationCategoryGrid({ definition, data, context }: SectionWidgetProps) {
  const isLoading = context?.isLoading;
  const categories = (data as IntegrationCategory[] | undefined) || DEFAULT_CATEGORIES;

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
              <div key={i} className="h-32 bg-stone-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalActive = categories.reduce((sum, c) => sum + c.activeCount, 0);
  const totalAvailable = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <Card className="border-charcoal-100 shadow-elevation-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-forest rounded-lg flex items-center justify-center shadow-sm">
              <Webhook className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-heading font-bold text-charcoal-900">
                {(typeof definition.title === 'string' ? definition.title : 'Integrations') || 'Integrations'}
              </CardTitle>
              <p className="text-sm text-charcoal-500 mt-0.5">
                {totalActive} active of {totalAvailable} available
              </p>
            </div>
          </div>
          <Link
            href="/employee/admin/integrations"
            className="text-xs font-medium text-forest-600 hover:text-forest-700 flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map(category => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default IntegrationCategoryGrid;
