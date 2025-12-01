/**
 * Activity Types
 * 
 * Based on docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 */

import type { EntityType } from '@/types/core/entity.types';

// ============================================================================
// ACTIVITY TYPES
// ============================================================================

export type ActivityType =
  | 'call'              // Phone call
  | 'email'             // Email sent/received
  | 'meeting'           // In-person or video meeting
  | 'task'              // General task
  | 'note'              // Note/comment added
  | 'sms'               // Text message
  | 'linkedin'          // LinkedIn message
  | 'review'            // Review/approval
  | 'document'          // Document action
  | 'interview'         // Interview conducted
  | 'submission'        // Submission action
  | 'status_change'     // Status update
  | 'assignment'        // Assignment/reassignment
  | 'escalation'        // Escalation
  | 'follow_up'         // Follow-up action
  | 'custom';           // Custom type

export type ActivityStatus =
  | 'open'              // Not started
  | 'in_progress'       // Being worked on
  | 'completed'         // Done
  | 'cancelled'         // Cancelled/not needed
  | 'deferred';         // Postponed

export type ActivityPriority =
  | 'critical'          // Must do immediately
  | 'high'              // Important, do today
  | 'medium'            // Standard priority
  | 'low';              // Can wait

export type ActivityOutcome =
  | 'successful'        // Goal achieved
  | 'unsuccessful'      // Did not achieve goal
  | 'no_answer'         // Could not reach
  | 'left_voicemail'    // Left message
  | 'rescheduled'       // Moved to later
  | 'no_show'           // Other party didn't show
  | 'partial'           // Partially completed
  | 'pending_response'; // Waiting for response

export type ActivityDirection =
  | 'inbound'           // Incoming (e.g., received call)
  | 'outbound';         // Outgoing (e.g., made call)

// ============================================================================
// ACTIVITY INTERFACES
// ============================================================================

/**
 * Activity - A unit of human work
 */
export interface Activity {
  // Identity
  id: string;
  orgId: string;
  activityNumber: string;        // Human-readable: CALL-2024-00001

  // Type & Pattern
  activityType: ActivityType;
  patternCode?: string;          // If auto-created from pattern
  patternId?: string;            // Reference to pattern
  isAutoCreated: boolean;

  // Subject & Description
  subject: string;               // Short title
  body?: string;                 // Main content/notes
  description?: string;          // Additional description

  // Related Entity (Polymorphic)
  entityType: EntityType;
  entityId: string;

  // Secondary Entity (optional)
  secondaryEntityType?: EntityType;
  secondaryEntityId?: string;

  // Assignment & Ownership
  assignedTo: string;            // User ID who owns this
  performedBy?: string;          // Who actually performed it
  assignedGroup?: string;        // Pod/team assignment
  createdBy: string;

  // Status & Priority
  status: ActivityStatus;
  priority: ActivityPriority;

  // Direction (for calls/emails)
  direction?: ActivityDirection;
  category?: string;

  // Timing
  dueDate: Date;
  scheduledAt?: Date;            // Scheduled start time
  scheduledFor?: Date;           // For scheduled activities
  startedAt?: Date;
  completedAt?: Date;
  skippedAt?: Date;
  durationMinutes?: number;

  // Outcome
  outcome?: ActivityOutcome;
  outcomeNotes?: string;

  // Instructions/Checklist
  instructions?: string;
  checklist?: ActivityChecklistItem[];
  checklistProgress?: Record<string, boolean>;

  // Follow-up
  followUpRequired: boolean;
  followUpDate?: Date;
  followUpActivityId?: string;

  // Chaining
  predecessorActivityId?: string;
  parentActivityId?: string;

  // Escalation
  escalationCount: number;
  escalationDate?: Date;
  lastEscalatedAt?: Date;
  reminderSentAt?: Date;
  reminderCount: number;

  // Metadata
  tags?: string[];
  customFields?: Record<string, unknown>;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface ActivityChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  completedAt?: Date;
  completedBy?: string;
}

// ============================================================================
// ACTIVITY INPUT TYPES
// ============================================================================

/**
 * Input for creating a new activity
 */
export interface CreateActivityInput {
  orgId: string;
  
  // Type
  activityType: ActivityType;
  patternCode?: string;
  patternId?: string;
  
  // Content
  subject: string;
  body?: string;
  description?: string;
  
  // Related Entity
  entityType: EntityType;
  entityId: string;
  secondaryEntityType?: EntityType;
  secondaryEntityId?: string;
  
  // Assignment
  assignedTo: string;
  assignedGroup?: string;
  createdBy: string;
  
  // Status
  status?: ActivityStatus;
  priority?: ActivityPriority;
  direction?: ActivityDirection;
  category?: string;
  
  // Timing
  dueDate: Date;
  scheduledAt?: Date;
  
  // Auto-creation flag
  isAutoCreated?: boolean;
  
  // Instructions
  instructions?: string;
  checklist?: Omit<ActivityChecklistItem, 'completedAt' | 'completedBy'>[];
  
  // Metadata
  tags?: string[];
  customFields?: Record<string, unknown>;
}

/**
 * Input for completing an activity
 */
export interface CompleteActivityInput {
  activityId: string;
  userId: string;
  outcome: ActivityOutcome;
  outcomeNotes?: string;
  durationMinutes?: number;
  
  // Optional follow-up
  followUp?: {
    type: ActivityType;
    subject: string;
    dueDate: Date;
    assignedTo?: string;  // Default to current user
  };
}

/**
 * Input for rescheduling an activity
 */
export interface RescheduleActivityInput {
  activityId: string;
  userId: string;
  newDueDate: Date;
  reason?: string;
}

/**
 * Input for reassigning an activity
 */
export interface ReassignActivityInput {
  activityId: string;
  userId: string;
  newAssigneeId: string;
  reason?: string;
}

// ============================================================================
// ACTIVITY FILTERS & QUERIES
// ============================================================================

export interface ActivityFilters {
  orgId: string;
  assignedTo?: string;
  entityType?: EntityType;
  entityId?: string;
  status?: ActivityStatus | ActivityStatus[];
  priority?: ActivityPriority | ActivityPriority[];
  activityType?: ActivityType | ActivityType[];
  dueBefore?: Date;
  dueAfter?: Date;
  isOverdue?: boolean;
  isAutoCreated?: boolean;
  tags?: string[];
  limit?: number;
  offset?: number;
  orderBy?: 'dueDate' | 'createdAt' | 'priority';
  orderDir?: 'asc' | 'desc';
}

export interface ActivitySummary {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
}

export interface ActivityQueueItem {
  id: string;
  activityNumber: string;
  activityType: ActivityType;
  subject: string;
  status: ActivityStatus;
  priority: ActivityPriority;
  dueDate: Date;
  isOverdue: boolean;
  entityType: EntityType;
  entityId: string;
  entityName?: string;          // Denormalized for display
}

// ============================================================================
// ACTIVITY TIMELINE
// ============================================================================

export interface TimelineEntry {
  id: string;
  type: 'activity' | 'event';
  timestamp: Date;
  
  // Activity-specific
  activity?: {
    activityNumber: string;
    activityType: ActivityType;
    subject: string;
    status: ActivityStatus;
    outcome?: ActivityOutcome;
    durationMinutes?: number;
    performedBy?: string;
    performedByName?: string;
  };
  
  // Event-specific
  event?: {
    eventType: string;
    actorName?: string;
    description: string;
    changes?: { field: string; oldValue: unknown; newValue: unknown }[];
  };
}

// ============================================================================
// TYPE METADATA
// ============================================================================

export const ACTIVITY_TYPE_META: Record<ActivityType, {
  icon: string;
  label: string;
  description: string;
  typicalDuration: number;  // minutes
}> = {
  call: { icon: '📞', label: 'Call', description: 'Phone call', typicalDuration: 20 },
  email: { icon: '📧', label: 'Email', description: 'Email sent/received', typicalDuration: 10 },
  meeting: { icon: '📅', label: 'Meeting', description: 'Scheduled meeting', typicalDuration: 45 },
  task: { icon: '✅', label: 'Task', description: 'General task', typicalDuration: 30 },
  note: { icon: '📝', label: 'Note', description: 'Note or comment', typicalDuration: 5 },
  sms: { icon: '💬', label: 'SMS', description: 'Text message', typicalDuration: 2 },
  linkedin: { icon: '💼', label: 'LinkedIn', description: 'LinkedIn message', typicalDuration: 5 },
  review: { icon: '👁️', label: 'Review', description: 'Review/approval', typicalDuration: 15 },
  document: { icon: '📄', label: 'Document', description: 'Document action', typicalDuration: 5 },
  interview: { icon: '🎤', label: 'Interview', description: 'Interview conducted', typicalDuration: 60 },
  submission: { icon: '📤', label: 'Submission', description: 'Submission action', typicalDuration: 15 },
  status_change: { icon: '🔄', label: 'Status Change', description: 'Status update', typicalDuration: 2 },
  assignment: { icon: '👤', label: 'Assignment', description: 'Assignment/reassignment', typicalDuration: 5 },
  escalation: { icon: '⚠️', label: 'Escalation', description: 'Issue escalated', typicalDuration: 10 },
  follow_up: { icon: '↩️', label: 'Follow-up', description: 'Follow-up action', typicalDuration: 15 },
  custom: { icon: '⚙️', label: 'Custom', description: 'Custom activity type', typicalDuration: 15 },
};

export const PRIORITY_META: Record<ActivityPriority, {
  label: string;
  color: string;
  order: number;
}> = {
  critical: { label: 'Critical', color: 'red', order: 0 },
  high: { label: 'High', color: 'orange', order: 1 },
  medium: { label: 'Medium', color: 'yellow', order: 2 },
  low: { label: 'Low', color: 'green', order: 3 },
};

export const STATUS_META: Record<ActivityStatus, {
  label: string;
  color: string;
  isFinal: boolean;
}> = {
  open: { label: 'Open', color: 'gray', isFinal: false },
  in_progress: { label: 'In Progress', color: 'blue', isFinal: false },
  completed: { label: 'Completed', color: 'green', isFinal: true },
  cancelled: { label: 'Cancelled', color: 'red', isFinal: true },
  deferred: { label: 'Deferred', color: 'purple', isFinal: false },
};

export const OUTCOME_META: Record<ActivityOutcome, {
  label: string;
  isPositive: boolean;
}> = {
  successful: { label: 'Successful', isPositive: true },
  unsuccessful: { label: 'Unsuccessful', isPositive: false },
  no_answer: { label: 'No Answer', isPositive: false },
  left_voicemail: { label: 'Left Voicemail', isPositive: false },
  rescheduled: { label: 'Rescheduled', isPositive: false },
  no_show: { label: 'No Show', isPositive: false },
  partial: { label: 'Partial', isPositive: false },
  pending_response: { label: 'Pending Response', isPositive: false },
};

