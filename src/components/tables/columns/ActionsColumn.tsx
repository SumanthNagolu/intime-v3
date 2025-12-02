'use client';

/**
 * ActionsColumn Component
 *
 * Row actions dropdown menu.
 */

import * as React from 'react';
import { MoreHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { ActionItem } from '../types';

// ==========================================
// PROPS
// ==========================================

interface ActionsColumnProps<TData> {
  /** Row data */
  row: TData;

  /** Actions to display */
  actions: ActionItem[];

  /** Quick actions (shown inline) */
  quickActions?: ActionItem[];

  /** Dropdown label */
  label?: string;

  /** Additional class name */
  className?: string;
}

// ==========================================
// COMPONENT
// ==========================================

export function ActionsColumn<TData>({
  row,
  actions,
  quickActions = [],
  label = 'Actions',
  className,
}: ActionsColumnProps<TData>) {
  const [confirmAction, setConfirmAction] = React.useState<ActionItem | null>(null);
  const [loadingAction, setLoadingAction] = React.useState<string | null>(null);

  const handleAction = async (action: ActionItem) => {
    // Check if action requires confirmation
    if ((action as any).confirm) {
      setConfirmAction(action);
      return;
    }

    // Execute action
    await executeAction(action);
  };

  const executeAction = async (action: ActionItem) => {
    try {
      setLoadingAction(action.id);
      await action.onClick(row);
    } finally {
      setLoadingAction(null);
      setConfirmAction(null);
    }
  };

  // Filter visible actions
  const visibleActions = actions.filter((action) =>
    action.visible ? action.visible(row) : true
  );

  const visibleQuickActions = quickActions.filter((action) =>
    action.visible ? action.visible(row) : true
  );

  if (visibleActions.length === 0 && visibleQuickActions.length === 0) {
    return null;
  }

  return (
    <div
      className={cn('flex items-center justify-end gap-1', className)}
      onClick={(e) => e.stopPropagation()} // Prevent row click
    >
      {/* Quick Actions */}
      {visibleQuickActions.map((action) => {
        const isLoading = loadingAction === action.id;
        const isDisabled = action.disabled?.(row) || isLoading;

        return (
          <Button
            key={action.id}
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => handleAction(action)}
            disabled={isDisabled}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : action.icon ? (
              <action.icon className="h-4 w-4" />
            ) : null}
            <span className="sr-only">{action.label}</span>
          </Button>
        );
      })}

      {/* Dropdown Actions */}
      {visibleActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">{label}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {visibleActions.map((action, index) => {
              const isLoading = loadingAction === action.id;
              const isDisabled = action.disabled?.(row) || isLoading;

              return (
                <React.Fragment key={action.id}>
                  {action.separator && index > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={() => handleAction(action)}
                    disabled={isDisabled}
                    className={cn(
                      action.variant === 'destructive' && 'text-destructive focus:text-destructive'
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : action.icon ? (
                      <action.icon className="mr-2 h-4 w-4" />
                    ) : null}
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

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(open: boolean) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {(confirmAction as any)?.confirm?.title ?? 'Confirm Action'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {(confirmAction as any)?.confirm?.message ?? 'Are you sure you want to proceed?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {(confirmAction as any)?.confirm?.cancelLabel ?? 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction && executeAction(confirmAction)}
              className={cn(
                (confirmAction as any)?.confirm?.destructive &&
                  'bg-destructive text-destructive-foreground hover:bg-destructive/90'
              )}
            >
              {loadingAction === confirmAction?.id && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {(confirmAction as any)?.confirm?.confirmLabel ?? 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ActionsColumn;
