/**
 * Drizzle ORM Schema: HR (Human Resources) Module
 * Tables: employees, employee_profiles, employee_documents, employee_onboarding, onboarding_tasks,
 *         employee_time_off, benefit_plans, benefit_plan_options, employee_benefits, benefit_dependents,
 *         compliance_requirements, employee_compliance, i9_records, performance_goals, performance_feedback
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  integer,
  boolean,
  date,
  jsonb,
  pgEnum,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userProfiles } from './user-profiles';
import { organizations } from './organizations';

// =====================================================
// ENUMS
// =====================================================

export const employmentStatusEnum = pgEnum('employment_status', [
  'onboarding',
  'active',
  'on_leave',
  'terminated',
]);

export const employmentTypeEnum = pgEnum('employment_type', [
  'fte',
  'contractor',
  'intern',
  'part_time',
]);

export const salaryTypeEnum = pgEnum('salary_type', ['hourly', 'annual']);

export const workModeEnum = pgEnum('work_mode', ['on_site', 'remote', 'hybrid']);

export const documentTypeEnum = pgEnum('document_type', [
  'offer_letter',
  'contract',
  'i9',
  'w4',
  'tax_form',
  'nda',
  'handbook_ack',
  'performance_review',
  'termination',
  'other',
]);

export const documentStatusEnum = pgEnum('document_status', ['pending', 'approved', 'expired', 'rejected']);

export const onboardingStatusEnum = pgEnum('onboarding_status', [
  'not_started',
  'in_progress',
  'completed',
  'cancelled',
]);

export const taskStatusEnum = pgEnum('task_status', ['pending', 'completed', 'skipped']);

export const taskCategoryEnum = pgEnum('task_category', [
  'paperwork',
  'it_setup',
  'training',
  'orientation',
  'other',
]);

export const timeOffTypeEnum = pgEnum('time_off_type', [
  'pto',
  'sick',
  'personal',
  'bereavement',
  'jury_duty',
  'parental',
  'unpaid',
]);

export const timeOffStatusEnum = pgEnum('time_off_status', ['pending', 'approved', 'denied', 'cancelled']);

export const benefitTypeEnum = pgEnum('benefit_type', [
  'health',
  'dental',
  'vision',
  '401k',
  'life',
  'disability',
  'hsa',
  'fsa',
]);

export const coverageLevelEnum = pgEnum('coverage_level', [
  'employee',
  'employee_spouse',
  'employee_children',
  'family',
]);

export const benefitStatusEnum = pgEnum('benefit_status', ['pending', 'active', 'terminated']);

export const relationshipEnum = pgEnum('relationship', [
  'spouse',
  'child',
  'domestic_partner',
  'other',
]);

export const complianceTypeEnum = pgEnum('compliance_type', ['federal', 'state', 'local']);

export const complianceFrequencyEnum = pgEnum('compliance_frequency', [
  'once',
  'annual',
  'quarterly',
  'monthly',
]);

export const complianceAppliesToEnum = pgEnum('compliance_applies_to', ['all', 'fte', 'contractor']);

export const complianceStatusEnum = pgEnum('compliance_status', [
  'pending',
  'completed',
  'overdue',
  'exempt',
]);

export const i9StatusEnum = pgEnum('i9_status', ['pending', 'section1_complete', 'completed', 'expired']);

export const performanceGoalCategoryEnum = pgEnum('performance_goal_category', [
  'business',
  'development',
  'behavioral',
]);

export const goalStatusEnum = pgEnum('goal_status', [
  'not_started',
  'in_progress',
  'completed',
  'cancelled',
]);

export const feedbackTypeEnum = pgEnum('feedback_type', ['strength', 'improvement', 'comment']);

// =====================================================
// EMPLOYEES
// =====================================================

export const employees = pgTable('employees', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),

  // Link to user profile
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => userProfiles.id, { onDelete: 'cascade' }),

  // Employee identification
  employeeNumber: text('employee_number').unique(),

  // Employment status
  status: employmentStatusEnum('status').notNull().default('onboarding'),
  employmentType: employmentTypeEnum('employment_type').notNull().default('fte'),

  // Employment dates
  hireDate: date('hire_date').notNull(),
  terminationDate: date('termination_date'),
  terminationReason: text('termination_reason'),

  // Organization structure
  department: text('department'),
  jobTitle: text('job_title'),
  managerId: uuid('manager_id').references((): any => employees.id),
  location: text('location'),
  workMode: workModeEnum('work_mode').default('on_site'),

  // Compensation
  salaryType: salaryTypeEnum('salary_type').notNull().default('annual'),
  salaryAmount: numeric('salary_amount', { precision: 12, scale: 2 }),
  currency: text('currency').default('USD'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
  updatedBy: uuid('updated_by').references(() => userProfiles.id),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const employeesRelations = relations(employees, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [employees.orgId],
    references: [organizations.id],
  }),
  user: one(userProfiles, {
    fields: [employees.userId],
    references: [userProfiles.id],
  }),
  manager: one(employees, {
    fields: [employees.managerId],
    references: [employees.id],
  }),
  creator: one(userProfiles, {
    fields: [employees.createdBy],
    references: [userProfiles.id],
  }),
  updater: one(userProfiles, {
    fields: [employees.updatedBy],
    references: [userProfiles.id],
  }),
  // One-to-one
  profile: one(employeeProfiles),
  // One-to-many
  documents: many(employeeDocuments),
  onboarding: many(employeeOnboarding),
  timeOffRequests: many(employeeTimeOff),
  benefits: many(employeeBenefits),
  compliance: many(employeeCompliance),
  i9Records: many(i9Records),
  performanceGoals: many(performanceGoals),
}));

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;

// =====================================================
// EMPLOYEE_PROFILES
// =====================================================

export const employeeProfiles = pgTable('employee_profiles', {
  employeeId: uuid('employee_id')
    .primaryKey()
    .references(() => employees.id, { onDelete: 'cascade' }),

  // Personal information
  dateOfBirth: date('date_of_birth'),
  ssnEncrypted: text('ssn_encrypted'),

  // Address
  addressStreet: text('address_street'),
  addressCity: text('address_city'),
  addressState: text('address_state'),
  addressCountry: text('address_country').default('USA'),
  addressPostal: text('address_postal'),

  // Emergency contact
  emergencyContactName: text('emergency_contact_name'),
  emergencyContactPhone: text('emergency_contact_phone'),
  emergencyContactRelationship: text('emergency_contact_relationship'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const employeeProfilesRelations = relations(employeeProfiles, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeProfiles.employeeId],
    references: [employees.id],
  }),
}));

export type EmployeeProfile = typeof employeeProfiles.$inferSelect;
export type NewEmployeeProfile = typeof employeeProfiles.$inferInsert;

// =====================================================
// EMPLOYEE_DOCUMENTS
// =====================================================

export const employeeDocuments = pgTable('employee_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeId: uuid('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),

  // Document details
  documentType: documentTypeEnum('document_type').notNull(),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),

  // Dates
  issueDate: date('issue_date'),
  expiryDate: date('expiry_date'),

  // Status
  status: documentStatusEnum('status').notNull().default('pending'),

  // Verification
  verifiedBy: uuid('verified_by').references(() => userProfiles.id),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),

  // Notes
  notes: text('notes'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

export const employeeDocumentsRelations = relations(employeeDocuments, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeDocuments.employeeId],
    references: [employees.id],
  }),
  verifier: one(userProfiles, {
    fields: [employeeDocuments.verifiedBy],
    references: [userProfiles.id],
  }),
  creator: one(userProfiles, {
    fields: [employeeDocuments.createdBy],
    references: [userProfiles.id],
  }),
}));

export type EmployeeDocument = typeof employeeDocuments.$inferSelect;
export type NewEmployeeDocument = typeof employeeDocuments.$inferInsert;

// =====================================================
// EMPLOYEE_ONBOARDING
// =====================================================

export const employeeOnboarding = pgTable('employee_onboarding', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeId: uuid('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),

  // Checklist template
  checklistTemplateId: uuid('checklist_template_id'),

  // Status
  status: onboardingStatusEnum('status').notNull().default('not_started'),

  // Dates
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),

  // Assignment
  assignedTo: uuid('assigned_to').references(() => userProfiles.id),

  // Notes
  notes: text('notes'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

export const employeeOnboardingRelations = relations(employeeOnboarding, ({ one, many }) => ({
  employee: one(employees, {
    fields: [employeeOnboarding.employeeId],
    references: [employees.id],
  }),
  assignedUser: one(userProfiles, {
    fields: [employeeOnboarding.assignedTo],
    references: [userProfiles.id],
  }),
  creator: one(userProfiles, {
    fields: [employeeOnboarding.createdBy],
    references: [userProfiles.id],
  }),
  tasks: many(onboardingTasks),
}));

export type EmployeeOnboarding = typeof employeeOnboarding.$inferSelect;
export type NewEmployeeOnboarding = typeof employeeOnboarding.$inferInsert;

// =====================================================
// ONBOARDING_TASKS
// =====================================================

export const onboardingTasks = pgTable('onboarding_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  onboardingId: uuid('onboarding_id')
    .notNull()
    .references(() => employeeOnboarding.id, { onDelete: 'cascade' }),

  // Task details
  taskName: text('task_name').notNull(),
  category: taskCategoryEnum('category').notNull().default('other'),
  description: text('description'),

  // Requirements
  isRequired: boolean('is_required').default(true),
  dueDaysFromStart: integer('due_days_from_start'),

  // Status
  status: taskStatusEnum('status').notNull().default('pending'),

  // Completion
  completedAt: timestamp('completed_at', { withTimezone: true }),
  completedBy: uuid('completed_by').references(() => userProfiles.id),
  notes: text('notes'),

  // Order
  sortOrder: integer('sort_order').notNull().default(0),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const onboardingTasksRelations = relations(onboardingTasks, ({ one }) => ({
  onboarding: one(employeeOnboarding, {
    fields: [onboardingTasks.onboardingId],
    references: [employeeOnboarding.id],
  }),
  completedByUser: one(userProfiles, {
    fields: [onboardingTasks.completedBy],
    references: [userProfiles.id],
  }),
}));

export type OnboardingTask = typeof onboardingTasks.$inferSelect;
export type NewOnboardingTask = typeof onboardingTasks.$inferInsert;

// =====================================================
// EMPLOYEE_TIME_OFF
// =====================================================

export const employeeTimeOff = pgTable('employee_time_off', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeId: uuid('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),

  // Time off details
  type: timeOffTypeEnum('type').notNull(),
  status: timeOffStatusEnum('status').notNull().default('pending'),

  // Dates
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  hours: numeric('hours', { precision: 5, scale: 2 }).notNull(),

  // Reason
  reason: text('reason'),

  // Approval
  approvedBy: uuid('approved_by').references(() => userProfiles.id),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  denialReason: text('denial_reason'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

export const employeeTimeOffRelations = relations(employeeTimeOff, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeTimeOff.employeeId],
    references: [employees.id],
  }),
  approver: one(userProfiles, {
    fields: [employeeTimeOff.approvedBy],
    references: [userProfiles.id],
  }),
  creator: one(userProfiles, {
    fields: [employeeTimeOff.createdBy],
    references: [userProfiles.id],
  }),
}));

export type EmployeeTimeOff = typeof employeeTimeOff.$inferSelect;
export type NewEmployeeTimeOff = typeof employeeTimeOff.$inferInsert;

// =====================================================
// BENEFIT_PLANS
// =====================================================

export const benefitPlans = pgTable('benefit_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),

  // Plan details
  name: text('name').notNull(),
  type: benefitTypeEnum('type').notNull(),
  provider: text('provider'),

  // Status
  status: text('status').notNull().default('active'),

  // Dates
  effectiveDate: date('effective_date'),
  terminationDate: date('termination_date'),

  // Description
  description: text('description'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

export const benefitPlansRelations = relations(benefitPlans, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [benefitPlans.orgId],
    references: [organizations.id],
  }),
  creator: one(userProfiles, {
    fields: [benefitPlans.createdBy],
    references: [userProfiles.id],
  }),
  options: many(benefitPlanOptions),
}));

export type BenefitPlan = typeof benefitPlans.$inferSelect;
export type NewBenefitPlan = typeof benefitPlans.$inferInsert;

// =====================================================
// BENEFIT_PLAN_OPTIONS
// =====================================================

export const benefitPlanOptions = pgTable('benefit_plan_options', {
  id: uuid('id').primaryKey().defaultRandom(),
  planId: uuid('plan_id')
    .notNull()
    .references(() => benefitPlans.id, { onDelete: 'cascade' }),

  // Option details
  optionName: text('option_name').notNull(),
  coverageLevel: coverageLevelEnum('coverage_level').notNull(),

  // Costs
  employerContribution: numeric('employer_contribution', { precision: 10, scale: 2 }),
  employeeContribution: numeric('employee_contribution', { precision: 10, scale: 2 }),

  // Description
  description: text('description'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const benefitPlanOptionsRelations = relations(benefitPlanOptions, ({ one, many }) => ({
  plan: one(benefitPlans, {
    fields: [benefitPlanOptions.planId],
    references: [benefitPlans.id],
  }),
  enrollments: many(employeeBenefits),
}));

export type BenefitPlanOption = typeof benefitPlanOptions.$inferSelect;
export type NewBenefitPlanOption = typeof benefitPlanOptions.$inferInsert;

// =====================================================
// EMPLOYEE_BENEFITS
// =====================================================

export const employeeBenefits = pgTable('employee_benefits', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeId: uuid('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),
  planOptionId: uuid('plan_option_id')
    .notNull()
    .references(() => benefitPlanOptions.id),

  // Status
  status: benefitStatusEnum('status').notNull().default('pending'),

  // Dates
  enrollmentDate: date('enrollment_date'),
  coverageStart: date('coverage_start'),
  coverageEnd: date('coverage_end'),

  // Dependents
  dependentsCount: integer('dependents_count').default(0),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

export const employeeBenefitsRelations = relations(employeeBenefits, ({ one, many }) => ({
  employee: one(employees, {
    fields: [employeeBenefits.employeeId],
    references: [employees.id],
  }),
  planOption: one(benefitPlanOptions, {
    fields: [employeeBenefits.planOptionId],
    references: [benefitPlanOptions.id],
  }),
  creator: one(userProfiles, {
    fields: [employeeBenefits.createdBy],
    references: [userProfiles.id],
  }),
  dependents: many(benefitDependents),
}));

export type EmployeeBenefit = typeof employeeBenefits.$inferSelect;
export type NewEmployeeBenefit = typeof employeeBenefits.$inferInsert;

// =====================================================
// BENEFIT_DEPENDENTS
// =====================================================

export const benefitDependents = pgTable('benefit_dependents', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeBenefitId: uuid('employee_benefit_id')
    .notNull()
    .references(() => employeeBenefits.id, { onDelete: 'cascade' }),

  // Dependent information
  name: text('name').notNull(),
  relationship: relationshipEnum('relationship').notNull(),
  dateOfBirth: date('date_of_birth'),
  ssnEncrypted: text('ssn_encrypted'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const benefitDependentsRelations = relations(benefitDependents, ({ one }) => ({
  employeeBenefit: one(employeeBenefits, {
    fields: [benefitDependents.employeeBenefitId],
    references: [employeeBenefits.id],
  }),
}));

export type BenefitDependent = typeof benefitDependents.$inferSelect;
export type NewBenefitDependent = typeof benefitDependents.$inferInsert;

// =====================================================
// COMPLIANCE_REQUIREMENTS
// =====================================================

export const complianceRequirements = pgTable('compliance_requirements', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),

  // Requirement details
  name: text('name').notNull(),
  type: complianceTypeEnum('type').notNull(),
  jurisdiction: text('jurisdiction'),

  // Applicability
  appliesTo: complianceAppliesToEnum('applies_to').notNull().default('all'),
  frequency: complianceFrequencyEnum('frequency').notNull(),

  // Details
  description: text('description'),
  documentTemplateUrl: text('document_template_url'),

  // Status
  isActive: boolean('is_active').default(true),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

export const complianceRequirementsRelations = relations(complianceRequirements, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [complianceRequirements.orgId],
    references: [organizations.id],
  }),
  creator: one(userProfiles, {
    fields: [complianceRequirements.createdBy],
    references: [userProfiles.id],
  }),
  employeeCompliance: many(employeeCompliance),
}));

export type ComplianceRequirement = typeof complianceRequirements.$inferSelect;
export type NewComplianceRequirement = typeof complianceRequirements.$inferInsert;

// =====================================================
// EMPLOYEE_COMPLIANCE
// =====================================================

export const employeeCompliance = pgTable('employee_compliance', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeId: uuid('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),
  requirementId: uuid('requirement_id')
    .notNull()
    .references(() => complianceRequirements.id),

  // Status
  status: complianceStatusEnum('status').notNull().default('pending'),

  // Dates
  dueDate: date('due_date'),
  completedAt: timestamp('completed_at', { withTimezone: true }),

  // Document
  documentUrl: text('document_url'),

  // Notes
  notes: text('notes'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const employeeComplianceRelations = relations(employeeCompliance, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeCompliance.employeeId],
    references: [employees.id],
  }),
  requirement: one(complianceRequirements, {
    fields: [employeeCompliance.requirementId],
    references: [complianceRequirements.id],
  }),
}));

export type EmployeeCompliance = typeof employeeCompliance.$inferSelect;
export type NewEmployeeCompliance = typeof employeeCompliance.$inferInsert;

// =====================================================
// I9_RECORDS
// =====================================================

export const i9Records = pgTable('i9_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeId: uuid('employee_id')
    .notNull()
    .unique()
    .references(() => employees.id, { onDelete: 'cascade' }),

  // Section 1 (Employee)
  section1CompletedAt: timestamp('section1_completed_at', { withTimezone: true }),

  // Section 2 (Employer)
  section2CompletedAt: timestamp('section2_completed_at', { withTimezone: true }),

  // List A (Identity and Employment Authorization)
  listADocument: text('list_a_document'),

  // List B (Identity)
  listBDocument: text('list_b_document'),

  // List C (Employment Authorization)
  listCDocument: text('list_c_document'),

  // Authorized representative
  authorizedRepName: text('authorized_rep_name'),
  authorizedRepTitle: text('authorized_rep_title'),

  // Reverification
  reverificationDate: date('reverification_date'),

  // Status
  status: i9StatusEnum('status').notNull().default('pending'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

export const i9RecordsRelations = relations(i9Records, ({ one }) => ({
  employee: one(employees, {
    fields: [i9Records.employeeId],
    references: [employees.id],
  }),
  creator: one(userProfiles, {
    fields: [i9Records.createdBy],
    references: [userProfiles.id],
  }),
}));

export type I9Record = typeof i9Records.$inferSelect;
export type NewI9Record = typeof i9Records.$inferInsert;

// =====================================================
// PERFORMANCE_GOALS
// =====================================================

export const performanceGoals = pgTable('performance_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeId: uuid('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),

  // Review linkage (optional - goals can exist outside reviews)
  reviewId: uuid('review_id'),

  // Goal details
  goal: text('goal').notNull(),
  category: performanceGoalCategoryEnum('category').notNull(),
  weightPercent: integer('weight_percent'),

  // Status
  status: goalStatusEnum('status').notNull().default('not_started'),

  // Rating (1-5)
  rating: integer('rating'),

  // Comments
  comments: text('comments'),

  // Dates
  startDate: date('start_date'),
  targetDate: date('target_date'),
  completedAt: timestamp('completed_at', { withTimezone: true }),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

export const performanceGoalsRelations = relations(performanceGoals, ({ one }) => ({
  employee: one(employees, {
    fields: [performanceGoals.employeeId],
    references: [employees.id],
  }),
  creator: one(userProfiles, {
    fields: [performanceGoals.createdBy],
    references: [userProfiles.id],
  }),
}));

export type PerformanceGoal = typeof performanceGoals.$inferSelect;
export type NewPerformanceGoal = typeof performanceGoals.$inferInsert;

// =====================================================
// PERFORMANCE_FEEDBACK
// =====================================================

export const performanceFeedback = pgTable('performance_feedback', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Review linkage
  reviewId: uuid('review_id').notNull(),

  // Feedback details
  feedbackType: feedbackTypeEnum('feedback_type').notNull(),
  content: text('content').notNull(),
  category: text('category'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

export const performanceFeedbackRelations = relations(performanceFeedback, ({ one }) => ({
  creator: one(userProfiles, {
    fields: [performanceFeedback.createdBy],
    references: [userProfiles.id],
  }),
}));

export type PerformanceFeedback = typeof performanceFeedback.$inferSelect;
export type NewPerformanceFeedback = typeof performanceFeedback.$inferInsert;
