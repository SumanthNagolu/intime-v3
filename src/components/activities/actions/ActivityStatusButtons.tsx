/**
 * Activity Status Buttons
 *
 * Renders action buttons based on current activity status.
 * Handles status transitions with appropriate modals.
 */

'use client';

import React, { useState } from 'react';
import {
  PlayCircle, CheckCircle, Clock, XCircle, UserPlus, MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  getAvailableTransitions,
  getTransitionActions,
  type ActivityStatus,
  type TransitionAction,
} from '@/lib/activities/transitions';
import { CompleteActivityModal } from './CompleteActivityModal';
import { DeferActivityModal } from './DeferActivityModal';
import { CancelActivityModal } from './CancelActivityModal';
import { ReassignActivityModal } from './ReassignActivityModal';

const ACTION_ICONS: Record<string, typeof PlayCircle> = {
  pending: Clock,
  in_progress: PlayCircle,
  completed: CheckCircle,
  deferred: Clock,
  cancelled: XCircle,
};

export interface ActivityStatusButtonsProps {
  /** Activity ID */
  activityId: string;

  /** Current status */
  status: ActivityStatus;

  /** Pattern ID for outcome selection */
  patternId?: string;

  /** Activity subject for confirmation dialogs */
  subject?: string;

  /** Current assignee name */
  assigneeName?: string;

  /** Compact mode - show only primary action */
  compact?: boolean;

  /** Size */
  size?: 'sm' | 'md' | 'lg';

  /** Callback when status changes */
  onStatusChange?: (newStatus: ActivityStatus, data?: Record<string, unknown>) => void;

  /** Callback when reassigned */
  onReassign?: (newAssigneeId: string) => void;

  /** Show reassign button */
  showReassign?: boolean;

  /** Is loading */
  isLoading?: boolean;

  /** Additional className */
  className?: string;
}

export function ActivityStatusButtons({
  activityId,
  status,
  patternId,
  subject,
  assigneeName,
  compact = false,
  size = 'md',
  onStatusChange,
  onReassign,
  showReassign = true,
  isLoading = false,
  className,
}: ActivityStatusButtonsProps) {
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDeferModal, setShowDeferModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);

  const transitions = getTransitionActions(status);

  const handleActionClick = (action: TransitionAction) => {
    if (action.requiresModal) {
      if (action.status === 'completed') {
        setShowCompleteModal(true);
      } else if (action.status === 'deferred') {
        setShowDeferModal(true);
      } else if (action.status === 'cancelled') {
        setShowCancelModal(true);
      }
    } else {
      onStatusChange?.(action.status);
    }
  };

  const getButtonVariant = (action: TransitionAction): 'default' | 'outline' | 'destructive' | 'ghost' => {
    if (action.status === 'completed') return 'default';
    if (action.status === 'cancelled') return 'destructive';
    return 'outline';
  };

  const getButtonIcon = (action: TransitionAction) => {
    const Icon = ACTION_ICONS[action.status] || CheckCircle;
    return <Icon className={cn(
      size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4',
      size !== 'sm' && 'mr-1.5'
    )} />;
  };

  const sizeClasses = {
    sm: 'h-7 text-xs px-2',
    md: 'h-8 text-sm px-3',
    lg: 'h-9 px-4',
  };

  // Primary action is the first transition (usually Start or Complete)
  const primaryAction = transitions[0];
  const secondaryActions = transitions.slice(1);

  if (transitions.length === 0) {
    return null;
  }

  return (
    <>
      <div className={cn('flex items-center gap-2', className)}>
        {/* Primary action button */}
        {primaryAction && (
          <Button
            variant={getButtonVariant(primaryAction)}
            size="sm"
            className={cn(sizeClasses[size])}
            onClick={() => handleActionClick(primaryAction)}
            disabled={isLoading}
          >
            {getButtonIcon(primaryAction)}
            {size !== 'sm' && primaryAction.label}
          </Button>
        )}

        {/* Secondary actions */}
        {!compact && secondaryActions.length > 0 && (
          <>
            {secondaryActions.length === 1 ? (
              <Button
                variant={getButtonVariant(secondaryActions[0])}
                size="sm"
                className={cn(sizeClasses[size])}
                onClick={() => handleActionClick(secondaryActions[0])}
                disabled={isLoading}
              >
                {getButtonIcon(secondaryActions[0])}
                {size !== 'sm' && secondaryActions[0].label}
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className={cn(sizeClasses[size])}>
                    <MoreHorizontal className={cn(
                      size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
                    )} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {secondaryActions.map((action) => (
                    <DropdownMenuItem
                      key={action.status}
                      onClick={() => handleActionClick(action)}
                      className={cn(
                        action.status === 'cancelled' && 'text-red-600'
                      )}
                    >
                      {getButtonIcon(action)}
                      <span className="ml-2">{action.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        )}

        {/* Reassign button */}
        {showReassign && !compact && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(sizeClasses[size])}
            onClick={() => setShowReassignModal(true)}
            disabled={isLoading}
          >
            <UserPlus className={cn(
              size === 'sm' ? 'h-3 w-3' : 'h-4 w-4',
              size !== 'sm' && 'mr-1.5'
            )} />
            {size !== 'sm' && 'Reassign'}
          </Button>
        )}
      </div>

      {/* Modals */}
      <CompleteActivityModal
        open={showCompleteModal}
        onOpenChange={setShowCompleteModal}
        activityId={activityId}
        patternId={patternId}
        subject={subject}
        onComplete={(outcome, notes) => {
          onStatusChange?.('completed', { outcome, notes });
          setShowCompleteModal(false);
        }}
      />

      <DeferActivityModal
        open={showDeferModal}
        onOpenChange={setShowDeferModal}
        activityId={activityId}
        subject={subject}
        onDefer={(deferredUntil, reason) => {
          onStatusChange?.('deferred', { deferredUntil, reason });
          setShowDeferModal(false);
        }}
      />

      <CancelActivityModal
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        activityId={activityId}
        subject={subject}
        onCancel={(reason) => {
          onStatusChange?.('cancelled', { reason });
          setShowCancelModal(false);
        }}
      />

      <ReassignActivityModal
        open={showReassignModal}
        onOpenChange={setShowReassignModal}
        activityId={activityId}
        subject={subject}
        currentAssignee={assigneeName}
        onReassign={(newAssigneeId) => {
          onReassign?.(newAssigneeId);
          setShowReassignModal(false);
        }}
      />
    </>
  );
}

export default ActivityStatusButtons;
