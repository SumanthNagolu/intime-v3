/**
 * SLA (Service Level Agreement) Type Definitions
 * 
 * Implements: docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md (Section 12.2)
 * 
 * Defines SLA rules, tracking, and violation handling.
 */

import type { EntityType } from './entity.types';

// ==========================================
// SLA ENUMS
// ==========================================

/**
 * SLA Status
 */
export type SLAStatus =
  | 'on_track'    // Within normal time
  | 'warning'     // Approaching threshold
  | 'breach'      // Exceeded threshold
  | 'completed';  // Finished (may or may not have breached)

/**
 * SLA Metric Type
 */
export type SLAMetricType =
  // Candidate SLAs
  | 'first_contact'         // Time to first contact after sourcing
  | 'resume_review'         // Time to review resume
  | 'submission_followup'   // Time to follow up on submission
  // Job SLAs
  | 'first_submission'      // Time to first candidate submission
  | 'weekly_update'         // Frequency of client updates
  // Submission SLAs
  | 'client_response'       // Time to get client feedback
  | 'interview_schedule'    // Time to schedule interview after approval
  // Placement SLAs
  | 'day1_checkin'          // Time for day 1 check-in
  | 'week1_checkin'         // Time for week 1 check-in
  | 'timesheet_submission'; // Timesheet submission deadline

// ==========================================
// SLA INTERFACES
// ==========================================

/**
 * SLA Definition - Configuration for an SLA rule
 */
export interface SLADefinition {
  id: string;
  orgId: string;
  
  // What this SLA applies to
  entityType: EntityType;
  metric: SLAMetricType;
  
  // Thresholds (in hours)
  warningThreshold: number;
  breachThreshold: number;
  
  // Notification configuration
  notifyOnWarning: boolean;
  notifyOnBreach: boolean;
  warningRecipients: SLARecipient[];
  breachRecipients: SLARecipient[];
  
  // Configuration
  isActive: boolean;
  businessHoursOnly: boolean;
  excludeWeekends: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * SLA Recipient Type
 */
export type SLARecipient =
  | 'owner'           // Entity owner (R)
  | 'accountable'     // Entity accountable (A)
  | 'manager'         // Pod manager
  | 'regional'        // Regional director
  | 'coo';            // COO

/**
 * SLA Tracking - Active tracking of an SLA
 */
export interface SLATracking {
  id: string;
  orgId: string;
  
  // What's being tracked
  definitionId: string;
  entityType: EntityType;
  entityId: string;
  metric: SLAMetricType;
  
  // Timestamps
  startedAt: Date;
  warningAt: Date;    // When warning threshold will be hit
  breachAt: Date;     // When breach threshold will be hit
  completedAt?: Date; // When the SLA was completed
  
  // Status
  status: SLAStatus;
  
  // If completed
  wasBreached?: boolean;
  actualDurationHours?: number;
}

/**
 * SLA Violation - Record of a breach
 */
export interface SLAViolation {
  id: string;
  orgId: string;
  
  // Reference
  trackingId: string;
  entityType: EntityType;
  entityId: string;
  metric: SLAMetricType;
  
  // Violation details
  violationType: 'warning' | 'breach';
  occurredAt: Date;
  thresholdHours: number;
  actualHours: number;
  
  // Resolution
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionNotes?: string;
  
  // Notifications sent
  notificationsSent: string[];  // User IDs
}

/**
 * SLA Summary for an entity
 */
export interface SLASummary {
  entityType: EntityType;
  entityId: string;
  
  // Overall status
  currentStatus: SLAStatus;
  
  // Counts
  totalSLAs: number;
  onTrack: number;
  warnings: number;
  breaches: number;
  completed: number;
  
  // Active tracking
  activeTrackings: SLATracking[];
  
  // Historical
  totalViolations: number;
  averageComplianceRate: number;  // 0-100%
}

// ==========================================
// SLA CONFIGURATION
// ==========================================

/**
 * Default SLA configurations by entity and metric
 */
export const DEFAULT_SLA_CONFIGS: Omit<SLADefinition, 'id' | 'orgId' | 'createdAt' | 'updatedAt'>[] = [
  // Candidate SLAs
  {
    entityType: 'candidate',
    metric: 'first_contact',
    warningThreshold: 4,   // 4 hours
    breachThreshold: 24,   // 24 hours
    notifyOnWarning: true,
    notifyOnBreach: true,
    warningRecipients: ['owner'],
    breachRecipients: ['owner', 'manager'],
    isActive: true,
    businessHoursOnly: true,
    excludeWeekends: true,
  },
  // Job SLAs
  {
    entityType: 'job',
    metric: 'first_submission',
    warningThreshold: 72,  // 3 days
    breachThreshold: 120,  // 5 days
    notifyOnWarning: true,
    notifyOnBreach: true,
    warningRecipients: ['owner'],
    breachRecipients: ['owner', 'manager', 'coo'],
    isActive: true,
    businessHoursOnly: true,
    excludeWeekends: true,
  },
  // Submission SLAs
  {
    entityType: 'submission',
    metric: 'client_response',
    warningThreshold: 24,  // 1 day
    breachThreshold: 48,   // 2 days
    notifyOnWarning: true,
    notifyOnBreach: true,
    warningRecipients: ['owner'],
    breachRecipients: ['owner', 'manager'],
    isActive: true,
    businessHoursOnly: true,
    excludeWeekends: true,
  },
  // Placement SLAs
  {
    entityType: 'placement',
    metric: 'day1_checkin',
    warningThreshold: 8,   // End of first day
    breachThreshold: 24,   // Next day
    notifyOnWarning: true,
    notifyOnBreach: true,
    warningRecipients: ['owner'],
    breachRecipients: ['owner', 'manager'],
    isActive: true,
    businessHoursOnly: true,
    excludeWeekends: false, // Placements can start any day
  },
];

/**
 * SLA Metric Labels
 */
export const SLA_METRIC_LABELS: Record<SLAMetricType, string> = {
  first_contact: 'First Contact',
  resume_review: 'Resume Review',
  submission_followup: 'Submission Follow-up',
  first_submission: 'First Submission',
  weekly_update: 'Weekly Update',
  client_response: 'Client Response',
  interview_schedule: 'Interview Scheduling',
  day1_checkin: 'Day 1 Check-in',
  week1_checkin: 'Week 1 Check-in',
  timesheet_submission: 'Timesheet Submission',
};

/**
 * SLA Status Colors
 */
export const SLA_STATUS_COLORS: Record<SLAStatus, string> = {
  on_track: 'green',
  warning: 'yellow',
  breach: 'red',
  completed: 'gray',
};

// ==========================================
// SLA CALCULATION HELPERS
// ==========================================

/**
 * Calculate business hours between two dates
 */
export function calculateBusinessHours(
  start: Date,
  end: Date,
  excludeWeekends: boolean = true
): number {
  let hours = 0;
  const current = new Date(start);
  
  while (current < end) {
    const dayOfWeek = current.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (!excludeWeekends || !isWeekend) {
      const hour = current.getHours();
      // Business hours: 9 AM - 6 PM
      if (hour >= 9 && hour < 18) {
        hours++;
      }
    }
    
    current.setHours(current.getHours() + 1);
  }
  
  return hours;
}

/**
 * Calculate SLA status from tracking
 */
export function calculateSLAStatus(tracking: SLATracking): SLAStatus {
  if (tracking.completedAt) {
    return 'completed';
  }
  
  const now = new Date();
  
  if (now >= tracking.breachAt) {
    return 'breach';
  }
  
  if (now >= tracking.warningAt) {
    return 'warning';
  }
  
  return 'on_track';
}

