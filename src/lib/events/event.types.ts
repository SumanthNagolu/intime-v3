/**
 * Event Types
 * 
 * Based on docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 * and docs/specs/20-USER-ROLES/03-EVENT-TYPE-CATALOG.md
 */

// ============================================================================
// EVENT CATEGORIES
// ============================================================================

export type EventCategory =
  | 'entity'            // CRUD on entities
  | 'workflow'          // Workflow state changes
  | 'system'            // System events
  | 'integration'       // External integrations
  | 'security'          // Auth/security events
  | 'notification';     // Notification events

export type EventSeverity =
  | 'info'              // Normal operation
  | 'warning'           // Potential issue
  | 'error'             // Error occurred
  | 'critical';         // Critical issue

export type ActorType =
  | 'user'              // Human user
  | 'system'            // System process
  | 'integration'       // External system
  | 'scheduler'         // Scheduled job
  | 'webhook';          // Incoming webhook

export type EventSource =
  | 'ui'                // User interface
  | 'api'               // API call
  | 'integration'       // External integration
  | 'scheduler'         // Scheduled task
  | 'webhook'           // Incoming webhook
  | 'migration'         // Data migration
  | 'system';           // System process

// ============================================================================
// EVENT INTERFACE
// ============================================================================

/**
 * Event - An immutable record of what happened
 */
export interface Event {
  // Identity
  id: string;
  orgId: string;
  eventNumber?: string;          // Human-readable: EVT-2024-00001

  // Event Classification
  eventType: string;             // e.g., "candidate.submitted"
  eventCategory: EventCategory;
  eventSeverity: EventSeverity;

  // Actor (who/what triggered)
  actorType: ActorType;
  actorId?: string;              // User ID if user-triggered
  actorName?: string;            // Display name

  // Entity Affected
  entityType: string;            // candidate, job, submission, etc.
  entityId: string;              // ID of affected entity
  entityName?: string;           // Display name for quick reference

  // Related Entities
  relatedEntities?: RelatedEntity[];

  // Event Data
  eventData: Record<string, unknown>;
  changes?: FieldChange[];       // For update events

  // Context
  source: EventSource;
  ipAddress?: string;            // For audit
  userAgent?: string;            // For audit
  sessionId?: string;            // Session tracking

  // Correlation
  correlationId?: string;        // Links related events
  parentEventId?: string;        // For event chains
  triggeredActivityIds?: string[]; // Activities created by this event

  // Timestamps (immutable)
  occurredAt: Date;              // When event happened
  recordedAt: Date;              // When recorded (usually same)
}

export interface RelatedEntity {
  type: string;
  id: string;
  name?: string;
  relationship: string;          // e.g., "job", "account", "recruiter"
}

export interface FieldChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

// ============================================================================
// EVENT INPUT TYPES
// ============================================================================

/**
 * Input for emitting an event
 */
export interface EmitEventInput {
  // Required
  type: string;                  // Event type (e.g., "candidate.created")
  orgId: string;
  entityType: string;
  entityId: string;
  
  // Actor
  actorId?: string;
  actorType?: ActorType;
  actorName?: string;
  
  // Event data
  eventData: Record<string, unknown>;
  changes?: FieldChange[];
  relatedEntities?: RelatedEntity[];
  
  // Context
  source?: EventSource;
  correlationId?: string;
  parentEventId?: string;
  
  // Metadata
  entityName?: string;
}

// ============================================================================
// EVENT TYPE CONSTANTS
// ============================================================================

/**
 * Standard event types for the recruiting domain
 */
export const EVENT_TYPES = {
  // Candidate Events
  CANDIDATE_CREATED: 'candidate.created',
  CANDIDATE_UPDATED: 'candidate.updated',
  CANDIDATE_DELETED: 'candidate.deleted',
  CANDIDATE_STATUS_CHANGED: 'candidate.status_changed',
  CANDIDATE_OWNER_CHANGED: 'candidate.owner_changed',
  CANDIDATE_SOURCED: 'candidate.sourced',
  CANDIDATE_CONTACTED: 'candidate.contacted',
  CANDIDATE_QUALIFIED: 'candidate.qualified',
  CANDIDATE_SUBMITTED: 'candidate.submitted',
  CANDIDATE_INTERVIEWED: 'candidate.interviewed',
  CANDIDATE_OFFERED: 'candidate.offered',
  CANDIDATE_PLACED: 'candidate.placed',
  CANDIDATE_REJECTED: 'candidate.rejected',
  CANDIDATE_REACTIVATED: 'candidate.reactivated',
  CANDIDATE_STALE: 'candidate.stale',
  
  // Job Events
  JOB_CREATED: 'job.created',
  JOB_UPDATED: 'job.updated',
  JOB_DELETED: 'job.deleted',
  JOB_PUBLISHED: 'job.published',
  JOB_PAUSED: 'job.paused',
  JOB_CLOSED: 'job.closed',
  JOB_FILLED: 'job.filled',
  JOB_OWNER_CHANGED: 'job.owner_changed',
  JOB_PRIORITY_CHANGED: 'job.priority_changed',
  JOB_EXTENDED: 'job.extended',
  JOB_NO_SUBMISSIONS: 'job.no_submissions',
  JOB_STALE: 'job.stale',
  JOB_SLA_WARNING: 'job.sla_warning',
  JOB_SLA_BREACH: 'job.sla_breach',
  
  // Submission Events
  SUBMISSION_CREATED: 'submission.created',
  SUBMISSION_UPDATED: 'submission.updated',
  SUBMISSION_SENT_TO_CLIENT: 'submission.sent_to_client',
  SUBMISSION_APPROVED: 'submission.approved',
  SUBMISSION_REJECTED: 'submission.rejected',
  SUBMISSION_WITHDRAWN: 'submission.withdrawn',
  SUBMISSION_INTERVIEW_REQUESTED: 'submission.interview_requested',
  SUBMISSION_OFFER_PENDING: 'submission.offer_pending',
  SUBMISSION_RATE_CHANGED: 'submission.rate_changed',
  
  // Interview Events
  INTERVIEW_SCHEDULED: 'interview.scheduled',
  INTERVIEW_RESCHEDULED: 'interview.rescheduled',
  INTERVIEW_CANCELLED: 'interview.cancelled',
  INTERVIEW_COMPLETED: 'interview.completed',
  INTERVIEW_NO_SHOW: 'interview.no_show',
  INTERVIEW_FEEDBACK_SUBMITTED: 'interview.feedback_submitted',
  INTERVIEW_REMINDER_SENT: 'interview.reminder_sent',
  
  // Placement Events
  PLACEMENT_CREATED: 'placement.created',
  PLACEMENT_STARTED: 'placement.started',
  PLACEMENT_EXTENDED: 'placement.extended',
  PLACEMENT_ENDED: 'placement.ended',
  PLACEMENT_TERMINATED: 'placement.terminated',
  PLACEMENT_RATE_CHANGED: 'placement.rate_changed',
  PLACEMENT_MILESTONE_30DAY: 'placement.milestone_30day',
  PLACEMENT_MILESTONE_60DAY: 'placement.milestone_60day',
  PLACEMENT_END_APPROACHING: 'placement.end_approaching',
  PLACEMENT_TIMESHEET_MISSING: 'placement.timesheet_missing',
  PLACEMENT_TIMESHEET_APPROVED: 'placement.timesheet_approved',
  
  // Account Events
  ACCOUNT_CREATED: 'account.created',
  ACCOUNT_UPDATED: 'account.updated',
  ACCOUNT_OWNER_CHANGED: 'account.owner_changed',
  ACCOUNT_TIER_CHANGED: 'account.tier_changed',
  ACCOUNT_HEALTH_SCORE_CHANGED: 'account.health_score_changed',
  ACCOUNT_HEALTH_SCORE_DROPPED: 'account.health_score_dropped',
  ACCOUNT_NO_ACTIVITY: 'account.no_activity',
  ACCOUNT_CONTRACT_EXPIRING: 'account.contract_expiring',
  ACCOUNT_QUARTER_ENDED: 'account.quarter_ended',
  
  // Lead Events
  LEAD_CREATED: 'lead.created',
  LEAD_QUALIFIED: 'lead.qualified',
  LEAD_CONVERTED: 'lead.converted',
  LEAD_DISQUALIFIED: 'lead.disqualified',
  LEAD_STALE: 'lead.stale',
  
  // Deal Events
  DEAL_CREATED: 'deal.created',
  DEAL_STAGE_CHANGED: 'deal.stage_changed',
  DEAL_WON: 'deal.won',
  DEAL_LOST: 'deal.lost',
  DEAL_PROPOSAL_SENT: 'deal.proposal_sent',
  DEAL_STALE: 'deal.stale',
  
  // Activity Events
  ACTIVITY_CREATED: 'activity.created',
  ACTIVITY_COMPLETED: 'activity.completed',
  ACTIVITY_CANCELLED: 'activity.cancelled',
  ACTIVITY_REASSIGNED: 'activity.reassigned',
  ACTIVITY_RESCHEDULED: 'activity.rescheduled',
  ACTIVITY_OVERDUE: 'activity.overdue',
  ACTIVITY_SLA_WARNING: 'activity.sla_warning',
  ACTIVITY_SLA_BREACH: 'activity.sla_breach',
  
  // System Events
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_PASSWORD_CHANGED: 'user.password_changed',
  USER_PERMISSION_CHANGED: 'user.permission_changed',
  INTEGRATION_SYNCED: 'integration.synced',
  INTEGRATION_FAILED: 'integration.failed',
  REPORT_GENERATED: 'report.generated',
  EXPORT_COMPLETED: 'export.completed',
} as const;

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];

// ============================================================================
// EVENT HANDLER TYPES
// ============================================================================

export type EventHandler = (event: Event) => Promise<void>;

export interface EventSubscription {
  id: string;
  eventType: string | '*';       // '*' for all events
  handler: EventHandler;
  priority?: number;             // Higher = runs first
}

// ============================================================================
// EVENT METADATA
// ============================================================================

export const EVENT_CATEGORY_MAP: Record<string, EventCategory> = {
  // Entity events
  created: 'entity',
  updated: 'entity',
  deleted: 'entity',
  merged: 'entity',
  
  // Workflow events
  status_changed: 'workflow',
  owner_changed: 'workflow',
  submitted: 'workflow',
  approved: 'workflow',
  rejected: 'workflow',
  scheduled: 'workflow',
  completed: 'workflow',
  started: 'workflow',
  ended: 'workflow',
  
  // System events
  stale: 'system',
  sla_warning: 'system',
  sla_breach: 'system',
  reminder_sent: 'system',
  
  // Security events
  login: 'security',
  logout: 'security',
  password_changed: 'security',
  permission_changed: 'security',
  
  // Integration events
  synced: 'integration',
  failed: 'integration',
};

/**
 * Get category from event type
 */
export function getEventCategory(eventType: string): EventCategory {
  const parts = eventType.split('.');
  const action = parts[parts.length - 1];
  
  return EVENT_CATEGORY_MAP[action] ?? 'entity';
}

/**
 * Get severity from event type
 */
export function getEventSeverity(eventType: string): EventSeverity {
  if (eventType.includes('error') || eventType.includes('failed')) {
    return 'error';
  }
  if (eventType.includes('critical') || eventType.includes('breach')) {
    return 'critical';
  }
  if (eventType.includes('warning') || eventType.includes('stale')) {
    return 'warning';
  }
  return 'info';
}

