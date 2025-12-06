/**
 * SLA Type Definitions
 *
 * Type definitions for SLA configuration, calculations, and events.
 */

export type SlaCategory =
  | 'response_time'
  | 'submission_speed'
  | 'interview_schedule'
  | 'interview_feedback'
  | 'offer_response'
  | 'onboarding'
  | 'client_touch'
  | 'candidate_followup'
  | 'document_collection'
  | 'timesheet_approval'

export type SlaEntityType =
  | 'jobs'
  | 'candidates'
  | 'submissions'
  | 'placements'
  | 'accounts'
  | 'leads'
  | 'interviews'
  | 'offers'

export type SlaTargetUnit =
  | 'minutes'
  | 'hours'
  | 'business_hours'
  | 'days'
  | 'business_days'
  | 'weeks'

export type SlaStatus = 'draft' | 'active' | 'disabled'

export type SlaEventStatus =
  | 'pending'
  | 'warning'
  | 'breach'
  | 'critical'
  | 'met'
  | 'cancelled'

export type BadgeColor = 'yellow' | 'orange' | 'red'

export interface BusinessHoursConfig {
  startHour: number // 9 for 9:00 AM
  endHour: number // 17 for 5:00 PM
  timezone: string // 'America/New_York'
  excludeWeekends: boolean
  holidays: string[] // ['2024-12-25', '2025-01-01']
}

export interface EscalationLevel {
  id?: string
  levelNumber: number
  levelName: string
  triggerPercentage: number
  notifyEmail: boolean
  emailRecipients: string[]
  notifySlack: boolean
  slackChannel?: string
  showBadge: boolean
  badgeColor: BadgeColor
  addToReport: boolean
  addToDashboard: boolean
  createTask: boolean
  taskAssignee?: string
  escalateOwnership: boolean
  escalateTo?: string
  requireResolutionNotes: boolean
}

export interface SlaCondition {
  field: string
  operator: string
  value: unknown
}

export interface SlaDefinition {
  id: string
  orgId: string
  name: string
  category: SlaCategory
  description?: string
  entityType: SlaEntityType
  startEvent: string
  endEvent: string
  targetValue: number
  targetUnit: SlaTargetUnit
  businessHoursOnly: boolean
  excludeWeekends: boolean
  excludeHolidays?: boolean
  conditions: SlaCondition[]
  status: SlaStatus
  pauseOnHold: boolean
  applyRetroactive: boolean
  escalationLevels: EscalationLevel[]
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export interface SlaEvent {
  id: string
  orgId: string
  slaDefinitionId: string
  entityType: SlaEntityType
  entityId: string
  startTime: string
  endTime?: string
  targetDeadline: string
  elapsedMinutes: number
  currentPercentage: number
  currentLevel: number
  status: SlaEventStatus
  metAt?: string
  resolutionNotes?: string
  resolvedBy?: string
  createdAt: string
  updatedAt: string
}

export interface SlaNotification {
  id: string
  slaEventId: string
  escalationLevel: number
  notificationType: 'email' | 'slack' | 'sms' | 'in_app'
  recipients: string[]
  sentAt: string
  deliveredAt?: string
  failedAt?: string
  errorMessage?: string
  externalMessageId?: string
}

export interface SlaStats {
  totalRules: number
  activeRules: number
  draftRules: number
  disabledRules: number
  pendingEvents: number
  warningEvents: number
  breachEvents: number
  metToday: number
  breachedToday: number
  complianceRate: number
}

export interface SlaTestResult {
  totalRecords: number
  metSla: number
  wouldWarning: number
  wouldBreach: number
  wouldCritical: number
  projectedComplianceRate: number
  sampleRecords: SlaTestSampleRecord[]
}

export interface SlaTestSampleRecord {
  id: string
  name: string
  createdAt: string
  elapsedHours: number
  status: 'met' | 'warning' | 'breach' | 'critical'
}

export interface SlaScheduledRun {
  id: string
  lastRunAt: string
  rulesChecked: number
  eventsUpdated: number
  notificationsSent: number
  errors: string[]
  runDurationMs: number
  createdAt: string
}

export interface ElapsedTimeResult {
  totalMinutes: number
  businessMinutes: number
  percentageOfTarget: number
  isOverdue: boolean
  overdueMinutes: number
}
