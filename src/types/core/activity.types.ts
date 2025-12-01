/**
 * Activity Type Definitions
 * 
 * Implements: docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 * 
 * Activities are human-performed work items that must be tracked.
 * "NO WORK IS CONSIDERED DONE UNLESS AN ACTIVITY IS CREATED"
 */

import type { EntityType } from './entity.types';

// ==========================================
// ACTIVITY TYPES
// ==========================================

/**
 * Activity Type - What kind of activity is this?
 */
export type ActivityType =
  | 'call'           // Phone call
  | 'email'          // Email sent/received
  | 'meeting'        // In-person or video meeting
  | 'task'           // General task
  | 'note'           // Note/comment added
  | 'sms'            // Text message
  | 'linkedin'       // LinkedIn message
  | 'review'         // Review/approval
  | 'document'       // Document action
  | 'interview'      // Interview conducted
  | 'submission'     // Submission action
  | 'status_change'  // Status update
  | 'assignment'     // Assignment/reassignment
  | 'escalation'     // Escalation
  | 'follow_up'      // Follow-up action
  | 'custom';        // Custom type

/**
 * Activity Status - Current state of the activity
 */
export type ActivityStatus =
  | 'open'         // Not started
  | 'in_progress'  // Being worked on
  | 'completed'    // Done
  | 'cancelled'    // Cancelled/not needed
  | 'deferred';    // Postponed

/**
 * Activity Priority - How urgent is this activity?
 */
export type ActivityPriority =
  | 'critical'  // Must do immediately
  | 'high'      // Important, do today
  | 'medium'    // Standard priority
  | 'low';      // Can wait

/**
 * Activity Outcome - Result of the activity
 */
export type ActivityOutcome =
  | 'successful'        // Goal achieved
  | 'unsuccessful'      // Did not achieve goal
  | 'no_answer'         // Could not reach
  | 'left_voicemail'    // Left message
  | 'rescheduled'       // Moved to later
  | 'no_show'           // Other party didn't show
  | 'partial'           // Partially completed
  | 'pending_response'; // Waiting for response

// ==========================================
// ACTIVITY INTERFACES
// ==========================================

/**
 * Activity - Full activity record
 */
export interface Activity {
  // Identity
  id: string;
  orgId: string;
  activityNumber: string;  // Human-readable: ACT-2024-00001

  // Type & Pattern
  activityType: ActivityType;
  activityPatternId?: string;  // Reference to pattern (if auto-created)
  isAutoCreated: boolean;      // true if system-created from pattern

  // Subject & Description
  subject: string;             // Short title: "Call candidate about availability"
  description?: string;        // Detailed notes

  // Related Entity (Polymorphic)
  relatedEntityType: EntityType;
  relatedEntityId: string;

  // Secondary Relations (optional)
  secondaryEntityType?: EntityType;
  secondaryEntityId?: string;

  // Assignment & Ownership
  assignedTo: string;   // User ID who owns this activity
  createdBy: string;    // User ID who created it

  // Status & Priority
  status: ActivityStatus;
  priority: ActivityPriority;

  // Timing
  dueDate?: Date;
  dueTime?: string;           // HH:MM
  completedAt?: Date;
  completedBy?: string;       // User ID who completed
  durationMinutes?: number;   // How long it took

  // Outcome
  outcome?: ActivityOutcome;
  outcomeNotes?: string;

  // Follow-up
  followUpRequired: boolean;
  followUpDate?: Date;
  followUpActivityId?: string;  // Link to next activity

  // Metadata
  tags?: string[];
  customFields?: Record<string, unknown>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Activity Create Input
 */
export interface ActivityCreateInput {
  activityType: ActivityType;
  subject: string;
  description?: string;
  relatedEntityType: EntityType;
  relatedEntityId: string;
  secondaryEntityType?: EntityType;
  secondaryEntityId?: string;
  assignedTo: string;
  priority?: ActivityPriority;
  dueDate?: Date;
  dueTime?: string;
  tags?: string[];
}

/**
 * Activity Complete Input
 */
export interface ActivityCompleteInput {
  activityId: string;
  outcome: ActivityOutcome;
  outcomeNotes?: string;
  durationMinutes: number;
  followUp?: {
    type: ActivityType;
    subject: string;
    dueDate: Date;
  };
}

/**
 * Activity Query Filters
 */
export interface ActivityQueryFilters {
  assignedTo?: string;
  status?: ActivityStatus | ActivityStatus[];
  priority?: ActivityPriority | ActivityPriority[];
  activityType?: ActivityType | ActivityType[];
  relatedEntityType?: EntityType;
  relatedEntityId?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  isOverdue?: boolean;
  isAutoCreated?: boolean;
}

// ==========================================
// ACTIVITY TYPE METADATA
// ==========================================

/**
 * Activity type metadata
 */
export interface ActivityTypeMetadata {
  type: ActivityType;
  label: string;
  icon: string;  // lucide-react icon name
  color: string;
  defaultDuration: number;  // minutes
  requiresOutcome: boolean;
  requiresNotes: boolean;
}

/**
 * Activity type configurations
 */
export const ACTIVITY_TYPE_CONFIG: Record<ActivityType, ActivityTypeMetadata> = {
  call: {
    type: 'call',
    label: 'Call',
    icon: 'Phone',
    color: 'blue',
    defaultDuration: 15,
    requiresOutcome: true,
    requiresNotes: true,
  },
  email: {
    type: 'email',
    label: 'Email',
    icon: 'Mail',
    color: 'green',
    defaultDuration: 5,
    requiresOutcome: true,
    requiresNotes: false,
  },
  meeting: {
    type: 'meeting',
    label: 'Meeting',
    icon: 'Calendar',
    color: 'purple',
    defaultDuration: 30,
    requiresOutcome: true,
    requiresNotes: true,
  },
  task: {
    type: 'task',
    label: 'Task',
    icon: 'CheckSquare',
    color: 'orange',
    defaultDuration: 30,
    requiresOutcome: true,
    requiresNotes: false,
  },
  note: {
    type: 'note',
    label: 'Note',
    icon: 'FileText',
    color: 'gray',
    defaultDuration: 2,
    requiresOutcome: false,
    requiresNotes: true,
  },
  sms: {
    type: 'sms',
    label: 'SMS',
    icon: 'MessageSquare',
    color: 'cyan',
    defaultDuration: 2,
    requiresOutcome: false,
    requiresNotes: false,
  },
  linkedin: {
    type: 'linkedin',
    label: 'LinkedIn',
    icon: 'Linkedin',
    color: 'blue',
    defaultDuration: 5,
    requiresOutcome: true,
    requiresNotes: false,
  },
  review: {
    type: 'review',
    label: 'Review',
    icon: 'Eye',
    color: 'yellow',
    defaultDuration: 15,
    requiresOutcome: true,
    requiresNotes: true,
  },
  document: {
    type: 'document',
    label: 'Document',
    icon: 'File',
    color: 'indigo',
    defaultDuration: 10,
    requiresOutcome: false,
    requiresNotes: false,
  },
  interview: {
    type: 'interview',
    label: 'Interview',
    icon: 'Video',
    color: 'red',
    defaultDuration: 60,
    requiresOutcome: true,
    requiresNotes: true,
  },
  submission: {
    type: 'submission',
    label: 'Submission',
    icon: 'Send',
    color: 'teal',
    defaultDuration: 15,
    requiresOutcome: true,
    requiresNotes: true,
  },
  status_change: {
    type: 'status_change',
    label: 'Status Change',
    icon: 'RefreshCw',
    color: 'pink',
    defaultDuration: 2,
    requiresOutcome: false,
    requiresNotes: false,
  },
  assignment: {
    type: 'assignment',
    label: 'Assignment',
    icon: 'UserPlus',
    color: 'violet',
    defaultDuration: 5,
    requiresOutcome: false,
    requiresNotes: false,
  },
  escalation: {
    type: 'escalation',
    label: 'Escalation',
    icon: 'AlertTriangle',
    color: 'red',
    defaultDuration: 10,
    requiresOutcome: true,
    requiresNotes: true,
  },
  follow_up: {
    type: 'follow_up',
    label: 'Follow-up',
    icon: 'CornerUpRight',
    color: 'amber',
    defaultDuration: 15,
    requiresOutcome: true,
    requiresNotes: false,
  },
  custom: {
    type: 'custom',
    label: 'Custom',
    icon: 'MoreHorizontal',
    color: 'gray',
    defaultDuration: 15,
    requiresOutcome: false,
    requiresNotes: false,
  },
};

/**
 * Activity status colors
 */
export const ACTIVITY_STATUS_COLORS: Record<ActivityStatus, string> = {
  open: 'gray',
  in_progress: 'blue',
  completed: 'green',
  cancelled: 'red',
  deferred: 'yellow',
};

/**
 * Activity priority colors
 */
export const ACTIVITY_PRIORITY_COLORS: Record<ActivityPriority, string> = {
  critical: 'red',
  high: 'orange',
  medium: 'yellow',
  low: 'green',
};

