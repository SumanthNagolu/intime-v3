/**
 * WorkspaceLayout Component
 *
 * Standard layout structure for all workspace pages
 * Provides consistent header, RCAI bar, tabs, content area, sidebar, and activity panel
 */

'use client';

import React, { useState, ReactNode } from 'react';
import { ArrowLeft, MoreHorizontal, Star, StarOff, Share2, Archive, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { RCAIBar } from './RCAIBar';
import type { RCAIEntityTypeType } from '@/lib/db/schema/raci';

// =====================================================
// TYPES
// =====================================================

export interface WorkspaceTab {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  badge?: string | number;
}

export interface WorkspaceAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
}

export interface WorkspaceLayoutProps {
  // Header
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  status?: {
    label: string;
    color?: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  primaryAction?: WorkspaceAction;
  secondaryActions?: WorkspaceAction[];

  // Entity for RCAI
  entityType: RCAIEntityTypeType | 'talent';
  entityId: string;

  // Permissions
  canEdit?: boolean;
  canDelete?: boolean;

  // Tabs
  tabs: WorkspaceTab[];
  defaultTab?: string;

  // Sidebar (optional)
  sidebar?: ReactNode;
  sidebarWidth?: 'sm' | 'md' | 'lg';

  // Activity Panel
  showActivityPanel?: boolean;
  activityPanel?: ReactNode;

  // Callbacks
  onFavorite?: () => void;
  isFavorited?: boolean;
  onShare?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;

  // Additional
  className?: string;
  children?: ReactNode;
}

// =====================================================
// STATUS COLORS
// =====================================================

const STATUS_COLORS: Record<string, string> = {
  // Generic
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-stone-100 text-stone-500',
  pending: 'bg-amber-100 text-amber-700',
  completed: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-red-100 text-red-700',

  // Lead status
  new: 'bg-blue-100 text-blue-700',
  warm: 'bg-amber-100 text-amber-700',
  hot: 'bg-orange-100 text-orange-700',
  cold: 'bg-stone-100 text-stone-500',
  converted: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',

  // Deal stages
  discovery: 'bg-blue-100 text-blue-700',
  qualification: 'bg-cyan-100 text-cyan-700',
  proposal: 'bg-amber-100 text-amber-700',
  negotiation: 'bg-orange-100 text-orange-700',
  closed_won: 'bg-green-100 text-green-700',
  closed_lost: 'bg-red-100 text-red-700',

  // Job status
  draft: 'bg-stone-100 text-stone-500',
  open: 'bg-green-100 text-green-700',
  urgent: 'bg-red-100 text-red-700',
  on_hold: 'bg-blue-100 text-blue-600',
  filled: 'bg-purple-100 text-purple-700',

  // Job order priority
  low: 'bg-stone-100 text-stone-600',
  normal: 'bg-blue-100 text-blue-600',
  high: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',

  // Submission status
  sourced: 'bg-blue-100 text-blue-700',
  screening: 'bg-cyan-100 text-cyan-700',
  submitted_to_client: 'bg-amber-100 text-amber-700',
  client_review: 'bg-orange-100 text-orange-700',
  client_interview: 'bg-purple-100 text-purple-700',
  offer_stage: 'bg-pink-100 text-pink-700',
  placed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export function WorkspaceLayout({
  title,
  subtitle,
  backHref,
  backLabel = 'Back',
  status,
  primaryAction,
  secondaryActions = [],
  entityType,
  entityId,
  canEdit = false,
  canDelete = false,
  tabs,
  defaultTab,
  sidebar,
  sidebarWidth = 'md',
  showActivityPanel = true,
  activityPanel,
  onFavorite,
  isFavorited = false,
  onShare,
  onArchive,
  onDelete,
  className,
  children,
}: WorkspaceLayoutProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || 'overview');

  const sidebarWidthClasses = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96',
  };

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* ===== HEADER ===== */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
        <div className="flex items-center gap-4">
          {backHref && (
            <Link href={backHref}>
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="w-4 h-4" />
                {backLabel}
              </Button>
            </Link>
          )}

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-charcoal">{title}</h1>
              {status && (
                <Badge
                  variant={status.variant || 'secondary'}
                  className={cn(
                    status.color || STATUS_COLORS[status.label.toLowerCase().replace(/ /g, '_')] || 'bg-stone-100 text-stone-600'
                  )}
                >
                  {status.label}
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Favorite */}
          {onFavorite && (
            <Button variant="ghost" size="icon" onClick={onFavorite}>
              {isFavorited ? (
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              ) : (
                <StarOff className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          )}

          {/* Share */}
          {onShare && (
            <Button variant="ghost" size="icon" onClick={onShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          )}

          {/* Secondary Actions */}
          {secondaryActions.length > 0 && secondaryActions.map((action, idx) => (
            <Button
              key={idx}
              variant={action.variant || 'outline'}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}

          {/* Primary Action */}
          {primaryAction && (
            <Button
              variant={primaryAction.variant || 'default'}
              size="sm"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
              className="bg-rust hover:bg-rust/90"
            >
              {primaryAction.icon}
              {primaryAction.label}
            </Button>
          )}

          {/* More Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onArchive && (
                <DropdownMenuItem onClick={onArchive}>
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              )}
              {canDelete && onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ===== RCAI BAR ===== */}
      <RCAIBar entityType={entityType} entityId={entityId} canEdit={canEdit} />

      {/* ===== TABS & CONTENT ===== */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            {/* Tab Navigation */}
            <div className="border-b border-border px-6">
              <TabsList className="bg-transparent h-12 gap-4">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      'relative px-0 h-12 bg-transparent',
                      'data-[state=active]:bg-transparent data-[state=active]:shadow-none',
                      'data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-rust'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {tab.icon}
                      <span>{tab.label}</span>
                      {tab.badge !== undefined && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                          {tab.badge}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto">
              {tabs.map((tab) => (
                <TabsContent
                  key={tab.id}
                  value={tab.id}
                  className="h-full m-0 p-6 focus-visible:outline-none focus-visible:ring-0"
                >
                  {tab.content}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>

        {/* ===== SIDEBAR ===== */}
        {sidebar && (
          <aside
            className={cn(
              'border-l border-border bg-stone-50/50 overflow-auto',
              sidebarWidthClasses[sidebarWidth]
            )}
          >
            {sidebar}
          </aside>
        )}
      </div>

      {/* ===== ACTIVITY PANEL ===== */}
      {showActivityPanel && activityPanel && (
        <div className="border-t border-border bg-background">
          {activityPanel}
        </div>
      )}

      {/* Additional children */}
      {children}
    </div>
  );
}

export default WorkspaceLayout;
