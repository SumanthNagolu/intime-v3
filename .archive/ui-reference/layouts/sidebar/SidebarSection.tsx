'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavSection } from '@/lib/navigation';
import { SidebarNavItem } from './SidebarNavItem';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SidebarSectionProps {
  section: NavSection;
  isCollapsed: boolean;
  activePath: string;
}

/**
 * Navigation section component
 * Displays section label and items
 * Supports collapsible sections
 */
export function SidebarSection({
  section,
  isCollapsed,
  activePath,
}: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(section.defaultOpen !== false);

  // In collapsed mode, just show the items without section labels
  if (isCollapsed) {
    return (
      <div className="space-y-1">
        {section.items.map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item}
            isCollapsed={isCollapsed}
            isActive={activePath === item.href || activePath.startsWith(item.href + '/')}
          />
        ))}
      </div>
    );
  }

  // If section is not collapsible, render directly
  if (!section.collapsible) {
    return (
      <div className="space-y-1">
        <div className="px-3 py-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {section.label}
          </span>
        </div>
        {section.items.map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item}
            isCollapsed={isCollapsed}
            isActive={activePath === item.href || activePath.startsWith(item.href + '/')}
          />
        ))}
      </div>
    );
  }

  // Collapsible section
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full px-3 py-2 flex items-center justify-between hover:bg-muted rounded-lg transition-colors">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {section.label}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            'text-muted-foreground transition-transform duration-200',
            !isOpen && '-rotate-90'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 mt-1">
        {section.items.map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item}
            isCollapsed={isCollapsed}
            isActive={activePath === item.href || activePath.startsWith(item.href + '/')}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
