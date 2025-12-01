/**
 * SLA Types
 * 
 * Based on docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 */

import type { ActivityType, ActivityPriority } from '@/lib/activities/activity.types';

// ============================================================================
// SLA STATUS
// ============================================================================

export type SlaStatus =
  | 'active'     // SLA is being tracked
  | 'met'        // SLA was met (activity completed on time)
  | 'warning'    // In warning zone
  | 'critical'   // In critical zone
  | 'breached'   // SLA was breached
  | 'paused';    // SLA tracking paused

// ============================================================================
// SLA DEFINITION
// ============================================================================

/**
 * SLA Definition - Defines the SLA rules for a type of activity
 */
export interface SlaDefinition {
  id: string;
  orgId: string | null;           // null = global/system definition
  
  // Identity
  slaName: string;
  slaCode: string;                // e.g., "CANDIDATE_FIRST_CONTACT"
  description?: string;
  
  // Applicability
  entityType: string;             // 'activity', 'submission', 'job'
  activityType?: ActivityType;    // If entity_type = 'activity'
  activityCategory?: string;
  priority?: ActivityPriority;    // Apply to specific priority
  
  // Thresholds (in hours)
  targetHours: number;            // Target completion time
  warningHours?: number;          // Warning threshold
  criticalHours?: number;         // Critical threshold
  
  // Business hours
  useBusinessHours: boolean;
  businessHoursStart?: string;    // e.g., "09:00"
  businessHoursEnd?: string;      // e.g., "17:00"
  
  // Escalation
  escalateOnBreach: boolean;
  escalateToUserId?: string;
  escalateToGroupId?: string;
  
  // Metadata
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * SLA Instance - Tracks SLA for a specific activity
 */
export interface SlaInstance {
  id: string;
  orgId: string;
  slaDefinitionId: string;
  activityId: string;
  
  // Timing
  startTime: Date;                // When SLA clock started
  targetTime: Date;               // When SLA target is
  warningTime?: Date;             // When warning triggers
  criticalTime?: Date;            // When critical triggers
  
  // Status
  status: SlaStatus;
  completedAt?: Date;             // When activity was completed
  
  // Pause tracking
  pausedAt?: Date;
  resumedAt?: Date;
  
  // Breach tracking
  isBreached: boolean;
  breachedAt?: Date;
  breachDuration?: number;        // Minutes breached
  
  // Escalation tracking
  escalationSent: boolean;
  escalationSentAt?: Date;
  
  // Metadata
  createdAt: Date;
}

// ============================================================================
// SLA INPUTS
// ============================================================================

export interface CreateSlaInstanceInput {
  orgId: string;
  slaDefinitionId: string;
  activityId: string;
  startTime?: Date;               // Default: now
}

export interface SlaCheckResult {
  status: SlaStatus;
  remainingMinutes: number;       // Can be negative if overdue
  percentComplete: number;        // 0-100+
  warningTriggered: boolean;
  criticalTriggered: boolean;
  breached: boolean;
}

// ============================================================================
// STANDARD SLA DEFINITIONS
// ============================================================================

export const STANDARD_SLA_DEFINITIONS: Omit<SlaDefinition, 'id' | 'orgId' | 'createdAt' | 'updatedAt'>[] = [
  // Candidate SLAs
  {
    slaName: 'First Contact',
    slaCode: 'CAND_FIRST_CONTACT',
    description: 'Contact new candidate within 4 hours',
    entityType: 'activity',
    activityType: 'call',
    targetHours: 4,
    warningHours: 3,
    criticalHours: 5,
    useBusinessHours: true,
    businessHoursStart: '09:00',
    businessHoursEnd: '17:00',
    escalateOnBreach: true,
    isActive: true,
  },
  {
    slaName: 'Submission Follow-up',
    slaCode: 'SUB_CLIENT_FOLLOWUP',
    description: 'Follow up with client on submission within 48 hours',
    entityType: 'activity',
    activityType: 'call',
    targetHours: 48,
    warningHours: 40,
    criticalHours: 56,
    useBusinessHours: true,
    businessHoursStart: '09:00',
    businessHoursEnd: '17:00',
    escalateOnBreach: true,
    isActive: true,
  },
  {
    slaName: 'Interview Feedback',
    slaCode: 'INT_FEEDBACK',
    description: 'Collect interview feedback within 4 hours',
    entityType: 'activity',
    activityType: 'call',
    targetHours: 4,
    warningHours: 3,
    criticalHours: 6,
    useBusinessHours: true,
    businessHoursStart: '09:00',
    businessHoursEnd: '17:00',
    escalateOnBreach: true,
    isActive: true,
  },
  
  // Job SLAs
  {
    slaName: 'First Submission',
    slaCode: 'JOB_FIRST_SUB',
    description: 'Submit first candidate within 5 business days',
    entityType: 'job',
    targetHours: 40,              // 5 business days
    warningHours: 32,             // 4 business days
    criticalHours: 48,            // 6 business days
    useBusinessHours: true,
    businessHoursStart: '09:00',
    businessHoursEnd: '17:00',
    escalateOnBreach: true,
    isActive: true,
  },
  
  // Placement SLAs
  {
    slaName: 'Day 1 Check-in',
    slaCode: 'PLACE_DAY1_CHECKIN',
    description: 'Check in with placed consultant on day 1',
    entityType: 'activity',
    activityType: 'call',
    targetHours: 10,              // Same business day
    warningHours: 8,
    criticalHours: 24,            // Next day
    useBusinessHours: true,
    businessHoursStart: '09:00',
    businessHoursEnd: '17:00',
    escalateOnBreach: true,
    isActive: true,
  },
];

// ============================================================================
// SLA METRICS
// ============================================================================

export interface SlaMetrics {
  totalTracked: number;
  met: number;
  breached: number;
  inProgress: number;
  complianceRate: number;         // 0-100
  avgCompletionHours: number;
  avgBreachMinutes: number;       // For breached SLAs
}

export interface SlaMetricsByType {
  [slaCode: string]: SlaMetrics;
}

