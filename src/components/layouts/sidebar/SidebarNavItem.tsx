'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/lib/navigation';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarNavItemProps {
  item: NavItem;
  isCollapsed: boolean;
  isActive: boolean;
  badgeValue?: number | string;
}

/**
 * Individual navigation item component
 * Based on 01-LAYOUT-SHELL.md navigation item specification
 * Height: 40px, with icon, label, and optional badge
 */
export function SidebarNavItem({
  item,
  isCollapsed,
  isActive,
  badgeValue,
}: SidebarNavItemProps) {
  const Icon = item.icon;

  const content = (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 h-10 px-3 rounded-lg',
        'text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-rust/10 text-rust'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        isCollapsed && 'justify-center'
      )}
    >
      <Icon
        size={16}
        className={cn(
          'shrink-0',
          isActive ? 'text-rust' : 'text-muted-foreground'
        )}
      />
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {(badgeValue !== undefined || item.badge) && (
            <Badge
              variant="secondary"
              className="h-5 px-1.5 text-xs font-normal"
            >
              {badgeValue ?? '0'}
            </Badge>
          )}
        </>
      )}
    </Link>
  );

  // Show tooltip when collapsed
  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          <span>{item.label}</span>
          {(badgeValue !== undefined || item.badge) && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {badgeValue ?? '0'}
            </Badge>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
