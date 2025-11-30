/**
 * Drizzle ORM Schema: TA (Talent Acquisition) + HR Modules
 * Tables: campaigns, campaign_contacts, engagement_tracking, employee_metadata, pods,
 *         payroll_runs, payroll_items, performance_reviews, time_attendance, pto_balances
 */

import { pgTable, uuid, text, timestamp, numeric, integer, boolean, date, jsonb, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userProfiles } from './user-profiles';
import { organizations } from './organizations';
import { leads } from './crm';

// =====================================================
// TALENT ACQUISITION MODULE
// =====================================================

// =====================================================
// CAMPAIGNS
// =====================================================

export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Campaign details
  name: text('name').notNull(),
  description: text('description'),
  campaignType: text('campaign_type').notNull().default('talent_sourcing'),

  // Channel
  channel: text('channel').notNull().default('email'),

  // Status
  status: text('status').notNull().default('draft'),

  // Targeting
  targetAudience: text('target_audience'),
  targetLocations: text('target_locations').array(),
  targetSkills: text('target_skills').array(),
  targetCompanySizes: text('target_company_sizes').array(),

  // A/B Testing
  isAbTest: boolean('is_ab_test').default(false),
  variantATemplateId: uuid('variant_a_template_id'),
  variantBTemplateId: uuid('variant_b_template_id'),
  abSplitPercentage: integer('ab_split_percentage').default(50),

  // Goals
  targetContactsCount: integer('target_contacts_count'),
  targetResponseRate: numeric('target_response_rate', { precision: 5, scale: 2 }),
  targetConversionCount: integer('target_conversion_count'),

  // Real-time metrics (aggregated from campaign_contacts)
  contactsReached: integer('contacts_reached').default(0),
  emailsSent: integer('emails_sent').default(0),
  linkedinMessagesSent: integer('linkedin_messages_sent').default(0),
  responsesReceived: integer('responses_received').default(0),
  conversions: integer('conversions').default(0),
  responseRate: numeric('response_rate', { precision: 5, scale: 2 }), // Computed in database

  // Dates
  startDate: date('start_date'),
  endDate: date('end_date'),

  // Assignment
  ownerId: uuid('owner_id').notNull().references(() => userProfiles.id),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [campaigns.orgId],
    references: [organizations.id],
  }),
  owner: one(userProfiles, {
    fields: [campaigns.ownerId],
    references: [userProfiles.id],
  }),
  creator: one(userProfiles, {
    fields: [campaigns.createdBy],
    references: [userProfiles.id],
  }),
  campaignContacts: many(campaignContacts),
}));

export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;

// =====================================================
// CAMPAIGN_CONTACTS
// =====================================================

export const campaignContacts = pgTable('campaign_contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),

  // Contact type
  contactType: text('contact_type').notNull().default('candidate'),

  // Existing entity (if already in system)
  userId: uuid('user_id').references(() => userProfiles.id),
  leadId: uuid('lead_id').references(() => leads.id),

  // Contact info (if not in system yet)
  firstName: text('first_name'),
  lastName: text('last_name'),
  email: text('email'),
  linkedinUrl: text('linkedin_url'),
  companyName: text('company_name'),
  title: text('title'),

  // Outreach status
  status: text('status').notNull().default('pending'),

  // A/B Test variant
  abVariant: text('ab_variant'),
  templateUsedId: uuid('template_used_id'),

  // Engagement
  sentAt: timestamp('sent_at', { withTimezone: true }),
  openedAt: timestamp('opened_at', { withTimezone: true }),
  clickedAt: timestamp('clicked_at', { withTimezone: true }),
  respondedAt: timestamp('responded_at', { withTimezone: true }),
  responseText: text('response_text'),

  // Conversion
  convertedAt: timestamp('converted_at', { withTimezone: true }),
  conversionType: text('conversion_type'),
  conversionEntityId: uuid('conversion_entity_id'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const campaignContactsRelations = relations(campaignContacts, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [campaignContacts.campaignId],
    references: [campaigns.id],
  }),
  user: one(userProfiles, {
    fields: [campaignContacts.userId],
    references: [userProfiles.id],
  }),
  lead: one(leads, {
    fields: [campaignContacts.leadId],
    references: [leads.id],
  }),
  engagementTracking: many(engagementTracking),
}));

export type CampaignContact = typeof campaignContacts.$inferSelect;
export type NewCampaignContact = typeof campaignContacts.$inferInsert;

// =====================================================
// ENGAGEMENT_TRACKING
// =====================================================

export const engagementTracking = pgTable('engagement_tracking', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignContactId: uuid('campaign_contact_id').notNull().references(() => campaignContacts.id, { onDelete: 'cascade' }),

  // Event details
  eventType: text('event_type').notNull(),
  eventData: jsonb('event_data'),

  // Timestamp
  eventTimestamp: timestamp('event_timestamp', { withTimezone: true }).defaultNow().notNull(),

  // Tracking
  trackingId: text('tracking_id'),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  clickedUrl: text('clicked_url'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const engagementTrackingRelations = relations(engagementTracking, ({ one }) => ({
  campaignContact: one(campaignContacts, {
    fields: [engagementTracking.campaignContactId],
    references: [campaignContacts.id],
  }),
}));

export type EngagementTracking = typeof engagementTracking.$inferSelect;
export type NewEngagementTracking = typeof engagementTracking.$inferInsert;

// =====================================================
// HR MODULE
// =====================================================

// =====================================================
// EMPLOYEE_METADATA
// =====================================================

export const employeeMetadata = pgTable('employee_metadata', {
  userId: uuid('user_id').primaryKey().references(() => userProfiles.id, { onDelete: 'cascade' }),

  // Employment details
  employmentType: text('employment_type').default('full_time'),
  employeeIdNumber: text('employee_id_number').unique(),

  // Compensation
  bonusTarget: numeric('bonus_target', { precision: 12, scale: 2 }),
  commissionPlan: text('commission_plan'),
  equityShares: integer('equity_shares'),

  // Pod assignment
  podId: uuid('pod_id'),
  podRole: text('pod_role'),

  // Performance
  kpiTargets: jsonb('kpi_targets'),
  monthlyPlacementTarget: integer('monthly_placement_target'),

  // Work schedule
  workSchedule: text('work_schedule').default('standard'),
  weeklyHours: integer('weekly_hours').default(40),

  // Benefits
  benefitsEligible: boolean('benefits_eligible').default(true),
  benefitsStartDate: date('benefits_start_date'),

  // Emergency contact
  emergencyContactName: text('emergency_contact_name'),
  emergencyContactPhone: text('emergency_contact_phone'),
  emergencyContactRelationship: text('emergency_contact_relationship'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const employeeMetadataRelations = relations(employeeMetadata, ({ one }) => ({
  user: one(userProfiles, {
    fields: [employeeMetadata.userId],
    references: [userProfiles.id],
  }),
  pod: one(pods, {
    fields: [employeeMetadata.podId],
    references: [pods.id],
  }),
}));

export type EmployeeMetadata = typeof employeeMetadata.$inferSelect;
export type NewEmployeeMetadata = typeof employeeMetadata.$inferInsert;

// =====================================================
// PODS
// =====================================================

export const pods = pgTable('pods', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Pod details
  name: text('name').notNull(),
  podType: text('pod_type').notNull(),

  // Members (2-person structure)
  seniorMemberId: uuid('senior_member_id').references(() => userProfiles.id),
  juniorMemberId: uuid('junior_member_id').references(() => userProfiles.id),

  // Goals
  sprintDurationWeeks: integer('sprint_duration_weeks').default(2),
  placementsPerSprintTarget: integer('placements_per_sprint_target').default(2),

  // Performance (computed from placements table)
  totalPlacements: integer('total_placements').default(0),
  currentSprintPlacements: integer('current_sprint_placements').default(0),
  currentSprintStartDate: date('current_sprint_start_date'),
  averagePlacementsPerSprint: numeric('average_placements_per_sprint', { precision: 5, scale: 2 }),

  // Status
  isActive: boolean('is_active').default(true),
  formedDate: date('formed_date'),
  dissolvedDate: date('dissolved_date'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

export const podsRelations = relations(pods, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [pods.orgId],
    references: [organizations.id],
  }),
  seniorMember: one(userProfiles, {
    fields: [pods.seniorMemberId],
    references: [userProfiles.id],
  }),
  juniorMember: one(userProfiles, {
    fields: [pods.juniorMemberId],
    references: [userProfiles.id],
  }),
  creator: one(userProfiles, {
    fields: [pods.createdBy],
    references: [userProfiles.id],
  }),
  employeeMetadata: many(employeeMetadata),
}));

export type Pod = typeof pods.$inferSelect;
export type NewPod = typeof pods.$inferInsert;

// =====================================================
// PAYROLL_RUNS
// =====================================================

export const payrollRuns = pgTable('payroll_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Pay period
  periodStartDate: date('period_start_date').notNull(),
  periodEndDate: date('period_end_date').notNull(),
  payDate: date('pay_date').notNull(),

  // Status
  status: text('status').notNull().default('draft'),

  // Totals (computed from payroll_items)
  employeeCount: integer('employee_count').notNull().default(0),
  totalGrossPay: numeric('total_gross_pay', { precision: 12, scale: 2 }).default('0'),
  totalTaxes: numeric('total_taxes', { precision: 12, scale: 2 }).default('0'),
  totalNetPay: numeric('total_net_pay', { precision: 12, scale: 2 }).default('0'),

  // Integration
  gustoPayrollId: text('gusto_payroll_id'),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  processingError: text('processing_error'),

  // Approval
  approvedBy: uuid('approved_by').references(() => userProfiles.id),
  approvedAt: timestamp('approved_at', { withTimezone: true }),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

export const payrollRunsRelations = relations(payrollRuns, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [payrollRuns.orgId],
    references: [organizations.id],
  }),
  approver: one(userProfiles, {
    fields: [payrollRuns.approvedBy],
    references: [userProfiles.id],
  }),
  creator: one(userProfiles, {
    fields: [payrollRuns.createdBy],
    references: [userProfiles.id],
  }),
  payrollItems: many(payrollItems),
}));

export type PayrollRun = typeof payrollRuns.$inferSelect;
export type NewPayrollRun = typeof payrollRuns.$inferInsert;

// =====================================================
// PAYROLL_ITEMS
// =====================================================

export const payrollItems = pgTable('payroll_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  payrollRunId: uuid('payroll_run_id').notNull().references(() => payrollRuns.id, { onDelete: 'cascade' }),
  employeeId: uuid('employee_id').notNull().references(() => userProfiles.id),

  // Compensation components
  baseSalary: numeric('base_salary', { precision: 10, scale: 2 }),
  commission: numeric('commission', { precision: 10, scale: 2 }),
  bonus: numeric('bonus', { precision: 10, scale: 2 }),
  overtimeHours: numeric('overtime_hours', { precision: 5, scale: 2 }),
  overtimePay: numeric('overtime_pay', { precision: 10, scale: 2 }),
  otherEarnings: numeric('other_earnings', { precision: 10, scale: 2 }),

  // Totals
  grossPay: numeric('gross_pay', { precision: 10, scale: 2 }).notNull(),
  taxesWithheld: numeric('taxes_withheld', { precision: 10, scale: 2 }),
  benefitsDeductions: numeric('benefits_deductions', { precision: 10, scale: 2 }),
  otherDeductions: numeric('other_deductions', { precision: 10, scale: 2 }),
  netPay: numeric('net_pay', { precision: 10, scale: 2 }).notNull(),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniquePayrollEmployee: unique().on(table.payrollRunId, table.employeeId),
}));

export const payrollItemsRelations = relations(payrollItems, ({ one }) => ({
  payrollRun: one(payrollRuns, {
    fields: [payrollItems.payrollRunId],
    references: [payrollRuns.id],
  }),
  employee: one(userProfiles, {
    fields: [payrollItems.employeeId],
    references: [userProfiles.id],
  }),
}));

export type PayrollItem = typeof payrollItems.$inferSelect;
export type NewPayrollItem = typeof payrollItems.$inferInsert;

// =====================================================
// PERFORMANCE_REVIEWS
// =====================================================

export const performanceReviews = pgTable('performance_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Review details
  employeeId: uuid('employee_id').notNull().references(() => userProfiles.id),
  reviewerId: uuid('reviewer_id').notNull().references(() => userProfiles.id),
  reviewCycle: text('review_cycle').notNull(),
  reviewType: text('review_type').default('annual'),

  // Review period
  periodStartDate: date('period_start_date').notNull(),
  periodEndDate: date('period_end_date').notNull(),

  // Ratings (1-5 scale)
  overallRating: integer('overall_rating'),
  qualityOfWork: integer('quality_of_work'),
  communication: integer('communication'),
  teamwork: integer('teamwork'),
  initiative: integer('initiative'),
  reliability: integer('reliability'),

  // Goals
  goalsAchieved: jsonb('goals_achieved'),
  goalsNextPeriod: jsonb('goals_next_period'),

  // Feedback
  strengths: text('strengths'),
  areasForImprovement: text('areas_for_improvement'),
  managerComments: text('manager_comments'),
  employeeSelfAssessment: text('employee_self_assessment'),
  employeeComments: text('employee_comments'),

  // Status
  status: text('status').notNull().default('draft'),

  // Dates
  scheduledDate: date('scheduled_date'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  employeeAcknowledgedAt: timestamp('employee_acknowledged_at', { withTimezone: true }),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const performanceReviewsRelations = relations(performanceReviews, ({ one }) => ({
  organization: one(organizations, {
    fields: [performanceReviews.orgId],
    references: [organizations.id],
  }),
  employee: one(userProfiles, {
    fields: [performanceReviews.employeeId],
    references: [userProfiles.id],
  }),
  reviewer: one(userProfiles, {
    fields: [performanceReviews.reviewerId],
    references: [userProfiles.id],
  }),
}));

export type PerformanceReview = typeof performanceReviews.$inferSelect;
export type NewPerformanceReview = typeof performanceReviews.$inferInsert;

// =====================================================
// TIME_ATTENDANCE
// =====================================================

export const timeAttendance = pgTable('time_attendance', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeId: uuid('employee_id').notNull().references(() => userProfiles.id),

  // Date
  date: date('date').notNull(),

  // Hours
  regularHours: numeric('regular_hours', { precision: 5, scale: 2 }).default('0'),
  overtimeHours: numeric('overtime_hours', { precision: 5, scale: 2 }).default('0'),
  ptoHours: numeric('pto_hours', { precision: 5, scale: 2 }).default('0'),
  sickHours: numeric('sick_hours', { precision: 5, scale: 2 }).default('0'),
  holidayHours: numeric('holiday_hours', { precision: 5, scale: 2 }).default('0'),
  totalHours: numeric('total_hours', { precision: 5, scale: 2 }), // Computed in database

  // Status
  status: text('status').notNull().default('draft'),

  // Approval
  approvedBy: uuid('approved_by').references(() => userProfiles.id),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  rejectionReason: text('rejection_reason'),

  // Notes
  notes: text('notes'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueEmployeeDate: unique().on(table.employeeId, table.date),
}));

export const timeAttendanceRelations = relations(timeAttendance, ({ one }) => ({
  employee: one(userProfiles, {
    fields: [timeAttendance.employeeId],
    references: [userProfiles.id],
  }),
  approver: one(userProfiles, {
    fields: [timeAttendance.approvedBy],
    references: [userProfiles.id],
  }),
}));

export type TimeAttendance = typeof timeAttendance.$inferSelect;
export type NewTimeAttendance = typeof timeAttendance.$inferInsert;

// =====================================================
// PTO_BALANCES
// =====================================================

export const ptoBalances = pgTable('pto_balances', {
  employeeId: uuid('employee_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  year: integer('year').notNull(),

  // Accrual
  annualAccrualDays: numeric('annual_accrual_days', { precision: 5, scale: 2 }).default('15.0'),
  accrualRatePerPayPeriod: numeric('accrual_rate_per_pay_period', { precision: 5, scale: 2 }),

  // Current balance
  totalAccrued: numeric('total_accrued', { precision: 5, scale: 2 }).default('0'),
  totalUsed: numeric('total_used', { precision: 5, scale: 2 }).default('0'),
  totalPending: numeric('total_pending', { precision: 5, scale: 2 }).default('0'),
  currentBalance: numeric('current_balance', { precision: 5, scale: 2 }), // Computed in database

  // Metadata
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pk: { columns: [table.employeeId, table.year] },
}));

export const ptoBalancesRelations = relations(ptoBalances, ({ one }) => ({
  employee: one(userProfiles, {
    fields: [ptoBalances.employeeId],
    references: [userProfiles.id],
  }),
}));

export type PtoBalance = typeof ptoBalances.$inferSelect;
export type NewPtoBalance = typeof ptoBalances.$inferInsert;

// =====================================================
// Enums for Type Safety
// =====================================================

export const CampaignType = {
  TALENT_SOURCING: 'talent_sourcing',
  BUSINESS_DEVELOPMENT: 'business_development',
  MIXED: 'mixed',
} as const;

export const CampaignChannel = {
  LINKEDIN: 'linkedin',
  EMAIL: 'email',
  COMBINED: 'combined',
} as const;

export const CampaignStatus = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;

export const CampaignContactStatus = {
  PENDING: 'pending',
  SENT: 'sent',
  OPENED: 'opened',
  RESPONDED: 'responded',
  CONVERTED: 'converted',
  BOUNCED: 'bounced',
  UNSUBSCRIBED: 'unsubscribed',
} as const;

export const EngagementEventType = {
  EMAIL_SENT: 'email_sent',
  EMAIL_OPENED: 'email_opened',
  LINK_CLICKED: 'link_clicked',
  EMAIL_BOUNCED: 'email_bounced',
  UNSUBSCRIBED: 'unsubscribed',
} as const;

export const HREmploymentType = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  CONTRACTOR: 'contractor',
  INTERN: 'intern',
} as const;

export const PodType = {
  RECRUITING: 'recruiting',
  BENCH_SALES: 'bench_sales',
  TA: 'ta',
} as const;

export const PayrollRunStatus = {
  DRAFT: 'draft',
  READY_FOR_APPROVAL: 'ready_for_approval',
  APPROVED: 'approved',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const ReviewType = {
  ANNUAL: 'annual',
  MID_YEAR: 'mid_year',
  PROBATION: 'probation',
  NINETY_DAY: '90_day',
} as const;

export const ReviewStatus = {
  DRAFT: 'draft',
  PENDING_EMPLOYEE_REVIEW: 'pending_employee_review',
  COMPLETED: 'completed',
  ACKNOWLEDGED: 'acknowledged',
} as const;

export const TimeAttendanceStatus = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type CampaignTypeType = typeof CampaignType[keyof typeof CampaignType];
export type CampaignChannelType = typeof CampaignChannel[keyof typeof CampaignChannel];
export type CampaignStatusType = typeof CampaignStatus[keyof typeof CampaignStatus];
export type CampaignContactStatusType = typeof CampaignContactStatus[keyof typeof CampaignContactStatus];
export type EngagementEventTypeType = typeof EngagementEventType[keyof typeof EngagementEventType];
export type HREmploymentTypeType = typeof HREmploymentType[keyof typeof HREmploymentType];
export type PodTypeType = typeof PodType[keyof typeof PodType];
export type PayrollRunStatusType = typeof PayrollRunStatus[keyof typeof PayrollRunStatus];
export type ReviewTypeType = typeof ReviewType[keyof typeof ReviewType];
export type ReviewStatusType = typeof ReviewStatus[keyof typeof ReviewStatus];
export type TimeAttendanceStatusType = typeof TimeAttendanceStatus[keyof typeof TimeAttendanceStatus];
