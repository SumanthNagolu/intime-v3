'use client'

import { memo } from 'react'
import {
  Calendar,
  ChevronRight,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  FileText,
  UserPlus,
  Send,
  Edit,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// Types
// ============================================

export interface QuickAction {
  id: string
  label: string
  description?: string
  icon: typeof Mail
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  disabled?: boolean
  badge?: string | number
}

interface QuickActionsProps {
  actions: QuickAction[]
  onAction: (actionId: string) => void
  entityType?: string
  entityId?: string
  className?: string
}

// ============================================
// Constants
// ============================================

const variantClasses: Record<string, string> = {
  default: 'bg-charcoal-50 text-charcoal-700 hover:bg-charcoal-100',
  primary: 'bg-charcoal-900 text-white hover:bg-charcoal-800',
  success: 'bg-success-50 text-success-700 hover:bg-success-100',
  warning: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
  danger: 'bg-error-50 text-error-700 hover:bg-error-100',
}

// ============================================
// Default Actions by Entity Type
// ============================================

export function getDefaultActionsForEntity(entityType: string): QuickAction[] {
  const commonActions: QuickAction[] = [
    {
      id: 'email',
      label: 'Send Email',
      description: 'Compose and send an email',
      icon: Mail,
      variant: 'default',
    },
    {
      id: 'call',
      label: 'Log Call',
      description: 'Log a phone call',
      icon: Phone,
      variant: 'default',
    },
    {
      id: 'note',
      label: 'Add Note',
      description: 'Add a quick note',
      icon: MessageSquare,
      variant: 'default',
    },
    {
      id: 'schedule',
      label: 'Schedule Meeting',
      description: 'Schedule a meeting',
      icon: Calendar,
      variant: 'default',
    },
  ]

  const entitySpecificActions: Record<string, QuickAction[]> = {
    candidate: [
      {
        id: 'submit',
        label: 'Submit to Job',
        description: 'Submit candidate to a job',
        icon: Send,
        variant: 'primary',
      },
      ...commonActions,
      {
        id: 'edit',
        label: 'Edit Profile',
        icon: Edit,
        variant: 'default',
      },
    ],
    job: [
      {
        id: 'add_candidate',
        label: 'Add Candidate',
        description: 'Submit a candidate',
        icon: UserPlus,
        variant: 'primary',
      },
      ...commonActions,
    ],
    account: [
      {
        id: 'add_job',
        label: 'Create Job',
        description: 'Create a new job order',
        icon: Plus,
        variant: 'primary',
      },
      ...commonActions,
      {
        id: 'add_contact',
        label: 'Add Contact',
        icon: UserPlus,
        variant: 'default',
      },
    ],
    contact: [
      ...commonActions,
      {
        id: 'add_document',
        label: 'Upload Document',
        icon: FileText,
        variant: 'default',
      },
    ],
    lead: [
      {
        id: 'convert',
        label: 'Convert to Deal',
        description: 'Convert this lead to a deal',
        icon: ChevronRight,
        variant: 'primary',
      },
      ...commonActions,
    ],
    deal: [
      ...commonActions,
      {
        id: 'add_document',
        label: 'Add Document',
        icon: FileText,
        variant: 'default',
      },
    ],
  }

  return entitySpecificActions[entityType] ?? commonActions
}

// ============================================
// Components
// ============================================

const ActionButton = memo(function ActionButton({
  action,
  onClick,
  isCompact = false,
}: {
  action: QuickAction
  onClick: () => void
  isCompact?: boolean
}) {
  const Icon = action.icon

  if (isCompact) {
    return (
      <button
        onClick={onClick}
        disabled={action.disabled}
        className={cn(
          'relative w-10 h-10 rounded-lg flex items-center justify-center transition-all',
          variantClasses[action.variant ?? 'default'],
          action.disabled && 'opacity-50 cursor-not-allowed'
        )}
        title={action.label}
      >
        <Icon className="w-4 h-4" />
        {action.badge && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-error-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
            {action.badge}
          </span>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      disabled={action.disabled}
      className={cn(
        'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all group',
        variantClasses[action.variant ?? 'default'],
        action.disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0',
          action.variant === 'primary'
            ? 'bg-white/10'
            : 'bg-white'
        )}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{action.label}</span>
          {action.badge && (
            <span className="px-1.5 py-0.5 bg-error-500 text-white text-[10px] font-medium rounded-full">
              {action.badge}
            </span>
          )}
        </div>
        {action.description && (
          <span className="text-xs opacity-70 truncate block">
            {action.description}
          </span>
        )}
      </div>
      <ChevronRight
        className={cn(
          'w-4 h-4 opacity-0 group-hover:opacity-70 transition-opacity flex-shrink-0',
          action.variant === 'primary' ? 'text-white' : 'text-charcoal-400'
        )}
      />
    </button>
  )
})

// ============================================
// Main Component
// ============================================

export const QuickActions = memo(function QuickActions({
  actions,
  onAction,
  entityType,
  entityId,
  className,
}: QuickActionsProps) {
  // Use default actions if none provided
  const displayActions = actions.length > 0
    ? actions
    : entityType
      ? getDefaultActionsForEntity(entityType)
      : []

  if (displayActions.length === 0) {
    return null
  }

  // Separate primary action from others
  const primaryAction = displayActions.find((a) => a.variant === 'primary')
  const otherActions = displayActions.filter((a) => a.variant !== 'primary')

  return (
    <div className={cn('space-y-2', className)}>
      <div className="px-4">
        <h4 className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider">
          Quick Actions
        </h4>
      </div>

      <div className="px-4 space-y-2">
        {/* Primary action (full width) */}
        {primaryAction && (
          <ActionButton
            action={primaryAction}
            onClick={() => onAction(primaryAction.id)}
          />
        )}

        {/* Other actions */}
        <div className="space-y-1">
          {otherActions.map((action) => (
            <ActionButton
              key={action.id}
              action={action}
              onClick={() => onAction(action.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
})

// ============================================
// Compact Actions (icon grid)
// ============================================

export const QuickActionsCompact = memo(function QuickActionsCompact({
  actions,
  onAction,
  entityType,
  className,
}: QuickActionsProps) {
  const displayActions = actions.length > 0
    ? actions
    : entityType
      ? getDefaultActionsForEntity(entityType)
      : []

  if (displayActions.length === 0) {
    return null
  }

  return (
    <div className={cn('px-4', className)}>
      <div className="flex flex-wrap gap-2">
        {displayActions.slice(0, 6).map((action) => (
          <ActionButton
            key={action.id}
            action={action}
            onClick={() => onAction(action.id)}
            isCompact
          />
        ))}
      </div>
    </div>
  )
})

export default QuickActions
