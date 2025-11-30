/**
 * QuickActionsBar Component
 *
 * Role-aware quick action buttons for workspace pages.
 */

'use client';

import React from 'react';
import { type LucideIcon, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

export interface QuickActionItem {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  disabled?: boolean;
  shortcut?: string;
  primary?: boolean;
}

export interface QuickActionsBarProps {
  actions: QuickActionItem[];
  maxVisible?: number;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function QuickActionsBar({
  actions,
  maxVisible = 3,
  size = 'default',
  className,
}: QuickActionsBarProps) {
  if (actions.length === 0) {
    return null;
  }

  // Separate primary actions and secondary actions
  const primaryActions = actions.filter((a) => a.primary);
  const secondaryActions = actions.filter((a) => !a.primary);

  // Determine visible vs overflow actions
  const visibleActions = primaryActions.length > 0
    ? primaryActions
    : secondaryActions.slice(0, maxVisible);
  const overflowActions = primaryActions.length > 0
    ? secondaryActions
    : secondaryActions.slice(maxVisible);

  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Visible Actions */}
      {visibleActions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            variant={action.variant || 'outline'}
            size={buttonSize}
            onClick={action.onClick}
            disabled={action.disabled}
            className="gap-2"
          >
            <Icon className={iconSize} />
            {action.label}
            {action.shortcut && (
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-2">
                {action.shortcut}
              </kbd>
            )}
          </Button>
        );
      })}

      {/* Overflow Menu */}
      {overflowActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size={buttonSize}>
              <MoreHorizontal className={iconSize} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {overflowActions.map((action, idx) => {
              const Icon = action.icon;
              const isDestructive = action.variant === 'destructive';

              return (
                <React.Fragment key={action.id}>
                  {isDestructive && idx > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={cn(isDestructive && 'text-destructive focus:text-destructive')}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {action.label}
                    {action.shortcut && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {action.shortcut}
                      </span>
                    )}
                  </DropdownMenuItem>
                </React.Fragment>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

export default QuickActionsBar;
