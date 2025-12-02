/**
 * Activity Status Transitions
 *
 * Validation and utility functions for activity status transitions.
 *
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 */

// ==========================================
// TYPES
// ==========================================

export type ActivityStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'deferred'
  | 'cancelled';

export interface TransitionValidation {
  valid: boolean;
  reason?: string;
  requiresFields?: string[];
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface Activity {
  id: string;
  status: ActivityStatus;
  subject?: string;
  patternId?: string;
  checklistItems?: Array<{
    id: string;
    required: boolean;
    completed: boolean;
  }>;
  requiredFields?: Record<string, unknown>;
  completedAt?: string;
  deferredUntil?: string;
  cancellationReason?: string;
}

// ==========================================
// TRANSITION MATRIX
// ==========================================

/**
 * Valid status transitions matrix
 * Key: current status
 * Value: array of valid next statuses
 */
const VALID_TRANSITIONS: Record<ActivityStatus, ActivityStatus[]> = {
  pending: ['in_progress', 'deferred', 'cancelled'],
  in_progress: ['completed', 'deferred', 'cancelled'],
  deferred: ['pending', 'in_progress', 'cancelled'],
  completed: [], // Terminal state
  cancelled: [], // Terminal state
};

/**
 * Transition actions with their requirements
 */
const TRANSITION_CONFIG: Record<
  string,
  {
    label: string;
    description: string;
    requiresConfirmation?: boolean;
    requiresReason?: boolean;
    requiresDate?: boolean;
    requiresOutcome?: boolean;
    requiresChecklist?: boolean;
  }
> = {
  // From pending
  'pending->in_progress': {
    label: 'Start',
    description: 'Begin working on this activity',
  },
  'pending->deferred': {
    label: 'Defer',
    description: 'Postpone this activity',
    requiresDate: true,
  },
  'pending->cancelled': {
    label: 'Cancel',
    description: 'Cancel this activity',
    requiresConfirmation: true,
    requiresReason: true,
  },

  // From in_progress
  'in_progress->completed': {
    label: 'Complete',
    description: 'Mark this activity as completed',
    requiresOutcome: true,
    requiresChecklist: true,
  },
  'in_progress->deferred': {
    label: 'Defer',
    description: 'Postpone this activity',
    requiresDate: true,
  },
  'in_progress->cancelled': {
    label: 'Cancel',
    description: 'Cancel this activity',
    requiresConfirmation: true,
    requiresReason: true,
  },

  // From deferred
  'deferred->pending': {
    label: 'Resume',
    description: 'Move back to pending queue',
  },
  'deferred->in_progress': {
    label: 'Start',
    description: 'Begin working on this activity',
  },
  'deferred->cancelled': {
    label: 'Cancel',
    description: 'Cancel this activity',
    requiresConfirmation: true,
    requiresReason: true,
  },
};

// ==========================================
// VALIDATION FUNCTIONS
// ==========================================

/**
 * Check if a status transition is valid
 *
 * @param currentStatus - Current activity status
 * @param newStatus - Desired new status
 * @returns boolean
 */
export function canTransition(
  currentStatus: ActivityStatus,
  newStatus: ActivityStatus
): boolean {
  return VALID_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
}

/**
 * Get available transitions from current status
 *
 * @param currentStatus - Current activity status
 * @returns Array of valid next statuses
 */
export function getAvailableTransitions(currentStatus: ActivityStatus): ActivityStatus[] {
  return VALID_TRANSITIONS[currentStatus] ?? [];
}

/**
 * Validate a transition with detailed checks
 *
 * @param activity - The activity object
 * @param newStatus - Desired new status
 * @returns Validation result with details
 */
export function validateTransition(
  activity: Activity,
  newStatus: ActivityStatus
): TransitionValidation {
  // Check basic validity
  if (!canTransition(activity.status, newStatus)) {
    return {
      valid: false,
      reason: `Cannot transition from ${activity.status} to ${newStatus}`,
    };
  }

  const transitionKey = `${activity.status}->${newStatus}`;
  const config = TRANSITION_CONFIG[transitionKey];

  // Check completion requirements
  if (newStatus === 'completed') {
    // Check required checklist items
    if (activity.checklistItems) {
      const incompleteRequired = activity.checklistItems.filter(
        item => item.required && !item.completed
      );

      if (incompleteRequired.length > 0) {
        return {
          valid: false,
          reason: 'Required checklist items must be completed',
          requiresFields: incompleteRequired.map(item => item.id),
        };
      }
    }

    // Pattern may require outcome selection
    if (config?.requiresOutcome) {
      return {
        valid: true,
        requiresFields: ['outcome'],
      };
    }
  }

  // Check cancellation requirements
  if (newStatus === 'cancelled' && config?.requiresConfirmation) {
    return {
      valid: true,
      requiresConfirmation: true,
      confirmationMessage: 'Are you sure you want to cancel this activity? This action cannot be undone.',
      requiresFields: config.requiresReason ? ['cancellationReason'] : [],
    };
  }

  // Check deferral requirements
  if (newStatus === 'deferred' && config?.requiresDate) {
    return {
      valid: true,
      requiresFields: ['deferredUntil'],
    };
  }

  return { valid: true };
}

/**
 * Get transition configuration
 *
 * @param fromStatus - Current status
 * @param toStatus - Target status
 * @returns Transition configuration or undefined
 */
export function getTransitionConfig(
  fromStatus: ActivityStatus,
  toStatus: ActivityStatus
): typeof TRANSITION_CONFIG[string] | undefined {
  return TRANSITION_CONFIG[`${fromStatus}->${toStatus}`];
}

/**
 * Get transition label
 *
 * @param fromStatus - Current status
 * @param toStatus - Target status
 * @returns Action label (e.g., "Start", "Complete")
 */
export function getTransitionLabel(
  fromStatus: ActivityStatus,
  toStatus: ActivityStatus
): string {
  return getTransitionConfig(fromStatus, toStatus)?.label ?? toStatus;
}

/**
 * Check if status is terminal (no further transitions)
 *
 * @param status - Activity status
 * @returns boolean
 */
export function isTerminalStatus(status: ActivityStatus): boolean {
  return VALID_TRANSITIONS[status]?.length === 0;
}

/**
 * Check if activity is open (can be worked on)
 *
 * @param status - Activity status
 * @returns boolean
 */
export function isOpenStatus(status: ActivityStatus): boolean {
  return status === 'pending' || status === 'in_progress';
}

/**
 * Check if activity is actionable (needs attention)
 *
 * @param status - Activity status
 * @returns boolean
 */
export function isActionableStatus(status: ActivityStatus): boolean {
  return status === 'pending' || status === 'in_progress' || status === 'deferred';
}

// ==========================================
// STATUS CONFIGURATION
// ==========================================

export interface StatusConfig {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
}

export const STATUS_CONFIG: Record<ActivityStatus, StatusConfig> = {
  pending: {
    label: 'Pending',
    description: 'Waiting to be started',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    dotColor: 'bg-gray-400',
  },
  in_progress: {
    label: 'In Progress',
    description: 'Currently being worked on',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    dotColor: 'bg-blue-500',
  },
  completed: {
    label: 'Completed',
    description: 'Successfully finished',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    dotColor: 'bg-green-500',
  },
  deferred: {
    label: 'Deferred',
    description: 'Postponed for later',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
    dotColor: 'bg-purple-500',
  },
  cancelled: {
    label: 'Cancelled',
    description: 'No longer needed',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    dotColor: 'bg-red-500',
  },
};

/**
 * Get status configuration
 *
 * @param status - Activity status
 * @returns Status configuration
 */
export function getStatusConfig(status: ActivityStatus): StatusConfig {
  return STATUS_CONFIG[status];
}

/**
 * Get status label
 *
 * @param status - Activity status
 * @returns Human-readable label
 */
export function getStatusLabel(status: ActivityStatus): string {
  return STATUS_CONFIG[status]?.label ?? status;
}

// ==========================================
// TRANSITION ACTIONS
// ==========================================

export interface TransitionAction {
  status: ActivityStatus;
  label: string;
  description: string;
  icon?: string;
  variant?: 'default' | 'primary' | 'destructive' | 'outline';
  requiresModal?: boolean;
}

/**
 * Get available transition actions for UI
 *
 * @param currentStatus - Current activity status
 * @returns Array of action objects for buttons/menus
 */
export function getTransitionActions(currentStatus: ActivityStatus): TransitionAction[] {
  const transitions = getAvailableTransitions(currentStatus);

  return transitions.map(status => {
    const config = getTransitionConfig(currentStatus, status);

    return {
      status,
      label: config?.label ?? getStatusLabel(status),
      description: config?.description ?? '',
      variant: status === 'completed' ? 'primary'
        : status === 'cancelled' ? 'destructive'
        : 'outline',
      requiresModal: status === 'completed' || status === 'cancelled' || status === 'deferred',
    };
  });
}
