/**
 * Drizzle ORM Schema: user_profiles
 *
 * Unified user table supporting all role types across 5 business pillars.
 * Maps to SQL migration: 002_create_user_profiles.sql
 *
 * @module schema/user-profiles
 */

import { pgTable, uuid, text, timestamp, numeric, integer, boolean, jsonb, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { organizations } from './organizations';

export const userProfiles = pgTable('user_profiles', {
  // Primary identification
  id: uuid('id').primaryKey().defaultRandom(),
  authId: uuid('auth_id').unique(), // Link to Supabase auth.users

  // Multi-tenancy
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Core fields (ALL users)
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  fullName: text('full_name'), // Populated by trigger from first_name || ' ' || last_name
  avatarUrl: text('avatar_url'),
  phone: text('phone'),
  timezone: text('timezone').default('America/New_York'),
  locale: text('locale').default('en-US'),

  // Student fields (Training Academy)
  studentEnrollmentDate: timestamp('student_enrollment_date', { withTimezone: true }),
  studentCourseId: uuid('student_course_id'), // FK to courses table
  studentCurrentModule: text('student_current_module'),
  studentCourseProgress: jsonb('student_course_progress').$type<Record<string, number>>().default({}),
  studentGraduationDate: timestamp('student_graduation_date', { withTimezone: true }),
  studentCertificates: jsonb('student_certificates').$type<Array<{
    certId: string;
    issuedDate: string;
    url: string;
  }>>().default([]),

  // Employee fields (HR Module)
  employeeHireDate: timestamp('employee_hire_date', { withTimezone: true }),
  employeeDepartment: text('employee_department'), // 'recruiting', 'training', 'sales', 'admin'
  employeePosition: text('employee_position'),
  employeeSalary: numeric('employee_salary', { precision: 10, scale: 2 }),
  employeeStatus: text('employee_status'), // 'active', 'on_leave', 'terminated'
  employeeManagerId: uuid('employee_manager_id'), // Self-referencing FK
  employeePerformanceRating: numeric('employee_performance_rating', { precision: 3, scale: 2 }),

  // Candidate fields (Recruiting/Bench Sales)
  candidateStatus: text('candidate_status'), // 'active', 'placed', 'bench', 'inactive', 'blacklisted'
  candidateResumeUrl: text('candidate_resume_url'),
  candidateSkills: text('candidate_skills').array(),
  candidateExperienceYears: integer('candidate_experience_years'),
  candidateCurrentVisa: text('candidate_current_visa'), // 'H1B', 'GC', 'USC', 'OPT', 'CPT', 'TN'
  candidateVisaExpiry: timestamp('candidate_visa_expiry', { withTimezone: true }),
  candidateHourlyRate: numeric('candidate_hourly_rate', { precision: 10, scale: 2 }),
  candidateBenchStartDate: timestamp('candidate_bench_start_date', { withTimezone: true }),
  candidateAvailability: text('candidate_availability'), // 'immediate', '2_weeks', '1_month'
  candidateLocation: text('candidate_location'),
  candidateWillingToRelocate: boolean('candidate_willing_to_relocate').default(false),

  // Client fields (Client Companies)
  clientCompanyName: text('client_company_name'),
  clientIndustry: text('client_industry'),
  clientTier: text('client_tier'), // 'preferred', 'strategic', 'exclusive'
  clientContractStartDate: timestamp('client_contract_start_date', { withTimezone: true }),
  clientContractEndDate: timestamp('client_contract_end_date', { withTimezone: true }),
  clientPaymentTerms: integer('client_payment_terms').default(30), // Days
  clientPreferredMarkupPercentage: numeric('client_preferred_markup_percentage', { precision: 5, scale: 2 }),

  // Recruiter-specific fields
  recruiterTerritory: text('recruiter_territory'),
  recruiterSpecialization: text('recruiter_specialization').array(),
  recruiterMonthlyPlacementTarget: integer('recruiter_monthly_placement_target').default(2),
  recruiterPodId: uuid('recruiter_pod_id'),

  // Metadata & audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
  deletedAt: timestamp('deleted_at', { withTimezone: true }), // Soft delete
  isActive: boolean('is_active').default(true),

  // Search vector (auto-maintained by trigger)
  searchVector: text('search_vector'),
});

// Type inference
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;

// Enums for type safety
export const EmployeeStatus = {
  ACTIVE: 'active',
  ON_LEAVE: 'on_leave',
  TERMINATED: 'terminated',
} as const;

export const CandidateStatus = {
  ACTIVE: 'active',
  PLACED: 'placed',
  BENCH: 'bench',
  INACTIVE: 'inactive',
  BLACKLISTED: 'blacklisted',
} as const;

export const ClientTier = {
  PREFERRED: 'preferred',
  STRATEGIC: 'strategic',
  EXCLUSIVE: 'exclusive',
} as const;

export const CandidateAvailability = {
  IMMEDIATE: 'immediate',
  TWO_WEEKS: '2_weeks',
  ONE_MONTH: '1_month',
} as const;

export type EmployeeStatusType = typeof EmployeeStatus[keyof typeof EmployeeStatus];
export type CandidateStatusType = typeof CandidateStatus[keyof typeof CandidateStatus];
export type ClientTierType = typeof ClientTier[keyof typeof ClientTier];
export type CandidateAvailabilityType = typeof CandidateAvailability[keyof typeof CandidateAvailability];
