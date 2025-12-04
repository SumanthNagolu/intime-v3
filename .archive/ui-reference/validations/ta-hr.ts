/**
 * Zod Validation Schemas: TA + HR Modules
 * Runtime validation for campaigns, employee data, pods, payroll, and reviews
 */

import { z } from 'zod';

// =====================================================
// TALENT ACQUISITION - CAMPAIGNS
// =====================================================

export const createCampaignSchema = z.object({
  // Campaign details
  name: z.string().min(1, 'Campaign name is required').max(255),
  description: z.string().optional(),
  campaignType: z.enum(['talent_sourcing', 'business_development', 'mixed']).default('talent_sourcing'),

  // Channel
  channel: z.enum(['linkedin', 'email', 'combined']).default('email'),

  // Status
  status: z.enum(['draft', 'active', 'paused', 'completed', 'archived']).default('draft'),

  // Targeting
  targetAudience: z.string().optional(),
  targetLocations: z.array(z.string()).optional(),
  targetSkills: z.array(z.string()).optional(),
  targetCompanySizes: z.array(z.string()).optional(),

  // A/B Testing
  isAbTest: z.boolean().default(false),
  variantATemplateId: z.string().uuid().optional(),
  variantBTemplateId: z.string().uuid().optional(),
  abSplitPercentage: z.number().int().min(0).max(100).default(50),

  // Goals
  targetContactsCount: z.number().int().min(1).optional(),
  targetResponseRate: z.number().min(0).max(100).optional(),
  targetConversionCount: z.number().int().min(1).optional(),

  // Dates
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),

  // Assignment
  ownerId: z.string().uuid(),
});

export const updateCampaignSchema = createCampaignSchema.partial().extend({
  id: z.string().uuid(),
});

// =====================================================
// CAMPAIGN_CONTACTS
// =====================================================

export const addCampaignContactSchema = z.object({
  campaignId: z.string().uuid(),

  // Contact type
  contactType: z.enum(['candidate', 'business_lead']).default('candidate'),

  // Existing entity (if already in system)
  userId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),

  // Contact info (if not in system yet)
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  linkedinUrl: z.string().url().optional(),
  companyName: z.string().optional(),
  title: z.string().optional(),

  // A/B Test variant
  abVariant: z.enum(['A', 'B']).optional(),
  templateUsedId: z.string().uuid().optional(),
}).refine(
  (data) => !!(data.userId || data.leadId || (data.email && data.firstName && data.lastName)),
  {
    message: 'Contact must have either userId, leadId, or (email + firstName + lastName)',
    path: ['email'],
  }
);

export const updateCampaignContactSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'sent', 'opened', 'responded', 'converted', 'bounced', 'unsubscribed']).optional(),
  responseText: z.string().optional(),
  conversionType: z.enum(['applied_to_job', 'scheduled_call', 'became_deal', 'became_candidate']).optional(),
  conversionEntityId: z.string().uuid().optional(),
});

// =====================================================
// ENGAGEMENT_TRACKING
// =====================================================

export const trackEngagementSchema = z.object({
  campaignContactId: z.string().uuid(),
  eventType: z.enum(['email_sent', 'email_opened', 'link_clicked', 'email_bounced', 'unsubscribed']),
  eventData: z.record(z.unknown()).optional(),
  trackingId: z.string().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  clickedUrl: z.string().url().optional(),
});

// =====================================================
// HR - EMPLOYEE_METADATA
// =====================================================

export const createEmployeeMetadataSchema = z.object({
  userId: z.string().uuid(),

  // Employment details
  employmentType: z.enum(['full_time', 'part_time', 'contractor', 'intern']).default('full_time'),
  employeeIdNumber: z.string().optional(),

  // Compensation
  bonusTarget: z.number().min(0).optional(),
  commissionPlan: z.string().optional(),
  equityShares: z.number().int().min(0).optional(),

  // Pod assignment
  podId: z.string().uuid().optional(),
  podRole: z.enum(['senior', 'junior']).optional(),

  // Performance
  kpiTargets: z.record(z.unknown()).optional(),
  monthlyPlacementTarget: z.number().int().min(0).optional(),

  // Work schedule
  workSchedule: z.enum(['standard', 'flexible', 'remote']).default('standard'),
  weeklyHours: z.number().int().min(1).max(168).default(40),

  // Benefits
  benefitsEligible: z.boolean().default(true),
  benefitsStartDate: z.coerce.date().optional(),

  // Emergency contact
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
});

export const updateEmployeeMetadataSchema = createEmployeeMetadataSchema.partial().extend({
  userId: z.string().uuid(),
});

// =====================================================
// PODS
// =====================================================

export const createPodSchema = z.object({
  // Pod details
  name: z.string().min(1, 'Pod name is required').max(100),
  podType: z.enum(['recruiting', 'bench_sales', 'ta']),

  // Members (2-person structure)
  seniorMemberId: z.string().uuid(),
  juniorMemberId: z.string().uuid(),

  // Goals
  sprintDurationWeeks: z.number().int().min(1).max(8).default(2),
  placementsPerSprintTarget: z.number().int().min(1).max(10).default(2),

  // Status
  isActive: z.boolean().default(true),
  formedDate: z.coerce.date().optional(),
});

export const updatePodSchema = createPodSchema.partial().extend({
  id: z.string().uuid(),
  dissolvedDate: z.coerce.date().optional(),
});

export const startNewSprintSchema = z.object({
  podId: z.string().uuid(),
  currentSprintStartDate: z.coerce.date(),
});

// =====================================================
// PAYROLL_RUNS
// =====================================================

export const createPayrollRunSchema = z.object({
  // Pay period
  periodStartDate: z.coerce.date(),
  periodEndDate: z.coerce.date(),
  payDate: z.coerce.date(),

  // Status
  status: z.enum(['draft', 'ready_for_approval', 'approved', 'processing', 'completed', 'failed']).default('draft'),
});

export const updatePayrollRunSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['draft', 'ready_for_approval', 'approved', 'processing', 'completed', 'failed']).optional(),
  gustoPayrollId: z.string().optional(),
  processingError: z.string().optional(),
});

export const approvePayrollRunSchema = z.object({
  payrollRunId: z.string().uuid(),
});

// =====================================================
// PAYROLL_ITEMS
// =====================================================

export const addPayrollItemSchema = z.object({
  payrollRunId: z.string().uuid(),
  employeeId: z.string().uuid(),

  // Compensation components
  baseSalary: z.number().min(0).optional(),
  commission: z.number().min(0).optional(),
  bonus: z.number().min(0).optional(),
  overtimeHours: z.number().min(0).max(80).optional(),
  overtimePay: z.number().min(0).optional(),
  otherEarnings: z.number().min(0).optional(),

  // Totals
  grossPay: z.number().min(0),
  taxesWithheld: z.number().min(0).optional(),
  benefitsDeductions: z.number().min(0).optional(),
  otherDeductions: z.number().min(0).optional(),
  netPay: z.number().min(0),
});

export const updatePayrollItemSchema = addPayrollItemSchema.partial().extend({
  id: z.string().uuid(),
});

// =====================================================
// PERFORMANCE_REVIEWS
// =====================================================

export const createPerformanceReviewSchema = z.object({
  // Review details
  employeeId: z.string().uuid(),
  reviewerId: z.string().uuid(),
  reviewCycle: z.string().min(1, 'Review cycle is required'),
  reviewType: z.enum(['annual', 'mid_year', 'probation', '90_day']).default('annual'),

  // Review period
  periodStartDate: z.coerce.date(),
  periodEndDate: z.coerce.date(),

  // Scheduled date
  scheduledDate: z.coerce.date().optional(),
});

export const updatePerformanceReviewSchema = z.object({
  id: z.string().uuid(),

  // Ratings (1-5 scale)
  overallRating: z.number().int().min(1).max(5).optional(),
  qualityOfWork: z.number().int().min(1).max(5).optional(),
  communication: z.number().int().min(1).max(5).optional(),
  teamwork: z.number().int().min(1).max(5).optional(),
  initiative: z.number().int().min(1).max(5).optional(),
  reliability: z.number().int().min(1).max(5).optional(),

  // Goals
  goalsAchieved: z.record(z.unknown()).optional(),
  goalsNextPeriod: z.record(z.unknown()).optional(),

  // Feedback
  strengths: z.string().optional(),
  areasForImprovement: z.string().optional(),
  managerComments: z.string().optional(),
  employeeSelfAssessment: z.string().optional(),
  employeeComments: z.string().optional(),

  // Status
  status: z.enum(['draft', 'pending_employee_review', 'completed', 'acknowledged']).optional(),
});

export const acknowledgeReviewSchema = z.object({
  reviewId: z.string().uuid(),
  employeeComments: z.string().optional(),
});

// =====================================================
// TIME_ATTENDANCE
// =====================================================

export const submitTimesheetSchema = z.object({
  employeeId: z.string().uuid(),
  date: z.coerce.date(),

  // Hours
  regularHours: z.number().min(0).max(24).default(0),
  overtimeHours: z.number().min(0).max(24).default(0),
  ptoHours: z.number().min(0).max(24).default(0),
  sickHours: z.number().min(0).max(24).default(0),
  holidayHours: z.number().min(0).max(24).default(0),

  // Notes
  notes: z.string().optional(),
});

export const updateTimesheetSchema = submitTimesheetSchema.partial().extend({
  id: z.string().uuid(),
  status: z.enum(['draft', 'submitted', 'approved', 'rejected']).optional(),
});

export const approveTimesheetSchema = z.object({
  timesheetId: z.string().uuid(),
  approve: z.boolean(),
  rejectionReason: z.string().optional(),
});

// =====================================================
// PTO_BALANCES
// =====================================================

export const initializePtoBalanceSchema = z.object({
  employeeId: z.string().uuid(),
  year: z.number().int().min(2020).max(2100),
  annualAccrualDays: z.number().min(0).max(365).default(15),
  accrualRatePerPayPeriod: z.number().min(0).optional(),
});

export const updatePtoBalanceSchema = z.object({
  employeeId: z.string().uuid(),
  year: z.number().int().min(2020).max(2100),
  totalAccrued: z.number().min(0).optional(),
  totalUsed: z.number().min(0).optional(),
  totalPending: z.number().min(0).optional(),
});

// =====================================================
// Type Exports
// =====================================================

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;

export type AddCampaignContactInput = z.infer<typeof addCampaignContactSchema>;
export type UpdateCampaignContactInput = z.infer<typeof updateCampaignContactSchema>;

export type TrackEngagementInput = z.infer<typeof trackEngagementSchema>;

export type CreateEmployeeMetadataInput = z.infer<typeof createEmployeeMetadataSchema>;
export type UpdateEmployeeMetadataInput = z.infer<typeof updateEmployeeMetadataSchema>;

export type CreatePodInput = z.infer<typeof createPodSchema>;
export type UpdatePodInput = z.infer<typeof updatePodSchema>;
export type StartNewSprintInput = z.infer<typeof startNewSprintSchema>;

export type CreatePayrollRunInput = z.infer<typeof createPayrollRunSchema>;
export type UpdatePayrollRunInput = z.infer<typeof updatePayrollRunSchema>;
export type ApprovePayrollRunInput = z.infer<typeof approvePayrollRunSchema>;

export type AddPayrollItemInput = z.infer<typeof addPayrollItemSchema>;
export type UpdatePayrollItemInput = z.infer<typeof updatePayrollItemSchema>;

export type CreatePerformanceReviewInput = z.infer<typeof createPerformanceReviewSchema>;
export type UpdatePerformanceReviewInput = z.infer<typeof updatePerformanceReviewSchema>;
export type AcknowledgeReviewInput = z.infer<typeof acknowledgeReviewSchema>;

export type SubmitTimesheetInput = z.infer<typeof submitTimesheetSchema>;
export type UpdateTimesheetInput = z.infer<typeof updateTimesheetSchema>;
export type ApproveTimesheetInput = z.infer<typeof approveTimesheetSchema>;

export type InitializePtoBalanceInput = z.infer<typeof initializePtoBalanceSchema>;
export type UpdatePtoBalanceInput = z.infer<typeof updatePtoBalanceSchema>;
