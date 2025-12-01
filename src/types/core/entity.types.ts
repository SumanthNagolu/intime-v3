/**
 * Entity Type Definitions
 * 
 * Defines all entity types used for polymorphic relations.
 * 
 * Implements: docs/specs/10-DATABASE/00-ERD.md
 */

// ==========================================
// ENTITY TYPES (for polymorphic relations)
// ==========================================

/**
 * All entity types in the system
 * Used for Activities, Events, RACI assignments, etc.
 */
export type EntityType =
  // ATS Entities
  | 'job'
  | 'candidate'
  | 'submission'
  | 'interview'
  | 'offer'
  | 'placement'
  // CRM Entities
  | 'account'
  | 'contact'
  | 'lead'
  | 'deal'
  | 'campaign'
  // Bench Sales Entities
  | 'consultant'
  | 'job_order'
  | 'vendor'
  | 'hotlist'
  | 'marketing_profile'
  // HR Entities
  | 'employee'
  | 'leave_request'
  | 'timesheet'
  | 'expense_report'
  // System Entities
  | 'user'
  | 'pod'
  | 'organization'
  | 'activity'
  | 'event';

/**
 * Entity type display names
 */
export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  job: 'Job',
  candidate: 'Candidate',
  submission: 'Submission',
  interview: 'Interview',
  offer: 'Offer',
  placement: 'Placement',
  account: 'Account',
  contact: 'Contact',
  lead: 'Lead',
  deal: 'Deal',
  campaign: 'Campaign',
  consultant: 'Consultant',
  job_order: 'Job Order',
  vendor: 'Vendor',
  hotlist: 'Hotlist',
  marketing_profile: 'Marketing Profile',
  employee: 'Employee',
  leave_request: 'Leave Request',
  timesheet: 'Timesheet',
  expense_report: 'Expense Report',
  user: 'User',
  pod: 'Pod',
  organization: 'Organization',
  activity: 'Activity',
  event: 'Event',
};

/**
 * Entity type icon mapping (lucide-react icon names)
 */
export const ENTITY_TYPE_ICONS: Record<EntityType, string> = {
  job: 'Briefcase',
  candidate: 'User',
  submission: 'Send',
  interview: 'Video',
  offer: 'Gift',
  placement: 'CheckCircle',
  account: 'Building',
  contact: 'Contact',
  lead: 'Target',
  deal: 'DollarSign',
  campaign: 'Megaphone',
  consultant: 'UserCheck',
  job_order: 'FileText',
  vendor: 'Truck',
  hotlist: 'List',
  marketing_profile: 'FileEdit',
  employee: 'UserCircle',
  leave_request: 'Calendar',
  timesheet: 'Clock',
  expense_report: 'Receipt',
  user: 'User',
  pod: 'Users',
  organization: 'Building2',
  activity: 'Activity',
  event: 'Zap',
};

// ==========================================
// ENTITY CATEGORIES
// ==========================================

/**
 * Group entities by domain
 */
export const ENTITY_CATEGORIES = {
  ats: ['job', 'candidate', 'submission', 'interview', 'offer', 'placement'] as EntityType[],
  crm: ['account', 'contact', 'lead', 'deal', 'campaign'] as EntityType[],
  bench: ['consultant', 'job_order', 'vendor', 'hotlist', 'marketing_profile'] as EntityType[],
  hr: ['employee', 'leave_request', 'timesheet', 'expense_report'] as EntityType[],
  system: ['user', 'pod', 'organization', 'activity', 'event'] as EntityType[],
} as const;

/**
 * Check if entity type belongs to a category
 */
export function isEntityInCategory(
  entityType: EntityType,
  category: keyof typeof ENTITY_CATEGORIES
): boolean {
  return ENTITY_CATEGORIES[category].includes(entityType);
}

