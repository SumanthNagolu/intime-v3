/**
 * OverviewTab Component
 *
 * Configurable overview tab for workspace pages.
 * Renders info cards and metrics based on configuration.
 */

'use client';

import React, { ReactNode } from 'react';
import { Edit2, TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

export interface OverviewSection {
  id: string;
  title: string;
  icon?: LucideIcon;
  content: ReactNode;
  editable?: boolean;
  className?: string;
  span?: 1 | 2; // Grid column span
}

export interface StatItem {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
}

export interface OverviewTabProps {
  sections?: OverviewSection[];
  stats?: StatItem[];
  canEdit?: boolean;
  onEdit?: (sectionId: string) => void;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({ stat }: { stat: StatItem }) {
  const Icon = stat.icon;
  const TrendIcon =
    stat.trend === 'up' ? TrendingUp : stat.trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    stat.trend === 'up'
      ? 'text-green-600'
      : stat.trend === 'down'
        ? 'text-red-600'
        : 'text-stone-400';

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">
            {stat.label}
          </p>
          <p className={cn('text-2xl font-bold mt-1', stat.color || 'text-charcoal')}>
            {stat.value}
          </p>
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-stone-600" />
          </div>
        )}
      </div>
      {stat.trend && stat.trendValue && (
        <div className={cn('flex items-center gap-1 mt-2 text-xs', trendColor)}>
          <TrendIcon className="w-3 h-3" />
          <span>{stat.trendValue}</span>
        </div>
      )}
    </div>
  );
}

// =====================================================
// INFO CARD
// =====================================================

function InfoCard({
  section,
  canEdit,
  onEdit,
}: {
  section: OverviewSection;
  canEdit?: boolean;
  onEdit?: () => void;
}) {
  const Icon = section.icon;

  return (
    <Card className={cn('', section.span === 2 && 'col-span-2', section.className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-stone-500" />}
            {section.title}
          </CardTitle>
          {section.editable && canEdit && onEdit && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>{section.content}</CardContent>
    </Card>
  );
}

// =====================================================
// FIELD ROW (Helper for displaying key-value pairs)
// =====================================================

export function FieldRow({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between py-2 border-b border-stone-100 last:border-0', className)}>
      <span className="text-sm text-stone-500">{label}</span>
      <span className="text-sm font-medium text-charcoal text-right">{value || '—'}</span>
    </div>
  );
}

// =====================================================
// FIELD GRID (Helper for displaying multiple fields)
// =====================================================

export function FieldGrid({
  fields,
  columns = 2,
  className,
}: {
  fields: { label: string; value: ReactNode }[];
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {fields.map((field, idx) => (
        <div key={idx}>
          <p className="text-xs text-stone-500 mb-1">{field.label}</p>
          <p className="text-sm font-medium text-charcoal">{field.value || '—'}</p>
        </div>
      ))}
    </div>
  );
}

// =====================================================
// TAGS LIST (Helper for displaying tags/skills)
// =====================================================

export function TagsList({
  tags,
  variant = 'default',
  className,
}: {
  tags: string[];
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
}) {
  if (tags.length === 0) return <span className="text-sm text-stone-400">None</span>;

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {tags.map((tag, idx) => (
        <Badge key={idx} variant={variant} className="text-xs">
          {tag}
        </Badge>
      ))}
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function OverviewTab({
  sections = [],
  stats = [],
  canEdit = false,
  onEdit,
  header,
  footer,
  className,
}: OverviewTabProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Custom Header */}
      {header}

      {/* Stats Grid */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <StatCard key={idx} stat={stat} />
          ))}
        </div>
      )}

      {/* Sections Grid */}
      {sections.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sections.map((section) => (
            <InfoCard
              key={section.id}
              section={section}
              canEdit={canEdit}
              onEdit={() => onEdit?.(section.id)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {sections.length === 0 && stats.length === 0 && !header && !footer && (
        <div className="text-center py-16 text-stone-400">
          <p>No overview content configured</p>
        </div>
      )}

      {/* Custom Footer */}
      {footer}
    </div>
  );
}

export default OverviewTab;
