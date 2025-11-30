/**
 * GenericEntityWorkspace Component
 *
 * A composable workspace that renders entity-specific content
 * based on configuration. This is the main entry point for
 * the unified workspace system.
 */

'use client';

import React, { useState, ReactNode } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Loader2,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type EntityType, getEntityConfig } from '@/lib/workspace/entity-registry';

// =====================================================
// TYPES
// =====================================================

export interface WorkspaceTab {
  id: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
  content: ReactNode;
}

export interface WorkspaceAction {
  id: string;
  label: string;
  icon?: LucideIcon;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  onClick: () => void;
}

export interface GenericEntityWorkspaceProps {
  // Entity info
  entityType: EntityType;
  entityId: string;
  entityName: string;

  // Loading/Error states
  isLoading?: boolean;
  error?: Error | null;

  // Layout
  backLink?: { href: string; label: string };
  sidebar?: ReactNode;
  header?: ReactNode;
  workflowBar?: ReactNode;

  // Tabs
  tabs: WorkspaceTab[];
  defaultTab?: string;

  // Actions
  actions?: WorkspaceAction[];

  className?: string;
}

// =====================================================
// TAB BAR
// =====================================================

function TabBar({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: WorkspaceTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}) {
  return (
    <div className="flex border-b border-stone-100">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex-1 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all',
              isActive
                ? 'bg-white text-charcoal border-b-2 border-rust'
                : 'bg-stone-50 text-stone-400 hover:bg-stone-100'
            )}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px] font-bold">
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// =====================================================
// QUICK ACTIONS
// =====================================================

function QuickActions({ actions }: { actions: WorkspaceAction[] }) {
  if (actions.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            variant={action.variant || 'default'}
            size="sm"
            onClick={action.onClick}
          >
            {Icon && <Icon className="w-4 h-4 mr-2" />}
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function GenericEntityWorkspace({
  entityType,
  entityId,
  entityName,
  isLoading = false,
  error = null,
  backLink,
  sidebar,
  header,
  workflowBar,
  tabs,
  defaultTab,
  actions = [],
  className,
}: GenericEntityWorkspaceProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');
  const entityConfig = getEntityConfig(entityType);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 className="animate-spin text-rust mx-auto mb-4 w-12 h-12" />
          <p className="text-stone-500 text-sm">
            Loading {entityConfig.name.toLowerCase()}...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <p className="text-red-500 font-medium">
          {entityConfig.name} not found
        </p>
        <p className="text-stone-400 text-sm mt-2">
          {error.message || `ID: ${entityId}`}
        </p>
        {backLink && (
          <Link
            href={backLink.href}
            className="inline-flex items-center gap-2 mt-4 text-rust hover:underline"
          >
            <ChevronLeft className="w-4 h-4" />
            {backLink.label}
          </Link>
        )}
      </div>
    );
  }

  const activeTabContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div className={cn('animate-fade-in pb-12', className)}>
      {/* Back Link & Actions */}
      <div className="flex items-center justify-between mb-6">
        {backLink && (
          <Link
            href={backLink.href}
            className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest"
          >
            <ChevronLeft className="w-4 h-4" />
            {backLink.label}
          </Link>
        )}
        <QuickActions actions={actions} />
      </div>

      {/* Custom Header */}
      {header}

      {/* Workflow Bar (for submissions) */}
      {workflowBar && <div className="mb-6">{workflowBar}</div>}

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        {sidebar && (
          <div className="col-span-12 lg:col-span-3 space-y-4">{sidebar}</div>
        )}

        {/* Main Content Area */}
        <div className={cn('space-y-6', sidebar ? 'col-span-12 lg:col-span-9' : 'col-span-12')}>
          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <TabBar
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            <div className="p-6">{activeTabContent}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenericEntityWorkspace;
