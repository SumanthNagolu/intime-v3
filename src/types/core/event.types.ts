/**
 * Event Type Definitions
 * 
 * Implements: 
 * - docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 * - docs/specs/20-USER-ROLES/03-EVENT-TYPE-CATALOG.md
 * 
 * Events are immutable system records of what happened.
 * Unlike Activities, Events cannot be edited and have no status.
 */

import type { EntityType } from './entity.types';

// ==========================================
// EVENT ENUMS
// ==========================================

/**
 * Event Category - Classification of event
 */
export type EventCategory =
  | 'entity'       // CRUD on entities
  | 'workflow'     // Workflow state changes
  | 'system'       // System events
  | 'integration'  // External integrations
  | 'security'     // Auth/security events
  | 'notification'; // Notification events

/**
 * Event Severity - Importance level
 */
export type EventSeverity =
  | 'info'     // Normal operation
  | 'warning'  // Potential issue
  | 'error'    // Error occurred
  | 'critical'; // Critical issue

/**
 * Actor Type - Who/what triggered the event
 */
export type ActorType =
  | 'user'        // Human user
  | 'system'      // System process
  | 'integration' // External system
  | 'scheduler'   // Scheduled job
  | 'webhook';    // Incoming webhook

/**
 * Event Source - Where the event originated
 */
export type EventSource =
  | 'ui'          // User interface
  | 'api'         // API call
  | 'integration' // External integration
  | 'scheduler'   // Scheduled task
  | 'webhook'     // Incoming webhook
  | 'migration';  // Data migration

// ==========================================
// EVENT TYPE DEFINITIONS
// ==========================================

/**
 * All event types following {entity}.{action}[.{qualifier}] pattern
 * Based on 03-EVENT-TYPE-CATALOG.md
 */
export type EventType =
  // Candidate Events
  | 'candidate.created'
  | 'candidate.updated'
  | 'candidate.deleted'
  | 'candidate.merged'
  | 'candidate.status_changed'
  | 'candidate.owner_changed'
  | 'candidate.sourced'
  | 'candidate.contacted'
  | 'candidate.qualified'
  | 'candidate.submitted'
  | 'candidate.interviewed'
  | 'candidate.offered'
  | 'candidate.placed'
  | 'candidate.rejected'
  | 'candidate.reactivated'
  | 'candidate.stale'
  | 'candidate.duplicate_detected'
  // Job Events
  | 'job.created'
  | 'job.updated'
  | 'job.deleted'
  | 'job.published'
  | 'job.paused'
  | 'job.closed'
  | 'job.filled'
  | 'job.owner_changed'
  | 'job.priority_changed'
  | 'job.extended'
  | 'job.no_submissions'
  | 'job.stale'
  | 'job.sla_warning'
  | 'job.sla_breach'
  // Submission Events
  | 'submission.created'
  | 'submission.updated'
  | 'submission.sent_to_client'
  | 'submission.approved'
  | 'submission.rejected'
  | 'submission.withdrawn'
  | 'submission.interview_requested'
  | 'submission.offer_pending'
  | 'submission.rate_changed'
  // Interview Events
  | 'interview.scheduled'
  | 'interview.rescheduled'
  | 'interview.cancelled'
  | 'interview.completed'
  | 'interview.no_show'
  | 'interview.feedback_submitted'
  | 'interview.reminder_sent'
  // Placement Events
  | 'placement.created'
  | 'placement.started'
  | 'placement.extended'
  | 'placement.ended'
  | 'placement.terminated'
  | 'placement.rate_changed'
  | 'placement.30day_review'
  | 'placement.60day_review'
  | 'placement.end_approaching'
  | 'placement.timesheet_missing'
  | 'placement.timesheet_approved'
  // Account Events
  | 'account.created'
  | 'account.updated'
  | 'account.owner_changed'
  | 'account.tier_changed'
  | 'account.health_score_changed'
  | 'account.health_score_dropped'
  | 'account.no_activity'
  | 'account.contract_expiring'
  | 'account.quarter_ended'
  // Lead Events
  | 'lead.created'
  | 'lead.qualified'
  | 'lead.converted'
  | 'lead.disqualified'
  | 'lead.stale'
  // Deal Events
  | 'deal.created'
  | 'deal.stage_changed'
  | 'deal.won'
  | 'deal.lost'
  | 'deal.proposal_sent'
  | 'deal.stale'
  // Activity Events
  | 'activity.created'
  | 'activity.completed'
  | 'activity.cancelled'
  | 'activity.reassigned'
  | 'activity.overdue'
  // System Events
  | 'user.login'
  | 'user.logout'
  | 'user.password_changed'
  | 'user.permission_changed'
  | 'integration.synced'
  | 'integration.failed'
  | 'report.generated'
  | 'export.completed';

// ==========================================
// EVENT INTERFACES
// ==========================================

/**
 * Related Entity Reference
 */
export interface RelatedEntityRef {
  type: EntityType;
  id: string;
  name?: string;
  relationship: string;  // e.g., "job", "account", "recruiter"
}

/**
 * Field Change Record
 */
export interface FieldChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

/**
 * Event - Full event record (immutable)
 */
export interface Event {
  // Identity
  id: string;
  orgId: string;
  eventId: string;  // Human-readable: EVT-2024-00001

  // Event Classification
  eventType: EventType;
  eventCategory: EventCategory;
  eventSeverity: EventSeverity;

  // Actor (who/what triggered)
  actorType: ActorType;
  actorId?: string;    // User ID if user-triggered
  actorName?: string;  // Display name

  // Entity Affected
  entityType: EntityType;
  entityId: string;
  entityName?: string;  // Display name for quick reference

  // Related Entities
  relatedEntities?: RelatedEntityRef[];

  // Event Data
  eventData: Record<string, unknown>;  // Full event payload
  changes?: FieldChange[];             // For update events

  // Context
  source: EventSource;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;

  // Correlation
  correlationId?: string;           // Links related events
  parentEventId?: string;           // For event chains
  triggeredActivityIds?: string[];  // Activities created by this event

  // Timestamps (immutable)
  occurredAt: Date;
  recordedAt: Date;
}

/**
 * Event Emit Input
 */
export interface EventEmitInput {
  type: EventType;
  entityType: EntityType;
  entityId: string;
  entityName?: string;
  actorId?: string;
  eventData: Record<string, unknown>;
  changes?: FieldChange[];
  relatedEntities?: RelatedEntityRef[];
  correlationId?: string;
  parentEventId?: string;
}

/**
 * Event Query Filters
 */
export interface EventQueryFilters {
  eventType?: EventType | EventType[];
  eventCategory?: EventCategory | EventCategory[];
  eventSeverity?: EventSeverity | EventSeverity[];
  entityType?: EntityType;
  entityId?: string;
  actorId?: string;
  actorType?: ActorType;
  source?: EventSource;
  occurredAfter?: Date;
  occurredBefore?: Date;
  correlationId?: string;
}

// ==========================================
// EVENT TYPE METADATA
// ==========================================

/**
 * Event type metadata
 */
export interface EventTypeMetadata {
  type: EventType;
  category: EventCategory;
  defaultSeverity: EventSeverity;
  label: string;
  description: string;
  triggersAutoActivity: boolean;
  notifyRoles?: string[];
}

/**
 * Get event category from event type
 */
export function getEventCategory(eventType: EventType): EventCategory {
  // Entity events end with .created, .updated, .deleted
  if (eventType.endsWith('.created') || 
      eventType.endsWith('.updated') || 
      eventType.endsWith('.deleted')) {
    return 'entity';
  }
  
  // System events
  if (eventType.startsWith('user.') || 
      eventType.startsWith('integration.') ||
      eventType.startsWith('report.') ||
      eventType.startsWith('export.')) {
    return 'system';
  }
  
  // Default to workflow
  return 'workflow';
}

/**
 * Get default severity from event type
 */
export function getDefaultEventSeverity(eventType: EventType): EventSeverity {
  // Critical events
  if (eventType.includes('.sla_breach') ||
      eventType.includes('.failed') ||
      eventType.includes('.terminated')) {
    return 'critical';
  }
  
  // Warning events
  if (eventType.includes('.sla_warning') ||
      eventType.includes('.stale') ||
      eventType.includes('.no_show') ||
      eventType.includes('.health_score_dropped') ||
      eventType.includes('.no_activity') ||
      eventType.includes('.overdue') ||
      eventType.includes('.no_submissions')) {
    return 'warning';
  }
  
  // Default to info
  return 'info';
}

/**
 * Event severity colors
 */
export const EVENT_SEVERITY_COLORS: Record<EventSeverity, string> = {
  info: 'blue',
  warning: 'yellow',
  error: 'red',
  critical: 'red',
};

/**
 * Event category icons
 */
export const EVENT_CATEGORY_ICONS: Record<EventCategory, string> = {
  entity: 'Database',
  workflow: 'GitBranch',
  system: 'Settings',
  integration: 'Plug',
  security: 'Shield',
  notification: 'Bell',
};

