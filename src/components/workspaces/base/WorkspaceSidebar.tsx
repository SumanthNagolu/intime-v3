/**
 * WorkspaceSidebar Component
 *
 * Reusable sidebar for workspace pages showing:
 * - Quick Stats
 * - Related Objects
 * - Quick Actions
 * - Access Info
 */

'use client';

import React, { ReactNode } from 'react';
import { ChevronRight, ExternalLink, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

export interface StatItem {
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: ReactNode;
}

export interface RelatedObject {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  status?: string;
  statusColor?: string;
  href: string;
  icon?: ReactNode;
}

export interface QuickAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  disabled?: boolean;
}

export interface AccessInfo {
  canView: string[];
  canEdit: string[];
}

export interface WorkspaceSidebarProps {
  // Stats Section
  stats?: StatItem[];
  statsTitle?: string;

  // Related Objects Section
  relatedObjects?: RelatedObject[];
  relatedObjectsTitle?: string;
  onViewAllRelated?: () => void;

  // Quick Actions Section
  quickActions?: QuickAction[];
  quickActionsTitle?: string;

  // Access Info Section
  accessInfo?: AccessInfo;

  // Custom Sections
  customSections?: {
    title: string;
    content: ReactNode;
  }[];

  className?: string;
}

// =====================================================
// SUB-COMPONENTS
// =====================================================

function StatsSection({ stats, title = 'Quick Stats' }: { stats: StatItem[]; title?: string }) {
  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="pb-2 px-0">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {stat.icon}
                {stat.label}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{stat.value}</span>
                {stat.change && (
                  <span
                    className={cn(
                      'text-xs',
                      stat.change.type === 'increase' && 'text-green-600',
                      stat.change.type === 'decrease' && 'text-red-600',
                      stat.change.type === 'neutral' && 'text-muted-foreground'
                    )}
                  >
                    {stat.change.type === 'increase' ? '+' : stat.change.type === 'decrease' ? '-' : ''}
                    {stat.change.value}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RelatedObjectsSection({
  objects,
  title = 'Related',
  onViewAll,
}: {
  objects: RelatedObject[];
  title?: string;
  onViewAll?: () => void;
}) {
  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="pb-2 px-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {title}
          </CardTitle>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll} className="h-6 text-xs">
              View All
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-2">
          {objects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No related items</p>
          ) : (
            objects.slice(0, 5).map((obj) => (
              <Link
                key={obj.id}
                href={obj.href}
                className="flex items-center justify-between p-2 rounded-md hover:bg-stone-100 transition-colors group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {obj.icon && <span className="text-muted-foreground">{obj.icon}</span>}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-rust transition-colors">
                      {obj.title}
                    </p>
                    {obj.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">{obj.subtitle}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {obj.status && (
                    <Badge
                      variant="secondary"
                      className={cn('text-[10px] px-1.5', obj.statusColor)}
                    >
                      {obj.status}
                    </Badge>
                  )}
                  <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionsSection({
  actions,
  title = 'Quick Actions',
}: {
  actions: QuickAction[];
  title?: string;
}) {
  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="pb-2 px-0">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-1">
          {actions.map((action, idx) => (
            <Button
              key={idx}
              variant={action.variant || 'ghost'}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
              className="w-full justify-start text-sm"
            >
              {action.icon || <Plus className="w-4 h-4 mr-2" />}
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AccessInfoSection({ accessInfo }: { accessInfo: AccessInfo }) {
  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="pb-2 px-0">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Access
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 space-y-3">
        {accessInfo.canEdit.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Can Edit</p>
            <div className="flex flex-wrap gap-1">
              {accessInfo.canEdit.map((name, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {name}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {accessInfo.canView.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Can View</p>
            <div className="flex flex-wrap gap-1">
              {accessInfo.canView.map((name, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function WorkspaceSidebar({
  stats,
  statsTitle,
  relatedObjects,
  relatedObjectsTitle,
  onViewAllRelated,
  quickActions,
  quickActionsTitle,
  accessInfo,
  customSections,
  className,
}: WorkspaceSidebarProps) {
  const sections: ReactNode[] = [];

  // Stats
  if (stats && stats.length > 0) {
    sections.push(
      <StatsSection key="stats" stats={stats} title={statsTitle} />
    );
  }

  // Related Objects
  if (relatedObjects) {
    sections.push(
      <RelatedObjectsSection
        key="related"
        objects={relatedObjects}
        title={relatedObjectsTitle}
        onViewAll={onViewAllRelated}
      />
    );
  }

  // Quick Actions
  if (quickActions && quickActions.length > 0) {
    sections.push(
      <QuickActionsSection key="actions" actions={quickActions} title={quickActionsTitle} />
    );
  }

  // Access Info
  if (accessInfo) {
    sections.push(
      <AccessInfoSection key="access" accessInfo={accessInfo} />
    );
  }

  // Custom Sections
  if (customSections) {
    customSections.forEach((section, idx) => {
      sections.push(
        <Card key={`custom-${idx}`} className="border-0 shadow-none bg-transparent">
          <CardHeader className="pb-2 px-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {section.content}
          </CardContent>
        </Card>
      );
    });
  }

  return (
    <div className={cn('p-4 space-y-6', className)}>
      {sections.map((section, idx) => (
        <React.Fragment key={idx}>
          {section}
          {idx < sections.length - 1 && <Separator />}
        </React.Fragment>
      ))}
    </div>
  );
}

export default WorkspaceSidebar;
