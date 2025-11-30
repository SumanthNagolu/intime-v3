/**
 * SubmissionWorkflowBar Component
 *
 * Displays the current status and available workflow actions
 * for a submission based on its current state.
 */

'use client';

import React from 'react';
import {
  ArrowRight,
  Send,
  CheckCircle,
  XCircle,
  Calendar,
  Award,
  Ban,
  PlayCircle,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

export interface WorkflowAction {
  id: string;
  label: string;
  icon?: LucideIcon;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  disabled?: boolean;
  onClick: () => void;
}

export interface SubmissionWorkflowBarProps {
  status: string;
  primaryAction?: WorkflowAction;
  secondaryActions?: WorkflowAction[];
  onWithdraw?: () => void;
  onReject?: () => void;
  isLoading?: boolean;
  className?: string;
}

// =====================================================
// STATUS CONFIGURATION
// =====================================================

const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; label: string; isTerminal: boolean }
> = {
  sourced: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Sourced', isTerminal: false },
  screening: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Screening', isTerminal: false },
  vendor_pending: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Vendor Pending', isTerminal: false },
  vendor_screening: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Vendor Screening', isTerminal: false },
  vendor_accepted: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Vendor Accepted', isTerminal: false },
  vendor_rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Vendor Rejected', isTerminal: true },
  submitted_to_client: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Client Submitted', isTerminal: false },
  client_review: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Client Review', isTerminal: false },
  client_accepted: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Client Accepted', isTerminal: false },
  client_rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Client Rejected', isTerminal: true },
  client_interview: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Interviewing', isTerminal: false },
  offer_stage: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Offer Stage', isTerminal: false },
  placed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Placed', isTerminal: true },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected', isTerminal: true },
  withdrawn: { bg: 'bg-stone-100', text: 'text-stone-700', label: 'Withdrawn', isTerminal: true },
};

// =====================================================
// HELPERS
// =====================================================

export function getDefaultPrimaryAction(
  status: string,
  callbacks: {
    onStartScreening?: () => void;
    onSubmitToVendor?: () => void;
    onRecordVendorDecision?: () => void;
    onSubmitToClient?: () => void;
    onRecordClientDecision?: () => void;
    onScheduleInterview?: () => void;
    onMoveToOffer?: () => void;
    onMarkPlaced?: () => void;
  }
): WorkflowAction | undefined {
  switch (status) {
    case 'sourced':
      return callbacks.onStartScreening
        ? {
            id: 'start-screening',
            label: 'Start Screening',
            icon: PlayCircle,
            onClick: callbacks.onStartScreening,
          }
        : undefined;
    case 'screening':
      return callbacks.onSubmitToVendor
        ? {
            id: 'submit-vendor',
            label: 'Submit to Vendor',
            icon: Send,
            onClick: callbacks.onSubmitToVendor,
          }
        : undefined;
    case 'vendor_pending':
    case 'vendor_screening':
      return callbacks.onRecordVendorDecision
        ? {
            id: 'vendor-decision',
            label: 'Record Vendor Decision',
            icon: CheckCircle,
            onClick: callbacks.onRecordVendorDecision,
          }
        : undefined;
    case 'vendor_accepted':
      return callbacks.onSubmitToClient
        ? {
            id: 'submit-client',
            label: 'Submit to Client',
            icon: Send,
            onClick: callbacks.onSubmitToClient,
          }
        : undefined;
    case 'submitted_to_client':
    case 'client_review':
      return callbacks.onRecordClientDecision
        ? {
            id: 'client-decision',
            label: 'Record Client Decision',
            icon: CheckCircle,
            onClick: callbacks.onRecordClientDecision,
          }
        : undefined;
    case 'client_accepted':
      return callbacks.onScheduleInterview
        ? {
            id: 'schedule-interview',
            label: 'Schedule Interview',
            icon: Calendar,
            onClick: callbacks.onScheduleInterview,
          }
        : undefined;
    case 'client_interview':
      return callbacks.onMoveToOffer
        ? {
            id: 'move-to-offer',
            label: 'Move to Offer',
            icon: ArrowRight,
            onClick: callbacks.onMoveToOffer,
          }
        : undefined;
    case 'offer_stage':
      return callbacks.onMarkPlaced
        ? {
            id: 'mark-placed',
            label: 'Mark as Placed',
            icon: Award,
            onClick: callbacks.onMarkPlaced,
          }
        : undefined;
    default:
      return undefined;
  }
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function SubmissionWorkflowBar({
  status,
  primaryAction,
  secondaryActions = [],
  onWithdraw,
  onReject,
  isLoading = false,
  className,
}: SubmissionWorkflowBarProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.sourced;
  const isTerminal = config.isTerminal;

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-stone-200 p-4 flex items-center justify-between',
        className
      )}
    >
      {/* Current Status */}
      <div className="flex items-center gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
            Current Status
          </p>
          <Badge
            className={cn(
              'text-sm font-bold uppercase tracking-wider',
              config.bg,
              config.text
            )}
          >
            {config.label}
          </Badge>
        </div>

        {/* Status indicator */}
        {!isTerminal && (
          <div className="hidden sm:flex items-center gap-2 text-stone-400">
            <ArrowRight className="w-4 h-4" />
            <span className="text-xs">Available actions</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {!isTerminal && (
        <div className="flex items-center gap-2">
          {/* Secondary Actions */}
          {secondaryActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled || isLoading}
              >
                {Icon && <Icon className="w-4 h-4 mr-1" />}
                {action.label}
              </Button>
            );
          })}

          {/* Withdraw / Reject */}
          {onWithdraw && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onWithdraw}
              disabled={isLoading}
              className="text-stone-500 hover:text-stone-700"
            >
              <Ban className="w-4 h-4 mr-1" />
              Withdraw
            </Button>
          )}
          {onReject && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReject}
              disabled={isLoading}
              className="text-red-500 hover:text-red-700"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject
            </Button>
          )}

          {/* Primary Action */}
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled || isLoading}
              className="min-w-[140px]"
            >
              {primaryAction.icon && (
                <primaryAction.icon className="w-4 h-4 mr-2" />
              )}
              {primaryAction.label}
            </Button>
          )}
        </div>
      )}

      {/* Terminal State Message */}
      {isTerminal && (
        <p className="text-sm text-stone-500 italic">
          This submission has reached a final state.
        </p>
      )}
    </div>
  );
}

export default SubmissionWorkflowBar;
