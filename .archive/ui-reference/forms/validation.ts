/**
 * Form Validation Schemas using Zod
 * Reusable validation schemas for all form types
 */

import { z } from 'zod';

// ============================================
// Common Field Validators
// ============================================

export const requiredString = z.string().min(1, 'This field is required');
export const optionalString = z.string().optional();

export const requiredEmail = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const optionalEmail = z
  .string()
  .email('Please enter a valid email address')
  .optional()
  .or(z.literal(''));

export const phoneSchema = z
  .string()
  .regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Phone must be in format (555) 555-5555')
  .optional()
  .or(z.literal(''));

export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .optional()
  .or(z.literal(''));

export const ssnSchema = z
  .string()
  .regex(/^\d{3}-\d{2}-\d{4}$/, 'SSN must be in format XXX-XX-XXXX')
  .optional()
  .or(z.literal(''));

export const einSchema = z
  .string()
  .regex(/^\d{2}-\d{7}$/, 'EIN must be in format XX-XXXXXXX')
  .optional()
  .or(z.literal(''));

export const positiveNumber = z
  .number()
  .min(0, 'Must be a positive number')
  .optional();

export const percentageSchema = z
  .number()
  .min(0, 'Percentage must be between 0 and 100')
  .max(100, 'Percentage must be between 0 and 100')
  .optional();

export const currencySchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Please enter a valid currency amount')
  .optional()
  .or(z.literal(''));

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date')
  .optional()
  .or(z.literal(''));

export const dateTimeSchema = z.string().datetime().optional().or(z.literal(''));

export const tagsSchema = z.array(z.string()).optional();

// ============================================
// Address Schema
// ============================================

export const addressSchema = z.object({
  street: optionalString,
  street2: optionalString,
  city: optionalString,
  state: optionalString,
  postalCode: optionalString,
  country: optionalString,
});

// ============================================
// Contact Schema (Person)
// ============================================

export const contactSchema = z.object({
  firstName: requiredString,
  lastName: requiredString,
  email: requiredEmail,
  phone: phoneSchema,
  mobile: phoneSchema,
  title: optionalString,
  department: optionalString,
  linkedinUrl: urlSchema,
  preferredContactMethod: z
    .enum(['email', 'phone', 'mobile', 'linkedin', 'text'])
    .default('email'),
});

// ============================================
// Job Form Schema
// ============================================

export const jobFormSchema = z.object({
  // Basic Info
  title: requiredString,
  description: optionalString,
  accountId: z.string().uuid('Please select an account').optional(),

  // Classification
  status: z.enum([
    'draft', 'open', 'on_hold', 'filled', 'cancelled'
  ]).default('draft'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  jobType: z.enum([
    'full_time', 'part_time', 'contract', 'contract_to_hire', 'temp'
  ]).default('full_time'),

  // Location
  location: optionalString,
  workMode: z.enum(['remote', 'hybrid', 'onsite']).default('onsite'),

  // Compensation
  rateType: z.enum(['hourly', 'daily', 'monthly', 'annual']).default('hourly'),
  rateMin: currencySchema,
  rateMax: currencySchema,
  currency: z.string().default('USD'),

  // Requirements
  requiredSkills: tagsSchema,
  preferredSkills: tagsSchema,
  experienceMin: positiveNumber,
  experienceMax: positiveNumber,
  educationLevel: optionalString,
  visaTypes: z.array(z.string()).optional(),

  // Positions
  positions: z.number().min(1, 'At least 1 position required').default(1),

  // Timeline
  startDate: dateSchema,
  endDate: dateSchema,
  durationMonths: positiveNumber,

  // Internal
  recruiterId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  notes: optionalString,
});

export type JobFormValues = z.infer<typeof jobFormSchema>;

// ============================================
// Candidate Form Schema
// ============================================

export const candidateFormSchema = z.object({
  // Personal Info
  firstName: requiredString,
  lastName: requiredString,
  email: requiredEmail,
  phone: phoneSchema,
  mobile: phoneSchema,
  linkedinUrl: urlSchema,

  // Professional Info
  title: optionalString,
  currentEmployer: optionalString,
  experienceYears: positiveNumber,

  // Work Authorization
  visaType: optionalString,
  visaExpiryDate: dateSchema,
  workAuthStatus: z.enum(['valid', 'expiring', 'expired', 'pending']).optional(),

  // Location
  location: optionalString,
  willingToRelocate: z.boolean().default(false),
  preferredLocations: tagsSchema,
  workModePreference: z.enum(['remote', 'hybrid', 'onsite']).optional(),

  // Compensation
  currentSalary: currencySchema,
  expectedSalary: currencySchema,
  salaryType: z.enum(['hourly', 'annual']).default('annual'),
  currency: z.string().default('USD'),

  // Skills
  skills: tagsSchema,
  certifications: tagsSchema,

  // Documents
  resumeUrl: urlSchema,

  // Source
  source: z.enum([
    'linkedin', 'referral', 'job_board', 'website', 'agency', 'other'
  ]).optional(),
  sourceDetail: optionalString,

  // Notes
  notes: optionalString,
});

export type CandidateFormValues = z.infer<typeof candidateFormSchema>;

// ============================================
// Submission Form Schema
// ============================================

export const submissionFormSchema = z.object({
  jobId: z.string().uuid('Please select a job'),
  candidateId: z.string().uuid('Please select a candidate'),

  // Rate
  submittedRate: currencySchema,
  rateType: z.enum(['hourly', 'daily', 'monthly', 'annual']).default('hourly'),

  // Availability
  availableFrom: dateSchema,
  noticePeriod: optionalString,

  // Documents
  resumeVersion: optionalString,

  // Notes
  clientNotes: optionalString,
  internalNotes: optionalString,

  // Marketing
  pitch: optionalString,
});

export type SubmissionFormValues = z.infer<typeof submissionFormSchema>;

// ============================================
// Vendor Form Schema
// ============================================

export const vendorFormSchema = z.object({
  // Company Info
  name: requiredString,
  legalName: optionalString,
  website: urlSchema,
  type: z.enum([
    'direct_client', 'prime_vendor', 'sub_vendor', 'msp', 'vms'
  ]).default('prime_vendor'),
  tier: z.enum(['preferred', 'standard', 'new']).default('standard'),

  // Details
  yearFounded: positiveNumber,
  consultantPoolSize: positiveNumber,
  industryFocus: tagsSchema,
  geographicFocus: tagsSchema,

  // Address
  address: addressSchema,
  phone: phoneSchema,
  email: optionalEmail,

  // Primary Contact
  primaryContact: contactSchema.optional(),

  // Notes
  notes: optionalString,
});

export type VendorFormValues = z.infer<typeof vendorFormSchema>;

// ============================================
// Vendor Agreement Terms Schema
// ============================================

export const vendorAgreementSchema = z.object({
  // Agreement Type
  agreementType: z.enum([
    'prime_vendor', 'subcontractor', 'co_marketing'
  ]).default('subcontractor'),

  // Commission Structure
  commissionType: z.enum([
    'fixed_percentage', 'tiered_percentage', 'fixed_dollar', 'custom'
  ]).default('fixed_percentage'),

  // Fixed Percentage
  fixedPercentage: percentageSchema,

  // Tiered
  tiers: z.array(z.object({
    minPlacements: z.number().min(0),
    maxPlacements: z.number().optional(),
    percentage: percentageSchema,
  })).optional(),

  // Payment Terms
  invoiceFrequency: z.enum(['weekly', 'biweekly', 'monthly']).default('monthly'),
  paymentTermsDays: z.number().min(0).max(90).default(30),
  paymentMethod: z.enum(['ach', 'check', 'wire']).default('ach'),

  // Volume Commitment
  minPlacementsPerQuarter: positiveNumber,

  // Exclusivity
  exclusivityType: z.enum([
    'none', 'first_right_of_refusal', 'exclusive'
  ]).default('none'),
  exclusivityDurationHours: positiveNumber,
  exclusivityScope: optionalString,

  // Contract Duration
  effectiveDate: dateSchema,
  termMonths: z.number().min(1).max(60).default(12),
  autoRenew: z.boolean().default(true),
  terminationNoticeDays: z.number().min(0).max(90).default(30),

  // Non-Compete
  nonCompeteDurationMonths: z.number().min(0).max(24).default(6),
  nonCompeteScope: optionalString,
});

export type VendorAgreementValues = z.infer<typeof vendorAgreementSchema>;

// ============================================
// Hotlist Form Schema
// ============================================

export const hotlistFormSchema = z.object({
  name: requiredString,
  description: optionalString,
  purpose: z.enum([
    'general', 'client_specific', 'skill_specific'
  ]).default('general'),
  clientId: z.string().uuid().optional(),
});

export type HotlistFormValues = z.infer<typeof hotlistFormSchema>;

// ============================================
// Lead Form Schema
// ============================================

export const leadFormSchema = z.object({
  // Lead Type
  leadType: z.enum(['company', 'person']).default('company'),

  // Company Fields
  companyName: optionalString,
  industry: optionalString,
  companyType: z.enum([
    'direct_client', 'implementation_partner', 'msp_vms', 'system_integrator'
  ]).optional(),
  companySize: z.enum(['small', 'medium', 'large', 'enterprise']).optional(),
  website: urlSchema,
  headquarters: optionalString,
  tier: z.enum(['enterprise', 'mid_market', 'smb', 'strategic']).optional(),

  // Contact Fields
  firstName: optionalString,
  lastName: optionalString,
  title: optionalString,
  email: optionalEmail,
  phone: phoneSchema,
  linkedinUrl: urlSchema,
  decisionAuthority: z.enum([
    'decision_maker', 'influencer', 'gatekeeper', 'end_user', 'champion'
  ]).optional(),

  // Lead Status
  status: z.enum([
    'new', 'warm', 'hot', 'cold', 'converted', 'lost'
  ]).default('new'),
  estimatedValue: currencySchema,

  // Source
  source: z.enum([
    'linkedin', 'referral', 'cold_outreach', 'inbound', 'event', 'partner', 'ad_campaign', 'other'
  ]).optional(),

  // BANT Qualification
  bantBudget: z.number().min(0).max(25).default(0),
  bantAuthority: z.number().min(0).max(25).default(0),
  bantNeed: z.number().min(0).max(25).default(0),
  bantTimeline: z.number().min(0).max(25).default(0),
  bantBudgetNotes: optionalString,
  bantAuthorityNotes: optionalString,
  bantNeedNotes: optionalString,
  bantTimelineNotes: optionalString,

  // Notes
  notes: optionalString,
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

// ============================================
// Deal Form Schema
// ============================================

export const dealFormSchema = z.object({
  // Basic Info
  title: requiredString,
  description: optionalString,
  dealType: z.enum([
    'new_business', 'expansion', 'renewal', 'upsell'
  ]).default('new_business'),

  // Association
  leadId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),

  // Value
  value: z.string().min(1, 'Deal value is required'),
  currency: z.string().default('USD'),

  // Pipeline Stage
  stage: z.enum([
    'discovery', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'
  ]).default('discovery'),
  probability: percentageSchema,

  // Timeline
  expectedCloseDate: dateSchema,

  // Outcome
  closeReason: optionalString,
  lossReason: optionalString,
  competitorWon: optionalString,

  // Notes
  notes: optionalString,
});

export type DealFormValues = z.infer<typeof dealFormSchema>;

// ============================================
// Account Form Schema
// ============================================

export const accountFormSchema = z.object({
  // Core Info
  name: requiredString,
  legalName: optionalString,
  industry: optionalString,
  companyType: z.enum([
    'direct_client', 'implementation_partner', 'msp_vms', 'system_integrator'
  ]).default('direct_client'),
  status: z.enum([
    'prospect', 'active', 'inactive', 'churned'
  ]).default('prospect'),
  tier: z.enum(['strategic', 'growth', 'standard']).optional(),

  // Business Info
  website: urlSchema,
  phone: phoneSchema,
  headquartersLocation: optionalString,
  foundedYear: positiveNumber,
  employeeCount: positiveNumber,
  annualRevenue: currencySchema,
  description: optionalString,

  // Business Terms
  paymentTermsDays: z.number().min(0).max(90).default(30),
  markupPercentage: percentageSchema,
  annualRevenueTarget: currencySchema,
});

export type AccountFormValues = z.infer<typeof accountFormSchema>;

// ============================================
// Employee Onboarding Form Schema
// ============================================

export const employeeOnboardingSchema = z.object({
  // Step 1: Basic Info
  basicInfo: z.object({
    firstName: requiredString,
    lastName: requiredString,
    email: requiredEmail,
    phone: phoneSchema,
    dateOfBirth: dateSchema,
    ssnEncrypted: ssnSchema,
    address: addressSchema,
    emergencyContact: z.object({
      name: requiredString,
      phone: phoneSchema,
      relationship: optionalString,
    }),
  }),

  // Step 2: Employment Details
  employmentDetails: z.object({
    jobTitle: requiredString,
    department: optionalString,
    managerId: z.string().uuid().optional(),
    startDate: dateSchema,
    employmentType: z.enum(['fte', 'contractor', 'intern', 'part_time']).default('fte'),
    workLocation: optionalString,
    workMode: z.enum(['on_site', 'remote', 'hybrid']).default('on_site'),
  }),

  // Step 3: I-9 Section 1 (Employee)
  i9Section1: z.object({
    completed: z.boolean().default(false),
    completedAt: dateTimeSchema,
  }),

  // Step 4: Tax Forms
  taxForms: z.object({
    w4Completed: z.boolean().default(false),
    stateFormsCompleted: z.boolean().default(false),
  }),

  // Step 5: Payroll
  payroll: z.object({
    salaryType: z.enum(['hourly', 'annual']).default('annual'),
    salaryAmount: currencySchema,
    payFrequency: z.enum([
      'weekly', 'biweekly', 'semimonthly', 'monthly'
    ]).default('biweekly'),
    directDeposit: z.object({
      bankName: optionalString,
      accountType: z.enum(['checking', 'savings']).optional(),
      routingNumber: optionalString,
      accountNumber: optionalString,
    }).optional(),
  }),

  // Step 6: Background Check
  backgroundCheck: z.object({
    checkrOrderId: optionalString,
    status: z.enum([
      'not_started', 'pending', 'clear', 'consider', 'failed'
    ]).default('not_started'),
  }),

  // Step 7: IT Equipment
  itEquipment: z.object({
    laptop: z.enum([
      'macbook_pro', 'macbook_air', 'dell_xps', 'thinkpad', 'other', 'none'
    ]).optional(),
    monitor: z.boolean().default(false),
    keyboard: z.boolean().default(false),
    mouse: z.boolean().default(false),
    headset: z.boolean().default(false),
    specialRequests: optionalString,
  }),
});

export type EmployeeOnboardingValues = z.infer<typeof employeeOnboardingSchema>;

// ============================================
// Immigration Case Form Schema
// ============================================

export const immigrationCaseSchema = z.object({
  // Case Info
  caseType: z.enum([
    'h1b_transfer', 'h1b_extension', 'h1b_amendment',
    'gc_perm', 'gc_i140', 'gc_i485',
    'opt_extension', 'tn_renewal', 'l1_extension'
  ]),
  status: z.enum([
    'not_started', 'in_progress', 'rfe', 'approved', 'denied', 'withdrawn'
  ]).default('not_started'),

  // Priority Date (for GC)
  priorityDate: dateSchema,

  // Receipt
  receiptNumber: optionalString,

  // Attorney
  attorneyId: z.string().uuid().optional(),

  // Dates
  startDate: dateSchema,
  expectedCompletion: dateSchema,

  // Notes
  notes: optionalString,
});

export type ImmigrationCaseValues = z.infer<typeof immigrationCaseSchema>;

// ============================================
// Activity Form Schema
// ============================================

export const activityFormSchema = z.object({
  // Type
  activityType: z.enum([
    'call', 'email', 'meeting', 'note', 'task', 'linkedin', 'event'
  ]),
  direction: z.enum(['inbound', 'outbound']).optional(),

  // Details
  subject: optionalString,
  description: optionalString,
  outcome: optionalString,

  // Scheduling
  scheduledAt: dateTimeSchema,
  durationMinutes: positiveNumber,

  // Follow-up
  nextSteps: optionalString,
  nextFollowUpDate: dateSchema,

  // Priority
  priority: z.enum(['urgent', 'high', 'normal', 'low']).default('normal'),

  // Related Entities
  relatedContactId: z.string().uuid().optional(),
  relatedDealId: z.string().uuid().optional(),
});

export type ActivityFormValues = z.infer<typeof activityFormSchema>;

// ============================================
// RACI Assignment Form Schema
// ============================================

export const raciAssignmentSchema = z.object({
  entityType: z.enum(['job', 'account', 'deal', 'campaign']),
  entityId: z.string().uuid(),

  responsible: z.array(z.string().uuid()).min(1, 'At least one responsible person required'),
  accountable: z.string().uuid('Accountable person is required'),
  consulted: z.array(z.string().uuid()).optional(),
  informed: z.array(z.string().uuid()).optional(),

  notes: optionalString,
});

export type RACIAssignmentValues = z.infer<typeof raciAssignmentSchema>;

// ============================================
// Campaign Form Schema
// ============================================

export const campaignFormSchema = z.object({
  name: requiredString,
  description: optionalString,
  campaignType: z.enum([
    'email', 'linkedin', 'event', 'webinar', 'content', 'outbound_call'
  ]),
  status: z.enum([
    'draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'
  ]).default('draft'),

  // Target Audience
  targetAudience: optionalString,
  targetIndustries: tagsSchema,
  targetTitles: tagsSchema,
  targetCompanySizes: tagsSchema,

  // Schedule
  startDate: dateSchema,
  endDate: dateSchema,

  // Budget
  budget: currencySchema,
  currency: z.string().default('USD'),

  // Goals
  goalLeads: positiveNumber,
  goalResponses: positiveNumber,
  goalMeetings: positiveNumber,

  // Notes
  notes: optionalString,
});

export type CampaignFormValues = z.infer<typeof campaignFormSchema>;

// ============================================
// Placement Form Schema
// ============================================

export const placementFormSchema = z.object({
  // Assignment
  submissionId: z.string().uuid('Please select a submission'),

  // Dates
  startDate: z.string().min(1, 'Start date is required'),
  endDate: dateSchema,

  // Rates
  billRate: z.string().min(1, 'Bill rate is required'),
  payRate: z.string().min(1, 'Pay rate is required'),
  rateType: z.enum(['hourly', 'daily', 'monthly', 'annual']).default('hourly'),
  currency: z.string().default('USD'),

  // Terms
  paymentTermsDays: z.number().min(0).max(90).default(30),

  // Client Info
  clientManagerName: optionalString,
  clientManagerEmail: optionalEmail,
  clientManagerPhone: phoneSchema,

  // Work Details
  workLocation: optionalString,
  workMode: z.enum(['remote', 'hybrid', 'onsite']).default('onsite'),

  // Notes
  notes: optionalString,
});

export type PlacementFormValues = z.infer<typeof placementFormSchema>;
