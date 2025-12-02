'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { layoutTokens, type NavSection, type PinnedItem, type RecentItem } from '@/lib/navigation';
import { SidebarHeader } from './SidebarHeader';
import { SidebarSection } from './SidebarSection';
import { SidebarPinnedItems } from './SidebarPinnedItems';
import { SidebarRecentItems } from './SidebarRecentItems';
import { SidebarCollapseButton } from './SidebarCollapseButton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  sections: NavSection[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activePath: string;
  pinnedItems?: PinnedItem[];
  recentItems?: RecentItem[];
  onUnpin?: (id: string) => void;
  className?: string;
}

/**
 * Main sidebar navigation component
 * Based on 01-LAYOUT-SHELL.md sidebar specification
 * Width: 224px (expanded) / 64px (collapsed)
 */
export function Sidebar({
  sections,
  isCollapsed,
  onToggleCollapse,
  activePath,
  pinnedItems = [],
  recentItems = [],
  onUnpin,
  className,
}: SidebarProps) {
  const width = isCollapsed
    ? layoutTokens.sidebar.widthCollapsed
    : layoutTokens.sidebar.widthExpanded;

  return (
    <aside
      className={cn(
        'fixed left-0 bg-stone-50/50 border-r border-border',
        'flex flex-col transition-all duration-200 ease-in-out',
        'h-[calc(100vh-56px)] top-14',
        className
      )}
      style={{ width }}
    >
      {/* Sidebar Header */}
      {!isCollapsed && <SidebarHeader />}

      {/* Scrollable Navigation */}
      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-4">
          {/* Navigation Sections */}
          {sections.map((section) => (
            <SidebarSection
              key={section.id}
              section={section}
              isCollapsed={isCollapsed}
              activePath={activePath}
            />
          ))}

          {/* Pinned Items */}
          {!isCollapsed && pinnedItems.length > 0 && (
            <SidebarPinnedItems
              items={pinnedItems}
              onUnpin={onUnpin}
            />
          )}

          {/* Recent Items */}
          {!isCollapsed && recentItems.length > 0 && (
            <SidebarRecentItems items={recentItems} />
          )}
        </div>
      </ScrollArea>

      {/* Collapse Button */}
      <SidebarCollapseButton
        isCollapsed={isCollapsed}
        onToggle={onToggleCollapse}
      />
    </aside>
  );
}
